import { useMemo, useState } from 'react';
import type {
  InboxEmail,
  StandardFormRow,
  WorkflowStep,
} from './types';
import {
  INBOX_EMAILS,
  EXTRACTION_RESULTS,
  buildStandardRow,
  ONTOLOGY_DICT,
  PE_FACTS,
} from './mockData';
import { callStormAgent, isMockMode } from './api';

const STEPS: { key: WorkflowStep; label: string; pain: string }[] = [
  { key: 'classify', label: 'N0 메일 분류',     pain: '공용 메일함 中 입출금 메일만 추출' },
  { key: 'parse',    label: 'N1 PDF 파싱',      pain: 'VLM 듀얼 파싱 — 병합셀·줄글·다중 통화' },
  { key: 'code_search', label: 'N2 회사 코드 검색', pain: '공통 노티스에서 S23 매칭 (회의록 발화자 6)' },
  { key: 'ontology', label: 'N3 온톨로지 매핑', pain: '펀드사별 용어 → 표준 칼럼 (회의록 발화자 4)' },
  { key: 'normalize', label: 'N4 표준양식 출력', pain: 'USD/EUR/JPY 환산 + 컨펌상태 확인필요' },
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
  const [stormElapsed, setStormElapsed] = useState<number | null>(null);
  const [stormError, setStormError] = useState<string | null>(null);

  const mock = isMockMode();
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
    setStormError(null);
    setStormElapsed(null);
    setStep('idle');
    setPendingRow(null);

    // (1) Optional: 실 STORM 호출 (mock 모드 아니고 첫 단계만 실연동 시도)
    const e = INBOX_EMAILS.find((x) => x.id === emailId);
    if (e && e.category === 'FUND_INOUT') {
      try {
        const r = await callStormAgent(
          'inbox',
          `메일 분류: ${e.subject} / 발신: ${e.from}`,
        );
        setStormElapsed(r.elapsedMs);
        if (r.error) setStormError(r.error);
      } catch (err: any) {
        setStormError(err?.message || 'storm call error');
      }
    }

    // (2) 단계별 visual
    for (const s of STEPS) {
      setStep(s.key);
      await new Promise((r) => setTimeout(r, STEP_TIMING_MS));
    }

    // (3) 표준양식 행 빌드
    const next = buildStandardRow(emailId, completedRows.length + 1);
    setPendingRow(next);
    setStep('confirm');
    setRunning(false);
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
    setStormElapsed(null);
    setStormError(null);
  }

  return (
    <div className="app">
      {/* ===== 헤더 ===== */}
      <header className="hdr">
        <div className="hdr-left">
          <div className="brand">
            <span className="brand-mark" />
            <span className="brand-name">Sionic STORM</span>
            <span className="brand-x">×</span>
            <span className="brand-customer">삼성화재</span>
          </div>
          <div className="hdr-sub">해외 사모펀드 입출금 자동화 — PoC 데모</div>
        </div>
        <div className="hdr-right">
          <span className={`mode-pill ${mock ? 'mock' : 'live'}`}>
            {mock ? 'MOCK 모드 (안정 시연)' : 'LIVE STORM 연동'}
          </span>
          {stormElapsed !== null && (
            <span className="storm-elapsed">
              STORM 응답 {stormElapsed.toFixed(0)}ms
            </span>
          )}
          {stormError && (
            <span className="storm-err" title={stormError}>
              ⚠ {stormError.slice(0, 30)}
            </span>
          )}
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
              공용 메일함
              <span className="pane-meta">
                총 {INBOX_EMAILS.length}건 · 입출금{' '}
                <span className="bdg bdg-fund">
                  {classifiedCounts.FUND_INOUT}
                </span>{' '}
                · 비업무{' '}
                <span className="bdg bdg-non">{classifiedCounts.NON_FUND}</span>
              </span>
            </div>
            <div className="pane-hint">
              회의록 발화자 6: "공용 메일에 모든 메일이 들어옴, 입출금은 일부"
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
                    {m.category === 'FUND_INOUT' ? '입출금' : '비업무'}
                  </span>
                  <span className="mail-from">{m.from}</span>
                  <span className="mail-time">{m.receivedAt.slice(11)}</span>
                </div>
                <div className="mail-subject">
                  {m.hasAttachment && <span className="clip">📎</span>}
                  {m.subject}
                </div>
                <div className="mail-preview">{m.preview}</div>
                <div className="mail-reason">↳ {m.classifyReason}</div>
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
                입출금 메일을 선택하면 5단 자동화 워크플로가 시연됩니다.
              </div>
            </div>
          ) : (
            <>
              {/* 메일 헤더 */}
              <div className="detail-mail">
                <div className="detail-mail-from">
                  <span className={`bdg bdg-${
                    selected.category === 'FUND_INOUT' ? 'fund' : 'non'
                  }`}>
                    {selected.category === 'FUND_INOUT' ? '입출금' : '비업무'}
                  </span>
                  {selected.from} · {selected.receivedAt}
                </div>
                <div className="detail-mail-subj">{selected.subject}</div>
                <div className="detail-mail-body">{selected.preview}</div>
                {selected.category === 'FUND_INOUT' && step === 'idle' && (
                  <div className="cta">
                    <label className="auto-toggle">
                      <input
                        type="checkbox"
                        checked={autoMode}
                        onChange={(e) => setAutoMode(e.target.checked)}
                        disabled={running}
                      />
                      자동 모드 (확인완료 시 다음 입출금 메일 자동 처리)
                    </label>
                    <button
                      className="btn-primary"
                      onClick={() => runWorkflow(selected.id)}
                      disabled={running}
                    >
                      이 메일 자동 처리 시작 →
                    </button>
                  </div>
                )}
                {selected.category === 'NON_FUND' && (
                  <div className="non-note">
                    이 메일은 입출금 관련이 아닙니다 (NON_FUND). 처리 큐에 진입하지 않습니다.
                  </div>
                )}
              </div>

              {/* 워크플로 진행 */}
              {selected.category === 'FUND_INOUT' && step !== 'idle' && (
                <div className="workflow">
                  <div className="wf-title">에이전트 워크플로 진행</div>
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
                            <div className="wf-step-pain">{s.pain}</div>
                            {isActive && s.key === 'parse' && (
                              <div className="wf-step-detail">
                                VLM 듀얼 파싱 진행 중 · 평균 {PE_FACTS.parseSeconds}초 (KPI ≤ 30초)
                              </div>
                            )}
                            {isActive && s.key === 'code_search' &&
                              selected.fundCase === 'kkr' && (
                                <div className="wf-step-detail">
                                  30개 LP 중 <b>S23</b> 행 매칭 검색 중...
                                </div>
                              )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* 추출 결과 (parse 이후) */}
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
                    ⚠ 사람 컨펌 단계 — 자동 확정 절대 안 됨
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-col">
                      <div className="confirm-label">표준양식 입력 예정 행</div>
                      <RowPreview row={pendingRow} />
                    </div>
                    <div className="confirm-col">
                      <div className="confirm-label">원본 위치 (검증)</div>
                      <div className="evidence">
                        <div className="evidence-mark">
                          ▸ {EXTRACTION_RESULTS[selected.id]?.matchRowContext}
                        </div>
                        <div className="evidence-note">
                          원본 PDF 뷰어에서 해당 위치 하이라이팅 표시 (실 운영 환경)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="confirm-actions">
                    <button className="btn-confirm" onClick={confirmRow}>
                      ✓ 확인완료 (표준양식 입력)
                    </button>
                    <button className="btn-hold" onClick={holdRow}>
                      ⏸ 보류 (재검토)
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
            T_삼성화재_자산대사_표준양식.xlsx · 시트1 "해외사모펀드_입출금"
          </div>
          <div className="form-meta">
            누적 행 {completedRows.length}건 · 컨펌상태별
            <span className="bdg-mini bdg-confirm">
              완료 {completedRows.filter((r) => r.confirmStatus === '확인완료').length}
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
                <th>컨펌상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {completedRows.length === 0 && (
                <tr>
                  <td colSpan={14} className="empty-row">
                    (아직 처리된 행 없음 — 입출금 메일 선택 후 자동 처리 시작)
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
                  <td className="num">{r.cumulativeDrawn > 0 ? fmt(r.cumulativeDrawn) : '—'}</td>
                  <td className="num">{r.cumulativeDistribution > 0 ? fmt(r.cumulativeDistribution) : '—'}</td>
                  <td>{r.investorCode}</td>
                  <td>
                    <span className={`bdg-mini bdg-${
                      r.confirmStatus === '확인완료' ? 'confirm'
                      : r.confirmStatus === '보류' ? 'hold' : 'need'
                    }`}>
                      {r.confirmStatus}
                    </span>
                  </td>
                  <td className="ellipsis" title={r.note}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 푸터: PoC ↔ 본사업 경계 */}
      <footer className="ftr">
        <div className="ftr-title">PoC 범위 / 본사업 SI 영역 — 항상 같이 보여드림</div>
        <div className="ftr-grid">
          <div className="ftr-cell ftr-poc">
            <div className="ftr-cell-h">PoC (오늘 시연 ✓)</div>
            <ul>
              <li>공용 메일함 분류 (95%+)</li>
              <li>STORM Parse VLM 듀얼 파싱</li>
              <li>회사 코드 S23 매칭 (99%+)</li>
              <li>온톨로지 매핑 ({PE_FACTS.ontologyRules}개 룰)</li>
              <li>USD/EUR/JPY 환산</li>
              <li>표준양식 + 사람 컨펌</li>
            </ul>
          </div>
          <div className="ftr-cell ftr-si">
            <div className="ftr-cell-h">본사업 SI 영역 (사이오닉 + SI 파트너)</div>
            <ul>
              <li>녹스 메일 직접 연동</li>
              <li>ERP 자동 입력</li>
              <li>SWIFT MT202 전문 자동 생성</li>
              <li>암호 PDF 해제 모듈</li>
              <li>회사 코드 마스터 / 온톨로지 운영 UI</li>
              <li>폐쇄망 온프레미스 구축</li>
            </ul>
          </div>
        </div>
      </footer>
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
          <div className="ex-label">회사 코드 매칭</div>
          <div className="ex-value mono">{ex.investorCode}</div>
          <div className="ex-sub">
            신뢰도 {ex.matchConfidence.toFixed(1)}% · 단일 매칭
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
        <div className="ex-label">온톨로지 매핑 (펀드사 용어 → 표준 칼럼)</div>
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
          {row.krwAmount.toLocaleString('ko-KR')} 원 (× {row.fxRate})
        </span>
      </div>
      <div className="rp-r">
        <span className="rp-k">Investor Code:</span>
        <span className="rp-v mono">{row.investorCode}</span>
      </div>
      <div className="rp-r">
        <span className="rp-k">컨펌상태:</span>
        <span className="rp-v warn">{row.confirmStatus}</span>
      </div>
    </div>
  );
}
