// ───────────────────────────────────────────────────────────────────────────
// 재생(Replay) 데모용 정적 API
//
// 실제 백엔드(FastAPI + Gemini) 대신, 미리 캡처해 둔 분석 결과(answers.json)와
// 사전 인덱싱된 도면 메타데이터(stores.json)를 정적 자산에서 읽어 응답을 재생한다.
// 화면·컴포넌트는 원본 그대로 재사용하고, 이 파일만 정적 데이터로 교체했다.
// ───────────────────────────────────────────────────────────────────────────
import type {
  AdminStoreInfo,
  IngestResponse,
  QueryImageInfo,
  QueryResponse,
  StoreListResponse,
} from './types'

const BASE = import.meta.env.BASE_URL // '/floor-plan-demo/'

// 도서명(한글) → 정적 자산 폴더 slug
const DOC_SLUG: Record<string, string> = {
  'ㅁㅁ 사업승인도서': 'approval',
  'ㅁㅁ 실시도서': 'construction',
}

interface AnswerRecord {
  id: string
  question: string
  intent: string
  processing_time_ms: number
  answer: string
  images: QueryImageInfo[]
  code_details?: string | null
}

let _storesCache: StoreListResponse | null = null
let _answersCache: AnswerRecord[] | null = null

async function loadStores(): Promise<StoreListResponse> {
  if (!_storesCache) {
    const res = await fetch(`${BASE}assets/data/stores.json`)
    _storesCache = await res.json()
  }
  return _storesCache!
}

async function loadAnswers(): Promise<AnswerRecord[]> {
  if (!_answersCache) {
    const res = await fetch(`${BASE}assets/data/answers.json`)
    _answersCache = await res.json()
  }
  return _answersCache!
}

// 시연 추천 질문 (welcome 화면 칩으로 노출)
export async function getSuggestedQuestions(): Promise<{ id: string; question: string }[]> {
  const answers = await loadAnswers()
  return answers.map(a => ({ id: a.id, question: a.question }))
}

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase()

// id별 키워드 (자유 입력 매칭용)
const KEYWORDS: Record<string, string[]> = {
  classify: ['구성', '분류', '페이지', '어떤도면', '종류', '구조분석'],
  overview: ['사업개요', '세대', '층수', '주차', '건폐', '용적', '개요차이', '개요비교'],
  plan: ['84a', '평면도', '평면', '방구조', '문위치', '치수'],
  finish: ['마감', '마감재', '마감표', '재료'],
  factual: ['세대수', '주차대수', '얼마', '몇세대', '규모'],
}

function matchAnswer(answers: AnswerRecord[], question: string): AnswerRecord | null {
  const nq = norm(question)
  // 1) 추천 질문 정확 매칭
  for (const a of answers) if (norm(a.question) === nq) return a
  // 2) 키워드 점수 매칭
  let best: AnswerRecord | null = null
  let bestScore = 0
  for (const a of answers) {
    const ks = KEYWORDS[a.id] || []
    const score = ks.filter(k => nq.includes(norm(k))).length
    if (score > bestScore) {
      bestScore = score
      best = a
    }
  }
  return bestScore > 0 ? best : null
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    if (signal) {
      if (signal.aborted) {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }
      signal.addEventListener('abort', () => {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }
  })
}

// 실제 처리 시간은 매우 길어(평면도 비교 ~100초) 그대로 기다리지 않고,
// 화면에는 실제 측정값을 표시하되 대기는 짧게 연출한다.
function replayDelayMs(rec: AnswerRecord): number {
  if (rec.images && rec.images.length > 0) return 2600 // 도면 비교(이미지 분석)
  if (rec.intent === 'COMPARE') return 1800
  return 1100
}

export async function queryDocuments(
  question: string,
  _docNames?: string[],
  signal?: AbortSignal,
  _drawingModel?: string,
): Promise<QueryResponse> {
  const answers = await loadAnswers()
  const rec = matchAnswer(answers, question)

  await sleep(rec ? replayDelayMs(rec) : 700, signal)

  if (!rec) {
    return {
      query_id: '',
      answer:
        '이 화면은 실제 분석 결과를 재생하는 **데모**입니다. 아래 추천 질문 중 하나를 선택해 주세요.\n\n' +
        '- 두 도서는 각각 어떤 도면·문서로 구성되어 있나요?\n' +
        '- 두 도서의 사업개요(세대수·층수·주차)는 어떻게 다른가요?\n' +
        '- 84A 평면도가 두 도서에서 어떻게 달라졌나요?\n' +
        '- 실내재료마감표에서 변경된 마감재가 있나요?',
      images: [],
      intent: 'QA',
      processing_time_ms: 600,
    }
  }

  return {
    query_id: rec.id,
    answer: rec.answer,
    images: rec.images || [],
    intent: rec.intent,
    processing_time_ms: rec.processing_time_ms,
    code_details: rec.code_details ?? null,
  }
}

export async function listStores(): Promise<StoreListResponse> {
  return loadStores()
}

export function getPageImageUrl(docName: string, pageNum: number): string {
  const sl = DOC_SLUG[docName] || 'approval'
  return `${BASE}assets/pages/${sl}/page_${pageNum}.jpg`
}

export function getQueryImageUrl(queryId: string, imageIndex: number): string {
  // queryId는 캡처 당시의 query_id(예: 8ab9291c). 정적 자산 폴더와 1:1 매핑.
  return `${BASE}assets/query-images/${queryId}/${imageIndex}.png`
}

export async function getPageMarkdown(_docName?: string, _pageNum?: number): Promise<string | null> {
  return null
}

// ── 데모에서 비활성화된 쓰기성 API ──────────────────────────────────────────
export interface IngestProgressEvent {
  step: string
  message?: string
  result?: IngestResponse
}

export async function ingestPdfWithProgress(
  _file?: File,
  _docName?: string,
  _onProgress?: (event: IngestProgressEvent) => void,
  _force?: boolean,
): Promise<IngestResponse> {
  throw new Error('이 데모에서는 새 도면 업로드가 비활성화되어 있습니다. 사전 분석된 샘플 도면으로 시연해 주세요.')
}

export async function deleteStore(_docName?: string): Promise<void> {
  /* 데모: 비활성 */
}

export async function adminListAllStores(): Promise<{ stores: AdminStoreInfo[] }> {
  return { stores: [] }
}

export async function adminDeleteStore(_sessionId?: string, _docName?: string): Promise<void> {
  /* 데모: 비활성 */
}
