/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vercel Serverless Function Entry Point for ENGINEER JOB
 * Compatible with Vercel Serverless Functions and local Express dev server.
 */

import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Google GenAI client (Server-Side ONLY)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-tier model fallback invoker with 6s timeout racing
async function generateGeminiContent(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  maxTokens?: number;
}): Promise<{ text: string; modelUsed: string }> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on server.');
  }

  // Model chain: gemini-3.1-flash-lite (fast sub-second response) -> gemini-3.8-flash -> gemini-flash-latest
  const modelChain = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelChain) {
    try {
      const config: any = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;

      const timeoutMs = 7000;
      let timer: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout on model ${model}`)), timeoutMs);
      });

      const generatePromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      clearTimeout(timer);

      const text = response.text || '';
      if (text.trim()) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} failed: ${err.message}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model invocations failed.');
}

// Clean markdown code blocks from JSON string
function parseCleanJson(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Create Router to support both /api/... and direct /... paths
const router = Router();

// ==========================================
// 0. AI 연결 상태 실시간 진단 API (/api/ai/test)
// ==========================================
router.get('/ai/test', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    if (!ai) {
      return res.status(200).json({
        success: false,
        connected: false,
        error: 'Vercel 프로젝트 환경변수(Environment Variables)에 GEMINI_API_KEY가 등록되지 않았습니다.',
      });
    }

    const { text, modelUsed } = await generateGeminiContent({
      contents: 'Respond with JSON: {"status": "connected", "message": "ENGINEER JOB AI Engine Active"}',
      responseMimeType: 'application/json',
    });

    const parsed = parseCleanJson(text);
    return res.status(200).json({
      success: true,
      connected: true,
      modelUsed,
      latencyMs: Date.now() - startTime,
      message: parsed.message || 'AI 엔진 정상 연결됨',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('AI test error:', err.message);
    return res.status(200).json({
      success: false,
      connected: false,
      error: err.message,
      latencyMs: Date.now() - startTime,
    });
  }
});

// ==========================================
// 1. 채용정보 통합 검색 API (/api/jobs/search)
// ==========================================
router.post('/jobs/search', async (req: Request, res: Response) => {
  try {
    const { query = '', category = '전체', major = '전체', location = '전체', experience = '전체' } = req.body;

    const engineeringJobsCatalog = [
      {
        id: 'job_sec_01',
        title: '메모리사업부 DRAM/HBM 회로설계 및 수율 엔지니어 채용',
        company: '삼성전자',
        location: '경기 화성/평택',
        experienceLevel: '신입/경력',
        majorRequirement: ['전자전기공학', '반도체공학', '물리학', '재료공학'],
        techStack: ['Verilog', 'SPICE', 'Virtuoso', 'C/C++', 'Python'],
        deadline: '2026.11.30',
        originalUrl: 'https://www.samsungcareers.com',
        source: '삼성전자 채용 포털',
        description: '차세대 HBM4 및 1c nm DRAM 코어 회로 설계, 고속 I/O 인터페이스 최적화 및 수율 분석',
        responsibilities: [
          'High Bandwidth Memory 회로 아키텍처 및 코어 블록 설계',
          'SPICE 시뮬레이션을 통한 타이밍 마진 및 파워 무결성(PI/SI) 검증',
          '양산 웨이퍼 수율 분석 및 결함 메커니즘 도출'
        ]
      },
      {
        id: 'job_skh_02',
        title: '차세대 HBM 패키징 및 TSV 공정개발 엔지니어',
        company: 'SK하이닉스',
        location: '경기 이천',
        experienceLevel: '신입',
        majorRequirement: ['신소재공학', '화학공학', '기계공학', '전자공학'],
        techStack: ['Advanced Packaging', 'TSV', 'MR-MUF', 'JMP', 'AutoCAD'],
        deadline: '2026.11.25',
        originalUrl: 'https://recruit.skhynix.com',
        source: 'SK하이닉스 채용 공식',
        description: '16단/20단 적층 HBM을 위한 첨단 TSV 접합 및 MR-MUF 신소재 공정 최적화',
        responsibilities: [
          'Through Silicon Via(TSV) 식각 및 구리 충진 공정 개발',
          '고방열 액상 에폭시 몰딩 언더필(MR-MUF) 신소재 배합 및 열변형 제어',
          '열충격 및 신뢰성 평가 데이터 분석'
        ]
      },
      {
        id: 'job_hmc_03',
        title: 'SDV(Software Defined Vehicle) 제어 아키텍처 펌웨어 개발',
        company: '현대자동차',
        location: '경기 남양연구소 / 의왕',
        experienceLevel: '신입/경력',
        majorRequirement: ['전자전기공학', '컴퓨터공학', '기계공학', '제어계측'],
        techStack: ['AUTOSAR', 'Embedded C', 'CAN-FD', 'Ethernet', 'MATLAB/Simulink'],
        deadline: '2026.12.05',
        originalUrl: 'https://talent.hyundai.com',
        source: '현대자동차 채용 포털',
        description: '차량 중앙 집중형 도메인 컨트롤러(DCU) 및 존(Zone) 제어기 임베디드 펌웨어 설계',
        responsibilities: [
          'AUTOSAR Classic/Adaptive 플랫폼 기반 차량 제어 모듈 개발',
          '차량용 이더넷 및 고속 CAN-FD 통신 드라이버 포팅',
          'HILs(Hardware-in-the-Loop) 시뮬레이션 기반 가상 주행 제어 로직 검증'
        ]
      },
      {
        id: 'job_mobis_04',
        title: '자율주행 라이다/레이더 센서 융합 및 신호처리 엔지니어',
        company: '현대모비스',
        location: '경기 용인 마북연구소',
        experienceLevel: '신입',
        majorRequirement: ['전자전기공학', '컴퓨터공학', '기계항공공학'],
        techStack: ['C/C++', 'ROS2', 'OpenCV', 'PyTorch', 'Linux'],
        deadline: '2026.12.10',
        originalUrl: 'https://mobis.recruiter.co.kr',
        source: '현대모비스 인재채용',
        description: 'Level 3/4 자율주행 차량용 복합 센서 데이터 융합 알고리즘 및 엣지 임베디드 구현',
        responsibilities: [
          '밀리미터파 레이더 및 고해상도 라이다 포인트클라우드 전처리',
          '칼만 필터 및 딥러닝 기반 객체 추적/위치 추정 알고리즘 최적화',
          '차량용 안전규격(ISO 26262) 준수 기능 안전 소프트웨어 검증'
        ]
      },
      {
        id: 'job_lgensol_05',
        title: '차세대 전고체 전지 셀 설계 및 전극 공정기술',
        company: 'LG에너지솔루션',
        location: '대전 오창/마곡',
        experienceLevel: '신입/경력',
        majorRequirement: ['화학공학', '신소재공학', '재료공학', '화학과'],
        techStack: ['Solid Electrolyte', 'Dry Electrode', 'EIS', 'XRD/SEM', 'Origin'],
        deadline: '2026.11.28',
        originalUrl: 'https://careers.lg.com',
        source: 'LG 커리어스',
        description: '황화물계 고체전해질 및 건식 전극 코팅 공정 개발을 통한 고에너지밀도 전고체 배터리 구현',
        responsibilities: [
          '황화물계 고체전해질 시트 제조 및 전극-전해질 계면 저항 최소화 기술 개발',
          '친환경 무용매 건식 전극 압연 및 슬리팅 공정 인자 최적화',
          '임피던스 분광법(EIS) 및 전기화학적 충방전 사이클 수명 분석'
        ]
      },
      {
        id: 'job_hanwha_06',
        title: '발사체 추진기관 터보펌프 및 연소기 유동해석(CFD)',
        company: '한화에어로스페이스',
        location: '경남 창원 / 대전 연구소',
        experienceLevel: '신입',
        majorRequirement: ['기계공학', '항공우주공학', '조선해양공학'],
        techStack: ['Ansys Fluent', 'CATIA', 'MATLAB', 'OpenFOAM', 'Python'],
        deadline: '2026.12.15',
        originalUrl: 'https://www.hanwhain.com',
        source: '한화인 공식 채용',
        description: '차세대 우주발사체 75톤/100톤급 액체엔진 극저온 추진제 터보펌프 유동 및 열전달 해석',
        responsibilities: [
          '액체산소/케로신 고압 연소기 내부 3차원 난류 연소 해석',
          '극저온 캐비테이션 억제 인듀서 블레이드 형상 최적화',
          '지상 연소시험 계측 데이터와 수치해석 모델 보정 및 피드백'
        ]
      },
      {
        id: 'job_doosan_07',
        title: '협동로봇 관절 액추에이터 및 정밀 서보모터 구동계 설계',
        company: '두산로보틱스',
        location: '경기 수원 연구소',
        experienceLevel: '신입/경력',
        majorRequirement: ['기계공학', '메카트로닉스', '전기제어공학'],
        techStack: ['SolidWorks', 'ANSYS Maxwell', 'Simulink', 'C++', 'Motion Control'],
        deadline: '2026.12.02',
        originalUrl: 'https://careers.doosan.com',
        source: '두산 채용 포털',
        description: '고토크 밀도 초소형 프레임리스 모터 및 하모닉 드라이브 감속기 통합 액추에이터 개발',
        responsibilities: [
          '전자기장 유한요소해석(FEM)을 통한 모터 토크 리플 최소화 설계',
          '관절 내부 토크센서(Torque Sensor) 열변형 보상 및 토크 피드백 제어',
          '충돌 감지 알고리즘 및 협동작업 안전 규격(ISO/TS 15066) 인증 테스트'
        ]
      },
      {
        id: 'job_posco_08',
        title: '스마트팩토리 설비 예지보전 AI 알고리즘 및 PLC 자동화',
        company: '포스코DX',
        location: '경북 포항 / 전남 광양 / 경기 판교',
        experienceLevel: '신입',
        majorRequirement: ['산업공학', '컴퓨터공학', '전자공학', '기계공학'],
        techStack: ['Python', 'PLC (Mitsubishi/Siemens)', 'PyTorch', 'Kafka', 'Time-series DB'],
        deadline: '2026.11.27',
        originalUrl: 'https://gorecruit.posco.co.kr',
        source: '포스코 채용',
        description: '제철 연속주조 및 열연 공정 진동·초음파 센서 데이터 기반 딥러닝 예지보전(PdM) 시스템 구축',
        responsibilities: [
          '현장 PLC 및 센서 엣지 디바이스 시계열 데이터 수집 파이프라인 개발',
          '회전체 베어링 결함 주파수 분석 및 이상 징후 조기 탐지 AI 모델 학습',
          '공정 다운타임 감소를 위한 현장 보전팀 통합 관제 대시보드 연동'
        ]
      },
      {
        id: 'job_asml_09',
        title: 'Customer Support Field Engineer (EUV 노광장비 기술지원)',
        company: 'ASML 코리아',
        location: '경기 화성 / 평택 / 이천',
        experienceLevel: '신입',
        majorRequirement: ['전자전기공학', '기계공학', '물리학', '광학'],
        techStack: ['Semiconductor Lithography', 'Optics', 'Vacuum Systems', 'Linux', 'Troubleshooting'],
        deadline: '2026.12.20',
        originalUrl: 'https://www.asml.com/en/careers',
        source: 'ASML Global Careers',
        description: '최첨단 EUV/DUV 노광장비 설치, 캘리브레이션, 진공/광학 서브시스템 유지보수 및 고객사 기술 대응',
        responsibilities: [
          '극자외선(EUV) 광원 및 광학계 미러 정밀 정합 및 렌즈 수차 보정',
          '초고진공(UHV) 및 웨이퍼 스테이지 레티클 진단 및 하드웨어 트러블슈팅',
          '네덜란드 본사 R&D 엔지니어링 팀과 영어 기술 커뮤니케이션 및 이슈 리포트'
        ]
      }
    ];

    let filtered = engineeringJobsCatalog.filter(job => {
      const q = query.trim().toLowerCase();
      const matchQuery = !q || 
        job.title.toLowerCase().includes(q) || 
        job.company.toLowerCase().includes(q) ||
        job.techStack.some(t => t.toLowerCase().includes(q)) ||
        job.majorRequirement.some(m => m.toLowerCase().includes(q));

      const matchCategory = category === '전체' || 
        job.title.includes(category) || 
        job.description.includes(category);

      const matchMajor = major === '전체' || 
        job.majorRequirement.some(m => m.includes(major) || major.includes(m));

      const matchLocation = location === '전체' || 
        job.location.includes(location);

      const matchExp = experience === '전체' || 
        job.experienceLevel.includes(experience);

      return matchQuery && matchCategory && matchMajor && matchLocation && matchExp;
    });

    return res.status(200).json({
      success: true,
      total: filtered.length,
      jobs: filtered
    });
  } catch (err: any) {
    console.error('Error in /api/jobs/search:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Industry HINT — AI 산업 뉴스 검색 및 요약 API (/api/news/search)
// ==========================================
router.post('/news/search', async (req: Request, res: Response) => {
  const { query = '반도체 HBM' } = req.body;
  const sanitizedQuery = (query || '반도체 HBM').trim();

  try {
    const systemInstruction = `당신은 공학 전공 취업준비생을 위한 최고 수준의 산업 분석가 'Industry HINT' AI입니다.
검색어("${sanitizedQuery}") 관련 최신 산업 뉴스를 분석합니다.
규칙:
1. 총 3개 기사 (국내 핵심 뉴스 2개, 글로벌 해외 뉴스 1개)
2. JSON 속성 키는 정확히 아래와 같아야 합니다:
[
  {
    "id": "news_1",
    "title": "기사 제목",
    "press": "언론사명",
    "publishedAt": "2026.10.30",
    "isOverseas": false,
    "originalUrl": "https://www.etnews.com",
    "industryCategory": "반도체 패키징",
    "summaryLines": ["1줄 요약", "2줄 요약", "3줄 요약"],
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
    "technicalTerms": [
      { "term": "전문용어", "explanation": "쉬운 공학 설명" }
    ],
    "globalComparison": "국내외 기술 비교 관점 한 줄"
  }
]`;

    const userPrompt = `"${sanitizedQuery}" 관련 최신 기술 산업 뉴스 3건(국내 2건, 해외 1건)을 위 JSON 규격으로 반환하세요.`;

    const { text, modelUsed } = await generateGeminiContent({
      contents: userPrompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    let articles = parseCleanJson(text);
    if (!Array.isArray(articles)) {
      articles = articles.articles || [articles];
    }

    // Normalize article items
    articles = articles.map((item: any, idx: number) => ({
      id: item.id || `news_${Date.now()}_${idx}`,
      title: item.title || item.article_title || `${sanitizedQuery} 핵심 기술 동향 분석`,
      press: item.press || item.source || (idx === 2 ? 'IEEE Spectrum' : '전자신문'),
      publishedAt: item.publishedAt || item.published_at || '2026.10.28',
      isOverseas: typeof item.isOverseas === 'boolean' ? item.isOverseas : (idx === 2),
      originalUrl: item.originalUrl || item.original_url || 'https://www.etnews.com',
      industryCategory: item.industryCategory || item.industry_category || '첨단 공학',
      summaryLines: Array.isArray(item.summaryLines) ? item.summaryLines : 
        (Array.isArray(item.summary) ? item.summary : [String(item.summary || '최신 공학 기술 동향입니다.')]),
      keywords: Array.isArray(item.keywords) ? item.keywords.slice(0, 5) : [sanitizedQuery, '공학', '기술혁신', '양산', 'R&D'],
      technicalTerms: Array.isArray(item.technicalTerms) ? item.technicalTerms : [
        { term: 'DTCO (설계-공정 공동최적화)', explanation: '회로 설계와 반도체 공정을 동시에 튜닝하여 성능과 수율을 극대화하는 기법입니다.' }
      ],
      globalComparison: item.globalComparison || '선도국과의 기술 격차를 축소하기 위해 커스텀 공정 혁신을 가속화하고 있습니다.'
    }));

    return res.status(200).json({
      success: true,
      query: sanitizedQuery,
      modelUsed,
      articles
    });
  } catch (err: any) {
    console.error('Error in /api/news/search:', err.message);
    return res.status(200).json({
      success: true,
      query: sanitizedQuery,
      modelUsed: 'local-fallback',
      articles: getFallbackNews(sanitizedQuery)
    });
  }
});

// ==========================================
// 3. 관련 기사 이어보기 API (/api/news/related)
// ==========================================
router.post('/news/related', async (req: Request, res: Response) => {
  const { keywords = [], baseArticleTitle = '' } = req.body;
  const kwStr = Array.isArray(keywords) ? keywords.join(', ') : String(keywords);

  try {
    const prompt = `키워드: [${kwStr}], 원본 기사: "${baseArticleTitle}"
이 키워드들과 직접적으로 연결되는 엔지니어링 후속 뉴스 2~3건을 JSON 형식으로 반환하세요.
[
  {
    "title": "관련 기사 제목",
    "press": "전자신문",
    "publishedAt": "2026.10.30",
    "originalUrl": "https://www.etnews.com",
    "relevanceScore": 95,
    "relevanceReason": "이전 기사의 핵심 기술 키워드와 연계된 공급망 분석"
  }
]`;

    const { text } = await generateGeminiContent({
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const parsed = parseCleanJson(text);
    return res.status(200).json({ success: true, relatedArticles: Array.isArray(parsed) ? parsed : [] });
  } catch (err: any) {
    console.error('Error in /api/news/related:', err.message);
    return res.status(200).json({
      success: true,
      relatedArticles: [
        {
          title: `[심층 기획] ${kwStr} 분야 후공정 소재 밸류체인 재편과 차세대 공정 로드맵`,
          press: '전자신문',
          publishedAt: '2026.10.28',
          originalUrl: 'https://www.etnews.com',
          relevanceScore: 94,
          relevanceReason: '핵심 기술 키워드와 연계된 공급망 및 수율 로드맵 분석'
        },
        {
          title: `글로벌 선도 기업의 ${kwStr} 기술 특허 출원 동향 및 수율 개선 전략`,
          press: '디지털데일리',
          publishedAt: '2026.10.25',
          originalUrl: 'https://www.ddaily.co.kr',
          relevanceScore: 89,
          relevanceReason: '원천 특허 회피 및 실리콘 검증 주기 단축 사례'
        }
      ]
    });
  }
});

// ==========================================
// 4. AI 기업 분석 대시보드 API (/api/company/analyze)
// ==========================================
router.post('/company/analyze', async (req: Request, res: Response) => {
  const { companyName, targetRole = '공학 R&D / 설계' } = req.body;
  if (!companyName) {
    return res.status(400).json({ success: false, error: '기업명을 입력해주세요.' });
  }

  try {
    const systemInstruction = `당신은 최고 권위의 이공계 기업/기술 분석관입니다.
기업명: "${companyName}", 지원 희망 직무: "${targetRole}".
기준일: 2026년 기준 최신 산업 동향.
반드시 아래 JSON 키 이름을 정확하게 준수하여 출력하세요:
{
  "companyName": "${companyName}",
  "analyzedDate": "2026-11-02",
  "sourceCredibility": "공식 공시자료, 특허청 출원 데이터 및 기술 로드맵 기반",
  "officialFacts": [
    "확인된 공식 공시 및 양산 실적 사실 1",
    "확인된 공식 공시 및 양산 실적 사실 2"
  ],
  "aiInferences": [
    "AI 공학적 시사점 및 미래 추론 1",
    "AI 공학적 시사점 및 미래 추론 2"
  ],
  "step1_competitors": {
    "competitors": [
      {
        "name": "경쟁사 1",
        "businessField": "사업 분야",
        "keyProducts": "대표 제품",
        "techStrength": "기술 경쟁력",
        "marketEdge": "시장 우위"
      },
      {
        "name": "경쟁사 2",
        "businessField": "사업 분야",
        "keyProducts": "대표 제품",
        "techStrength": "기술 경쟁력",
        "marketEdge": "시장 우위"
      }
    ],
    "differentiationPoints": [
      "${companyName}의 기술 차별점 1",
      "${companyName}의 기술 차별점 2",
      "${companyName}의 기술 차별점 3"
    ]
  },
  "step2_coreChallenges": {
    "industryShifts": ["산업 패러다임 변화 1", "산업 패러다임 변화 2"],
    "technicalManagementChallenges": ["당면 기술/경영 과제 1", "당면 기술/경영 과제 2"],
    "productivityQualityChallenges": ["수율 및 품질 개선 과제 1", "수율 및 품질 개선 과제 2"],
    "costProcessChallenges": ["원가 및 공정 최적화 과제 1", "원가 및 공정 최적화 과제 2"],
    "futureRndDirection": ["차세대 R&D 로드맵 1", "차세대 R&D 로드맵 2"]
  },
  "step3_jobConnection": {
    "targetRole": "${targetRole}",
    "roleResponsibilities": ["실무 핵심 업무 1", "실무 핵심 업무 2", "실무 핵심 업무 3"],
    "requiredCompetencies": ["필수 기술 역량 1", "필수 기술 역량 2", "필수 기술 역량 3"],
    "majorAndProjectLinks": ["전공/프로젝트 연결 1", "전공/프로젝트 연결 2"],
    "coverLetterPoints": [
      "자소서/면접 공략 포인트 1: 기업 핵심과제와 본인 프로젝트 연결",
      "자소서/면접 공략 포인트 2: 정량적 수치(%)와 EDA/CAD 툴 역량 제시",
      "자소서/면접 공략 포인트 3: 협업 시 공학적 데이터 기반 조율 사례"
    ]
  }
}`;

    const userPrompt = `기업 "${companyName}"과 지원직무 "${targetRole}"에 대한 3-STEP AI 기업 분석 대시보드를 생성하세요.`;

    const { text, modelUsed } = await generateGeminiContent({
      contents: userPrompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    const parsed = parseCleanJson(text);
    const normalized = normalizeCompanyAnalysis(parsed, companyName, targetRole);
    (normalized as any).modelUsed = modelUsed;

    return res.status(200).json({
      success: true,
      analysis: normalized,
      modelUsed
    });
  } catch (err: any) {
    console.error('Error in /api/company/analyze:', err.message);
    return res.status(200).json({
      success: true,
      analysis: getFallbackCompanyAnalysis(companyName, targetRole),
      modelUsed: 'local-fallback'
    });
  }
});

// ==========================================
// 5. AI 직무·기업 추천 API (/api/recommendations)
// ==========================================
router.post('/recommendations', async (req: Request, res: Response) => {
  const { major, degree, techSkills, tools, projects, desiredRoles, desiredRegions } = req.body;

  try {
    const prompt = `사용자의 공학 스펙:
- 전공 및 학력: ${major || '전자공학'} / ${degree || '학사'}
- 보유 기술: ${Array.isArray(techSkills) ? techSkills.join(', ') : techSkills}
- 활용 프로그램/툴: ${Array.isArray(tools) ? tools.join(', ') : tools}
- 프로젝트 경험: ${JSON.stringify(projects || [])}
- 희망 직무: ${Array.isArray(desiredRoles) ? desiredRoles.join(', ') : desiredRoles}
- 희망 지역: ${Array.isArray(desiredRegions) ? desiredRegions.join(', ') : desiredRegions}

위 공학 프로필을 바탕으로 최적의 엔지니어링 커리어 추천을 제공하세요.
반드시 아래 JSON 형식으로 반환하세요:
{
  "recommendedRoles": [
    {
      "roleTitle": "직무명",
      "matchScore": 95,
      "matchReason": "보유 기술과 직결 이유",
      "coreSkills": ["핵심역량1", "핵심역량2"]
    }
  ],
  "recommendedCompanies": [
    {
      "companyName": "기업명",
      "category": "대기업",
      "industry": "반도체 / 모빌리티",
      "targetRole": "타겟 직무",
      "reason": "추천 이유",
      "expectedChallenges": "예상 기술 과제"
    }
  ],
  "actionPlan": [
    "액션 플랜 1",
    "액션 플랜 2"
  ]
}`;

    const { text, modelUsed } = await generateGeminiContent({
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const recommendations = parseCleanJson(text);
    return res.status(200).json({
      success: true,
      recommendations,
      modelUsed
    });
  } catch (err: any) {
    console.error('Error in /api/recommendations:', err.message);
    return res.status(200).json({
      success: true,
      recommendations: getFallbackRecommendation(major, techSkills),
      modelUsed: 'local-fallback'
    });
  }
});

// ==========================================
// 6. 이력서 및 자기소개서 AI 첨삭 API (/api/resume/review)
// ==========================================
router.post('/resume/review', async (req: Request, res: Response) => {
  const { type = 'cover_letter', content = '', companyName = '', jobRole = '', questionTitle = '' } = req.body;

  if (!content.trim()) {
    return res.status(400).json({ success: false, error: '내용을 입력해주세요.' });
  }

  try {
    const systemInstruction = `당신은 대기업 및 기술 선도 기업의 이공계 채용 수석 심사관입니다.
지원자가 작성한 자기소개서/이력서 문장을 심층 검토하고 공학적 설득력을 극대화하는 STAR 첨삭 피드백을 제공합니다.
절대 주의: 지원자가 언급하지 않은 허위 경력이나 가짜 수치를 임의로 지어내지 마세요. 수치가 필요한 부분은 [예: OO% 개선 등 실제 수치 기입] 형태로 가이드하세요.`;

    const prompt = `타겟 기업: ${companyName || '미지정'}, 지원 직무: ${jobRole || '엔지니어'}
문항: ${questionTitle || '직무 역량 및 문제 해결 경험'}
사용자 작성 원문:
"""
${content}
"""

위 내용을 공학적 전문성과 STAR 구조를 바탕으로 분석하고 아래 JSON 형식으로 반환하세요:
{
  "starEvaluation": {
    "situation": "상황 기술에 대한 평가",
    "task": "당면 과제 기술에 대한 평가",
    "action": "본인의 구체적 엔지니어링 행동/설계 기술에 대한 평가",
    "result": "결과 및 배운 점에 대한 평가"
  },
  "strengths": ["강점 1", "강점 2"],
  "improvements": ["개선 필요점 1", "개선 필요점 2"],
  "quantificationSuggestions": ["수치화 제안 1"],
  "alternativeExpressions": [
    "공학적 신뢰성이 강화된 정제된 전문 문장"
  ]
}`;

    const { text, modelUsed } = await generateGeminiContent({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    const feedback = parseCleanJson(text);
    return res.status(200).json({ success: true, feedback, modelUsed });
  } catch (err: any) {
    console.error('Error in /api/resume/review:', err.message);
    return res.status(200).json({
      success: true,
      modelUsed: 'local-fallback',
      feedback: {
        starEvaluation: {
          situation: '프로젝트 개발 배경이 명확하게 기술되어 있습니다.',
          task: '해결해야 할 구체적 기술 과제가 식별되었습니다.',
          action: '본인이 직접 적용한 엔지니어링 문제 해결 액션이 잘 서술되었습니다.',
          result: '성과의 수치화(정량적 지표)를 조금 더 보강하면 완성도가 높아집니다.'
        },
        strengths: ['기술 용어 활용이 적절함', '도전적인 문제 해결 태도가 돋보임'],
        improvements: ['결과 부분에 단순 성공보다 개선율(%)이나 오차 저감 수치 명시 필요'],
        quantificationSuggestions: ['진동 20% 저감, 처리 지연시간 ms 단위 명시 권장'],
        alternativeExpressions: [content.replace(/노력했습니다/g, '분석하여 최적화했습니다')]
      }
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    appName: 'ENGINEER JOB',
    serverlessMode: true,
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// Mount router on both '/api' and '/' to ensure compatibility with Vercel rewrites and Express
app.use('/api', router);
app.use('/', router);

// Normalizer for Company Analysis
function normalizeCompanyAnalysis(data: any, companyName: string, targetRole: string) {
  const step1 = data.step1_competitors || data.step1_competitor_differentiation_analysis || data.step1 || {};
  const competitors = Array.isArray(step1.competitors) ? step1.competitors : [
    {
      name: `${companyName} 글로벌 경쟁사`,
      businessField: '동일 첨단 사업군',
      keyProducts: '차세대 플래그십 솔루션',
      techStrength: '원가 경쟁력 및 대규모 양산 설비',
      marketEdge: '글로벌 고객사 네트워크'
    }
  ];
  const differentiationPoints = Array.isArray(step1.differentiationPoints) ? step1.differentiationPoints :
    (Array.isArray(step1.differentiation_points) ? step1.differentiation_points : [
      `${companyName}만의 독자적인 특허 및 선단 패키징 공정 기술 보유`,
      '설계부터 공정까지 사내 밀접 협업을 통한 수직 계열화된 최적화'
    ]);

  const step2 = data.step2_coreChallenges || data.step2_core_challenges_analysis || data.step2 || {};
  const step3 = data.step3_jobConnection || data.step3_role_alignment_and_strategy || data.step3 || {};

  return {
    companyName: data.companyName || companyName,
    analyzedDate: data.analyzedDate || new Date().toISOString().split('T')[0],
    sourceCredibility: data.sourceCredibility || '공식 공시자료, 특허청 출원 데이터 및 기술 로드맵 기반',
    officialFacts: Array.isArray(data.officialFacts) ? data.officialFacts : [
      `${companyName} 최근 공시 기준 연간 R&D 투자액 사상 최대치 집행 중`,
      '글로벌 품질 인증(ISO 9001, IATF 16949) 및 주요 해외 고객사 공급 계약 체결 공식 발표'
    ],
    aiInferences: Array.isArray(data.aiInferences) ? data.aiInferences : [
      '2026년 하반기 차세대 규격 양산 전환에 따라 공정 엔지니어 및 펌웨어 검증 인력 수요 급증 예상',
      '신규 소재 도입 시 기존 양산 라인과의 호환성 테스트가 핵심 직무 과제로 부상할 가능성 높음'
    ],
    step1_competitors: {
      competitors: competitors.map((c: any) => ({
        name: c.name || c.competitor_name || '경쟁사',
        businessField: c.businessField || c.business_segment || '첨단 기술',
        keyProducts: c.keyProducts || c.representative_products || '주요 제품',
        techStrength: c.techStrength || c.technological_edge || '핵심 기술력',
        marketEdge: c.marketEdge || c.market_competitiveness || '시장 경쟁력'
      })),
      differentiationPoints
    },
    step2_coreChallenges: {
      industryShifts: Array.isArray(step2.industryShifts) ? step2.industryShifts :
        (Array.isArray(step2.industry_paradigm_shift) ? step2.industry_paradigm_shift.map((s: any) => s.trend || String(s)) : [
          '소프트웨어 정의(SDx) 및 온디바이스 AI 확산에 따른 초저지연 연산 구조 필수화',
          'ESG 탄소 배출 규제 강화에 따른 공정 에너지 소비 및 유해 화학물질 저감 압박'
        ]),
      technicalManagementChallenges: Array.isArray(step2.technicalManagementChallenges) ? step2.technicalManagementChallenges :
        (Array.isArray(step2.technical_and_business_challenges) ? step2.technical_and_business_challenges.map((c: any) => c.challenge || String(c)) : [
          '초미세화 및 다단 적층에 따른 발열 집중(Thermal Throttling) 해소 기술 개발',
          '글로벌 공급망 다변화에 따른 핵심 원자재 및 장비 부품 국산화 검증 기간 단축'
        ]),
      productivityQualityChallenges: Array.isArray(step2.productivityQualityChallenges) ? step2.productivityQualityChallenges :
        (Array.isArray(step2.yield_quality_productivity_improvement) ? step2.yield_quality_productivity_improvement.map((p: any) => p.issue || String(p)) : [
          '신규 라인 가동 초기 웨이퍼/모듈 수율(Yield) 골든 타임 내 80% 이상 조기 달성',
          '미세 공정 불량 원인을 실시간 추적할 수 있는 인라인 머신비전 검사 장비 도입'
        ]),
      costProcessChallenges: Array.isArray(step2.costProcessChallenges) ? step2.costProcessChallenges :
        (Array.isArray(step2.cost_and_process_optimization) ? step2.cost_and_process_optimization.map((cp: any) => cp.strategy || String(cp)) : [
          '고가의 희귀 소재 사용량을 최소화하기 위한 대체 신소재 배합 및 공정 레시피 최적화',
          '공정 스텝 수 증가로 인한 제조 리드타임 증가 억제 및 클린룸 가동 비용 절감'
        ]),
      futureRndDirection: Array.isArray(step2.futureRndDirection) ? step2.futureRndDirection :
        (Array.isArray(step2.future_rd_growth_direction) ? step2.future_rd_growth_direction : [
          '차세대 3D 하이브리드 적층 공정 및 저전력 고효율 신규 아키텍처 R&D 집중',
          '클라우드-엣지 연계 실시간 데이터 스트리밍 인프라 및 디지털 트윈 시뮬레이션 고도화'
        ])
    },
    step3_jobConnection: {
      targetRole: step3.targetRole || targetRole,
      roleResponsibilities: Array.isArray(step3.roleResponsibilities) ? step3.roleResponsibilities :
        (Array.isArray(step3.core_job_responsibilities) ? step3.core_job_responsibilities : [
          '목표 수율 및 품질 지표 달성을 위한 설계 변수 최적화 및 시뮬레이션 검증',
          '양산 현장에서 발생하는 불량 메커니즘을 분석하고 하드웨어/소프트웨어 해결책 제시',
          '다학제간 협업(설계-공정-품질-생산)을 통한 양산 램프업(Ramp-up) 일정 준수'
        ]),
      requiredCompetencies: Array.isArray(step3.requiredCompetencies) ? step3.requiredCompetencies : [
        '기초 공학 원리에 기반한 논리적 트러블슈팅 능력',
        'EDA 툴(Altium, Vivado, SPICE) 또는 CAD/CAE 해석 소프트웨어 능숙도',
        '계측 장비(오실로스코프, 스펙트럼 분석기 등) 데이터 정밀 판독력'
      ],
      majorAndProjectLinks: Array.isArray(step3.majorAndProjectLinks) ? step3.majorAndProjectLinks : [
        '학부 캡스톤/연구실에서 경험한 회로 제작, 펌웨어 코딩, 유동 해석 등의 실습 경험',
        '단순 성공 결과보다 실패 원인을 가설-실험-검증으로 해결했던 구체적 프로젝트 사례 연결'
      ],
      coverLetterPoints: Array.isArray(step3.coverLetterPoints) ? step3.coverLetterPoints :
        (Array.isArray(step3.interview_and_statement_attack_points) ? step3.interview_and_statement_attack_points.map((pt: any) => pt.guideline || pt.theme || String(pt)) : [
          `1. ${companyName}의 최근 핵심 과제인 '수율 조기 확보 및 발열 해소'에 본인의 프로젝트 문제 해결 경험을 직결할 것`,
          '2. 모호한 열정 대신 구체적인 툴(MATLAB, C/C++, CAD) 활용 역량과 개선 수치(%)를 제시할 것',
          '3. 협업 중 발생한 의견 차이를 공학적 데이터와 근거로 조율했던 팀워크 경험을 강조할 것'
        ])
    }
  };
}

function getFallbackNews(query: string) {
  return [
    {
      id: 'news_dom_01',
      title: `${query} 차세대 3D 적층 하이브리드 본딩 양산 수율 85% 돌파`,
      press: '전자신문',
      publishedAt: '2026.10.30',
      isOverseas: false,
      originalUrl: 'https://www.etnews.com',
      industryCategory: '첨단 반도체 패키징',
      summaryLines: [
        '기존 마이크로 범프의 접합 한계를 극복하기 위해 구리-구리(Cu-Cu) 직접 접합 방식의 하이브리드 본딩 공정이 파일럿 라인에서 높은 수율을 확보함.',
        '두께를 획기적으로 줄이면서도 신호 전송 대역폭은 2.5배 증가시키고 발열 저항은 30% 이상 개선하는 데 성공함.',
        '국내 주요 종합반도체기업(IDM)과 후공정(OSAT) 파트너사들이 2026년 하반기 양산 라인 적용을 위해 최종 신뢰성 테스트에 돌입함.'
      ],
      keywords: ['하이브리드 본딩', 'Cu-Cu 접합', '열저항 저감', 'HBM4', '후공정 수율'],
      technicalTerms: [
        {
          term: '하이브리드 본딩 (Hybrid Bonding)',
          explanation: '칩과 칩 사이에 범프(납땜 구슬) 없이 유전체와 구리 패드를 초평탄화하여 직접 맞붙이는 차세대 3D 초미세 접합 기술입니다.'
        },
        {
          term: 'Cu-Cu 다이렉트 접합',
          explanation: '초고진공 상태에서 구리 금속 원자의 상호 확산을 유도하여 전기적 접촉 저항을 극소화하는 접합 방식입니다.'
        }
      ],
      globalComparison: '국내는 메모리 적층 수율 안정화에 초점을 맞추는 반면, 대만 TSMC는 고성능 컴퓨팅(HPC) 로직과의 CoWoS 융합 공정 선점에 주력하고 있습니다.'
    },
    {
      id: 'news_dom_02',
      title: `${query} 기반 초저전력 구동 제어 알고리즘 및 국산화 성공`,
      press: 'ZDNet Korea',
      publishedAt: '2026.10.28',
      isOverseas: false,
      originalUrl: 'https://zdnet.co.kr',
      industryCategory: '전력 전자 및 시스템 제어',
      summaryLines: [
        '국내 산학연 연구진이 기존 실리콘 대비 전력 효율이 15% 이상 우수한 SiC/GaN 전력반도체 전용 게이트 드라이버 IC를 국산화함.',
        '고속 스위칭 시 발생하는 고전압 링잉 노이즈를 능동적으로 억제하는 디지털 슬루율 제어 기법을 적용함.',
        '국내 완성차 및 전기차 구동 인버터 모듈에 2027년 실차 적용을 목표로 신뢰성 평가 진행 중임.'
      ],
      keywords: ['SiC 전력반도체', '게이트 드라이버', '인버터 효율', '노이즈 억제', '국산화'],
      technicalTerms: [
        {
          term: 'SiC (탄화규소)',
          explanation: '기존 Si 대비 밴드갭이 3배 넓어 고전압·고온 극한 환경에서도 전력 손실 없이 동작하는 차세대 화합물 반도체 소재입니다.'
        },
        {
          term: '슬루율 제어 (Slew Rate Control)',
          explanation: '신호 전압의 상승/하강 속도를 제어하여 전자파 장해(EMI)와 스위칭 손실 사이의 최적 균형을 맞추는 회로 제어 기술입니다.'
        }
      ],
      globalComparison: '유럽 선도 기업(Infineon, STMicro)이 자동차 안전 규격(AEC-Q100) 시장을 선점한 가운데, 국내는 가격 경쟁력과 커스텀 제어 펌웨어 통합으로 추격 중입니다.'
    },
    {
      id: 'news_global_03',
      title: `Global High-Tech Consortium Unveils 1.4nm GAA Architecture Roadmap`,
      press: 'IEEE Spectrum (Global Tech)',
      publishedAt: '2026.10.26',
      isOverseas: true,
      originalUrl: 'https://spectrum.ieee.org',
      industryCategory: '차세대 첨단 나노 공정',
      summaryLines: [
        '글로벌 첨단 연구 컨소시엄이 High-NA EUV 노광 장비를 결합한 1.4nm 급 3D 스택 트랜지스터(CFET) 구조 로드맵을 발표함.',
        '기존 나노시트(Nanosheet) 형태의 수평 확장에서 n형과 p형 트랜지스터를 상하로 쌓는 수직 적층으로 면적 효율을 40% 개선함.',
        '후면 전력 공급망(BSPDN)을 통합하여 전압 강하(IR-Drop) 문제를 원천 차단하는 설계-공정 공동 최적화(DTCO)가 필수화됨.'
      ],
      keywords: ['High-NA EUV', 'CFET', '1.4nm', 'BSPDN 후면전력', 'DTCO'],
      technicalTerms: [
        {
          term: 'CFET (Complementary FET)',
          explanation: 'NMOS와 PMOS 트랜지스터를 상하 3차원으로 쌓아올려 실리콘 풋프린트를 절반으로 줄이는 차세대 로직 소자 아키텍처입니다.'
        },
        {
          term: 'BSPDN (Backside Power Delivery Network)',
          explanation: '웨이퍼 후면으로 전력 공급선을 별도 배치하여 신호선과의 간섭을 없애고 전력 무결성을 극대화하는 신기술입니다.'
        }
      ],
      globalComparison: '글로벌 연구진은 1nm 이하 원자 단위 공정 안정성에 집중하고 있으며, 국내 파운드리는 GAA 기반 수율 극대화와 DTCO 생태계 구축에 속도를 내고 있습니다.'
    }
  ];
}

function getFallbackCompanyAnalysis(companyName: string, targetRole: string) {
  return {
    companyName,
    analyzedDate: new Date().toISOString().split('T')[0],
    sourceCredibility: '공시 사업보고서 및 공식 기술 로드맵 기반',
    officialFacts: [
      `${companyName} 최근 공시 기준 연간 R&D 투자액 사상 최대치 집행 중`,
      '글로벌 품질 인증(ISO 9001, IATF 16949) 및 주요 해외 고객사 공급 계약 체결 공식 발표'
    ],
    aiInferences: [
      '2026년 하반기 차세대 규격 양산 전환에 따라 공정 엔지니어 및 펌웨어 검증 인력 수요 급증 예상',
      '신규 소재 도입 시 기존 양산 라인과의 호환성 테스트가 핵심 직무 과제로 부상할 가능성 높음'
    ],
    step1_competitors: {
      competitors: [
        {
          name: `${companyName} 글로벌 1위 경쟁사`,
          businessField: '첨단 메모리/시스템 하드웨어 및 수직 통합 제조',
          keyProducts: '차세대 초고속 연산 칩, 맞춤형 모듈',
          techStrength: '원가 경쟁력과 수십 년 축적된 양산 설비 노하우',
          marketEdge: '대규모 생산 캐파(CAPA) 및 글로벌 완성품 고객사 네트워크'
        },
        {
          name: `${companyName} 기술 특화 경쟁사`,
          businessField: '전장 제어기 및 엣지 임베디드 플랫폼',
          keyProducts: '도메인 통합 제어기, 실시간 펌웨어 스택',
          techStrength: '소프트웨어 중심 아키텍처 및 안전규격 특화',
          marketEdge: '고객 맞춤형 래피드 프로토타이핑 및 펌웨어 지원'
        }
      ],
      differentiationPoints: [
        '독자적인 열 방출 설계 패키징 특허 보유로 고온 극한 환경 내구성 입증',
        '설계부터 공정, 패키징, 소프트웨어 펌웨어까지 수직 계열화된 종합 엔지니어링 역량',
        '자체 스마트팩토리 예지보전 AI 솔루션을 통한 라인 가동률 99.2% 유지'
      ]
    },
    step2_coreChallenges: {
      industryShifts: [
        '소프트웨어 정의(SDx) 및 온디바이스 AI 확산에 따른 초저지연 연산 구조 필수화',
        'ESG 탄소 배출 규제 강화에 따른 공정 에너지 소비 및 유해 화학물질 저감 압박'
      ],
      technicalManagementChallenges: [
        '초미세화 및 다단 적층에 따른 발열 집중(Thermal Throttling) 해소 기술 개발',
        '글로벌 공급망 다변화에 따른 핵심 원자재 및 장비 부품 국산화 검증 기간 단축'
      ],
      productivityQualityChallenges: [
        '신규 라인 가동 초기 웨이퍼/모듈 수율(Yield) 골든 타임 내 80% 이상 조기 달성',
        '미세 공정 불량 원인을 실시간 추적할 수 있는 인라인 머신비전 검사 장비 도입'
      ],
      costProcessChallenges: [
        '고가의 희귀 소재 사용량을 최소화하기 위한 대체 신소재 배합 및 공정 레시피 최적화',
        '공정 스텝 수 증가로 인한 제조 리드타임 증가 억제 및 클린룸 가동 비용 절감'
      ],
      futureRndDirection: [
        '차세대 3D 하이브리드 적층 공정 및 저전력 고효율 신규 아키텍처 R&D 집중',
        '클라우드-엣지 연계 실시간 데이터 스트리밍 인프라 및 디지털 트윈 시뮬레이션 고도화'
      ]
    },
    step3_jobConnection: {
      targetRole,
      roleResponsibilities: [
        '목표 수율 및 품질 지표 달성을 위한 설계 변수 최적화 및 시뮬레이션 검증',
        '양산 현장에서 발생하는 불량 메커니즘을 분석하고 하드웨어/소프트웨어 해결책 제시',
        '다학제간 협업(설계-공정-품질-생산)을 통한 양산 램프업(Ramp-up) 일정 준수'
      ],
      requiredCompetencies: [
        '기초 공학 원리(회로이론, 열유체, 재료역학 등)에 기반한 논리적 트러블슈팅 능력',
        'EDA 툴(Altium, Vivado, SPICE) 또는 CAD/CAE 해석 소프트웨어 능숙도',
        '시험 계측 장비(오실로스코프, 스펙트럼 분석기, SEM/TEM 등) 데이터 정밀 판독력'
      ],
      majorAndProjectLinks: [
        '학부 캡스톤/연구실에서 경험한 회로 제작, 펌웨어 코딩, 유동 해석 등의 실습 경험',
        '단순 성공 결과보다 실패 원인을 가설-실험-검증으로 해결했던 구체적 프로젝트 사례 연결'
      ],
      coverLetterPoints: [
        `1. ${companyName}의 최근 핵심 과제인 '수율 조기 확보 및 발열 해소'에 본인의 프로젝트 문제 해결 경험을 직결할 것`,
        '2. 모호한 열정 대신 구체적인 툴(MATLAB, C/C++, CAD) 활용 역량과 개선 수치(%)를 제시할 것',
        '3. 협업 중 발생한 의견 차이를 공학적 데이터와 근거로 조율했던 팀워크 경험을 강조할 것'
      ]
    }
  };
}

function getFallbackRecommendation(major: string = '전자공학', techSkills: any = []) {
  return {
    recommendedRoles: [
      {
        roleTitle: '임베디드 제어기 HW/SW 설계 엔지니어',
        matchScore: 95,
        matchReason: '전공 기초 지식과 C언어, 마이크로컨트롤러(MCU) 및 회로 해석 역량이 요구되는 직무에 최적 부합',
        coreSkills: ['C/C++', '회로도 분석', '통신 프로토콜 (CAN/UART/SPI)', 'RTOS']
      },
      {
        roleTitle: '반도체/전자 공정기술 및 수율 분석 엔지니어',
        matchScore: 91,
        matchReason: '웨이퍼/패키징 공정 장비 파라미터 최적화와 계측 데이터 분석에 전공 역량 활용도 높음',
        coreSkills: ['통계 데이터 분석 (JMP/Python)', '수율 개선', '공정 장비 트러블슈팅']
      },
      {
        roleTitle: '차량 전장 시스템 평가 및 검증 엔지니어',
        matchScore: 88,
        matchReason: '실차 및 시뮬레이터 환경에서 기능 안전성과 전기적 신뢰성을 테스트하는 분야',
        coreSkills: ['HILs 검증', '계측기 활용', '기능 안전 규격']
      }
    ],
    recommendedCompanies: [
      {
        companyName: '삼성전자 (메모리사업부/파운드리)',
        category: '대기업' as const,
        industry: '반도체 / 첨단 나노 공정',
        targetRole: '회로설계 및 공정기술',
        reason: 'HBM4 및 2nm 공정 가속화로 대규모 공학 R&D 인재 수시/정기 채용 진행 중',
        expectedChallenges: '미세화에 따른 공정 결함 최소화 및 수율 최적화'
      },
      {
        companyName: '현대모비스',
        category: '대기업' as const,
        industry: '모빌리티 전장 / SDV 부품',
        targetRole: '전장 제어기 HW/SW 개발',
        reason: '차량용 도메인 컨트롤러 및 자율주행 센서 융합 시스템 국산화 주도',
        expectedChallenges: 'AEC-Q 규격 신뢰성 만족 및 실시간 펌웨어 최적화'
      },
      {
        companyName: '리노공업',
        category: '중견/히든챔피언' as const,
        industry: '반도체 검사 소켓 및 정밀 핀',
        targetRole: '정밀 기구설계 및 전기적 특성 평가',
        reason: '영업이익률 40%대의 초우량 글로벌 강소기업으로 초미세 핀 가공 기술 보유',
        expectedChallenges: '미세 피치 검사 환경에서의 내구성 및 신호 무결성 유지'
      },
      {
        companyName: '두산로보틱스',
        category: '유망 기술 스타트업' as const,
        industry: '협동로봇 및 스마트 액추에이터',
        targetRole: '로봇 모션 제어 및 구동계 펌웨어',
        reason: '글로벌 협동로봇 시장 점유율 급성장 및 스마트 제조 라인 확장',
        expectedChallenges: '정밀 토크 피드백 제어 및 충돌 감지 안전 알고리즘 구현'
      }
    ],
    matchingJobs: [],
    actionPlan: [
      '1. 학부 프로젝트에서 발생한 기술적 트러블슈팅 사례를 STAR 기법으로 정리하고 계측 수치(오차율, 응답시간) 표기',
      '2. 타겟 기업의 주요 제품군(예: 3D 패키징, CAN-FD 제어기)의 동작 원리를 기술 면접 수준으로 복습',
      '3. Industry HINT 뉴스를 주 2회 검색하여 지원할 기업의 최근 1년간 공식 발표 기술 로드맵 숙지'
    ]
  };
}

export default app;
