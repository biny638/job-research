/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Globe, 
  Bookmark, 
  ExternalLink, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Tag,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Filter
} from 'lucide-react';
import { IndustryNews } from '../types';
import { ApiService } from '../services/api';

interface IndustryHintProps {
  userId: string;
  savedNews: IndustryNews[];
  onToggleSaveNews: (news: IndustryNews) => void;
  onNavigateToCompany: (companyName: string) => void;
}

export const IndustryHint: React.FC<IndustryHintProps> = ({
  userId,
  savedNews,
  onToggleSaveNews,
  onNavigateToCompany,
}) => {
  const [query, setQuery] = useState('현대자동차');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<IndustryNews[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'ALL' | '24H' | '48H'>('ALL');

  // Related news modal or expanded state
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [activeRelatedKeyword, setActiveRelatedKeyword] = useState<string | null>(null);

  // Quick industry topic & enterprise presets for engineering students
  const presets = [
    '현대자동차',
    '서연이화',
    'SK하이닉스',
    'HBM 반도체 패키징',
    '전고체 배터리',
    'HL만도',
    '두산로보틱스',
    'ASML EUV',
    '한국항공우주산업 KF-21'
  ];

  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setRelatedArticles([]);
    setActiveRelatedKeyword(null);
    try {
      const res = await ApiService.searchNews(q);
      if (res.success && res.articles) {
        setArticles(res.articles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreRelated = async (keyword: string, baseTitle: string) => {
    setActiveRelatedKeyword(keyword);
    setRelatedLoading(true);
    try {
      const res = await ApiService.getRelatedNews([keyword], baseTitle);
      if (res.success) {
        setRelatedArticles(res.relatedArticles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRelatedLoading(false);
    }
  };

  const isSaved = (newsId: string) => savedNews.some(n => n.id === newsId);

  // Filter articles by publication recency strictly within 72 hours
  const filteredArticles = articles.filter((art) => {
    if (periodFilter === '24H') return art.isWithin24h;
    if (periodFilter === '48H') return art.isWithin48h;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs text-cyan-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Industry HINT — 최근 72시간(3일) 이내 실시간 언론사 뉴스 기반 AI 공학 브리핑</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>최근 72시간 검증 필터 (과거 기사·허위 기사 배제)</span>
            </div>
          </div>

          <div className="max-w-4xl space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              기업과 산업의 최신 기술 동향을 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">공학의 시선</span>으로 꿰뚫다
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Google News 실시간 피드에서 <strong>검색 시점 기준 최근 72시간(3일) 이내에 발행된 실제 언론사 기사(국내 최대 2건 + 글로벌 1건)</strong>만을 엄격히 선별하여,
              Gemini 3.8 Flash가 <strong>3줄 공학 요약, 5대 기술 키워드, 전공 전문용어 해설 및 기술 비교</strong>를 도출합니다. 과거 기사로 개수를 채우지 않습니다.
            </p>
          </div>

          {/* Search Input - Full Width */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="기업명(서연이화, 현대차, SK하이닉스) 또는 산업 기술 키워드 검색..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>실시간 수집 및 AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>실시간 분석</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">추천 기업/기술:</span>
            {presets.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recency Period Filter Bar */}
      {articles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-semibold">발행 시점 필터:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPeriodFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  periodFilter === 'ALL'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                최근 72시간 전체 ({articles.length}건)
              </button>
              <button
                onClick={() => setPeriodFilter('24H')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  periodFilter === '24H'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                24시간 이내
              </button>
              <button
                onClick={() => setPeriodFilter('48H')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  periodFilter === '48H'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                48시간 이내
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              분석 대상: <strong>{query}</strong>
            </span>
            <button
              onClick={() => onNavigateToCompany(query)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900 transition-colors cursor-pointer text-xs font-semibold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>'{query}' AI 기업 분석 대시보드로 이동</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Google News 실시간 피드 수집 및 Gemini 3.8 Flash 공학 분석 중...</p>
            <p className="text-xs text-slate-400">실제 기사 원문 제목과 스니펫만을 근거로 사실 기반 3줄 요약과 전문용어 해설을 도출합니다.</p>
          </div>
        </div>
      )}

      {/* Results list */}
      {!loading && filteredArticles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">"{query}"</span> 최신 뉴스 분석 ({filteredArticles.length}건)
            </h2>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              실시간 언론사 원문 직결
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredArticles.map((item, idx) => {
              const saved = isSaved(item.id);
              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Badges, Source, Date & Save Button */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          item.isOverseas
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                        }`}
                      >
                        {item.isOverseas ? '해외 글로벌 기술 뉴스' : '국내 핵심 산업 뉴스'}
                      </span>

                      <span className="text-xs text-slate-200 font-bold">{item.press}</span>
                      <span className="text-slate-600">•</span>
                      
                      {/* Exact Published Date */}
                      <span className="text-xs text-slate-400 font-medium">
                        {item.publishedAtExact || item.publishedAt}
                      </span>

                      {/* Recency Tag (Strictly within 72h) */}
                      {item.isWithin24h ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          24시간 이내 ({item.timeAgo})
                        </span>
                      ) : item.isWithin48h ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950 text-cyan-300 border border-blue-800/40">
                          48시간 이내 ({item.timeAgo})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-750">
                          72시간 이내 ({item.timeAgo})
                        </span>
                      )}

                      {item.industryCategory && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.industryCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSaveNews(item)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          saved
                            ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-cyan-400' : ''}`} />
                        <span className="hidden sm:inline">{saved ? '스크랩됨' : '뉴스 스크랩'}</span>
                      </button>

                      <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-colors"
                      >
                        <span>원문 기사 전문</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  {/* Grounded Summary Box with Disclaimer */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gemini 3.8 Flash 핵심 공학 요약 (3줄)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal normal-case flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        제목·스니펫 근거 기반 요약
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-decimal list-inside">
                      {item.summaryLines && item.summaryLines.map((line, lIdx) => (
                        <li key={lIdx} className="pl-1">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5 Core Keywords */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        핵심 기술 키워드 (클릭 시 실시간 관련 기사 탐색)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keywords && item.keywords.map((kw, kIdx) => (
                        <button
                          key={kIdx}
                          onClick={() => handleExploreRelated(kw, item.title)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                            activeRelatedKeyword === kw
                              ? 'bg-cyan-600 text-white border-cyan-400'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/50'
                          }`}
                        >
                          <Tag className="w-3 h-3 text-cyan-400" />
                          <span>#{kw}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical Jargon & Plain Explanation */}
                  {item.technicalTerms && item.technicalTerms.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>어려운 전문용어와 쉬운 설명 (기술 면접 대비)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {item.technicalTerms.map((termItem, tIdx) => (
                          <div key={tIdx} className="p-3 rounded-lg bg-slate-900 border border-slate-750 space-y-1">
                            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              {termItem.term}
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {termItem.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Domestic vs Overseas Technology Comparison */}
                  {item.globalComparison && (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block mb-0.5">글로벌 기술 대비 관점:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{item.globalComparison}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* When 0 articles found within 3 days (Strict 72-hour requirement) */}
      {!loading && hasSearched && articles.length === 0 && (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">최근 3일 이내 관련 뉴스가 없습니다</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              검색 시점 기준 최근 72시간(3일) 이내에 실제 언론사에서 발행된 기사가 없습니다.<br />
              ENGINEER JOB은 기사 수를 억지로 채우기 위해 과거 기사나 가상 뉴스를 생성하지 않습니다.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToCompany(query)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
            >
              <Building2 className="w-4 h-4" />
              <span>'{query}' 기업 정보 및 공시자료 확인하기</span>
            </button>
          </div>
        </div>
      )}

      {/* When articles exist but filteredArticles is empty due to 24H/48H filter */}
      {!loading && hasSearched && articles.length > 0 && filteredArticles.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
          <p>선택하신 세부 시간 조건({periodFilter === '24H' ? '24시간 이내' : '48시간 이내'})에 일치하는 기사가 없습니다.</p>
          <button
            onClick={() => setPeriodFilter('ALL')}
            className="text-cyan-400 font-semibold underline cursor-pointer"
          >
            최근 72시간 전체 보기로 변경
          </button>
        </div>
      )}

      {/* Related Articles Section (관련 기사 이어보기) */}
      {activeRelatedKeyword && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                <span className="text-cyan-400">#{activeRelatedKeyword}</span> 실시간 후속 기사 이어보기
              </h3>
            </div>
            {relatedLoading && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                관련 심층 뉴스 조회 중...
              </span>
            )}
          </div>

          {relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedArticles.map((rel, rIdx) => (
                <div key={rIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{rel.press}</span>
                    <span>{rel.publishedAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {rel.title}
                  </h4>
                  {rel.relevanceReason && (
                    <p className="text-[11px] text-slate-400 italic">
                      연계 근거: {rel.relevanceReason}
                    </p>
                  )}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={rel.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <span>원문 기사 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : !relatedLoading ? (
            <p className="text-xs text-slate-400">관련 기사를 탐색 중입니다.</p>
          ) : null}
        </div>
      )}

      {/* Initial welcome hint if not searched yet */}
      {!hasSearched && (
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Cpu className="w-10 h-10 text-cyan-400/80 mx-auto" />
          <h3 className="text-sm font-bold text-white">관심 기업명 또는 산업 기술 키워드를 검색해보세요</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            현대자동차, 서연이화, SK하이닉스, HBM 반도체 패키징 등 공학 전공 분야를 입력하면 Google News RSS를 통해 실제 최근 보도된 기사를 수집하고 Gemini 3.8 Flash가 즉시 기술 요약을 제공합니다.
          </p>
        </div>
      )}
    </div>
  );
};
