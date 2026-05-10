// === 공통 ===
export type EvidenceClause = {
  clause: string;
  page: number | null;
  snippet: string;
};

export type SuspiciousItem = {
  item: string;
  amount?: number;
  reason: string;
};

export type AgentMode = 'payment' | 'underwriting' | 'law_compare';

export type DemoStep =
  | 'idle'
  | 'intake'
  | 'parsing'
  | 'reasoning_1'
  | 'reasoning_2'
  | 'reasoning_3'
  | 'reasoning_4'
  | 'answering'
  | 'done';

// === 지급심사 ===
export type CoverageItem = {
  item: string;
  amount: number;
  clause: string;
  calc?: string;
};

export type PaymentAnswer = {
  decision: string;
  total_amount: number;
  coverage_breakdown: CoverageItem[];
  evidence_clauses: EvidenceClause[];
  suspicious_items: SuspiciousItem[];
  summary: string;
};

// === 가입심사 ===
export type UnderwritingCondition = {
  type: string;
  scope: string;
  reason: string;
};

export type UnderwritingAnswer = {
  decision: string;
  premium_monthly: number;
  underwriting_grade: string;
  discount_applied: string[];
  conditions_or_surcharge: UnderwritingCondition[];
  evidence_clauses: EvidenceClause[];
  suspicious_items: SuspiciousItem[];
  summary: string;
};

// === 법령개정 비교 ===
export type ChangedArticle = {
  article: string;
  change_type: string;
  before: string;
  after: string;
  effective_date: string;
};

export type BusinessImpact = {
  scope: string;
  impact: string;
  action_required: string;
};

export type LawCompareAnswer = {
  decision: string;
  summary: string;
  changed_articles: ChangedArticle[];
  business_impact: BusinessImpact[];
  suspicious_items: SuspiciousItem[];
};

// === 모드별 통합 ===
export type AgentAnswer = PaymentAnswer | UnderwritingAnswer | LawCompareAnswer;

export type ModeConfig = {
  mode: AgentMode;
  label: string;
  agentId: string;
  apiKey: string;
  defaultQuestion: string;
};
