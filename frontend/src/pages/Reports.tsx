import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  FiSearch, FiDownload, FiPrinter, FiSliders, FiFileText, 
  FiAlertCircle, FiRefreshCw, FiTrendingUp, FiMapPin, FiActivity, FiUserCheck
} from 'react-icons/fi';
import { getReports } from '@/services/api';

// Custom Glassmorphic Recharts Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/85 p-4 rounded-2xl shadow-2xl space-y-1.5 text-left text-xs min-w-[160px]">
        <p className="font-black text-slate-800 dark:text-white text-xs flex items-center space-x-1.5">
          <span className="text-indigo-400">📊</span>
          <span>{label || 'Intake Metric'}</span>
        </p>
        <hr className="border-slate-200/30 dark:border-slate-800 my-1" />
        {payload.map((pld: any) => (
          <div key={pld.name} className="flex justify-between items-center space-x-3 font-semibold">
            <span className="text-slate-400">{pld.name}:</span>
            <span className="font-black text-slate-700 dark:text-white">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [occupationFilter, setOccupationFilter] = useState<string>('All');

  // Fetch live reports on mount
  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getReports();
        setReports(response.data);
      } catch (err: any) {
        setError(err || 'Failed to connect to the clinical reports database.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, []);

  // Extract Unique Filters Dynamically from Live Data
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.City))).filter(Boolean).sort();
  }, [reports]);

  const uniqueOccupations = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.Occupation))).filter(Boolean).sort();
  }, [reports]);

  // Real-Time Intakes Feed Banner (Top 3 Recent)
  const recentFeed = useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
      .slice(0, 3)
      .map(r => ({
        id: `MH-${r.Timestamp.split('-').join('').split(':').join('').split(' ').join('').split('.').join('').substring(2, 6)}`,
        timestamp: r.Timestamp,
        city: r.City,
        risk: r.Risk_Level,
        score: r.Risk_Score,
        bg: r.Risk_Level === 'High' ? 'from-red-500/5 to-red-600/10 border-red-500/15 dark:border-red-500/10' :
            r.Risk_Level === 'Medium' || r.Risk_Level === 'Moderate' ? 'from-amber-500/5 to-amber-600/10 border-amber-500/15 dark:border-amber-500/10' :
            'from-emerald-500/5 to-emerald-600/10 border-emerald-500/15 dark:border-emerald-500/10'
      }));
  }, [reports]);

  // Client-Side Search and Advanced Filters
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = !searchTerm || 
        r.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.Occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.Mental_State?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || 
        r.Risk_Level === riskFilter || 
        (riskFilter === 'Medium' && r.Risk_Level === 'Moderate');
      const matchesCity = cityFilter === 'All' || r.City === cityFilter;
      const matchesOcc = occupationFilter === 'All' || r.Occupation === occupationFilter;
      return matchesSearch && matchesRisk && matchesCity && matchesOcc;
    });
  }, [reports, searchTerm, riskFilter, cityFilter, occupationFilter]);

  // Dynamic Calculations for Charts (From Filtered Dataset)
  const riskDistribution = useMemo(() => {
    const low = filteredReports.filter(r => r.Risk_Level === 'Low').length;
    const medium = filteredReports.filter(r => r.Risk_Level === 'Medium' || r.Risk_Level === 'Moderate').length;
    const high = filteredReports.filter(r => r.Risk_Level === 'High').length;
    const total = filteredReports.length || 1;

    return [
      { name: 'Low Risk', value: low, percentage: `${((low / total) * 100).toFixed(1)}%`, color: '#10b981' },
      { name: 'Medium Risk', value: medium, percentage: `${((medium / total) * 100).toFixed(1)}%`, color: '#f97316' },
      { name: 'High Risk', value: high, percentage: `${((high / total) * 100).toFixed(1)}%`, color: '#ef4444' }
    ];
  }, [filteredReports]);

  const cityVolumeDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    filteredReports.forEach(r => {
      counts.set(r.City, (counts.get(r.City) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([city, count]) => ({
      name: city,
      Volume: count
    })).sort((a, b) => b.Volume - a.Volume).slice(0, 5);
  }, [filteredReports]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setRiskFilter('All');
    setCityFilter('All');
    setOccupationFilter('All');
  };

  // Dynamic Live CSV Exporter
  const handleExportCSV = () => {
    if (!filteredReports.length) return;
    
    const headers = 'Timestamp,City,Age,Occupation,Risk Score,Risk Level,Mental State,PHQ-9 Score,GAD-7 Score\n';
    const rows = filteredReports.map(r => 
      `"${r.Timestamp}","${r.City}",${r.Age},"${r.Occupation}",${r.Risk_Score.toFixed(2)}%,"${r.Risk_Level}","${r.Mental_State}",${r.Depression_Score},${r.Anxiety_Score}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `mental_health_clinical_reports_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  // Dynamic Clinical PDF Generator
  const handleDownloadPDF = () => {
    if (!filteredReports.length) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = filteredReports.map((r, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold; font-family: monospace;">${r.Timestamp}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold;">${r.City}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${r.Age}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${r.Occupation}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold; color: ${r.Risk_Level === 'High' ? '#ef4444' : r.Risk_Level === 'Medium' || r.Risk_Level === 'Moderate' ? '#f97316' : '#10b981'};">${r.Risk_Score.toFixed(2)}%</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold;">${r.Risk_Level}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${r.Mental_State}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold;">${r.Depression_Score}/27</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold;">${r.Anxiety_Score}/21</td>
      </tr>
    `).join('');

    const avgRisk = filteredReports.reduce((sum, r) => sum + r.Risk_Score, 0) / filteredReports.length;
    const avgWellness = filteredReports.reduce((sum, r) => sum + r.Wellness_Score, 0) / filteredReports.length;

    const content = `
      <html>
        <head>
          <title>Clinical Summary Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
            .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; }
            .subtitle { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
            .metadata { font-size: 12px; color: #64748b; margin-top: 15px; grid-template-columns: 1fr 1fr; display: grid; }
            .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; }
            .metric-label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
            .metric-value { font-size: 20px; font-weight: 800; color: #1e293b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 9px; font-weight: bold; text-align: left; text-transform: uppercase; color: #475569; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🧠 National Mental Health Observatory</div>
            <div class="subtitle">Clinical Intake Aggregate Summary Report</div>
            <div class="metadata">
              <div><strong>Generated At:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Total Records Summarized:</strong> ${filteredReports.length}</div>
            </div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Mean Stress Risk Score</div>
              <div class="metric-value" style="color: #ef4444;">${avgRisk.toFixed(2)}%</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Mean Wellness Score</div>
              <div class="metric-value" style="color: #10b981;">${avgWellness.toFixed(2)}/100</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Risk Classification</div>
              <div class="metric-value" style="color: #6366f1;">${avgRisk >= 60 ? 'High Risk' : avgRisk >= 40 ? 'Moderate Risk' : 'Healthy'}</div>
            </div>
          </div>
          
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">📋 Detailed Intake Records</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>City</th>
                <th>Age</th>
                <th>Occupation</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Diagnostic State</th>
                <th>PHQ-9</th>
                <th>GAD-7</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="footer">
            CONFIDENTIAL &bull; Generated dynamically by the Mental Health AI Platform &bull; Observatory Database Summary
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-[550px] flex flex-col justify-center items-center space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin [animation-duration:0.8s]" />
          <div className="absolute inset-2 rounded-full border-4 border-b-violet-500 border-l-violet-500 border-t-transparent border-r-transparent animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
          <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 animate-ping" />
        </div>
        <div className="space-y-1.5 text-center">
          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
            Accessing Secure Grid
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Decrypting Clinical Observatory Database
          </p>
        </div>
      </div>
    );
  }

  // Connection Error view
  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-red-950/10 border border-red-500/20 rounded-3xl backdrop-blur-md relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/25 text-red-400 dark:text-red-400">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2.5">
            <h4 className="text-base font-black text-slate-800 dark:text-white leading-none flex items-center space-x-2">
              Diagnostic Warning: Handshake Error
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              {error}. Make sure the FastAPI backend server is running and reachable on port 8000.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center space-x-2 px-4.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
              style={{ color: '#fca5a5' }}
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry Handshake</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-medium">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
            <span className="text-indigo-600 dark:text-indigo-400">📄</span>
            <span>Clinical Reports Workspace</span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">
            Detailed assessment records database. Export, filter, and inspect clinical indicators.
          </p>
        </div>
      </div>

      {/* 1. Real-Time Intakes Feed Banner */}
      {recentFeed.length > 0 && (
        <div className="space-y-3">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center space-x-1.5">
            <FiActivity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span>Real-Time Intake Stream</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentFeed.map((report, idx) => (
              <div 
                key={idx} 
                className={`bg-gradient-to-br ${report.bg} p-5 rounded-3xl border shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all duration-300`}
              >
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">ID: {report.id}</p>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center space-x-1">
                    <FiMapPin className="text-slate-400 w-3.5 h-3.5" />
                    <span>{report.city}</span>
                  </h4>
                  <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500">{report.timestamp}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    report.risk === 'High' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                    report.risk === 'Medium' || report.risk === 'Moderate' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/10' :
                    'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10'
                  }`}>
                    {report.risk}
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-white mt-1.5">{report.score.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Dynamic Summary Charts (Recalculated from Filtered Set) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Breakdown Doughnut */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col h-80 justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <FiUserCheck className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Risk Ratios (Active Subset)</span>
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">Distribution within {filteredReports.length} records</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1 pt-2">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{filteredReports.length}</span>
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Matched</span>
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full sm:max-w-[200px]">
              {riskDistribution.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex items-center space-x-2 font-bold">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{entry.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demographic Volumes (Active Subset) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col h-80 justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <FiTrendingUp className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Geographic Volumes (Active Subset)</span>
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">Top 5 Cities by intake counts</p>
          </div>
          <div className="h-48 w-full pt-2 flex-1">
            {cityVolumeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityVolumeDistribution} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/60" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} className="font-extrabold" />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} className="font-extrabold" />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                  <Bar dataKey="Volume" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-extrabold uppercase tracking-wide border border-dashed border-slate-100 dark:border-slate-850 rounded-2xl">
                No geographic volume mapping
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Advanced Filters Control Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <FiSliders className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
            <span>Advanced Filter Workspace</span>
          </h3>
          { (searchTerm || riskFilter !== 'All' || cityFilter !== 'All' || occupationFilter !== 'All') && (
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Keyword Search */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Keyword Search</label>
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              <FiSearch className="text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search City, Job, State..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 dark:text-white outline-none w-full font-bold placeholder-slate-400 dark:placeholder-slate-655"
              />
            </div>
          </div>

          {/* Risk Level */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Risk Classification</label>
            <div className="relative">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="All">All Risks</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* City Hub */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">City Observatory Hub</label>
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="All">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Occupation */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Patient Occupation</label>
            <div className="relative">
              <select
                value={occupationFilter}
                onChange={(e) => setOccupationFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="All">All Occupations</option>
                {uniqueOccupations.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Clinical Records Grid & Exporters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2">
              <FiFileText className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Clinical Intake Records Feed</span>
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-1">Showing {filteredReports.length} records</p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={filteredReports.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold py-2.5 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print PDF Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-2.5 px-4 transition-all shadow-md shadow-indigo-600/15 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850">
                <th className="py-4.5 px-6">#</th>
                <th className="py-4.5 px-6">Timestamp</th>
                <th className="py-4.5 px-6">City</th>
                <th className="py-4.5 px-6">Age</th>
                <th className="py-4.5 px-6">Occupation</th>
                <th className="py-4.5 px-6">Risk Score</th>
                <th className="py-4.5 px-6">Risk Level</th>
                <th className="py-4.5 px-6">Mental State</th>
                <th className="py-4.5 px-6 text-center">PHQ-9</th>
                <th className="py-4.5 px-6 text-center">GAD-7</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {filteredReports.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors duration-150">
                  <td className="py-4.5 px-6 text-slate-400 dark:text-slate-500 font-medium">{idx + 1}</td>
                  <td className="py-4.5 px-6 font-mono text-slate-400 dark:text-slate-500">{r.Timestamp}</td>
                  <td className="py-4.5 px-6 text-slate-900 dark:text-white font-extrabold">{r.City}</td>
                  <td className="py-4.5 px-6">{r.Age}</td>
                  <td className="py-4.5 px-6">{r.Occupation}</td>
                  <td className="py-4.5 px-6 text-slate-900 dark:text-white font-black">{r.Risk_Score.toFixed(1)}%</td>
                  <td className="py-4.5 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      r.Risk_Level === 'High' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                      r.Risk_Level === 'Medium' || r.Risk_Level === 'Moderate' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/10' :
                      'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10'
                    }`}>
                      {r.Risk_Level}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-slate-900 dark:text-white">{r.Mental_State}</td>
                  <td className="py-4.5 px-6 text-center font-extrabold text-indigo-600 dark:text-indigo-500">{r.Depression_Score}/27</td>
                  <td className="py-4.5 px-6 text-center font-extrabold text-violet-600 dark:text-violet-500">{r.Anxiety_Score}/21</td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    No clinical reports match the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
