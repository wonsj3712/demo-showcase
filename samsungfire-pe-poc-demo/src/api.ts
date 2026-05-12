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

  try {
    const res = await fetch(
      `${cfg.proxyPath}/api/v2/answer/agents/${cfg.agentId}/chat`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      },
    );
    // 401·403·404·5xx 등 STORM API 호출이 실패하면 조용히 mock으로 폴백.
    // 라이브 시연 안정성 우선. 콘솔에는 1줄 경고만 남김.
    if (!res.ok) {
      if (typeof console !== 'undefined') {
        console.warn(
          `[storm] ${role} HTTP ${res.status} · ${cfg.envKey} 미설정 또는 권한 미부여로 추정 · mock 폴백`,
        );
      }
      return mockResult(role, question, t0);
    }
    const body = await res.json();
    const answer =
      body?.data?.answer ?? body?.data?.chat?.answer ?? body?.answer ?? '';
    return {
      rawAnswer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      elapsedMs: performance.now() - t0,
      isMock: false,
    };
  } catch (e: any) {
    if (typeof console !== 'undefined') {
      console.warn(`[storm] ${role} fetch error · mock 폴백`, e?.message);
    }
    return mockResult(role, question, t0);
  }
}

export function isMockMode() {
  return IS_MOCK_MODE;
}
