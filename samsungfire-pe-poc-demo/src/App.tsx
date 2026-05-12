import { useMemo, useState } from 'react';
import type {
  StandardFormRow,
  WorkflowStep,
} from './types';
import {
  INBOX_EMAILS,
  EXTRACTION_RESULTS,
  buildStandardRow,
} from './mockData';
import { callStormAgent } from './api';

const STEPS: { key: WorkflowStep; label: string; desc: string }[] = [
  { key: 'classify',    label: '메일 분류',        desc: '입출금 관련 메일만 처리 큐로 분배' },
  { key: 'parse',       label: '문서 분석',        desc: '첨부 PDF·본문의 표·줄글을 데이터로 변환' },
  { key: 'code_search', label: '투자자 코드 식별', desc: '공통 노티스에서 자기 회사 행을 추출' },
  { key: 'ontology',    label: '거래 항목 표준화', desc: '펀드사별 다른 용어를 내부 표준 칼럼으로 매핑' },
  { key: 'normalize',   label: '표준양식 변환',    desc: '환율 적용 + 누적 계산 + 담당자 검토 대기' },
];

const STEP_TIMING_MS = 1200;

function fmt(n: number, currency?: string) {
  const s = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return currency ? `${currency} ${s}` : s;
}

function krw(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<WorkflowStep>('idle');
  const [completedRows, setCompletedRows] = useState<StandardFormRow[]>([]);
  const [pendingRow, setPendingRow] = useState<StandardFormRow | null>(null);
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const selected = useMemo(
    () => INBOX_EMAILS.find((e) => e.id === selectedId) || null,
    [selectedId],
  );

  const classifiedCounts = useMemo(() => {
    return INBOX_EMAILS.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, []);

  async function runWorkflow(emailId: string) {
    setRunning(true);
    setStep('idle');
    setPendingRow(null);

    const e = INBOX_EMAILS.find((x) => x.id === emailId);
    if (!e || e.category !== 'FUND_INOUT') {
      setRunning(false);
      return;
    }

    // === Step 1: 메일 분류 (inbox 에이전트) ===
    setStep('classify');
    const inboxPromise = callStormAgent(
      'inbox',
      `메일 분류: ${e.subject} / 발신: ${e.from}`,
    );
    await Promise.all([
      inboxPromise,
      new Promise((r) => setTimeout(r, STEP_TIMING_MS)),
    ]);

    // === Step 2: 문서 분석 (시각 단계 — STORM Parse는 첨부 업로드 시 백엔드 자동 수행) ===
    setStep('parse');
    await new Promise((r) => setTimeout(r, STEP_TIMING_MS));

    // === Step 3·4: 투자자 코드 식별 + 거래 항목 표준화 (extractor 에이전트, RAG + 2 LLM) ===
    setStep('code_search');
    const extractorPromise = callStormAgent(
      'extractor',
      buildExtractorQuery(e),
    );
    await new Promise((r) => setTimeout(r, STEP_TIMING_MS));
    setStep('ontology');
    await Promise.all([
      extractorPromise,
      new Promise((r) => setTimeout(r, STEP_TIMING_MS)),
    ]);

    // === Step 5: 표준양식 변환 (normalizer 에이전트, 결정적 카드) ===
    setStep('normalize');
    const normalizerPromise = callStormAgent(
      'normalizer',
      `오늘 사모펀드 메일 처리: ${e.fundCase || 'unknown'} 케이스 - ${e.subject}`,
    );
    await Promise.all([
      normalizerPromise,
      new Promise((r) => setTimeout(r, STEP_TIMING_MS)),
    ]);

    // 표준양식 행 빌드
    const next = buildStandardRow(emailId, completedRows.length + 1);
    setPendingRow(next);
    setStep('confirm');
    setRunning(false);
  }

  function buildExtractorQuery(email: typeof INBOX_EMAILS[number]): string {
    switch (email.fundCase) {
      case 'apollo':
        return 'Apollo Global Private Equity Fund VIII Capital Call Notice에서 삼성화재(APO-VIII-LP-0083) 거래를 추출하고 표준 칼럼으로 매핑해 주세요.';
      case 'kkr':
        return 'KKR Asian Fund III Q1 2026 공통 노티스에서 삼성화재(S23) 행을 식별하고 표준 칼럼으로 매핑해 주세요.';
      case 'nippon':
        return 'Nippon Private Equity Partners Fund III Drawdown #5 (JPY) 노티스에서 삼성화재(NPE-III-LP-S23) 거래를 추출하고 표준 칼럼으로 매핑해 주세요.';
      case 'tiger':
        return 'Tiger Global Private Investment Partners XV Capital Account Statement에서 삼성화재(TG-XV-S23) 거래를 추출하고 용어를 표준 칼럼으로 매핑해 주세요.';
      case 'silverlake':
        return 'Silver Lake Partners VII Capital Call Notice #7에서 삼성화재(SLP-VII-IS-0042) 거래를 추출하고 표준 칼럼으로 매핑해 주세요.';
      default:
        return `${email.subject} 에서 삼성화재 거래를 추출하고 표준 칼럼으로 매핑해 주세요.`;
    }
  }

  function confirmRow() {
    if (!pendingRow) return;
    setCompletedRows((rows) => [
      ...rows,
      { ...pendingRow, confirmStatus: '확인완료' },
    ]);
    setPendingRow(null);
    setStep('done');
    if (autoMode) {
      // 자동 모드: 다음 FUND_INOUT 메일 처리
      const remaining = INBOX_EMAILS.filter(
        (e) =>
          e.category === 'FUND_INOUT' &&
          !completedRows.some((r) => r.investorCode === EXTRACTION_RESULTS[e.id]?.investorCode) &&
          e.id !== selectedId,
      );
      if (remaining.length > 0) {
        setTimeout(() => {
          setSelectedId(remaining[0].id);
          runWorkflow(remaining[0].id);
        }, 800);
      }
    }
  }

  function holdRow() {
    if (!pendingRow) return;
    setCompletedRows((rows) => [
      ...rows,
      { ...pendingRow, confirmStatus: '보류' },
    ]);
    setPendingRow(null);
    setStep('done');
  }

  function resetDemo() {
    setSelectedId(null);
    setStep('idle');
    setCompletedRows([]);
    setPendingRow(null);
    setRunning(false);
  }

  return (
    <div className="app">
      {/* ===== 헤더 ===== */}
      <header className="hdr">
        <div className="hdr-left">
          <div className="brand">
            <span className="brand-mark" />
            <span className="brand-name">해외 사모펀드 입출금 자동화 시스템</span>
          </div>
          <div className="hdr-sub">투자운용부 · 자산대사 등록</div>
        </div>
        <div className="hdr-right">
          <button className="btn-reset" onClick={resetDemo} disabled={running}>
            처음으로
          </button>
        </div>
      </header>

      {/* ===== 메인 그리드 ===== */}
      <div className="main">
        {/* 왼쪽: 공용 메일함 */}
        <section className="pane inbox">
          <div className="pane-hdr">
            <div className="pane-title">
              공용 수신함
              <span className="pane-meta">
                총 {INBOX_EMAILS.length}건 · 입출금{' '}
                <span className="bdg bdg-fund">
                  {classifiedCounts.FUND_INOUT}
                </span>{' '}
                · 기타{' '}
                <span className="bdg bdg-non">{classifiedCounts.NON_FUND}</span>
              </span>
            </div>
          </div>
          <ul className="mail-list">
            {INBOX_EMAILS.map((m) => (
              <li
                key={m.id}
                className={`mail-card ${m.category} ${
                  selectedId === m.id ? 'sel' : ''
                }`}
                onClick={() => !running && setSelectedId(m.id)}
              >
                <div className="mail-row1">
                  <span className={`bdg bdg-${
                    m.category === 'FUND_INOUT' ? 'fund' : 'non'
                  }`}>
                    {m.category === 'FUND_INOUT' ? '입출금' : '기타'}
                  </span>
                  <span className="mail-from">{m.from.replace(/<[^>]+>/, '').trim()}</span>
                  <span className="mail-time">{m.receivedAt.slice(11)}</span>
                </div>
                <div className="mail-subject">
                  {m.hasAttachment && <span className="clip">📎</span>}
                  {m.subject}
                </div>
                <div className="mail-preview">{m.preview}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* 오른쪽: 상세 + 워크플로 */}
        <section className="pane detail">
          {!selected ? (
            <div className="empty">
              <div className="empty-emoji">📥</div>
              <div className="empty-msg">왼쪽에서 메일을 선택하세요</div>
              <div className="empty-sub">
                입출금 관련 메일을 선택하면 자동 처리가 시작됩니다.
              </div>
            </div>
          ) : (
            <>
              {/* 메일 헤더·본문 */}
              <div className="detail-mail">
                <div className="detail-mail-from">
                  <span className={`bdg bdg-${
                    selected.category === 'FUND_INOUT' ? 'fund' : 'non'
                  }`}>
                    {selected.category === 'FUND_INOUT' ? '입출금' : '기타'}
                  </span>
                  {selected.from} · {selected.receivedAt}
                </div>
                <div className="detail-mail-subj">{selected.subject}</div>
                {selected.hasAttachment && selected.attachmentName && (
                  <div className="detail-attachment">
                    📎 {selected.attachmentName}
                  </div>
                )}
                <pre className="detail-mail-body">{selected.body}</pre>
                {selected.category === 'FUND_INOUT' && step === 'idle' && (
                  <div className="cta">
                    <label className="auto-toggle">
                      <input
                        type="checkbox"
                        checked={autoMode}
                        onChange={(e) => setAutoMode(e.target.checked)}
                        disabled={running}
                      />
                      연속 처리 모드 (검토 완료 시 다음 입출금 메일 자동 진행)
                    </label>
                    <button
                      className="btn-primary"
                      onClick={() => runWorkflow(selected.id)}
                      disabled={running}
                    >
                      자동 처리 시작
                    </button>
                  </div>
                )}
                {selected.category === 'NON_FUND' && (
                  <div className="non-note">
                    이 메일은 입출금 관련이 아닙니다. 처리 큐에 진입하지 않습니다.
                  </div>
                )}
              </div>

              {/* 워크플로 진행 */}
              {selected.category === 'FUND_INOUT' && step !== 'idle' && (
                <div className="workflow">
                  <div className="wf-title">처리 단계</div>
                  <ol className="wf-steps">
                    {STEPS.map((s) => {
                      const idx = STEPS.findIndex((x) => x.key === step);
                      const myIdx = STEPS.findIndex((x) => x.key === s.key);
                      const isDone =
                        step === 'confirm' || step === 'done' || myIdx < idx;
                      const isActive = step === s.key;
                      return (
                        <li
                          key={s.key}
                          className={`wf-step ${isDone ? 'done' : ''} ${
                            isActive ? 'active' : ''
                          }`}
                        >
                          <span className="wf-bullet">
                            {isDone ? '✓' : isActive ? '●' : '○'}
                          </span>
                          <div className="wf-step-body">
                            <div className="wf-step-label">{s.label}</div>
                            <div className="wf-step-pain">{s.desc}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* 추출 결과 (코드검색 이후) */}
              {selected.category === 'FUND_INOUT' &&
                ['code_search', 'ontology', 'normalize', 'confirm', 'done'].includes(
                  step,
                ) &&
                EXTRACTION_RESULTS[selected.id] && (
                  <Extraction emailId={selected.id} />
                )}

              {/* 컨펌 단계 */}
              {step === 'confirm' && pendingRow && (
                <div className="confirm-box">
                  <div className="confirm-title">
                    담당자 검토 (자동 확정 안 함)
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-col">
                      <div className="confirm-label">입력 예정 거래</div>
                      <RowPreview row={pendingRow} />
                    </div>
                    <div className="confirm-col">
                      <div className="confirm-label">원본 위치</div>
                      <div className="evidence">
                        <div className="evidence-mark">
                          ▸ {EXTRACTION_RESULTS[selected.id]?.matchRowContext}
                        </div>
                        <div className="evidence-note">
                          원본 문서에서 해당 위치가 함께 표시됩니다.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="confirm-actions">
                    <button className="btn-confirm" onClick={confirmRow}>
                      검토 완료 (확정 등록)
                    </button>
                    <button className="btn-hold" onClick={holdRow}>
                      보류
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* 하단: 표준양식 시트 */}
      <section className="form-pane">
        <div className="form-hdr">
          <div className="form-title">
            자산대사 등록 현황 (해외사모펀드 입출금)
          </div>
          <div className="form-meta">
            누적 {completedRows.length}건
            <span className="bdg-mini bdg-confirm">
              확정 {completedRows.filter((r) => r.confirmStatus === '확인완료').length}
            </span>
            <span className="bdg-mini bdg-hold">
              보류 {completedRows.filter((r) => r.confirmStatus === '보류').length}
            </span>
          </div>
        </div>
        <div className="form-scroll">
          <table className="form-table">
            <thead>
              <tr>
                <th>#</th>
                <th>처리일자</th>
                <th>펀드사</th>
                <th>거래구분</th>
                <th>거래일자</th>
                <th>외화금액</th>
                <th>통화</th>
                <th>환율</th>
                <th>KRW 환산</th>
                <th>누적 Drawdown</th>
                <th>누적 Distribution</th>
                <th>Investor Code</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {completedRows.length === 0 && (
                <tr>
                  <td colSpan={14} className="empty-row">
                    (아직 등록된 행 없음. 입출금 메일 선택 후 자동 처리 시작)
                  </td>
                </tr>
              )}
              {completedRows.map((r) => (
                <tr key={r.serial} className={`row-${r.confirmStatus}`}>
                  <td>{r.serial}</td>
                  <td>{r.processedAt}</td>
                  <td className="ellipsis" title={r.fundManager}>
                    {r.fundManager}
                  </td>
                  <td>{r.txnType}</td>
                  <td>{r.txnDate}</td>
                  <td className="num">{fmt(r.fxAmount)}</td>
                  <td>{r.currency}</td>
                  <td className="num">{r.fxRate}</td>
                  <td className="num">{krw(r.krwAmount)}</td>
                  <td className="num">{r.cumulativeDrawn > 0 ? fmt(r.cumulativeDrawn) : '-'}</td>
                  <td className="num">{r.cumulativeDistribution > 0 ? fmt(r.cumulativeDistribution) : '-'}</td>
                  <td>{r.investorCode}</td>
                  <td>
                    <span className={`bdg-mini bdg-${
                      r.confirmStatus === '확인완료' ? 'confirm'
                      : r.confirmStatus === '보류' ? 'hold' : 'need'
                    }`}>
                      {r.confirmStatus === '확인완료' ? '확정'
                      : r.confirmStatus === '보류' ? '보류' : '검토 대기'}
                    </span>
                  </td>
                  <td className="ellipsis" title={r.note}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Extraction({ emailId }: { emailId: string }) {
  const ex = EXTRACTION_RESULTS[emailId];
  if (!ex) return null;
  return (
    <div className="extraction">
      <div className="extraction-title">추출 결과</div>
      <div className="extraction-grid">
        <div className="ex-cell">
          <div className="ex-label">투자자 코드</div>
          <div className="ex-value mono">{ex.investorCode}</div>
          <div className="ex-sub">
            신뢰도 {ex.matchConfidence.toFixed(1)}%, 단일 매칭
          </div>
          <div className="ex-evidence">▸ {ex.matchRowContext}</div>
        </div>
        <div className="ex-cell">
          <div className="ex-label">거래 정보</div>
          <div className="ex-value">
            <span className={`bdg bdg-${
              ex.txnType === 'Capital Call' ? 'call' : 'dist'
            }`}>
              {ex.txnType}
            </span>{' '}
            · {ex.txnDate}
          </div>
          <div className="ex-value mono">
            {ex.currency} {ex.amount.toLocaleString('en-US')}
          </div>
        </div>
      </div>
      <div className="ontology-table">
        <div className="ex-label">용어 표준화</div>
        <table>
          <thead>
            <tr>
              <th>원본 용어</th>
              <th>표준 칼럼</th>
              <th>값</th>
            </tr>
          </thead>
          <tbody>
            {ex.ontologyMappings.map((m, i) => (
              <tr key={i}>
                <td className="src">{m.sourceTerm}</td>
                <td className="std mono">{m.standardColumn}</td>
                <td className="val mono">
                  {typeof m.value === 'number'
                    ? m.value.toLocaleString('en-US')
                    : m.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowPreview({ row }: { row: StandardFormRow }) {
  return (
    <div className="row-preview">
      <div className="rp-r">
        <span className="rp-k">펀드사:</span>
        <span className="rp-v">{row.fundManager}</span>
      </div>
      <div className="rp-r">
        <span className="rp-k">거래구분:</span>
        <span className="rp-v">{row.txnType}</span>
      </div>
      <div className="rp-r">
        <span className="rp-k">외화금액:</span>
        <span className="rp-v mono">
          {row.currency} {row.fxAmount.toLocaleString('en-US')}
        </span>
      </div>
      <div className="rp-r">
        <span className="rp-k">KRW 환산:</span>
        <span className="rp-v mono">
          {row.krwAmount.toLocaleString('ko-KR')}원 (× {row.fxRate})
        </span>
      </div>
      <div className="rp-r">
        <span className="rp-k">Investor Code:</span>
        <span className="rp-v mono">{row.investorCode}</span>
      </div>
      <div className="rp-r">
        <span className="rp-k">상태:</span>
        <span className="rp-v warn">검토 대기</span>
      </div>
    </div>
  );
}
