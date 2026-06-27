import React from 'react';

interface SymptomsStepProps {
  symptoms: string;
  setSymptoms: (val: string) => void;
}

const SymptomsStep: React.FC<SymptomsStepProps> = ({ symptoms, setSymptoms }) => {
  const commonSymptoms = [
    'Panic attacks', 'Insomnia', 'Constant worrying', 
    'Mood swings', 'Fatigue', 'Focus issues', 'Social anxiety'
  ];

  const handleAddSymptom = (tag: string) => {
    const current = symptoms.trim();
    if (current === '') {
      setSymptoms(tag);
    } else if (!current.toLowerCase().includes(tag.toLowerCase())) {
      setSymptoms(`${current}, ${tag.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="border-l-4 border-indigo-600 pl-4 space-y-1.5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          Symptom Narrative Analyzer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Express your emotional and physical state in your own words. The AI engine will parse this text for key clinical indicators.
        </p>
      </div>

      <div className="space-y-4">
        {/* Quick Add Suggestions Chips */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
            Quick-Add Clinical Indicators
          </span>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddSymptom(tag)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/30 border border-slate-200/50 dark:border-slate-750 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-xl text-xs font-bold transition-all duration-200"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Textarea */}
        <div className="relative">
          <textarea
            rows={6}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Explain how you feel (e.g., I feel nervous all day, struggle to fall asleep, feel exhausted, and experience racing thoughts during work meetings...)"
            className="w-full p-5 bg-slate-50/30 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-750/80 rounded-2xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-sm transition-all duration-200 leading-relaxed resize-none"
          />
          <span className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-750">
            {symptoms.length} Characters
          </span>
        </div>

        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider flex items-center space-x-1">
          <span>💡</span>
          <span>Tip: Providing details like sleep disruptions, treatment status, or triggers helps the AI compute more refined wellness scores.</span>
        </p>
      </div>
    </div>
  );
};

export default SymptomsStep;
