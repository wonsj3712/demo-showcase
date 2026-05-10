import type {
  PaymentAnswer,
  UnderwritingAnswer,
  LawCompareAnswer,
  AgentMode,
} from './types';

// === 시나리오 메타 (모드별) ===

export type ScenarioMeta = {
  mode: AgentMode;
  tabLabel: string;
  shortName: string;
  caseId: string;
  personaName: string;
  personaRole: string;
  personaDept: string;
  intakeTitle: string;
  intakeFlag: string;
  intakeQuestion: string;
  metaItems: { label: string; value: string; strong?: boolean }[];
  documentList: string[];
  parseChecklist: string[];
  parseDocs: { label: string; tag: string }[];
  reasoningSteps: { label: string; dataLabel: string; preview: string }[];
};

const paymentMeta: ScenarioMeta = {
  mode: 'payment',
  tabLabel: '지급심사',
  shortName: '지급심사',
  caseId: 'K-2026-0315',
  personaName: '김과장',
  personaRole: '담당자',
  personaDept: '지급심사팀',
  intakeTitle: '신규 청구건 · K-2026-0315',
  intakeFlag: '신규 접수',
  intakeQuestion:
    '이 청구건 K-2026-0315 지급 가능한가요. 김지원 환자 유방암 청구건입니다.',
  metaItems: [
    { label: '환자', value: '김지원 (46세 여성)' },
    { label: '진단', value: '유방의 악성 신생물 (C50.4)' },
    { label: '진료기관', value: '강남세브란스병원' },
    { label: '입원', value: '2026-03-15 ~ 2026-04-13 (30일)' },
    { label: '청구금액', value: '26,665,000원', strong: true },
  ],
  documentList: [
    '01_보험금청구서.pdf',
    '02_진단서.pdf',
    '03_진료비영수증.pdf',
    '04_진료세부내역서_강남세브란스.pdf',
    '05_입퇴원확인서.pdf',
    '06_처방전.pdf',
    '07_가족관계증명서.pdf',
  ],
  parseChecklist: ['도장 인식', '표중표 분해', '각주 5개 추출', '체크박스 인식'],
  parseDocs: [
    { label: '진료세부내역서 (강남세브란스)', tag: '표중표 + 각주 5개 + 도장' },
    { label: '진단서 (강남세브란스)', tag: 'C50.4 + 박정훈 교수 직인' },
    { label: '입퇴원확인서', tag: '30일 입원 + 항암 4회 + 수술 1회' },
  ],
  reasoningSteps: [
    {
      label: '청구서류 분석',
      dataLabel: 'STORM Parse 결과',
      preview: '진단명 C50.4, 입원 30일, 수술 자450 + 자463, 항암 4 cycles',
    },
    {
      label: '가입정보 조회',
      dataLabel: 'custom_variables',
      preview: '계약 K2018040123, 면책 90일 경과, 4종 특약 유효',
    },
    {
      label: '약관 보장범위 매칭',
      dataLabel: '약관 RAG',
      preview: '4개 특약 모두 적용 가능 (제18조)',
    },
    {
      label: '의심 영역 체크',
      dataLabel: '비급여 항목 4건',
      preview: '보형물 재건·BRCA·MRI 재검토 권장',
    },
  ],
};

const underwritingMeta: ScenarioMeta = {
  mode: 'underwriting',
  tabLabel: '가입심사',
  shortName: '가입심사',
  caseId: 'UW-2026-0510',
  personaName: '이지원 매니저',
  personaRole: '담당자',
  personaDept: '영업본부',
  intakeTitle: '신규 청약 · UW-2026-0510',
  intakeFlag: '청약 접수',
  intakeQuestion: '박정수 청약자 가입심사 부탁합니다 청약번호 UW-2026-0510',
  metaItems: [
    { label: '청약자', value: '박정수 (32세 남성)' },
    { label: '직업', value: '회사원 / IT 개발 (위험등급 1급)' },
    { label: '흡연·음주', value: '비흡연 / 사회적 음주' },
    { label: '가입 상품', value: '변액유니버설종신 1.2 + 4개 특약' },
    { label: '예상 보험료', value: '월 230,000원', strong: true },
  ],
  documentList: [
    '청약서.pdf',
    '건강고지서.pdf',
    '신분증사본.pdf',
    '수익자지정서.pdf',
  ],
  parseChecklist: [
    '서명 인식',
    '체크박스 인식',
    '날짜·금액 추출',
    '직업 분류 매칭',
  ],
  parseDocs: [
    { label: '청약서', tag: '서명 + 체크박스 + 가입금액' },
    { label: '건강고지서', tag: '검진 항목 + 가족력 + 수술 이력' },
  ],
  reasoningSteps: [
    {
      label: '청약 정보 분석',
      dataLabel: 'custom_variables',
      preview: '32세 남성, 회사원, 가입금액 1억',
    },
    {
      label: '가입이력 조회',
      dataLabel: 'custom_variables',
      preview: '본인 가입 이력 없음, 모럴 해저드 점수 0.12 (낮음)',
    },
    {
      label: '약관·언더라이팅 매칭',
      dataLabel: '약관 RAG',
      preview: '직업 1급 표준 / 비흡연자 할인 가능 / 간수치 추가 검토',
    },
    {
      label: '의심 영역 체크',
      dataLabel: '재검토 항목',
      preview: '간수치 상한·가족력·맹장 수술 이력',
    },
  ],
};

