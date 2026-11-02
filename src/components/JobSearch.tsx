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
  ChevronDown
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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const categories = [
    '전체',
    '반도체 / 디스플레이',
    '모빌리티 / SDV',
    '이차전지 / 배터리',
    '로봇 / 제어 / 자동화',
    '소프트웨어 / 임베디드',
    '기계 / 항공우주'
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

  const experiences = ['전체', '신입', '경력', '신입/경력', '인턴'];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await ApiService.searchJobs({
        query,
        category: category === '전체' ? '' : category,
        major: major === '전체' ? '' : major,
        location: location === '전체' ? '' : location,
        experience: experience === '전체' ? '' : experience
      });
      if (res.success && res.jobs) {
        setJobs(res.jobs);
        if (res.jobs.length > 0 && !selectedJob) {
          setSelectedJob(res.jobs[0]);
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
  }, [category, major, location, experience]);

  const isSaved = (jobId: string) => savedJobs.some(j => j.id === jobId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs text-cyan-300 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>이공계 &amp; 엔지니어링 맞춤형 공고 통합 검색</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            대한민국 주요 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">엔지니어링 R&amp;D 및 생산기술</span> 채용 공고
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            전공, 다루는 엔지니어링 툴(Altium, CATIA, Verilog, C/C++), 거점 연구소/공장별로 실시간 검색하고 원문 링크와 AI 기업 분석으로 바로 연결하세요.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="기업명, 직무 키워드, 기술 스택 (예: 삼성전자 HBM, 모터 제어, 2차전지)..."
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
        </div>

        {/* Filter Selectors */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
            <label className="block text-slate-400 font-medium mb-1">경력 구분</label>
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
      </div>

      {/* Main Content Layout: Job List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Job Card List (5 or 6 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400">
              검색 결과 <strong className="text-cyan-400">{jobs.length}</strong>건
            </span>
            <span className="text-[11px] text-slate-500">외부 공식 포털 직결 원문 제공</span>
          </div>

          {jobs.length === 0 && !loading && (
            <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
              조건에 맞는 공고가 없습니다. 검색어나 필터를 변경해 보세요.
            </div>
          )}

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
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
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                        {job.company}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {job.experienceLevel}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveJob(job);
                      }}
                      title={saved ? '관심 공고 취소' : '관심 공고 저장'}
                      className={`p-1.5 rounded-lg border transition-colors ${
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

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      마감: {job.deadline}
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
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-cyan-400">{selectedJob.company}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      출처: {selectedJob.source}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleSaveJob(selectedJob)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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
                    <span className="font-semibold text-amber-400">{selectedJob.deadline}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">채용 형태</span>
                    <span className="font-semibold text-slate-200">정규직 (수시/공채)</span>
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

              {/* Action Buttons: Outbound URL + 1-Click Company Analysis + Cover Letter Studio */}
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

                <a
                  href={selectedJob.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20"
                >
                  <span>{selectedJob.company} 공식 채용 원문 바로가기</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              왼쪽 목록에서 공고를 선택하면 상세 직무 설명과 원문 링크를 확인할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
