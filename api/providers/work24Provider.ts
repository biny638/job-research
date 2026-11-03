/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../../src/types';
import { IJobProvider, JobProviderResult, JobSearchQuery } from './types';

export class Work24Provider implements IJobProvider {
  readonly name = '고용24 (구 워크넷 OPEN API)';
  readonly type = 'WORK24' as const;

  async search(params: JobSearchQuery, referenceDate: string): Promise<JobProviderResult> {
    const apiKey = process.env.WORK24_API_KEY || process.env.WORKNET_API_KEY;

    if (!apiKey) {
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'NOT_CONFIGURED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: '고용24 OPEN API 인증키 미등록 (공식 ATS 및 실시간 검증 수집 시스템 가동)'
      };
    }

    const query = (params.query || '엔지니어').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const url = `http://openapi.work.go.kr/opi/opi/opia/wantedApi.do?authKey=${encodeURIComponent(apiKey)}&callTp=L&returnType=JSON&startPage=1&display=25&keyword=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          providerName: this.name,
          providerType: this.type,
          status: 'FETCH_FAILED',
          jobs: [],
          queriedAt: new Date().toISOString(),
          statusMessage: `고용24 API 응답 오류 (HTTP ${res.status})`
        };
      }

      const data = await res.json();
      const rawWanted = data?.wantedRoot?.wanted;
      if (!rawWanted) {
        return {
          providerName: this.name,
          providerType: this.type,
          status: 'NO_DATA',
          jobs: [],
          queriedAt: new Date().toISOString(),
          statusMessage: '고용24 API에서 일치하는 검색 결과 없음'
        };
      }

      const wantedList = Array.isArray(rawWanted) ? rawWanted : [rawWanted];
      const parsedJobs: Job[] = wantedList.map((item: any) => {
        const title = item.title || '채용공고';
        const companyName = item.company || '기업';
        const closeDt = item.closeDt || '';
        let deadline = '9999-12-31';

        if (closeDt.length === 8 && /^\d{8}$/.test(closeDt)) {
          deadline = `${closeDt.substring(0, 4)}-${closeDt.substring(4, 6)}-${closeDt.substring(6, 8)}`;
        } else if (closeDt.includes('-')) {
          deadline = closeDt;
        }

        const isExpired = deadline !== '9999-12-31' && deadline < referenceDate;
        const isIntern = title.includes('인턴') || (item.career || '').includes('인턴');

        return {
          id: `w24_${item.wantedAuthNo || Math.random().toString(36).substring(7)}`,
          title,
          company: companyName,
          location: item.basicAddr || item.region || '전국',
          experienceLevel: isIntern ? '인턴' : (item.career || '신입/경력'),
          internType: isIntern ? '인턴' : undefined,
          majorRequirement: ['공학 계열 전공', '이공계열'],
          techStack: ['직무 실무 기술'],
          deadline,
          originalUrl: item.wantedInfoUrl || 'https://www.work24.go.kr',
          officialCareerUrl: item.wantedInfoUrl || 'https://www.work24.go.kr',
          source: '고용24 (구 워크넷 OPEN API)',
          description: `${companyName} 공학 포지션 채용 (고용24 국가공인 채용망)`,
          responsibilities: ['상세 공고 및 직무 기술서 참조'],
          salary: item.sal || item.salTpNm || '회사 내규에 따름',
          recruitmentStatus: isExpired ? 'EXPIRED' : 'OPEN',
          companyScale: '중견기업',
          isLiveApi: true,
          verifiedDate: referenceDate,
          postedDate: item.regDt || referenceDate,
          urlStatus: 'DIRECT_POSTING',
          providerType: 'WORK24',
          lastCheckedAt: new Date().toISOString()
        };
      });

      return {
        providerName: this.name,
        providerType: this.type,
        status: parsedJobs.length > 0 ? 'SUCCESS' : 'NO_DATA',
        jobs: parsedJobs,
        queriedAt: new Date().toISOString(),
        statusMessage: `고용24 API 연동 정상 (${parsedJobs.length}건 수집)`
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'FETCH_FAILED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: `고용24 API 호출 실패: ${err.message}`
      };
    }
  }
}
