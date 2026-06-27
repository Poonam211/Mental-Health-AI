import React from 'react';
import { FiCpu, FiServer, FiLayers, FiDatabase, FiAward } from 'react-icons/fi';

const About: React.FC = () => {
  const stackItems = [
    {
      title: 'Decoupled Client UI',
      icon: <FiLayers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      tech: 'React 18 &bull; Vite &bull; TypeScript &bull; Framer Motion &bull; Tailwind CSS &bull; Recharts'
    },
    {
      title: 'Rest API Backend',
      icon: <FiServer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      tech: 'FastAPI &bull; Python 3 &bull; Uvicorn &bull; Pydantic &bull; JWT Auth'
    },
    {
      title: 'AI Diagnostics',
      icon: <FiCpu className="w-5 h-5 text-red-500 dark:text-red-400" />,
      tech: 'Scikit-Learn &bull; Random Forest Classifier & Regressor &bull; joblib'
    },
    {
      title: 'Data & Geocoding',
      icon: <FiDatabase className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      tech: 'Pandas &bull; OpenStreetMap Nominatim API &bull; SQLite Persistence'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow text-left font-medium">
      {/* Title Header */}
      <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
          <span className="text-indigo-600 dark:text-indigo-400">ℹ️</span>
          <span>About the Observatory System</span>
        </h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">
          Technical architecture, machine learning models, and decoupled clinical design systems
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-50 dark:border-slate-850">
          <FiAward className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
          <span>Project Mission & Clinical Scope</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          The MentalHealth.AI Observatory is a clinical intelligence platform designed to provide accessible, non-identifiable, and decentralized mental health risk assessments. By bridging the gap between rigorous psychological diagnostic scales (PHQ-9 & GAD-7) and machine learning regression algorithms, the system empowers individuals with immediate, private risk indicators while aggregating geographical analytics to map urban stress indices nationwide.
        </p>
      </div>

      {/* Architecture Visualizer */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-black text-slate-850 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-850">
          ⛓️ Decoupled System Architecture
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
          {/* Client UI Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-2.5 relative shadow-sm">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              Client UI
            </span>
            <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">React + Vite SPA</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Collects assessments via a tactile multi-step wizard, displays real-time analytics using Recharts, and plots city coordinates on Leaflet maps.
            </p>
          </div>

          {/* Interactive Arrow Divider */}
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-4">
            <span className="text-[9px] font-black uppercase tracking-widest mb-1">REST API Gate</span>
            <div className="flex items-center space-x-2">
              <span className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800 hidden md:block" />
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                JSON / HTTP
              </span>
              <span className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            </div>
          </div>

          {/* Backend Server Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-2.5 relative shadow-sm">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              Backend Server
            </span>
            <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">FastAPI App</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Validates inputs via Pydantic schemas, triggers Scikit-Learn prediction arrays, geocodes via OSMap, and persists intake reports securely.
            </p>
          </div>
        </div>
      </div>

      {/* ML & Stack details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ML Models */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-50 dark:border-slate-850">
              <FiCpu className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              <span>Diagnostics ML Engines</span>
            </h3>
            
            <div className="space-y-5 mt-5">
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center space-x-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <span>Random Forest Regressor (Risk Engine)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Evaluates age, lifestyle factors (sleep, activity, treatment), and aggregated PHQ-9 & GAD-7 scores to output a continuous risk score percentage from 0.00% to 100.00%.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center space-x-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <span>Random Forest Classifier (Severity Engine)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Categorizes the risk profile into discrete clinical classes (Low Risk, Medium Risk, High Risk) to align with standard clinical diagnostic guidelines.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center space-x-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <span>Symptom NLP Tagging</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Runs natural language keyword extractions to identify anxiety, depression, and stress markers inside free-text symptom descriptions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-50 dark:border-slate-850">
              <FiLayers className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              <span>Technical Stack Breakdown</span>
            </h3>
            
            <div className="space-y-4 mt-5">
              {stackItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-850 font-semibold">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-850 dark:text-white uppercase tracking-wider">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal" dangerouslySetInnerHTML={{ __html: item.tech }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
