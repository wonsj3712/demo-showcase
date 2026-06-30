import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, PanelLeftOpen, Square } from 'lucide-react'
import MessageBubble from './MessageBubble'
import type { ChatMessage, StoreInfo } from '../types'
import { queryDocuments, getSuggestedQuestions } from '../api'
import { useTripleClick } from '../hooks/useTripleClick'

interface ChatPanelProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  stores: StoreInfo[]
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onAdminOpen: () => void
}

export default function ChatPanel({
  messages,
  setMessages,
  stores,
  sidebarOpen,
  onToggleSidebar,
  onAdminOpen,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [drawingModel, setDrawingModel] = useState('gemini-3-flash-preview')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const handleTitleClick = useTripleClick(onAdminOpen)
  const [suggestions, setSuggestions] = useState<{ id: string; question: string }[]>([])

  useEffect(() => {
    getSuggestedQuestions().then(setSuggestions).catch(() => {})
  }, [])

  const DRAWING_MODELS = [
    { value: 'gemini-3-flash-preview', label: 'Fast (Flash)' },
    { value: 'gemini-3.1-pro-preview', label: 'Advanced (Pro)' },
  ]

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendQuery = async (question: string) => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)

    try {
      const docNames = stores.map(s => s.doc_name)
      const res = await queryDocuments(
        question,
        docNames.length > 0 ? docNames : undefined,
        controller.signal,
        drawingModel,
      )

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer,
        images: res.images,
        intent: res.intent,
        processing_time_ms: res.processing_time_ms,
        code_details: res.code_details,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        const cancelMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '요청이 중단되었습니다.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, cancelMsg])
      } else {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMsg])
      }
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const askQuestion = (raw: string) => {
    const question = raw.trim()
    if (!question || loading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    sendQuery(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    askQuestion(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
          >
            <PanelLeftOpen size={22} />
          </button>
        )}
        <h2
          className="font-semibold text-lg text-gray-700 select-none cursor-default"
          onClick={handleTitleClick}
        >건축도서 비교</h2>
        {stores.length > 0 && (
          <span className="text-sm text-gray-400">
            {stores.map(s => s.doc_name).join(', ')}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">도면 모델:</span>
          <select
            value={drawingModel}
            onChange={e => setDrawingModel(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5
                       bg-white text-gray-700 focus:outline-none focus:ring-2
                       focus:ring-blue-400"
          >
            {DRAWING_MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages or Welcome with input */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p
              className="text-4xl font-bold text-gray-700 mb-2 select-none cursor-default"
              onClick={handleTitleClick}
            >건축도서 비교</p>
            <p className="text-lg text-gray-400 mb-10">
              {stores.length === 0
                ? '좌측 패널에서 PDF를 업로드하여 시작하세요.'
                : 'PDF가 준비되었습니다. 질문을 입력하세요.'}
            </p>

            {/* Centered large input */}
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-3xl"
            >
              <div className="flex items-end gap-3 bg-white rounded-2xl border border-gray-300
                              shadow-lg px-5 py-4 focus-within:ring-2 focus-within:ring-blue-400
                              focus-within:border-transparent">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    stores.length === 0
                      ? 'PDF를 먼저 업로드하세요...'
                      : '질문을 입력하세요... (예: 84A 차이점은?)'
                  }
                  disabled={loading || stores.length === 0}
                  rows={2}
                  className="flex-1 resize-none text-lg bg-transparent
                             focus:outline-none disabled:text-gray-400
                             placeholder:text-gray-400"
                  style={{ minHeight: '56px', maxHeight: '160px' }}
                  onInput={e => {
                    const el = e.target as HTMLTextAreaElement
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600
                             disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                             shrink-0"
                >
                  <Send size={24} />
                </button>
              </div>
            </form>

            {/* 추천 질문 (재생 데모) */}
            {suggestions.length > 0 && (
              <div className="w-full max-w-3xl mt-6">
                <p className="text-sm text-gray-400 mb-2.5">추천 질문</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => askQuestion(s.question)}
                      disabled={loading}
                      className="text-sm text-left px-3.5 py-2 rounded-full border border-gray-300
                                 text-gray-600 hover:border-blue-400 hover:text-blue-600
                                 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {s.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[85%] mx-auto space-y-3">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex items-center gap-3 pl-2">
                <Loader2 size={20} className="animate-spin text-gray-400" />
                <span className="text-base text-gray-400">분석 중...</span>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-red-50 text-red-500 hover:bg-red-100
                             text-sm font-medium transition-colors"
                >
                  <Square size={14} />
                  중지
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Bottom input (only when messages exist) */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-3 py-3">
          <form
            onSubmit={loading ? undefined : handleSubmit}
            className="max-w-[85%] mx-auto flex items-end gap-3"
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3
                         text-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                         focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              style={{ minHeight: '48px', maxHeight: '140px' }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 140) + 'px'
              }}
            />
            {loading ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Square size={22} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={22} />
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
