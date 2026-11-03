/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../../src/types';
import { IJobProvider, JobProviderResult, JobSearchQuery } from './types';

interface AtsCompanyConfig {
  slug: string;
  name: string;
  type: 'greenhouse' | 'lever' | 'ashby';
  aliases: string[];
  scale: '대기업' | '대기업 계열사' | '중견기업' | '중소/스타트업' | '외국계';
  koreanLocationDefault?: string;
}

// Registry of verified companies with official open public ATS job boards
const ATS_COMPANIES: AtsCompanyConfig[] = [
  {
    slug: 'sendbird',
    name: '센드버드',
    type: 'greenhouse',
    aliases: ['센드버드', 'sendbird'],
    scale: '중견기업',
    koreanLocationDefault: '서울 강남구'
  },
  {
    slug: 'coupang',
    name: '쿠팡',
    type: 'greenhouse',
    aliases: ['쿠팡', 'coupang', '쿠팡플레이', '쿠팡이츠'],
    scale: '대기업',
    koreanLocationDefault: '서울 송파구 / 경기 판교'
  },
  {
    slug: 'krafton',
    name: '크래프톤',
    type: 'greenhouse',
    aliases: ['크래프톤', 'krafton', '배틀그라운드', 'pubg'],
    scale: '대기업',
    koreanLocationDefault: '서울 강남구 / 판교'
  },
  {
    slug: 'daangn',
    name: '당근',
    type: 'greenhouse',
    aliases: ['당근', '당근마켓', 'daangn'],
    scale: '중견기업',
    koreanLocationDefault: '서울 서초구'
  },
  {
    slug: 'furiosaai',
    name: '퓨리오사AI',
    type: 'greenhouse',
    aliases: ['퓨리오사', '퓨리오사ai', 'furiosa', 'furiosaai', 'npu'],
    scale: '중소/스타트업',
    koreanLocationDefault: '서울 강남구'
  },
  {
    slug: 'moloco',
    name: '몰로코',
    type: 'greenhouse',
    aliases: ['몰로코', 'moloco'],
    scale: '중견기업',
    koreanLocationDefault: '서울 강남구'
  },
  {
    slug: 'figma',
    name: '피그마',
    type: 'greenhouse',
    aliases: ['피그마', 'figma'],
    scale: '외국계',
    koreanLocationDefault: '해외 / 원격근무'
  },
  {
    slug: 'anthropic',
    name: '앤트로픽',
    type: 'greenhouse',
    aliases: ['앤트로픽', 'anthropic', 'claude'],
    scale: '외국계',
    koreanLocationDefault: '해외 / 미국 샌프란시스코'
  },
  {
    slug: 'spacex',
    name: '스페이스X',
    type: 'greenhouse',
    aliases: ['스페이스x', 'spacex'],
    scale: '외국계',
    koreanLocationDefault: '해외 / 미국'
  },
  {
    slug: 'palantir',
    name: '팔란티어',
    type: 'lever',
    aliases: ['팔란티어', 'palantir'],
    scale: '외국계',
    koreanLocationDefault: '서울 / 아시아태평양'
  },
  {
    slug: 'stripe',
    name: '스트라이프',
    type: 'greenhouse',
    aliases: ['스트라이프', 'stripe'],
    scale: '외국계',
    koreanLocationDefault: '해외 / 싱가포르 / 원격'
  },
  {
    slug: 'airbnb',
    name: '에어비앤비',
    type: 'greenhouse',
    aliases: ['에어비앤비', 'airbnb'],
    scale: '외국계',
    koreanLocationDefault: '서울 / 원격'
  }
];

// Simple in-memory cache with 90-second TTL to avoid duplicate calls during filter toggling
const cache = new Map<string, { jobs: Job[]; timestamp: number }>();
const CACHE_TTL_MS = 90 * 1000;

function detectInternType(title: string): '체험형 인턴' | '채용연계형 인턴' | '전환형 인턴' | '인턴' | undefined {
  const lower = title.toLowerCase();
  if (lower.includes('전환') || lower.includes('conversion') || lower.includes('convertible')) {
    return '전환형 인턴';
  }
  if (lower.includes('연계')) {
    return '채용연계형 인턴';
  }
  if (lower.includes('체험')) {
    return '체험형 인턴';
  }
  if (lower.includes('인턴') || lower.includes('intern') || lower.includes('internship')) {
    return '인턴';
  }
  return undefined;
}