const lawCompareMeta: ScenarioMeta = {
  mode: 'law_compare',
  tabLabel: '법령개정 비교',
  shortName: '법령 비교',
  caseId: 'LAW-2026-Q2',
  personaName: '컴플라이언스팀',
  personaRole: '담당자',
  personaDept: '준법감시',
  intakeTitle: '상법 보험편 개정 영향 분석 · LAW-2026-Q2',
  intakeFlag: '주기 검토',
  intakeQuestion:
    '상법 보험편의 최근 개정 사항과 영업·지급심사에 미치는 영향을 알려주세요',
  metaItems: [
    { label: '대상 법령', value: '상법 보험편 (제638~739조의3)' },
    { label: '비교 시점', value: '2025-01-31 → 2025-07-22 → 2026-03-06' },
    { label: '비교 방식', value: '병렬 RAG 3개 + diff 추출' },
    { label: '대상 부서', value: '영업·지급심사·준법감시' },
  ],
  documentList: [
    '상법_보험편_20260306.txt',
    '상법_보험편_20250722_개정전1.txt',
    '상법_보험편_20250131_개정전2.txt',
  ],
  parseChecklist: [
    '조문 식별',
    '신·구 대조',
    '시행일 추출',
    '자구 정비 분류',
  ],
  parseDocs: [
    { label: '현행 (2026-03-06)', tag: '102조문 21KB' },
    { label: '직전 개정 (2025-07-22)', tag: '102조문 21KB' },
    { label: '차차 개정 (2025-01-31)', tag: '102조문 21KB' },
  ],
  reasoningSteps: [
    {
      label: '3시점 RAG 검색',
      dataLabel: 'RAG ×3 병렬',
      preview: '현행 + 직전 + 차차 텍스트 동시 조회',
    },
    {
      label: '변경 조항 식별',
      dataLabel: 'diff 추출',
      preview: '제655·656·652·706·715조 변경 식별',
    },
    {
      label: '영업·지급심사 영향 분석',
      dataLabel: '업무 임팩트',
      preview: '책임 개시·통지 의무·면책 표현 정비',
    },
    {
      label: '의심 영역 체크',
      dataLabel: '추가 검토',
      preview: '시행일 차이 / 부칙 적용 범위 확인 권장',
    },
  ],
};

export const SCENARIOS: Record<AgentMode, ScenarioMeta> = {
  payment: paymentMeta,
  underwriting: underwritingMeta,
  law_compare: lawCompareMeta,
};

// === Fallback (실연동 실패 시) ===

export const fallbackPayment: PaymentAnswer = {
  decision: '일부 지급',
  total_amount: 67000000,
  coverage_breakdown: [
    {
      item: '무배당신암진단특약',
      amount: 50000000,
      clause: '약관 제18조',
      calc: '5,000만 원 × 1회 = 5,000만 원',
    },
    {
      item: '무배당특정질병수술보장특약',
      amount: 10000000,
      clause: '약관 제18조',
      calc: '500만 원 × 2회 (좌측 유방절제술 + 보형물 재건술) = 1,000만 원',
    },
    {
      item: '무배당특정질병입원특약',
      amount: 3000000,
      clause: '약관 제18조 (p.195)',
      calc: '10만 원 × 30일 = 300만 원',
    },
    {
      item: '무배당암치료비특약',
      amount: 4000000,
      clause: '약관 제18조',
      calc: '100만 원 × 4회 (AC regimen) = 400만 원',
    },
  ],
  evidence_clauses: [
    {
      clause: '무배당신암진단특약',
      page: 187,
      snippet:
        '최초 암 진단 확정 시 1회 한도 5,000만 원 지급. 면책기간 90일 경과 후 적용.',
    },
    {
      clause: '무배당특정질병수술보장특약',
      page: 215,
      snippet: '특정질병(암 포함) 직접치료 목적 수술 회당 500만 원, 연 2회 한도.',
    },
    {
      clause: '무배당특정질병입원특약',
      page: 195,
      snippet:
        '특정질병 직접치료 목적 입원 일당 10만 원, 1회 입원 최대 120일 한도.',
    },
    {
      clause: '무배당암치료비특약',
      page: 228,
      snippet: '암 진단 후 항암화학요법·방사선치료 1회당 100만 원, 연 12회 한도.',
    },
  ],
  suspicious_items: [
    {
      item: '유방 보형물 재건술',
      amount: 5500000,
      reason:
        '환자 선택 비급여로 분류. 암 치료 후 재건술의 의학적 필요성 추가 검토 권장.',
    },
    {
      item: 'BRCA 1/2 유전자검사',
      amount: 580000,
      reason: '가족력 음성으로 급여 기준 미충족. 검사 의뢰 사유서 추가 확인 권장.',
    },
    {
      item: '유방 MRI',
      amount: 420000,
      reason: '단일 병변 정밀평가 목적 비급여 처리. 의학적 필요성 추가 검토 권장.',
    },
    {
      item: '청구금액·보장 차이',
      amount: 19924960,
      reason:
        '총 청구 26,665,000원 대비 약관 보장 합계와의 차이 검토 후 고객 안내 필요.',
    },
  ],
  summary:
    '4개 특약 기준 총 6,700만 원 지급 가능. 비급여 항목 3건 + 청구금액 차이 1건, 총 4건 재검토 권장.',
};

