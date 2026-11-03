/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  FileText, 
  ArrowRight,
  Cpu,
  Layers,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Job } from '../types';
import { ApiService } from '../services/api';

interface JobSearchProps {
  userId: string;
  savedJobs: Job[];
  onToggleSaveJob: (job: Job) => void;
  onNavigateToCompany: (companyName: string, role: string) => void;
  onNavigateToResume: (companyName: string, role: string) => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({
  userId,
  savedJobs,
  onToggleSaveJob,
  onNavigateToCompany,
  onNavigateToResume,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('전체');
  const [major, setMajor] = useState('전체');
  const [location, setLocation] = useState('전체');
  const [experience, setExperience] = useState('전체');
  const [companyScale, setCompanyScale] = useState('전체');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true); // Default ON to exclude expired postings
  const [sortBy, setSortBy] = useState<'latest' | 'deadline'>('latest');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Response metadata for zero-match authentic company handling and external API
  const [referenceDate, setReferenceDate] = useState<string>('');
  const [searchedCompanyInfo, setSearchedCompanyInfo] = useState<any | null>(null);
  const [externalApiStatus, setExternalApiStatus] = useState<any | null>(null);
  const [providerSummaries, setProviderSummaries] = useState<any[]>([]);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [emptySearchFeedback, setEmptySearchFeedback] = useState<{
    reason?: string;
    reasonLabel?: string;
    companyName?: string;
    message?: string;
    technicalDetails?: string;
    links?: Array<{ name: string; url: string; isOfficial: boolean }>;
  } | null>(null);

  const categories = [
    '전체',
    '반도체 / 디스플레이',
    '모빌리티 / SDV',
    '이차전지 / 배터리',
    '로봇 / 제어 / 자동화',
    '소프트웨어 / 임베디드',
    '기계 / 항공우주'
  ];

  const companyScales = [
    '전체',
    '대기업',
    '대기업 계열사',
    '중견기업',
    '공기업/공공기관',
    '외국계',
    '중소/스타트업'
  ];

  const majors = [
    '전체',
    '전자전기공학',
    '컴퓨터공학',
    '기계공학',
    '화학공학',
    '신소재공학',
    '산업공학',
    '항공우주공학'
  ];

  const locations = [
    '전체',
    '경기 화성/평택',
    '경기 판교/수원',
    '경기 이천',
    '대전/충청',
    '경남 창원/울산',
    '경북 포항/구미',
    '서울'
  ];

  const experiences = ['전체', '신입', '경력', '인턴'];

  const resetAllFilters = () => {
    setQuery('');
    setCategory('전체');
    setMajor('전체');
    setLocation('전체');
    setExperience('전체');
    setCompanyScale('전체');
    setShowOnlyOpen(true);
    setSortBy('latest');
  };

  const handleSearch = async () => {
    setLoading(true);
    setEmptySearchFeedback(null);
    setSearchedCompanyInfo(null);
    try {
      const res = await ApiService.searchJobs({
        query,
        category: category === '전체' ? '' : category,
        major: major === '전체' ? '' : major,
        location: location === '전체' ? '' : location,
        experience: experience === '전체' ? '' : experience,
        companyScale: companyScale === '전체' ? '' : companyScale,
        showExpired: !showOnlyOpen,
        sortBy
      });

      if (res.referenceDate) {
        setReferenceDate(res.referenceDate);
      }
      if (res.externalApiStatus) {
        setExternalApiStatus(res.externalApiStatus);
      }
      if (res.providerSummaries) {
        setProviderSummaries(res.providerSummaries);
      }

      if (res.success && res.jobs) {
        setJobs(res.jobs);
        if (res.jobs.length > 0) {
          // If previous selected job is not in the list, select first
          if (!selectedJob || !res.jobs.some(j => j.id === selectedJob.id)) {
            setSelectedJob(res.jobs[0]);
          }
        } else {
          setSelectedJob(null);
          // Store rich structured empty feedback
          if (res.emptyFeedback) {
            setEmptySearchFeedback(res.emptyFeedback);
          } else if (res.searchedCompany || res.companyInfo) {
            setSearchedCompanyInfo(res.companyInfo || null);
            setEmptySearchFeedback({
              reason: 'NO_POSTINGS_FOUND',
              reasonLabel: '1. 확인된 모집 공고 없음',
              companyName: res.searchedCompany || query,
              message: res.message || '일치하는 공고가 없습니다.',
              technicalDetails: '필터 조건에 맞는 진행 중 공고가 없습니다.',
              links: res.externalSearchLinks || []
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [category, major, location, experience, companyScale, showOnlyOpen, sortBy]);

  const isSaved = (jobId: string) => savedJobs.some(j => j.id === jobId);

  // Status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            모집중
          </span>
        );
      case 'ALWAYS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-cyan-300 border border-blue-500/40">
            <Clock className="w-2.5 h-2.5" />
            상시채용
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            접수 마감
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40">
            확인 필요
          </span>
        );
    }
  };

  // Provider badge helper
  const renderProviderBadge = (providerType?: string) => {
    switch (providerType) {
      case 'OFFICIAL_ATS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-700/50">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            공식 ATS 실시간 수집
          </span>
        );
      case 'JSON_LD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700/50">
            공식 JSON-LD 수집
          </span>
        );
      case 'VERIFIED_CATALOG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/50">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            기업 공식 검증
          </span>
        );
      case 'WORK24':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/90 text-blue-300 border border-blue-700/50">
            고용24 국가공인
          </span>
        );
      case 'SARAMIN_API':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/90 text-purple-300 border border-purple-700/50">
            사람인 OPEN API
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 w-full space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs text-cyan-300 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>이공계 &amp; 엔지니어링 맞춤형 공고 통합 검색</span>
            </div>
            {referenceDate && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>검증 기준일: <strong>{referenceDate}</strong> (한국시간 KST)</span>
              </span>
            )}
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              대기업·계열사·중견기업 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">엔지니어링 R&amp;D 및 생산기술</span> 채용 공고
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              삼성·현대·SK·LG 대기업뿐만 아니라 <strong>서연이화·HL만도·한온시스템 등 우량 중견기업 및 공기업</strong>까지 검증된 공고를 검색하고, 실시간 공식 채용 사이트 및 AI 기업 분석으로 직결됩니다.
            </p>
          </div>

