import type { AgentRole } from './types';

const IS_MOCK_MODE = import.meta.env.MODE === 'production';

const ROLE_CONFIG: Record<AgentRole, { agentId: string; proxyPath: string; envKey: string }> = {
  inbox: {
    agentId: (import.meta.env.VITE_STORM_AGENT_INBOX as string) || '7459748294933057536',
    proxyPath: '/storm-api/inbox',
    envKey: 'VITE_STORM_KEY_INBOX',
  },
  extractor: {
    agentId: (import.meta.env.VITE_STORM_AGENT_EXTRACTOR as string) || '7459748327345979392',
    proxyPath: '/storm-api/extractor',
    envKey: 'VITE_STORM_KEY_EXTRACTOR',
  },
  normalizer: {
    agentId: (import.meta.env.VITE_STORM_AGENT_NORMALIZER as string) || '7459738748749533184',
    proxyPath: '/storm-api/normalizer',
    envKey: 'VITE_STORM_KEY_NORMALIZER',
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

  if (IS_MOCK_MODE || !cfg.agentId) {
    await new Promise((r) => setTimeout(r, 700));
    return mockResult(role, question, t0);
  }

  // s-life-insurance-poc-demo와 동일한 endpoint·payload 패턴
  const url = `${cfg.proxyPath}/api/v2/answer`;
  const payload = {
    agentId: cfg.agentId,
    question,
    message: question,
    input: question,
  };

  try {
    if (typeof console !== 'undefined') {
      console.log(`[storm] → ${role} POST ${url}`, { agentId: cfg.agentId, q: question.slice(0, 80) });
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (typeof console !== 'undefined') {
        console.warn(`[storm] ✗ ${role} HTTP ${res.status} · mock 폴백`, errText.slice(0, 200));
      }
      return mockResult(role, question, t0);
    }

    const body = await res.json();
    const answer =
      body?.data?.chat?.answer ?? body?.data?.answer ?? body?.answer ?? '';
    if (typeof console !== 'undefined') {
      console.log(`[storm] ✓ ${role} ${(performance.now() - t0).toFixed(0)}ms`, String(answer).slice(0, 100));
    }
    return {
      rawAnswer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      elapsedMs: performance.now() - t0,
      isMock: false,
    };
  } catch (e: any) {
    if (typeof console !== 'undefined') {
      console.warn(`[storm] ✗ ${role} fetch error · mock 폴백`, e?.message);
    }
    return mockResult(role, question, t0);
  }
}

export function isMockMode() {
  return IS_MOCK_MODE;
}
