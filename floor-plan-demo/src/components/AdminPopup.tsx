import { useState, useEffect } from 'react'
import { X, Trash2, RefreshCw } from 'lucide-react'
import { adminListAllStores, adminDeleteStore } from '../api'
import type { AdminStoreInfo } from '../types'

interface AdminPopupProps {
  onClose: () => void
}

export default function AdminPopup({ onClose }: AdminPopupProps) {
  const [stores, setStores] = useState<AdminStoreInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchStores = async () => {
    setLoading(true)
    try {
      const res = await adminListAllStores()
      setStores(res.stores)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const handleDelete = async (sessionId: string, docName: string) => {
    if (!confirm(`"${docName}" (세션: ${sessionId.slice(0, 8)}...)을 삭제하시겠습니까?`)) return
    const key = `${sessionId}/${docName}`
    setDeleting(key)
    try {
      await adminDeleteStore(sessionId, docName)
      await fetchStores()
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            전체 문서 관리
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStores}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
              title="새로고침"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">로딩 중...</p>
          ) : stores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">등록된 문서가 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">세션</th>
                  <th className="pb-2 font-medium">문서명</th>
                  <th className="pb-2 font-medium text-center">페이지</th>
                  <th className="pb-2 font-medium">인덱싱 일시</th>
                  <th className="pb-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => {
                  const key = `${s.session_id}/${s.doc_name}`
                  return (
                    <tr
                      key={key}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="py-2.5 text-gray-400 font-mono text-xs"
                        title={s.session_id}
                      >
                        {s.session_id.slice(0, 8)}...
                      </td>
                      <td className="py-2.5 text-gray-800 font-medium">
                        {s.doc_name}
                      </td>
                      <td className="py-2.5 text-gray-500 text-center">
                        {s.total_pages}p
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">
                        {s.indexed_at
                          ? new Date(s.indexed_at).toLocaleString('ko-KR')
                          : '-'}
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => handleDelete(s.session_id, s.doc_name)}
                          disabled={deleting === key}
                          className="p-1.5 rounded hover:bg-red-100 text-gray-400
                                     hover:text-red-500 transition-colors
                                     disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
          총 {stores.length}개 문서
        </div>
      </div>
    </div>
  )
}
