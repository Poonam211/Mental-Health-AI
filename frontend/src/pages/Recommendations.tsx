import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCompass, FiShield, FiHeart, FiWind, FiAlertCircle, FiCheckCircle, FiInfo, FiActivity } from 'react-icons/fi';

type BreathingState = 'Ready' | 'Inhale' | 'Hold-Full' | 'Exhale' | 'Hold-Empty' | 'Complete';

const Recommendations: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [breathingState, setBreathingState] = useState<BreathingState>('Ready');
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [timerLeft, setTimerLeft] = useState<number>(4);

  // Box Breathing Machine
  useEffect(() => {
    if (!isBreathing) return;

    let step = 0;
    const steps: { state: BreathingState; duration: number }[] = [
      { state: 'Inhale', duration: 4 },
      { state: 'Hold-Full', duration: 4 },
      { state: 'Exhale', duration: 4 },
      { state: 'Hold-Empty', duration: 4 }
    ];

    setBreathingState(steps[0].state);
    setTimerLeft(steps[0].duration);

    // Main 4-second ticker for state swapping
    const stepInterval = setInterval(() => {
      step = (step + 1) % 4;
      setBreathingState(steps[step].state);
      setTimerLeft(steps[step].duration);
    }, 4000);

    // 1-second countdown ticker for the UI clock
    const countdownInterval = setInterval(() => {
      setTimerLeft(prev => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    // Stop after 3 complete cycles (48 seconds)
    const timeout = setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(countdownInterval);
      setIsBreathing(false);
      setBreathingState('Complete');
      setTimerLeft(0);
    }, 48000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(countdownInterval);
      clearTimeout(timeout);
    };
  }, [isBreathing]);

  const runBoxBreathing = () => {
    if (isBreathing) return;
    setIsBreathing(true);
  };

  // Breathing Visual State Configurations
  const getVisualState = () => {
    switch (breathingState) {
      case 'Inhale':
        return {
          scale: 1.4,
          color: 'from-indigo-500 to-violet-500 shadow-indigo-500/50',
          text: 'Inhale Slowly... 🌬️',
          instruction: 'Fill your lungs with deep, clean air'
        };
      case 'Hold-Full':
        return {
          scale: 1.4,
          color: 'from-violet-500 to-fuchsia-500 shadow-violet-500/50',
          text: 'Hold Breath... 🧘',
          instruction: 'Maintain absolute clinical stillness'
        };
      case 'Exhale':
        return {
          scale: 1.0,
          color: 'from-fuchsia-500 to-emerald-500 shadow-emerald-500/50',
          text: 'Exhale Fully... 💨',
          instruction: 'Release all physical and cognitive tension'
        };
      case 'Hold-Empty':
        return {
          scale: 1.0,
          color: 'from-emerald-500 to-indigo-500 shadow-slate-500/30',
          text: 'Hold Empty... 🧘',
          instruction: 'Rest in quiet neurological reset'
        };
      case 'Complete':
        return {
          scale: 1.0,
          color: 'from-emerald-500 to-teal-500 shadow-emerald-500/40',
          text: 'Handshake Complete! ✨',
          instruction: 'Sensory downregulation achieved successfully'
        };
      default:
        return {
          scale: 1.0,
          color: 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-slate-200/20',
          text: 'Calibrator Ready',
          instruction: 'Press start to begin vagal nerve synchronization'
        };
    }
  };

  const currentVisual = getVisualState();

  const categories = [
    {
      label: 'Severe Risk (PHQ-9 ≥20 / GAD-7 ≥15)',
      icon: <FiShield className="text-red-500 w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-3.5 p-5 bg-red-500/5 border border-red-500/15 rounded-2xl text-left">
            <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Immediate Professional Consultation Advised</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                If you or someone you know is experiencing severe distress or thoughts of self-harm, please reach out to a professional immediately.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">1. Consult a Psychiatrist or Therapist</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Schedule an appointment with a licensed therapist or psychiatrist for a comprehensive clinical diagnosis and potential pharmacotherapy or psychotherapy options (like CBT).</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">2. Enforce Crisis Helpline Protocols</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Keep contact info for national mental health helplines readily accessible. Talk to a trusted family member, close friend, or support group who can assist you during episodes.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">3. Stabilize Daily Circadian Rhythm</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Prioritize a highly disciplined sleep-wake cycle. Sleep deprivation or erratic sleep patterns act as high-intensity stressors that directly exacerbate neural emotional centers.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">4. Engage in Basic Behavioral Activation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Commit to extremely small, achievable daily objectives. Behavioral activation (e.g. taking a 10-minute walk, washing a dish) counteracts severe emotional withdrawal.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Moderate Risk (PHQ-9 ≥15 / GAD-7 ≥10)',
      icon: <FiCompass className="text-amber-500 w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-3.5 p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-left">
            <FiInfo className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Active Self-Care & Support Recommended</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                Elevated anxiety or depressive symptoms are detected. Practicing regular mindfulness and structured routines can halt risk progression.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">1. Regular Cardiovascular Exercise</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Engage in 30 minutes of aerobic exercise (jogging, brisk walking, swimming) 3-4 times a week. Aerobic activities trigger immediate endorphin and serotonin releases.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">2. Implement Mindfulness Meditation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Utilize mindfulness meditation techniques to ground hyperactive neural networks. Focus on present-moment breathing to reduce excessive amygdala triggers.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">3. Limit Cortisol-Inducing Inputs</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Reduce dietary stimulants like caffeine and sugar, which mimic physical anxiety signals (palpitations, jitters). Establish strict digital detox hours.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">4. Join Supportive Social Dialogues</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Do not isolate. Plan coffee chats, phone calls, or group activities with supportive peers. Social bonding releases oxytocin, buffering emotional stress.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Healthy State (PHQ-9 <15 / GAD-7 <10)',
      icon: <FiHeart className="text-emerald-500 w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-3.5 p-5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl text-left">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Healthy Mental State Maintained</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                Excellent! Your scores point to a stable emotional state. Focus on preventative practices to sustain this wellness index.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">1. Maintain Active Social Connections</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Keep nurture-focused family and peer interactions high. Strong relationships form the absolute bedrock of long-term emotional resilience.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">2. Practice Proactive Work-Life Balance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Enforce clear professional boundaries. Dedicate fixed portions of your week to hobbies, recreational games, and personal interests.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">3. Cultivate Gratitude Journals</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Keep a diary documenting 3 positive events daily. This simple cognitive reframing exercise reinforces positive neural path retention.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">4. Engage in Balanced Physical Fitness</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">Regular walks, yoga, and stretching maintain optimal musculoskeletal tone, improving blood flow and cognitive agility.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow text-left font-medium">
      {/* Title Header */}
      <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
          <span className="text-indigo-600 dark:text-indigo-400">💡</span>
          <span>Recommendations & Remedies</span>
        </h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">
          Evidence-based self-care regimens, cognitive reframing methodologies, and breathing therapies
        </p>
      </div>

      {/* Box Breathing Tool */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl flex-1 flex flex-col justify-center">
          <h3 className="text-base font-black text-indigo-950 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-50 dark:border-slate-850/40">
            <FiWind className={`text-indigo-600 dark:text-indigo-400 ${isBreathing ? 'animate-spin [animation-duration:3s]' : 'animate-bounce'}`} />
            <span>Interactive Box Breathing Trainer</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Box breathing (4-4-4-4) is a powerful vagus nerve stimulant used by clinical experts to immediately downregulate stress levels. Click start and sync your breath with the visual indicator below.
          </p>
          <div className="pt-2">
            <button
              onClick={runBoxBreathing}
              disabled={isBreathing}
              className={`px-6 py-3 rounded-xl font-black text-xs shadow-md transition-all ${
                isBreathing 
                  ? 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
              }`}
            >
              {isBreathing ? 'Breathing Exercise In Progress...' : 'Start Vagus Nerve Calibration'}
            </button>
          </div>
        </div>

        {/* Dynamic Vagus Breathing Visual Spherical Calibrator */}
        <div className="w-full lg:w-[320px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner p-6 min-h-[220px] relative overflow-hidden">
          
          {/* Breathing Calibrator Circle */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Ambient Background Aura */}
            <motion.div
              animate={{ 
                scale: currentVisual.scale * 1.1,
                opacity: isBreathing ? [0.1, 0.25, 0.1] : 0.05
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className={`absolute inset-0 bg-gradient-to-tr ${currentVisual.color} rounded-full blur-2xl`}
            />
            
            {/* The Actual Expanding/Contracting Spherical Orb */}
            <motion.div
              animate={{ scale: currentVisual.scale }}
              transition={{ duration: 3.8, ease: "easeInOut" }}
              className={`w-16 h-16 rounded-full bg-gradient-to-tr ${currentVisual.color} shadow-lg flex items-center justify-center relative z-10`}
            >
              {/* Floating inner core */}
              <div className="w-4 h-4 bg-white/25 rounded-full blur-[1px] animate-pulse" />
            </motion.div>
          </div>

          {/* Subtitle labels */}
          <div className="mt-4 space-y-1 z-10">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Vagus Calibrator</p>
            <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
              {currentVisual.text}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold max-w-[240px]">
              {currentVisual.instruction}
            </p>
          </div>

          {/* Timer Clock overlay */}
          {isBreathing && (
            <div className="absolute top-4 right-4 bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono font-black text-slate-700 dark:text-slate-300">
              Clock: {timerLeft}s
            </div>
          )}
        </div>
      </div>

      {/* remedies Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-50 dark:border-slate-850">
          <FiActivity className="text-indigo-600 dark:text-indigo-400 w-4.5 h-4.5" />
          <span>Categorized Clinical Recommendations</span>
        </h3>

        {/* Tab Buttons bar */}
        <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850 gap-1 overflow-x-auto">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setTabValue(idx)}
              className={`flex items-center justify-center space-x-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                tabValue === idx
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800 text-indigo-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabValue}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {categories[tabValue].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
