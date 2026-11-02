/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, Job, IndustryNews, CompanyAnalysis, Resume, CoverLetter } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent store keys for offline/local simulation
const STORAGE_PREFIX = 'engineer_job_';

export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  profile: UserProfile | null;
}

// Default initial demo user profile for engineering job seekers
export const DEFAULT_ENGINEER_PROFILE: UserProfile = {
  id: 'usr_demo_engineer_01',
  email: 'engineer.candidate@example.ac.kr',
  fullName: '김공학',
  major: '전자전기공학',
  degree: '학사 (졸업예정)',
  gpa: '3.92 / 4.5',
  techSkills: ['C/C++', 'Python', 'Verilog HDL', 'Embedded Linux', 'RTOS', 'CAN 통신'],
  tools: ['MATLAB / Simulink', 'Altium Designer', 'Vivado', 'Git', 'Keil MDK', 'Oscilloscope'],
  projects: [
    {
      id: 'proj_01',
      name: 'BLDC 모터 정밀 제어기 및 FOC 인버터 펌웨어 설계',
      role: '하드웨어 회로 설계 및 제어 알고리즘 펌웨어 개발',
      period: '2025.03 ~ 2025.10 (8개월)',
      techUsed: ['STM32F4', 'C언어', 'MATLAB', 'Altium', 'CAN'],
      description: '로봇 관절 구동용 3상 BLDC 모터의 정밀 벡터 제어(Field Oriented Control) 시스템 구현',
      problemSolved: '고속 회전 시 홀센서 지연으로 인한 역기전력 위상 오차 문제를 칼만 필터 기반 위상 추정 알고리즘을 적용하여 회전 안정성 24% 향상'
    },
    {
      id: 'proj_02',
      name: 'FPGA 기반 고속 신호 수집 및 DSP 필터링 모듈',
      role: 'Verilog RTL 설계 및 테스트벤치 검증',
      period: '2024.09 ~ 2024.12 (4개월)',
      techUsed: ['Xilinx Vivado', 'Verilog', 'ModelSim'],
      description: '초음파 센서 신호 처리를 위한 100MHz 32-tap FIR 필터 하드웨어 가속기 구현',
      problemSolved: '타이밍 바이오레이션(Setup Slack)을 해결하기 위해 3단 파이프라인 구조로 데이터 패스를 재설계하여 최대 동작 주파수 145MHz 달성'
    }
  ],
  desiredRoles: ['임베디드 SW 엔지니어', '디지털 회로/FPGA 설계', '전장 제어기 HW 개발'],
  desiredRegions: ['경기 판교/수원/화성', '서울 강남/양재', '대전 유성구']
};

export class StorageService {
  private static getKey(table: string, userId: string = 'global'): string {
    return `${STORAGE_PREFIX}${userId}_${table}`;
  }

