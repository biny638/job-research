/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Newspaper, 
  Cpu, 
  Sparkles, 
  FileText, 
  User, 
  Database,
  Layers,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { ApiService } from '../services/api';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'jobs', label: '채용정보 검색', icon: Briefcase, badge: savedJobsCount > 0 ? savedJobsCount : null },
    { id: 'hint', label: 'Industry HINT', icon: Newspaper, badge: 'AI 요약' },
    { id: 'company', label: '기업 분석 대시보드', icon: Cpu, badge: '3-STEP' },
    { id: 'recommend', label: 'AI 맞춤 추천', icon: Sparkles, badge: '공학 매칭' },
    { id: 'resume', label: '이력서·자소서 AI', icon: FileText, badge: 'STAR' },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleTestAi = async () => {
    alert('Gemini AI 및 Serverless API 연결 상태를 실시간 진단합니다...');
    try {
      const res = await ApiService.testAi();
      if (res.connected) {
        alert(
          `[AI 엔진 연결 성공!]\n` +
          `- 모델: ${res.modelUsed || 'Gemini Flash'}\n` +
          `- 응답 지연: ${res.latencyMs}ms\n` +
          `- 상태: ${res.message || '정상 작동'}\n\n` +
          `Vercel Serverless Function 및 Gemini API가 원활하게 작동 중입니다.`
        );
      } else {
        const errorDetail = res.error || 'AI 엔진 연결 대기 중';
        let guide = '';
        if (errorDetail.includes('GEMINI_API_KEY') || errorDetail.includes('환경변수')) {
          guide = '\n\n[조치 가이드]\nVercel 대시보드 -> Project Settings -> Environment Variables에 GEMINI_API_KEY를 등록하고 Redeploy를 진행해주세요.';
        } else if (errorDetail.includes('404')) {
          guide = '\n\n[조치 가이드]\nVercel Serverless 함수 경로(/api)를 찾지 못했습니다. vercel.json 배포 여부를 확인해주세요.';
        }
        alert(`[AI 진단 결과]\n${errorDetail}${guide}`);
      }
    } catch (e: any) {
      alert(`[AI 연결 오류] ${e.message || '네트워크 상태를 확인해주세요.'}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Name (Always single line, no vertical wrap) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 select-none" 
            onClick={() => handleNavClick('jobs')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 flex-shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col flex-shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black tracking-tight text-lg sm:text-xl bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
                  ENGINEER JOB
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30 whitespace-nowrap hidden xs:inline-block">
                  Serverless
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xl:block whitespace-nowrap">
                공학 전공자 &amp; 이공계 취업·산업 분석 플랫폼
              </p>
            </div>
          </div>

          {/* Desktop Navigation (Visible on lg: screens >= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold whitespace-nowrap ${
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

          {/* Right Action Bar (Compact & Responsive) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* AI Engine Status Button */}
            <button
              onClick={handleTestAi}
              title="Gemini AI 엔진 실시간 연결 진단"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">AI:</span>
              <span className="flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
                <span className="hidden sm:inline whitespace-nowrap">Gemini Flash</span>
                <span className="sm:hidden whitespace-nowrap">AI</span>
              </span>
            </button>

            {/* Supabase connection status button */}
            <button
              onClick={onOpenSupabaseModal}
              title="데이터베이스 및 RLS 보안 설정 확인"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">DB:</span>
              <span className="text-emerald-400 flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span className="hidden sm:inline whitespace-nowrap">{isSupabaseConfigured ? 'Supabase RLS' : '서버리스 DB'}</span>
                <span className="sm:hidden whitespace-nowrap">DB</span>
              </span>
            </button>

            {/* Auth status */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleNavClick('mypage')}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 border border-cyan-500/30 text-xs text-slate-200 hover:bg-slate-700/80 transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    {currentUser.name.slice(0, 1)}
                  </div>
                  <span className="hidden sm:inline max-w-[70px] truncate whitespace-nowrap">{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm transition-all flex-shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">로그인</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle (Visible below lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 ml-0.5"
              title="전체 메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Menu Tab Bar for Tablets & Mobile (< 1024px) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar flex-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-850/60 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && typeof item.badge === 'number' && (
                  <span className="text-[9px] px-1 rounded-full bg-blue-600 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Menu Drawer (When hamburger clicked) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-3 px-2 space-y-1 bg-slate-900/95 animate-in slide-in-from-top-2 duration-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-1">
              전체 메뉴 바로가기
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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
          </div>
        )}
      </div>
    </header>
  );
};
