import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Clock, Calendar, 
  TrendingUp, Stethoscope, Pill, Microscope, Search,
  AlertTriangle, ActivitySquare, TrendingDown, Info,
  ChevronDown, ArrowRight, ArrowUpRight, ArrowDownRight,
  Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';


const chartColors = {
  primary: '#1d4ed8', // blue-700
  secondary: '#0f766e', // teal-700
  tertiary: '#ea580c', // orange-600
  grid: '#cbd5e1', // slate-300
  text: '#334155', // slate-700
  tooltipText: '#0f172a', // slate-900
  tooltipBg: '#ffffff',
};

function getMonthOptions() {
  const startYear = 2022;
  const startMonth = 10;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const thaiMonths = [
    "", "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  let result = [];

  for (let y = startYear; y <= currentYear; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === startYear && m < startMonth) continue;
      if (y === currentYear && m > currentMonth) break;

      result.push({
        month: m,
        year: y,
        label: `${thaiMonths[m]} ${y + 543}`
      });
    }
  }

  return result.reverse();
}

export default function App() {
  const API_BASE = `http://${window.location.hostname}:9200`;
  const [activeTab, setActiveTab] = useState('realtime'); // Default to monthly to see charts
  const [demandFilter, setDemandFilter] = useState('all');
  const [trendFilter, setTrendFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- STATE ---
  const [realtimeData, setRealtimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(new Date());

  const [dailyTrend, setDailyTrend] = useState([]);
  const [weeklyAvg, setWeeklyAvg] = useState({});
  const [hourlyDemand, setHourlyDemand] = useState([]);
  const [mode, setMode] = useState("monthly");
  const [monthlyData, setMonthlyData] = useState({ total: 0, appointment: 0, walkin: 0 });
  const [last3Months, setLast3Months] = useState([]);
  const [yearlySummary, setYearlySummary] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [compareMonth1, setCompareMonth1] = useState(1);
  const [compareYear1, setCompareYear1] = useState(2026);
  const [compareMonth2, setCompareMonth2] = useState(2);
  const [compareYear2, setCompareYear2] = useState(2026);
  const [rootData, setRootData] = useState(null);
  const monthOptions = getMonthOptions(); 

  // --- FETCHERS ---
  const fetchRealtimeData = async () => {
  try {
    setIsLoading(true);
    const res = await fetch(`${API_BASE}/api/waitwatch/realtime`);
    const data = await res.json();

    setRealtimeData(data);
    setLastFetchTime(new Date());
    setError(null);
  } catch (err) {
    console.error("realtime error:", err);
    setError("โหลดข้อมูล realtime ไม่ได้");
  } finally {
    setIsLoading(false);
  }
};

  const fetchMonthlyData = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/monthly-summary?month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json();
    setMonthlyData(data);
  } catch (err) {
    console.error("โหลด monthly ไม่ได้", err);
  }
};

  const fetchDailyTrend = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/daily-trend?month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json();
    setDailyTrend(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Daily trend error:", err);
  }
};

  const fetchWeeklyAvg = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/weekly-avg`)
    const data = await res.json()
    setWeeklyAvg(data)
  } catch (err) {
    console.error("weekly avg error:", err)
  }
}

  const fetchHourlyDemand = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/hourly-demand?month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("hourly ไม่ใช่ array", data)
      setHourlyDemand([])
      return
    }

    setHourlyDemand(data)
  } catch (err) {
    console.error("hourly error:", err)
  }
}

const fetchLast3Months = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/last-3-months`)
    const data = await res.json()
    setLast3Months(data)
  } catch (err) {
    console.error("last3 error:", err)
  }
}

const fetchYearlySummary = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/yearly-summary?year=${selectedYear}`);
    const data = await res.json()
    setYearlySummary(data)
  } catch (err) {
    console.error("yearly error:", err)
  }
}

const fetchCompare = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/opd/compare-month?m1=${compareMonth1}&y1=${compareYear1}&m2=${compareMonth2}&y2=${compareYear2}`);
    const data = await res.json()
    setCompareData(data)
  } catch (err) {
    console.error("compare error:", err)
  }
}

