import type { AgentRole } from './types';

const IS_MOCK_MODE = import.meta.env.MODE === 'production';

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
  error?: string;
};

export async function callStormAgent(
  role: AgentRole,
  question: string,
): Promise<StormCallResult> {
  const cfg = ROLE_CONFIG[role];
  if (IS_MOCK_MODE || !cfg.agentId) {
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 800));
    return {
      rawAnswer: `[MOCK ${role}] OK · ${question.slice(0, 40)}`,
      elapsedMs: performance.now() - t0,
      isMock: true,
    };
  }
  const t0 = performance.now();
  try {
    const res = await fetch(
      `${cfg.proxyPath}/api/v2/answer/agents/${cfg.agentId}/chat`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      },
    );
    const body = await res.json();
    const answer =
      body?.data?.answer ?? body?.data?.chat?.answer ?? body?.answer ?? '';
    return {
      rawAnswer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      elapsedMs: performance.now() - t0,
      isMock: false,
      error: !res.ok ? `HTTP ${res.status}` : undefined,
    };
  } catch (e: any) {
    return {
      rawAnswer: '',
      elapsedMs: performance.now() - t0,
      isMock: false,
      error: e?.message || 'fetch error',
    };
  }
}

export function isMockMode() {
  return IS_MOCK_MODE;
}
