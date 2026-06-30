export interface PageSummary {
  page_num: number
  category: string
  summary: string
  has_markdown: boolean
}

export interface IngestResponse {
  doc_name: string
  total_pages: number
  pages: PageSummary[]
  indexing_time_ms: number
}

export interface QueryImageInfo {
  index: number
  label: string
  url: string
}

export interface QueryResponse {
  query_id: string
  answer: string
  images: QueryImageInfo[]
  intent: string
  processing_time_ms: number
  code_details?: string | null
}

export interface StoreInfo {
  doc_name: string
  total_pages: number
  pages: PageSummary[]
  indexed_at: string
}

export interface StoreListResponse {
  stores: StoreInfo[]
}

export interface AdminStoreInfo {
  session_id: string
  doc_name: string
  total_pages: number
  indexed_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: QueryImageInfo[]
  intent?: string
  processing_time_ms?: number
  code_details?: string | null
  timestamp: Date
}
