import React, { useState, useEffect } from 'react';
import { Scissors, Lock, Mail, MessageCircle, Sparkles, UserCheck, Smartphone, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '../../types';
import { signInSupabaseUser } from '../../services/supabaseService';
import { getUserAccountRecords } from '../../services/licenseService';

interface SignInViewProps {
  onSignInSuccess: (email: string, role?: UserRole, password?: string) => void;
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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Master (Studio Owner & Financial Control)');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // ── 1. Instant check for local registered accounts & demo accounts ─────
      const localUsers = getUserAccountRecords();
      const localUser = localUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail
      );

      if (localUser || trimmedEmail === 'master@tailorpro.com' || trimmedEmail === 'apprentice@tailorpro.com') {
        onSignInSuccess(trimmedEmail, selectedRole, trimmedPassword);
        return;
      }

      // ── 2. Online path: verify with Supabase Auth ──────────────────────────
      if (navigator.onLine) {
        const res = await signInSupabaseUser(trimmedEmail, trimmedPassword);

        if (res && res.success) {
          onSignInSuccess(trimmedEmail, selectedRole, trimmedPassword);
          return;
        }
      }

      // ── 3. Auto-register & proceed for new credentials ────────────────────
      onSignInSuccess(trimmedEmail, selectedRole, trimmedPassword);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              TailorPro Management System
            </p>
          </div>
        </div>

        {/* Form Block inside Enhanced Frosted Light Card */}
        <div className="rounded-[32px] p-4 xs:p-6 sm:p-8 space-y-5 border border-white/80 shadow-xl bg-white/85 backdrop-blur-md text-[#0D3B36]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>SIGN IN ROLE</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSelectedRole('Master (Studio Owner & Financial Control)')}
                  className={`py-2.5 px-2 xs:px-3 rounded-2xl font-black text-[11px] xs:text-xs transition-all border cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 leading-tight disabled:opacity-50 ${
                    selectedRole.startsWith('Master')
                      ? 'bg-[#0D3B36] text-amber-300 border-[#0D3B36] shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span className="truncate">👑 Master Owner</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSelectedRole('Apprentice (Trainee & CAD Blueprint View)')}
                  className={`py-2.5 px-2 xs:px-3 rounded-2xl font-black text-[11px] xs:text-xs transition-all border cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 leading-tight disabled:opacity-50 ${
                    selectedRole.startsWith('Apprentice')
                      ? 'bg-[#0D3B36] text-amber-300 border-[#0D3B36] shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span className="hidden xs:inline truncate">🎓 Apprentice Trainee</span>
                  <span className="xs:hidden">🎓 Apprentice</span>
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
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  placeholder={selectedRole.startsWith('Apprentice') ? "apprentice@tailorpro.com" : "master@tailorpro.com"}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 p-1 text-[#0D3B36]/50 hover:text-[#0D3B36] transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-xs font-semibold animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] disabled:bg-[#0D3B36]/60 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#0D3B36]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <span>Sign In to TailorPro →</span>
              )}
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

            {/* Install App on Device Button */}
            {onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#DCA134]/40 text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-[#0D3B36]" />
                <span>Install App on Android / iPhone 📱</span>
              </button>
            )}

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
        </div>

      </div>
    </div>
  );
};
