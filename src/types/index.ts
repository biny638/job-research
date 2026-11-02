/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: '신입' | '경력' | '신입/경력' | '인턴' | string;
  majorRequirement: string[];
  techStack: string[];
  deadline: string;
  originalUrl: string;
  source: string;
  description: string;
  responsibilities: string[];
  isSaved?: boolean;
}

export interface TechnicalTerm {
  term: string;
  explanation: string;
}

export interface IndustryNews {
  id: string;
  title: string;
  press: string;
  publishedAt: string;
  isOverseas: boolean;
  originalUrl: string;
  industryCategory: string;
  summaryLines: string[]; // 3-line summary
  keywords: string[]; // 5 core keywords
  technicalTerms: TechnicalTerm[]; // Difficult jargon & easy explanation
  globalComparison?: string; // Domestic vs overseas tech comparison
  isSaved?: boolean;
}

export interface CompetitorItem {
  name: string;
  businessField: string;
  keyProducts: string;
  techStrength: string;
  marketEdge: string;
}

export interface CompanyAnalysis {
  companyName: string;
  analyzedDate: string;
  sourceCredibility: string;
  step1_competitors: {
    competitors: CompetitorItem[];
    differentiationPoints: string[];
  };
  step2_coreChallenges: {
    industryShifts: string[];
    technicalManagementChallenges: string[];
    productivityQualityChallenges: string[];
    costProcessChallenges: string[];
    futureRndDirection: string[];
  };
  step3_jobConnection: {
    targetRole: string;
    roleResponsibilities: string[];
    requiredCompetencies: string[];
    majorAndProjectLinks: string[];
    coverLetterPoints: string[];
  };
  officialFacts: string[];
  aiInferences: string[];
  isSaved?: boolean;
}

export interface Recommendation {
  recommendedRoles: Array<{
    roleTitle: string;
    matchScore: number;
    matchReason: string;
    coreSkills: string[];
  }>;
  recommendedCompanies: Array<{
    companyName: string;
    category: '대기업' | '중견/히든챔피언' | '유망 기술 스타트업';
    industry: string;
    targetRole: string;
    reason: string;
    expectedChallenges: string;
  }>;
  matchingJobs: Job[];
  actionPlan: string[];
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  period: string;
  techUsed: string[];
  description: string;
  problemSolved: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  major: string;
  degree: string;
  gpa: string;
  techSkills: string[];
  tools: string[];
  projects: ProjectExperience[];
  desiredRoles: string[];
  desiredRegions: string[];
}

export interface Resume {
  id: string;
  title: string;
  summary: string;
  education: Array<{
    school: string;
    major: string;
    degree: string;
    status: string;
    gpa: string;
  }>;
  techStack: string[];
  tools: string[];
  projects: Array<{
    id: string;
    name: string;
    period: string;
    role: string;
    description: string;
    techStack: string[];
    achievements: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  companyName: string;
  jobRole: string;
  questionTitle: string;
  originalContent: string;
  improvedContent?: string;
  aiFeedback?: {
    starEvaluation: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
    strengths: string[];
    improvements: string[];
    quantificationSuggestions: string[];
    alternativeExpressions: string[];
  };
  updatedAt: string;
}
