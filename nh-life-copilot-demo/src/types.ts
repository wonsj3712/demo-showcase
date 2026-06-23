// === 공통 ===
export type EvidenceClause = {
  clause: string;
  page: number | null;
  snippet: string;
};

export type AgentMode = 'copilot' | 'qa';

export type DemoStep =
  | 'idle'
  | 'intake'
  | 'retrieval'
  | 'reasoning_1'
  | 'reasoning_2'
  | 'reasoning_3'
  | 'reasoning_4'
  | 'answering'
  | 'done';

// === 모드 A: 설계사 코파일럿 ===
export type CoverageGap = {
  risk: string;        // 미보장 위험명
  current: string;     // 현재 보장 상태
  gap: string;         // 부족분
  clause: string;      // 근거 약관 조항
  page: number | null;
};

export type Recommendation = {
  product: string;     // 추천 상품/특약명
  reason: string;      // 추천 사유(갭과 연결)
  key_benefit: string; // 핵심 보장
  clause: string;
  page: number | null;
};

export type SalesScript = {
  situation: string;   // 상담 상황
  talk: string;        // 설계사 화법
  caution: string;     // 고지의무·규제 주의
};

export type CopilotAnswer = {
  decision: string;
  coverage_gaps: CoverageGap[];
  recommendations: Recommendation[];
  sales_script: SalesScript[];
  evidence_clauses: EvidenceClause[];
  summary: string;
};

// === 모드 B: 약관·심사 Q&A ===
export type QaAnswer = {
  answer: string;      // 마크다운 본문
  verdict: string;     // 지급가능 | 지급불가 | 조건부 | 해당없음
  evidence_clauses: EvidenceClause[];
  caution: string;
};

export type AgentAnswer = CopilotAnswer | QaAnswer;

// === 고객 프로필 (코파일럿 입력) ===
export type CustomerProfile = {
  id: string;
  name: string;        // 가명
  age: number;
  gender: string;      // 남 | 여
  job: string;
  joinDate: string;    // 가입시점 (예: 2022.03)
  contracts: string[]; // 보유 계약 칩 (상품·특약)
  interest: string;    // 관심사/상담 요청
  note: string;        // 사이드바 한줄 설명
};
