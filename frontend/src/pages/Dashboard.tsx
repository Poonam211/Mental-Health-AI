import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  FiActivity, FiHeart, FiAlertTriangle, FiMapPin, FiEye,
  FiBriefcase, FiBookOpen, FiShield
} from 'react-icons/fi';
import { getDashboardStats, getAnalyticsDemographics, getReports } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import NearbyServices from '@/components/prediction/NearbyServices';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Clinical' | 'Hospital' | 'Academic' | 'Corporate'>('Clinical');
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTriageForServices, setSelectedTriageForServices] = useState<any>(null);
  const [activeTriagePatient, setActiveTriagePatient] = useState<any>(null);

  // Fetch live data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, , reportsRes] = await Promise.all([
          getDashboardStats(),
          getAnalyticsDemographics(),
          getReports()
        ]);
        setStats(statsRes.data);
        setReports(reportsRes.data);
      } catch (err: any) {
        setError(err.message || String(err) || 'Failed to connect to the mental health analytics server.');
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
        gad: `${r.Anxiety_Score}/21`,
        original: r
      }));
  }, [reports]);

  // Hospital Triage Calculations
  const clinicalTriageList = useMemo(() => {
    return reports
      .filter((r: any) => r.Risk_Level === 'High' || (r.Symptom_Analysis && r.Symptom_Analysis.Intent_Crisis_Alert >= 6))
      .map((r: any, idx: number) => {
        const isCrisis = r.Symptom_Analysis && r.Symptom_Analysis.Intent_Crisis_Alert >= 6;
        return {
          id: `MH-Tri-${101 + idx}`,
          age: r.Age,
          occupation: r.Occupation || 'N/A',
          city: r.City,
          level: isCrisis ? 'CRITICAL CRISIS' : 'HIGH RISK',
          symptomSummary: r.Symptoms || 'Severe stress indicators reported.',
          sleep: r.Sleep_Hours || 6.0,
          phq: r.Depression_Score || 0,
          gad: r.Anxiety_Score || 0,
          status: isCrisis ? 'Immediate Call Needed' : 'Triage Queue',
          latitude: r.Latitude,
          longitude: r.Longitude
        };
      });
  }, [reports]);

  // Auto-select the first triage patient when list loads
  useEffect(() => {
    if (clinicalTriageList.length > 0 && !activeTriagePatient) {
      setActiveTriagePatient(clinicalTriageList[0]);
    }
  }, [clinicalTriageList, activeTriagePatient]);

  // Academic Student Workspace Calculations
  const studentReports = useMemo(() => {
    return reports.filter((r: any) => r.Occupation?.toLowerCase() === 'student');
  }, [reports]);

  const studentStats = useMemo(() => {
    return studentReports;
  }, [studentReports]);

  // Dynamic AI-generated Academic recommendations based on student cohort data
  const dynamicAcademicRecommendations = useMemo(() => {
    if (!studentReports.length) {
      return {
        status: 'Low',
        statusColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-200/30 dark:border-emerald-900/30',
        recs: [
          {
            icon: '📢',
            title: 'De-Stress Zones During Exam Terms',
            desc: 'Establish mindfulness zones and pet-therapy programs on campus during semester mid-terms and finals to mitigate academic pressure spikes.'
          },
          {
            icon: '🎓',
            title: 'Peer-to-Peer Counseling Circles',
            desc: 'Fund student-led peer counseling programs to reduce the hesitation in seeking mental wellness help among student cohorts.'
          },
          {
            icon: '🧘',
            title: 'Campus Sleep Education Campaigns',
            desc: 'Integrate wellness routines and sleep hygiene modules into college induction curriculums to improve average student sleep hours.'
          }
        ]
      };
    }

    const total = studentReports.length;
    const avgRisk = studentReports.reduce((sum, r) => sum + (r.Risk_Score || 0), 0) / total;
    const avgPHQ = studentReports.reduce((sum, r) => sum + (r.Depression_Score || 0), 0) / total;
    const avgGAD = studentReports.reduce((sum, r) => sum + (r.Anxiety_Score || 0), 0) / total;
    const avgSleep = studentReports.reduce((sum, r) => sum + (r.Sleep_Hours || 0), 0) / total;
    const avgStress = studentReports.reduce((sum, r) => sum + (r.Stress_Percent || 0), 0) / total;
    const avgWellness = studentReports.reduce((sum, r) => sum + (r.Wellness_Score || 0), 0) / total;

    const criticalCrisisCount = studentReports.filter((r: any) => r.Symptom_Analysis && r.Symptom_Analysis.Intent_Crisis_Alert >= 6).length;

    let status: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    let statusColor = 'text-emerald-605 bg-emerald-500/10 border-emerald-200/30 dark:border-emerald-900/30';

    if (avgRisk >= 65 || criticalCrisisCount > 0) {
      status = 'Critical';
      statusColor = 'text-red-600 bg-red-500/10 border-red-200/30 dark:border-red-900/30 animate-pulse';
    } else if (avgRisk >= 50) {
      status = 'High';
      statusColor = 'text-orange-650 bg-orange-500/10 border-orange-200/30 dark:border-orange-900/30';
    } else if (avgRisk >= 35) {
      status = 'Moderate';
      statusColor = 'text-amber-600 bg-amber-500/10 border-amber-200/30 dark:border-amber-900/30';
    }

    const recs = [];

    if (status === 'Critical') {
      recs.push({
        icon: '🚨',
        title: 'Immediate Academic Load Relief',
        desc: `Campus status is CRITICAL with student stress averaging ${avgStress.toFixed(1)}%. We recommend implementing a temporary freeze on major examinations, offering flexible assignment deadlines, and deploying crisis counselors to student residential blocks.`
      });
    } else if (status === 'High') {
      recs.push({
        icon: '📢',
        title: 'Targeted Exam De-stress Zones',
        desc: `Campus status is HIGH. Set up quiet zones and pet-therapy hubs in libraries. Instruct faculty to avoid scheduling major assessments consecutively and provide mandatory de-stress breaks during long classes.`
      });
    } else if (status === 'Moderate') {
      recs.push({
        icon: '📅',
        title: 'Balanced Academic Calendar Scheduling',
        desc: `Campus status is MODERATE (stress average: ${avgStress.toFixed(1)}%). Establish academic pacing guidelines to prevent clustering of mid-terms, and encourage faculty to incorporate weekly wellness check-ins during lectures.`
      });
    } else {
      recs.push({
        icon: '🟢',
        title: 'Preventative Wellness Seminars',
        desc: `Campus status is LOW. Maintain this healthy baseline (wellness average: ${avgWellness.toFixed(1)}/100) by offering optional workshops on time management, study habits, and exam preparation strategies.`
      });
    }

    if (avgGAD >= 12 || avgPHQ >= 12) {
      recs.push({
        icon: '🩺',
        title: 'Emergency Psychiatric & Clinical Support',
        desc: `High clinical anxiety (GAD-7: ${avgGAD.toFixed(1)}) and depression (PHQ-9: ${avgPHQ.toFixed(1)}) levels detected. Fast-track clinic appointments, establish a 24/7 campus mental health helpline, and launch anonymous clinical screening drives.`
      });
    } else if (avgGAD >= 7 || avgPHQ >= 7) {
      recs.push({
        icon: '🎓',
        title: 'Peer-to-Peer Counseling Circles',
        desc: `Moderate anxiety/depression trends observed. Fund student-led peer support groups, train resident advisors in mental health first aid, and host wellness workshops in student dormitories.`
      });
    } else {
      recs.push({
        icon: '🧠',
        title: 'Resilience & Mental Well-being Campaigns',
        desc: `Clinical scores are stable (anxiety: ${avgGAD.toFixed(1)}, depression: ${avgPHQ.toFixed(1)}). Maintain healthy minds by organizing campus-wide de-stigmatization campaigns and offering mindfulness meditation sessions.`
      });
    }

    if (avgSleep < 5.5) {
      recs.push({
        icon: '🛌',
        title: 'Urgent Sleep Hygiene Interventions',
        desc: `Student sleep averages a critical ${avgSleep.toFixed(1)} hours. We recommend introducing campus nap pods, restricting overnight library hours to prevent cramming, and conducting sleep hygiene workshops during student inductions.`
      });
    } else if (avgSleep < 6.5) {
      recs.push({
        icon: '🧘',
        title: 'Sleep Pacing & Sleep Hygiene Modules',
        desc: `Student sleep average is ${avgSleep.toFixed(1)} hours, indicating chronic sleep deprivation. Integrate wellness routines into the campus calendar and offer yoga/meditation sessions to improve sleep quality.`
      });
    } else {
      recs.push({
        icon: '🏃',
        title: 'Healthy Lifestyle & Campus Activity Programs',
        desc: `Average student sleep is healthy at ${avgSleep.toFixed(1)} hours. Maintain this by promoting outdoor recreational activities, intramural sports leagues, and keeping campus sports facilities open later.`
      });
    }

    return { status, statusColor, recs };
  }, [studentReports]);

  // Academic stress timeline aggregated dynamically from student reports
  const academicStressTimeline = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(m => ({ name: m, 'Stress Risk': 0, 'Placements Anxiety': 0, count: 0 }));

    studentReports.forEach(r => {
      if (!r.Timestamp) return;
      const date = new Date(r.Timestamp);
      if (isNaN(date.getTime())) return;
      const monthIdx = date.getMonth();
      monthlyData[monthIdx]['Stress Risk'] += r.Stress_Percent || r.Risk_Score || 0;
      monthlyData[monthIdx]['Placements Anxiety'] += r.Anxiety_Percent || 0;
      monthlyData[monthIdx].count += 1;
    });

    const activeData = monthlyData.map(m => ({
      name: m.name,
      'Stress Risk': m.count > 0 ? parseFloat((m['Stress Risk'] / m.count).toFixed(1)) : 0,
      'Placements Anxiety': m.count > 0 ? parseFloat((m['Placements Anxiety'] / m.count).toFixed(1)) : 0
    }));

    return activeData;
  }, [studentReports]);

  // Corporate HR Workspace Calculations
  const employeeReports = useMemo(() => {
    return reports.filter((r: any) =>
      r.Occupation?.toLowerCase() === 'employee' ||
      r.Occupation?.toLowerCase() === 'business' ||
      r.Occupation?.toLowerCase() === 'freelancer'
    );
  }, [reports]);

  const employeeStats = useMemo(() => {
    return employeeReports;
  }, [employeeReports]);

  // Aggregate corporate burnout data by occupation (Top 5 + Others)
  const corporateBurnoutData = useMemo(() => {
    if (!employeeReports.length) return [];

    const groups: { [key: string]: { stressSum: number; sleepSum: number; count: number } } = {};

    employeeReports.forEach(r => {
      const occ = r.Occupation || 'Unknown';
      if (!groups[occ]) {
        groups[occ] = { stressSum: 0, sleepSum: 0, count: 0 };
      }
      groups[occ].stressSum += r.Stress_Percent || 0;
      groups[occ].sleepSum += r.Sleep_Hours || 0;
      groups[occ].count += 1;
    });

    const list = Object.keys(groups).map(occ => ({
      name: occ,
      stressAvg: parseFloat((groups[occ].stressSum / groups[occ].count).toFixed(1)),
      sleepAvg: parseFloat((groups[occ].sleepSum / groups[occ].count).toFixed(1)),
      count: groups[occ].count
    }));

    list.sort((a, b) => b.count - a.count);

    if (list.length <= 6) {
      return list;
    }

    const top5 = list.slice(0, 5);
    const rest = list.slice(5);

    let restStressSum = 0;
    let restSleepSum = 0;
    let restCount = 0;

    rest.forEach(item => {
      restStressSum += item.stressAvg * item.count;
      restSleepSum += item.sleepAvg * item.count;
      restCount += item.count;
    });

    top5.push({
      name: 'Others',
      stressAvg: parseFloat((restStressSum / restCount).toFixed(1)),
      sleepAvg: parseFloat((restSleepSum / restCount).toFixed(1)),
      count: restCount
    });

    return top5;
  }, [employeeReports]);

  // Dynamic AI-generated HR recommendations based on employee cohort data
  const dynamicHRRecommendations = useMemo(() => {
    if (!employeeReports.length) {
      return [
        {
          icon: '⚡',
          title: 'Workload Regulation Policy',
          desc: 'Encourage team leaders to establish clear boundaries for after-hours communication and promote regular break intervals.'
        },
        {
          icon: '🧘',
          title: 'Mindfulness & Mental Health Support',
          desc: 'Provide employees access to self-guided mindfulness applications and organize monthly stress management workshops.'
        },
        {
          icon: '🥗',
          title: 'Nutritional & Lifestyle Coaching',
          desc: 'Introduce healthy snacks in the workplace cafeteria and offer optional wellness seminars focusing on sleep hygiene.'
        }
      ];
    }

    const total = employeeReports.length;
    const avgStress = employeeReports.reduce((sum, r) => sum + (r.Stress_Percent || 0), 0) / total;
    const avgPHQ = employeeReports.reduce((sum, r) => sum + (r.Depression_Score || 0), 0) / total;
    const avgGAD = employeeReports.reduce((sum, r) => sum + (r.Anxiety_Score || 0), 0) / total;
    const avgSleep = employeeReports.reduce((sum, r) => sum + (r.Sleep_Hours || 0), 0) / total;

    const junkOrIrregularCount = employeeReports.filter((r: any) => {
      const diet = (r.Eating_Habits || '').toLowerCase();
      return diet.includes('junk') || diet.includes('irregular') || diet.includes('sugar');
    }).length;
    const poorDietRatio = junkOrIrregularCount / total;

    const lowActivityCount = employeeReports.filter((r: any) => {
      const act = (r.Physical_Activity || '').toLowerCase();
      return act.includes('low') || act.includes('sedentary');
    }).length;
    const lowActivityRatio = lowActivityCount / total;

    const recs = [];

    // Recommendation 1: Stress & Workload
    if (avgStress >= 55 || avgGAD >= 10) {
      recs.push({
        icon: '🚨',
        title: 'Critical Workload De-escalation Protocol',
        desc: `The employee cohort exhibits a high stress index (${avgStress.toFixed(1)}%) and elevated anxiety (GAD-7 average: ${avgGAD.toFixed(1)}). We recommend implementing an immediate 'No-Meeting Friday' policy, restricting internal Slack/email communications after 7 PM, and training managers on burnout detection.`
      });
    } else if (avgStress >= 40) {
      recs.push({
        icon: '⚡',
        title: 'Proactive Workload Balance Policy',
        desc: `With a moderate stress index of ${avgStress.toFixed(1)}%, proactive measures are advised. Implement flexible working hours, establish clear project scoping guidelines to prevent scope creep, and encourage employees to take their accrued paid time off.`
      });
    } else {
      recs.push({
        icon: '🟢',
        title: 'Routine Workload Audits',
        desc: `The cohort stress index is currently stable at ${avgStress.toFixed(1)}%. Maintain this healthy baseline by conducting bi-monthly workload satisfaction surveys and providing managers with resource-planning toolkits.`
      });
    }

    // Recommendation 2: Sleep & Mental Health
    if (avgSleep < 6.0 || avgPHQ >= 10) {
      recs.push({
        icon: '🛌',
        title: 'Sleep Hygiene & Clinical Screenings',
        desc: `Average sleep duration has fallen to ${avgSleep.toFixed(1)} hours (below the 7-hour clinical threshold), correlating with an elevated depression index (PHQ-9 average: ${avgPHQ.toFixed(1)}). Provide free, anonymous clinical counseling sessions and launch a 'Sleep for Performance' campaign offering sleep tracker subsidies.`
      });
    } else if (avgSleep < 7.0) {
      recs.push({
        icon: '🧘',
        title: 'Mindfulness & Sleep Support Services',
        desc: `The cohort average sleep of ${avgSleep.toFixed(1)} hours suggests mild sleep deprivation. We recommend providing corporate subscriptions to mindfulness apps (e.g., Headspace) and hosting expert-led sleep hygiene workshops.`
      });
    } else {
      recs.push({
        icon: '🧠',
        title: 'Resilience & Mental Well-being Seminars',
        desc: `Average sleep is healthy at ${avgSleep.toFixed(1)} hours. To sustain this, integrate mental well-being webinars into the employee onboarding process and promote peer-to-peer mental health champion networks.`
      });
    }

    // Recommendation 3: Diet & Physical Activity
    if (poorDietRatio >= 0.4 || lowActivityRatio >= 0.4) {
      recs.push({
        icon: '🥗',
        title: 'Active Lifestyle & Cafeteria Nutrition Overhaul',
        desc: `${(poorDietRatio * 100).toFixed(0)}% of employees report poor dietary habits and ${(lowActivityRatio * 100).toFixed(0)}% report low physical activity. We recommend substituting cafeteria junk food with fresh fruits/nuts, partnering with local gyms for corporate discounts, and initiating a '10k Steps' team competition.`
      });
    } else {
      recs.push({
        icon: '🏃',
        title: 'Micro-Break & Healthy Snacking Initiatives',
        desc: `To further optimize wellness, introduce standing desks, schedule mandatory 5-minute stretch breaks during long meetings, and stock office pantries with healthy, low-glycemic index snacks.`
      });
    }

    return recs;
  }, [employeeReports]);

  // Dynamic Triage Metrics
  // Dynamic eating habits and stress index correlation
  const eatingHabitsStressData = useMemo(() => {
    const habits = [
      { habit: 'Balanced Diet', key: 'balanced', stressAvg: 0, count: 0, color: 'bg-emerald-500' },
      { habit: 'Vegetarian / Vegan', key: 'veg', stressAvg: 0, count: 0, color: 'bg-teal-500' },
      { habit: 'Irregular Meals', key: 'irregular', stressAvg: 0, count: 0, color: 'bg-orange-500' },
      { habit: 'High Sugar / Junk Food', key: 'junk', stressAvg: 0, count: 0, color: 'bg-red-500' }
    ];

    employeeStats.forEach((r: any) => {
      const diet = (r.Eating_Habits || '').toLowerCase();
      let index = 0;
      if (diet.includes('balanced')) index = 0;
      else if (diet.includes('veg') || diet.includes('vegan')) index = 1;
      else if (diet.includes('irregular')) index = 2;
      else if (diet.includes('junk') || diet.includes('sugar')) index = 3;
      else return;

      habits[index].stressAvg += r.Stress_Percent || r.Risk_Score || 0;
      habits[index].count += 1;
    });

    return habits.map(h => ({
      habit: h.habit,
      stressAvg: h.count > 0 ? parseFloat((h.stressAvg / h.count).toFixed(1)) : 0,
      color: h.color
    }));
  }, [employeeStats]);

  // Custom Glassmorphic Dark Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-955/95 border border-slate-800 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-xl text-xs text-white backdrop-blur-md">
          <p className="font-black mb-1.5 uppercase tracking-wider text-[10px] text-slate-400">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="font-bold flex justify-between space-x-6 py-0.5">
              <span style={{ color: p.color || p.fill }}>{p.name}:</span>
              <span>{p.value.toFixed(1)}{p.name.includes('Sleep') || p.name.includes('Hours') ? ' hrs' : p.name.includes('%') || p.name === 'Cases' ? '' : '%'}</span>
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
      value: stats?.avg_risk !== undefined && stats?.avg_risk !== null ? `${stats.avg_risk.toFixed(1)}%` : '0.0%',
      sub: 'Mean calculated Stress Index',
      icon: <FiAlertTriangle className="text-amber-500 w-5 h-5" />,
      bg: 'from-amber-50/40 to-amber-100/5 dark:from-amber-950/20 dark:to-slate-850/10 border-amber-100 dark:border-slate-800/80 shadow-amber-100/10'
    },
    {
      title: 'Avg Wellness Index',
      value: stats?.avg_wellness !== undefined && stats?.avg_wellness !== null ? `${stats.avg_wellness.toFixed(1)}/100` : '0.0/100',
      sub: 'Mean wellness score quotient',
      icon: <FiHeart className="text-emerald-500 w-5 h-5" />,
      bg: 'from-emerald-50/40 to-emerald-100/5 dark:from-emerald-950/25 dark:to-slate-850/10 border-emerald-100 dark:border-slate-800/80 shadow-emerald-100/10'
    },
    {
      title: 'Covered Geographies',
      value: stats?.unique_cities !== undefined && stats?.unique_cities !== null ? `${stats.unique_cities} Cities` : '0 Cities',
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
              City Intelligence Observatory
            </span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
            Real-Time Clinical Aggregates, Environmental Stressors, and Institutional Dashboards
          </p>
        </div>
      </div>

      {/* Workspace Selector Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-750 gap-2.5 pb-1">
        {[
          { id: 'Clinical', label: '🩺 Public Observatory', desc: 'Standard clinical metrics' },
          { id: 'Hospital', label: '🏥 Smart Hospital Portal', desc: 'Triage & crisis escalation' },
          { id: 'Academic', label: '🎓 Academic Portal', desc: 'Student cohort analysis' },
          { id: 'Corporate', label: '🏢 Corporate HR Hub', desc: 'Employee stress profiles' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-start px-4.5 py-3.5 rounded-2xl border transition-all duration-200 text-left min-w-[160px] ${activeTab === tab.id
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
          >
            <span className="text-xs font-black leading-tight">{tab.label}</span>
            <span className={`text-[9px] font-bold mt-1 ${activeTab === tab.id ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Conditional Rendering of Workspaces */}
      {activeTab === 'Clinical' && (
        <>
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
                              onClick={() => setSelectedReport(report)}
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
        </>
      )}

      {/* Hospital Workspace */}
      {activeTab === 'Hospital' && (
        <div className="space-y-6">
          {/* Hospital KPIs & Referral Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* KPI Cards (Left 2 Columns) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Critical Escalations', value: clinicalTriageList.filter((t: any) => t.level.includes('CRITICAL')).length, sub: 'AI Crisis Intent Triggers', color: 'text-red-500', bg: 'from-red-50 to-red-100/5 dark:from-red-950/20 dark:to-slate-850/10 border-red-200 dark:border-red-900/40' },
                { title: 'High-Risk Triage', value: clinicalTriageList.filter((t: any) => t.level.includes('HIGH')).length, sub: 'Clinical Risk Scores >= 60%', color: 'text-amber-500', bg: 'from-amber-50 to-amber-100/5 dark:from-amber-950/20 dark:to-slate-850/10 border-amber-200 dark:border-amber-900/40' }
              ].map((k, i) => (
                <div key={i} className={`bg-gradient-to-br ${k.bg} p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-full backdrop-blur-md`}>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">{k.title}</p>
                  <div className="mt-4 space-y-1">
                    <h3 className={`text-3xl font-black ${k.color} leading-none tracking-tight`}>{k.value}</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">{k.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hospital Recommendations Panel (Right 2 Columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-850/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-750/70 shadow-sm flex flex-col justify-between h-full backdrop-blur-md overflow-hidden">
              {activeTriagePatient ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Active Triage Referral: {activeTriagePatient.id}
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
                        Location: {activeTriagePatient.city}
                      </p>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800/65 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      {activeTriagePatient.level}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-750/50 my-2" />
                  <div className="max-h-64 overflow-y-auto pr-1">
                    <NearbyServices 
                      city={activeTriagePatient.city} 
                      riskLevel={activeTriagePatient.level.includes('CRITICAL') ? 'Critical' : 'High'}
                      latitude={activeTriagePatient.latitude}
                      longitude={activeTriagePatient.longitude}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2">
                  <FiMapPin className="w-8 h-8 text-slate-300 dark:text-slate-750" />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                    No Active Triage Patient
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                    Select a patient in the triage queue below to view nearby mental health services.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hospital Triage Queue Table */}
          <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md">
            <div className="pb-3.5 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiShield className="text-indigo-600 dark:text-indigo-400" />
                  <span>Hospital Emergency & Crisis Escalation Triage</span>
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                  Real-time admissions and critical cases flagged by AI Intent Detection
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />

            <div className="overflow-x-auto w-full">
              {clinicalTriageList.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-750/80 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="py-3.5 px-4">Triage ID</th>
                      <th className="py-3.5 px-4">Origin Hub</th>
                      <th className="py-3.5 px-4">Priority Status</th>
                      <th className="py-3.5 px-4">Symptom Context</th>
                      <th className="py-3.5 px-4 text-center">Depression / Anxiety Scale</th>
                      <th className="py-3.5 px-4 text-right">Escalation Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-750/35 text-xs font-bold text-slate-750 dark:text-slate-300">
                    {clinicalTriageList.map((tr: any, index) => {
                      const isCrisis = tr.level.includes('CRITICAL');
                      return (
                        <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors duration-150">
                          <td className="py-4 px-4 font-black text-indigo-600 dark:text-indigo-400">{tr.id}</td>
                          <td className="py-4 px-4">{tr.city}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isCrisis ? 'bg-red-500/10 text-red-650 border border-red-200/40' : 'bg-amber-500/10 text-amber-600 border border-amber-200/40'
                              }`}>
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 mr-2 ${isCrisis ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`} />
                              <span>{tr.level}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate" title={tr.symptomSummary}>{tr.symptomSummary}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-red-505 font-semibold text-slate-750 dark:text-slate-300">PHQ-9: {tr.phq}</span>
                            <span className="mx-2 text-slate-350">|</span>
                            <span className="text-amber-505 font-semibold text-slate-750 dark:text-slate-300">GAD-7: {tr.gad}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                setActiveTriagePatient(tr);
                                setSelectedTriageForServices(tr);
                              }}
                              className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-200 border border-indigo-200 text-indigo-600 dark:border-slate-700 dark:text-indigo-400 hover:bg-indigo-50/30"
                            >
                              <FiMapPin className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Nearby Services</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                  No critical triage alerts registered currently.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Academic Workspace */}
      {activeTab === 'Academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Student Exam/Placement Stress Cycles Timeline */}
            <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiBookOpen className="text-indigo-600 dark:text-indigo-400" />
                  <span>Academic Calendar Stress cycles</span>
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                  Monitoring student stress spikes across semesters
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
              {studentStats.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={academicStressTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} className="font-extrabold uppercase tracking-wider" tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} className="font-extrabold" tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 10 }} />
                      <Line type="monotone" dataKey="Stress Risk" stroke="#ef4444" strokeWidth={3} name="Exam Stress Risk" />
                      <Line type="monotone" dataKey="Placements Anxiety" stroke="#f59e0b" strokeWidth={3} name="Placements Anxiety" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                  No academic stress trends recorded.
                </div>
              )}
            </div>

            {/* Student Severity Distribution */}
            <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiActivity className="text-indigo-600 dark:text-indigo-400" />
                  <span>Student Anxiety Cohorts</span>
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                  Distribution of Anxiety (GAD-7) severity levels among students
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
              <div className="space-y-4">
                {studentStats.length > 0 ? (
                  [
                    { range: 'Severe anxiety (15-21)', count: studentStats.filter(s => s.Anxiety_Score >= 15).length, percent: (studentStats.filter(s => s.Anxiety_Score >= 15).length / studentStats.length) * 100, color: 'bg-red-500' },
                    { range: 'Moderate anxiety (10-14)', count: studentStats.filter(s => s.Anxiety_Score >= 10 && s.Anxiety_Score < 15).length, percent: (studentStats.filter(s => s.Anxiety_Score >= 10 && s.Anxiety_Score < 15).length / studentStats.length) * 100, color: 'bg-orange-500' },
                    { range: 'Mild anxiety (5-9)', count: studentStats.filter(s => s.Anxiety_Score >= 5 && s.Anxiety_Score < 10).length, percent: (studentStats.filter(s => s.Anxiety_Score >= 5 && s.Anxiety_Score < 10).length / studentStats.length) * 100, color: 'bg-yellow-500' },
                    { range: 'Minimal anxiety (0-4)', count: studentStats.filter(s => s.Anxiety_Score < 5).length, percent: (studentStats.filter(s => s.Anxiety_Score < 5).length / studentStats.length) * 100, color: 'bg-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5 text-xs text-slate-650 dark:text-slate-355">
                      <div className="flex justify-between font-extrabold">
                        <span>{item.range}</span>
                        <span>{item.count} Cases ({item.percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                    No student anxiety reports recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Interventions Advice */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>🏫</span>
                <span>AI-Generated Academic Interventions & Campus Actions</span>
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Campus Mental Health Status:</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${dynamicAcademicRecommendations.statusColor}`}>
                  {dynamicAcademicRecommendations.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-bold text-slate-655 dark:text-slate-350">
              {dynamicAcademicRecommendations.recs.map((rec, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-sm hover:shadow-md transition-all duration-250">
                  <span className="text-lg">{rec.icon}</span>
                  <h5 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wide">{rec.title}</h5>
                  <p className="leading-relaxed">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Corporate HR Hub */}
      {activeTab === 'Corporate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Sleep vs stress correlation */}
            <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiBriefcase className="text-indigo-600 dark:text-indigo-400" />
                  <span>Workplace Burnout Correlation</span>
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                  Mapping how Average Sleep hours align with employee Stress Levels by Job Role
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
              {corporateBurnoutData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={corporateBurnoutData} margin={{ top: 15, right: 45, left: 15, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={9}
                        className="font-extrabold"
                        tickLine={false}
                        label={{ value: 'Occupational Category', position: 'insideBottom', offset: -10, fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#ef4444"
                        fontSize={9}
                        className="font-extrabold"
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Stress Avg (%)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 9, fontWeight: 'bold', fill: '#ef4444' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10b981"
                        fontSize={9}
                        className="font-extrabold"
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Sleep Hours Avg (hrs)', angle: 90, position: 'insideRight', offset: 15, fontSize: 9, fontWeight: 'bold', fill: '#10b981' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 15 }} />
                      <Bar yAxisId="left" dataKey="stressAvg" fill="#ef4444" radius={[4, 4, 0, 0]} name="Stress Score" maxBarSize={20} />
                      <Bar yAxisId="right" dataKey="sleepAvg" fill="#10b981" radius={[4, 4, 0, 0]} name="Sleep Hours" maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                  No employee burnout correlations recorded.
                </div>
              )}
            </div>

            {/* Eating Habits impact */}
            <div className="bg-white dark:bg-slate-850/85 p-6 rounded-3xl border border-slate-200 dark:border-slate-750/70 shadow-md shadow-slate-100/20 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiActivity className="text-indigo-600 dark:text-indigo-400" />
                  <span>Diet & Nutritional Stress Impact</span>
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                  Correlating eating habits with elevated workplace stress indices
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-750/50 my-3" />
              <div className="space-y-4">
                {employeeStats.length > 0 ? (
                  eatingHabitsStressData.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350">
                      <div className="flex justify-between font-extrabold">
                        <span>{item.habit}</span>
                        <span>Avg Stress: {item.stressAvg.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.stressAvg}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                    No employee nutrition reports recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HR Interventions */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>🏢</span>
                <span>AI-Generated HR Wellness Strategy Recommendations</span>
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                Cohort Analytics Live
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-bold text-slate-650 dark:text-slate-350">
              {dynamicHRRecommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-slate-855 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-sm hover:shadow-md transition-all duration-250">
                  <span className="text-lg">{rec.icon}</span>
                  <h5 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wide">{rec.title}</h5>
                  <p className="leading-relaxed">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setSelectedReport(null)}
          />

          {/* Modal container */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scaleIn">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                    {selectedReport.id}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${selectedReport.risk === 'High'
                    ? 'bg-red-500/10 text-red-600 border border-red-200/30 dark:border-red-900/30'
                    : selectedReport.risk === 'Medium' || selectedReport.risk === 'Moderate'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-200/30 dark:border-amber-900/30'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/30 dark:border-emerald-900/30'
                    }`}>
                    {selectedReport.risk} Risk
                  </span>
                </div>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1.5">
                  Assessment Date: {selectedReport.original.Timestamp}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-750 dark:text-slate-300">

              {/* Profile and Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Demographics and Lifestyle */}
                <div className="space-y-6">

                  {/* Demographics Card */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      👤 Demographics & Profile
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Age</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.Age} years</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Occupation</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.Occupation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">City Location</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.City}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Coordinates</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                          {selectedReport.original.Latitude && selectedReport.original.Longitude
                            ? `${selectedReport.original.Latitude.toFixed(2)}, ${selectedReport.original.Longitude.toFixed(2)}`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle & Habits Card */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      ⚡ Lifestyle & Habits
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Sleep Duration</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.Sleep_Hours} hrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Eating Habits</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.Eating_Habits}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Physical Activity</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedReport.original.Physical_Activity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Scores Card */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      🩺 Clinical Scores
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Stress Index</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{selectedReport.original.Stress_Percent.toFixed(1)}%</span>
                      </div>
                      <div className="p-3.5 bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Wellness Score</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{selectedReport.original.Wellness_Score.toFixed(1)}/100</span>
                      </div>
                      <div className="p-3.5 bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Depression (PHQ-9)</span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{selectedReport.original.Depression_Score}/27</span>
                      </div>
                      <div className="p-3.5 bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Anxiety (GAD-7)</span>
                        <span className="text-xl font-black text-amber-500 dark:text-amber-400">{selectedReport.original.Anxiety_Score}/21</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-400 block mb-1">Diagnosed Mental State</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 capitalize bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg inline-block">
                        {selectedReport.original.Mental_State}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Right Column: Symptoms and AI Analysis */}
                <div className="space-y-6">

                  {/* Symptoms Card */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      📝 Reported Symptoms
                    </h5>
                    <p className="text-xs leading-relaxed bg-white dark:bg-slate-855 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic min-h-[80px]">
                      {selectedReport.original.Symptoms || "No symptoms reported."}
                    </p>
                  </div>

                  {/* AI Symptom Detector Analysis */}
                  {selectedReport.original.Symptom_Analysis && (
                    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                        <span>🤖 AI Clinical Analysis</span>
                        {selectedReport.original.Symptom_Analysis.Intent_Crisis_Alert !== undefined && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${selectedReport.original.Symptom_Analysis.Intent_Crisis_Alert >= 6
                            ? 'bg-rose-500/15 text-rose-600 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                            Crisis Intent: {selectedReport.original.Symptom_Analysis.Intent_Crisis_Alert}/10
                          </span>
                        )}
                      </h5>

                      {/* Stressors */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-855 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1 text-[10px]">Primary Stressor</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {selectedReport.original.Symptom_Analysis.primary_stressor || "None detected"}
                          </span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-855 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1 text-[10px]">Secondary Stressor</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {selectedReport.original.Symptom_Analysis.secondary_stressor || "None detected"}
                          </span>
                        </div>
                      </div>

                      {/* Detected Emotions & Lifestyle Problems */}
                      <div className="space-y-3">
                        {selectedReport.original.Symptom_Analysis.detected_emotions && selectedReport.original.Symptom_Analysis.detected_emotions.length > 0 && (
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider block mb-1.5">Detected Emotions</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedReport.original.Symptom_Analysis.detected_emotions.map((emotion: string, i: number) => (
                                <span key={i} className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 capitalize">
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedReport.original.Symptom_Analysis.lifestyle_problems && selectedReport.original.Symptom_Analysis.lifestyle_problems.length > 0 && (
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider block mb-1.5">Lifestyle Indicators</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedReport.original.Symptom_Analysis.lifestyle_problems.map((prob: string, i: number) => (
                                <span key={i} className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100/30 dark:border-teal-900/30 capitalize">
                                  {prob}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sub-scores / Indicators */}
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3.5 space-y-2.5">
                        <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-extrabold tracking-wider block">Stress Sub-dimensions</span>
                        {[
                          { label: 'Burnout Indicator', val: selectedReport.original.Symptom_Analysis.burnout_score, color: 'bg-red-500' },
                          { label: 'Social Isolation', val: selectedReport.original.Symptom_Analysis.social_isolation_score, color: 'bg-amber-500' },
                          { label: 'Relationship Strain', val: selectedReport.original.Symptom_Analysis.relationship_problems_score, color: 'bg-rose-500' },
                          { label: 'Financial Stress', val: selectedReport.original.Symptom_Analysis.financial_stress_score, color: 'bg-indigo-500' },
                          { label: 'Health Anxiety', val: selectedReport.original.Symptom_Analysis.health_stress_score, color: 'bg-teal-500' }
                        ].map((item, idx) => (
                          item.val !== undefined && (
                            <div key={idx} className="space-y-1 text-[11px]">
                              <div className="flex justify-between font-extrabold text-slate-600 dark:text-slate-400">
                                <span>{item.label}</span>
                                <span>{item.val.toFixed(1)}/10</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-855 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.val * 10}%` }} />
                              </div>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Explainable Summary */}
                      {selectedReport.original.Symptom_Analysis.explainable_summary && (
                        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
                          <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-extrabold tracking-wider block mb-1.5">AI Clinical Summary</span>
                          <p
                            className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 bg-indigo-50/20 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-100/20 dark:border-indigo-900/20"
                            dangerouslySetInnerHTML={{
                              __html: selectedReport.original.Symptom_Analysis.explainable_summary.replace(/\*\*(.*?)\*\//g, '<strong class="text-indigo-600 dark:text-indigo-400 font-black">$1</strong>')
                            }}
                          />
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Nearby Mental Health Services Modal */}
      <AnimatePresence>
        {selectedTriageForServices && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTriageForServices(null)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750/80 rounded-3xl p-6 shadow-2xl max-w-4xl w-full relative z-10 space-y-5 text-left backdrop-blur-md overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Nearby Clinical Services Referral
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">
                    Emergency and Psychiatric recommendations for {selectedTriageForServices.id} ({selectedTriageForServices.city})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTriageForServices(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="py-2">
                <NearbyServices
                  city={selectedTriageForServices.city}
                  riskLevel={selectedTriageForServices.level.includes('CRITICAL') ? 'Critical' : 'High'}
                  latitude={selectedTriageForServices.latitude}
                  longitude={selectedTriageForServices.longitude}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedTriageForServices(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
                >
                  Close Referral
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
