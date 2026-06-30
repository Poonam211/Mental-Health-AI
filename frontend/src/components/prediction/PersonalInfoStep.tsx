import React from 'react';
import { FiMapPin, FiActivity, FiBriefcase } from 'react-icons/fi';

interface PersonalInfoStepProps {
  age: number;
  setAge: (val: number) => void;
  city: string;
  setCity: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  physicalActivity: string;
  setPhysicalActivity: (val: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  age, setAge, city, setCity, gender, setGender, occupation, setOccupation, physicalActivity, setPhysicalActivity
}) => {
  


  const activities = [
    { value: 'Low', label: 'Low', desc: 'Sedentary lifestyle, minimal movement' },
    { value: 'Moderate', label: 'Moderate', desc: 'Light workouts, routine walking' },
    { value: 'High', label: 'High', desc: 'Regular athletic or heavy training' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-l-4 border-indigo-600 pl-4 space-y-1.5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          Personal Profile & Habitation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Please provide your core demographics and physical activity levels for diagnostic baseline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Age Slider Section */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Age
            </span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-3 py-1 rounded-xl">
              {age} Years Old
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>10 yrs</span>
            <span>100 yrs</span>
          </div>
        </div>

        {/* 2. Address/Locality Input Section */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Current Address / Locality
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiMapPin className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Sadashiv Dangat Nagar, Ambegaon Budruk, Pune"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-750/80 rounded-2xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* 3. Gender Selection Section */}
        <div className="md:col-span-2 space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Gender Identity
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['Male', 'Female'].map((gen) => {
              const isSelected = gender === gen;
              return (
                <button
                  key={gen}
                  type="button"
                  onClick={() => setGender(gen)}
                  className={`py-4 px-6 rounded-2xl border font-extrabold text-sm transition-all duration-200 flex items-center justify-center space-x-2.5 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-lg leading-none">{gen === 'Male' ? '♂️' : '♀️'}</span>
                  <span>{gen}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Occupation Select Section */}
        <div className="md:col-span-2 space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Occupational Background & Daily Situation
          </label>
          <div className="relative">
            <span className="absolute top-4.5 left-0 pl-4 flex items-start pointer-events-none text-slate-400 dark:text-slate-500">
              <FiBriefcase className="w-4.5 h-4.5 mt-0.5" />
            </span>
            <textarea
              rows={2}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Describe your current situation (e.g. software engineer working remotely under project deadlines, full-time student preparing for exams, homemaker caring for children...)"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-750/80 rounded-2xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm transition-all duration-200 leading-relaxed resize-none"
              required
            />
          </div>
        </div>

        {/* 5. Physical Activity Section */}
        <div className="md:col-span-2 space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Physical Activity Habits
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activities.map((act) => {
              const isSelected = physicalActivity === act.value;
              return (
                <button
                  key={act.value}
                  type="button"
                  onClick={() => setPhysicalActivity(act.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FiActivity className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    <span className="text-sm font-black">{act.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {act.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalInfoStep;
