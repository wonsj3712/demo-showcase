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

// PROD 빌드(GitHub Pages 호스팅) = mock-only 모드.
// CORS·토큰 노출 회피. 사전 검증된 정답값(6,700만/조건부 승인/변경 5건)으로 시연 안정성 100%.
// dev 환경(bun run dev)은 Vite proxy로 STORM 실연동 가능.
const IS_MOCK_MODE = import.meta.env.MODE === 'production';

const MODE_CONFIG: Record<AgentMode, { agentId: string; proxyPath: string }> = {
  payment: {
    agentId: (import.meta.env.VITE_STORM_AGENT_PAYMENT as string) || '',
    proxyPath: '/storm-api/payment',
  },
  underwriting: {
    agentId: (import.meta.env.VITE_STORM_AGENT_UNDERWRITING as string) || '',
    proxyPath: '/storm-api/underwriting',
  },
  law_compare: {
    agentId: (import.meta.env.VITE_STORM_AGENT_LAW as string) || '',
    proxyPath: '/storm-api/law',
  },
};

export type StormCallResult = {
  answer: AgentAnswer;
  rawAnswer: string;
  elapsedMs: number;
  isMock: boolean;
};

export async function callStormAgent(
  mode: AgentMode,
  question: string
): Promise<StormCallResult> {
  if (IS_MOCK_MODE) {
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 1500));
    return {
      answer: FALLBACK_BY_MODE[mode],
      rawAnswer: JSON.stringify(FALLBACK_BY_MODE[mode]),
      elapsedMs: performance.now() - t0,
      isMock: true,
    };
  }

  const cfg = MODE_CONFIG[mode];
  const url = `${cfg.proxyPath}/api/v2/answer`;
  const payload = {
    agentId: cfg.agentId,
    question,
    message: question,
    input: question,
  };

  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`STORM API ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as ChatResponse;
  const rawAnswer = json.data?.chat?.answer ?? json.data?.answer ?? json.answer;
  if (!rawAnswer) {
    throw new Error(`응답에 answer 필드 없음: ${JSON.stringify(json).slice(0, 200)}`);
  }

  let parsed: AgentAnswer;
  try {
    parsed = JSON.parse(rawAnswer) as AgentAnswer;
  } catch (e) {
    throw new Error(
      `JSON 파싱 실패: ${(e as Error).message}\n응답: ${rawAnswer.slice(0, 200)}`
    );
  }

  return {
    answer: parsed,
    rawAnswer,
    elapsedMs: performance.now() - t0,
    isMock: false,
  };
}

export const callPaymentReviewAgent = (q: string) => callStormAgent('payment', q);
