export type EmailCategory = 'FUND_INOUT' | 'NON_FUND' | 'PENDING';

export interface InboxEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  hasAttachment: boolean;
  category: EmailCategory;
  classifyReason: string;
  fundCase?: 'apollo' | 'kkr' | 'nippon' | 'tiger' | 'silverlake';
}

export type WorkflowStep =
  | 'idle'
  | 'classify'
  | 'parse'
  | 'code_search'
  | 'ontology'
  | 'normalize'
  | 'confirm'
  | 'done';

export interface ExtractionResult {
  fundManager: string;
  fundName: string;
  txnType: 'Capital Call' | 'Distribution';
  txnDate: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'JPY';
  investorCode: string;
  matchRowContext: string;
  matchConfidence: number;
  ontologyMappings: OntologyMapping[];
  rawHighlight: { page: number; bbox: [number, number, number, number] };
}

export interface OntologyMapping {
  sourceTerm: string;
  standardColumn: string;
  value: number | string;
}

export interface StandardFormRow {
  serial: number;
  processedAt: string;
  fundManager: string;
  fundName: string;
  txnType: 'Capital Call' | 'Distribution';
  txnDate: string;
  fxAmount: number;
  currency: 'USD' | 'EUR' | 'JPY';
  fxRate: number;
  krwAmount: number;
  cumulativeDrawn: number;
  cumulativeDistribution: number;
  investorCode: string;
  confirmStatus: '확인필요' | '확인완료' | '보류';
  note: string;
}

export type AgentRole = 'inbox' | 'extractor' | 'normalizer';
