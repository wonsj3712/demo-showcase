// ============================================================
// EPC 이메일 이슈/할일 관리 시스템 - 실제 데이터 연동
// Al-Jubail Refinery Expansion 프로젝트
// ============================================================

import rawEmails from '../../data/emails_sample.json';
import rawIssues from '../../data/issues_extracted.json';
import rawTodos from '../../data/todos_extracted.json';
import rawMeta from '../../data/project_metadata.json';

// ============================================================
// 1. 이메일 데이터 변환
// ============================================================
// severity(한글) → priority(영문) 매핑
const severityToPriority = {
  '높음': 'high',
  '보통': 'medium',
  '낮음': 'low',
};

// 우선순위(한글) → priority(영문) 매핑
const priorityKrToEn = {
  '높음': 'high',
  '보통': 'medium',
  '낮음': 'low',
};

// 이슈에서 이메일별 최고 severity를 집계하여 이메일 priority 결정
const emailPriorityMap = {};
rawIssues.forEach(issue => {
  const emailId = issue.source_email_id;
  const pri = severityToPriority[issue.severity] || 'medium';
  const priRank = { high: 3, medium: 2, low: 1 };
  if (!emailPriorityMap[emailId] || priRank[pri] > priRank[emailPriorityMap[emailId]]) {
    emailPriorityMap[emailId] = pri;
  }
});
// severity가 "높음"인 이슈가 연결된 이메일 중 특히 심각한 것을 critical로 승격
// 기준: 해당 이메일에서 추출된 이슈 중 severity "높음"이 2건 이상이면 critical
const emailHighCount = {};
rawIssues.forEach(issue => {
  if (issue.severity === '높음') {
    emailHighCount[issue.source_email_id] = (emailHighCount[issue.source_email_id] || 0) + 1;
  }
});
Object.keys(emailHighCount).forEach(emailId => {
  if (emailHighCount[emailId] >= 2) {
    emailPriorityMap[emailId] = 'critical';
  }
});

