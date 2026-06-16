import type { AgentAnswer, AgentMode } from './types';
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
// 실엔진 호출 실패 시 사전검증 mock으로 폴백하여 시연 안정성 보장
//
// ⚠️ USE_REAL_ENGINE: 2026-06-16 기준 sample 계정의 지급/가입/법령 에이전트가
// 한국평가데이터(감정평가) 버킷으로 오염되어 보험 답변 불가. 에이전트 복구 후 true로 전환.
const USE_REAL_ENGINE = false;
const IS_DEV = import.meta.env.MODE !== 'production';

const MODE_CONFIG: Record<AgentMode, { agentId: string; proxyPath: string; role: string }> = {
  payment: {
    agentId: (import.meta.env.VITE_STORM_AGENT_PAYMENT as string) || '7459166683076595712',
    proxyPath: '/storm-api/payment',
    role: 'payment',
  },
  underwriting: {
    agentId: (import.meta.env.VITE_STORM_AGENT_UNDERWRITING as string) || '7459177960662470656',
    proxyPath: '/storm-api/underwriting',
    role: 'underwriting',
  },
  law_compare: {
    agentId: (import.meta.env.VITE_STORM_AGENT_LAW as string) || '7459179836053196800',
    proxyPath: '/storm-api/law',
    role: 'law',
  },
};

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

    const parsed = JSON.parse(rawAnswer) as AgentAnswer;
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

export const callPaymentReviewAgent = (q: string) => callStormAgent('payment', q);
