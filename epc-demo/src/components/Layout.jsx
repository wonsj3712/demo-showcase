import { Mail, LayoutDashboard, Columns3, CheckSquare, Zap } from 'lucide-react';

const navItems = [
  { id: 'email', label: '이메일 분석', icon: Mail },
  { id: 'dashboard', label: '프로젝트 대시보드', icon: LayoutDashboard },
  { id: 'kanban', label: '팀별 칸반보드', icon: Columns3 },
  { id: 'mytodo', label: '개인 할일 관리', icon: CheckSquare },
];

export default function Layout({ currentPage, onNavigate, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* 사이드바 */}
      <aside className="w-[240px] min-w-[240px] bg-navy-800 text-white flex flex-col">
        {/* 로고 영역 */}
        <div className="p-5 border-b border-navy-700">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-accent-orange rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-tight tracking-tight">EPC 이슈 관리</h1>
              <p className="text-[10px] text-navy-300 leading-tight">AI Email Intelligence</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4 px-3">
          <p className="text-[10px] text-navy-400 uppercase font-semibold tracking-wider px-3 mb-2">메뉴</p>
          <ul className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer
                      ${isActive
                        ? 'bg-accent-orange text-white shadow-lg shadow-accent-orange/30'
                        : 'text-navy-200 hover:bg-navy-700 hover:text-white'
                      }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 프로젝트 정보 */}
        <div className="p-4 border-t border-navy-700">
          <div className="bg-navy-900/60 rounded-lg p-3">
            <p className="text-[10px] text-navy-400 mb-1">현재 프로젝트</p>
            <p className="text-[12px] font-semibold text-white leading-tight">Al-Jubail Refinery</p>
            <p className="text-[12px] font-semibold text-accent-orange leading-tight">Expansion</p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-navy-300">실시간 모니터링 중</span>
            </div>
          </div>
        </div>

        {/* STORM Platform 브랜딩 */}
        <div className="px-4 pb-4">
          <p className="text-[10px] text-navy-500 text-center tracking-wide">
            Powered by <span className="font-bold text-navy-300">STORM</span> Platform
          </p>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="h-[56px] min-h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-navy-800">
              {navItems.find(n => n.id === currentPage)?.label}
            </h2>
            <span className="text-[11px] bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-medium">
              Al-Jubail Refinery Expansion
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-slate-500">2026년 4월 5일 (토)</span>
            <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center text-white text-[12px] font-bold">
              PM
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
