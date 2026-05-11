import type { InboxEmail, ExtractionResult, StandardFormRow } from './types';

export const INBOX_EMAILS: InboxEmail[] = [
  {
    id: 'M1_01',
    from: 'Apollo Investor Relations',
    subject: '[Capital Call Notice] Apollo Global PE Fund VIII — Call #12',
    preview: 'Dear Limited Partner, please find attached Capital Call Notice #12. Due: 2026-04-08. Amount: USD 4,500,000...',
    receivedAt: '2026-05-12 09:14',
    hasAttachment: true,
    category: 'FUND_INOUT',
    classifyReason: 'Capital Call 명시 · 펀드 IR 발신 · 첨부 PDF',
    fundCase: 'apollo',
  },
  {
    id: 'M1_02',
    from: 'KKR Investor Services',
    subject: 'Common Distribution Notice — Q1 2026 (All LPs)',
    preview: 'Each Investor is identified by an internal Investor Code only. Please refer to the row matching your code on file...',
    receivedAt: '2026-05-12 09:32',
    hasAttachment: true,
    category: 'FUND_INOUT',
    classifyReason: 'Distribution Notice · 공통 노티스 · S23 코드 검색 필요',
    fundCase: 'kkr',
  },
  {
    id: 'M1_03',
    from: 'Nippon PE Partners',
    subject: 'Drawdown #5 — Nippon Private Equity Partners Fund III (JPY)',
    preview: 'Kindly find the JPY-denominated Drawdown #5 notice attached. Funding due: 2026-04-30. JPY 360,000,000...',
    receivedAt: '2026-05-12 10:05',
    hasAttachment: true,
    category: 'FUND_INOUT',
    classifyReason: 'Drawdown Notice · JPY 통화',
    fundCase: 'nippon',
  },
  {
    id: 'M1_04',
    from: 'IT 지원팀',
    subject: '[안내] 4월 사내 시스템 정기 점검 안내',
    preview: '안녕하세요, IT지원팀입니다. 2026-04-18(토) 02:00~06:00 사내 시스템 정기 점검이 있습니다...',
    receivedAt: '2026-05-12 10:21',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '사내 IT 공지',
  },
  {
    id: 'M1_05',
    from: '인사팀',
    subject: '[교육] 2분기 의무 정보보안 교육 안내',
    preview: '전 임직원 대상 2분기 의무 정보보안 교육 일정을 안내드립니다...',
    receivedAt: '2026-05-12 10:48',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '사내 인사 공지',
  },
  {
    id: 'M1_06',
    from: 'Bloomberg Newsletter',
    subject: 'Asia Markets Daily — May 12, 2026',
    preview: "Today's key headlines from Bloomberg Asia Markets...",
    receivedAt: '2026-05-12 11:02',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '뉴스레터',
  },
  {
    id: 'M1_07',
    from: 'Asia PE Forum',
    subject: "You're Invited: Asia Private Equity Forum 2026",
    preview: 'Dear colleague, we cordially invite you to the Asia Private Equity Forum 2026 in Hong Kong on June 12-13...',
    receivedAt: '2026-05-12 11:30',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '컨퍼런스 초대 (관련 분야지만 입출금 아님)',
  },
  {
    id: 'M1_08',
    from: '준법감시인',
    subject: '[보고] 1분기 해외투자 컴플라이언스 점검 결과',
    preview: '귀 부서의 1분기 해외투자 관련 컴플라이언스 점검 결과를 공유드립니다...',
    receivedAt: '2026-05-12 13:15',
    hasAttachment: true,
    category: 'NON_FUND',
    classifyReason: '컴플라이언스 보고 (업무 관련이지만 입출금 아님)',
  },
  {
    id: 'M1_09',
    from: 'Market Data Vendor',
    subject: '[견적] 시장데이터 구독 갱신 견적 송부의 건',
    preview: '안녕하십니까, 시장데이터 구독 갱신 견적을 송부드립니다...',
    receivedAt: '2026-05-12 13:42',
    hasAttachment: true,
    category: 'NON_FUND',
    classifyReason: '벤더 견적',
  },
  {
    id: 'M1_10',
    from: 'Corporate Travel',
    subject: 'Your booking confirmation — Tokyo trip Apr 22-25',
    preview: 'Dear traveler, your booking for the Tokyo trip is confirmed...',
    receivedAt: '2026-05-12 14:10',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '출장 예약',
  },
];