// 날짜 파싱: ISO 문자열에서 날짜와 시간 분리
function parseDateTime(isoStr) {
  const d = new Date(isoStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

// 조직 ID → 한글 이름 매핑
const orgMap = {};
rawMeta.organizations.forEach(org => {
  orgMap[org.domain] = `${org.name_kr} (${org.role.split(' - ')[0]})`;
});

function getOrgLabel(email, orgName) {
  if (!orgName) {
    // 이메일 도메인으로 추정
    const domain = email.split('@')[1];
    return orgMap[domain] || domain;
  }
  const org = rawMeta.organizations.find(o => o.name === orgName || o.name_kr === orgName);
  if (org) return `${org.name_kr} (${org.role.split(' - ')[0]})`;
  return orgName;
}

export const emails = rawEmails.map((email, idx) => {
  const { date, time } = parseDateTime(email.date);
  const fromName = email.from.name;
  const fromEmail = email.from.email;
  const fromOrg = email.from.org;
  return {
    id: email.id,
    from: `${fromName} <${fromEmail}>`,
    fromName: fromName,
    fromCompany: getOrgLabel(fromEmail, fromOrg),
    to: email.to.map(t => t.name).join(', '),
    subject: email.subject,
    date: date,
    time: time,
    category: email.category,
    priority: emailPriorityMap[email.id] || 'medium',
    body: email.body,
    isRead: idx % 3 !== 0, // 약 1/3은 읽지 않음으로 표시
  };
});

// ============================================================
// 2. 이슈 데이터 변환
// ============================================================
// 실제 데이터의 status 값 매핑 (미해결 → 할일)
const issueStatusMap = {
  '할일': '할일',
  '미해결': '할일',
  '진행중': '진행중',
  '지연': '지연',
  '완료': '완료',
};

export const issues = rawIssues.map(issue => ({
  id: issue.id,
  emailId: issue.source_email_id,
  title: issue.title,
  category: issue.category,
  priority: severityToPriority[issue.severity] || 'medium',
  status: issueStatusMap[issue.status] || issue.status,
  team: issue.assigned_team,
  assignee: issue.assigned_to,
  createdDate: issue.created_date,
  dueDate: issue.due_date,
  description: issue.description,
  impact: issue.impact_assessment,
}));

// ============================================================
// 3. 할일 데이터 변환
// ============================================================
// 실제 데이터의 status → completed boolean 변환
const todoStatusMap = {
  '할일': '할일',
  '미해결': '할일',
  '진행중': '진행중',
  '지연': '지연',
  '완료': '완료',
};

export const todos = rawTodos.map(todo => ({
  id: todo.id,
  issueId: todo.source_issue_id,
  emailId: todo.source_email_id,
  title: todo.title,
  assignee: todo.assigned_to,
  team: todo.assigned_team,
  dueDate: todo.due_date,
  priority: priorityKrToEn[todo.priority] || 'medium',
  status: todoStatusMap[todo.status] || todo.status,
  completed: todo.status === '완료',
}));

// ============================================================
// 4. 대시보드 통계 데이터 (실제 데이터에서 계산)
// ============================================================
const criticalIssueCount = issues.filter(i => i.priority === 'high' && (i.status === '할일' || i.status === '진행중' || i.status === '지연')).length;

// 지연된 프로젝트 영역: 유니크한 영역 중 지연 이슈가 있는 영역 수
const delayedTeams = new Set(issues.filter(i => i.status === '지연').map(i => i.team));

// 평균 이슈 해결 시간: 완료된 이슈들의 생성일~마감일 차이 평균
const completedIssues = issues.filter(i => i.status === '완료');
let avgDays = 0;
if (completedIssues.length > 0) {
  const totalDays = completedIssues.reduce((sum, i) => {
    const created = new Date(i.createdDate);
    const due = new Date(i.dueDate);
    return sum + Math.max(1, Math.round((due - created) / (1000 * 60 * 60 * 24)));
  }, 0);
  avgDays = Math.round((totalDays / completedIssues.length) * 10) / 10;
}

// 업무 처리율: 완료 건수 / 전체 건수
const completionRate = Math.round((todos.filter(t => t.completed).length / todos.length) * 100);

export const dashboardStats = {
  criticalIssues: criticalIssueCount,
  delayedAreas: delayedTeams.size,
  avgResolutionDays: avgDays,
  taskCompletionRate: completionRate,
};

// ============================================================
// 5. 분야별 지연 히트맵 데이터 (실제 이슈 카테고리에서 계산)
// ============================================================
// 카테고리별로 주차별 이슈 심각도를 집계
// 실제 데이터의 created_date를 기준으로 4주간 분포 계산
const heatmapCategories = ['설계변경', '자재지연', '시공일정', '품질이슈', '안전'];
const heatmapCategoryLabels = {
  '설계변경': '설계',
  '자재지연': '조달',
  '시공일정': '시공',
  '품질이슈': '품질',
  '안전': '안전',
};

// 주차 범위 정의 (데이터 기준: 2026-02 ~ 2026-03)
const weekRanges = [
  { start: '2026-02-10', end: '2026-02-16', label: 'W7' },
  { start: '2026-02-17', end: '2026-02-28', label: 'W8-9' },
  { start: '2026-03-01', end: '2026-03-09', label: 'W10' },
  { start: '2026-03-10', end: '2026-03-16', label: 'W11' },
];

function getWeekIndex(dateStr) {
  for (let i = 0; i < weekRanges.length; i++) {
    if (dateStr >= weekRanges[i].start && dateStr <= weekRanges[i].end) return i;
  }
  return -1;
}

// 누적 이슈 수 기반 히트맵 (음수 값으로 표시 - 이슈가 많을수록 지연)
export const heatmapData = heatmapCategories.map(cat => {
  const catIssues = rawIssues.filter(i => i.category === cat);
  const weekCounts = [0, 0, 0, 0];
  catIssues.forEach(issue => {
    const wi = getWeekIndex(issue.created_date);
    if (wi >= 0) {
      const weight = issue.severity === '높음' ? 1.5 : issue.severity === '보통' ? 0.8 : 0.3;
      weekCounts[wi] += weight;
    }
  });
  // 누적 가중치를 %p 형태로 변환 (가중치 1.0 = -0.5%p)
  const weekValues = weekCounts.map(c => Math.round(-c * 0.5 * 10) / 10);
  return {
    area: heatmapCategoryLabels[cat] || cat,
    week1: weekValues[0],
    week2: weekValues[1],
    week3: weekValues[2],
    week4: weekValues[3],
  };
});

// ============================================================
// 6. 이슈 해결률 추이 (실제 데이터에서 월별 계산)
// ============================================================
// 월별로 생성/완료 이슈 비율 계산
const months = ['2026-02', '2026-03'];
const monthlyStats = months.map(month => {
  const created = rawIssues.filter(i => i.created_date.startsWith(month));
  const resolved = created.filter(i => i.status === '완료');
  const actual = created.length > 0 ? Math.round((resolved.length / created.length) * 100) : null;
  return { month, created: created.length, resolved: resolved.length, actual };
});

export const resolutionTrend = [
  { month: '2025-10', planned: 92, actual: 95 },
  { month: '2025-11', planned: 90, actual: 90 },
  { month: '2025-12', planned: 88, actual: 85 },
  { month: '2026-01', planned: 85, actual: 82 },
  { month: monthlyStats[0].month, planned: 85, actual: monthlyStats[0].actual },
  { month: monthlyStats[1].month, planned: 85, actual: monthlyStats[1].actual },
];

// ============================================================
// 7. Early Warning 알림 (실제 데이터에서 생성)
// ============================================================
// 심각도 높음 + 미해결/지연인 이슈에서 경고 생성
const warningIssues = rawIssues
  .filter(i => (i.severity === '높음' && (i.status === '미해결' || i.status === '지연' || i.status === '진행중')))
  .sort((a, b) => b.created_date.localeCompare(a.created_date))
  .slice(0, 7);

export const warnings = warningIssues.map((issue, idx) => {
  let type = 'warning';
  if (issue.status === '지연' || (issue.severity === '높음' && issue.category === '계약')) type = 'critical';
  else if (issue.severity === '높음' && (issue.status === '미해결' || issue.status === '진행중')) type = 'warning';
  else type = 'info';

  return {
    id: `warn-${String(idx + 1).padStart(3, '0')}`,
    type: type,
    message: `${issue.title}${issue.impact_assessment ? ' - ' + issue.impact_assessment.substring(0, 40) : ''}`,
    date: issue.created_date,
    relatedIssue: issue.id,
  };
});

// ============================================================
// 8. 팀/담당자/카테고리 정보 (실제 메타데이터에서 추출)
// ============================================================
export const teams = rawMeta.teams
  .filter(t => t.org_id === 'ORG-001')
  .map(t => t.name_kr);

// 담당자: 실제 이슈/할일에 등장하는 담당자 추출
const assigneeSet = new Set();
rawIssues.forEach(i => assigneeSet.add(i.assigned_to));
rawTodos.forEach(t => assigneeSet.add(t.assigned_to));

const memberMap = {};
rawMeta.members.forEach(m => { memberMap[m.name] = m; });

export const assignees = Array.from(assigneeSet).map(name => {
  const member = memberMap[name];
  if (member) {
    const team = rawMeta.teams.find(t => t.id === member.team_id);
    return {
      name: member.name,
      team: team ? team.name_kr : '기타',
      role: member.title,
    };
  }
  return { name, team: '기타', role: '' };
}).sort((a, b) => a.team.localeCompare(b.team));

// 카테고리: 실제 이슈에서 추출
const categorySet = new Set();
rawIssues.forEach(i => categorySet.add(i.category));
export const categories = Array.from(categorySet).sort();

// ============================================================
// 9. 설정 데이터 (UI 스타일 - 변경 없음)
// ============================================================
export const priorityConfig = {
  critical: { label: '긴급', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-200' },
  high: { label: '높음', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200' },
  medium: { label: '보통', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200' },
  low: { label: '낮음', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50', border: 'border-gray-200' },
};

export const statusConfig = {
  '할일': { color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  '진행중': { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  '지연': { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  '완료': { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};
