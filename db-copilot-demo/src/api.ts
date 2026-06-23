import type { AgentAnswer, AgentMode, CustomerProfile } from './types';
import { FALLBACK_BY_MODE } from './mockData';

type ChatResponse = {
  status: string;
  data?: {
    answer?: string;
    threadId?: string;
    chat?: { id?: string; answer?: string; question?: string };
  };
  answer?: string;
};

// dev(bun run dev): Vite proxy(/storm-api/*)로 STORM 직접 연동
// prod(Vercel): 서버리스 프록시(/api/storm/{role})로 연동 — 키는 서버에만 존재
// 실엔진 호출 실패/콜드스타트 시 사전검증 mock으로 폴백하여 시연 안정성 보장
const USE_REAL_ENGINE = true;
const IS_DEV = import.meta.env.MODE !== 'production';

// 회사별 STORM 에이전트 (DB손해보험)
const MODE_CONFIG: Record<AgentMode, { agentId: string; proxyPath: string; role: string }> = {
  copilot: {
    agentId: (import.meta.env.VITE_STORM_AGENT_COPILOT as string) || '7475031707699269632',
    proxyPath: '/storm-api/copilot',
    role: 'db_copilot',
  },
  qa: {
    agentId: (import.meta.env.VITE_STORM_AGENT_QA as string) || '7475031927252017152',
    proxyPath: '/storm-api/qa',
    role: 'db_qa',
  },
};

// 고객 프로필 → 코파일럿 에이전트 질의문 구성 (RAG 검색·분석 입력)
export function buildCopilotQuery(p: CustomerProfile): string {
  return [
    `고객 프로필: ${p.age}세 ${p.gender}, 직업 ${p.job}, 가입시점 ${p.joinDate}.`,
    `보유 계약: ${p.contracts.length ? p.contracts.join(', ') : '없음'}.`,
    `관심사/상담 요청: ${p.interest}`,
  ].join('\n');
}

export type StormCallResult = {
  answer: AgentAnswer;
  rawAnswer: string;
  elapsedMs: number;
  isMock: boolean;
};

function mockFallback(mode: AgentMode, t0: number): StormCallResult {
  return {
    answer: FALLBACK_BY_MODE[mode],
    rawAnswer: JSON.stringify(FALLBACK_BY_MODE[mode]),
    elapsedMs: performance.now() - t0,
    isMock: true,
  };
}

export async function callStormAgent(
  mode: AgentMode,
  question: string
): Promise<StormCallResult> {
  const cfg = MODE_CONFIG[mode];
  const t0 = performance.now();

  // prod에서 실엔진 비활성 시 사전검증 mock 사용 (시연 안정성)
  if (!IS_DEV && !USE_REAL_ENGINE) {
    await new Promise((r) => setTimeout(r, 1200));
    return mockFallback(mode, t0);
  }

  const url = IS_DEV ? `${cfg.proxyPath}/api/v2/answer` : `/api/storm/${cfg.role}`;
  const payload = {
    agentId: cfg.agentId,
    question,
    message: question,
    input: question,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[storm] ✗ ${mode} HTTP ${res.status} · mock 폴백`);
      return mockFallback(mode, t0);
    }

    const json = (await res.json()) as ChatResponse;
    const rawAnswer = json.data?.chat?.answer ?? json.data?.answer ?? json.answer;
    if (!rawAnswer) {
      console.warn(`[storm] ✗ ${mode} 응답에 answer 없음 · mock 폴백`);
      return mockFallback(mode, t0);
    }

    let raw = String(rawAnswer).trim();
    // STORM LLM이 코드펜스로 감싸 보내는 경우 제거
    if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
    // 본문 앞뒤 잡텍스트가 있어도 JSON 객체만 안전 추출
    const s = raw.indexOf('{');
    const e = raw.lastIndexOf('}');
    if (s > 0 || e < raw.length - 1) {
      if (s >= 0 && e > s) raw = raw.slice(s, e + 1);
    }
    const parsed = JSON.parse(raw) as AgentAnswer;
    return {
      answer: parsed,
      rawAnswer,
      elapsedMs: performance.now() - t0,
      isMock: false,
    };
  } catch (e) {
    console.warn(`[storm] ✗ ${mode} ${(e as Error).message} · mock 폴백`);
    return mockFallback(mode, t0);
  }
}
