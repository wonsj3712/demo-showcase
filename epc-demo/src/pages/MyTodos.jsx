import { useState, useMemo } from 'react';
import { User, Calendar, AlertTriangle, ExternalLink, CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react';
import { todos, emails, assignees, priorityConfig, statusConfig } from '../data/mockData';

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bgLight} ${config.textColor} ${config.border} border`}>
      {priority === 'critical' && <AlertTriangle size={9} />}
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

function MiniStat({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgColor} border border-slate-200`}>
      <Icon size={18} className={color} />
      <div>
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className={`text-[20px] font-bold leading-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function MyTodos() {
  const [selectedAssignee, setSelectedAssignee] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [showEmailId, setShowEmailId] = useState(null);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchAssignee = selectedAssignee === '전체' || todo.assignee === selectedAssignee;
      const matchStatus = statusFilter === '전체' ||
        (statusFilter === '미완료' && !todo.completed) ||
        (statusFilter === '완료' && todo.completed);
      return matchAssignee && matchStatus;
    });
  }, [selectedAssignee, statusFilter]);

  const stats = useMemo(() => {
    const filtered = selectedAssignee === '전체'
      ? todos
      : todos.filter(t => t.assignee === selectedAssignee);
    return {
      total: filtered.length,
      completed: filtered.filter(t => t.completed).length,
      inProgress: filtered.filter(t => t.status === '진행중').length,
      delayed: filtered.filter(t => t.status === '지연').length,
      todo: filtered.filter(t => t.status === '할일').length,
    };
  }, [selectedAssignee]);

  const selectedEmailData = showEmailId
    ? emails.find(e => e.id === showEmailId)
    : null;

  // 날짜별 그룹핑
  const groupedTodos = useMemo(() => {
    const groups = {};
    filteredTodos.forEach(todo => {
      const date = todo.dueDate;
      if (!groups[date]) groups[date] = [];
      groups[date].push(todo);
    });
    // 날짜순 정렬
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTodos]);

  return (
    <div className="space-y-5">
      {/* 상단 필터 & 통계 */}
      <div className="flex gap-4">
        {/* 담당자 선택 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-navy-600" />
              <label className="text-[12px] font-semibold text-navy-800">담당자</label>
            </div>
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-accent-orange cursor-pointer"
            >
              <option value="전체">전체 담당자</option>
              {assignees.map(a => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.team} {a.role})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 ml-4">
              <label className="text-[12px] font-semibold text-navy-800">상태</label>
              <div className="flex gap-1">
                {['전체', '미완료', '완료'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer
                      ${statusFilter === f
                        ? 'bg-navy-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 미니 통계 */}
      <div className="grid grid-cols-5 gap-3">
        <MiniStat icon={ListTodo} label="전체" value={stats.total} color="text-navy-800" bgColor="bg-white" />
        <MiniStat icon={Circle} label="할일" value={stats.todo} color="text-slate-500" bgColor="bg-white" />
        <MiniStat icon={Clock} label="진행중" value={stats.inProgress} color="text-blue-500" bgColor="bg-white" />
        <MiniStat icon={AlertTriangle} label="지연" value={stats.delayed} color="text-red-500" bgColor="bg-white" />
        <MiniStat icon={CheckCircle2} label="완료" value={stats.completed} color="text-green-500" bgColor="bg-white" />
      </div>

      {/* 할일 목록 + 이메일 미리보기 */}
      <div className="flex gap-4">
        {/* 할일 리스트 */}
        <div className="flex-1 space-y-4">
          {groupedTodos.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-[13px] text-slate-400">해당 조건에 맞는 할일이 없습니다</p>
            </div>
          )}

          {groupedTodos.map(([date, dateTodos]) => {
            const isOverdue = new Date(date) < new Date('2026-04-05');
            return (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 날짜 헤더 */}
                <div className={`px-5 py-2.5 border-b flex items-center justify-between ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                    <span className={`text-[12px] font-semibold ${isOverdue ? 'text-red-600' : 'text-navy-800'}`}>
                      마감일: {date}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">기한 초과</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{dateTodos.length}건</span>
                </div>

                {/* 할일 아이템 */}
                <div className="divide-y divide-slate-50">
                  {dateTodos.map(todo => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors ${todo.completed ? 'opacity-60' : ''}`}
                    >
                      {/* 체크박스 */}
                      <input
                        type="checkbox"
                        defaultChecked={todo.completed}
                        className="w-4.5 h-4.5 rounded border-slate-300 text-accent-orange focus:ring-accent-orange/30 cursor-pointer accent-[#F97316]"
                      />

                      {/* 할일 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium leading-snug ${todo.completed ? 'text-slate-400 line-through' : 'text-navy-800'}`}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <User size={9} />
                            {todo.assignee} · {todo.team}
                          </span>
                        </div>
                      </div>

                      {/* 뱃지 */}
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={todo.priority} />
                        <StatusBadge status={todo.status} />
                      </div>

                      {/* 원본 이메일 보기 */}
                      <button
                        onClick={() => setShowEmailId(showEmailId === todo.emailId ? null : todo.emailId)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer
                          ${showEmailId === todo.emailId
                            ? 'bg-accent-orange text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        <ExternalLink size={10} />
                        원본 이메일
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 원본 이메일 미리보기 */}
        {selectedEmailData && (
          <div className="w-[380px] min-w-[380px]">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-0">
              <div className="px-4 py-3 border-b border-slate-100 bg-navy-800 text-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-bold flex items-center gap-2">
                    <ExternalLink size={13} />
                    원본 이메일
                  </h4>
                  <button
                    onClick={() => setShowEmailId(null)}
                    className="text-[10px] text-navy-200 hover:text-white cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h5 className="text-[13px] font-semibold text-navy-800 mb-2 leading-snug">
                  {selectedEmailData.subject}
                </h5>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                  <span>{selectedEmailData.fromName}</span>
                  <span>·</span>
                  <span>{selectedEmailData.date}</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-600 leading-relaxed font-[inherit]">
                    {selectedEmailData.body}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
