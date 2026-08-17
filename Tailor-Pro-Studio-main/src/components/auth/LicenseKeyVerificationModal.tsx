import React, { useState } from 'react';
import { Key, ShieldAlert, CheckCircle2, MessageCircle, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { verifyAndActivateUserLicense } from '../../services/licenseService';

interface LicenseKeyVerificationModalProps {
  userEmail: string;
  onActivated: () => void;
  onLogout: () => void;
}

export const LicenseKeyVerificationModal: React.FC<LicenseKeyVerificationModalProps> = ({
  userEmail,
  onActivated,
  onLogout
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = verifyAndActivateUserLicense(userEmail, licenseKeyInput);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onActivated();
      }, 1200);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0B2A27] rounded-[32px] p-6 sm:p-8 border border-white/80 dark:border-white/15 shadow-2xl space-y-6 text-[#0D3B36] dark:text-white text-center relative overflow-hidden">
        
        {/* Ambient Top Glow Halo (Emerald Theme) */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-600/15 via-[#0D3B36]/20 to-transparent blur-3xl pointer-events-none -top-16 -right-16" />

        {/* Icon & Header */}
        <div className="space-y-3 relative z-10">
          <div className="relative inline-block group">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#061E1B] border-2 border-[#0D3B36] overflow-hidden shadow-xl relative">
              <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0D3B36] text-white border border-white flex items-center justify-center shadow-md">
              <Key className="w-4 h-4 text-emerald-300" />
            </div>
          </div>

          <div>
            <h2 className="font-['Outfit'] text-2xl font-black tracking-tight text-[#0D3B36] dark:text-white uppercase">
              Enter License Key
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-[#4A6B63] dark:text-emerald-300/90 tracking-wider uppercase mt-1">
              Account Pending Admin Approval
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-600/30 text-left text-xs font-semibold text-[#0D3B36] dark:text-emerald-200 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Studio Activation Required</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            Logged in as <strong>{userEmail}</strong>. Enter your Tailor Pro License Key (e.g. <code className="bg-emerald-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono font-bold">TPS-KEY-2026</code>) to unlock your workspace.
          </p>
        </div>

        {/* Form Block */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#0D3B36]" />
              <span>ATELIER LICENSE KEY</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="e.g. TPS-KEY-2026"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-sm font-mono font-bold tracking-wider text-[#0D3B36] dark:text-white uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-extrabold text-left flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold text-left flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-black text-sm tracking-wide shadow-lg shadow-[#0D3B36]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Activate Workspace</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </button>
        </form>

        {/* WhatsApp Admin Request Link & Logout */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10 relative z-10">
          <a
            href="https://chat.whatsapp.com/B9WTaQnwjel9Nka8NX8bMd"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-2xl bg-[#21C063] hover:bg-[#1ca856] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#21C063]" />
            <span>Join Tailor Pro WhatsApp Support Group 💬</span>
          </a>

          <a
            href="https://wa.me/233546920418?text=Hello%20Admin,%20I%20registered%20my%20Tailor%20Pro%20Studio%20account%20and%20need%20my%20License%20Key."
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Message Admin Directly for Key</span>
          </a>

          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer pt-1"
          >
            Sign Out / Switch Account
          </button>
        </div>

      </div>
    </div>
  );
};
