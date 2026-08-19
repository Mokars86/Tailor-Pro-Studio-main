import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] bg-[#EBF5F0] text-[#0D3B36] flex flex-col items-center justify-center p-6 font-['Outfit'] select-none animate-fade-in overflow-hidden">
      {/* Soft Background Ambient Light Orbs (Matching SignInView) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#0D3B36]/10 via-emerald-600/10 to-transparent blur-2xl -top-10 -left-10" />
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-emerald-600/10 via-emerald-200/20 to-transparent blur-2xl -bottom-10 -right-10" />
      </div>

      <div className="flex flex-col items-center max-w-sm w-full space-y-8 text-center my-auto z-10">
        {/* Clean Master Brand Logo Display with Heartbeat Pump & Gold Stroke */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative group"
        >
          {/* Pulsing Gold Glow Aura */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1.02, 1.1, 1],
              opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: 'easeInOut',
            }}
            className="absolute -inset-2 rounded-[36px] bg-gradient-to-r from-[#DCA134]/50 via-amber-300/40 to-[#DCA134]/50 blur-md pointer-events-none"
          />

          {/* Floating Sparkle Badge Icon (Matching SignIn & SignUp Design) */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{
              scale: { delay: 0.3, type: 'spring', stiffness: 300, damping: 15 },
              rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
            }}
            className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0D3B36] text-white border-2 border-white flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </motion.div>

          {/* Main Logo Card with Heart Pump (Heartbeat) Animation & Gold Stroke */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1.03, 1.12, 1],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: 'easeInOut',
            }}
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#DCA134] bg-[#061E1B] relative z-10"
          >
            <img
              src="/tailor_pro_logo.jpg"
              alt="Tailor Pro Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Loading Progress Bar & Status */}
        <div className="w-60 sm:w-68 space-y-4 pt-2">
          <div className="w-full h-2 bg-slate-200/90 rounded-full overflow-hidden p-0 border border-slate-300/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0D3B36] via-[#124E47] to-[#DCA134] rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Indicator Percentage */}
          <div className="flex items-center justify-between text-xs font-black text-[#0D3B36]">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#DCA134] animate-pulse" />
              Initialising Atelier...
            </span>
            <span className="font-mono">{progress}%</span>
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
