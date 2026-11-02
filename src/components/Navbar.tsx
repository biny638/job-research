/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, 
  Newspaper, 
  Cpu, 
  Sparkles, 
  FileText, 
  User, 
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { id: string; email: string; name: string } | null;
  onOpenAuth: () => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
  savedJobsCount: number;
  savedNewsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenSupabaseModal,
  onLogout,
  savedJobsCount,
  savedNewsCount
}) => {
  const navItems = [
    { id: 'jobs', label: '채용정보 검색', icon: Briefcase, badge: savedJobsCount > 0 ? savedJobsCount : null },
    { id: 'hint', label: 'Industry HINT', icon: Newspaper, badge: 'AI 요약' },
    { id: 'company', label: '기업 분석 대시보드', icon: Cpu, badge: '3-STEP' },
    { id: 'recommend', label: 'AI 맞춤 추천', icon: Sparkles, badge: '공학 매칭' },
    { id: 'resume', label: '이력서·자소서 AI', icon: FileText, badge: 'STAR' },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  ENGINEER JOB
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  Serverless
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">공학 전공자 &amp; 이공계 취업·산업 분석 플랫폼</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        typeof item.badge === 'number'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-cyan-400 border border-cyan-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Engine Status Button */}
            <button
              onClick={async () => {
                alert('Gemini AI 연결 상태를 진단합니다...');
                const res = await (await fetch('/api/ai/test')).json();
                if (res.connected) {
                  alert(`[AI 연결 성공!]\n- 모델: ${res.modelUsed}\n- 응답 속도: ${res.latencyMs}ms\n- 상태: ${res.message}\nGemini API가 실시간 정상 작동 중입니다.`);
                } else {
                  alert(`[AI 진단 결과]\n- 상태: 로컬 백업 엔지니어링 모드 가동\n- 메시지: ${res.error || '연결 대기 중'}`);
                }
              }}
              title="Gemini AI 엔진 실시간 연결 진단"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">AI:</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Gemini 3.8 Flash
              </span>
            </button>

            {/* Supabase connection status button */}
            <button
              onClick={onOpenSupabaseModal}
              title="데이터베이스 및 RLS 보안 설정 확인"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">DB:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {isSupabaseConfigured ? 'Supabase RLS' : '서버리스 RLS DB'}
              </span>
            </button>

            {/* Auth status */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('mypage')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-cyan-500/30 text-xs text-slate-200 hover:bg-slate-700/80 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.slice(0, 1)}
                  </div>
                  <span className="max-w-[80px] truncate">{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>로그인 / 계정</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
