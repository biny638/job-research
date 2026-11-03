/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../../src/types';
import { IJobProvider, JobProviderResult, JobSearchQuery } from './types';

export class SaraminProvider implements IJobProvider {
  readonly name = '사람인(Saramin) OPEN API';
  readonly type = 'SARAMIN_API' as const;

  async search(params: JobSearchQuery, referenceDate: string): Promise<JobProviderResult> {
    const apiKey = process.env.SARAMIN_API_KEY || process.env.SARAMIN_ACCESS_KEY;

    if (!apiKey) {
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'NOT_CONFIGURED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: '사람인 OpenAPI 제휴 승인 대기 중 (공식 ATS 및 실시간 검증 수집 시스템으로 자동 대체 가동 중)'
      };
    }

    const query = (params.query || '엔지니어').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const url = `https://oapi.saramin.co.kr/job-search?access-key=${encodeURIComponent(apiKey)}&keywords=${encodeURIComponent(query)}&count=20`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          providerName: this.name,
          providerType: this.type,
          status: 'FETCH_FAILED',
          jobs: [],
          queriedAt: new Date().toISOString(),
          statusMessage: `사람인 API 응답 오류 (HTTP ${res.status})`
        };
      }

      const data = await res.json();
      const rawJobs = data?.jobs?.job || [];
      const jobList = Array.isArray(rawJobs) ? rawJobs : [rawJobs];

      const parsedJobs: Job[] = jobList.map((j: any) => {
        const title = j.position?.title || '채용공고';
        const companyName = j.company?.detail?.name || '기업';
        const expName = j.position?.['experience-level']?.name || '신입/경력';
        const deadlineTimestamp = j['expiration-timestamp'];
        const deadlineStr = deadlineTimestamp 
          ? new Date(Number(deadlineTimestamp) * 1000).toISOString().split('T')[0]
          : '9999-12-31';

        const isExpired = deadlineStr !== '9999-12-31' && deadlineStr < referenceDate;

        return {
          id: `saramin_${j.id || Math.random().toString(36).substring(7)}`,
          title,
          company: companyName,
          location: j.position?.location?.name || '서울',
          experienceLevel: title.includes('인턴') ? '인턴' : expName,
          internType: title.includes('인턴') ? '인턴' : undefined,
          majorRequirement: ['이공계열 전공', '공학'],
          techStack: ['실무 공학 기술'],
          deadline: deadlineStr,
          originalUrl: j.url || 'https://www.saramin.co.kr',
          officialCareerUrl: j.url || 'https://www.saramin.co.kr',
          source: '사람인(Saramin) OPEN API',
          description: j.position?.['job-code']?.name || `${companyName} 공학 포지션 채용`,
          responsibilities: ['상세 모집 요강 및 자격 요건 공고 참조'],
          salary: j.salary?.name || '회사 내규에 따름',
          recruitmentStatus: isExpired ? 'EXPIRED' : 'OPEN',
          companyScale: '중견기업',
          isLiveApi: true,
          verifiedDate: referenceDate,
          postedDate: j['posting-timestamp'] ? new Date(Number(j['posting-timestamp']) * 1000).toISOString().split('T')[0] : referenceDate,
          urlStatus: 'DIRECT_POSTING',
          providerType: 'SARAMIN_API',
          lastCheckedAt: new Date().toISOString()
        };
      });

      return {
        providerName: this.name,
        providerType: this.type,
        status: parsedJobs.length > 0 ? 'SUCCESS' : 'NO_DATA',
        jobs: parsedJobs,
        queriedAt: new Date().toISOString(),
        statusMessage: `사람인 API 연동 정상 (${parsedJobs.length}건 조회)`
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'FETCH_FAILED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: `사람인 API 호출 실패: ${err.message}`
      };
    }
  }
}