export const fallbackUnderwriting: UnderwritingAnswer = {
  decision: '조건부 승인',
  premium_monthly: 230000,
  underwriting_grade: 'B',
  discount_applied: ['비흡연자 할인 5%'],
  conditions_or_surcharge: [
    {
      type: '추가 건강검진',
      scope: '간수치 추가 검사 (γ-GTP, AST/ALT)',
      reason: '최근 검진 간수치 정상 범위 상한, 추가 확인 권장',
    },
  ],
  evidence_clauses: [
    {
      clause: '약관 제2조 (계약의 성립)',
      page: 12,
      snippet:
        '보험 계약은 계약자의 청약과 회사의 승낙으로 성립한다.',
    },
    {
      clause: '약관 제3조 (고지 의무)',
      page: 14,
      snippet:
        '계약자 또는 피보험자는 계약 청약 시 청약서에서 질문한 중요한 사항에 대하여 사실대로 알려야 한다.',
    },
    {
      clause: '언더라이팅 매뉴얼 비흡연자 할인',
      page: null,
      snippet: '비흡연 1년 이상 유지 시 5% 할인 적용.',
    },
  ],
  suspicious_items: [
    {
      item: '가족력 (부친 고혈압)',
      reason:
        '60세 이후 발병이라 고지 의무 외이나, 청약자 본인 혈압 측정값을 추가 확인 권장.',
    },
    {
      item: '간수치 정상 범위 상한',
      reason:
        '추가 검진 후 정상 확인되면 표준 인수, 이상 시 할증 또는 부담보 가능.',
    },
    {
      item: '7년 전 충수돌기염 수술',
      reason:
        '면책 사유 아님. 단 회복 경과 추가 확인 후 정상 진단 시 표준 인수.',
    },
  ],
  summary:
    '표준 인수 가능. 비흡연자 할인 5% 적용. 간수치 추가 검진 1건 충족 후 최종 승인.',
};

export const fallbackLawCompare: LawCompareAnswer = {
  decision: '변경 사항 있음',
  summary:
    '상법 보험편 제655조·제656조 실질 개정 및 제652조·제706조·제715조 자구 정비로 영업·지급심사 프로세스 점검 필요.',
  changed_articles: [
    {
      article: '제656조',
      change_type: '개정',
      before: '보험자의 책임 개시 시점 관련 표현',
      after: '책임 개시 시점 명확화 (실질 동일, 표현 정비)',
      effective_date: '2025-07-22',
    },
    {
      article: '제652조',
      change_type: '자구 정비',
      before: '위험 변경·증가 통지 의무 표현',
      after: '"사실을 안 때" 명확화',
      effective_date: '2025-07-22',
    },
    {
      article: '제715조',
      change_type: '자구 정비',
      before: '다른 보험계약 통지 의무 표현',
      after: '문구 정비',
      effective_date: '2025-07-22',
    },
  ],
  business_impact: [
    {
      scope: '영업·언더라이팅',
      impact: '제656조 개정으로 책임 개시 시점 명확화',
      action_required: '청약 절차·내부 프로세스 정비',
    },
    {
      scope: '영업·언더라이팅',
      impact: '제652조 자구 정비로 통지 의무 시점 명확화',
      action_required: '계약자·피보험자 의무 안내 강화',
    },
    {
      scope: '지급심사',
      impact: '제715조 자구 정비로 다른 보험계약 통지 의무 명확화',
      action_required: '지급심사 시 타 보험계약 확인 절차 강화',
    },
  ],
  suspicious_items: [
    {
      item: '시행일 차이',
      reason: '제655조는 2026-03-06 시행, 나머지는 2025-07-22. 부칙 확인 권장.',
    },
    {
      item: '부칙 적용 범위',
      reason: '신·구 적용 경과 규정 별도 확인 필요.',
    },
  ],
};

export const FALLBACK_BY_MODE = {
  payment: fallbackPayment,
  underwriting: fallbackUnderwriting,
  law_compare: fallbackLawCompare,
};
