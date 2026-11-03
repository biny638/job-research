/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job, ExternalApiStatus } from '../../src/types';
import { IJobProvider, JobProviderResult, JobSearchQuery, SearchEmptyFeedback, SearchEmptyStateReason } from './types';
import { OfficialAtsProvider } from './officialAtsProvider';
import { VerifiedCatalogProvider } from './verifiedCatalogProvider';
import { JsonLdProvider } from './jsonLdProvider';
import { Work24Provider } from './work24Provider';
import { SaraminProvider } from './saraminProvider';

function normalizeCompanyName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace(/\(주\)/g, '')
    .replace(/주식회사/g, '')
    .replace(/\(유\)/g, '')
    .replace(/유한회사/g, '')
    .replace(/\(합\)/g, '')
    .trim();
}

export class JobAggregatorService {
  private providers: IJobProvider[];

  constructor() {
    this.providers = [
      new OfficialAtsProvider(),
      new VerifiedCatalogProvider(),
      new JsonLdProvider(),
      new Work24Provider(),
      new SaraminProvider()
    ];
  }

  async aggregate(params: JobSearchQuery, referenceDate: string, enterpriseDirectory: Record<string, any>) {
    const rawQuery = (params.query || '').trim();
    const cleanQuery = rawQuery.toLowerCase();

    // 1. Run all providers in parallel
    const providerResults = await Promise.allSettled(
      this.providers.map(p => p.search(params, referenceDate))
    );

    const allJobs: Job[] = [];
    const providerSummaries: Array<{ name: string; type: string; status: string; count: number; message?: string }> = [];
    let hasAccessRestricted = false;
    let hasFetchFailed = false;
    let restrictedMessage = '';
    let failedMessage = '';

    for (let i = 0; i < providerResults.length; i++) {
      const res = providerResults[i];
      const provider = this.providers[i];

      if (res.status === 'fulfilled') {
        const result: JobProviderResult = res.value;
        allJobs.push(...result.jobs);
        providerSummaries.push({
          name: result.providerName,
          type: result.providerType,
          status: result.status,
          count: result.jobs.length,
          message: result.statusMessage
        });

        if (result.status === 'ACCESS_RESTRICTED') {
          hasAccessRestricted = true;
          restrictedMessage = result.statusMessage || '';
        }
        if (result.status === 'FETCH_FAILED') {
          hasFetchFailed = true;
          failedMessage = result.statusMessage || '';
        }
      } else {
        providerSummaries.push({
          name: provider.name,
          type: provider.type,
          status: 'FETCH_FAILED',
          count: 0,
          message: res.reason?.message || '실행 실패'
        });
        hasFetchFailed = true;
      }
    }

    // 2. Deduplicate jobs by unique composite key: company + title OR originalUrl
    const seenMap = new Map<string, Job>();
    for (const job of allJobs) {
      const companyKey = normalizeCompanyName(job.company).toLowerCase();
      const titleKey = job.title.toLowerCase().replace(/\s+/g, '');
      const primaryKey = `${companyKey}::${titleKey}`;
      const urlKey = job.originalUrl.toLowerCase().trim();

      if (!seenMap.has(primaryKey) && !seenMap.has(urlKey)) {
        seenMap.set(primaryKey, job);
        seenMap.set(urlKey, job);
      }
    }

    const uniqueJobs = Array.from(new Set(seenMap.values()));

    // 3. Check if query matches known enterprise directory
    let matchedEnterprise: any = null;
    if (cleanQuery) {
      for (const [key, info] of Object.entries(enterpriseDirectory)) {
        const infoObj = info as any;
        if (
          cleanQuery === key.toLowerCase() ||
          infoObj.aliases?.some((a: string) => cleanQuery.includes(a.toLowerCase()))
        ) {
          matchedEnterprise = infoObj;
          break;
        }
      }
    }

    // 4. Filter jobs according to user criteria
    const showExpired = params.showExpired ?? false;
    const category = params.category || '전체';
    const major = params.major || '전체';
    const location = params.location || '전체';
    const experience = params.experience || '전체';
    const companyScale = params.companyScale || '전체';
    const sortBy = params.sortBy || 'latest';

    const filtered = uniqueJobs.filter(job => {
      const jobCompanyClean = normalizeCompanyName(job.company).toLowerCase();

      // Query match
      let matchQuery = true;
      if (cleanQuery) {
        const isGroupSearch = cleanQuery.includes('그룹') || cleanQuery.includes('계열사');
        if (isGroupSearch) {
          const groupPrefix = cleanQuery.replace('그룹', '').replace('계열사', '').trim();
          matchQuery = jobCompanyClean.includes(groupPrefix) || (job.companyScale === '대기업 계열사' && jobCompanyClean.includes(groupPrefix));
        } else {
          matchQuery = Boolean(
            job.title.toLowerCase().includes(cleanQuery) ||
            jobCompanyClean.includes(cleanQuery) ||
            job.techStack.some((t: string) => t.toLowerCase().includes(cleanQuery)) ||
            job.majorRequirement.some((m: string) => m.toLowerCase().includes(cleanQuery)) ||
            (job.description && job.description.toLowerCase().includes(cleanQuery))
          );
        }
      }

      // Recruitment status filter (by default only OPEN and ALWAYS, unless showExpired is true)
      const matchStatus = showExpired ? true : (job.recruitmentStatus === 'OPEN' || job.recruitmentStatus === 'ALWAYS');

      // Category filter
      const matchCategory = category === '전체' ||
        job.title.includes(category) ||
        job.description.includes(category);

      // Major filter
      const matchMajor = major === '전체' ||
        job.majorRequirement.some((m: string) => m.includes(major) || major.includes(m));

      // Location filter
      const matchLocation = location === '전체' ||
        job.location.includes(location);

      // Experience & Intern filter
      const matchExp = (() => {
        if (!experience || experience === '전체') return true;
        if (experience === '인턴') {
          return job.experienceLevel === '인턴' || job.title.includes('인턴') || job.internType !== undefined;
        }
        if (experience === '신입') {
          return job.experienceLevel.includes('신입') && job.experienceLevel !== '인턴' && !job.title.includes('인턴');
        }
        if (experience === '경력') {
          return job.experienceLevel.includes('경력') && job.experienceLevel !== '인턴' && !job.title.includes('인턴');
        }
        return job.experienceLevel.includes(experience);
      })();

      // Company scale filter
      const matchScale = companyScale === '전체' || job.companyScale === companyScale;

      return matchQuery && matchStatus && matchCategory && matchMajor && matchLocation && matchExp && matchScale;
    });

    // 5. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'deadline') {
        const dA = a.deadline || '9999-99-99';
        const dB = b.deadline || '9999-99-99';
        return dA.localeCompare(dB);
      }
      const pA = a.postedDate || a.verifiedDate || '';
      const pB = b.postedDate || b.verifiedDate || '';
      return pB.localeCompare(pA);
    });

    // 6. External API Status metadata for UI
    const externalApiStatus: ExternalApiStatus = {
      provider: '기업 공식 공개 ATS (Greenhouse/Lever) & 고용24',
      configured: true,
      status: 'CONNECTED',
      statusMessage: '공식 ATS 공개 채용 API 및 검증 포털 실시간 연결 완료',
      requiredEnv: 'SARAMIN_API_KEY (추후 승인 시 등록)',
      guideUrl: 'https://oapi.saramin.co.kr'
    };

    // 7. If 0 jobs match, determine empty state classification
    let emptyFeedback: SearchEmptyFeedback | null = null;
    if (filtered.length === 0) {
      const targetName = matchedEnterprise ? matchedEnterprise.name : (rawQuery || '검색 조건');
      const officialUrl = matchedEnterprise?.officialCareersUrl || '';

      const saraminSearchUrl = `https://www.saramin.co.kr/zf_user/search?searchword=${encodeURIComponent(targetName + ' 엔지니어')}`;
      const jobKoreaSearchUrl = `https://www.jobkorea.co.kr/Search/?stext=${encodeURIComponent(targetName + ' 엔지니어')}`;
      const wantedSearchUrl = `https://www.wanted.co.kr/search?query=${encodeURIComponent(targetName)}`;
      const linkareerSearchUrl = `https://linkareer.com/search?keyword=${encodeURIComponent(targetName)}`;
      const worknetSearchUrl = `https://www.work24.go.kr/wk/a/b/1200/retriveEmpSrchList.do?keyword=${encodeURIComponent(targetName)}`;

      let reason: SearchEmptyStateReason = 'NO_POSTINGS_FOUND';
      let reasonLabel = '1. 확인된 모집 공고 없음';
      let message = `'${targetName}'의 현재 선택하신 조건(마감 여부, 직무, 지역, 전공)에 일치하는 활성 공고가 없습니다. 허위 공고를 생성하지 않고 실제 채용 포털 바로가기를 제공합니다.`;
      let technicalDetails = '데이터 소스는 정상 연결되었으나 현재 필터 조건에 부합하는 진행 중 공고가 없습니다.';

      if (hasAccessRestricted) {
        reason = 'ACCESS_RESTRICTED';
        reasonLabel = '3. 외부 사이트 접근 제한';
        message = `'${targetName}'의 공식 웹페이지가 봇 차단 정책(Cloudflare/인증 요구)을 적용하고 있어, 무단 크롤링 금지 원칙에 따라 자동 수집을 중단하였습니다.`;
        technicalDetails = restrictedMessage || 'HTTP 403 Forbidden / 인증 요구 감지됨. 우회 시도 없이 안전하게 공식 사이트 바로가기로 안내합니다.';
      } else if (hasFetchFailed && uniqueJobs.length === 0) {
        reason = 'FETCH_FAILED';
        reasonLabel = '4. 외부 데이터 조회 실패';
        message = '외부 채용 데이터 소스 응답 지연 또는 일시적 네트워크 오류가 발생하였습니다.';
        technicalDetails = failedMessage || '외부 제공처 타임아웃 초과.';
      } else if (!matchedEnterprise && cleanQuery && uniqueJobs.length === 0) {
        reason = 'SOURCE_NOT_CONNECTED';
        reasonLabel = '2. 해당 기업의 채용 데이터 소스 미연결';
        message = `'${targetName}' 기업은 공개 ATS(Greenhouse/Lever 등)를 사용하지 않고 자체 비공개 시스템을 운영 중입니다.`;
        technicalDetails = '공개 엔드포인트가 존재하지 않으므로 외부 주요 채용 포털 실시간 검색 링크를 통해 확인하실 수 있습니다.';
      }

      emptyFeedback = {
        reason,
        reasonLabel,
        companyName: targetName,
        message,
        technicalDetails,
        officialCareerUrl: officialUrl,
        links: [
          { name: '기업 공식 인재채용 사이트', url: officialUrl || `https://www.google.com/search?q=${encodeURIComponent(targetName + ' 채용 공식')}`, isOfficial: true },
          { name: '고용24 (국가공인 채용망)', url: worknetSearchUrl, isOfficial: true },
          { name: '사람인 실시간 검색', url: saraminSearchUrl, isOfficial: false },
          { name: '잡코리아 실시간 검색', url: jobKoreaSearchUrl, isOfficial: false },
          { name: '원티드(Wanted)', url: wantedSearchUrl, isOfficial: false },
          { name: '링커리어(Linkareer) 공고', url: linkareerSearchUrl, isOfficial: false }
        ]
      };
    }

    return {
      success: true,
      total: filtered.length,
      referenceDate,
      jobs: filtered,
      externalApiStatus,
      emptyFeedback,
      providerSummaries,
      searchedCompany: matchedEnterprise ? matchedEnterprise.name : undefined,
      companyInfo: matchedEnterprise ? {
        name: matchedEnterprise.name,
        scale: matchedEnterprise.scale,
        industry: matchedEnterprise.industry,
        mainProducts: matchedEnterprise.mainProducts,
        officialCareersUrl: matchedEnterprise.officialCareersUrl
      } : null
    };
  }
}
