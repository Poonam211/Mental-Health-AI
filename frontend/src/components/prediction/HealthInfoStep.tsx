import React from 'react';
import { FiSun, FiCalendar, FiShield, FiHeart } from 'react-icons/fi';

interface HealthInfoStepProps {
  chronicIllness: string;
  setChronicIllness: (val: string) => void;
  sleepHours: number;
  setSleepHours: (val: number) => void;
  mentalHistory: string;
  setMentalHistory: (val: string) => void;
  daysOfTreatment: number;
  setDaysOfTreatment: (val: number) => void;
}

const HealthInfoStep: React.FC<HealthInfoStepProps> = ({
  chronicIllness, setChronicIllness, sleepHours, setSleepHours, mentalHistory, setMentalHistory, daysOfTreatment, setDaysOfTreatment
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-l-4 border-indigo-600 pl-4 space-y-1.5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          Clinical Background & Habits
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Please provide details regarding your clinical diagnostic history and daily biological rest cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Chronic Illness Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Diagnosed Chronic Illness
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'No', label: 'None', desc: 'No active chronic issues', icon: <FiShield className="w-5 h-5" /> },
              { value: 'Yes', label: 'Active Diagnosis', desc: 'Diagnosed chronic condition', icon: <FiHeart className="w-5 h-5" /> }
            ].map((opt) => {
              const isSelected = chronicIllness === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChronicIllness(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col space-y-1.5 h-full ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>{opt.icon}</span>
                    <span className="text-sm font-black">{opt.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mental Health History Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Clinical Mental Health History
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'No', label: 'No History', desc: 'No personal clinical history', icon: <FiShield className="w-5 h-5" /> },
              { value: 'Yes', label: 'Has History', desc: 'Prior clinical mental health history', icon: <FiHeart className="w-5 h-5" /> }
            ].map((opt) => {
              const isSelected = mentalHistory === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMentalHistory(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col space-y-1.5 h-full ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>{opt.icon}</span>
                    <span className="text-sm font-black">{opt.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Sleep Hours Slider */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <FiSun className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider">
                Sleep Duration
              </span>
            </div>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-3 py-1 rounded-xl">
              {sleepHours} Hours / Day
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>1 hr</span>
            <span>12 hrs</span>
          </div>
        </div>

        {/* 4. Days of Treatment Slider */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <FiCalendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider">
                Treatment Duration
              </span>
            </div>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-3 py-1 rounded-xl">
              {daysOfTreatment} Days Active
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="365"
            value={daysOfTreatment}
            onChange={(e) => setDaysOfTreatment(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>0 days</span>
            <span>365 days</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthInfoStep;