const fetchRootCauseData = async () => {
  try {
    const month = Number(selectedMonth);
    const year = Number(selectedYear);

    console.log("FETCH ROOT:", month, year);

    const res = await fetch(`${API_BASE}/api/opd/rootcause?month=${month}&year=${year}`);

    const data = await res.json();

    console.log("ROOT DATA:", data);

    setRootData(data);
  } catch (err) {
    console.error("root cause error:", err);
  }
};

const generateInsights = (data) => {
  if (!data) return [];

  const insights = [];

  // 🟡 Peak day/hour
  if (data.insight?.peak_day) {
    insights.push(`วัน${data.insight.peak_day} คนไข้เยอะสุด`);
  }

  if (data.insight?.peak_hour !== undefined) {
    insights.push(`ช่วง ${data.insight.peak_hour}:00 น. หนาแน่นสุด`);
  }

  // 🔴 Bottleneck
  const bottleneck = data.bottleneck || {};
  const maxFlow = Math.max(
    bottleneck.reg_to_screen || 0,
    bottleneck.doctor_to_rx || 0
  );

  if (maxFlow > 0) {
    if (maxFlow === bottleneck.reg_to_screen) {
      insights.push("จุดช้า: ลงทะเบียน → ซักประวัติ");
    } else {
      insights.push("จุดช้า: พบแพทย์ → รับยา");
    }
  }

  // 🧬 Top ICD (เคสหนัก)
  if (data.top_icd?.length > 0) {
    const worst = data.top_icd[0];
    if (worst.avg_wait > 60) {
      insights.push(`เคส ${worst.code} ใช้เวลานาน`);
    }
  }

  return insights;
};

  useEffect(() => {

  // ========================
  // TAB 1: REALTIME
  // ========================
  if (activeTab === 'realtime') {
    fetchRealtimeData();
    const intervalId = setInterval(fetchRealtimeData, 60000);
    return () => clearInterval(intervalId);
  }

  // ========================
  // TAB 2: MONTHLY
  // ========================
  if (activeTab === 'monthly') {
    if (mode === "monthly") {
      fetchMonthlyData(); 
      fetchDailyTrend(); 
      fetchWeeklyAvg(); 
      fetchHourlyDemand();
    }
    if (mode === "last3") fetchLast3Months();
    if (mode === "yearly") fetchYearlySummary();
    if (mode === "compare") fetchCompare();
  }

  // ========================
  // 🔥 TAB 3: ROOT CAUSE (เพิ่มตรงนี้)
  // ========================
  if (activeTab === 'rootcause') {
    fetchRootCauseData();
  }

}, [activeTab, selectedMonth, selectedYear, mode]);

  const getIcon = (name) => {
    if (name.includes('ซักประวัติ')) return <Users size={20} />;
    if (name.includes('แล็บ')) return <Microscope size={20} />;
    if (name.includes('แพทย์')) return <Stethoscope size={20} />;
    return <Pill size={20} />;
  }

  // Common Recharts properties for minimal look
  const commonAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: chartColors.text, fontSize: 12 },
  };

  const tooltipStyle = {
    contentStyle: { 
      borderRadius: '12px', 
      border: `1px solid ${chartColors.grid}`,
      backgroundColor: chartColors.tooltipBg,
      color: chartColors.tooltipText,
      boxShadow: '0 12px 18px -4px rgb(15 23 42 / 0.18), 0 6px 8px -5px rgb(15 23 42 / 0.12)'
    },
    labelStyle: { color: chartColors.tooltipText, fontWeight: 600 },
    itemStyle: { color: chartColors.tooltipText, fontWeight: 500 },
    cursor: { stroke: '#94a3b8', strokeWidth: 2 }
  };

  const insights = generateInsights(rootData);
  const realtimeKpis = [
    { label: 'ผู้ป่วยทั้งหมด', value: realtimeData?.total ?? 0, accent: 'text-blue-700', surface: 'from-blue-50 via-white to-white', ring: 'ring-blue-100' },
    { label: 'กำลังรอ', value: realtimeData?.waitingTotal ?? 0, accent: 'text-amber-600', surface: 'from-amber-50 via-white to-white', ring: 'ring-amber-100' },
    { label: 'เปอร์เซ็นต์รอ', value: `${realtimeData?.waitingPercent ?? 0}%`, accent: 'text-teal-600', surface: 'from-teal-50 via-white to-white', ring: 'ring-teal-100' },
    { label: 'รอพบแพทย์ (นาที)', value: realtimeData?.waitingTime?.doctor || 0, accent: 'text-rose-600', surface: 'from-rose-50 via-white to-white', ring: 'ring-rose-100' },
  ];
  const touchpointStyles = [
    { surface: 'from-blue-50 to-white', border: 'border-blue-100', iconBg: 'bg-blue-100', iconText: 'text-blue-700', valueText: 'text-blue-900' },
    { surface: 'from-violet-50 to-white', border: 'border-violet-100', iconBg: 'bg-violet-100', iconText: 'text-violet-700', valueText: 'text-violet-900' },
    { surface: 'from-orange-50 to-white', border: 'border-orange-100', iconBg: 'bg-orange-100', iconText: 'text-orange-700', valueText: 'text-orange-900' },
    { surface: 'from-emerald-50 to-white', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconText: 'text-emerald-700', valueText: 'text-emerald-900' },
  ];
  const monthlyKpiStyles = [
    { icon: 'text-blue-600', tone: 'from-blue-50 to-white', border: 'border-blue-100' },
    { icon: 'text-teal-600', tone: 'from-teal-50 to-white', border: 'border-teal-100' },
    { icon: 'text-orange-600', tone: 'from-orange-50 to-white', border: 'border-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Glassmorphism */}
      <header className="bg-gradient-to-r from-white/90 via-blue-50/60 to-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           <div className="flex items-center gap-2">
  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
    Phrabaramee
  </h1>

  <span className="text-slate-300">|</span>

  <span className="text-sm font-bold text-blue-700 tracking-wide">
    OPD WAIT WATCH
  </span>
</div>
            <div className="hidden sm:flex items-center text-xs text-slate-500 font-medium">
              <Clock size={14} className="mr-1.5" />
              อัปเดตล่าสุด: {lastFetchTime.toLocaleTimeString('th-TH')}
              <button onClick={fetchRealtimeData} className="ml-3 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TABS */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/85 backdrop-blur-sm p-1 rounded-xl shadow-md border border-blue-100/70 ring-1 ring-blue-100/40">
            {[
              { id: 'realtime', name: 'Real-time' },
              { id: 'monthly', name: 'Analytics' },
              { id: 'rootcause', name: 'Root Cause' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-300/60'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* TAB 1: REALTIME */}
        {/* ========================================== */}
        {activeTab === 'realtime' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">สถานการณ์ปัจจุบัน</h2>
                <p className="text-slate-500 text-sm mt-1">ข้อมูลเรียลไทม์จาก HOSxP</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-full text-slate-600 shadow-sm border border-slate-100">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                {isLoading ? 'Syncing...' : 'Live'}
              </div>
            </div>

            {error && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center shadow-sm">
                <Info className="mr-2 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!realtimeData && isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Activity className="animate-spin text-blue-400" size={32} />
              </div>
            ) : realtimeData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {realtimeKpis.map((kpi, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${kpi.surface} rounded-2xl shadow-sm ring-1 ${kpi.ring} p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ActivitySquare size={48} className={kpi.accent} />
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide relative z-10">{kpi.label}</div>
                      <div className={`text-4xl font-light ${kpi.accent} relative z-10`}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-2">
  {(realtimeData?.touchpoints || []).map((tp, idx) => {
    const tone = touchpointStyles[idx % touchpointStyles.length];
    return (
      <div key={idx} className={`bg-gradient-to-br ${tone.surface} p-5 rounded-2xl shadow-sm border ${tone.border} flex items-center gap-4 transition-colors`}>
        <div className={`${tone.iconBg} ${tone.iconText} p-3.5 rounded-xl`}>
          {getIcon(tp.name)}
        </div>
        <div>
          <div className={`text-2xl font-semibold ${tone.valueText}`}>{tp.count}</div>
          <div className="text-[11px] text-slate-600 uppercase tracking-wide font-medium">
            {tp.name}
          </div>
        </div>
      </div>
    );
  })}
</div>
              </>
            ) : null}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MONTHLY (THE MINIMAL CHARTS)        */}
        {/* ========================================== */}
        {activeTab === 'monthly' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">ภาพรวมการให้บริการ</h2>
                <p className="text-sm text-slate-500 mt-1">วิเคราะห์แนวโน้มและปริมาณผู้ป่วย</p>
              </div>
              
              <div className="flex bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-xl border border-blue-100 shadow-sm">
                {[
                  { id: 'monthly', label: 'รายเดือน' },
                  { id: 'last3', label: '3 เดือน' },
                  { id: 'yearly', label: 'รายปี' },
                  { id: 'compare', label: 'เปรียบเทียบ' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      mode === opt.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/70' : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MONTHLY MODE */}
            {mode === "monthly" && (
              <div className="space-y-6">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'ผู้ป่วยทั้งหมด (ราย)', val: monthlyData.total },
                    { label: 'นัดหมายล่วงหน้า (ราย)', val: monthlyData.appointment },
                    { label: 'Walk-in (ราย)', val: monthlyData.walkin }
                  ].map((item, i) => (
                    <div key={i} className={`bg-gradient-to-br ${monthlyKpiStyles[i].tone} rounded-2xl shadow-sm border ${monthlyKpiStyles[i].border} p-6 flex flex-col items-start justify-center hover:shadow-md transition-shadow`}>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                        {i === 0 ? <Users size={14} className={`mr-1.5 ${monthlyKpiStyles[i].icon}`} /> : <Calendar size={14} className={`mr-1.5 ${monthlyKpiStyles[i].icon}`} />}
                        {item.label}
                      </span>
                      <span className="text-4xl font-light text-slate-800">{item.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Trend Chart (Line) */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7">
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">แนวโน้มรายวัน</h3>
                        <p className="text-xs text-slate-500 mt-1">ปริมาณผู้ป่วยรวมตลอดเดือน</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp size={18} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.35}/>
                              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 3" />
                          <XAxis dataKey="date" {...commonAxisProps} dy={10} tickFormatter={(val) => val.split('-')[2]} />
                          <YAxis {...commonAxisProps} />
                          <Tooltip {...tooltipStyle} />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke={chartColors.primary} 
                            strokeWidth={3.5}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                            dot={{ r: 2.5, fill: chartColors.primary, stroke: '#ffffff', strokeWidth: 1.5 }}
                            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: chartColors.primary }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Hourly Demand Chart (Line/Area Multi) */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">ความหนาแน่นรายชั่วโมง</h3>
                        <p className="text-xs text-slate-500 mt-1">เปรียบเทียบประเภทการเข้ารับบริการ</p>
                      </div>
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <Clock size={18} className="text-teal-600" />
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="4 4" />
                          <XAxis dataKey="hour" {...commonAxisProps} dy={10} />
                          <YAxis {...commonAxisProps} />
                          <Tooltip {...tooltipStyle} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px', color: chartColors.text, fontWeight: 600 }} />
                          <Line
                            type="monotone"
                            dataKey="all"
                            name="รวม"
                            stroke={chartColors.primary}
                            strokeWidth={3.5}
                            dot={{ r: 2, fill: chartColors.primary, stroke: '#ffffff', strokeWidth: 1.5 }}
                            activeDot={{ r: 6, fill: chartColors.primary, stroke: '#ffffff', strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="appt"
                            name="นัดหมาย"
                            stroke={chartColors.secondary}
                            strokeWidth={3}
                            dot={{ r: 2, fill: chartColors.secondary, stroke: '#ffffff', strokeWidth: 1.5 }}
                            activeDot={{ r: 6, fill: chartColors.secondary, stroke: '#ffffff', strokeWidth: 2 }}
                            strokeDasharray="6 4"
                          />
                          <Line
                            type="monotone"
                            dataKey="walkIn"
                            name="Walk-in"
                            stroke={chartColors.tertiary}
                            strokeWidth={3}
                            dot={{ r: 2, fill: chartColors.tertiary, stroke: '#ffffff', strokeWidth: 1.5 }}
                            activeDot={{ r: 6, fill: chartColors.tertiary, stroke: '#ffffff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAST 3 MONTHS MODE (Bar) */}
            {mode === "last3" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="mb-10 text-center">
                  <h3 className="text-xl font-semibold text-slate-800">สถิติย้อนหลัง 3 เดือน</h3>
                  <div className="w-12 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
                </div>
                <div className="h-[22rem] w-full max-w-4xl mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last3Months} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} barSize={48}>
                      <CartesianGrid vertical={false} stroke={chartColors.grid} />
                      <XAxis dataKey="month" {...commonAxisProps} dy={15} />
                      <YAxis {...commonAxisProps} />
                      <Tooltip {...tooltipStyle} cursor={{fill: '#f8fafc', rx: 8}} />
                      <Bar dataKey="total" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* YEARLY SUMMARY MODE (Line) */}
            {mode === "yearly" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                 <div className="mb-8 flex items-center">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-slate-800">สรุปแนวโน้มรายปี 2026</h3>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlySummary} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid vertical={false} stroke={chartColors.grid} />
                      <XAxis dataKey="month" {...commonAxisProps} dy={15} />
                      <YAxis {...commonAxisProps} />
                      <Tooltip {...tooltipStyle} />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke={chartColors.primary} 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: '#fff', stroke: chartColors.primary, strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: chartColors.primary, stroke: '#fff', strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* COMPARE MODE (Multi-Line) */}
            {mode === "compare" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                      <Search size={20} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">เปรียบเทียบชั่วโมงต่อชั่วโมง</h3>
                  </div>
                  <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">ก.พ. vs ม.ค.</span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={compareData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid vertical={false} stroke={chartColors.grid} />
                      <XAxis dataKey="hour" {...commonAxisProps} dy={15} />
                      <YAxis {...commonAxisProps} />
                      <Tooltip {...tooltipStyle} />
                      <Legend iconType="plainline" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: chartColors.text, fontWeight: 600 }} />
                      <Line
                        type="monotone"
                        dataKey="month1"
                        name="กุมภาพันธ์ (ปัจจุบัน)"
                        stroke={chartColors.primary}
                        strokeWidth={3.5}
                        dot={{ r: 3, fill: chartColors.primary, stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: chartColors.primary, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="month2"
                        name="มกราคม (อดีต)"
                        stroke={chartColors.tertiary}
                        strokeWidth={3}
                        dot={{ r: 2.5, fill: chartColors.tertiary, stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: chartColors.tertiary, stroke: '#ffffff', strokeWidth: 2 }}
                        strokeDasharray="6 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
    
  
      

  {activeTab === 'rootcause' && (
  <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">

    {/* HEADER */}
    <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center">
        <AlertTriangle className="text-rose-500 mr-3" size={24} />
        <h2 className="text-lg font-semibold text-slate-800">Root Cause Analysis</h2>
      </div>

      <div className="flex gap-2">
        <select
  value={`${selectedMonth}-${selectedYear}`}
  onChange={(e) => {
    const [m, y] = e.target.value.split("-");
    setSelectedMonth(Number(m));
    setSelectedYear(Number(y));
  }}
  className="bg-slate-50 border border-slate-200/60 rounded-lg px-4 py-2"
>
  {monthOptions.map((item, i) => (
    <option key={i} value={`${item.month}-${item.year}`}>
      {item.label}
    </option>
  ))}
</select>

        <select className="bg-slate-50 border border-slate-200/60 rounded-lg px-4 py-2">
          <option>ทั้งหมด</option>
          <option>เคสนัด</option>
        </select>
      </div>
    </div>
    

    {!rootData ? (
      <div className="text-center text-slate-400 py-10">
        ⏳ กำลังโหลดข้อมูล...
      </div>
    ) : (
      <>
        {/* INSIGHT */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-xl">
  <h3 className="font-bold mb-4">Key Insights</h3>

  <ul className="space-y-2">
    {insights.length > 0 ? (
      insights.map((text, i) => (
        <li key={i}>👉 {text}</li>
      ))
    ) : (
      <li>👉 ไม่มีข้อมูล</li>
    )}
  </ul>
</div>

        {/* BOTTLENECK */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">จุดคอขวด</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>เปิดบัตร → ซักประวัติ</span>
              <span>{rootData?.bottleneck?.reg_to_screen ?? 0} นาที</span>
            </div>


            <div className="flex justify-between">
              <span>พบแพทย์ → รับยา</span>
              <span>{rootData?.bottleneck?.doctor_to_rx ?? 0} นาที</span>
            </div>
          </div>
        </div>

                {/* ICD */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Top ICD-10</h3>

          {(rootData?.top_icd || []).map((item, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <div>{item.code}{item.name ? ` - ${item.name}` : ""}</div>
              <div className="text-red-500">{item.avg_wait} นาที</div>
            </div>
          ))}
        </div>

      </>
    )}

  </div>
)}

      </main>

    </div>
  );
}
        
      
