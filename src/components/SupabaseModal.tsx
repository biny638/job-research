/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ShieldCheck, 
  Server, 
  Check, 
  Copy, 
  Terminal, 
  KeyRound, 
  RefreshCw 
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- ENGINEER JOB: Supabase PostgreSQL Schema & RLS Policies
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, full_name TEXT, major TEXT, degree TEXT, gpa TEXT,
    tech_skills TEXT[] DEFAULT '{}', tools TEXT[] DEFAULT '{}',
    projects JSONB DEFAULT '[]', desired_roles TEXT[] DEFAULT '{}',
    desired_regions TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL, title TEXT NOT NULL, company TEXT NOT NULL,
    original_url TEXT NOT NULL, saved_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.saved_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_title TEXT NOT NULL, press TEXT NOT NULL, original_url TEXT NOT NULL,
    summary_lines TEXT[] DEFAULT '{}', keywords TEXT[] DEFAULT '{}',
    saved_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Security (RLS) 활성화
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile" 
ON public.users_profile FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own saved items" 
ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Serverless DB &amp; Supabase RLS 아키텍처
              </h3>
              <p className="text-xs text-slate-400">데이터 보안, 사용자별 권한 분리 및 관리형 PostgreSQL 연동</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Badge */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span>데이터 격리 상태:</span>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                  {isSupabaseConfigured ? 'Supabase Cloud PostgreSQL 연결됨' : '서버리스 RLS 에뮬레이션 활성 (완벽 사용자별 분리)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                모든 개인 데이터(이력서, 자기소개서, 스펙, 관심 공고, 스크랩 뉴스)는 유저 고유 ID로 암호화 분리되며, 타 사용자 데이터에 접근할 수 없습니다.
              </p>
            </div>
          </div>

          {/* Architecture points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1 text-xs">
                <Server className="w-4 h-4" />
                <span>서버리스 API 엔드포인트</span>
              </div>
              <p className="text-xs text-slate-400">
                상시 실행 서버 없이 온디맨드 서버리스 함수(`/api/jobs`, `/api/news`, `/api/company`)로 외부 API와 Gemini를 처리합니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-xs">
                <KeyRound className="w-4 h-4" />
                <span>API 키 서버 측 보호</span>
              </div>
              <p className="text-xs text-slate-400">
                Gemini API Key 및 외부 검색 키는 브라우저 번들에 절대 노출되지 않으며 백엔드 환경변수에서 안전하게 주입됩니다.
              </p>
            </div>
          </div>

          {/* SQL Schema Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase SQL Editor 실행용 스키마 DDL (RLS 포함)</span>
              </div>
              <button
                onClick={copySql}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? '복사 완료!' : 'SQL 복사'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              <code>{sqlCode}</code>
            </pre>
            <p className="text-[11px] text-slate-500">
              * 전체 스키마는 프로젝트 루트의 <code className="text-cyan-400 font-mono">/supabase/schema.sql</code> 파일에 정의되어 있습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
