import { useState, useRef } from 'react';
import type {
  AgentAnswer,
  AgentMode,
  DemoStep,
  EvidenceClause,
  CopilotAnswer,
  QaAnswer,
  CustomerProfile,
} from './types';
import { callStormAgent, buildCopilotQuery } from './api';
import {
  BRAND,
  TABS,
  PROFILES,
  QA_EXAMPLES,
  REASONING_STEPS,
} from './mockData';

const REASON_ORDER: DemoStep[] = [
  'reasoning_1',
  'reasoning_2',
  'reasoning_3',
  'reasoning_4',
];
const STEP_ORDER: DemoStep[] = [
  'idle',
  'intake',
  'reasoning_1',
  'reasoning_2',
  'reasoning_3',
  'reasoning_4',
  'answering',
  'done',
];
const STEP_TIMINGS: Record<DemoStep, number> = {
  idle: 0,
  intake: 500,
  retrieval: 0,
  reasoning_1: 900,
  reasoning_2: 1300,
  reasoning_3: 1100,
  reasoning_4: 1000,
  answering: 600,
  done: 0,
};

// 가벼운 마크다운(굵게/불릿/줄바꿈)
function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="qa-answer-body">
      {lines.map((ln, i) => {
        const trimmed = ln.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const content = isBullet ? trimmed.replace(/^[-•]\s/, '') : ln;
        const html = content.replace(
          /\*\*(.+?)\*\*/g,
          '<strong>$1</strong>'
        );
        if (trimmed === '') return <div key={i} className="qa-gap" />;
        return isBullet ? (
          <div key={i} className="qa-bullet">
            <span className="qa-dot">•</span>
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : (
          <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<AgentMode>('copilot');
  const [step, setStep] = useState<DemoStep>('idle');
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [apiElapsed, setApiElapsed] = useState<number | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceClause | null>(null);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);

  // copilot 입력 상태
  const [form, setForm] = useState<CustomerProfile>(PROFILES[0]);
  // qa 입력 상태
  const [question, setQuestion] = useState('');

  function changeMode(m: AgentMode) {
    if (m === mode) return;
    setMode(m);
    reset();
  }

  function reset() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    startedRef.current = false;
    setStep('idle');
    setAnswer(null);
    setError(null);
    setUsedFallback(false);
    setIsMockMode(false);
    setApiElapsed(null);
    setSelectedEvidence(null);
  }

  function run() {
    if (startedRef.current) return;
    const query = mode === 'copilot' ? buildCopilotQuery(form) : question.trim();
    if (!query) return;
    startedRef.current = true;
    setStep('intake');
    setAnswer(null);
    setError(null);
    setUsedFallback(false);

    let elapsed = 0;
    for (const s of STEP_ORDER) {
      if (s === 'idle') continue;
      elapsed += STEP_TIMINGS[s];
      const id = window.setTimeout(() => setStep(s), elapsed);
      timers.current.push(id);
    }

    callStormAgent(mode, query)
      .then(({ answer, elapsedMs, isMock }) => {
        setApiElapsed(Math.round(elapsedMs));
        setAnswer(answer);
        setIsMockMode(isMock);
      })
      .catch((err) => {
        setError(err.message);
        setUsedFallback(true);
      });
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const isStarted = step !== 'idle';
  const reached = (s: DemoStep) => STEP_ORDER.indexOf(s) <= stepIndex;

  return (
    <div className="app">
      <Header mode={mode} onChange={changeMode} />
      <div className="layout">
        {mode === 'copilot' ? (
          <CopilotSidebar
            selected={form.id}
            onSelect={(p) => {
              setForm(p);
              reset();
            }}
          />
        ) : (
          <QaSidebar
            onPick={(q) => {
              setQuestion(q);
              reset();
            }}
          />
        )}

        <main className="main">
          <section className="tab-intro">
            <h1 className="tab-title">{TABS[mode].title}</h1>
            <p className="tab-desc">{TABS[mode].desc}</p>
          </section>

          {mode === 'copilot' ? (
            <CopilotForm
              form={form}
              setForm={setForm}
              disabled={isStarted}
              onRun={run}
            />
          ) : (
            <QaInput
              question={question}
              setQuestion={setQuestion}
              disabled={isStarted}
              onRun={run}
            />
          )}

          {isStarted && (
            <>
              <ReasoningGrid
                mode={mode}
                active={[
                  reached('reasoning_1'),
                  reached('reasoning_2'),
                  reached('reasoning_3'),
                  reached('reasoning_4'),
                ]}
              />

              <AnswerPanel
                mode={mode}
                visible={reached('answering')}
                step={step}
                answer={answer}
                error={error}
                usedFallback={usedFallback}
                isMockMode={isMockMode}
                apiElapsed={apiElapsed}
                onSelectEvidence={setSelectedEvidence}
              />

              <button className="reset-btn" onClick={reset}>
                ↻ 새 상담 시작
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
// 헤더
// =====================================================
function Header(props: { mode: AgentMode; onChange: (m: AgentMode) => void }) {
  const persona =
    props.mode === 'copilot' ? BRAND.copilotPersona : BRAND.qaPersona;
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo-mark">●</span>
        <span className="logo-text">{BRAND.company} · {BRAND.tagline}</span>
        <span className="brand-tag">{BRAND.poweredBy}</span>
      </div>
      <nav className="tabs">
        {(['copilot', 'qa'] as AgentMode[]).map((t) => (
          <button
            key={t}
            className={`tab ${t === props.mode ? 'active' : ''}`}
            onClick={() => props.onChange(t)}
          >
            {TABS[t].tabLabel}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <span className="user-avatar">👤</span>
        <span className="user-name">{persona.name}</span>
        <span className="user-role">{persona.dept}</span>
      </div>
    </header>
  );
}

// =====================================================
// 사이드바 — 코파일럿(고객 리스트)
// =====================================================
function CopilotSidebar(props: {
  selected: string;
  onSelect: (p: CustomerProfile) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">상담 고객</div>
        {PROFILES.map((p) => (
          <button
            key={p.id}
            className={`claim-item ${p.id === props.selected ? 'selected' : ''}`}
            onClick={() => props.onSelect(p)}
          >
            <div className="claim-id">
              {p.id === props.selected && '▶ '}
              {p.name} ({p.age}/{p.gender})
            </div>
            <div className="claim-status">{p.note}</div>
          </button>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-title">근거 약관 ({BRAND.docList.length})</div>
        {BRAND.docList.map((d) => (
          <div key={d} className="doc-mini">📄 {d}</div>
        ))}
      </div>
    </aside>
  );
}

// =====================================================
// 사이드바 — Q&A(약관 + 예시질문)
// =====================================================
function QaSidebar(props: { onPick: (q: string) => void }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">근거 약관 ({BRAND.docList.length})</div>
        {BRAND.docList.map((d) => (
          <div key={d} className="doc-mini">📄 {d}</div>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-title">자주 묻는 질문</div>
        {QA_EXAMPLES.map((q) => (
          <button key={q} className="qa-example" onClick={() => props.onPick(q)}>
            {q}
          </button>
        ))}
      </div>
    </aside>
  );
}

// =====================================================
// 코파일럿 입력폼
// =====================================================
function CopilotForm(props: {
  form: CustomerProfile;
  setForm: (p: CustomerProfile) => void;
  disabled: boolean;
  onRun: () => void;
}) {
  const { form, setForm, disabled } = props;
  const [newContract, setNewContract] = useState('');

  function addContract() {
    const v = newContract.trim();
    if (!v) return;
    setForm({ ...form, contracts: [...form.contracts, v] });
    setNewContract('');
  }

  return (
    <section className="input-panel">
      <div className="panel-header">
        <span className="panel-step">입력</span>
        <h2 className="panel-title">고객 가입현황</h2>
      </div>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">나이</span>
          <input
            type="number"
            value={form.age}
            disabled={disabled}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span className="field-label">성별</span>
          <select
            value={form.gender}
            disabled={disabled}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">직업</span>
          <input
            value={form.job}
            disabled={disabled}
            onChange={(e) => setForm({ ...form, job: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">가입시점</span>
          <input
            value={form.joinDate}
            disabled={disabled}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
          />
        </label>
      </div>

      <div className="field">
        <span className="field-label">보유 계약</span>
        <div className="chip-row">
          {form.contracts.map((c, i) => (
            <span key={i} className="contract-chip">
              {c}
              {!disabled && (
                <button
                  className="chip-x"
                  onClick={() =>
                    setForm({
                      ...form,
                      contracts: form.contracts.filter((_, j) => j !== i),
                    })
                  }
                >
                  ✕
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <span className="chip-add">
              <input
                value={newContract}
                placeholder="+ 상품/특약 추가"
                onChange={(e) => setNewContract(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addContract()}
              />
            </span>
          )}
        </div>
      </div>

      <label className="field">
        <span className="field-label">관심사 / 상담 요청</span>
        <textarea
          rows={2}
          value={form.interest}
          disabled={disabled}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
        />
      </label>

      {!disabled && (
        <button className="run-btn" onClick={props.onRun}>
          ▶ 보장 갭분석 실행
        </button>
      )}
    </section>
  );
}

// =====================================================
// Q&A 입력
// =====================================================
function QaInput(props: {
  question: string;
  setQuestion: (q: string) => void;
  disabled: boolean;
  onRun: () => void;
}) {
  return (
    <section className="input-panel">
      <div className="panel-header">
        <span className="panel-step">질의</span>
        <h2 className="panel-title">약관·심사 질문</h2>
      </div>
      <textarea
        className="qa-textarea"
        rows={3}
        placeholder="예) 4세대 실손에서 도수치료는 얼마까지 보장되나요?"
        value={props.question}
        disabled={props.disabled}
        onChange={(e) => props.setQuestion(e.target.value)}
      />
      {!props.disabled && (
        <button
          className="run-btn"
          onClick={props.onRun}
          disabled={!props.question.trim()}
        >
          ▶ 약관 근거로 질의
        </button>
      )}
    </section>
  );
}

// =====================================================
// 사고 단계 4카드
// =====================================================
function ReasoningGrid(props: { mode: AgentMode; active: boolean[] }) {
  const steps = REASONING_STEPS[props.mode];
  const anyActive = props.active.some(Boolean);
  if (!anyActive) return null;
  return (
    <section className="reasoning-grid-wrap">
      <div className="panel-header">
        <span className="panel-step">사고 단계 4개</span>
        <h2 className="panel-title">STORM 에이전트 · 사고 흐름</h2>
      </div>
      <div className="reasoning-grid">
        {steps.map((rs, idx) => {
          const active = props.active[idx];
          return (
            <div
              key={rs.label}
              className={`reasoning-card ${active ? 'active' : 'idle'}`}
            >
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
// 답변 패널
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
  if (!props.answer) {
    return (
      <section className="answer-panel">
        <div className="panel-header">
          <span className="panel-step">최종</span>
          <h2 className="panel-title">종합 답변 · Claude Sonnet 4.6 작성 중</h2>
          <span className="panel-status progress">⏳ 답변 작성 중</span>
        </div>
        <div className="answer-loading">
          에이전트가 약관 근거를 종합하고 있습니다…
        </div>
      </section>
    );
  }

  return (
    <section className="answer-panel">
      <div className="panel-header">
        <span className="panel-step">종합 답변</span>
        <h2 className="panel-title">
          {props.mode === 'copilot' ? '보장 갭분석 결과' : '약관 근거 답변'}
        </h2>
      </div>

      {props.usedFallback && (
        <div className="banner warn">
          ⚠ STORM API 호출 실패. 사전 검증된 응답으로 표시 중입니다. (오류: {props.error})
        </div>
      )}
      {!props.usedFallback && props.isMockMode && (
        <div className="banner info">
          ✓ 데모 모드 · 사전 검증된 응답 (실시연 시 STORM 라이브 호출)
        </div>
      )}
      {!props.usedFallback && !props.isMockMode && props.apiElapsed != null && (
        <div className="banner ok">
          ✓ STORM 실연동 응답 · 약관 RAG 근거 ({Math.round(props.apiElapsed / 1000)}초)
        </div>
      )}

      {props.mode === 'copilot' ? (
        <CopilotCards
          answer={props.answer as CopilotAnswer}
          onSelectEvidence={props.onSelectEvidence}
        />
      ) : (
        <QaCard
          answer={props.answer as QaAnswer}
          onSelectEvidence={props.onSelectEvidence}
        />
      )}
    </section>
  );
}

// =====================================================
// 코파일럿 4블록 카드
// =====================================================
function CopilotCards(props: {
  answer: CopilotAnswer;
  onSelectEvidence: (e: EvidenceClause) => void;
}) {
  const a = props.answer;
  return (
    <>
      <div className="decision-bar">{a.decision}</div>
      <div className="answer-grid">
        <div className="answer-card gap">
          <div className="card-head">🔴 보장 갭 ({a.coverage_gaps.length})</div>
          <ul className="block-list">
            {a.coverage_gaps.map((g, i) => (
              <li key={i}>
                <div className="block-title">{g.risk}</div>
                <div className="block-sub">현재 · {g.current}</div>
                <div className="block-body">{g.gap}</div>
                {g.clause && <div className="block-clause">📖 {g.clause}{g.page ? ` p.${g.page}` : ''}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card reco">
          <div className="card-head">🟢 맞춤 추천 ({a.recommendations.length})</div>
          <ul className="block-list">
            {a.recommendations.map((r, i) => (
              <li key={i}>
                <div className="block-title">{r.product}</div>
                <div className="block-body">{r.reason}</div>
                <div className="block-benefit">핵심 보장 · {r.key_benefit}</div>
                {r.clause && <div className="block-clause">📖 {r.clause}{r.page ? ` p.${r.page}` : ''}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card script">
          <div className="card-head">💬 상담 화법 ({a.sales_script.length})</div>
          <ul className="block-list">
            {a.sales_script.map((s, i) => (
              <li key={i}>
                <div className="block-title">{s.situation}</div>
                <div className="block-talk">“{s.talk}”</div>
                {s.caution && <div className="block-caution">⚠ {s.caution}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="answer-card evidence">
          <div className="card-head">📖 근거 약관 ({a.evidence_clauses.length})</div>
          <ul className="evidence-list">
            {a.evidence_clauses.map((e, i) => (
              <li
                key={i}
                className="evidence-item"
                onClick={() => props.onSelectEvidence(e)}
              >
                <div className="ev-clause">{e.clause}</div>
                <div className="ev-page">
                  {e.page ? `p.${e.page}` : '약관 원문'} · 클릭하여 원문 확인 →
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-label">설계사 요약</div>
        <div className="summary-text">{a.summary}</div>
      </div>
    </>
  );
}

// =====================================================
// Q&A 답변 카드
// =====================================================
function QaCard(props: {
  answer: QaAnswer;
  onSelectEvidence: (e: EvidenceClause) => void;
}) {
  const a = props.answer;
  const verdictClass =
    a.verdict === '지급가능'
      ? 'go'
      : a.verdict === '지급불가'
      ? 'hold'
      : a.verdict === '조건부'
      ? 'cond'
      : 'na';
  return (
    <>
      <div className="qa-result">
        <div className="qa-main">
          {a.verdict && a.verdict !== '해당없음' && (
            <span className={`verdict-badge ${verdictClass}`}>{a.verdict}</span>
          )}
          <MiniMarkdown text={a.answer} />
          {a.caution && <div className="block-caution">⚠ {a.caution}</div>}
        </div>
        <div className="qa-side">
          <div className="card-head">📖 근거 약관 ({a.evidence_clauses.length})</div>
          <ul className="evidence-list">
            {a.evidence_clauses.map((e, i) => (
              <li
                key={i}
                className="evidence-item"
                onClick={() => props.onSelectEvidence(e)}
              >
                <div className="ev-clause">{e.clause}</div>
                <div className="ev-page">
                  {e.page ? `p.${e.page}` : '약관 원문'} · 클릭하여 원문 확인 →
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
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
              ? `약관 PDF · p.${props.evidence.page}`
              : '약관 원문 (RAG 근거 청크)'}
          </div>
          <div className="pdf-page">
            <div className="pdf-clause-title">{props.evidence.clause}</div>
            <div className="pdf-clause-body highlight">
              {props.evidence.snippet}
            </div>
            <div className="pdf-note">
              ※ STORM RAG가 검색한 약관 근거 원문입니다. 실제 약관 PDF의 해당 조항에서 추출되었습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
