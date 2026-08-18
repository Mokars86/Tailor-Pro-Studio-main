import React, { useState, useEffect } from 'react';
import { Scissors, Lock, Mail, MessageCircle, Coffee, Sparkles, UserCheck, Download } from 'lucide-react';
import { UserRole } from '../../types';

interface SignInViewProps {
  onSignInSuccess: (email: string, role?: UserRole) => void;
  onGoToRegister: () => void;
  onOpenCustomerTracker: () => void;
  onOpenAdminPortal?: () => void;
  onOpenInstallApp?: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onSignInSuccess,
  onGoToRegister,
  onOpenCustomerTracker,
  onOpenAdminPortal,
  onOpenInstallApp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Master (Studio Owner & Financial Control)');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignInSuccess(email, selectedRole);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-[#EBF5F0] text-[#0D3B36] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 pt-[max(16px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))] font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden overflow-y-auto select-none custom-scrollbar touch-pan-y">
      
      {/* Soft Background Ambient Light Orbs (Clipping Container) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#0D3B36]/10 via-emerald-600/10 to-transparent blur-2xl -top-10 -left-10" />
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-emerald-600/10 via-emerald-200/20 to-transparent blur-2xl -bottom-10 -right-10" />
      </div>

      <div className="w-full max-w-md mx-auto space-y-5 relative z-10 py-4 sm:py-6">
        
        {/* App Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            {/* Ambient Gold Glow Halo */}
            <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-[#DCA134]/40 via-amber-300/30 to-[#DCA134]/40 blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="w-22 h-22 sm:w-24 sm:h-24 mx-auto rounded-[28px] bg-[#061E1B] border-4 border-[#DCA134] overflow-hidden shadow-2xl relative">
              <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" className="w-full h-full object-cover" />
            </div>

            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0D3B36] text-white border border-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-black text-[#0D3B36] tracking-tight uppercase">
              Tailor Pro
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-[#4A6B63] tracking-widest uppercase">
              Bespoke Atelier Management System
            </p>
          </div>
        </div>

        {/* Form Block inside Enhanced Frosted Light Card */}
        <div className="rounded-[32px] p-6 sm:p-8 space-y-5 border border-white/80 shadow-xl bg-white/85 backdrop-blur-md text-[#0D3B36]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>SIGN IN ROLE</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('Master (Studio Owner & Financial Control)')}
                  className={`py-2.5 px-3 rounded-2xl font-black text-xs transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedRole.startsWith('Master')
                      ? 'bg-[#0D3B36] text-amber-300 border-[#0D3B36] shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span>👑 Master Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('Apprentice (Trainee & CAD Blueprint View)')}
                  className={`py-2.5 px-3 rounded-2xl font-black text-xs transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedRole.startsWith('Apprentice')
                      ? 'bg-[#0D3B36] text-amber-300 border-[#0D3B36] shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span>🎓 Apprentice Trainee</span>
                </button>
              </div>
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <span>EMAIL ADDRESS</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#0D3B36]/50 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole.startsWith('Apprentice') ? "apprentice@tailorpro.com" : "master@tailorpro.com"}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <span>PASSWORD</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0D3B36]/50 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#0D3B36]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
            >
              Sign In to Atelier →
            </button>
          </form>

          {/* Secondary Links & Navigation */}
          <div className="space-y-3 pt-3 border-t border-[#0D3B36]/10 text-center">
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-xs sm:text-sm font-bold text-[#0D3B36] hover:underline block w-full transition-colors"
            >
              Don't have a studio account? <span className="underline font-black text-[#0D3B36]">Register Studio Here</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomerTracker}
              className="text-xs font-bold text-[#0D3B36] hover:text-[#082824] transition-all flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-white/80 hover:bg-white border border-[#0D3B36]/15 hover:border-[#0D3B36]/30 shadow-xs group cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-[#0D3B36] group-hover:rotate-12 transition-transform" />
              <span>Are you a customer? <span className="underline font-extrabold text-[#0D3B36]">Track Order Status Here</span></span>
            </button>

            {/* Official WhatsApp Group Support Button */}
            <a
              href="https://chat.whatsapp.com/B9WTaQnwjel9Nka8NX8bMd"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#21C063] hover:bg-[#1ca856] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#21C063]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              title="Join Tailor Pro WhatsApp Support Group"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-white text-[#21C063] shrink-0" />
              <span>Join Tailor Pro WhatsApp Support Group 💬</span>
            </a>
          </div>
        </div>

        {/* Footer Developer Badge & Admin Console */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white text-xs font-bold text-[#0D3B36] shadow-2xs">
              <img src="/mokars_tech_logo.png" alt="Mokars Tech" className="w-5 h-5 object-contain" />
              <span>Developed by <strong className="font-black text-[#0D3B36]">Mokars Tech</strong></span>
            </div>

            {onOpenAdminPortal && (
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="px-3.5 py-1.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] text-white text-xs font-black border border-[#0D3B36]/30 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Super Admin Portal (Approvals & License Keys)"
              >
                <span>🔑</span>
                <span>Admin Console</span>
              </button>
            )}
          </div>

          {/* Support Card */}
          <div className="glass-card rounded-2xl p-4 text-center space-y-1 bg-white/60 border border-white/80">
            <div className="text-xs font-bold text-[#0D3B36] flex items-center justify-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-[#0D3B36]" />
              <span>Support Tailor Pro</span>
            </div>
            <p className="text-[11px] text-[#0D3B36]/70 font-semibold">
              Buy me a coffee via MTN Mobile Money:
            </p>
            <p className="text-xs font-extrabold text-[#0D3B36] tracking-wider">
              0546920418
            </p>
            <p className="text-[10px] text-[#0D3B36]/60 font-semibold">
              Name: Mubarik Tuahir Ali
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
