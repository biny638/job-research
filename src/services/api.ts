/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client-Side API Service for ENGINEER JOB
 * Provides resilient, type-safe API communication with Vercel Serverless Functions and local Express backend.
 * Safely inspects HTTP status and Content-Type to prevent JSON parse errors (such as Vercel 404 HTML pages).
 */

import { Job, IndustryNews, CompanyAnalysis, Recommendation } from '../types';

interface SafeFetchResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Robust fetch helper that checks HTTP status and Content-Type header.
 * Prevents "Unexpected token 'T', 'The page c'..." errors when serverless platforms return HTML error pages.
 */
async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  const method = options?.method || 'GET';
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    // Detect non-JSON responses (HTML error page from Vercel 404 / 502 / Cloudflare)
    if (!contentType.includes('application/json')) {
      let friendlyMessage = `서버가 JSON 형식이 아닌 응답(HTTP ${status})을 반환했습니다.`;

      if (status === 404) {
        friendlyMessage = 'API 경로를 찾을 수 없습니다 (HTTP 404). Vercel 배포 시 /api Serverless Function 라우팅(vercel.json)을 확인해주세요.';
      } else if (status === 500) {
        friendlyMessage = '서버 내부 오류(HTTP 500)가 발생했습니다. Vercel 환경변수(GEMINI_API_KEY) 설정을 확인해주세요.';
      } else if (status === 504 || status === 502) {
        friendlyMessage = `게이트웨이 응답 시간 초과(HTTP ${status})입니다. 잠시 후 다시 시도해주세요.`;
      } else if (status === 401 || status === 403) {
        friendlyMessage = `접근 권한이 없습니다 (HTTP ${status}). 인증 설정을 확인해주세요.`;
      } else if (status === 429) {
        friendlyMessage = 'API 호출 제한(HTTP 429)에 도달했습니다. 잠시 후 다시 시도해주세요.';
      }

      console.warn(`[ENGINEER JOB API Warning] ${method} ${url} returned non-JSON HTTP ${status} (${contentType || 'no-type'})`);
      return { data: null, error: friendlyMessage, status };
    }

    // Parse JSON
    const data = await res.json();

    if (!res.ok) {
      const serverMessage = data?.error || data?.message || `요청 실패 (HTTP ${status})`;
      console.warn(`[ENGINEER JOB API Error] ${method} ${url} [HTTP ${status}]:`, serverMessage);
      return { data, error: serverMessage, status };
    }

    return { data, error: null, status };
  } catch (err: any) {
    const netErrorMsg = err?.message || '네트워크 연결 상태를 확인해주세요.';
    console.error(`[ENGINEER JOB Network Error] ${method} ${url}:`, netErrorMsg);
    return { data: null, error: `네트워크 오류: ${netErrorMsg}`, status: 0 };
  }
}

