/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../../src/types';
import { IJobProvider, JobProviderResult, JobSearchQuery } from './types';

// SSRF Protection Helper: returns true if hostname/IP is safe public internet
function isSafePublicUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    // Block localhost, link-local, loopbacks, and private subnets
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export class JsonLdProvider implements IJobProvider {
  readonly name = '기업 공식 홈페이지 구조화 데이터 (JSON-LD JobPosting 수집기)';
  readonly type = 'JSON_LD' as const;

  async search(params: JobSearchQuery, referenceDate: string): Promise<JobProviderResult> {
    const query = (params.query || '').trim();
    if (!query) {
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'NO_DATA',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: '검색 대상 URL 또는 기업명이 지정되지 않음'
      };
    }

    // If query looks like a URL or matches a known public site with JSON-LD
    let targetUrl: string | null = null;
    if (query.startsWith('http://') || query.startsWith('https://')) {
      targetUrl = query;
    }

    if (!targetUrl) {
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'NO_DATA',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: '직접 지정된 JSON-LD 공개 URL 없음'
      };
    }

    if (!isSafePublicUrl(targetUrl)) {
      return {
        providerName: this.name,
        providerType: this.type,
        status: 'ACCESS_RESTRICTED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: '보안 정책에 따라 사설망/내부망 주소 접근이 차단되었습니다.'
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EngineerJobBot/1.0; +https://job-research-three.vercel.app)',
          'Accept': 'text/html,application/xhtml+xml,application/ld+json'
        }
      });
      clearTimeout(timeoutId);

      // Check for access restriction or bot blocks (HTTP 401, 403, 429)
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        return {
          providerName: this.name,
          providerType: this.type,
          status: 'ACCESS_RESTRICTED',
          jobs: [],
          queriedAt: new Date().toISOString(),
          statusMessage: `외부 사이트 접근 제한 (HTTP ${res.status}): 해당 기업의 웹 접근 정책에 따라 무단 수집을 즉시 중단하였습니다.`
        };
      }

      if (!res.ok) {
        return {
          providerName: this.name,
          providerType: this.type,
          status: 'FETCH_FAILED',
          jobs: [],
          queriedAt: new Date().toISOString(),
          statusMessage: `외부 데이터 조회 실패 (HTTP ${res.status})`
        };
      }

      const html = await res.text();
      // Search for <script type="application/ld+json"> tags
      const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
      let match: RegExpExecArray | null;
      const parsedJobs: Job[] = [];

      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const content = JSON.parse(match[1]);
          const items = Array.isArray(content) ? content : [content];
          for (const item of items) {
            if (item['@type'] === 'JobPosting') {
              const title = item.title || '채용공고';
              const companyName = item.hiringOrganization?.name || '기업';
              const validThrough = item.validThrough ? item.validThrough.split('T')[0] : '9999-12-31';
              const datePosted = item.datePosted ? item.datePosted.split('T')[0] : referenceDate;

              // Check if already expired
              const isExpired = validThrough !== '9999-12-31' && validThrough < referenceDate;

              parsedJobs.push({
                id: `jsonld_${Buffer.from(targetUrl + title).toString('base64').substring(0, 16)}`,
                title,
                company: companyName,
                location: item.jobLocation?.address?.addressLocality || '서울',
                experienceLevel: title.includes('인턴') ? '인턴' : '신입/경력',
                internType: title.includes('인턴') ? '인턴' : undefined,
                majorRequirement: ['이공계열 전공', '컴퓨터/전자/기계'],
                techStack: ['직무 기술'],
                deadline: validThrough,
                originalUrl: item.url || targetUrl,
                officialCareerUrl: targetUrl,
                source: '기업 공식 JSON-LD 구조화 데이터',
                description: item.description ? item.description.replace(/<[^>]+>/g, '').substring(0, 200) : '기업 공식 채용 페이지 구조화 데이터 수집 공고',
                responsibilities: ['기업 공식 모집 요강 참조'],
                salary: item.baseSalary?.value?.value ? `${item.baseSalary.value.value} ${item.baseSalary.currency || 'KRW'}` : '회사 내규에 따름',
                recruitmentStatus: isExpired ? 'EXPIRED' : 'OPEN',
                companyScale: '중견기업',
                isLiveApi: true,
                verifiedDate: referenceDate,
                postedDate: datePosted,
                urlStatus: 'DIRECT_POSTING',
                providerType: 'JSON_LD',
                lastCheckedAt: new Date().toISOString()
              });
            }
          }
        } catch {
          // Continue to next script tag
        }
      }

      return {
        providerName: this.name,
        providerType: this.type,
        status: parsedJobs.length > 0 ? 'SUCCESS' : 'NO_DATA',
        jobs: parsedJobs,
        queriedAt: new Date().toISOString(),
        statusMessage: parsedJobs.length > 0 
          ? `공식 JSON-LD 구조화 데이터 ${parsedJobs.length}건 파싱 성공` 
          : '해당 페이지에 Schema.org/JobPosting 구조화 데이터가 정의되어 있지 않습니다.'
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return {
        providerName: this.name,
        providerType: this.type,
        status: err.name === 'AbortError' ? 'FETCH_FAILED' : 'ACCESS_RESTRICTED',
        jobs: [],
        queriedAt: new Date().toISOString(),
        statusMessage: err.name === 'AbortError' ? '외부 요청 시간 초과 (3.5초)' : `외부 접근 제한: ${err.message}`
      };
    }
  }
}
