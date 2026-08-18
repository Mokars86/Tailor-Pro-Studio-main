import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, CheckCircle2, ArrowLeft, Sparkles, UserCheck, Building2, Mail, Lock, User, AlertCircle, QrCode } from 'lucide-react';
import { UserRole } from '../../types';
import { formatWorkshopCodeInput, validateWorkshopCode } from '../../utils/workshopCode';

interface RegisterStudioViewProps {
  onRegisterSuccess: (studioName: string, role: UserRole, email: string, licenseKey?: string, fullName?: string, masterWorkshopCode?: string, password?: string) => void;
  onGoToSignIn: () => void;
}

export const RegisterStudioView: React.FC<RegisterStudioViewProps> = ({
  onRegisterSuccess,
  onGoToSignIn
}) => {
  const [role, setRole] = useState<UserRole>('Master (Studio Owner & Financial Control)');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const [studioName, setStudioName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pin, setPin] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [masterWorkshopCode, setMasterWorkshopCode] = useState('');
  const [workshopCodeError, setWorkshopCodeError] = useState('');
  const [logoName, setLogoName] = useState<string | null>(null);

  const rolesList: UserRole[] = [
    'Master (Studio Owner & Financial Control)',
    'Head Designer (Lead Pattern Cutter & Stylist)',
    'Apprentice (Trainee & CAD Blueprint View)'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setWorkshopCodeError('');

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    if (role.startsWith('Apprentice') && masterWorkshopCode.trim().length > 0) {
      const validation = validateWorkshopCode(masterWorkshopCode);
      if (!validation.isValid) {
        setWorkshopCodeError(validation.error || 'Invalid Workshop Code format.');
        return;
      }
    }

    onRegisterSuccess(
      studioName || 'TAILOR PRO STUDIO',
      role,
      email,
      licenseKey,
      fullName,
      masterWorkshopCode,
      password
    );
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-[#EBF5F0] text-[#0D3B36] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 pt-[max(16px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))] font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden overflow-y-auto select-none custom-scrollbar touch-pan-y">
      
      {/* Soft Ambient Light Orbs (Clipping Container) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#0D3B36]/10 via-emerald-600/10 to-transparent blur-2xl -top-10 -right-10" />
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-emerald-600/10 via-emerald-200/20 to-transparent blur-2xl -bottom-10 -left-10" />
      </div>

      <div className="w-full max-w-md mx-auto space-y-5 relative z-10 py-4 sm:py-6">

        {/* Back Button */}
        <button
          onClick={onGoToSignIn}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0D3B36] hover:opacity-80 transition-all cursor-pointer bg-white/60 px-3.5 py-1.5 rounded-full border border-white/80 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        {/* Header Area */}
        <div className="text-center space-y-2">
          <div className="relative inline-block group">
            {/* Ambient Gold Glow Halo */}
            <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-r from-[#DCA134]/40 via-amber-300/30 to-[#DCA134]/40 blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />

            <div className="w-18 h-18 mx-auto rounded-[24px] bg-[#061E1B] border-4 border-[#DCA134] overflow-hidden shadow-xl relative">
              <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0D3B36] text-white border border-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            </div>
          </div>

          <div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#0D3B36] tracking-tight uppercase">
              Register Studio
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-[#4A6B63] tracking-wider uppercase mt-0.5">
              Create Bespoke Atelier Account
            </p>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-[32px] p-6 sm:p-8 space-y-4 border border-white/80 shadow-xl bg-white/85 backdrop-blur-md text-[#0D3B36]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* YOUR ROLE Picker Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>YOUR ROLE</span>
              </label>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-white/90 border border-slate-200 text-left text-xs sm:text-sm font-extrabold text-[#0D3B36] flex items-center justify-between shadow-2xs hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D3B36] transition-all cursor-pointer"
              >
                <span className="truncate">{role}</span>
                <ChevronDown className="w-4.5 h-4.5 text-[#0D3B36]/60 shrink-0 ml-1" />
              </button>
            </div>

            {/* MASTER WORKSHOP SYNC CODE */}
            {role.startsWith('Apprentice') && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-600/30 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36] flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#0D3B36]" />
                    <span>MASTER WORKSHOP SYNC CODE *</span>
                  </label>
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    REQUIRED
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={masterWorkshopCode}
                  onChange={(e) => {
                    setMasterWorkshopCode(formatWorkshopCodeInput(e.target.value));
                    setWorkshopCodeError('');
                  }}
                  placeholder="e.g. TP-MSS-8F92-2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-[#0D3B36] uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] shadow-xs"
                />
                <p className="text-[10px] text-slate-600 font-medium">
                  Enter your Master Trainer's Atelier Workshop Code (starts with <strong className="text-[#0D3B36] font-mono">TP-MSS-</strong>) to link your account.
                </p>
                {workshopCodeError && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{workshopCodeError}</span>
                  </div>
                )}
              </div>
            )}

            {/* STUDIO / BRAND NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>{role.startsWith('Apprentice') ? 'MASTER WORKSHOP NAME (OPTIONAL)' : 'STUDIO / BRAND NAME *'}</span>
              </label>
              <input
                type="text"
                required={!role.startsWith('Apprentice')}
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder={role.startsWith('Apprentice') ? 'e.g. MOKARS STITCHES STUDIO' : 'e.g. Atelier Stitches Studio'}
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-bold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* BRAND LOGO (IMAGE) */}
            {!role.startsWith('Apprentice') ? (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#0D3B36]" />
                  <span>BRAND LOGO (IMAGE)</span>
                </label>
                <label className="w-full p-3.5 rounded-2xl bg-white/90 border-2 border-dashed border-[#0D3B36]/25 text-center font-extrabold text-xs sm:text-sm text-[#0D3B36] cursor-pointer flex items-center justify-center gap-2 hover:bg-white transition-all shadow-2xs">
                  <Upload className="w-4 h-4 text-[#0D3B36]" />
                  <span>{logoName ? logoName : 'CHOOSE BRAND LOGO FILE'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span className="leading-tight">
                  Apprentices automatically inherit their Master Trainer's official brand logo, studio name & atelier credentials on their dashboard upon pairing.
                </span>
              </div>
            )}

            {/* YOUR FULL NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>YOUR FULL NAME *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Raeesa Mubarick"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* EMAIL ADDRESS */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>EMAIL ADDRESS *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="apprentice@domain.com"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* ACCOUNT PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>ACCOUNT PASSWORD *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password (min 6 chars)"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>CONFIRM PASSWORD *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter account password"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-semibold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* WORKSHOP SAFETY PIN (4-DIGITS) */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span>WORKSHOP SAFETY PIN (4-DIGITS) *</span>
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm sm:text-base font-bold text-[#0D3B36] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs tracking-widest transition-all"
              />
            </div>

            {/* ATELIER LICENSE KEY (OPTIONAL) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36]/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0D3B36]" />
                  <span>LICENSE KEY</span>
                </label>
                <span className="text-[10px] font-black text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                  OPTIONAL
                </span>
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="e.g. TPS-KEY-2026 (Optional)"
                className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 text-sm font-mono font-bold text-[#0D3B36] uppercase placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#0D3B36] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#0D3B36]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
            >
              {role.startsWith('Apprentice') ? 'Register Apprentice Account →' : 'Register Studio Account →'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onGoToSignIn}
              className="text-xs sm:text-sm font-bold text-[#0D3B36] hover:underline"
            >
              Already registered? <span className="underline font-black text-[#0D3B36]">Sign In Here</span>
            </button>
          </div>
        </div>

      </div>

      {/* Role Selector Popup Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl animate-fade-in border border-slate-200">
            <h3 className="text-sm font-extrabold text-[#0D3B36] uppercase tracking-wider border-b pb-2">
              Select Your Studio Role
            </h3>

            <div className="space-y-2">
              {rolesList.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setIsRoleModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-extrabold transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D3B36]/10 text-[#0D3B36] border-[#0D3B36]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{r}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#0D3B36] bg-[#0D3B36] text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors mt-2 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
