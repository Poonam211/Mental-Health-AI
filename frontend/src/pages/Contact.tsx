import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiSend } from 'react-icons/fi';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !email || !subject || !message) {
      setError('Please fill in all the required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    
    // Simulate form submission delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow text-left font-medium">
      {/* Title Header */}
      <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
          <span className="text-indigo-600 dark:text-indigo-400">✉️</span>
          <span>Contact & Feedback Support</span>
        </h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">
          Get in touch for observatory enquiries, platform feedback, or academic collaborations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact details & Disclaimer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <h3 className="text-base font-black text-slate-800 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-850">
                📞 Contact Information
              </h3>

              <div className="space-y-5">
                {[
                  { label: 'General Queries', val: 'support@mentalhealth.ai', icon: <FiMail className="text-indigo-600 dark:text-indigo-400 w-5 h-5" /> },
                  { label: 'Technical Enquiries', val: '+91 20 555-1234', icon: <FiPhone className="text-emerald-600 dark:text-emerald-400 w-5 h-5" /> },
                  { label: 'Research Institute Address', val: 'Observatory Labs, Deccan Gymkhana, Pune, India', icon: <FiMapPin className="text-amber-600 dark:text-amber-400 w-5 h-5" /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-850">
              <div className="p-5 bg-amber-500/5 border border-amber-500/15 dark:border-amber-500/10 rounded-2xl text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-semibold">
                <span className="font-black text-amber-600 dark:text-amber-400 flex items-center space-x-1.5 mb-1.5 uppercase tracking-wider text-[9px]">
                  <FiAlertTriangle className="w-3.5 h-3.5" />
                  <span>Clinical Disclaimer</span>
                </span>
                MentalHealth.AI is an AI prediction observatory and is <span className="font-bold text-slate-900 dark:text-white">NOT</span> a substitute for professional clinical medical advice, psychiatric diagnosis, or mental health therapy. Always consult a certified psychiatrist or counselor regarding emotional conditions.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-50 dark:border-slate-850">
              <FiMessageSquare className="text-indigo-600 dark:text-indigo-400 w-4.5 h-4.5" />
              <span>Send us a Message</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Your Name */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>
                {/* Email Address */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this enquiry about?"
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Draft your clinical or general enquiry message here..."
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center space-x-2.5 p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold"
                  >
                    <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center space-x-2.5 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                  >
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-48 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black py-3 px-6 transition-all shadow-md shadow-indigo-600/15 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-3.5 h-3.5" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
