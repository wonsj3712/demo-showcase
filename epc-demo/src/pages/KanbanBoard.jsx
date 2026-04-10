import { AlertTriangle, User, Calendar, Tag } from 'lucide-react';
import { issues, todos, priorityConfig, statusConfig } from '../data/mockData';

const statuses = ['할일', '진행중', '지연', '완료'];
const kanbanTeams = ['플랜트 설계팀', '조달팀', '시공관리팀', 'PMO'];

function PriorityDot({ priority }) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${config.bgLight} ${config.textColor}`}>
      {priority === 'critical' && <AlertTriangle size={8} />}
      {config.label}
    </span>
  );
}

function KanbanCard({ issue }) {
  const issueTodos = todos.filter(t => t.issueId === issue.id);
  const completedTodos = issueTodos.filter(t => t.completed).length;

  const borderColor = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-blue-400',
    low: 'border-l-gray-300',
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 border-l-3 ${borderColor[issue.priority] || 'border-l-gray-300'}`}>
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <h4 className="text-[12px] font-semibold text-navy-800 leading-snug line-clamp-2">{issue.title}</h4>
      </div>

      {/* 카테고리 + 우선순위 */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-medium">
          <Tag size={8} />
          {issue.category}
        </span>
        <PriorityDot priority={issue.priority} />
      </div>

      {/* 할일 진행률 */}
      {issueTodos.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>할일 진행</span>
            <span>{completedTodos}/{issueTodos.length}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-orange rounded-full transition-all"
              style={{ width: `${issueTodos.length > 0 ? (completedTodos / issueTodos.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 담당자 + 마감일 */}
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <User size={10} />
          {issue.assignee}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {issue.dueDate}
        </span>
      </div>
    </div>
  );
}

function StatusColumn({ status, teamIssues }) {
  const config = statusConfig[status];
  const filteredIssues = teamIssues.filter(i => i.status === status);

  return (
    <div className="flex-1 min-w-0">
      {/* 상태 헤더 */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${config.color}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="text-[11px] font-semibold">{status}</span>
        <span className="text-[10px] ml-auto font-bold opacity-70">{filteredIssues.length}</span>
      </div>

      {/* 카드 목록 */}
      <div className="space-y-2">
        {filteredIssues.map(issue => (
          <KanbanCard key={issue.id} issue={issue} />
        ))}
        {filteredIssues.length === 0 && (
          <div className="py-8 text-center text-[11px] text-slate-300 border border-dashed border-slate-200 rounded-lg">
            항목 없음
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  return (
    <div className="space-y-6">
      {kanbanTeams.map(team => {
        const teamIssues = issues.filter(i => i.team === team);
        const teamColor = {
          '플랜트 설계팀': 'border-l-indigo-500',
          '조달팀': 'border-l-amber-500',
          '시공관리팀': 'border-l-teal-500',
          'PMO': 'border-l-violet-500',
        };

        return (
          <div key={team} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* 팀 헤더 */}
            <div className={`px-5 py-3.5 border-b border-slate-100 border-l-4 ${teamColor[team] || 'border-l-slate-400'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-navy-800">{team}</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>전체 {teamIssues.length}건</span>
                  <span className="text-red-500 font-semibold">
                    크리티컬 {teamIssues.filter(i => i.priority === 'critical').length}건
                  </span>
                </div>
              </div>
            </div>

            {/* 칸반 컬럼 */}
            <div className="p-4">
              <div className="flex gap-3">
                {statuses.map(status => (
                  <StatusColumn key={status} status={status} teamIssues={teamIssues} />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* 기타 팀 요약 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 border-l-4 border-l-slate-400">
          <h3 className="text-[14px] font-bold text-navy-800">기타 팀 이슈 현황</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {['QC팀', 'HSE팀'].map(team => {
              const teamIssues = issues.filter(i => i.team === team);
              return (
                <div key={team} className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-[13px] font-semibold text-navy-800 mb-3">{team}</h4>
                  <div className="space-y-2">
                    {teamIssues.map(issue => (
                      <div key={issue.id} className="flex items-center gap-2 text-[12px]">
                        <span className={`w-2 h-2 rounded-full ${statusConfig[issue.status]?.dot || 'bg-gray-300'}`} />
                        <span className="text-slate-700 truncate flex-1">{issue.title}</span>
                        <PriorityDot priority={issue.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
