/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Cpu, 
  Layers, 
  MapPin, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Target,
  FileText
} from 'lucide-react';
import { UserProfile, Recommendation as RecommendationType } from '../types';
import { ApiService } from '../services/api';

interface RecommendationProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToJobs: (query: string) => void;
  onNavigateToCompany: (companyName: string) => void;
}

export const Recommendation: React.FC<RecommendationProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigateToJobs,
  onNavigateToCompany
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationType | null>(null);

  // Skill tags helper
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !profile.techSkills.includes(newSkill.trim())) {
      const updated = { ...profile, techSkills: [...profile.techSkills, newSkill.trim()] };
      setProfile(updated);
      onUpdateProfile(updated);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    const updated = { ...profile, techSkills: profile.techSkills.filter(s => s !== skill) };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const addTool = () => {
    if (newTool.trim() && !profile.tools.includes(newTool.trim())) {
      const updated = { ...profile, tools: [...profile.tools, newTool.trim()] };
      setProfile(updated);
      onUpdateProfile(updated);
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    const updated = { ...profile, tools: profile.tools.filter(t => t !== tool) };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const handleRunMatch = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getRecommendations(profile);
      if (res.success && res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs text-cyan-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 맞춤 직무 &amp; 기업 추천 엔진</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            내 공학 역량(전공·툴·프로젝트)에 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">가장 적합한 기업과 포지션</span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            전자·기계·컴퓨터·화공 등 지원자의 전공, 다루는 엔지니어링 툴(MATLAB, Altium, CATIA, Vivado), 캡스톤 프로젝트 경험을 분석하여
            <strong>대기업·히든챔피언 중견기업·유망 스타트업</strong>까지 다각도로 최적의 커리어 로드맵을 제안합니다.
          </p>
        </div>
      </div>

      {/* Grid: Spec Input & Matching Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Engineering Profile Spec (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>지원자 공학 스펙 프로필</span>
              </h3>
              <span className="text-[11px] text-slate-400">마이페이지 연동</span>
            </div>

            {/* Basic Spec */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">공학 전공</label>
                <input
                  type="text"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  placeholder="예: 전자전기공학, 기계항공공학"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">학력/학위</label>
                  <input
                    type="text"
                    value={profile.degree}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">학점 (GPA)</label>
                  <input
                    type="text"
                    value={profile.gpa}
                    onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                    placeholder="3.8 / 4.5"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Tech Skills */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">보유 공학 기술 (언어/프레임워크)</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="기술 추가 (예: C/C++, Verilog, CAN)"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.techSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center gap-1"
                    >
                      <span>{s}</span>
                      <button onClick={() => removeSkill(s)} className="hover:text-rose-400">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Engineering Tools */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">엔지니어링 툴 및 시뮬레이터</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTool()}
                    placeholder="툴 추가 (예: MATLAB, Altium, Vivado)"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addTool}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-semibold"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1"
                    >
                      <span>{t}</span>
                      <button onClick={() => removeTool(t)} className="hover:text-rose-400">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects highlight */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  등록된 캡스톤/연구실 프로젝트 ({profile.projects.length}건)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {profile.projects.map((p, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      <span className="font-bold text-slate-200 block truncate">{p.name}</span>
                      <span className="text-slate-400 text-[10px] block truncate">{p.problemSolved}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunMatch}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI 공학 매칭 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>맞춤 직무 &amp; 기업 추천 실행</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recommendations Result (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {loading && (
            <div className="p-16 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-300">
                지원자의 공학 스펙과 2026년 기업별 양산 기술 로드맵을 교차 분석하고 있습니다...
              </p>
            </div>
          )}

          {!loading && recommendations && (
            <div className="space-y-5">
              {/* Recommended Roles */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">추천 엔지니어링 직무 (Match Score)</h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {recommendations.recommendedRoles.map((role, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{role.roleTitle}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          적합도 {role.matchScore}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {role.matchReason}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {role.coreSkills.map((sk, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                            #{sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Companies by Tier (대기업 / 중견 / 스타트업) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">기업군별 맞춤 추천 기업</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.recommendedCompanies.map((comp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-100">{comp.companyName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            comp.category === '대기업'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : comp.category === '중견/히든챔피언'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}>
                            {comp.category}
                          </span>
                        </div>

                        <span className="text-[11px] text-cyan-400 block font-medium">
                          {comp.industry} • {comp.targetRole}
                        </span>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {comp.reason}
                        </p>

                        <div className="p-2 rounded bg-slate-900 text-[11px] text-slate-400">
                          <span className="text-amber-400 font-semibold block">예상 기술 과제:</span>
                          {comp.expectedChallenges}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                        <button
                          onClick={() => onNavigateToCompany(comp.companyName)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                        >
                          <span>기업 3-STEP 분석</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onNavigateToJobs(comp.companyName)}
                          className="text-xs text-slate-400 hover:text-white font-medium"
                        >
                          관련 공고 검색
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              {recommendations.actionPlan && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>추천 기반 단기 액션 플랜</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside leading-relaxed">
                    {recommendations.actionPlan.map((action, aIdx) => (
                      <li key={aIdx} className="pl-1">{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!recommendations && !loading && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Sparkles className="w-10 h-10 text-cyan-500/70 mx-auto" />
              <h3 className="text-sm font-bold text-white">공학 프로필을 확인하고 추천을 실행하세요</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                좌측에서 전공과 활용 가능한 툴, 프로젝트를 점검한 후 [맞춤 직무 &amp; 기업 추천 실행] 버튼을 누르면 AI가 정밀 매칭을 시작합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
