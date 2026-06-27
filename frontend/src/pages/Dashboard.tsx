import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  FiActivity, FiHeart, FiAlertTriangle, FiMapPin, FiEye, 
  FiUsers, FiTrendingUp 
} from 'react-icons/fi';
import { getDashboardStats, getAnalyticsDemographics, getReports } from '@/services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, demoRes, reportsRes] = await Promise.all([
          getDashboardStats(),
          getAnalyticsDemographics(),
          getReports()
        ]);
        setStats(statsRes.data);
        setDemographics(demoRes.data);
        setReports(reportsRes.data);
      } catch (err: any) {
        setError(err || 'Failed to connect to the mental health analytics server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Dynamic Calculations from Live Data
  
  // Stress distribution from live reports
  const stressDistribution = useMemo(() => {
    if (!reports.length) {
      return [
        { name: 'Low Risk', value: 0, percentage: '0%', color: '#10b981' },
        { name: 'Medium Risk', value: 0, percentage: '0%', color: '#f59e0b' },
        { name: 'High Risk', value: 0, percentage: '0%', color: '#ef4444' }
      ];
    }
    const low = reports.filter(r => r.Risk_Level === 'Low').length;
    const medium = reports.filter(r => r.Risk_Level === 'Medium' || r.Risk_Level === 'Moderate').length;
    const high = reports.filter(r => r.Risk_Level === 'High').length;
    const total = reports.length;

    return [
      { name: 'Low Risk', value: low, percentage: `${((low / total) * 100).toFixed(1)}%`, color: '#10b981' },
      { name: 'Medium Risk', value: medium, percentage: `${((medium / total) * 100).toFixed(1)}%`, color: '#f59e0b' },
      { name: 'High Risk', value: high, percentage: `${((high / total) * 100).toFixed(1)}%`, color: '#ef4444' }
    ];
  }, [reports]);

  // Depression severity categories (PHQ-9) from live reports
  const depressionSeverity = useMemo(() => {
    const categories = [
      { name: 'Minimal (0-4)', Cases: 0 },
      { name: 'Mild (5-9)', Cases: 0 },
      { name: 'Moderate (10-14)', Cases: 0 },
      { name: 'Mod. Severe (15-19)', Cases: 0 },
      { name: 'Severe (20-27)', Cases: 0 }
    ];

    reports.forEach(r => {
      const score = r.Depression_Score;
      if (score <= 4) categories[0].Cases += 1;
      else if (score <= 9) categories[1].Cases += 1;
      else if (score <= 14) categories[2].Cases += 1;
      else if (score <= 19) categories[3].Cases += 1;
      else categories[4].Cases += 1;
    });

    return categories;
  }, [reports]);

  // Occupation stress and depression benchmarks from live demographics
  const occupationAnalyticsData = useMemo(() => {
    if (!demographics?.occupation_analytics?.length) return [];
    return demographics.occupation_analytics.map((occ: any) => ({
      name: occ.Occupation,
      'Stress Avg (%)': occ.Risk_Score,
      'Depression Avg (%)': occ.Depression_Percent
    }));
  }, [demographics]);

  // Age group curves from live demographics
  const ageGroupAnalyticsData = useMemo(() => {
    if (!demographics?.age_analytics?.length) return [];
    return demographics.age_analytics.map((age: any) => ({
      group: age.Age_Group,
      'Stress Risk': age.Risk_Score,
      'Wellness Index': parseFloat((100 - age.Risk_Score).toFixed(2))
    }));
  }, [demographics]);

  // Sort and select 5 most recent reports
  const recentReports = useMemo(() => {
    if (!reports.length) return [];
    return [...reports]
      .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
      .slice(0, 5)
      .map(r => ({
        id: `MH-${r.Timestamp.split('-').join('').split(':').join('').split(' ').join('').split('.').join('').substring(2, 6)}`,
        time: new Date(r.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        city: r.City,
        risk: r.Risk_Level,
        stress: `${r.Stress_Percent.toFixed(1)}%`,
        phq: `${r.Depression_Score}/27`,
        gad: `${r.Anxiety_Score}/21`
      }));
  }, [reports]);

  // Custom Glassmorphic Dark Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-xl text-xs text-white backdrop-blur-md">
          <p className="font-black mb-1.5 uppercase tracking-wider text-[10px] text-slate-400">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="font-bold flex justify-between space-x-6 py-0.5">
              <span style={{ color: p.color || p.fill }}>{p.name}:</span>
              <span>{p.value.toFixed(1)}{p.name.includes('%') || p.name === 'Cases' ? '' : '%'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-[550px] flex flex-col justify-center items-center space-y-4">
        <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest animate-pulse">
          Loading Clinical Dashboard Aggregates...
        </p>
      </div>
    );
  }

  // Connection Error boundary view
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 text-left">
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 space-y-1.5 animate-fadeIn">
          <h4 className="font-black text-xs uppercase tracking-widest">Clinical Connection Failure</h4>
          <p className="text-xs font-semibold leading-relaxed">
            {error}. Make sure the FastAPI backend server is running and reachable on port 8000.
          </p>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      title: 'Total Clinical Intakes', 
      value: stats?.total_reports || '0', 
      sub: 'Cumulative intakes database', 
      icon: <FiActivity className="text-indigo-600 w-5 h-5" />,
      bg: 'from-indigo-50/40 to-indigo-100/5 dark:from-indigo-950/25 dark:to-slate-850/10 border-indigo-100 dark:border-slate-800/80 shadow-indigo-100/10'
    },
    { 
      title: 'Avg Stress Risk Index', 
      value: `${stats?.avg_risk?.toFixed(1)}%` || '0.0%', 
      sub: 'Mean calculated Stress Index', 
      icon: <FiAlertTriangle className="text-amber-500 w-5 h-5" />,
      bg: 'from-amber-50/40 to-amber-100/5 dark:from-amber-950/20 dark:to-slate-850/10 border-amber-100 dark:border-slate-800/80 shadow-amber-100/10'
    },
    { 
      title: 'Avg Wellness Index', 
      value: `${stats?.avg_wellness?.toFixed(1)}/100` || '0.0/100', 
      sub: 'Mean wellness score quotient', 
      icon: <FiHeart className="text-emerald-500 w-5 h-5" />,
      bg: 'from-emerald-50/40 to-emerald-100/5 dark:from-emerald-950/25 dark:to-slate-850/10 border-emerald-100 dark:border-slate-800/80 shadow-emerald-100/10'
    },
    { 
      title: 'Covered Geographies', 
      value: `${stats?.unique_cities} Cities` || '0 Cities', 
      sub: 'National observatory scope', 
      icon: <FiMapPin className="text-rose-500 w-5 h-5" />,
      bg: 'from-rose-50/40 to-rose-100/5 dark:from-rose-950/20 dark:to-slate-850/10 border-rose-100 dark:border-slate-800/80 shadow-rose-100/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-medium animate-fadeIn">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-750 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
            <span className="text-2xl leading-none">📊</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              Clinical Observatory Dashboard
            </span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
            Real-Time Clinical Aggregates, Demographic Breakdowns, and Intake Feeds
          </p>
        </div>
        <div className="flex space-x-2.5">
          <button 
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 font-bold text-xs transition-all duration-200"
          >
            <FiUsers className="w-4 h-4" />
            <span>Demographics Filter</span>
          </button>
          <button 
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none px-4 py-2.5 font-bold text-xs transition-all duration-200"
          >
            <FiTrendingUp className="w-4 h-4" />
            <span>Export Aggregates</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${kpi.bg} p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all duration-300 backdrop-blur-md`}
          >
            <div className="flex justify-between items-start">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">{kpi.title}</p>
              <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-750/70 flex items-center justify-center shadow-sm">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{kpi.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                {kpi.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Stress Doughnut & Depression PHQ-9 Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stress Distribution Doughnut */}
        <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 flex flex-col h-full shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
          <div className="pb-3.5">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
              🎯 Stress Risk Distribution
            </h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
              Clinical Classification Ratios
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stressDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stressDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{reports.length}</span>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Assessed</span>
              </div>
            </div>
            
            <div className="space-y-3 flex-1 w-full sm:w-auto">
              {stressDistribution.map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-950 dark:text-white block leading-none">{entry.value}</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 inline-block">{entry.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depression Severity (PHQ-9) */}
        <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 flex flex-col h-full shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
          <div className="pb-3.5">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
              🧠 Depression Severity Distribution
            </h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
              Standardized PHQ-9 Ranges
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
          
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depressionSeverity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} className="font-extrabold uppercase tracking-wider" tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} className="font-extrabold" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                <Bar dataKey="Cases" fill="#6366f1" radius={[6, 6, 0, 0]} name="Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Occupation Analytics & Age Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Occupation Analytics */}
        <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 flex flex-col h-full shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
          <div className="pb-3.5">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
              💼 Occupation Intensity Benchmarks
            </h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
              Depression vs. Stress Risk Averages
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
          
          {occupationAnalyticsData.length > 0 ? (
            <div className="h-72 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupationAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} className="font-extrabold uppercase tracking-wider" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} className="font-extrabold" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                  <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 10 }} />
                  <Bar dataKey="Stress Avg (%)" fill="#f59e0b" radius={[5, 5, 0, 0]} name="Stress Risk Avg" />
                  <Bar dataKey="Depression Avg (%)" fill="#6366f1" radius={[5, 5, 0, 0]} name="Depression Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              No occupational analytics found.
            </div>
          )}
        </div>

        {/* Age Group Curves */}
        <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 flex flex-col h-full shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
          <div className="pb-3.5">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
              👥 Age Group Wellness Dynamics
            </h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
              Stress vs. Wellness Index Curves
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
          
          {ageGroupAnalyticsData.length > 0 ? (
            <div className="h-72 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ageGroupAnalyticsData}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="group" stroke="#94a3b8" fontSize={9} className="font-extrabold uppercase tracking-wider" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} className="font-extrabold" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Stress Risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorStress)" strokeWidth={3} name="Stress Index" />
                  <Area type="monotone" dataKey="Wellness Index" stroke="#10b981" fillOpacity={1} fill="url(#colorWellness)" strokeWidth={3} name="Wellness Index" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              No age group analytics found.
            </div>
          )}
        </div>

      </div>

      {/* Row 4: Recent Clinical Reports Table */}
      <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
        <div className="pb-3.5">
          <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
            🚨 Recent Intake Assessment Monitor
          </h4>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
            Real-Time Clinical Records Feed
          </p>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
        
        {/* Responsive Custom Table */}
        <div className="overflow-x-auto w-full">
          {recentReports.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-750/80 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4 text-center">Stress Risk</th>
                  <th className="py-3.5 px-4 text-center">PHQ-9 / GAD-7</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-750/35 text-xs font-bold text-slate-700 dark:text-slate-300">
                {recentReports.map((report, index) => {
                  
                  // Pulse dot variables based on risk level
                  let dotColor = 'bg-emerald-500';
                  let pulseColor = 'rgba(16, 185, 129, 0.4)';
                  let badgeBg = 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/30 dark:border-emerald-900/30';
                  if (report.risk === 'High') {
                    dotColor = 'bg-red-500';
                    pulseColor = 'rgba(239, 68, 68, 0.4)';
                    badgeBg = 'bg-red-500/10 text-red-600 border border-red-200/30 dark:border-red-900/30';
                  } else if (report.risk === 'Medium' || report.risk === 'Moderate') {
                    dotColor = 'bg-amber-500';
                    pulseColor = 'rgba(245, 158, 11, 0.4)';
                    badgeBg = 'bg-amber-500/10 text-amber-600 border border-amber-200/30 dark:border-amber-900/30';
                  }

                  return (
                    <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors duration-150">
                      <td className="py-4 px-4 font-black text-indigo-600 dark:text-indigo-400">{report.id}</td>
                      <td className="py-4 px-4 text-slate-400">{report.time}</td>
                      <td className="py-4 px-4">{report.city}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${badgeBg}`}>
                          {/* Pulsing indicator dot */}
                          <span className="relative flex h-1.5 w-1.5 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: pulseColor }} />
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
                          </span>
                          <span>{report.risk}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-black text-slate-950 dark:text-white">{report.stress}</td>
                      <td className="py-4 px-4 text-center text-[11px] font-mono font-bold">
                        <span className="text-indigo-600 dark:text-indigo-400">{report.phq}</span>
                        <span className="text-slate-300 dark:text-slate-700 mx-2">|</span>
                        <span className="text-amber-500 dark:text-amber-400">{report.gad}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 ml-auto transition-all duration-200"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              No intake assessments have been recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
