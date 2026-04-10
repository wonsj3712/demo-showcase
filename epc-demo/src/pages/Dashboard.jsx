import { AlertTriangle, Clock, TrendingUp, Gauge, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardStats, heatmapData, resolutionTrend, warnings } from '../data/mockData';

function KPICard({ icon: Icon, label, value, unit, color, bgColor, iconBg }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-[28px] font-bold leading-none ${color}`}>{value}</span>
          {unit && <span className="text-[13px] text-slate-400 font-medium">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function HeatmapCell({ value }) {
  let bg = 'bg-green-50 text-green-700';
  if (value <= -3) bg = 'bg-red-500 text-white';
  else if (value <= -2) bg = 'bg-red-300 text-white';
  else if (value <= -1) bg = 'bg-orange-300 text-white';
  else if (value < 0) bg = 'bg-yellow-200 text-yellow-800';
  else if (value > 0) bg = 'bg-green-200 text-green-800';

  return (
    <td className={`px-4 py-3 text-center text-[13px] font-semibold rounded ${bg}`}>
      {value > 0 ? '+' : ''}{value}%p
    </td>
  );
}

function WarningItem({ warning }) {
  const iconMap = {
    critical: <AlertTriangle size={14} className="text-red-500" />,
    warning: <AlertCircle size={14} className="text-orange-500" />,
    info: <Info size={14} className="text-blue-500" />,
  };
  const bgMap = {
    critical: 'bg-red-50 border-red-100',
    warning: 'bg-orange-50 border-orange-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${bgMap[warning.type]} transition-colors hover:shadow-sm`}>
      <div className="mt-0.5">{iconMap[warning.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-navy-800 leading-snug">{warning.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">{warning.date}</p>
      </div>
      <ChevronRight size={14} className="text-slate-300 mt-0.5" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-[11px]">
        <p className="font-semibold text-navy-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}: <span className="font-semibold">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={AlertTriangle}
          label="미해결 크리티컬 이슈"
          value={dashboardStats.criticalIssues}
          unit="건"
          color="text-red-500"
          iconBg="bg-red-50"
        />
        <KPICard
          icon={Clock}
          label="지연된 프로젝트 영역"
          value={dashboardStats.delayedAreas}
          unit="개"
          color="text-orange-500"
          iconBg="bg-orange-50"
        />
        <KPICard
          icon={Gauge}
          label="평균 이슈 해결 시간"
          value={dashboardStats.avgResolutionDays}
          unit="일"
          color="text-blue-500"
          iconBg="bg-blue-50"
        />
        <KPICard
          icon={TrendingUp}
          label="업무 처리 속도"
          value={dashboardStats.taskCompletionRate}
          unit="%"
          color="text-green-500"
          iconBg="bg-green-50"
        />
      </div>

      {/* 중단: 히트맵 + 알림 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 분야별 지연 히트맵 */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-[14px] font-bold text-navy-800">분야별 공정 지연 현황</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">최근 4주간 계획 대비 실적 차이 (%p)</p>
          </div>
          <div className="p-5">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left text-[11px] text-slate-500 font-semibold px-3 py-2">분야</th>
                  <th className="text-center text-[11px] text-slate-500 font-semibold px-3 py-2">W7 (2/10~)</th>
                  <th className="text-center text-[11px] text-slate-500 font-semibold px-3 py-2">W8-9 (2/17~)</th>
                  <th className="text-center text-[11px] text-slate-500 font-semibold px-3 py-2">W10 (3/1~)</th>
                  <th className="text-center text-[11px] text-slate-500 font-semibold px-3 py-2">W11 (3/10~)</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(row => (
                  <tr key={row.area}>
                    <td className="px-3 py-3 text-[13px] font-semibold text-navy-800">{row.area}</td>
                    <HeatmapCell value={row.week1} />
                    <HeatmapCell value={row.week2} />
                    <HeatmapCell value={row.week3} />
                    <HeatmapCell value={row.week4} />
                  </tr>
                ))}
              </tbody>
            </table>
            {/* 범례 */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded bg-green-200" /> 계획 초과
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded bg-green-50" /> 정상
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded bg-yellow-200" /> 소폭 지연
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded bg-orange-300" /> 지연
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded bg-red-500" /> 심각 지연
              </div>
            </div>
          </div>
        </div>

        {/* Early Warning 알림 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-[14px] font-bold text-navy-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-accent-orange" />
              Early Warning
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">최근 알림 목록</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {warnings.map(w => (
              <WarningItem key={w.id} warning={w} />
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 이슈 해결률 추이 차트 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-[14px] font-bold text-navy-800">이슈 해결률 추이</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">월별 계획 vs 실적 이슈 해결률 (%)</p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={resolutionTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="planned"
                name="계획"
                stroke="#1B2A4A"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1B2A4A' }}
                strokeDasharray="6 3"
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="실적"
                stroke="#F97316"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
