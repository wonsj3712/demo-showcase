import type { AgentRole } from './types';

// dev(bun run dev): Vite proxy(/storm-api/*)로 STORM 직접 연동
// prod(Vercel): 서버리스 프록시(/api/storm/{role})로 연동 — 키는 서버에만 존재
// 호출 실패 시 mock 폴백(시연 안정성)
//
// ⚠️ USE_REAL_ENGINE: 2026-06-16 기준 sample 계정의 inbox/extractor/normalizer 에이전트가
// 한국평가데이터(감정평가) 버킷으로 오염되어 펀드 메일 처리 불가. 에이전트 복구 후 true로 전환.
const USE_REAL_ENGINE = false;
const IS_DEV = import.meta.env.MODE !== 'production';

const ROLE_CONFIG: Record<AgentRole, { agentId: string; proxyPath: string }> = {
  inbox: {
    agentId: (import.meta.env.VITE_STORM_AGENT_INBOX as string) || '7459748294933057536',
    proxyPath: '/storm-api/inbox',
  },
  extractor: {
    agentId: (import.meta.env.VITE_STORM_AGENT_EXTRACTOR as string) || '7459748327345979392',
    proxyPath: '/storm-api/extractor',
  },
  normalizer: {
    agentId: (import.meta.env.VITE_STORM_AGENT_NORMALIZER as string) || '7459738748749533184',
    proxyPath: '/storm-api/normalizer',
  },
};

export type StormCallResult = {
  rawAnswer: string;
  elapsedMs: number;
  isMock: boolean;
};

function mockResult(role: AgentRole, question: string, started: number): StormCallResult {
  return {
    rawAnswer: `[MOCK ${role}] OK · ${question.slice(0, 40)}`,
    elapsedMs: performance.now() - started,
    isMock: true,
  };
}

export async function callStormAgent(
  role: AgentRole,
  question: string,
): Promise<StormCallResult> {
  const cfg = ROLE_CONFIG[role];
  const t0 = performance.now();

  // prod에서 실엔진 비활성 시 mock 사용 (시연 안정성)
  if (!IS_DEV && !USE_REAL_ENGINE) {
    await new Promise((r) => setTimeout(r, 700));
    return mockResult(role, question, t0);
  }

  const url = IS_DEV ? `${cfg.proxyPath}/api/v2/answer` : `/api/storm/${role}`;
  const payload = {
    agentId: cfg.agentId,
    question,
    message: question,
    input: question,
  };

  try {
    console.log(`[storm] → ${role} POST ${url}`, { q: question.slice(0, 80) });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[storm] ✗ ${role} HTTP ${res.status} · mock 폴백`, errText.slice(0, 200));
      return mockResult(role, question, t0);
    }

    const body = await res.json();
    const answer =
      body?.data?.chat?.answer ?? body?.data?.answer ?? body?.answer ?? '';
    if (!answer) {
      console.warn(`[storm] ✗ ${role} 응답에 answer 없음 · mock 폴백`);
      return mockResult(role, question, t0);
    }
    console.log(`[storm] ✓ ${role} ${(performance.now() - t0).toFixed(0)}ms`);
    return {
      rawAnswer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      elapsedMs: performance.now() - t0,
      isMock: false,
    };
  } catch (e: any) {
    console.warn(`[storm] ✗ ${role} fetch error · mock 폴백`, e?.message);
    return mockResult(role, question, t0);
  }
}

export function isMockMode() {
  return false;
}
