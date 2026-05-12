import type { InboxEmail, ExtractionResult, StandardFormRow } from './types';

export const INBOX_EMAILS: InboxEmail[] = [
  {
    id: 'M1_01',
    from: 'Apollo Investor Relations <ir@apollo-management.com>',
    subject: '[Capital Call Notice] Apollo Global PE Fund VIII, Call #12',
    preview: 'Dear Limited Partner, please find attached Capital Call Notice #12. Due: 2026-04-08. Amount: USD 4,500,000.',
    body:
`Dear Limited Partner,

Please find attached Capital Call Notice #12 for Apollo Global Private Equity Fund VIII, L.P.

Summary
- Investor: Samsung Fire & Marine Insurance Co., Ltd. (APO-VIII-LP-0083)
- Commitment: USD 50,000,000
- Drawn-to-Date (before this call): USD 28,000,000
- This Call Amount: USD 4,500,000
- Cumulative Drawn (after this call): USD 32,500,000 (65.00%)
- Due Date: 2026-04-08

Wire Instructions
- Beneficiary: Apollo Global Private Equity Fund VIII, L.P.
- Bank: JPMorgan Chase Bank, N.A. (SWIFT: CHASUS33)
- Account: 8472-339-021-77
- Reference: APO-VIII-LP-0083 / Call No. 12

Please ensure timely remittance by the due date. For questions, contact Investor Relations at ir@apollo-management.com.

Regards,
Apollo Investor Relations`,
    receivedAt: '2026-05-12 09:14',
    hasAttachment: true,
    attachmentName: 'Apollo_CapitalCall_Notice_12.pdf',
    category: 'FUND_INOUT',
    classifyReason: 'Capital Call 명시, 펀드 IR 발신, 첨부 PDF',
    fundCase: 'apollo',
  },
  {
    id: 'M1_02',
    from: 'KKR Investor Services <ir-asia@kkr-funds.example.com>',
    subject: 'Common Distribution Notice, Q1 2026 (All LPs)',
    preview: 'Each Investor is identified by an internal Investor Code only. Please refer to the row matching your code on file.',
    body:
`Dear Limited Partners,

The General Partner of KKR Asian Fund III, L.P. is pleased to inform you of the Q1 2026 distribution to be paid on April 15, 2026.

This is a common notice issued to all Limited Partners. For confidentiality reasons, each Investor is identified by an internal Investor Code only. Please refer to the row matching your Investor Code on file (provided in your Onboarding Pack) to identify your allocation.

Total Distribution (Fund-Level): USD 3,553,400 gross / USD 3,020,390 net
Distribution Composition: Return of Capital 48%, Realized Gain 41%, Dividend Income 11%
Withholding: 15% applied to Realized Gain and Dividend Income components only.

Please review the attached PDF for the full allocation table covering all 30 Limited Partners. If you cannot identify your code, contact KKR Investor Services.

Thank you,
KKR Investor Services`,
    receivedAt: '2026-05-12 09:32',
    hasAttachment: true,
    attachmentName: 'KKR_CommonNotice_Q1_2026.pdf',
    category: 'FUND_INOUT',
    classifyReason: 'Distribution Notice, 공통 노티스, 회사 코드 식별 필요',
    fundCase: 'kkr',
  },
  {
    id: 'M1_03',
    from: 'Nippon PE Partners <admin@nippon-pe-partners.example.com>',
    subject: 'Drawdown #5, Nippon Private Equity Partners Fund III (JPY)',
    preview: 'Kindly find the JPY-denominated Drawdown #5 notice attached. Funding due: 2026-04-30. JPY 360,000,000.',
    body:
`Dear Investor,

Kindly find attached the Drawdown #5 notice for Nippon Private Equity Partners Fund III, L.P. (JPY-denominated).

Summary
- Investor Reference: NPE-III-LP-S23
- Total Commitment: JPY 4,500,000,000
- Drawn-to-Date (before this call): JPY 2,925,000,000
- This Drawdown: JPY 360,000,000 (8.00% of Commitment)
- Cumulative After Call: JPY 3,285,000,000 (73.00%)
- Funding Due: 2026-04-30
- FX Reference (JPY/KRW indicative): 9.45

Wire Instructions
- Beneficiary: Nippon Private Equity Partners Fund III, L.P.
- Bank: Mitsubishi UFJ Bank, Tokyo Main Office (SWIFT: BOTKJPJT)
- Account (JPY): 7-1234567
- Reference: NPE-III-LP-S23 / DD-05

The investor is responsible for FX conversion to JPY and any wire bank charges.

Regards,
Nippon PE Partners Management Co., Ltd.`,
    receivedAt: '2026-05-12 10:05',
    hasAttachment: true,
    attachmentName: 'NipponPE_Drawdown_05.pdf',
    category: 'FUND_INOUT',
    classifyReason: 'Drawdown Notice, JPY 통화',
    fundCase: 'nippon',
  },
  {
    id: 'M1_04',
    from: 'IT 지원팀 <it-helpdesk@samsungfire.example.com>',
    subject: '[안내] 4월 사내 시스템 정기 점검 안내',
    preview: '2026-04-18(토) 02:00~06:00 사내 시스템 정기 점검이 진행됩니다.',
    body:
`안녕하세요, IT지원팀입니다.

4월 사내 시스템 정기 점검 일정을 안내드립니다.

- 일시: 2026-04-18(토) 02:00 ~ 06:00
- 영향: 그룹웨어, 사내 인트라넷, 사내 메신저 일시 중단
- 정상화 예상: 06:00 이후

점검 시간 동안 업무에 불편을 드려 죄송합니다. 긴급 문의는 IT지원팀 (내선 1234) 또는 it-helpdesk@samsungfire.example.com 으로 부탁드립니다.

감사합니다.
IT지원팀`,
    receivedAt: '2026-05-12 10:21',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '사내 IT 공지',
  },
  {
    id: 'M1_05',
    from: '인사팀 <hr-notice@samsungfire.example.com>',
    subject: '[교육] 2분기 의무 정보보안 교육 안내',
    preview: '전 임직원 대상 2분기 의무 정보보안 교육 신청 안내.',
    body:
`안녕하세요, 인사팀입니다.

2분기 의무 정보보안 교육 일정을 안내드립니다.

- 대상: 전 임직원
- 교육 방식: 사내 LMS 온라인 과정
- 신청 마감: 2026-04-25
- 이수 기한: 2026-05-31

미이수 시 분기 평가에 반영됩니다. 기한 내 이수 부탁드립니다.

인사팀`,
    receivedAt: '2026-05-12 10:48',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '사내 인사 공지',
  },
  {
    id: 'M1_06',
    from: 'Bloomberg Newsletter <newsletter@bloomberg-news.example.com>',
    subject: 'Asia Markets Daily, May 12, 2026',
    preview: "Today's key headlines from Bloomberg Asia Markets.",
    body:
`Asia Markets Daily, May 12, 2026

Today's key headlines:
- Japan equities open higher amid weakening yen
- Korean won extends decline against USD
- China property sector regulatory update
- Bond yields: 10Y JGB at 1.42%, 10Y KTB at 3.18%

[Read more on Bloomberg]
[Unsubscribe]`,
    receivedAt: '2026-05-12 11:02',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '뉴스레터',
  },
  {
    id: 'M1_07',
    from: 'Asia PE Forum <events@asia-pe-forum.example.com>',
    subject: "You're Invited: Asia Private Equity Forum 2026",
    preview: 'Asia Private Equity Forum 2026 in Hong Kong, June 12-13.',
    body:
`Dear Colleague,

We cordially invite you to the Asia Private Equity Forum 2026, taking place in Hong Kong on June 12-13, 2026.

This year's forum will gather over 800 senior LP and GP professionals from across the region. Key sessions include:
- Macro outlook for Asia PE 2026-2030
- Fund of funds strategy panel
- ESG due diligence workshop

Early bird registration closes April 30, 2026.

Best regards,
Asia PE Forum Organizing Committee`,
    receivedAt: '2026-05-12 11:30',
    hasAttachment: false,
    category: 'NON_FUND',
    classifyReason: '컨퍼런스 초대 (관련 분야지만 입출금 아님)',
  },
  {
    id: 'M1_08',
    from: '준법감시인 <compliance@samsungfire.example.com>',
    subject: '[보고] 1분기 해외투자 컴플라이언스 점검 결과',
    preview: '귀 부서의 1분기 해외투자 관련 컴플라이언스 점검 결과 공유.',
    body:
`귀 부서장님께,

1분기 해외투자 관련 컴플라이언스 점검 결과를 공유드립니다.

- 점검 기간: 2026-01-01 ~ 2026-03-31
- 점검 대상: 해외 사모펀드 23건, 외환거래 87건
- 시정 권고: 0건 (전 항목 정상)
- 후속 모니터링: 2분기 정례 점검에 포함

상세 보고서는 첨부파일을 참고해 주시기 바랍니다.

준법감시인`,
    receivedAt: '2026-05-12 13:15',
    hasAttachment: true,
    attachmentName: 'Compliance_Q1_Report.pdf',
    category: 'NON_FUND',
    classifyReason: '컴플라이언스 보고 (업무 관련이지만 입출금 아님)',
  },
  {
    id: 'M1_09',
    from: 'Market Data Vendor <sales@market-data-vendor.example.com>',
    subject: '[견적] 시장데이터 구독 갱신 견적 송부의 건',
    preview: '시장데이터 구독 갱신 견적 송부.',
    body:
`안녕하십니까,

시장데이터 구독 갱신 견적을 송부드립니다.

- 현재 구독: Real-time Bloomberg Terminal × 3석
- 갱신 기간: 2026-06-01 ~ 2027-05-31
- 견적 금액: 별도 첨부파일 참고

구매 검토 후 연락 부탁드립니다.

감사합니다.
Market Data Vendor`,
    receivedAt: '2026-05-12 13:42',
    hasAttachment: true,
    attachmentName: 'Quotation_2026-2027.pdf',
    category: 'NON_FUND',
    classifyReason: '벤더 견적',
  },
  {
    id: 'M1_10',
    from: 'Corporate Travel <travel@booking-corporate.example.com>',
    subject: 'Your booking confirmation, Tokyo trip Apr 22-25',
    preview: 'Tokyo trip booking confirmed (Apr 22-25).',
    body:
`Dear Traveler,

Your booking for the Tokyo trip has been confirmed.

- Departure: ICN → HND, Apr 22, 2026, 09:00
- Return: HND → ICN, Apr 25, 2026, 18:30
- Hotel: Imperial Hotel Tokyo (3 nights)
- Reference: BKG-2026-04-1129

Please contact us if you need any changes.

Corporate Travel Desk`,
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
    note = 'KKR 공통 노티스, S23 코드 매칭 (30 LP 중 22번째)';
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
