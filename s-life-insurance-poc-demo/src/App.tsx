import { useState, useRef } from 'react';
import type {
  AgentAnswer,
  AgentMode,
  DemoStep,
  EvidenceClause,
  PaymentAnswer,
  UnderwritingAnswer,
  LawCompareAnswer,
} from './types';
import { callStormAgent } from './api';
import { SCENARIOS, FALLBACK_BY_MODE, type ScenarioMeta } from './mockData';

const STEP_TIMINGS: Record<DemoStep, number> = {
  idle: 0,
  intake: 600,
  parsing: 4000,
  reasoning_1: 3000,
  reasoning_2: 2500,
  reasoning_3: 3500,
  reasoning_4: 2500,
  answering: 1500,
  done: 0,
};

const STEP_ORDER: DemoStep[] = [
  'idle',
  'intake',
  'parsing',
  'reasoning_1',
  'reasoning_2',
  'reasoning_3',
  'reasoning_4',
  'answering',
  'done',
];

function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

function compactWon(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만 원`;
    if (eok > 0) return `${eok}억 원`;
    return `${man.toLocaleString()}만 원`;
  }
  return `${amount}원`;
}

export default function App() {
  const [mode, setMode] = useState<AgentMode>('payment');
  const [step, setStep] = useState<DemoStep>('idle');
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceClause | null>(null);
  const [apiElapsed, setApiElapsed] = useState<number | null>(null);
  const startedRef = useRef(false);

  const scenario = SCENARIOS[mode];

  function changeMode(newMode: AgentMode) {
    if (newMode === mode) return;
    setMode(newMode);
    resetDemo();
  }

  function startDemo() {
    if (startedRef.current) return;
    startedRef.current = true;
    setStep('intake');
    setAnswer(null);
    setError(null);
    setUsedFallback(false);
    setSelectedEvidence(null);
    setApiElapsed(null);

    let elapsed = 0;
    for (const s of STEP_ORDER) {
      if (s === 'idle') continue;
      elapsed += STEP_TIMINGS[s];
      setTimeout(() => setStep(s), elapsed);
    }

    callStormAgent(mode, scenario.intakeQuestion)
      .then(({ answer, elapsedMs, isMock }) => {
        setApiElapsed(Math.round(elapsedMs));
        setAnswer(answer);
        setIsMockMode(isMock);
      })
      .catch((err) => {
        setError(err.message);
        setAnswer(FALLBACK_BY_MODE[mode]);
        setUsedFallback(true);
      });
  }

  function resetDemo() {
    startedRef.current = false;
    setStep('idle');
    setAnswer(null);
    setError(null);
    setUsedFallback(false);
    setIsMockMode(false);
    setSelectedEvidence(null);
    setApiElapsed(null);
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const isStarted = step !== 'idle';
  const isStepReached = (s: DemoStep) => STEP_ORDER.indexOf(s) <= stepIndex;
  const isReasoningActive = (n: 1 | 2 | 3 | 4) =>
    isStepReached(`reasoning_${n}` as DemoStep);

  return (
    <div className="app">
      <Header mode={mode} onChange={changeMode} scenario={scenario} />
      <div className="layout">
        <Sidebar scenario={scenario} />
        <main className="main">
          <ClaimHeader scenario={scenario} />

          {!isStarted && (
            <button className="start-btn" onClick={startDemo}>
              ▶ {scenario.shortName} 에이전트 호출
            </button>
          )}

          {isStarted && (
            <>
              <ParsePanel
                scenario={scenario}
                visible={isStepReached('parsing')}
                done={isStepReached('reasoning_1')}
              />

              <ReasoningGrid
                scenario={scenario}
                isActive1={isReasoningActive(1)}
                isActive2={isReasoningActive(2)}
                isActive3={isReasoningActive(3)}
                isActive4={isReasoningActive(4)}
              />

              <AnswerPanel
                mode={mode}
                visible={isStepReached('answering')}
                step={step}
                answer={answer}
                error={error}
                usedFallback={usedFallback}
                isMockMode={isMockMode}
                apiElapsed={apiElapsed}
                onSelectEvidence={setSelectedEvidence}
              />

              <button className="reset-btn" onClick={resetDemo}>
                ↻ 초기 상태로
              </button>
            </>
          )}
        </main>

        {selectedEvidence && (
          <EvidenceModal
            evidence={selectedEvidence}
            onClose={() => setSelectedEvidence(null)}
          />
        )}
      </div>
    </div>
  );
}

// =====================================================
// 헤더 + 탭 메뉴
// =====================================================
function Header(props: {
  mode: AgentMode;
  onChange: (m: AgentMode) => void;
  scenario: ScenarioMeta;
}) {
  const tabs: AgentMode[] = ['payment', 'underwriting', 'law_compare'];
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo-mark">●</span>
        <span className="logo-text">S Life Insurance · AI 에이전트</span>
        <span className="brand-tag">Powered by Sionic STORM</span>
      </div>
      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab ${t === props.mode ? 'active' : ''}`}
            onClick={() => props.onChange(t)}
          >
            {SCENARIOS[t].tabLabel}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <span className="user-avatar">👤</span>
        <span className="user-name">{props.scenario.personaName}</span>
        <span className="user-role">{props.scenario.personaDept}</span>
      </div>
    </header>
  );
}

