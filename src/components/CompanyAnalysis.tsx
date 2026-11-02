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
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  FileText,
  Copy,
  Check
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
  initialCompany = '삼성전자',
  initialRole = '메모리사업부 회로설계 및 공정기술',
  savedAnalyses,
  onSaveAnalysis,
  onNavigateToResume
}) => {
  const [companyName, setCompanyName] = useState(initialCompany);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompanyAnalysisType | null>(null);
  const [copied, setCopied] = useState(false);

  // Top enterprise presets for engineering candidates
  const enterprisePresets = [
    { name: '삼성전자', role: 'DRAM/HBM 회로설계' },
    { name: 'SK하이닉스', role: 'HBM 첨단 패키징 및 TSV 공정' },
    { name: '현대자동차', role: 'SDV 도메인 제어기 펌웨어 개발' },
    { name: 'LG에너지솔루션', role: '전고체 배터리 셀 설계' },
    { name: '두산로보틱스', role: '협동로봇 관절 액추에이터 제어' },
    { name: '포스코DX', role: '스마트팩토리 설비 예지보전 AI' },
    { name: '한화에어로스페이스', role: '발사체 추진기관 유동해석(CFD)' },
    { name: 'ASML 코리아', role: 'EUV 노광장비 기술지원 엔지니어' }
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
    const summary = `[${analysis.companyName} - AI 3-STEP 기업 분석 요약]
지원직무: ${analysis.step3_jobConnection.targetRole}
분석 기준일: ${analysis.analyzedDate}

■ STEP 1. 경쟁사 및 차별점
- 주요 차별점: ${analysis.step1_competitors.differentiationPoints.join(', ')}

■ STEP 2. 기업의 핵심 과제
- 생산성/수율 과제: ${analysis.step2_coreChallenges.productivityQualityChallenges.join(', ')}
- 미래 R&D 방향: ${analysis.step2_coreChallenges.futureRndDirection.join(', ')}

■ STEP 3. 자기소개서/면접 공략 포인트
${analysis.step3_jobConnection.coverLetterPoints.join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs text-indigo-300 font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI 기업 분석 대시보드 — 3-STEP 심층 리포트</span>
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              공학적 실무 과제와 <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">지원 직무를 정밀 연결</span>하다
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              단순 재무제표 요약이 아닙니다. <strong>1) 경쟁사 기술 차별점</strong>, <strong>2) 생산성·수율 및 R&amp;D 핵심 과제</strong>, <strong>3) 지원 직무와 전공 프로젝트 연결 고리</strong>까지 이공계 면접관 관점에서 다각도로 도출합니다.
            </p>
          </div>

          {/* Form - Full Width spanning up to right edge */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-2.5 w-full">
            <div className="sm:col-span-5">
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">분석 대상 기업명</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: 현대자동차, 삼성전자, ASML..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">목표 지원 직무</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="예: 전장 제어기 펌웨어, 반도체 수율 엔지니어..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                onClick={() => handleRunAnalysis()}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer h-[42px]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>3-STEP 분석</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Enterprise Presets */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">주요 기업 프리셋:</span>
            {enterprisePresets.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setCompanyName(p.name);
                  setTargetRole(p.role);
                  handleRunAnalysis(p.name, p.role);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-indigo-300 border border-slate-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading with real-time multi-step progress animation */}
      {loading && (
        <div className="py-12 px-6 rounded-2xl bg-slate-900 border border-indigo-500/30 text-center space-y-5 shadow-2xl">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin"></div>
            <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <span>{companyName}</span>
              <span className="text-cyan-400 font-mono text-sm">(Gemini 3.8 Flash R&amp;D 분석 중)</span>
            </h3>
            <p className="text-xs text-slate-400">
              공식 사업보고서, 특허 동향 및 2026 양산 로드맵을 3단계로 추출하고 있습니다.
            </p>
          </div>

          {/* 3 Steps indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto text-left text-xs pt-2">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-1">
              <span className="text-blue-400 font-bold block text-[11px]">STEP 1 진행 중</span>
              <span className="text-slate-200 block font-medium">경쟁사 특허 및 기술 차별점</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-1">
              <span className="text-indigo-400 font-bold block text-[11px]">STEP 2 진행 중</span>
              <span className="text-slate-200 block font-medium">수율·품질 및 차세대 R&amp;D 과제</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
              <span className="text-cyan-400 font-bold block text-[11px]">STEP 3 진행 중</span>
              <span className="text-slate-200 block font-medium">지원 직무 R&amp;R 및 자소서 포인트</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {!loading && analysis && (
        <div className="space-y-6">
          {/* Metadata Bar: Official Facts vs AI Inferences & Credibility */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-white">{analysis.companyName}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/40 font-semibold">
                  타겟 직무: {analysis.step3_jobConnection?.targetRole || targetRole}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/40 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  AI 엔진: {(analysis as any).modelUsed || 'gemini-3.8-flash'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  분석 기준일: {analysis.analyzedDate}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  신뢰도: {analysis.sourceCredibility}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={copyAnalysisSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? '복사됨' : '분석 요약 복사'}</span>
              </button>

              <button
                onClick={() => onSaveAnalysis(analysis)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-cyan-400' : ''}`} />
                <span>{isSaved ? '저장된 분석' : '분석 저장'}</span>
              </button>

              <button
                onClick={() => onNavigateToResume(analysis.companyName, analysis.step3_jobConnection.targetRole)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>자소서에 반영하기</span>
              </button>
            </div>
          </div>

          {/* Official Facts vs AI Inferences callout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>확인된 공식 공시 및 양산 사실 (Official Facts)</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                {analysis.officialFacts.map((fact, idx) => (
                  <li key={idx} className="pl-1">{fact}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI 공학적 시사점 및 미래 추론 (AI Inferences)</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                {analysis.aiInferences.map((inf, idx) => (
                  <li key={idx} className="pl-1">{inf}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STEP 1. 경쟁사와 차별점 분석 */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-xs">
                01
              </div>
              <div>
                <h3 className="text-base font-bold text-white">STEP 1. 경쟁사와 기술 차별점 분석</h3>
                <p className="text-xs text-slate-400">주요 라이벌 대비 독점 기술력, 제품 라인업 및 시장 경쟁력</p>
              </div>
            </div>

            {/* Competitors cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysis.step1_competitors?.competitors || []).map((comp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{comp.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {comp.businessField}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">주요 제품군:</span>
                      <span className="text-slate-300 font-medium">{comp.keyProducts}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">핵심 기술력:</span>
                      <span className="text-slate-300 font-medium">{comp.techStrength}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">시장 경쟁 우위:</span>
                      <span className="text-cyan-300 font-medium">{comp.marketEdge}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Differentiation points */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/30 space-y-2">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{analysis.companyName}만의 엔지니어링 차별화 요소</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside leading-relaxed">
                {(analysis.step1_competitors?.differentiationPoints || []).map((pt, idx) => (
                  <li key={idx} className="pl-1">{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STEP 2. 기업의 핵심 과제 분석 */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xs">
                02
              </div>
              <div>
                <h3 className="text-base font-bold text-white">STEP 2. 기업의 핵심 엔지니어링 과제 분석</h3>
                <p className="text-xs text-slate-400">산업 변화, 기술·경영 장벽, 수율/품질 혁신 및 미래 R&amp;D 방향</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. 산업 변화 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-400 block">1) 산업 패러다임 변화</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  {(analysis.step2_coreChallenges?.industryShifts || []).map((s, idx) => (
                    <li key={idx} className="pl-1">{s}</li>
                  ))}
                </ul>
              </div>

              {/* 2. 기술/경영 과제 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-400 block">2) 당면 기술적·경영적 난제</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  {(analysis.step2_coreChallenges?.technicalManagementChallenges || []).map((c, idx) => (
                    <li key={idx} className="pl-1">{c}</li>
                  ))}
                </ul>
              </div>

              {/* 3. 생산성 및 품질 (수율) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 block">3) 생산성 &amp; 수율(Yield)/품질 개선 과제</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  {(analysis.step2_coreChallenges?.productivityQualityChallenges || []).map((p, idx) => (
                    <li key={idx} className="pl-1">{p}</li>
                  ))}
                </ul>
              </div>

              {/* 4. 원가 및 공정 최적화 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 block">4) 원가 절감 및 공정 리드타임 과제</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  {(analysis.step2_coreChallenges?.costProcessChallenges || []).map((cp, idx) => (
                    <li key={idx} className="pl-1">{cp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Future R&D */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
              <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>5) 중장기 미래 성장 및 차세대 R&amp;D 로드맵</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-200 text-xs leading-relaxed">
                {(analysis.step2_coreChallenges?.futureRndDirection || []).map((rnd, idx) => (
                  <li key={idx} className="pl-1">{rnd}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STEP 3. 지원 직무와 연결 (실전 취업 공략) */}
          {/* ==================================================== */}
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 text-xs">
                03
              </div>
              <div>
                <h3 className="text-base font-bold text-white">STEP 3. 지원 직무와 실무 연결 전략</h3>
                <p className="text-xs text-slate-400">
                  기업 핵심 과제 해결을 위한 실무 R&amp;R, 필요 역량 및 자소서/면접 공략법
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* R&R */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>실무 핵심 업무 (R&amp;R)</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {(analysis.step3_jobConnection?.roleResponsibilities || []).map((r, idx) => (
                    <li key={idx} className="pl-1">{r}</li>
                  ))}
                </ul>
              </div>

              {/* Required Skills */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>필수 공학 기술 및 툴 역량</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {(analysis.step3_jobConnection?.requiredCompetencies || []).map((c, idx) => (
                    <li key={idx} className="pl-1">{c}</li>
                  ))}
                </ul>
              </div>

              {/* Major & Projects */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>전공/프로젝트 연결 고리</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {(analysis.step3_jobConnection?.majorAndProjectLinks || []).map((p, idx) => (
                    <li key={idx} className="pl-1">{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Cover Letter / Interview Points */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/30 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>이공계 자기소개서 및 기술 면접 핵심 어필 포인트 3가지</span>
              </h4>
              <div className="space-y-2 pt-1">
                {(analysis.step3_jobConnection?.coverLetterPoints || []).map((pt, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial state */}
      {!analysis && !loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">원하는 기업과 직무를 입력하고 3-STEP 분석을 시작하세요</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            위 검색창에 삼성전자, 현대자동차, SK하이닉스 또는 희망하는 중견/스타트업을 입력하면 공학 기술 관점의 심층 리포트가 즉시 생성됩니다.
          </p>
        </div>
      )}
    </div>
  );
};
