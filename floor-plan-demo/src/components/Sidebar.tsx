import { useState } from 'react'
import { FileText, X, FileCheck2 } from 'lucide-react'
import PagePreview from './PagePreview'
import { useTripleClick } from '../hooks/useTripleClick'
import type { StoreInfo, PageSummary } from '../types'

interface SidebarProps {
  stores: StoreInfo[]
  onRefresh: () => void
  onClose: () => void
  onAdminOpen: () => void
  onResetSession: () => void
}

export default function Sidebar({ stores, onClose, onAdminOpen }: SidebarProps) {
  const [preview, setPreview] = useState<{ docName: string; page: PageSummary } | null>(null)
  const handleTitleClick = useTripleClick(onAdminOpen)

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h1
            className="text-xl font-bold text-gray-800 select-none cursor-default"
            onClick={handleTitleClick}
          >건축도서 비교</h1>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* 데모 안내 배너 (업로드 대체) */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <FileCheck2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              사전 분석된 <b>샘플 도면 2종</b>이 로드되어 있습니다. 우측에서 질문을 선택해 분석 결과를 확인하세요.
            </p>
          </div>
        </div>

        {/* Indexed documents */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            분석된 건축도서
          </h2>

          <div className="space-y-5">
            {stores.map(store => (
              <div key={store.doc_name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-blue-500 shrink-0" />
                  <span className="font-medium text-base text-gray-800 truncate">
                    {store.doc_name}
                  </span>
                  <span className="text-sm text-gray-400 shrink-0 ml-auto">
                    {store.total_pages}p
                  </span>
                </div>

                <div className="space-y-1">
                  {store.pages.map(page => (
                    <button
                      key={page.page_num}
                      className="w-full text-left text-sm text-gray-600 hover:text-blue-600
                                 hover:bg-blue-50 rounded px-2.5 py-1.5 transition-colors"
                      onClick={() => setPreview({ docName: store.doc_name, page })}
                      title={page.summary}
                    >
                      <span className={`inline-block w-5 text-center mr-1.5 ${
                        page.category === 'document'
                          ? 'text-green-500'
                          : 'text-orange-500'
                      }`}>
                        {page.category === 'document' ? 'D' : 'G'}
                      </span>
                      <span className="text-gray-400 mr-1.5">p{page.page_num}</span>
                      {page.summary.length > 35
                        ? page.summary.slice(0, 35) + '...'
                        : page.summary}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page preview panel */}
      {preview && (
        <PagePreview
          docName={preview.docName}
          page={preview.page}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  )
}
