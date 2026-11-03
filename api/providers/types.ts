/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../../src/types';

export interface JobSearchQuery {
  query?: string;
  category?: string;
  major?: string;
  location?: string;
  experience?: string;
  companyScale?: string;
  sortBy?: 'latest' | 'deadline';
  showExpired?: boolean;
}

export type JobProviderType = 
  | 'OFFICIAL_ATS'         // Greenhouse, Lever, Ashby official public job board APIs
  | 'JSON_LD'              // Schema.org/JobPosting structured data from permitted corporate pages
  | 'VERIFIED_CATALOG'     // Pre-vetted corporate engineering catalog with authentic direct URLs
  | 'WORK24'               // 고용24 (구 워크넷) OpenAPI
  | 'SARAMIN_API';         // 추후 사람인 OpenAPI (승인 시 즉시 연동)

export type ProviderStatusCode = 
  | 'SUCCESS'
  | 'NO_DATA'
  | 'NOT_CONFIGURED'
  | 'ACCESS_RESTRICTED'
  | 'FETCH_FAILED';

export interface JobProviderResult {
  providerName: string;
  providerType: JobProviderType;
  status: ProviderStatusCode;
  statusMessage?: string;
  jobs: Job[];
  queriedAt: string;
}

export interface IJobProvider {
  readonly name: string;
  readonly type: JobProviderType;
  search(params: JobSearchQuery, referenceDate: string): Promise<JobProviderResult>;
}

export type SearchEmptyStateReason = 
  | 'NO_POSTINGS_FOUND'       // 1. 확인된 모집 공고 없음
  | 'SOURCE_NOT_CONNECTED'    // 2. 해당 기업의 채용 데이터 소스 미연결
  | 'ACCESS_RESTRICTED'       // 3. 외부 사이트 접근 제한
  | 'FETCH_FAILED';           // 4. 외부 데이터 조회 실패

export interface SearchEmptyFeedback {
  reason: SearchEmptyStateReason;
  reasonLabel: string;
  companyName?: string;
  message: string;
  technicalDetails?: string;
  officialCareerUrl?: string;
  links: Array<{ name: string; url: string; isOfficial: boolean }>;
}
