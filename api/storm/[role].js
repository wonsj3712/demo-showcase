// STORM 에이전트 프록시 (Vercel Serverless)
// 프론트(s-life / samsungfire 데모)가 /api/storm/{role} 로 POST하면
// storm-api-key(환경변수)를 붙여 STORM live API로 중계한다. 키는 클라이언트에 노출되지 않는다.
const STORM_API = 'https://live-stargate.sionic.im/api/v2/answer';

// agentId는 공개 정보라 하드코딩, 키만 환경변수에서 주입
const AGENTS = {
  payment:      { id: '7472850492290461696', key: process.env.STORM_KEY_PAYMENT },
  underwriting: { id: '7472850857014984704', key: process.env.STORM_KEY_UNDERWRITING },
  law:          { id: '7472850858574843904', key: process.env.STORM_KEY_LAW },
  inbox:        { id: '7459748294933057536', key: process.env.STORM_KEY_INBOX },
  extractor:    { id: '7459748327345979392', key: process.env.STORM_KEY_EXTRACTOR },
  normalizer:   { id: '7459738748749533184', key: process.env.STORM_KEY_NORMALIZER },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const role = req.query.role;
  const agent = AGENTS[role];
  if (!agent) {
    res.status(404).json({ error: `unknown role: ${role}` });
    return;
  }
  if (!agent.key) {
    res.status(500).json({ error: `missing STORM key for role: ${role}` });
    return;
  }
  const body = req.body || {};
  const question = body.question || body.message || body.input || '';

  try {
    const upstream = await fetch(STORM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'storm-api-key': agent.key },
      body: JSON.stringify({ agentId: agent.id, question, message: question, input: question }),
    });
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: 'STORM upstream error', detail: String((e && e.message) || e) });
  }
}
