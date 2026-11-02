/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Bookmark, 
  Newspaper, 
  Cpu, 
  FileText, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Check, 
  Users,
  Building2,
  GraduationCap
} from 'lucide-react';
import { UserProfile, Job, IndustryNews, CompanyAnalysis, Resume, CoverLetter } from '../types';

interface MyPageProps {
  currentUser: { id: string; email: string; name: string };
  profile: UserProfile;
  savedJobs: Job[];
  savedNews: IndustryNews[];
  savedAnalyses: CompanyAnalysis[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
  onUpdateProfile: (profile: UserProfile) => void;
  onRemoveJob: (job: Job) => void;
  onRemoveNews: (news: IndustryNews) => void;
  onRemoveAnalysis: (companyName: string) => void;
  onSwitchUser: (user: { id: string; email: string; name: string }) => void;
  onNavigateToCompany: (companyName: string) => void;
}

export const MyPage: React.FC<MyPageProps> = ({
  currentUser,
  profile,
  savedJobs,
  savedNews,
  savedAnalyses,
  resumes,
  coverLetters,
  onUpdateProfile,
  onRemoveJob,
  onRemoveNews,
  onRemoveAnalysis,
  onSwitchUser,
  onNavigateToCompany
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'jobs' | 'news' | 'analyses' | 'docs'>('profile');
  const [editingProfile, setEditingProfile] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editingProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* User Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
            {currentUser.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                {editingProfile.major}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RLS 사용자 데이터 격리 활성 (User ID: {currentUser.id})</span>
            </div>
          </div>
        </div>

        {/* Multi-user quick test selector */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">계정 전환:</span>
          <button
            onClick={() => onSwitchUser({ id: 'usr_demo_01', name: '김공학', email: 'kim.ee@engineer.ac.kr' })}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              currentUser.id === 'usr_demo_01'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            김공학(전자)
          </button>
          <button
            onClick={() => onSwitchUser({ id: 'usr_demo_02', name: '이기계', email: 'lee.mech@engineer.ac.kr' })}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              currentUser.id === 'usr_demo_02'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            이기계(기계)
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'profile'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>공학 프로필 관리</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'jobs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>저장된 채용공고 ({savedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('news')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'news'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>스크랩 산업 뉴스 ({savedNews.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analyses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'analyses'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>저장된 기업 분석 ({savedAnalyses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('docs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'docs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>작성 문서 ({resumes.length + coverLetters.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 1. Profile Tab */}
      {/* ==================================================== */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">공학 전공 및 기술 스펙 수정</h3>
              <p className="text-slate-400 text-[11px]">이 정보는 AI 기업 매칭 및 채용 추천 알고리즘의 기초 데이터로 활용됩니다.</p>
            </div>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>저장 완료!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">성명</label>
              <input
                type="text"
                value={editingProfile.fullName}
                onChange={(e) => setEditingProfile({ ...editingProfile, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">공학 전공</label>
              <input
                type="text"
                value={editingProfile.major}
                onChange={(e) => setEditingProfile({ ...editingProfile, major: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">학력 / 학위</label>
              <input
                type="text"
                value={editingProfile.degree}
                onChange={(e) => setEditingProfile({ ...editingProfile, degree: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">보유 공학 기술 (쉼표로 구분)</label>
              <input
                type="text"
                value={editingProfile.techSkills.join(', ')}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    techSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">사용 가능 프로그램 / EDA / CAD 툴 (쉼표로 구분)</label>
              <input
                type="text"
                value={editingProfile.tools.join(', ')}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">희망 직무 (쉼표로 구분)</label>
              <input
                type="text"
                value={editingProfile.desiredRoles.join(', ')}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    desiredRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">희망 지역 (쉼표로 구분)</label>
              <input
                type="text"
                value={editingProfile.desiredRegions.join(', ')}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    desiredRegions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              프로필 변경사항 저장
            </button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* 2. Saved Jobs */}
      {/* ==================================================== */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              저장된 채용공고가 없습니다. [채용정보 검색] 탭에서 관심 있는 공고의 북마크 아이콘을 눌러 저장해보세요.
            </div>
          ) : (
            savedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{job.company}</span>
                    <span className="text-slate-400">({job.location})</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{job.title}</h4>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {job.techStack?.slice(0, 4).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={job.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition-colors font-medium text-xs"
                  >
                    <span>원문 공고</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onRemoveJob(job)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="저장 취소"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. Saved News */}
      {/* ==================================================== */}
      {activeSubTab === 'news' && (
        <div className="space-y-3">
          {savedNews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              스크랩한 산업 뉴스가 없습니다. [Industry HINT] 탭에서 최신 뉴스를 검색하고 스크랩해보세요.
            </div>
          ) : (
            savedNews.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{news.press}</span>
                    <span className="text-slate-400">{news.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={news.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                    >
                      <span>원문 기사</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => onRemoveNews(news)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm">{news.title}</h4>

                {news.summaryLines && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    {news.summaryLines.map((line, idx) => (
                      <li key={idx} className="pl-1">{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. Saved Analyses */}
      {/* ==================================================== */}
      {activeSubTab === 'analyses' && (
        <div className="space-y-3">
          {savedAnalyses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              저장된 기업 분석 리포트가 없습니다. [기업 분석 대시보드] 탭에서 원하는 기업의 3-STEP 분석을 저장해보세요.
            </div>
          ) : (
            savedAnalyses.map((analysis) => (
              <div
                key={analysis.companyName}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">{analysis.companyName}</h4>
                  <p className="text-slate-400 text-[11px]">
                    지원직무: {analysis.step3_jobConnection.targetRole} • 분석일: {analysis.analyzedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToCompany(analysis.companyName)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 font-semibold"
                  >
                    대시보드 보기
                  </button>
                  <button
                    onClick={() => onRemoveAnalysis(analysis.companyName)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. Documents */}
      {/* ==================================================== */}
      {activeSubTab === 'docs' && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>작성된 이력서 및 자기소개서 문서</span>
            </h3>

            <div className="space-y-2 text-xs">
              {coverLetters.map((cl) => (
                <div key={cl.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{cl.companyName} - {cl.jobRole}</span>
                    <span className="text-slate-400 text-[11px]">{cl.questionTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{cl.updatedAt.split('T')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