export const EXTRACTION_RESULTS: Record<string, ExtractionResult> = {
  M1_01: {
    fundManager: 'Apollo Management Holdings, L.P.',
    fundName: 'Apollo Global Private Equity Fund VIII, L.P.',
    txnType: 'Capital Call',
    txnDate: '2026-04-08',
    amount: 4500000,
    currency: 'USD',
    investorCode: 'APO-VIII-LP-0083',
    matchRowContext: 'Investor Name: Samsung Fire & Marine Insurance Co., Ltd. · Investor ID: APO-VIII-LP-0083',
    matchConfidence: 99.9,
    ontologyMappings: [
      { sourceTerm: 'Capital Call', standardColumn: 'this_txn_type', value: 'Capital Call' },
      { sourceTerm: 'Due Date', standardColumn: 'this_txn_date', value: '2026-04-08' },
      { sourceTerm: 'Amount Called', standardColumn: 'this_txn_amount', value: 4500000 },
      { sourceTerm: 'Commitment', standardColumn: 'commitment', value: 50000000 },
      { sourceTerm: 'Drawn-to-Date', standardColumn: 'cumulative_drawn', value: 32500000 },
    ],
    rawHighlight: { page: 1, bbox: [180, 320, 420, 360] },
  },
  M1_02: {
    fundManager: 'Kohlberg Kravis Roberts & Co. L.P.',
    fundName: 'KKR Asian Fund III, L.P.',
    txnType: 'Distribution',
    txnDate: '2026-04-15',
    amount: 72420,
    currency: 'USD',
    investorCode: 'S23',
    matchRowContext: 'S23 | 2.40% | 85,200.00 | 12,780.00 | 72,420.00 | PENDING (row 22 of 30)',
    matchConfidence: 99.8,
    ontologyMappings: [
      { sourceTerm: 'Distribution Date', standardColumn: 'this_txn_date', value: '2026-04-15' },
      { sourceTerm: 'Net (USD)', standardColumn: 'this_txn_amount', value: 72420 },
      { sourceTerm: 'Allocation %', standardColumn: 'allocation_pct', value: 2.4 },
      { sourceTerm: 'Wire Status: PENDING', standardColumn: 'wire_status', value: 'PENDING' },
    ],
    rawHighlight: { page: 1, bbox: [60, 540, 540, 560] },
  },
  M1_03: {
    fundManager: 'Nippon PE Partners Management Co., Ltd.',
    fundName: 'Nippon Private Equity Partners Fund III, L.P.',
    txnType: 'Capital Call',
    txnDate: '2026-04-30',
    amount: 360000000,
    currency: 'JPY',
    investorCode: 'NPE-III-LP-S23',
    matchRowContext: 'Investor: Samsung Fire & Marine · Investor Reference: NPE-III-LP-S23 · This Drawdown: JPY 360,000,000',
    matchConfidence: 99.7,
    ontologyMappings: [
      { sourceTerm: 'Drawdown', standardColumn: 'this_txn_type', value: 'Capital Call' },
      { sourceTerm: 'Funding Due', standardColumn: 'this_txn_date', value: '2026-04-30' },
      { sourceTerm: 'This Drawdown', standardColumn: 'this_txn_amount', value: 360000000 },
      { sourceTerm: 'Total Commitment', standardColumn: 'commitment', value: 4500000000 },
      { sourceTerm: 'Cumulative After Call', standardColumn: 'cumulative_drawn', value: 3285000000 },
    ],
    rawHighlight: { page: 1, bbox: [220, 280, 480, 320] },
  },
};

export const FX_RATES: Record<'USD' | 'EUR' | 'JPY', number> = {
  USD: 1372.5,
  EUR: 1490.2,
  JPY: 9.45,
};

export function buildStandardRow(
  emailId: string,
  serial: number,
): StandardFormRow {
  const ex = EXTRACTION_RESULTS[emailId];
  const fxRate = FX_RATES[ex.currency];
  const krw = Math.floor(ex.amount * fxRate);
  let cumDrawn = 0;
  let cumDist = 0;
  let note = '';
  if (emailId === 'M1_01') {
    cumDrawn = 32500000;
    note = 'Apollo 병합셀 표 파싱';
  } else if (emailId === 'M1_02') {
    cumDist = 167400;
    note = 'KKR 공통 노티스 — S23 코드 매칭 (30 LP 중 22번째)';
  } else if (emailId === 'M1_03') {
    cumDrawn = 3285000000;
    note = 'Nippon PE JPY 통화, FX 9.45 적용';
  }
  return {
    serial,
    processedAt: '2026-05-12',
    fundManager: ex.fundManager,
    fundName: ex.fundName,
    txnType: ex.txnType,
    txnDate: ex.txnDate,
    fxAmount: ex.amount,
    currency: ex.currency,
    fxRate,
    krwAmount: krw,
    cumulativeDrawn: cumDrawn,
    cumulativeDistribution: cumDist,
    investorCode: ex.investorCode,
    confirmStatus: '확인필요',
    note,
  };
}

export const ONTOLOGY_DICT: Array<{ std: string; aliases: string[] }> = [
  { std: 'ending_nav', aliases: ['Net Asset Value', 'NAV', 'Ending Capital Account Balance', 'Capital Account Balance', 'Investor Net Position', 'Account Value'] },
  { std: 'cumulative_drawn', aliases: ['Drawn-to-Date', 'Total Drawn-to-Date', 'Aggregate Subscriptions Funded', 'Cumulative Contributions'] },
  { std: 'cumulative_distribution', aliases: ['Total Distributions Received', 'Distributions to LPs', 'Aggregate Proceeds Returned', 'Cash Distributions Paid'] },
  { std: 'this_txn_type=Capital Call', aliases: ['Capital Call', 'Drawdown', 'Drawdown Notice', 'Subscription Drawdown', 'Funding Notice'] },
  { std: 'this_txn_type=Distribution', aliases: ['Distribution Notice', 'Distribution', 'Cash Proceeds Release', 'Return of Capital', 'Realized Gain', 'Dividend Income'] },
  { std: 'unfunded_commitment', aliases: ['Unfunded Commitment', 'Undrawn Commitment', 'Remaining Undrawn Capital'] },
  { std: 'commitment', aliases: ['Commitment', 'Total Commitment', 'Total Subscription Commitment'] },
];

export const PE_FACTS = {
  funds: 8,
  totalSamples: 10,
  ontologyRules: 21,
  parseSeconds: 24.3,
  classifyAccuracyKpi: '95% 이상',
  parseAccuracyKpi: '90% 이상',
  mappingAccuracyKpi: '85% 이상',
  codeSearchAccuracyKpi: '99% 이상 (금융 무결성)',
};
