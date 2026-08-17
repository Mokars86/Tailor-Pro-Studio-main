import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Scissors, Ruler } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#EBF5F0] flex flex-col items-center justify-center p-6 font-['Outfit'] select-none animate-fade-in overflow-hidden">
      
      {/* Background Animated Ambient Lights (Small Subtle Mint Glow) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#0D3B36]/15 via-emerald-600/10 to-emerald-200/20 blur-xl pointer-events-none"
      />

      <div className="flex flex-col items-center max-w-sm w-full space-y-7 text-center my-auto z-10">
        
        {/* Animated Custom Logo Container */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative group"
        >
          
          {/* Radiating Pulsing Small Halo Ring */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-1.5 rounded-[42px] bg-gradient-to-r from-emerald-500/40 via-[#0D3B36] to-emerald-500/40 blur-xs opacity-25"
          />

          {/* Floating Sparkle Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{
              scale: { delay: 0.4, type: 'spring', stiffness: 300, damping: 15 },
              rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
            }}
            className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full bg-[#0D3B36] text-white border-2 border-white flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </motion.div>

          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: [0, -4, 0] }}
            transition={{
              scale: { delay: 0.5, type: 'spring', stiffness: 300, damping: 15 },
              y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -bottom-2 -left-3 z-20 px-2.5 py-1 rounded-2xl bg-[#0D3B36] text-emerald-300 border border-emerald-500/40 shadow-md flex items-center gap-1.5 text-[10px] font-black"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-400" />
            <span>PREMIUM TAILORING</span>
          </motion.div>

          {/* Main Logo Card with Heartbeat Pulse Animation */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1.03, 1.15, 1],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: 'easeInOut',
            }}
            className="w-36 h-36 sm:w-44 sm:h-44 bg-[#0D3B36] rounded-[28px] sm:rounded-[34px] border-2 border-[#0D3B36] shadow-xl shadow-[#0D3B36]/25 flex items-center justify-center p-2.5 relative overflow-hidden group cursor-pointer"
          >
            {/* Custom User Logo Image */}
            <img
              src="/tailor_pro_logo.jpg"
              alt="Tailor Pro Logo"
              className="w-full h-full object-cover rounded-[22px] sm:rounded-[28px] shadow-md"
            />
          </motion.div>
        </motion.div>

        {/* Brand Main Text Header in Day Mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-1.5"
        >
          <h1 className="font-black text-3xl sm:text-4xl text-[#0D3B36] tracking-tight uppercase leading-none flex items-center justify-center gap-2">
            <span>TAILOR PRO</span>
            <Ruler className="w-6 h-6 text-[#0D3B36] animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-[#4A6B63] tracking-[0.25em] uppercase">
            PRECISION DESIGN & LAYOUT SYSTEM
          </p>
        </motion.div>

        {/* Loading Progress Bar */}
        <div className="w-56 sm:w-64 space-y-4 pt-1">
          <div className="w-full h-2 bg-slate-200/90 rounded-full overflow-hidden p-0 border border-slate-300/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0D3B36] via-[#124E47] to-emerald-500 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Indicator Percentage */}
          <div className="flex items-center justify-between text-[11px] font-black text-[#0D3B36]">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              Initialising Atelier...
            </span>
            <span>{progress}%</span>
          </div>

          {/* Skip Loading Action */}
          <div>
            <button
              type="button"
              onClick={onFinish}
              className="text-xs font-extrabold text-[#0D3B36] hover:text-[#082824] underline underline-offset-4 tracking-wide transition-all active:scale-95 cursor-pointer"
            >
              Skip Loading →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
