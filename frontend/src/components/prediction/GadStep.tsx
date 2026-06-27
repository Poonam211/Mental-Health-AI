import React from 'react';

interface GadStepProps {
  answers: string[];
  onChange: (index: number, val: string) => void;
}

const GadStep: React.FC<GadStepProps> = ({ answers, onChange }) => {
  const gadQuestions = [
    "Feeling nervous, anxious or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen"
  ];

  const options = [
    { label: 'Not at all', value: 'Not at all' },
    { label: 'Several days', value: 'Several days' },
    { label: 'Half the days', value: 'More than half the days' },
    { label: 'Nearly every day', value: 'Nearly every day' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-l-4 border-indigo-600 pl-4 space-y-1.5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          Anxiety Assessment (GAD-7)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Over the last 2 weeks, how often have you been bothered by any of the following problems?
        </p>
      </div>

      {/* Questions list */}
      <div className="space-y-6 max-h-[440px] overflow-y-auto pr-2">
        {gadQuestions.map((q, i) => (
          <div 
            key={i} 
            className="p-5 bg-slate-50/30 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl space-y-3.5"
          >
            <div className="flex items-start space-x-2.5">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-2 py-0.5 rounded-lg mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {q}
              </span>
            </div>
            
            {/* Horizontal Option Pill Button Group */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {options.map((opt) => {
                const isSelected = answers[i] === opt.value;
                
                // Dynamic colors based on option severity
                let activeClass = 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10 dark:shadow-none';
                if (isSelected) {
                  if (opt.value === 'More than half the days') {
                    activeClass = 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/15 dark:shadow-none';
                  } else if (opt.value === 'Nearly every day') {
                    activeClass = 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/15 dark:shadow-none';
                  }
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(i, opt.value)}
                    className={`px-3 py-3 rounded-xl text-xs font-bold border text-center transition-all duration-200 ${
                      isSelected
                        ? activeClass
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750/70 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GadStep;
