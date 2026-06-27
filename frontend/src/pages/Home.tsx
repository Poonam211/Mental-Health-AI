import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiMapPin, FiSmile, 
  FiArrowRight, FiShield, FiCpu, FiCompass, 
  FiLock, FiFileText, FiCheck 
} from 'react-icons/fi';

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const steps = [
    {
      num: '01',
      title: 'Diagnostic Intake',
      desc: 'Complete standardized GAD-7 & PHQ-9 questionnaires and detail your emotional status in free-text.',
      icon: <FiFileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    },
    {
      num: '02',
      title: 'Neural Processing',
      desc: 'Local ML classification and regression models evaluate multi-variable risk scores instantly.',
      icon: <FiCpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      num: '03',
      title: 'Geographic Mapping',
      desc: 'Anonymized city metrics are securely plotted on the national risk observatory registry.',
      icon: <FiMapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    {
      num: '04',
      title: 'Coping Activation',
      desc: 'Receive tailored clinical advice, coping articles, and interactive box breathing guides.',
      icon: <FiSmile className="w-5 h-5 text-rose-500 dark:text-rose-400" />
    }
  ];

  const features = [
    {
      title: 'Clinically Validated Scales',
      desc: 'Utilizes standardized PHQ-9 and GAD-7 diagnostic metrics trusted by psychiatrists worldwide.',
      icon: <FiCheck className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100/40 dark:border-indigo-900/35'
    },
    {
      title: 'Privacy-First Architecture',
      desc: 'GDPR-compliant sandbox processing. Absolutely zero personal identifiers or health records are retained.',
      icon: <FiLock className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100/40 dark:border-emerald-900/35'
    },
    {
      title: 'Automated Geocoding',
      desc: 'Integrates real-time city-to-coordinate conversions via Nominatim OpenStreetMap engines.',
      icon: <FiMapPin className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100/40 dark:border-amber-900/35'
    },
    {
      title: 'Responsive Observatories',
      desc: 'Visualizes national stress distributions on interactive Leaflet maps and demographic Recharts charts.',
      icon: <FiTrendingUp className="w-5 h-5 text-rose-500" />,
      color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100/40 dark:border-rose-900/35'
    }
  ];

  return (
    <div className="flex-1 flex flex-col justify-center bg-slate-50/20 dark:bg-slate-950 transition-colors duration-350 overflow-hidden animate-fadeIn">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle glowing mesh backdrop */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full filter blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-600/5 rounded-full filter blur-3xl -z-10" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] [background-size:24px_24px] opacity-20 dark:opacity-5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left: Text CTA */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-100/65 dark:border-indigo-900/50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm"
              >
                <FiShield className="w-4 h-4 text-indigo-700" />
                <span>Modern Healthcare SaaS &bull; Secure Diagnostics</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  Clinical Intelligence for{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
                    Mind & Community
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xl">
                  An advanced mental health observatory providing secure, private diagnostic risk scoring and geographical wellness mapping powered by machine learning.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <RouterLink
                  to="/predict"
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center space-x-2.5 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-250"
                >
                  <span>Launch Assessment</span>
                  <FiArrowRight className="w-4.5 h-4.5" />
                </RouterLink>
                <RouterLink
                  to="/dashboard"
                  className="px-8 py-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl flex items-center justify-center space-x-2.5 transition-all duration-200 shadow-sm"
                >
                  <span>Explore Observatory</span>
                  <FiCompass className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                </RouterLink>
              </motion.div>
            </div>

            {/* Hero Right: Floating Mockup Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="w-full max-w-sm"
              >
                {/* Frosted glass preview box */}
                <div className="border border-slate-200/80 dark:border-slate-750 bg-white/80 dark:bg-slate-850/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden relative">
                  <div className="bg-slate-50 dark:bg-slate-900/40 px-6 py-4 border-b border-slate-200 dark:border-slate-750 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Clinical Preview</span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Secure Link</span>
                    </span>
                  </div>
                  <div className="p-6 space-y-5 font-bold text-left">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Index</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">Mental Wellness</h4>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-750 my-2" />
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black text-slate-600 dark:text-slate-400">
                        <span>Predictive Risk Score</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-black">42.1%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full w-[42%]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100/60 dark:border-slate-750/70 text-center">
                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Anxiety</p>
                        <p className="text-base font-black text-amber-600 mt-0.5">Moderate</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100/60 dark:border-slate-750/70 text-center">
                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Depression</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">Mild</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ANIMATED STATISTICS SECTION */}
      <section className="bg-white dark:bg-slate-850 py-16 border-y border-slate-200/80 dark:border-slate-750 transition-colors duration-350">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Stat 1: SVG Progress Circle */}
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-slate-100 dark:stroke-slate-700 fill-none" strokeWidth="6" />
                  <motion.circle 
                    cx="40" cy="40" r="34" 
                    className="stroke-indigo-600 fill-none" 
                    strokeWidth="6" 
                    strokeDasharray="213.6"
                    initial={{ strokeDashoffset: 213.6 }}
                    whileInView={{ strokeDashoffset: 213.6 * (1 - 0.948) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-850 dark:text-white">94.8%</span>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">Diagnostic Accuracy</h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 max-w-[200px] leading-relaxed">ML classification precision mapped to standard clinical intake.</p>
            </motion.div>

            {/* Stat 2: Counter Entry */}
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 flex items-center justify-center">
                <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">10k+</h3>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">Assessments Administered</h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 max-w-[200px] leading-relaxed">Anonymized questionnaires processed in sandbox registries.</p>
            </motion.div>

            {/* Stat 3: Expanding Map Icon */}
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900 text-emerald-600"
                >
                  <FiMapPin className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">24 Urban Hubs</h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 max-w-[200px] leading-relaxed">Geographic stress levels mapped dynamically across major Indian cities.</p>
            </motion.div>

            {/* Stat 4: Inference Latency */}
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 flex items-center justify-center flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                  <h3 className="text-4xl font-black text-slate-850 dark:text-white tracking-tight">&lt; 120ms</h3>
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">Inference Latency</h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 max-w-[200px] leading-relaxed">Instant mathematical regressions for real-time user feedback.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-12 animate-fadeIn">
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Core System Capabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-xs uppercase tracking-wider">
            Clinically sound technology designed to provide private assessments and detailed community analytics.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 flex flex-col justify-between space-y-5 text-left transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl border ${feat.color} w-fit flex items-center justify-center`}>
                  {feat.icon}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. "HOW IT WORKS" WORKFLOW SECTION */}
      <section className="bg-slate-50/50 dark:bg-slate-900/20 py-20 border-t border-slate-200 dark:border-slate-850 transition-colors duration-350 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">How the Platform Operates</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-xs uppercase tracking-wider">
            A seamless, secure clinical sequence from diagnostic intake to therapeutic activation.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-800 -translate-y-12 z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-750 flex flex-col justify-between space-y-4 text-left shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-indigo-600/20 dark:text-indigo-400/20 tracking-wider">
                      {step.num}
                    </span>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-750 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-black text-slate-850 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HIGH-CONVERSION CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-950/40 dark:to-slate-850/60 border border-indigo-500/20 dark:border-slate-750 p-8 md:p-12 rounded-3xl text-center space-y-8 relative overflow-hidden shadow-lg"
        >
          {/* subtle mesh */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-5 dark:opacity-5" />
          
          <div className="space-y-3.5 max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Ready to Evaluate Your Cognitive Risk?
            </h2>
            <p className="text-sm text-indigo-100/90 font-semibold leading-relaxed">
              Experience the secure clinical assessment. Run a completely private diagnosis in less than 3 minutes and receive evidence-based recommendations instantly.
            </p>
          </div>

          <div className="flex justify-center relative z-10">
            <RouterLink
              to="/predict"
              className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-black rounded-2xl shadow-lg shadow-indigo-950/20 flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>Get Started Now</span>
              <FiArrowRight className="w-4.5 h-4.5" />
            </RouterLink>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
