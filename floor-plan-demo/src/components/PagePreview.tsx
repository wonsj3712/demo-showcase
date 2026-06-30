import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { getPageImageUrl, getPageMarkdown } from '../api'
import type { PageSummary } from '../types'
import ImageViewer from './ImageViewer'

interface PagePreviewProps {
  docName: string
  page: PageSummary
  onClose: () => void
}

export default function PagePreview({ docName, page, onClose }: PagePreviewProps) {
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [loadingMd, setLoadingMd] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  const imageUrl = getPageImageUrl(docName, page.page_num)

  useEffect(() => {
    if (page.has_markdown) {
      setLoadingMd(true)
      getPageMarkdown(docName, page.page_num)
        .then(setMarkdown)
        .finally(() => setLoadingMd(false))
    } else {
      setMarkdown(null)
    }
  }, [docName, page.page_num, page.has_markdown])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-4 right-4 z-50 w-[75vw] bg-white rounded-xl
                      shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {page.category === 'document'
              ? <FileText size={20} className="text-green-500" />
              : <ImageIcon size={20} className="text-orange-500" />
            }
            <span className="font-semibold text-base text-gray-800">
              {docName} — Page {page.page_num}
            </span>
            <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-500">
              {page.category === 'document' ? 'DOCUMENT' : 'DRAWING'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
            <X size={22} />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-3 bg-gray-50 text-base text-gray-600 border-b border-gray-100">
          {page.summary}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Page image */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              페이지 이미지
            </h3>
            <img
              src={imageUrl}
              alt={`Page ${page.page_num}`}
              className="w-full rounded-lg border border-gray-200 cursor-pointer
                         hover:border-blue-400 transition-colors"
              onClick={() => setViewerOpen(true)}
            />
            <p className="text-xs text-gray-400 mt-2">클릭하여 확대</p>
          </div>

          {/* Parsed markdown (DOCUMENT only) */}
          {page.has_markdown && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                파싱 결과 (마크다운)
              </h3>
              {loadingMd ? (
                <div className="flex items-center gap-2 text-gray-400 text-base py-4">
                  <Loader2 size={18} className="animate-spin" />
                  로딩 중...
                </div>
              ) : markdown ? (
                <div className="markdown-content text-base bg-gray-50 rounded-xl p-6 border border-gray-200 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-base text-gray-400">마크다운 데이터가 없습니다.</p>
              )}
            </div>
          )}

          {/* DRAWING: no markdown */}
          {!page.has_markdown && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-400">
                DRAWING 페이지 — 이미지만 저장됨 (마크다운 파싱 없음)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full-size image viewer */}
      {viewerOpen && (
        <ImageViewer src={imageUrl} onClose={() => setViewerOpen(false)} />
      )}
    </>
  )
}
