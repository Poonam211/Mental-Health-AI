import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

// Import Reusable Step Components
import PersonalInfoStep from '@/components/prediction/PersonalInfoStep';
import HealthInfoStep from '@/components/prediction/HealthInfoStep';
import PhqStep from '@/components/prediction/PhqStep';
import GadStep from '@/components/prediction/GadStep';
import SymptomsStep from '@/components/prediction/SymptomsStep';
import ReviewStep from '@/components/prediction/ReviewStep';
import PredictionResults from '@/components/prediction/PredictionResults';
import { predictAssessment } from '@/services/api';

const Prediction: React.FC = () => {
  // Wizard active step state (0 to 6)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Form State
  const [age, setAge] = useState<number>(25);
  const [city, setCity] = useState<string>('Pune');
  const [gender, setGender] = useState<string>('Male');
  const [occupation, setOccupation] = useState<string>('Employee');
  const [physicalActivity, setPhysicalActivity] = useState<string>('Moderate');
  const [chronicIllness, setChronicIllness] = useState<string>('No');
  const [sleepHours, setSleepHours] = useState<number>(7.0);
  const [mentalHistory, setMentalHistory] = useState<string>('No');
  const [daysOfTreatment, setDaysOfTreatment] = useState<number>(30);
  const [symptoms, setSymptoms] = useState<string>('');

  const [phqAnswers, setPhqAnswers] = useState<string[]>(Array(9).fill('Not at all'));
  const [gadAnswers, setGadAnswers] = useState<string[]>(Array(7).fill('Not at all'));

  // Prediction states
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const stepsList = [
    'Personal',
    'Health',
    'PHQ-9',
    'GAD-7',
    'Symptoms',
    'Review',
    'Results'
  ];

  const handlePhqChange = (index: number, val: string) => {
    const updated = [...phqAnswers];
    updated[index] = val;
    setPhqAnswers(updated);
  };

  const handleGadChange = (index: number, val: string) => {
    const updated = [...gadAnswers];
    updated[index] = val;
    setGadAnswers(updated);
  };

  const handleNext = () => {
    if (activeStep < 5) {
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 5) {
      handleRunDiagnosis();
    }
  };

  const handleBack = () => {
    if (activeStep > 0 && activeStep < 6) {
      setActiveStep((prev) => prev - 1);
      setError(null);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setResult(null);
    setError(null);
    setAge(25);
    setCity('Pune');
    setGender('Male');
    setOccupation('Employee');
    setPhysicalActivity('Moderate');
    setChronicIllness('No');
    setSleepHours(7.0);
    setMentalHistory('No');
    setDaysOfTreatment(30);
    setSymptoms('');
    setPhqAnswers(Array(9).fill('Not at all'));
    setGadAnswers(Array(7).fill('Not at all'));
  };

  const handleRunDiagnosis = async () => {
    setLoading(true);
    setError(null);
    
    const payload = {
      age,
      city: city.trim() !== '' ? city : 'Pune',
      gender,
      occupation,
      physical_activity: physicalActivity,
      mental_history: mentalHistory,
      chronic_illness: chronicIllness,
      sleep_hours: sleepHours,
      days_of_treatment: daysOfTreatment,
      phq_answers: phqAnswers,
      gad_answers: gadAnswers,
      symptoms
    };
    
    try {
      const response = await predictAssessment(payload);
      setResult(response.data);
      setActiveStep(6); // Advance to results
    } catch (err: any) {
      setError(err || 'Failed to calculate mental health risk. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <PersonalInfoStep
            age={age}
            setAge={setAge}
            city={city}
            setCity={setCity}
            gender={gender}
            setGender={setGender}
            occupation={occupation}
            setOccupation={setOccupation}
            physicalActivity={physicalActivity}
            setPhysicalActivity={setPhysicalActivity}
          />
        );
      case 1:
        return (
          <HealthInfoStep
            chronicIllness={chronicIllness}
            setChronicIllness={setChronicIllness}
            sleepHours={sleepHours}
            setSleepHours={setSleepHours}
            mentalHistory={mentalHistory}
            setMentalHistory={setMentalHistory}
            daysOfTreatment={daysOfTreatment}
            setDaysOfTreatment={setDaysOfTreatment}
          />
        );
      case 2:
        return (
          <PhqStep
            answers={phqAnswers}
            onChange={handlePhqChange}
          />
        );
      case 3:
        return (
          <GadStep
            answers={gadAnswers}
            onChange={handleGadChange}
          />
        );
      case 4:
        return (
          <SymptomsStep
            symptoms={symptoms}
            setSymptoms={setSymptoms}
          />
        );
      case 5:
        return (
          <ReviewStep
            age={age}
            city={city}
            gender={gender}
            occupation={occupation}
            physicalActivity={physicalActivity}
            chronicIllness={chronicIllness}
            sleepHours={sleepHours}
            mentalHistory={mentalHistory}
            daysOfTreatment={daysOfTreatment}
            symptoms={symptoms}
            phqAnswers={phqAnswers}
            gadAnswers={gadAnswers}
          />
        );
      case 6:
        return (
          <PredictionResults
            result={result}
            onReset={handleReset}
            age={age}
            city={city}
            gender={gender}
            occupation={occupation}
            sleepHours={sleepHours}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-grow flex flex-col justify-center">
      
      {/* Clinically Styled Header */}
      <div className="text-center space-y-2.5">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center space-x-2">
          <span className="text-2xl leading-none">🧠</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
            AI Diagnostic Assessment
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          Clinically Mapped Intake & Risk Diagnostics
        </p>
      </div>

      {/* Stepper Progress Card */}
      <div className="bg-white dark:bg-slate-850/85 border border-slate-200/80 dark:border-slate-750/70 p-6 rounded-3xl backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none transition-colors duration-300">
        {/* Desktop Stepper */}
        <div className="hidden md:flex justify-between items-center relative z-10 font-medium">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-4 -z-10" />
          <div 
            className="absolute top-1/2 left-4 h-0.5 bg-indigo-600 -translate-y-4 -z-10 transition-all duration-350"
            style={{ width: `${(activeStep / (stepsList.length - 1)) * 95}%` }}
          />

          {stepsList.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isActive = activeStep === idx;
            return (
              <div key={idx} className="flex flex-col items-center space-y-2.5 relative">
                <div 
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-350 ${
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                      : isActive
                        ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 dark:text-indigo-400 scale-110 shadow-lg shadow-indigo-100/40 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-4.5 h-4.5" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper Counter */}
        <div className="md:hidden text-center flex justify-between items-center font-bold">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase">Step {activeStep + 1} of {stepsList.length}</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{stepsList[activeStep]}</span>
          <div className="w-20 bg-slate-200 dark:bg-slate-750 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-350"
              style={{ width: `${((activeStep + 1) / stepsList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="bg-white dark:bg-slate-850/90 border border-slate-200 dark:border-slate-750/75 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden relative backdrop-blur-md transition-colors duration-300">
        
        {/* Glowing Async Loader overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md z-30 flex flex-col justify-center items-center space-y-4">
            <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-800 dark:text-white tracking-wide animate-pulse">
              Running Diagnostic Risk Regressions...
            </p>
          </div>
        )}
        
        <div className="p-8 md:p-10">
          {error && (
            <div className="mb-6 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 space-y-1 animate-fadeIn">
              <h4 className="font-black text-xs uppercase tracking-widest">Diagnostic Inference Error</h4>
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {renderActiveStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Controls Navigation footer (Hide on Results Step) */}
        {activeStep < 6 && (
          <div className="bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-750/70 px-8 py-4.5 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none px-6 py-2.5 font-black text-xs uppercase tracking-wider transition-all duration-200"
            >
              <span>{activeStep === 5 ? '🔍 Run Risk Diagnostics' : 'Next'}</span>
              {activeStep < 5 && <FiChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
