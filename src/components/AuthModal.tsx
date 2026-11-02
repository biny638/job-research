/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, CheckCircle, Users } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { id: string; email: string; name: string }, profile?: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('기계공학과');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const userId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const userName = name || email.split('@')[0];
    onLoginSuccess({ id: userId, email, name: userName });
    onClose();
  };

  // Quick switch presets for testing multi-user data isolation
  const demoUsers = [
    {
      id: 'usr_demo_01',
      name: '김공학',
      email: 'kim.ee@engineer.ac.kr',
      major: '전자전기공학과',
      tag: '반도체/임베디드'
    },
    {
      id: 'usr_demo_02',
      name: '이기계',
      email: 'lee.mech@engineer.ac.kr',
      major: '기계항공공학과',
      tag: '로봇/열유체/CAE'
    },
    {
      id: 'usr_demo_03',
      name: '박화학',
      email: 'park.chem@engineer.ac.kr',
      major: '화학공학/신소재',
      tag: '배터리/공정기술'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isSignUp ? '공학 엔지니어 회원가입' : '엔지니어 계정 로그인'}
              </h3>
              <p className="text-xs text-slate-400">사용자별 데이터 분리 및 RLS 보안 적용</p>
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
        <div className="p-6 space-y-5">
          {/* Quick Demo Switcher (Crucial for testing multiple users) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Users className="w-3.5 h-3.5" />
              <span>다중 사용자 RLS 데이터 분리 빠른 테스트</span>
            </div>
            <p className="text-[11px] text-slate-400">
              아래 공학 프로필을 클릭하여 즉시 로그인하면 유저별로 격리된 이력서/저장공고를 확인하실 수 있습니다.
            </p>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onLoginSuccess({ id: u.id, email: u.email, name: u.name });
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      {u.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200">{u.name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">({u.major})</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                    {u.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">또는 이메일 직접 입력</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">이메일 계정</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@univ.ac.kr"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">공학 전공 분야</label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="전자전기공학과">전자전기공학과</option>
                  <option value="기계항공공학과">기계항공공학과</option>
                  <option value="컴퓨터공학 / 소프트웨어">컴퓨터공학 / 소프트웨어</option>
                  <option value="화학공학 / 고분자공학">화학공학 / 고분자공학</option>
                  <option value="신소재 / 재료공학과">신소재 / 재료공학과</option>
                  <option value="산업공학과 / 스마트제조">산업공학과 / 스마트제조</option>
                  <option value="바이오 / 의공학과">바이오 / 의공학과</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all shadow-md shadow-cyan-600/20"
            >
              {isSignUp ? '엔지니어 계정 생성 및 시작' : '로그인'}
            </button>
          </form>

          {/* Toggle SignUp / SignIn */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 공학 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
