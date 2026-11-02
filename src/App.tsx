/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { JobSearch } from './components/JobSearch';
import { IndustryHint } from './components/IndustryHint';
import { CompanyAnalysis } from './components/CompanyAnalysis';
import { Recommendation } from './components/Recommendation';
import { ResumeStudio } from './components/ResumeStudio';
import { MyPage } from './components/MyPage';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthModal } from './components/AuthModal';
import { StorageService, DEFAULT_ENGINEER_PROFILE } from './lib/supabase';
import { Job, IndustryNews, CompanyAnalysis as CompanyAnalysisType, UserProfile, Resume, CoverLetter } from './types';
import { Layers, ShieldCheck, Database, Cpu, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('jobs');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string }>({
    id: 'usr_demo_01',
    name: '김공학',
    email: 'kim.ee@engineer.ac.kr'
  });

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_ENGINEER_PROFILE);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedNews, setSavedNews] = useState<IndustryNews[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<CompanyAnalysisType[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Transition parameters across tabs
  const [targetCompanyForAnalysis, setTargetCompanyForAnalysis] = useState<string>('삼성전자');
  const [targetRoleForAnalysis, setTargetRoleForAnalysis] = useState<string>('DRAM/HBM 회로설계');
  const [targetCompanyForResume, setTargetCompanyForResume] = useState<string>('');
  const [targetRoleForResume, setTargetRoleForResume] = useState<string>('');

  // Load user data on user switch (demonstrates RLS isolation)
  useEffect(() => {
    if (currentUser) {
      const userProf = StorageService.getProfile(currentUser.id);
      setProfile(userProf);
      setSavedJobs(StorageService.getSavedJobs(currentUser.id));
      setSavedNews(StorageService.getSavedNews(currentUser.id));
      setSavedAnalyses(StorageService.getSavedAnalyses(currentUser.id));
      setResumes(StorageService.getResumes(currentUser.id));
      setCoverLetters(StorageService.getCoverLetters(currentUser.id));
    }
  }, [currentUser]);

  // Handlers
  const handleToggleSaveJob = (job: Job) => {
    StorageService.toggleSaveJob(currentUser.id, job);
    setSavedJobs(StorageService.getSavedJobs(currentUser.id));
  };

  const handleToggleSaveNews = (news: IndustryNews) => {
    StorageService.toggleSaveNews(currentUser.id, news);
    setSavedNews(StorageService.getSavedNews(currentUser.id));
  };

  const handleSaveAnalysis = (analysis: CompanyAnalysisType) => {
    StorageService.saveCompanyAnalysis(currentUser.id, analysis);
    setSavedAnalyses(StorageService.getSavedAnalyses(currentUser.id));
  };

  const handleRemoveAnalysis = (companyName: string) => {
    StorageService.removeCompanyAnalysis(currentUser.id, companyName);
    setSavedAnalyses(StorageService.getSavedAnalyses(currentUser.id));
  };

  const handleSaveResume = (resume: Resume) => {
    StorageService.saveResume(currentUser.id, resume);
    setResumes(StorageService.getResumes(currentUser.id));
  };

  const handleSaveCoverLetter = (cl: CoverLetter) => {
    StorageService.saveCoverLetter(currentUser.id, cl);
    setCoverLetters(StorageService.getCoverLetters(currentUser.id));
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    StorageService.saveProfile(currentUser.id, updated);
    setProfile(updated);
  };

  // Cross-tab navigations
  const handleNavigateToCompany = (companyName: string, role?: string) => {
    setTargetCompanyForAnalysis(companyName);
    if (role) setTargetRoleForAnalysis(role);
    setActiveTab('company');
  };

  const handleNavigateToResume = (companyName: string, role?: string) => {
    setTargetCompanyForResume(companyName);
    if (role) setTargetRoleForResume(role);
    setActiveTab('resume');
  };

  const handleNavigateToJobs = (query: string) => {
    setActiveTab('jobs');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onLogout={() => {
          setCurrentUser({ id: 'usr_guest', name: '게스트', email: 'guest@engineer.ac.kr' });
        }}
        savedJobsCount={savedJobs.length}
        savedNewsCount={savedNews.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'jobs' && (
          <JobSearch
            userId={currentUser.id}
            savedJobs={savedJobs}
            onToggleSaveJob={handleToggleSaveJob}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToResume={handleNavigateToResume}
          />
        )}

        {activeTab === 'hint' && (
          <IndustryHint
            userId={currentUser.id}
            savedNews={savedNews}
            onToggleSaveNews={handleToggleSaveNews}
            onNavigateToCompany={handleNavigateToCompany}
          />
        )}

        {activeTab === 'company' && (
          <CompanyAnalysis
            userId={currentUser.id}
            initialCompany={targetCompanyForAnalysis}
            initialRole={targetRoleForAnalysis}
            savedAnalyses={savedAnalyses}
            onSaveAnalysis={handleSaveAnalysis}
            onNavigateToResume={handleNavigateToResume}
          />
        )}

        {activeTab === 'recommend' && (
          <Recommendation
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToJobs={handleNavigateToJobs}
            onNavigateToCompany={handleNavigateToCompany}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeStudio
            userId={currentUser.id}
            initialCompany={targetCompanyForResume}
            initialRole={targetRoleForResume}
            resumes={resumes}
            coverLetters={coverLetters}
            onSaveResume={handleSaveResume}
            onSaveCoverLetter={handleSaveCoverLetter}
          />
        )}

        {activeTab === 'mypage' && (
          <MyPage
            currentUser={currentUser}
            profile={profile}
            savedJobs={savedJobs}
            savedNews={savedNews}
            savedAnalyses={savedAnalyses}
            resumes={resumes}
            coverLetters={coverLetters}
            onUpdateProfile={handleUpdateProfile}
            onRemoveJob={handleToggleSaveJob}
            onRemoveNews={handleToggleSaveNews}
            onRemoveAnalysis={handleRemoveAnalysis}
            onSwitchUser={(user) => setCurrentUser(user)}
            onNavigateToCompany={handleNavigateToCompany}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 text-xs text-slate-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
              EJ
            </div>
            <span className="font-bold text-slate-300">ENGINEER JOB</span>
            <span>— Serverless AI 공학 취업·산업 분석 플랫폼</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Supabase RLS &amp; DB 구조
            </button>
            <span>•</span>
            <span>Gemini 3.8 Flash 연동</span>
            <span>•</span>
            <span>Vercel / Edge Serverless 아키텍처</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
