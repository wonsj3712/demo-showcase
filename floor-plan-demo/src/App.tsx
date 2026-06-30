import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import AdminPopup from './components/AdminPopup'
import type { StoreInfo, ChatMessage } from './types'
import { listStores } from './api'
import { resetSession } from './session'

export default function App() {
  const [stores, setStores] = useState<StoreInfo[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)

  const refreshStores = async () => {
    try {
      const res = await listStores()
      setStores(res.stores)
    } catch {
      // API might not be running yet
    }
  }

  const handleResetSession = () => {
    if (!confirm('새 세션을 시작하시겠습니까? 현재 채팅 내역이 초기화됩니다.')) return
    resetSession()
    setMessages([])
    refreshStores()
  }

  useEffect(() => {
    refreshStores()
  }, [])

  return (
    <div className="flex h-screen bg-white">
      {/* 재생 데모 배지 */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-1.5 rounded-full
                      bg-gray-900/80 text-white text-xs px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        재생 데모 · 실제 분석 결과 재생
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-96 border-r border-gray-200 bg-white flex-shrink-0">
          <Sidebar
            stores={stores}
            onRefresh={refreshStores}
            onClose={() => setSidebarOpen(false)}
            onAdminOpen={() => setAdminOpen(true)}
            onResetSession={handleResetSession}
          />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          messages={messages}
          setMessages={setMessages}
          stores={stores}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onAdminOpen={() => setAdminOpen(true)}
        />
      </div>

      {/* Admin popup */}
      {adminOpen && <AdminPopup onClose={() => setAdminOpen(false)} />}
    </div>
  )
}