// =====================================================
// 사이드바 (모드별)
// =====================================================
function Sidebar({ scenario }: { scenario: ScenarioMeta }) {
  let items: { id: string; label: string; status: string }[];

  if (scenario.mode === 'payment') {
    items = [
      { id: 'K-2026-0312', label: '심사 완료', status: 'done' },
      { id: 'K-2026-0314', label: '추가 자료 요청', status: 'pending' },
      { id: 'K-2026-0315', label: '신규 접수', status: 'active' },
      { id: 'K-2026-0316', label: '신규 접수', status: 'queue' },
      { id: 'K-2026-0317', label: '신규 접수', status: 'queue' },
    ];
  } else if (scenario.mode === 'underwriting') {
    items = [
      { id: 'UW-2026-0508', label: '승인 완료', status: 'done' },
      { id: 'UW-2026-0509', label: '추가 검진 요청', status: 'pending' },
      { id: 'UW-2026-0510', label: '신규 청약', status: 'active' },
      { id: 'UW-2026-0511', label: '신규 청약', status: 'queue' },
    ];
  } else {
    items = [
      { id: 'LAW-2026-Q1', label: '검토 완료', status: 'done' },
      { id: 'LAW-2026-Q2', label: '주기 검토', status: 'active' },
      { id: 'LAW-2026-Q3', label: '예정', status: 'queue' },
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">
          {scenario.mode === 'law_compare' ? '검토 주기' : '진행 중 건'}
        </div>
        {items.map((it) => (
          <div
            key={it.id}
            className={`claim-item ${it.id === scenario.caseId ? 'selected' : ''} ${it.status}`}
          >
            <div className="claim-id">
              {it.id === scenario.caseId && '▶ '}
              {it.id}
              {it.id === scenario.caseId && ' ★'}
            </div>
            <div className="claim-status">{it.label}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// =====================================================
// 청구건/청약/검토건 헤더 (모드별)
// =====================================================
function ClaimHeader({ scenario }: { scenario: ScenarioMeta }) {
  return (
    <section className="claim-header">
      <div className="claim-header-row">
        <h1 className="claim-title">{scenario.intakeTitle}</h1>
        <span className="claim-flag">{scenario.intakeFlag}</span>
      </div>
      <div className="claim-meta">
        {scenario.metaItems.map((m, i) => (
          <div key={i} className="meta-item">
            <span className="meta-label">{m.label}</span>
            <span className={`meta-value ${m.strong ? 'strong' : ''}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
      <div className="docs-row">
        <span className="docs-label">
          {scenario.mode === 'law_compare' ? '대상 텍스트' : '제출 서류'}
        </span>
        <div className="docs-list">
          {scenario.documentList.map((d) => (
            <span key={d} className="doc-pill">
              📄 {d}
            </span>
          ))}
        </div>
        <span className="docs-counter">
          {scenario.documentList.length}/{scenario.documentList.length} 업로드 완료 ✓
        </span>
      </div>
    </section>
  );
}

// =====================================================
// STORM Parse 패널 (모드별)
// =====================================================
function ParsePanel(props: {
  scenario: ScenarioMeta;
  visible: boolean;
  done: boolean;
}) {
  if (!props.visible) return null;
  const { scenario, done } = props;

  const parseSampleText: Record<AgentMode, string> = {
    payment:
      '"이 표는 8개 항목으로 구성되며, 각 항목은 본인부담·비급여로 세분화됩니다.\n\n진단서 최하단에는 박정훈 교수의 직인이 날인되어 있습니다.\n\n※ 비급여 항목은 본 약관 부표 3에 따라 보장 제외 가능…"',
    underwriting:
      '"청약자 박정수, 32세 남성, 직업위험 1급. 비흡연 1년 이상 유지로 비흡연자 할인 적용 가능.\n\n건강고지서 최근 1년 검진 정상, 단 간수치 정상 범위 상한 (γ-GTP 추가 검사 권장)…"',
    law_compare:
      '"3시점 텍스트 비교 결과: 제655조·제656조에서 실질 개정 식별. 제652조·제706조·제715조에서 자구 정비.\n\n시행일은 2025-07-22 일괄 적용, 단 제655조는 2026-03-06 별도 시행…"',
  };

  return (
    <section className={`parse-panel ${done ? 'done' : 'progress'}`}>
      <div className="panel-header">
        <span className="panel-step">단계 0</span>
        <h2 className="panel-title">STORM Parse</h2>
        <span className={`panel-status ${done ? 'done' : 'progress'}`}>
          {done ? '✓ 완료' : '⏳ 변환 중'}
        </span>
      </div>
      <div className="parse-body">
        <div className="parse-left">
          <div className="parse-sublabel">원본 자료</div>
          {scenario.parseDocs.map((d) => (
            <div key={d.label} className="pdf-card">
              <div className="pdf-icon">📄</div>
              <div className="pdf-info">
                <div className="pdf-name">{d.label}</div>
                <div className="pdf-tag">{d.tag}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="parse-right">
          <div className="parse-sublabel">자연어 맥락 변환 결과</div>
          <div className={`parse-text ${done ? 'done' : 'flowing'}`}>
            {parseSampleText[scenario.mode].split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
          <div className="parse-checklist">
            {scenario.parseChecklist.map((c) => (
              <span key={c} className={`check-item ${done ? 'done' : 'progress'}`}>
                {done ? '✓' : '⏳'} {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// 사고 단계 카드 4개 (모드별)
// =====================================================
function ReasoningGrid(props: {
  scenario: ScenarioMeta;
  isActive1: boolean;
  isActive2: boolean;
  isActive3: boolean;
  isActive4: boolean;
}) {
  const states = [props.isActive1, props.isActive2, props.isActive3, props.isActive4];
  const anyActive = states.some(Boolean);
  if (!anyActive) return null;
  return (
    <section className="reasoning-grid-wrap">
      <div className="panel-header">
        <span className="panel-step">사고 단계 4개</span>
        <h2 className="panel-title">{props.scenario.shortName} 에이전트 · 사고 흐름</h2>
      </div>
      <div className="reasoning-grid">
        {props.scenario.reasoningSteps.map((rs, idx) => {
          const active = states[idx];
          return (
            <div key={rs.label} className={`reasoning-card ${active ? 'active' : 'idle'}`}>
              <div className="reasoning-num">{idx + 1}</div>
              <div className="reasoning-body">
                <div className="reasoning-label">{rs.label}</div>
                <div className="reasoning-data-tag">[DATA] {rs.dataLabel}</div>
                <div className={`reasoning-preview ${active ? 'visible' : ''}`}>
                  {rs.preview}
                </div>
              </div>
              {active && <div className="reasoning-check">✓</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =====================================================
// 답변 패널 (모드별 4요소 카드 분기)
// =====================================================
function AnswerPanel(props: {
  mode: AgentMode;
  visible: boolean;
  step: DemoStep;
  answer: AgentAnswer | null;
  error: string | null;
  usedFallback: boolean;
  isMockMode: boolean;
  apiElapsed: number | null;
  onSelectEvidence: (e: EvidenceClause) => void;
}) {
  if (!props.visible) return null;
  if (props.step === 'answering' && !props.answer) {
    return (
      <section className="answer-panel">
        <div className="panel-header">
          <span className="panel-step">최종</span>
          <h2 className="panel-title">종합 답변 · Claude Sonnet 4.6 작성 중</h2>
          <span className="panel-status progress">⏳ 답변 작성 중</span>
        </div>
        <div className="answer-loading">에이전트가 4단계 결과를 종합하고 있습니다…</div>
      </section>
    );
  }
  const a = props.answer;
  if (!a) return null;
  const decision = a.decision || '검토 완료';
  const isPositive =
    decision.includes('지급 가능') ||
    decision === '승인' ||
    decision === '변경 사항 있음';

  return (
    <section className="answer-panel">
      <div className="panel-header">
        <span className="panel-step">종합 답변</span>
        <h2 className="panel-title">검토 완료 · 4요소 카드</h2>
        <span className={`decision-tag ${isPositive ? 'go' : 'hold'}`}>{decision}</span>
      </div>
      {props.usedFallback && (
        <div className="banner warn">
          ⚠ STORM API 호출 실패. 사전 검증된 mock 응답으로 표시 중입니다. (오류: {props.error})
        </div>
      )}
      {!props.usedFallback && props.isMockMode && (
        <div className="banner info">
          ✓ 데모 모드 · 사전 검증된 응답 (실시연 시 STORM 라이브 호출)
        </div>
      )}
      {!props.usedFallback && !props.isMockMode && props.apiElapsed != null && (
        <div className="banner info">
          ✓ STORM 실연동 응답 ({Math.round(props.apiElapsed / 1000)}초)
        </div>
      )}

      {props.mode === 'payment' && (
        <PaymentAnswerCards
          answer={a as PaymentAnswer}
          onSelectEvidence={props.onSelectEvidence}
        />
      )}
      {props.mode === 'underwriting' && (
        <UnderwritingAnswerCards
          answer={a as UnderwritingAnswer}
          onSelectEvidence={props.onSelectEvidence}
        />
      )}
      {props.mode === 'law_compare' && (
        <LawCompareAnswerCards answer={a as LawCompareAnswer} />
      )}

      <BeforeAfter mode={props.mode} />
    </section>
  );
}

// =====================================================
// 모드별 답변 카드
// =====================================================
function PaymentAnswerCards(props: {
  answer: PaymentAnswer;
  onSelectEvidence: (e: EvidenceClause) => void;
}) {
  const a = props.answer;
  return (
    <>
      <div className="answer-grid">
        <div className="answer-card go">
          <div className="card-head">🟢 지급 가부</div>
          <div className="card-amount">{compactWon(a.total_amount)}</div>
          <div className="card-sub">{a.decision} · 4개 특약 합산</div>
        </div>

        <div className="answer-card coverage">
          <div className="card-head">📋 보장 매칭</div>
          <ul className="coverage-list">
            {a.coverage_breakdown.map((c, i) => (
              <li key={i}>
                <div className="cov-row">
                  <span className="cov-name">
                    {i + 1}. {c.item.replace('무배당', '').replace('특약', '')}
                  </span>
                  <span className="cov-amount">{compactWon(c.amount)}</span>
                </div>
                {c.calc && <div className="cov-calc">{c.calc}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card evidence">
          <div className="card-head">📖 근거 조항</div>
          <ul className="evidence-list">
            {a.evidence_clauses.map((e, i) => (
              <li
                key={i}
                className="evidence-item"
                onClick={() => props.onSelectEvidence(e)}
              >
                <div className="ev-clause">{e.clause}</div>
                <div className="ev-page">
                  {e.page ? `p.${e.page}` : '약관 매뉴얼'} · 클릭하여 원문 확인 →
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card suspicious">
          <div className="card-head">⚠️ 의심 영역 ({a.suspicious_items.length}건)</div>
          <ul className="suspicious-list">
            {a.suspicious_items.map((s, i) => (
              <li key={i}>
                <div className="sus-row">
                  <span className="sus-name">▸ {s.item}</span>
                  {s.amount && s.amount > 0 ? (
                    <span className="sus-amount">{won(s.amount)}</span>
                  ) : null}
                </div>
                <div className="sus-reason">{s.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-label">에이전트 요약</div>
        <div className="summary-text">{a.summary}</div>
      </div>
    </>
  );
}

function UnderwritingAnswerCards(props: {
  answer: UnderwritingAnswer;
  onSelectEvidence: (e: EvidenceClause) => void;
}) {
  const a = props.answer;
  return (
    <>
      <div className="answer-grid">
        <div className="answer-card go">
          <div className="card-head">🟢 인수 결정</div>
          <div className="card-amount" style={{ fontSize: '24px' }}>
            {a.decision}
          </div>
          <div className="card-sub">
            등급 <b>{a.underwriting_grade}</b> · 월 {compactWon(a.premium_monthly)}
          </div>
          {a.discount_applied.length > 0 && (
            <div className="card-sub" style={{ marginTop: 6 }}>
              할인 적용: {a.discount_applied.join(', ')}
            </div>
          )}
        </div>

        <div className="answer-card coverage">
          <div className="card-head">📋 조건·할증</div>
          {a.conditions_or_surcharge.length === 0 ? (
            <div className="cov-calc">없음 (표준 인수)</div>
          ) : (
            <ul className="coverage-list">
              {a.conditions_or_surcharge.map((c, i) => (
                <li key={i}>
                  <div className="cov-row">
                    <span className="cov-name">
                      {i + 1}. {c.type}
                    </span>
                  </div>
                  <div className="cov-calc">
                    범위: {c.scope}
                    <br />
                    사유: {c.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="answer-card evidence">
          <div className="card-head">📖 근거 조항</div>
          <ul className="evidence-list">
            {a.evidence_clauses.map((e, i) => (
              <li
                key={i}
                className="evidence-item"
                onClick={() => props.onSelectEvidence(e)}
              >
                <div className="ev-clause">{e.clause}</div>
                <div className="ev-page">
                  {e.page ? `p.${e.page}` : '매뉴얼'} · 클릭하여 원문 확인 →
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card suspicious">
          <div className="card-head">⚠️ 의심 영역 ({a.suspicious_items.length}건)</div>
          <ul className="suspicious-list">
            {a.suspicious_items.map((s, i) => (
              <li key={i}>
                <div className="sus-row">
                  <span className="sus-name">▸ {s.item}</span>
                </div>
                <div className="sus-reason">{s.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-label">에이전트 요약</div>
        <div className="summary-text">{a.summary}</div>
      </div>
    </>
  );
}

function LawCompareAnswerCards(props: { answer: LawCompareAnswer }) {
  const a = props.answer;
  return (
    <>
      <div className="answer-grid">
        <div className="answer-card go">
          <div className="card-head">🟢 결정</div>
          <div className="card-amount" style={{ fontSize: '22px' }}>
            {a.decision}
          </div>
          <div className="card-sub">
            변경 조항 <b>{a.changed_articles.length}건</b> 식별
          </div>
        </div>

        <div className="answer-card coverage">
          <div className="card-head">📋 변경 조항 ({a.changed_articles.length}건)</div>
          <ul className="coverage-list">
            {a.changed_articles.slice(0, 4).map((c, i) => (
              <li key={i}>
                <div className="cov-row">
                  <span className="cov-name">
                    {i + 1}. {c.article} ({c.change_type})
                  </span>
                  <span className="cov-amount" style={{ fontSize: 11 }}>
                    {c.effective_date}
                  </span>
                </div>
                <div className="cov-calc">{c.after}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card evidence">
          <div className="card-head">📖 영업·지급심사 영향 ({a.business_impact.length}건)</div>
          <ul className="evidence-list">
            {a.business_impact.slice(0, 4).map((b, i) => (
              <li key={i} className="evidence-item">
                <div className="ev-clause">[{b.scope}] {b.impact}</div>
                <div className="ev-page" style={{ color: '#1a1a1a' }}>
                  → {b.action_required}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card suspicious">
          <div className="card-head">⚠️ 의심 영역 ({a.suspicious_items.length}건)</div>
          <ul className="suspicious-list">
            {a.suspicious_items.map((s, i) => (
              <li key={i}>
                <div className="sus-row">
                  <span className="sus-name">▸ {s.item}</span>
                </div>
                <div className="sus-reason">{s.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-label">에이전트 요약</div>
        <div className="summary-text">{a.summary}</div>
      </div>
    </>
  );
}

// =====================================================
// Before/After (모드별 메시지)
// =====================================================
function BeforeAfter({ mode }: { mode: AgentMode }) {
  const data: Record<AgentMode, { before: string; after: string; impact: string }> = {
    payment: {
      before: '원본 일일이 검토 약 30분',
      after: '근거 검증 3분 · 27분 단축',
      impact: '하루 처리 가능 청구건 10건 → 19건 (+9건)',
    },
    underwriting: {
      before: '청약 검토 약 25분',
      after: '근거 검증 4분 · 21분 단축',
      impact: '하루 처리 가능 청약 8건 → 15건 (+7건)',
    },
    law_compare: {
      before: '법령 비교·영향 분석 약 4시간',
      after: '자동 다이내믹 비교 5분 · 95% 단축',
      impact: '주기 점검 분기 1회 → 매주 가능',
    },
  };
  const d = data[mode];
  return (
    <div className="before-after">
      <div className="ba-card before">
        <div className="ba-label">Before</div>
        <div className="ba-value">{d.before}</div>
      </div>
      <div className="ba-arrow">↓</div>
      <div className="ba-card after">
        <div className="ba-label">After</div>
        <div className="ba-value">{d.after}</div>
      </div>
      <div className="ba-impact" dangerouslySetInnerHTML={{ __html: d.impact.replace(/\d+건/g, '<b>$&</b>') }} />
    </div>
  );
}

// =====================================================
// 약관 원문 모달
// =====================================================
function EvidenceModal(props: { evidence: EvidenceClause; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>약관 원문 확인 · {props.evidence.clause}</h3>
          <button className="modal-close" onClick={props.onClose}>
            ✕
          </button>
        </div>
        <div className="pdf-mockup">
          <div className="pdf-toolbar">
            {props.evidence.page
              ? `약관 PDF · p.${props.evidence.page} / 245`
              : '언더라이팅 매뉴얼'}
          </div>
          <div className="pdf-page">
            <div className="pdf-clause-title">{props.evidence.clause}</div>
            <div className="pdf-clause-body highlight">{props.evidence.snippet}</div>
            <div className="pdf-note">
              ※ 본 화면은 약관 PDF의 해당 조항을 강조 표시한 시뮬레이션입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
