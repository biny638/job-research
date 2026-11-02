/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Bookmark, 
  GraduationCap, 
  Cpu, 
  Layers,
  ArrowRight,
  Download
} from 'lucide-react';
import { Resume, CoverLetter } from '../types';
import { ApiService } from '../services/api';

interface ResumeStudioProps {
  userId: string;
  initialCompany?: string;
  initialRole?: string;
  resumes: Resume[];
  coverLetters: CoverLetter[];
  onSaveResume: (resume: Resume) => void;
  onSaveCoverLetter: (cl: CoverLetter) => void;
}

export const ResumeStudio: React.FC<ResumeStudioProps> = ({
  userId,
  initialCompany = '',
  initialRole = '',
  resumes,
  coverLetters,
  onSaveResume,
  onSaveCoverLetter
}) => {
  const [activeMode, setActiveMode] = useState<'cover_letter' | 'resume'>('cover_letter');

  // Cover Letter state
  const [selectedClId, setSelectedClId] = useState<string>(coverLetters[0]?.id || 'new');
  const [companyName, setCompanyName] = useState(initialCompany || coverLetters[0]?.companyName || '현대모비스');
  const [jobRole, setJobRole] = useState(initialRole || coverLetters[0]?.jobRole || '전장 제어기 HW/SW 엔지니어');
  const [questionTitle, setQuestionTitle] = useState(
    coverLetters[0]?.questionTitle || '지원 분야에 필요한 직무 역량을 쌓기 위해 노력한 경험과 실제 문제 해결 사례를 기술해 주십시오.'
  );
  const [content, setContent] = useState(coverLetters[0]?.originalContent || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Resume state
  const [currentResume, setCurrentResume] = useState<Resume>(
    resumes[0] || {
      id: 'res_new',
      title: '공학 엔지니어 표준 이력서',
      summary: '',
      education: [],
      techStack: [],
      tools: [],
      projects: [],
      certifications: [],
      updatedAt: new Date().toISOString()
    }
  );

  // Character count calculation
  const charCountWithSpace = content.length;
  const charCountNoSpace = content.replace(/\s/g, '').length;

  const handleReview = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    try {
      const res = await ApiService.reviewContent({
        type: 'cover_letter',
        content,
        companyName,
        jobRole,
        questionTitle
      });
      if (res.success && res.feedback) {
        setFeedback(res.feedback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveCoverLetter = () => {
    const cl: CoverLetter = {
      id: selectedClId === 'new' ? `cl_${Date.now()}` : selectedClId,
      companyName,
      jobRole,
      questionTitle,
      originalContent: content,
      aiFeedback: feedback || undefined,
      updatedAt: new Date().toISOString()
    };
    onSaveCoverLetter(cl);
    setSelectedClId(cl.id);
    alert('자기소개서가 사용자 계정에 안전하게 저장되었습니다.');
  };

  const handleApplyAlternative = (text: string) => {
    setContent(text);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 w-full space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs text-indigo-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>이력서 &amp; 자기소개서 스튜디오 — Gemini AI STAR 첨삭</span>
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              공학적 전문성을 살리는 <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">기술 자기소개서 &amp; 이력서</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              허위 스펙을 지어내지 않고, 지원자가 작성한 프로젝트와 기술 트러블슈팅 경험을 <strong>STAR(Situation-Task-Action-Result)</strong> 프레임워크와 
              <strong>수치화된 공학적 언어</strong>로 날카롭게 가다듬어 드립니다.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setActiveMode('cover_letter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'cover_letter'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              자기소개서 작성 &amp; AI 첨삭
            </button>
            <button
              onClick={() => setActiveMode('resume')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'resume'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              공학 엔지니어 이력서 관리
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODE 1: COVER LETTER STUDIO */}
      {/* ==================================================== */}
      {activeMode === 'cover_letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">자기소개서 에디터</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveCoverLetter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>저장하기</span>
                  </button>
                </div>
              </div>

              {/* Target Company & Job */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">지원 기업명</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="예: 현대자동차, 삼성전자"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">지원 직무</label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="예: 전장 제어기 HW/SW 설계"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Question Title */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-xs">자기소개서 문항</label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="자기소개서 문항 제목을 입력하세요"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              {/* Editor Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>작성 내용</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span>공백 포함: <strong className="text-cyan-400">{charCountWithSpace}</strong>자</span>
                    <span>•</span>
                    <span>공백 제외: <strong className="text-slate-200">{charCountNoSpace}</strong>자</span>
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="프로젝트 상황(Situation), 당면 과제(Task), 본인이 직접 수행한 엔지니어링 액션(Action), 정량적 결과(Result)를 중심으로 자유롭게 기술하세요..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-cyan-400 font-sans resize-y"
                />
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  * Gemini 3.8 Flash가 STAR 기법에 따른 문장 교정 및 공학 수치화 제안을 제공합니다.
                </span>

                <button
                  onClick={handleReview}
                  disabled={aiLoading || !content.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>첨삭 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini STAR 첨삭</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI STAR Feedback (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {feedback ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">STAR 공학 심사관 피드백</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    분석 완료
                  </span>
                </div>

                {/* STAR Evaluation Grid */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block">STAR 구조 평가</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-blue-400 block mb-0.5">S (상황)</span>
                      <p className="text-slate-300">{feedback.starEvaluation.situation}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-cyan-400 block mb-0.5">T (과제)</span>
                      <p className="text-slate-300">{feedback.starEvaluation.task}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-0.5">A (행동)</span>
                      <p className="text-slate-300">{feedback.starEvaluation.action}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-purple-400 block mb-0.5">R (결과)</span>
                      <p className="text-slate-300">{feedback.starEvaluation.result}</p>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>작성문의 공학적 강점</span>
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {feedback.strengths.map((str: string, idx: number) => (
                        <li key={idx} className="pl-1">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>수치화 및 보완 권장사항</span>
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {feedback.quantificationSuggestions.map((sug: string, idx: number) => (
                        <li key={idx} className="pl-1">{sug}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Polished Expressions */}
                {feedback.alternativeExpressions && feedback.alternativeExpressions.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-cyan-300 block">추천 공학적 문장 예시</span>
                    {feedback.alternativeExpressions.map((alt: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                          {alt}
                        </p>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleApplyAlternative(alt)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>이 문장으로 에디터에 적용</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">AI 첨삭 대기 중</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  좌측에서 본인의 자기소개서를 입력하고 [Gemini STAR 첨삭] 버튼을 누르면 정밀 공학 진단 리포트가 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: RESUME STUDIO */}
      {/* ==================================================== */}
      {activeMode === 'resume' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <span>공학 엔지니어 표준 이력서</span>
              </h3>
              <p className="text-xs text-slate-400">연구실 프로젝트, 하드웨어/소프트웨어 기술 스택 및 자격 증명</p>
            </div>

            <button
              onClick={() => {
                onSaveResume(currentResume);
                alert('이력서가 안전하게 저장되었습니다.');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>이력서 저장</span>
            </button>
          </div>

          {/* Resume Summary */}
          <div className="space-y-1.5 text-xs">
            <label className="block text-slate-400 font-semibold">전문 엔지니어 한 줄 자기소개</label>
            <input
              type="text"
              value={currentResume.summary}
              onChange={(e) => setCurrentResume({ ...currentResume, summary: e.target.value })}
              placeholder="전자전기공학 전공으로 모터 정밀 제어기 회로 설계 및 임베디드 펌웨어 최적화 역량을 갖춘 엔지니어입니다."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>학력 사항</span>
            </h4>
            {currentResume.education.map((edu, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">학교명</span>
                  <span className="font-semibold text-slate-200">{edu.school}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">전공 / 학위</span>
                  <span className="font-semibold text-slate-200">{edu.major} ({edu.degree})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">상태</span>
                  <span className="font-semibold text-slate-200">{edu.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">학점</span>
                  <span className="font-semibold text-cyan-400">{edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Projects with Engineering Problem Solved */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>엔지니어링 프로젝트 및 기술 문제 해결 (트러블슈팅)</span>
            </h4>
            <div className="space-y-3">
              {currentResume.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{proj.name}</span>
                    <span className="text-[11px] text-slate-400">{proj.period}</span>
                  </div>
                  <span className="text-cyan-400 text-[11px] font-semibold block">{proj.role}</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{proj.description}</p>
                  
                  {proj.achievements && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-amber-400 font-semibold text-[11px] block">핵심 성과 및 트러블슈팅:</span>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        {proj.achievements.map((ach, aIdx) => (
                          <li key={aIdx} className="pl-1">{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">자격증 및 어학</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentResume.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{cert.name}</span>
                  <span className="text-[11px] text-slate-400">{cert.issuer} ({cert.date})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