function detectExperienceLevel(title: string): '신입' | '경력' | '신입/경력' | '인턴' {
  const lower = title.toLowerCase();
  if (detectInternType(title)) {
    return '인턴';
  }
  if (
    lower.includes('신입') || 
    lower.includes('junior') || 
    lower.includes('entry') || 
    lower.includes('new grad') || 
    lower.includes('graduate')
  ) {
    return '신입';
  }
  if (
    lower.includes('경력') || 
    lower.includes('senior') || 
    lower.includes('lead') || 
    lower.includes('principal') || 
    lower.includes('staff') || 
    lower.includes('년 이상') || 
    /\d+년/.test(title)
  ) {
    return '경력';
  }
  return '신입/경력';
}

function inferMajorRequirement(title: string): string[] {
  const lower = title.toLowerCase();
  const majors: string[] = [];
  if (lower.includes('ai') || lower.includes('software') || lower.includes('engineer') || lower.includes('개발') || lower.includes('full stack') || lower.includes('data')) {
    majors.push('컴퓨터공학', '전자전기공학');
  }
  if (lower.includes('npu') || lower.includes('semiconductor') || lower.includes('반도체') || lower.includes('hardware') || lower.includes('fpga')) {
    majors.push('전자전기공학', '반도체공학');
  }
  if (lower.includes('robot') || lower.includes('기계') || lower.includes('mechanical')) {
    majors.push('기계공학', '제어계측공학');
  }
  if (majors.length === 0) {
    majors.push('이공계열 전공', '컴퓨터공학');
  }
  return Array.from(new Set(majors));
}

function inferTechStack(title: string): string[] {
  const lower = title.toLowerCase();
  const stack: string[] = [];
  if (lower.includes('ai') || lower.includes('agent') || lower.includes('research') || lower.includes('algorithm')) {
    stack.push('Python', 'PyTorch', 'LLM / Agent', 'CUDA');
  }
  if (lower.includes('software') || lower.includes('full stack') || lower.includes('backend') || lower.includes('platform')) {
    stack.push('TypeScript', 'Python', 'Go', 'Docker', 'Kubernetes');
  }
  if (lower.includes('npu') || lower.includes('hardware') || lower.includes('system')) {
    stack.push('C/C++', 'CUDA', 'System Architecture', 'Verilog');
  }
  if (lower.includes('data')) {
    stack.push('SQL', 'Python', 'Spark', 'BigQuery');
  }
  if (stack.length === 0) {
    stack.push('Python', 'Git', 'Problem Solving');
  }
  return Array.from(new Set(stack));
}

export class OfficialAtsProvider implements IJobProvider {
  readonly name = '기업 공식 공개 채용 API (Greenhouse / Lever / Ashby)';
  readonly type = 'OFFICIAL_ATS' as const;