          {/* Search Bar - Full Width stretching to right edge */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="기업명 (예: 현대자동차, 서연이화, HL만도, SK하이닉스), 직무, 기술스택 검색..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>검색 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>공고 검색</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-1">
            <span className="font-medium mr-1 text-slate-500">빠른 검색:</span>
            {['현대자동차그룹', '서연이화', 'HL만도', '현대모비스', 'SK하이닉스', 'LG에너지솔루션', '두산로보틱스', 'ASML 코리아', '한국항공우주산업'].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuery(chip);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer text-[11px]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Selectors & Active Filter Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">기업 규모</label>
              <select
                value={companyScale}
                onChange={(e) => setCompanyScale(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {companyScales.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">산업 분야</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">우대 전공</label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {majors.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">근무 지역</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">채용 유형</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:border-cyan-400 focus:outline-none"
              >
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Recruitment Type Filter Bar (전체 / 신입 / 경력 / 인턴) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/50">
            <span className="text-xs text-slate-400 font-semibold mr-1">채용 유형 선택:</span>
            {experiences.map((exp) => (
              <button
                key={exp}
                onClick={() => setExperience(exp)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  experience === exp
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {exp === '인턴' ? '인턴 (체험형·채용연계형·전환형)' : exp}
              </button>
            ))}
          </div>

          {/* Active Recruitment Filter Toggle & Sort selector */}
          <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 w-4 h-4"
                />
                <span className="text-slate-300 font-medium">
                  현재 접수 중인 공고만 보기 (마감 공고 자동 제외)
                </span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                최신성 검증 활성
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Reset filter button */}
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-slate-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
              >
                필터 전체 초기화
              </button>

              <span className="inline-flex items-center gap-1 text-slate-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                AI 허위 공고 생성 원천 차단
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Provider Collection Status Banner */}
      <div className="p-3.5 rounded-xl border bg-slate-900/90 border-slate-800 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
          <span className="font-bold text-white">공식 채용정보 수집 시스템</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-cyan-300 font-semibold text-[11px]">1순위: 공식 공개 ATS (Greenhouse/Lever)</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-emerald-300 font-semibold text-[11px]">2순위: JSON-LD 구조화 데이터</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 text-[11px]">3순위: 기업 공식 포털 검증 &amp; 실시간 검색 안내</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowApiGuide(!showApiGuide)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-medium"
          >
            {showApiGuide ? '수집 시스템 상세 닫기' : '수집 아키텍처 및 사람인 API 준비 상태'}
          </button>
        </div>
      </div>

      {/* Collapsible API & Provider System Architecture Guide */}
      {showApiGuide && (
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs space-y-3 text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ENGINEER JOB 멀티 프로바이더 채용 수집 아키텍처</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              Vercel Serverless Function
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-indigo-900/40 space-y-1">
              <strong className="text-indigo-400 block font-bold">1순위: 공식 공개 ATS API</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Greenhouse, Lever, Ashby 공개 API를 통해 쿠팡, 센드버드, 퓨리오사AI, 크래프톤, 당근 등의 실제 공고를 수집합니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/40 space-y-1">
              <strong className="text-cyan-400 block font-bold">2순위: 공식 JSON-LD 구조화 데이터</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                기업 채용 웹의 Schema.org/JobPosting 메타데이터를 SSRF 안전 필터를 거쳐 파싱하며, 봇 차단 시 안전하게 수집을 중단합니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-emerald-900/40 space-y-1">
              <strong className="text-emerald-400 block font-bold">3순위: 기업 공식 포털 검증 &amp; 사람인 API</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                현대차·삼성·SK하이닉스 등 주요 대기업·중견기업 공고를 검증 제공하며, 사람인 API 승인 시 환경변수 등록만으로 즉시 연동됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout: Job List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Job Card List (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                검색 결과 <strong className="text-cyan-400">{jobs.length}</strong>건
              </span>
              <span className="text-[11px] text-slate-500">
                {showOnlyOpen ? '(마감 제외)' : '(마감 포함)'}
              </span>
            </div>

            {/* Sort Toggle Controls */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  sortBy === 'latest'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSortBy('deadline')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  sortBy === 'deadline'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                마감 임박순
              </button>
            </div>
          </div>

          {/* 4-Tier Empty State Result with Anti-Hallucination & Authentic Corporate Navigation */}
          {jobs.length === 0 && !loading && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  emptySearchFeedback?.reason === 'ACCESS_RESTRICTED'
                    ? 'bg-purple-950/60 border-purple-600/40 text-purple-400'
                    : emptySearchFeedback?.reason === 'SOURCE_NOT_CONNECTED'
                    ? 'bg-amber-950/60 border-amber-600/40 text-amber-400'
                    : emptySearchFeedback?.reason === 'FETCH_FAILED'
                    ? 'bg-rose-950/60 border-rose-600/40 text-rose-400'
                    : 'bg-cyan-950/60 border-cyan-600/40 text-cyan-400'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      {emptySearchFeedback?.companyName ? `'${emptySearchFeedback.companyName}' 공고 조회 결과` : '일치하는 공고가 없습니다'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      emptySearchFeedback?.reason === 'ACCESS_RESTRICTED'
                        ? 'bg-purple-950 text-purple-300 border-purple-700/50'
                        : emptySearchFeedback?.reason === 'SOURCE_NOT_CONNECTED'
                        ? 'bg-amber-950 text-amber-300 border-amber-700/50'
                        : emptySearchFeedback?.reason === 'FETCH_FAILED'
                        ? 'bg-rose-950 text-rose-300 border-rose-700/50'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-700/50'
                    }`}>
                      {emptySearchFeedback?.reasonLabel || '1. 확인된 모집 공고 없음'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {emptySearchFeedback?.message || '선택하신 조건에 일치하는 실시간 공고가 없습니다. AI는 존재하지 않는 허위 공고를 지어내지 않습니다.'}
                  </p>

                  {emptySearchFeedback?.technicalDetails && (
                    <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 leading-snug">
                      <strong className="text-slate-300">상세 안내:</strong> {emptySearchFeedback.technicalDetails}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow"
                    >
                      <span>필터 전체 초기화하고 모든 공고 보기</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* If identified as a real enterprise, provide rich real portal actions */}
              {searchedCompanyInfo && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-cyan-300">{searchedCompanyInfo.name}</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {searchedCompanyInfo.scale}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{searchedCompanyInfo.industry}</span>
                  </div>

                  {searchedCompanyInfo.mainProducts && (
                    <p className="text-[11px] text-slate-400">
                      <strong>주요 생산품:</strong> {searchedCompanyInfo.mainProducts}
                    </p>
                  )}

                  <div className="space-y-2 pt-1">
                    <a
                      href={searchedCompanyInfo.officialCareersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md"
                    >
                      <span>{searchedCompanyInfo.name} 공식 채용 사이트 바로가기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onNavigateToCompany(searchedCompanyInfo.name, '공학 R&D / 설계')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{searchedCompanyInfo.name} AI 3-STEP 기업 분석 바로 실행</span>
                    </button>
                  </div>
                </div>
              )}

              {/* External Job Portal Search Links */}
              {emptySearchFeedback?.links && emptySearchFeedback.links.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">외부 주요 채용 포털 실시간 공고 원문 검색:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {emptySearchFeedback.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs border border-slate-700 transition-colors"
                      >
                        <span className="truncate">{link.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Card List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const active = selectedJob?.id === job.id;
              const saved = isSaved(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    active
                      ? 'bg-slate-800/90 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                        {job.company}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {job.companyScale || '기업'}
                      </span>
                      {job.internType ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/50">
                          {job.internType}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {job.experienceLevel}
                        </span>
                      )}
                      {renderStatusBadge(job.recruitmentStatus)}
                      {renderProviderBadge(job.providerType)}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveJob(job);
                      }}
                      title={saved ? '관심 공고 취소' : '관심 공고 저장'}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex-shrink-0 ${
                        saved
                          ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-cyan-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {job.title}
                  </h3>

                  {/* Salary info if available */}
                  {job.salary && (
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md inline-block">
                        급여: {job.salary}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      마감: <strong className={job.recruitmentStatus === 'EXPIRED' ? 'text-slate-500' : 'text-amber-400'}>{job.deadline}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {job.lastCheckedAt ? `확인: ${new Date(job.lastCheckedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : `검증: ${job.verifiedDate}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.techStack.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                    {job.techStack.length > 3 && (
                      <span className="text-[10px] text-slate-500 px-1 py-0.5">
                        +{job.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Job Detailed Preview (7 cols on desktop) */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-20 shadow-xl">
              {/* Header */}
              <div className="border-b border-slate-800 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-cyan-400">{selectedJob.company}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {selectedJob.companyScale || '기업'}
                    </span>
                    {selectedJob.internType ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50">
                        {selectedJob.internType}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {selectedJob.experienceLevel}
                      </span>
                    )}
                    {renderStatusBadge(selectedJob.recruitmentStatus)}
                    {renderProviderBadge(selectedJob.providerType)}
                    <span className="text-[11px] text-slate-500">
                      출처: {selectedJob.source}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleSaveJob(selectedJob)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSaved(selectedJob.id)
                        ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved(selectedJob.id) ? 'fill-cyan-400' : ''}`} />
                    <span>{isSaved(selectedJob.id) ? '저장된 공고' : '관심 공고 저장'}</span>
                  </button>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {selectedJob.title}
                </h2>

                {/* Salary Highlight in Detailed View */}
                {selectedJob.salary && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">예상 처우 및 급여 조건:</span>
                    <span className="font-bold text-emerald-300">{selectedJob.salary}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">근무 지역</span>
                    <span className="font-semibold text-slate-200">{selectedJob.location}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">경력 조건</span>
                    <span className="font-semibold text-slate-200">{selectedJob.experienceLevel}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">접수 마감</span>
                    <span className={`font-semibold ${selectedJob.recruitmentStatus === 'EXPIRED' ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                      {selectedJob.deadline}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">정보 확인 시각</span>
                    <span className="font-semibold text-cyan-300">
                      {selectedJob.lastCheckedAt 
                        ? new Date(selectedJob.lastCheckedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                        : (selectedJob.verifiedDate || referenceDate || '실시간')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Major Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>우대 및 관련 공학 전공</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.majorRequirement.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>요구 및 활용 엔지니어링 기술 스택</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/60 text-xs text-cyan-300 font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">주요 실무 업무 (R&amp;R)</h4>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed list-disc list-inside bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {selectedJob.responsibilities.map((resp, idx) => (
                    <li key={idx} className="pl-1">{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons: Verified URL + 1-Click Company Analysis + Cover Letter Studio */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigateToCompany(selectedJob.company, selectedJob.title)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>이 기업 AI 3-STEP 분석</span>
                  </button>

                  <button
                    onClick={() => onNavigateToResume(selectedJob.company, selectedJob.title)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>이 직무로 자소서 AI 첨삭</span>
                  </button>
                </div>

                {/* Primary Outbound Link: Verifies valid URL and opens safely in new tab */}
                <a
                  href={selectedJob.originalUrl || selectedJob.officialCareerUrl || `https://www.google.com/search?q=${encodeURIComponent(selectedJob.company + ' 채용공고')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20"
                >
                  <span>
                    {selectedJob.urlStatus === 'DIRECT_POSTING'
                      ? `${selectedJob.company} 공식 채용 원문 바로가기`
                      : `${selectedJob.company} 공식 인재채용 사이트 바로가기`}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
              <Building className="w-8 h-8 text-slate-600 mx-auto" />
              <p>왼쪽 목록에서 공고를 선택하면 상세 직무 설명과 원문 링크를 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
