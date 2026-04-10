import { useState, useMemo } from 'react';
import { Search, Filter, Mail, Clock, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Tag, User, Calendar } from 'lucide-react';
import { emails, issues, todos, categories, priorityConfig } from '../data/mockData';

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.bgLight} ${config.textColor} ${config.border} border`}>
      {priority === 'critical' && <AlertTriangle size={10} />}
      {config.label}
    </span>
  );
}

function CategoryTag({ category }) {
  const colorMap = {
    '설계변경': 'bg-purple-100 text-purple-700',
    '설계': 'bg-indigo-100 text-indigo-700',
    '조달': 'bg-amber-100 text-amber-700',
    '자재지연': 'bg-amber-100 text-amber-700',
    '시공': 'bg-teal-100 text-teal-700',
    '시공일정': 'bg-teal-100 text-teal-700',
    '안전': 'bg-red-100 text-red-700',
    '품질': 'bg-pink-100 text-pink-700',
    '품질이슈': 'bg-pink-100 text-pink-700',
    '공정': 'bg-cyan-100 text-cyan-700',
    '관리': 'bg-slate-100 text-slate-700',
    '계약': 'bg-orange-100 text-orange-700',
    '일반보고': 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${colorMap[category] || 'bg-gray-100 text-gray-700'}`}>
      <Tag size={9} />
      {category}
    </span>
  );
}

export default function EmailAnalysis() {
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('전체');
  const [filterPriority, setFilterPriority] = useState('전체');

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchSearch = !searchQuery ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.fromName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === '전체' || email.category === filterCategory;
      const matchPriority = filterPriority === '전체' || email.priority === filterPriority;
      return matchSearch && matchCategory && matchPriority;
    });
  }, [searchQuery, filterCategory, filterPriority]);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const relatedIssues = issues.filter(i => i.emailId === selectedEmailId);
  const relatedTodos = todos.filter(t => t.emailId === selectedEmailId);

  return (
    <div className="flex gap-4 h-[calc(100vh-56px-40px)]">
      {/* 좌측: 이메일 목록 */}
      <div className="w-[340px] min-w-[340px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 검색 & 필터 */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이메일 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange/30"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none cursor-pointer"
            >
              <option value="전체">카테고리 전체</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none cursor-pointer"
            >
              <option value="전체">중요도 전체</option>
              <option value="critical">긴급</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>

        {/* 이메일 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(email => (
            <button
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`w-full text-left p-3.5 border-b border-slate-50 transition-all cursor-pointer
                ${selectedEmailId === email.id
                  ? 'bg-accent-orange/5 border-l-3 border-l-accent-orange'
                  : 'hover:bg-slate-50'
                }
                ${!email.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className={`text-[12px] font-semibold truncate ${!email.isRead ? 'text-navy-800' : 'text-slate-700'}`}>
                  {email.fromName}
                </span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{email.date}</span>
              </div>
              <p className={`text-[12px] leading-snug mb-1.5 line-clamp-2 ${!email.isRead ? 'text-navy-800 font-medium' : 'text-slate-600'}`}>
                {email.subject}
              </p>
              <div className="flex items-center gap-1.5">
                <CategoryTag category={email.category} />
                <PriorityBadge priority={email.priority} />
              </div>
            </button>
          ))}
        </div>

        {/* 하단 통계 */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>총 {filteredEmails.length}건</span>
            <span className="flex items-center gap-1">
              <Mail size={11} />
              읽지 않음 {filteredEmails.filter(e => !e.isRead).length}건
            </span>
          </div>
        </div>
      </div>

      {/* 중앙: 이메일 본문 */}
      <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {selectedEmail ? (
          <>
            {/* 이메일 헤더 */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[15px] font-bold text-navy-800 leading-snug pr-4">
                  {selectedEmail.subject}
                </h3>
                <PriorityBadge priority={selectedEmail.priority} />
              </div>
              <div className="flex items-center gap-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User size={12} />
                  {selectedEmail.fromName}
                  <span className="text-slate-400">({selectedEmail.fromCompany})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {selectedEmail.date} {selectedEmail.time}
                </span>
              </div>
            </div>

            {/* 이메일 본문 */}
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="whitespace-pre-wrap text-[13px] text-slate-700 leading-relaxed font-[inherit]">
                {selectedEmail.body}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-[13px]">
            이메일을 선택해 주세요
          </div>
        )}
      </div>

      {/* 우측: AI 추출 결과 */}
      <div className="w-[360px] min-w-[360px] flex flex-col gap-4 overflow-y-auto">
        {/* AI 분석 헤더 */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-accent-orange" />
            <h4 className="text-[13px] font-bold">AI 자동 추출 결과</h4>
          </div>
          <p className="text-[11px] text-navy-200">선택된 이메일에서 이슈와 할일을 자동으로 추출합니다</p>
        </div>

        {/* 이슈 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-navy-800 flex items-center gap-2">
              <AlertTriangle size={14} className="text-accent-orange" />
              추출된 이슈
            </h4>
            <span className="text-[11px] bg-accent-orange/10 text-accent-orange px-2 py-0.5 rounded-full font-semibold">
              {relatedIssues.length}건
            </span>
          </div>
          <div className="p-3 space-y-2.5">
            {relatedIssues.length > 0 ? relatedIssues.map(issue => (
              <div key={issue.id} className={`p-3 rounded-lg border ${priorityConfig[issue.priority]?.border || 'border-slate-200'} ${priorityConfig[issue.priority]?.bgLight || 'bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-[12px] font-semibold text-navy-800 leading-snug">{issue.title}</h5>
                  <PriorityBadge priority={issue.priority} />
                </div>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{issue.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag size={9} />
                    {issue.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={9} />
                    {issue.team}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={9} />
                    {issue.dueDate}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-[12px] text-slate-400 text-center py-4">추출된 이슈가 없습니다</p>
            )}
          </div>
        </div>

        {/* 할일 체크리스트 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-navy-800 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" />
              할일 체크리스트
            </h4>
            <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
              {relatedTodos.length}건
            </span>
          </div>
          <div className="p-3 space-y-1.5">
            {relatedTodos.length > 0 ? relatedTodos.map(todo => (
              <label key={todo.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked={todo.completed}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-orange focus:ring-accent-orange/30 cursor-pointer accent-[#F97316]"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-medium leading-snug ${todo.completed ? 'text-slate-400 line-through' : 'text-navy-800'}`}>
                    {todo.title}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={9} />
                      {todo.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={9} />
                      {todo.dueDate}
                    </span>
                    <PriorityBadge priority={todo.priority} />
                  </div>
                </div>
              </label>
            )) : (
              <p className="text-[12px] text-slate-400 text-center py-4">추출된 할일이 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