  async search(params: JobSearchQuery, referenceDate: string): Promise<JobProviderResult> {
    const queryLower = (params.query || '').trim().toLowerCase();
    const startTime = Date.now();

    // 1. Determine which ATS companies to query based on query
    let targetCompanies = ATS_COMPANIES;
    if (queryLower) {
      const matched = ATS_COMPANIES.filter(c => 
        queryLower.includes(c.slug) ||
        queryLower.includes(c.name.toLowerCase()) ||
        c.aliases.some(a => queryLower.includes(a.toLowerCase()))
      );
      if (matched.length > 0) {
        targetCompanies = matched;
      }
    }

    const collectedJobs: Job[] = [];

    // Query selected companies in parallel with strict 3500ms timeout
    const fetchPromises = targetCompanies.map(async (company) => {
      // Check cache first
      const cacheKey = `${company.type}:${company.slug}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.jobs;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        if (company.type === 'greenhouse') {
          const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(company.slug)}/jobs?content=true`;
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            return [];
          }

          const data = await res.json();
          if (!data || !Array.isArray(data.jobs)) {
            return [];
          }

          const parsedJobs: Job[] = data.jobs.map((j: any) => {
            const locName = j.location?.name || company.koreanLocationDefault || '서울';
            const expLevel = detectExperienceLevel(j.title);
            const internType = detectInternType(j.title);
            const postedDate = j.updated_at ? j.updated_at.split('T')[0] : referenceDate;

            return {
              id: `ats_gh_${company.slug}_${j.id}`,
              title: j.title ? j.title.trim() : '엔지니어링 포지션',
              company: company.name,
              location: locName,
              experienceLevel: expLevel,
              internType,
              majorRequirement: inferMajorRequirement(j.title),
              techStack: inferTechStack(j.title),
              deadline: '9999-12-31', // Open ongoing until filled
              originalUrl: j.absolute_url || `https://job-boards.greenhouse.io/${company.slug}/jobs/${j.id}`,
              officialCareerUrl: `https://job-boards.greenhouse.io/${company.slug}`,
              source: `Greenhouse 공식 채용 API (${company.name})`,
              description: `${company.name} 공식 채용 시스템을 통해 직접 모집 중인 정규 채용공고입니다.`,
              responsibilities: [
                '기업 공식 채용 상세 요강 확인 및 지원서 작성',
                '현업 엔지니어링 실무 기술 과제 및 인터뷰 진행'
              ],
              salary: '회사 내규 및 역량 평가에 따른 협의',
              recruitmentStatus: 'OPEN',
              companyScale: company.scale,
              isLiveApi: true,
              verifiedDate: referenceDate,
              postedDate,
              urlStatus: 'DIRECT_POSTING',
              providerType: 'OFFICIAL_ATS',
              lastCheckedAt: new Date().toISOString()
            };
          });

          cache.set(cacheKey, { jobs: parsedJobs, timestamp: Date.now() });
          return parsedJobs;
        }

        if (company.type === 'lever') {
          const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company.slug)}?mode=json`;
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            return [];
          }

          const data = await res.json();
          if (!Array.isArray(data)) {
            return [];
          }

          const parsedJobs: Job[] = data.map((j: any) => {
            const locName = j.categories?.location || company.koreanLocationDefault || '서울';
            const expLevel = detectExperienceLevel(j.text);
            const internType = detectInternType(j.text);
            const postedDate = j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : referenceDate;

            return {
              id: `ats_lever_${company.slug}_${j.id}`,
              title: j.text ? j.text.trim() : '엔지니어링 포지션',
              company: company.name,
              location: locName,
              experienceLevel: expLevel,
              internType,
              majorRequirement: inferMajorRequirement(j.text),
              techStack: inferTechStack(j.text),
              deadline: '9999-12-31',
              originalUrl: j.hostedUrl || j.applyUrl || `https://jobs.lever.co/${company.slug}/${j.id}`,
              officialCareerUrl: `https://jobs.lever.co/${company.slug}`,
              source: `Lever 공식 채용 API (${company.name})`,
              description: `${company.name} 공식 채용 게시판에서 실시간 확인된 공고입니다.`,
              responsibilities: [
                '기업 공식 채용 포털을 통한 온라인 지원',
                '포지션별 자격 요건 검토 및 실무 인터뷰'
              ],
              salary: '회사 내규에 따른 협의',
              recruitmentStatus: 'OPEN',
              companyScale: company.scale,
              isLiveApi: true,
              verifiedDate: referenceDate,
              postedDate,
              urlStatus: 'DIRECT_POSTING',
              providerType: 'OFFICIAL_ATS',
              lastCheckedAt: new Date().toISOString()
            };
          });

          cache.set(cacheKey, { jobs: parsedJobs, timestamp: Date.now() });
          return parsedJobs;
        }

        return [];
      } catch (err: any) {
        clearTimeout(timeoutId);
        // Silently skip failed ATS queries to prevent blocking other providers
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        collectedJobs.push(...r.value);
      }
    }

    return {
      providerName: this.name,
      providerType: this.type,
      status: collectedJobs.length > 0 ? 'SUCCESS' : 'NO_DATA',
      jobs: collectedJobs,
      queriedAt: new Date().toISOString(),
      statusMessage: `공식 ATS ${targetCompanies.length}개사 연동 확인 (${collectedJobs.length}건 수집)`
    };
  }
}
