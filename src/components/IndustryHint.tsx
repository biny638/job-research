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
  Tag
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
  const [query, setQuery] = useState('HBM 반도체 패키징');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<IndustryNews[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Related news modal or expanded state
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [activeRelatedKeyword, setActiveRelatedKeyword] = useState<string | null>(null);

  // Quick industry topic presets for engineering students
  const presets = [
    'HBM 반도체 패키징',
    '전고체 배터리 건식전극',
    '현대차 SDV 아키텍처',
    'High-NA EUV 노광장비',
    '휴머노이드 로봇 액추에이터',
    'SiC 전력반도체 인버터',
    '우주발사체 액체엔진'
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 w-full space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs text-cyan-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industry HINT — AI 공학 뉴스 요약 및 산업 분석</span>
          </div>

          <div className="max-w-4xl space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              산업 동향을 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">기술과 공학의 시선</span>으로 꿰뚫다
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              단순 일반 기사가 아닌 <strong>국내 핵심 기술 뉴스 2건 + 글로벌 해외 기술 뉴스 1건</strong>을 엄선하여 Gemini 3.8 Flash가
              3줄 공학 요약, 핵심 키워드 5개, 전공자를 위한 전문용어 해설 및 국내외 기술 비교를 즉시 브리핑합니다.
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
                placeholder="산업명 또는 기업명을 입력하세요 (예: 전고체 배터리, ASML, HBM)..."
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
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>온디맨드 분석</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">추천 토픽:</span>
            {presets.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Principles Notice */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>서버리스 원칙: 정기 크론 수집 없이 사용자의 실시간 검색 요청 시에만 안전하게 온디맨드 실행됩니다.</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">전문 무단복제 금지 &amp; 공식 원문 링크 지원</span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">최신 산업 데이터 검색 및 Gemini 3.8 Flash 공학 분석 중...</p>
            <p className="text-xs text-slate-400">3줄 기술 요약, 키워드 추출, 전문용어 해설 및 글로벌 기술 비교를 도출하고 있습니다.</p>
          </div>
        </div>
      )}

      {/* Results grid */}
      {!loading && articles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">"{query}"</span> AI 분석 결과 (국내 2건 + 글로벌 1건)
            </h2>
            <span className="text-xs text-slate-400">분석 시각: 방금 전</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {articles.map((item, idx) => {
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

                      <span className="text-xs text-slate-300 font-semibold">{item.press}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{item.publishedAt}</span>

                      {item.industryCategory && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.industryCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSaveNews(item)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
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
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <span>원문 기사</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  {/* Gemini AI 3-Line Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini 3.8 Flash 핵심 공학 요약 (3줄)</span>
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
                        핵심 키워드 5개 (클릭 시 관련 기사 이어보기 실행)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keywords && item.keywords.map((kw, kIdx) => (
                        <button
                          key={kIdx}
                          onClick={() => handleExploreRelated(kw, item.title)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
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
                        <span>어려운 전문용어와 쉬운 설명 (전공 면접 대비)</span>
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

      {/* Related Articles Section (관련 기사 이어보기) */}
      {activeRelatedKeyword && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                <span className="text-cyan-400">#{activeRelatedKeyword}</span> 관련 기사 이어보기
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
                      <span>원문 보기</span>
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
          <h3 className="text-sm font-bold text-white">관심 산업 또는 기업명을 검색해보세요</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            HBM 반도체, 전고체 배터리, SDV 전장 제어기, 로봇 액추에이터 등 공학 핵심 키워드를 입력하면 국내 2건, 해외 1건의 엄선된 기술 뉴스를 AI가 정밀 요약해 드립니다.
          </p>
        </div>
      )}
    </div>
  );
};
