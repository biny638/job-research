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
  internType?: '체험형 인턴' | '채용연계형 인턴' | '전환형 인턴' | '인턴';
  majorRequirement: string[];
  techStack: string[];
  deadline: string;
  originalUrl: string;
  source: string;
  description: string;
  responsibilities: string[];
  salary?: string;
  isSaved?: boolean;
  // Enhanced verification & status fields
  recruitmentStatus: 'OPEN' | 'EXPIRED' | 'ALWAYS' | 'NEED_VERIFICATION';
  companyScale: '대기업' | '대기업 계열사' | '중견기업' | '중소/스타트업' | '공기업/공공기관' | '외국계';
  isLiveApi: boolean;
  verifiedDate: string;
  postedDate?: string;
  officialCareerUrl?: string;
  urlStatus: 'DIRECT_POSTING' | 'COMPANY_PORTAL' | 'SEARCH_PORTAL';
  // New multi-provider collection fields
  providerType?: 'OFFICIAL_ATS' | 'JSON_LD' | 'VERIFIED_CATALOG' | 'WORK24' | 'SARAMIN_API';
  lastCheckedAt?: string;
}

export type SearchEmptyStateReason = 
  | 'NO_POSTINGS_FOUND'       // 1. 확인된 모집 공고 없음
  | 'SOURCE_NOT_CONNECTED'    // 2. 해당 기업의 채용 데이터 소스 미연결
  | 'ACCESS_RESTRICTED'       // 3. 외부 사이트 접근 제한
  | 'FETCH_FAILED';           // 4. 외부 데이터 조회 실패

export interface SearchEmptyFeedback {
  reason: SearchEmptyStateReason;
  reasonLabel: string;
  companyName?: string;
  message: string;
  technicalDetails?: string;
  officialCareerUrl?: string;
  links: Array<{ name: string; url: string; isOfficial: boolean }>;
}

export interface ExternalApiStatus {
  provider: string;
  configured: boolean;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'AUTH_ERROR' | 'FALLBACK_MODE';
  statusMessage: string;
  requiredEnv: string;
  guideUrl: string;
  callCount?: number;
}

export interface TechnicalTerm {
  term: string;
  explanation: string;
}

export interface NewsDetailedSection {
  topic: string;
  content: string;
}

export interface NewsCareerInsight {
  targetRoles: string[];
  requiredSkills: string[];
  preparationTips: string;
}

export interface NewsIndustryImpact {
  confirmedFacts: string[];
  futureProjections: string[];
}

export interface IndustryNews {
  id: string;
  title: string;
  press: string;
  publishedAt: string;
  publishedAtExact?: string;
  timeAgo?: string;
  isWithin24h?: boolean;
  isWithin48h?: boolean;
  isWithin72h?: boolean;
  isWithin7d?: boolean;
  isOverseas: boolean;
  originalUrl: string;
  industryCategory: string;
  // Core AI Summary (4~6 detailed sentences)
  comprehensiveSummary: string;
  summaryLines: string[]; // 3-line quick highlights
  // 5 Enhanced AI Deep Analysis Modules
  detailedSections?: NewsDetailedSection[];
  industryImpact?: NewsIndustryImpact;
  technicalTerms: TechnicalTerm[];
  careerInsights?: NewsCareerInsight;
  // Metadata & flags
  summaryBasis: string;
  keywords: string[];
  globalComparison?: string;
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
