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
  // Enhanced verification & status fields
  recruitmentStatus: 'OPEN' | 'EXPIRED' | 'ALWAYS' | 'NEED_VERIFICATION';
  companyScale: '대기업' | '대기업 계열사' | '중견기업' | '중소/스타트업' | '공기업/공공기관' | '외국계';
  isLiveApi: boolean;
  verifiedDate: string;
  postedDate?: string;
  officialCareerUrl?: string;
  urlStatus: 'DIRECT_POSTING' | 'COMPANY_PORTAL' | 'SEARCH_PORTAL';
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
  publishedAtExact?: string;
  timeAgo?: string;
  isWithin24h?: boolean;
  isWithin7d?: boolean;
  isOverseas: boolean;
  originalUrl: string;
  industryCategory: string;
  summaryLines: string[]; // 3-line summary
  summaryBasis: string; // Explains grounded summary
  keywords: string[]; // 5 core keywords
  technicalTerms: TechnicalTerm[]; // Difficult jargon & easy explanation
  globalComparison?: string; // Domestic vs overseas tech comparison
  isSaved?: boolean;
  isRealFeed?: boolean;
}

export interface CompetitorItem {
  name: string;
  businessField: string;
  keyProducts: string;
  techStrength: string;
  marketEdge: string;
  selectionRationale?: string; // Rationale for competitor choice (e.g., product overlap)
}

export interface CompanyAnalysisSource {
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
}

export interface CompanyAnalysis {
  companyName: string;
  analyzedDate: string;
  sourceCredibility: string;
  dataSufficiency: 'HIGH' | 'MEDIUM' | 'LIMITED';
  companyIdentity: {
    scale: string;
    mainIndustry: string;
    headquarters: string;
    foundationYear?: string;
    officialCareersPortal?: string;
  };
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
  officialFacts: Array<{
    content: string;
    sourceTitle?: string;
    sourceUrl?: string;
    date?: string;
  }>;
  aiInferences: Array<{
    title: string;
    reasoning: string;
    candidateImplication: string;
  }>;
  sourcesConsulted: CompanyAnalysisSource[];
  unavailableInformation?: string[];
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