  // --- Profile ---
  static getProfile(userId: string): UserProfile {
    const raw = localStorage.getItem(this.getKey('profile', userId));
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse local profile', e);
      }
    }
    return { ...DEFAULT_ENGINEER_PROFILE, id: userId };
  }

  static saveProfile(userId: string, profile: UserProfile): void {
    localStorage.setItem(this.getKey('profile', userId), JSON.stringify(profile));
  }

  // --- Saved Jobs ---
  static getSavedJobs(userId: string): Job[] {
    const raw = localStorage.getItem(this.getKey('saved_jobs', userId));
    return raw ? JSON.parse(raw) : [];
  }

  static toggleSaveJob(userId: string, job: Job): boolean {
    const jobs = this.getSavedJobs(userId);
    const index = jobs.findIndex(j => j.id === job.id);
    let isSavedNow = false;
    if (index >= 0) {
      jobs.splice(index, 1);
      isSavedNow = false;
    } else {
      jobs.unshift({ ...job, isSaved: true });
      isSavedNow = true;
    }
    localStorage.setItem(this.getKey('saved_jobs', userId), JSON.stringify(jobs));
    return isSavedNow;
  }

  // --- Saved News ---
  static getSavedNews(userId: string): IndustryNews[] {
    const raw = localStorage.getItem(this.getKey('saved_news', userId));
    return raw ? JSON.parse(raw) : [];
  }

  static toggleSaveNews(userId: string, news: IndustryNews): boolean {
    const list = this.getSavedNews(userId);
    const index = list.findIndex(n => n.id === news.id);
    let isSavedNow = false;
    if (index >= 0) {
      list.splice(index, 1);
      isSavedNow = false;
    } else {
      list.unshift({ ...news, isSaved: true });
      isSavedNow = true;
    }
    localStorage.setItem(this.getKey('saved_news', userId), JSON.stringify(list));
    return isSavedNow;
  }

  // --- Saved Company Analysis ---
  static getSavedAnalyses(userId: string): CompanyAnalysis[] {
    const raw = localStorage.getItem(this.getKey('analyses', userId));
    return raw ? JSON.parse(raw) : [];
  }

  static saveCompanyAnalysis(userId: string, analysis: CompanyAnalysis): void {
    const list = this.getSavedAnalyses(userId);
    const filtered = list.filter(a => a.companyName !== analysis.companyName);
    filtered.unshift({ ...analysis, isSaved: true });
    localStorage.setItem(this.getKey('analyses', userId), JSON.stringify(filtered));
  }

  static removeCompanyAnalysis(userId: string, companyName: string): void {
    const list = this.getSavedAnalyses(userId);
    const filtered = list.filter(a => a.companyName !== companyName);
    localStorage.setItem(this.getKey('analyses', userId), JSON.stringify(filtered));
  }

  // --- Resumes & Cover Letters ---
  static getResumes(userId: string): Resume[] {
    const raw = localStorage.getItem(this.getKey('resumes', userId));
    if (raw) return JSON.parse(raw);
    // Initial default
    const initialResume: Resume = {
      id: 'res_default_01',
      title: '하드웨어/임베디드 엔지니어 지원 이력서',
      summary: '전자전기공학 전공으로 회로 설계(Altium, Vivado) 및 RTOS/MCU 펌웨어 최적화 역량을 갖춘 엔지니어입니다.',
      education: [
        {
          school: '한국공과대학교',
          major: '전자전기공학과',
          degree: '학사',
          status: '졸업예정 (2026.02)',
          gpa: '3.92 / 4.5'
        }
      ],
      techStack: ['C/C++', 'Verilog', 'Python', 'STM32', 'CAN', 'I2C/SPI/UART'],
      tools: ['Vivado', 'Altium Designer', 'MATLAB', 'Git', 'Oscilloscope'],
      projects: [
        {
          id: 'proj_res_01',
          name: 'BLDC 모터 FOC 벡터 제어 시스템 개발',
          period: '2025.03 ~ 2025.10',
          role: '하드웨어 설계 및 C 펌웨어 코딩',
          description: 'STM32F4 기반 공간벡터 PWM(SVPWM) 제어 및 저항 분압 센싱 회로 구현',
          techStack: ['STM32', 'C', 'Altium'],
          achievements: [
            '저속 영역 토크 리플 18% 감소 달성',
            '과전류 차단 하드웨어 인터럽트 루틴으로 모터 드라이버 파손 방지'
          ]
        }
      ],
      certifications: [
        { name: '전자기사', issuer: '한국산업인력공단', date: '2025.06' },
        { name: 'TOEIC Speaking AL (170)', issuer: 'ETS', date: '2025.08' }
      ],
      updatedAt: new Date().toISOString()
    };
    return [initialResume];
  }

  static saveResume(userId: string, resume: Resume): void {
    const list = this.getResumes(userId);
    const idx = list.findIndex(r => r.id === resume.id);
    if (idx >= 0) {
      list[idx] = { ...resume, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...resume, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(this.getKey('resumes', userId), JSON.stringify(list));
  }

  static getCoverLetters(userId: string): CoverLetter[] {
    const raw = localStorage.getItem(this.getKey('cover_letters', userId));
    if (raw) return JSON.parse(raw);
    const initialCL: CoverLetter = {
      id: 'cl_default_01',
      companyName: '현대모비스',
      jobRole: '전장 제어기 HW/SW 엔지니어',
      questionTitle: '지원 분야에 필요한 직무 역량을 쌓기 위해 노력한 경험과 실제 문제 해결 사례를 기술해 주십시오.',
      originalContent: `학부 기간 동안 이론에 머무르지 않고 실제 하드웨어 제어기를 직접 설계하고 검증하는 역량을 키웠습니다. 캡스톤 디자인 프로젝트에서 'BLDC 모터 정밀 FOC 제어기' 개발을 담당했습니다.

개발 과정에서 모터 고속 회전 시 홀센서 신호 지연으로 인해 인버터 스위칭 위상이 어긋나 심한 진동과 발열이 발생하는 기술적 난관에 부딪혔습니다. 이를 해결하기 위해 디지털 신호 필터링 방식을 분석했고, 칼만 필터 알고리즘을 펌웨어에 적용하여 센서 노이즈를 제거하고 회전자의 실제 위치를 정밀 추정하도록 알고리즘을 개선했습니다. 

그 결과 고속 회전 시 진동을 24% 저감하고 전력 효율을 12% 향상시켰습니다. 이러한 하드웨어-소프트웨어 융합 문제 해결 역량을 바탕으로 현대모비스의 차세대 전장 제어기 신뢰성 향상에 기여하겠습니다.`,
      updatedAt: new Date().toISOString()
    };
    return [initialCL];
  }

  static saveCoverLetter(userId: string, cl: CoverLetter): void {
    const list = this.getCoverLetters(userId);
    const idx = list.findIndex(c => c.id === cl.id);
    if (idx >= 0) {
      list[idx] = { ...cl, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...cl, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(this.getKey('cover_letters', userId), JSON.stringify(list));
  }
}
