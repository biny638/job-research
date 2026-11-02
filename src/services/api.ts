/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job, IndustryNews, CompanyAnalysis, Recommendation, CoverLetter } from '../types';

export class ApiService {
  // 1. 채용공고 검색
  static async searchJobs(params: {
    query?: string;
    category?: string;
    major?: string;
    location?: string;
    experience?: string;
  }): Promise<{ success: boolean; jobs: Job[]; total: number; error?: string }> {
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to search jobs:', err);
      return { success: false, jobs: [], total: 0, error: err.message };
    }
  }

  // 2. Industry HINT 산업 뉴스 검색 및 AI 요약
  static async searchNews(query: string): Promise<{
    success: boolean;
    query: string;
    articles: IndustryNews[];
    error?: string;
  }> {
    try {
      const res = await fetch('/api/news/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to search news:', err);
      return { success: false, query, articles: [], error: err.message };
    }
  }

  // 3. 관련 기사 이어보기
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
  }> {
    try {
      const res = await fetch('/api/news/related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, baseArticleTitle }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to get related news:', err);
      return { success: false, relatedArticles: [] };
    }
  }

  // 4. AI 기업 분석 대시보드
  static async analyzeCompany(companyName: string, targetRole: string = '공학 R&D / 설계'): Promise<{
    success: boolean;
    analysis?: CompanyAnalysis;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/company/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, targetRole }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to analyze company:', err);
      return { success: false, error: err.message };
    }
  }

  // 5. AI 직무 & 기업 맞춤 추천
  static async getRecommendations(profile: any): Promise<{
    success: boolean;
    recommendations?: Recommendation;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to get recommendations:', err);
      return { success: false, error: err.message };
    }
  }

  // 6. 이력서 및 자기소개서 AI 첨삭
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
    try {
      const res = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to review content:', err);
      return { success: false, error: err.message };
    }
  }

  // 7. Live AI Engine test
  static async testAi(): Promise<{
    success: boolean;
    connected: boolean;
    modelUsed?: string;
    latencyMs?: number;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/ai/test');
      return await res.json();
    } catch (err: any) {
      return { success: false, connected: false, error: err.message };
    }
  }

  // 8. Health check
  static async getHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', hasGeminiKey: false };
    }
  }
}
