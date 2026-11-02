/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Bookmark, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  FileText,
  Copy,
  Check,
  ExternalLink,
  Info,
  Building,
  ChevronDown,
  ChevronUp,
  Sliders,
  Scale
} from 'lucide-react';
import { CompanyAnalysis as CompanyAnalysisType } from '../types';
import { ApiService } from '../services/api';

interface CompanyAnalysisProps {
  userId: string;
  initialCompany?: string;
  initialRole?: string;
  savedAnalyses: CompanyAnalysisType[];
  onSaveAnalysis: (analysis: CompanyAnalysisType) => void;
  onNavigateToResume: (companyName: string, role: string) => void;
}

export const CompanyAnalysis: React.FC<CompanyAnalysisProps> = ({
  userId,
  initialCompany = '현대자동차',
  initialRole = 'SDV 제어 아키텍처 펌웨어 개발',
  savedAnalyses,
  onSaveAnalysis,
  onNavigateToResume
}) => {
  const [companyName, setCompanyName] = useState(initialCompany);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompanyAnalysisType | null>(null);
  const [copied, setCopied] = useState(false);

  // Collapsible accordion state for STEP 1, STEP 2, STEP 3
  const [openSteps, setOpenSteps] = useState<{ step1: boolean; step2: boolean; step3: boolean }>({
    step1: true,
    step2: true,
    step3: true,
  });

  const toggleStep = (step: 'step1' | 'step2' | 'step3') => {
    setOpenSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  // Top enterprise presets for engineering candidates across large, mid-size, and public sectors
  const enterprisePresets = [
    { name: '현대자동차', role: 'SDV 도메인 제어기 펌웨어 개발' },
    { name: '서연이화', role: '친환경 전기차 경량 도어트림 기구설계' },
    { name: 'HL만도', role: 'x-by-Wire 전자제어 조향장치 임베디드 SW' },
    { name: 'SK하이닉스', role: 'HBM 첨단 패키징 및 TSV 수율 공정' },
    { name: '삼성전자', role: 'DRAM/HBM 코어 회로설계 및 수율 엔지니어' },
    { name: 'LG에너지솔루션', role: '전고체 배터리 셀 아키텍처 및 전극 공정' },
    { name: '두산로보틱스', role: '협동로봇 관절 액추에이터 제어' },
    { name: '한국항공우주산업', role: 'KF-21 초음속 전투기 비행제어 소프트웨어' },
    { name: 'ASML 코리아', role: 'EUV 노광장비 광학/진공 기술지원' }
  ];

  const handleRunAnalysis = async (cName?: string, cRole?: string) => {
    const comp = cName || companyName;
    const role = cRole || targetRole;
    if (!comp.trim()) return;

    setLoading(true);
    try {
      const res = await ApiService.analyzeCompany(comp, role);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = analysis ? savedAnalyses.some(a => a.companyName === analysis.companyName) : false;

  const copyAnalysisSummary = () => {
    if (!analysis) return;
    const summary = `[${analysis.companyName} - AI 3-STEP 공학 기업 분석 요약]
지원직무: ${analysis.step3_jobConnection?.targetRole || targetRole}
분석 기준일: ${analysis.analyzedDate} (KST)
출처 신뢰도: ${analysis.sourceCredibility}

■ 기업 개요
- 기업규모: ${analysis.companyIdentity?.scale || '확인'}
- 주요사업/제품군: ${analysis.companyIdentity?.mainIndustry || '확인'}
- 본사: ${analysis.companyIdentity?.headquarters || '확인'}

■ STEP 1. 경쟁사 분석 및 기술 차별점
- 주요 차별점: ${(analysis.step1_competitors?.differentiationPoints || []).join(', ')}

■ STEP 2. 기업의 핵심 공학 과제
- 수율 및 품질 과제: ${(analysis.step2_coreChallenges?.productivityQualityChallenges || []).join(', ')}
- 미래 R&D 방향: ${(analysis.step2_coreChallenges?.futureRndDirection || []).join(', ')}

■ STEP 3. 자기소개서/면접 공략 포인트
${(analysis.step3_jobConnection?.coverLetterPoints || []).join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Top Banner & Search Form */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 w-full space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/40 text-xs sm:text-sm text-indigo-300 font-semibold shadow-inner">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>AI 기업 분석 대시보드 — 3-STEP 공학 심층 리포트</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>실제 기사 및 공시 Grounding (Fact vs Inference 명확 분리)</span>
            </div>
          </div>

          <div className="max-w-4xl space-y-2.5">
            {/* Page Title: 28~32px */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              기업의 기술 실무 과제와 <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">지원 직무를 정밀 연결</span>하다
            </h1>
            {/* Body: 15~16px */}
            <p className="text-slate-300 text-[15px] sm:text-base leading-relaxed">
              단순 재무제표 요약이 아닙니다. 실시간 언론 보도와 공시 데이터를 수집한 뒤 
              <strong className="text-white"> 1) 경쟁사 선정 이유와 차별점</strong>, 
              <strong className="text-white"> 2) 수율·공정 및 당면 R&amp;D 핵심 과제</strong>, 
              <strong className="text-white"> 3) 지원 직무와 전공 프로젝트 연결 고리</strong>를 이공계 채용 심사관 관점에서 다각도로 도출합니다.
            </p>
          </div>

          {/* Form */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
            <div className="sm:col-span-5">
              <label className="block text-xs sm:text-sm text-slate-300 font-semibold mb-1.5">
                분석 대상 기업명
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: 서연이화, 현대자동차, HL만도, SK하이닉스..."
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-indigo-400 transition-colors shadow-inner"
                />
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs sm:text-sm text-slate-300 font-semibold mb-1.5">
                목표 지원 직무
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="예: 전기차 배터리 BMA 기구설계, SDV 펌웨어..."
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-indigo-400 transition-colors shadow-inner"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                onClick={() => handleRunAnalysis()}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer h-[48px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>3-STEP 분석</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Enterprise Presets */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">검증 테스트 프리셋:</span>
            {enterprisePresets.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setCompanyName(p.name);
                  setTargetRole(p.role);
                  handleRunAnalysis(p.name, p.role);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-indigo-300 border border-slate-700 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state with step animation */}
      {loading && (
        <div className="py-16 px-6 sm:px-8 rounded-2xl bg-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin"></div>
            <Sparkles className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
              <span>{companyName}</span>
              <span className="text-cyan-400 font-mono text-sm sm:text-base">(Gemini 3.8 Flash 사실 기반 분석)</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              실시간 언론 보도와 공식 기업 데이터를 수집하여 [확인된 사실]과 [AI 추론]을 엄격히 분리 추출하고 있습니다.
            </p>
          </div>

          {/* 3 Steps indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs sm:text-sm pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-1">
              <span className="text-blue-400 font-bold block text-xs">STEP 1 진행 중</span>
              <span className="text-slate-200 block font-semibold">경쟁사 선정 이유 및 기술 차별점</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-1">
              <span className="text-indigo-400 font-bold block text-xs">STEP 2 진행 중</span>
              <span className="text-slate-200 block font-semibold">수율·품질 및 차세대 R&amp;D 과제</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
              <span className="text-cyan-400 font-bold block text-xs">STEP 3 진행 중</span>
              <span className="text-slate-200 block font-semibold">지원 직무 R&amp;R 및 자소서 포인트</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {!loading && analysis && (
        <div className="space-y-8 sm:space-y-10">
          
          {/* ==================================================== */}
          {/* 1. 상단: 기업 개요 (Corporate Identity Overview) */}
          {/* ==================================================== */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            {/* Header: Company Name, Scale, Career Portal & Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Section Title: 22~24px */}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                    <Building className="w-6 h-6 text-cyan-400" />
                    <span>{analysis.companyName}</span>
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-indigo-950 text-indigo-300 font-semibold border border-indigo-700/50">
                    {analysis.companyIdentity?.scale || '기업'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-cyan-950 text-cyan-300 font-semibold border border-cyan-700/50">
                    타겟 직무: {analysis.step3_jobConnection?.targetRole || targetRole}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    분석 기준일: <strong className="text-slate-200 font-semibold">{analysis.analyzedDate} (KST)</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    출처 신뢰도: <strong className="text-emerald-300 font-semibold">{analysis.sourceCredibility}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>실시간 검색 검증 완료</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {analysis.companyIdentity?.officialCareersPortal && (
                  <a
                    href={analysis.companyIdentity.officialCareersPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    <span>공식 채용 사이트</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={copyAnalysisSummary}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? '복사됨' : '요약 복사'}</span>
                </button>

                <button
                  onClick={() => onSaveAnalysis(analysis)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-400' : ''}`} />
                  <span>{isSaved ? '저장됨' : '분석 저장'}</span>
                </button>

                <button
                  onClick={() => onNavigateToResume(analysis.companyName, analysis.step3_jobConnection?.targetRole || targetRole)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>자소서에 반영</span>
                </button>
              </div>
            </div>

            {/* Profile Grid: Main Industry, Headquarters, Foundation, Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">주요 사업 및 핵심 제품군</span>
                <span className="font-semibold text-slate-100 text-[15px] sm:text-base leading-snug block">
                  {analysis.companyIdentity?.mainIndustry || '산업 공시 확인'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">본사 및 주요 사업장 위치</span>
                <span className="font-semibold text-slate-100 text-[15px] sm:text-base leading-snug block">
                  {analysis.companyIdentity?.headquarters || '국내 사업장'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">설립 연도</span>
                <span className="font-semibold text-slate-100 text-[15px] sm:text-base leading-snug block">
                  {analysis.companyIdentity?.foundationYear || '공식 공시 확인'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">데이터 분석 신뢰도</span>
                <span className="font-semibold text-emerald-400 text-[15px] sm:text-base flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{analysis.dataSufficiency === 'HIGH' ? '높음 (검증 완료)' : '표준 (실시간 보도 대조)'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 2. 중간: 확인된 공식 사실 vs AI 공학적 시사점 */}
          {/* ==================================================== */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              {/* Section Title: 22~24px */}
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Scale className="w-6 h-6 text-indigo-400" />
                <span>데이터 검증 — 공식 확인 사실 vs AI 공학적 시사점</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                공시·언론 보도에서 확인된 사실과 채용 면접관 관점의 엔지니어링 추론을 명확히 구분하여 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Official Facts */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-emerald-900/50 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                  {/* Card Title: 17~20px */}
                  <span className="font-bold text-emerald-400 flex items-center gap-2 text-base sm:text-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>확인된 공식 사실 (Official Facts)</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                    공시·보도 검증
                  </span>
                </div>

                <ul className="space-y-3">
                  {(analysis.officialFacts || []).map((factItem: any, idx: number) => {
                    const content = typeof factItem === 'string' ? factItem : factItem.content;
                    const source = typeof factItem === 'object' ? factItem.sourceTitle : '';
                    return (
                      <li key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></span>
                          {/* Body Text: 15~16px */}
                          <span className="text-[15px] sm:text-base text-slate-100 leading-relaxed font-medium">
                            {content}
                          </span>
                        </div>
                        {source && (
                          <span className="text-xs text-slate-400 pl-4 block">
                            근거 출처: {source}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 2. AI Inferences */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-purple-900/50 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-950 pb-3">
                  {/* Card Title: 17~20px */}
                  <span className="font-bold text-purple-400 flex items-center gap-2 text-base sm:text-lg">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>AI 공학적 시사점 (AI Inferences)</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-semibold">
                    면접관 관점 분석
                  </span>
                </div>

                <ul className="space-y-3">
                  {(analysis.aiInferences || []).map((infItem: any, idx: number) => {
                    const isObj = typeof infItem === 'object' && infItem.title;
                    return (
                      <li key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="font-bold text-slate-100 flex items-center gap-2 text-[15px] sm:text-base">
                          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></span>
                          <span>{isObj ? infItem.title : infItem}</span>
                        </div>
                        {isObj && infItem.reasoning && (
                          <p className="text-xs sm:text-sm text-slate-300 pl-4 leading-relaxed">
                            <strong className="text-purple-300">추론 근거:</strong> {infItem.reasoning}
                          </p>
                        )}
                        {isObj && infItem.candidateImplication && (
                          <p className="text-xs sm:text-sm text-cyan-300 pl-4 leading-relaxed bg-cyan-950/30 p-2 rounded border border-cyan-800/30">
                            <strong>지원자 공략 포인트:</strong> {infItem.candidateImplication}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STEP 1. 경쟁사 분석 및 기술 차별점 (Collapsible) */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div 
              onClick={() => toggleStep('step1')}
              className="flex items-center justify-between border-b border-slate-800 pb-4 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm">
                  01
                </div>
                <div>
                  {/* Section Title: 22~24px */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    STEP 1. 경쟁사 분석 및 기술 차별점
                  </h3>
                  {/* Subtitle: 13~14px */}
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    경쟁사 선정 이유(공통 제품군·시장 경쟁 요인)와 {analysis.companyName}만의 독자적 차별화 요소
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {openSteps.step1 ? '섹션 접기' : '섹션 펼치기'}
                </span>
                <button className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                  {openSteps.step1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {openSteps.step1 && (
              <div className="space-y-6 pt-1">
                {/* Competitors cards with Selection Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(analysis.step1_competitors?.competitors || []).map((comp, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                        {/* Card Title: 17~20px */}
                        <h4 className="text-base sm:text-lg font-bold text-white">{comp.name}</h4>
                        <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 font-medium">
                          {comp.businessField}
                        </span>
                      </div>

                      {/* Competitor Selection Rationale */}
                      {comp.selectionRationale && (
                        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs sm:text-sm text-indigo-200 leading-relaxed">
                          <strong className="text-indigo-300 block mb-1">경쟁사 선정 이유:</strong>
                          {comp.selectionRationale}
                        </div>
                      )}

                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-slate-400 text-xs block font-semibold">주요 제품군:</span>
                          <span className="text-slate-200 font-medium text-sm sm:text-[15px]">{comp.keyProducts}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block font-semibold">핵심 기술력:</span>
                          <span className="text-slate-200 font-medium text-sm sm:text-[15px]">{comp.techStrength}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block font-semibold">시장 비교 포인트:</span>
                          <span className="text-cyan-300 font-medium text-sm sm:text-[15px]">{comp.marketEdge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Differentiation points */}
                <div className="p-6 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span>{analysis.companyName}만의 엔지니어링 독자 차별화 요소</span>
                  </h4>
                  <ul className="space-y-2.5 list-disc list-inside">
                    {(analysis.step1_competitors?.differentiationPoints || []).map((pt, idx) => (
                      <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-100 leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* STEP 2. 기업 핵심 과제 분석 (Collapsible) */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div 
              onClick={() => toggleStep('step2')}
              className="flex items-center justify-between border-b border-slate-800 pb-4 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-sm">
                  02
                </div>
                <div>
                  {/* Section Title: 22~24px */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    STEP 2. 기업 핵심 공학 과제 분석 (기술·생산성·품질·원가·R&amp;D)
                  </h3>
                  {/* Subtitle: 13~14px */}
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    일반론 탈피: 실제 생산 공정, 수율/품질 난제, 원가 절감 과제 및 차세대 R&amp;D 로드맵
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {openSteps.step2 ? '섹션 접기' : '섹션 펼치기'}
                </span>
                <button className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                  {openSteps.step2 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {openSteps.step2 && (
              <div className="space-y-6 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 1. 산업 변화 */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-indigo-400 text-base sm:text-lg block">
                      1) 산업 패러다임 변화
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step2_coreChallenges?.industryShifts || []).map((s, idx) => (
                        <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-200 leading-relaxed">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. 기술/경영 과제 */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-indigo-400 text-base sm:text-lg block">
                      2) 당면 기술적·경영적 과제
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step2_coreChallenges?.technicalManagementChallenges || []).map((c, idx) => (
                        <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-200 leading-relaxed">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. 생산성 및 수율 */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-cyan-400 text-base sm:text-lg block">
                      3) 생산성 &amp; 수율(Yield) / 품질 개선 과제
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step2_coreChallenges?.productivityQualityChallenges || []).map((p, idx) => (
                        <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-200 leading-relaxed">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. 원가 및 공정 최적화 */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-cyan-400 text-base sm:text-lg block">
                      4) 원가 절감 및 공정 리드타임 최적화
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step2_coreChallenges?.costProcessChallenges || []).map((cp, idx) => (
                        <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-200 leading-relaxed">
                          {cp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. Future R&D */}
                <div className="p-6 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                  <span className="font-bold text-indigo-300 text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <span>5) 중장기 미래 성장 및 차세대 R&amp;D 로드맵</span>
                  </span>
                  <ul className="list-disc list-inside space-y-2">
                    {(analysis.step2_coreChallenges?.futureRndDirection || []).map((rnd, idx) => (
                      <li key={idx} className="pl-1 text-[15px] sm:text-base text-slate-100 leading-relaxed">
                        {rnd}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* STEP 3. 지원 직무 연결 전략 (Collapsible) */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div 
              onClick={() => toggleStep('step3')}
              className="flex items-center justify-between border-b border-slate-800 pb-4 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 text-sm">
                  03
                </div>
                <div>
                  {/* Section Title: 22~24px */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    STEP 3. 지원 직무 연결 및 실전 자소서·면접 전략
                  </h3>
                  {/* Subtitle: 13~14px */}
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    기업 핵심 과제 해결을 위한 실무 R&amp;R, 전공 프로젝트 연계 및 자소서/면접 공략법
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {openSteps.step3 ? '섹션 접기' : '섹션 펼치기'}
                </span>
                <button className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                  {openSteps.step3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {openSteps.step3 && (
              <div className="space-y-6 pt-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* R&R */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-cyan-400 flex items-center gap-2 text-base sm:text-lg">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                      <span>실무 핵심 업무 (R&amp;R)</span>
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step3_jobConnection?.roleResponsibilities || []).map((r, idx) => (
                        <li key={idx} className="pl-1 text-[15px] text-slate-200 leading-relaxed">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Skills */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-indigo-400 flex items-center gap-2 text-base sm:text-lg">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                      <span>필수 공학 툴 및 역량</span>
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step3_jobConnection?.requiredCompetencies || []).map((c, idx) => (
                        <li key={idx} className="pl-1 text-[15px] text-slate-200 leading-relaxed">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Major & Projects */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="font-bold text-emerald-400 flex items-center gap-2 text-base sm:text-lg">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <span>전공/프로젝트 연결 고리</span>
                    </span>
                    <ul className="list-disc list-inside space-y-2">
                      {(analysis.step3_jobConnection?.majorAndProjectLinks || []).map((p, idx) => (
                        <li key={idx} className="pl-1 text-[15px] text-slate-200 leading-relaxed">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actionable Cover Letter / Interview Points (3선) */}
                <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/40 space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span>이공계 자기소개서 및 기술 면접 핵심 어필 포인트 3가지</span>
                  </h4>
                  <div className="space-y-3 pt-1">
                    {(analysis.step3_jobConnection?.coverLetterPoints || []).map((pt, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 text-[15px] sm:text-base text-slate-100 leading-relaxed flex items-start gap-3.5 shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-cyan-500/40">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* 참고한 실제 언론 보도 및 공시 출처 */}
          {/* ==================================================== */}
          {analysis.sourcesConsulted && analysis.sourcesConsulted.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-base sm:text-lg font-bold text-white">참고한 실제 언론 보도 및 공시 출처 (Fact Sources)</h4>
                </div>
                <span className="text-xs sm:text-sm text-slate-400">
                  총 {analysis.sourcesConsulted.length}건 기사 원문 대조
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.sourcesConsulted.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <span className="text-xs text-cyan-400 font-semibold block">{source.publisher}</span>
                      <p className="text-slate-200 font-medium text-sm sm:text-[15px] line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {source.title}
                      </p>
                      <span className="text-xs text-slate-500 block">수집/발행일: {source.publishedAt}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 flex-shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Information Notice if any */}
          {analysis.unavailableInformation && analysis.unavailableInformation.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5 text-xs sm:text-sm text-slate-400">
              <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 block text-sm">비공개 또는 확인 불가 정보 안내 (허위 사실 배제 원칙)</span>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {analysis.unavailableInformation.join(' / ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!analysis && !loading && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Building2 className="w-14 h-14 text-slate-600 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">원하는 기업과 직무를 입력하고 사실 기반 3-STEP 분석을 시작하세요</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            현대자동차, 서연이화, HL만도, SK하이닉스 또는 희망하는 중견기업을 입력하면 최신 보도자료와 기술 데이터를 수집하여 공학 리포트가 즉시 생성됩니다.
          </p>
        </div>
      )}
    </div>
  );
};