export class ApiService {
  // 1. 채용공고 검색 (/api/jobs/search)
  static async searchJobs(params: {
    query?: string;
    category?: string;
    major?: string;
    location?: string;
    experience?: string;
    companyScale?: string;
    showExpired?: boolean;
  }): Promise<{
    success: boolean;
    jobs: Job[];
    total: number;
    referenceDate?: string;
    searchedCompany?: string;
    companyInfo?: {
      name: string;
      scale: string;
      industry: string;
      mainProducts?: string;
      officialCareersUrl: string;
    } | null;
    message?: string;
    externalSearchLinks?: Array<{ name: string; url: string; isOfficial: boolean }>;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      jobs: Job[];
      total: number;
      referenceDate?: string;
      searchedCompany?: string;
      companyInfo?: any;
      message?: string;
      externalSearchLinks?: any[];
      error?: string;
    }>('/api/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (error || !data) {
      return { success: false, jobs: [], total: 0, error: error || '채용공고 검색에 실패했습니다.' };
    }
    return data;
  }

  // 2. Industry HINT 산업 뉴스 검색 및 AI 요약 (/api/news/search)
  static async searchNews(query: string): Promise<{
    success: boolean;
    query: string;
    articles: IndustryNews[];
    total?: number;
    isRealFeed?: boolean;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      query: string;
      articles: IndustryNews[];
      total?: number;
      isRealFeed?: boolean;
      error?: string;
    }>('/api/news/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (error || !data) {
      return { success: false, query, articles: [], error: error || '산업 뉴스 검색에 실패했습니다.' };
    }
    return data;
  }

  // 3. 관련 기사 이어보기 (/api/news/related)
  static async getRelatedNews(keywords: string[], baseArticleTitle: string): Promise<{
    success: boolean;
    relatedArticles: Array<{
      title: string;
      press: string;
      publishedAt: string;
      originalUrl: string;
      relevanceScore: number;
      relevanceReason?: string;
    }>;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      relatedArticles: Array<{
        title: string;
        press: string;
        publishedAt: string;
        originalUrl: string;
        relevanceScore: number;
        relevanceReason?: string;
      }>;
      error?: string;
    }>('/api/news/related', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, baseArticleTitle }),
    });

    if (error || !data) {
      return { success: false, relatedArticles: [], error: error || '관련 기사 조회에 실패했습니다.' };
    }
    return data;
  }

  // 4. AI 기업 분석 대시보드 (/api/company/analyze)
  static async analyzeCompany(companyName: string, targetRole: string = '공학 R&D / 설계'): Promise<{
    success: boolean;
    analysis?: CompanyAnalysis;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      analysis?: CompanyAnalysis;
      error?: string;
    }>('/api/company/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, targetRole }),
    });

    if (error || !data) {
      return { success: false, error: error || '기업 분석 요청에 실패했습니다.' };
    }
    return data;
  }

  // 5. AI 직무 & 기업 맞춤 추천 (/api/recommendations)
  static async getRecommendations(profile: any): Promise<{
    success: boolean;
    recommendations?: Recommendation;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      recommendations?: Recommendation;
      error?: string;
    }>('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (error || !data) {
      return { success: false, error: error || '직무 추천 분석에 실패했습니다.' };
    }
    return data;
  }

  // 6. 이력서 및 자기소개서 AI 첨삭 (/api/resume/review)
  static async reviewContent(payload: {
    type: 'resume' | 'cover_letter';
    content: string;
    companyName?: string;
    jobRole?: string;
    questionTitle?: string;
  }): Promise<{
    success: boolean;
    feedback?: any;
    error?: string;
  }> {
    const { data, error } = await safeFetchJson<{
      success: boolean;
      feedback?: any;
      error?: string;
    }>('/api/resume/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (error || !data) {
      return { success: false, error: error || 'AI 첨삭 검토에 실패했습니다.' };
    }
    return data;
  }

  // 7. 실시간 AI 엔진 연결 상태 진단 (/api/ai/test)
  static async testAi(): Promise<{
    success: boolean;
    connected: boolean;
    modelUsed?: string;
    latencyMs?: number;
    message?: string;
    error?: string;
    status?: number;
  }> {
    const { data, error, status } = await safeFetchJson<{
      success: boolean;
      connected: boolean;
      modelUsed?: string;
      latencyMs?: number;
      message?: string;
      error?: string;
    }>('/api/ai/test');

    if (error || !data) {
      return {
        success: false,
        connected: false,
        error: error || 'AI 진단 엔드포인트 응답이 없습니다.',
        status,
      };
    }

    return {
      ...data,
      status,
    };
  }

  // 8. 서버 상태 확인 (/api/health)
  static async getHealth(): Promise<{ status: string; hasGeminiKey: boolean; serverlessMode?: boolean }> {
    const { data } = await safeFetchJson<{
      status: string;
      hasGeminiKey: boolean;
      serverlessMode?: boolean;
    }>('/api/health');

    return data || { status: 'offline', hasGeminiKey: false };
  }
}
