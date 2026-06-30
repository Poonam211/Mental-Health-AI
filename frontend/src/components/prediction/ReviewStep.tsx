import React from 'react';
import { Typography, Grid, Divider } from '@mui/material';

interface ReviewStepProps {
  age: number;
  city: string;
  gender: string;
  occupation: string;
  physicalActivity: string;
  chronicIllness: string;
  sleepHours: number;
  mentalHistory: string;
  daysOfTreatment: number;
  symptoms: string;
  phqAnswers: string[];
  gadAnswers: string[];
  eatingHabits: string;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  age, city, gender, occupation, physicalActivity, chronicIllness, sleepHours, mentalHistory, daysOfTreatment, symptoms, phqAnswers, gadAnswers, eatingHabits
}) => {
  
  const optionScores: Record<string, number> = {
    "Not at all": 0,
    "Several days": 1,
    "More than half the days": 2,
    "Nearly every day": 3
  };

  const phqSum = phqAnswers.reduce((sum, ans) => sum + optionScores[ans], 0);
  const gadSum = gadAnswers.reduce((sum, ans) => sum + optionScores[ans], 0);

  return (
    <div className="space-y-6 font-medium">
      <div className="border-l-4 border-indigo-600 pl-4 space-y-1">
        <Typography variant="h6" className="text-slate-800 dark:text-white font-black">
          🔍 Review Assessment Parameters
        </Typography>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verify your details before running the AI diagnostic evaluations.
        </p>
      </div>

      <Grid container spacing={3}>
        {/* Personal Specs */}
        <Grid item xs={12} sm={6}>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
            <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Personal & Demographics
            </Typography>
            <Divider />
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex justify-between"><span>Age:</span> <span className="font-bold text-slate-850 dark:text-white">{age} yrs</span></li>
              <li className="flex justify-between"><span>City:</span> <span className="font-bold text-slate-850 dark:text-white">{city || 'Pune'}</span></li>
              <li className="flex justify-between"><span>Gender:</span> <span className="font-bold text-slate-850 dark:text-white">{gender}</span></li>
              <li className="flex justify-between"><span>Occupation:</span> <span className="font-bold text-slate-850 dark:text-white">{occupation}</span></li>
              <li className="flex justify-between"><span>Activity:</span> <span className="font-bold text-slate-850 dark:text-white">{physicalActivity}</span></li>
            </ul>
          </div>
        </Grid>

        {/* Health Specs */}
        <Grid item xs={12} sm={6}>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
            <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Clinical & Lifestyle
            </Typography>
            <Divider />
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex justify-between"><span>Chronic Illness:</span> <span className="font-bold text-slate-850 dark:text-white">{chronicIllness}</span></li>
              <li className="flex justify-between"><span>Mental Health History:</span> <span className="font-bold text-slate-850 dark:text-white">{mentalHistory}</span></li>
              <li className="flex justify-between"><span>Average Sleep:</span> <span className="font-bold text-slate-850 dark:text-white">{sleepHours} hrs</span></li>
              <li className="flex justify-between"><span>Days of Treatment:</span> <span className="font-bold text-slate-850 dark:text-white">{daysOfTreatment} days</span></li>
              <li className="flex justify-between"><span>Eating Habits:</span> <span className="font-bold text-slate-850 dark:text-white">{eatingHabits}</span></li>
            </ul>
          </div>
        </Grid>

        {/* Questionnaires Sums */}
        <Grid item xs={12}>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
            <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Diagnostic Scale Summaries
            </Typography>
            <Divider />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">PHQ-9 Depression Indicator</p>
                <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{phqSum} / 27</h4>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">GAD-7 Anxiety Indicator</p>
                <h4 className="text-2xl font-black text-orange-600 mt-1">{gadSum} / 21</h4>
              </div>
            </div>
          </div>
        </Grid>

        {/* Symptoms Description */}
        {symptoms && (
          <Grid item xs={12}>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
              <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Symptom Description
              </Typography>
              <Divider />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "{symptoms}"
              </p>
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ReviewStep;
