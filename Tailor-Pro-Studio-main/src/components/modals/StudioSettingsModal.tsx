import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, QrCode, Copy, Printer, LogOut, Check, Upload, ShieldCheck, Download, Cloud, UserX, UserCircle2, Share2, Clipboard, ClipboardCheck, FileText, CreditCard, BadgeCheck } from 'lucide-react';
import { StudioSettings, Apprentice } from '../../types';
import { generateMasterWorkshopCode } from '../../utils/workshopCode';
import { exportAtelierDataBackup, restoreAtelierDataBackup, restoreAtelierDataFromText, copyBackupToClipboard, clearAllAtelierData } from '../../utils/dataBackup';
import { TailorProMembershipCardModal } from './TailorProMembershipCardModal';

interface StudioSettingsModalProps {
  settings: StudioSettings;
  onSave: (updatedSettings: StudioSettings) => void;
  onLogout: () => void;
  onClose: () => void;
  apprentices?: Apprentice[];
  onUnlinkApprentice?: (apprenticeId: string) => void;
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
  onOpenMembershipCard?: () => void;
  userRole?: string;
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  settings,
  onSave,
  onLogout,
  onClose,
  apprentices = [],
  onUnlinkApprentice,
  onToggleTheme,
  onOpenMembershipCard,
  userRole
}) => {
  const [showMembershipCardModal, setShowMembershipCardModal] = useState<boolean>(false);
  const [form, setForm] = useState<StudioSettings>(() => ({
    studioName: settings?.studioName || 'MOKARS STITCHES STUDIO',
    ownerName: settings?.ownerName || 'Mubarik Tuahir Ali',
    email: settings?.email || '',
    logoUrl: settings?.logoUrl || '',
    pairCode: settings?.pairCode || generateMasterWorkshopCode(settings?.studioName),
    momoNumber: settings?.momoNumber || '',
    momoHolderName: settings?.momoHolderName || '',
    safetyPin: settings?.safetyPin || '8888',
    theme: settings?.theme || 'light',
    ...settings
  }));

  useEffect(() => {
    if (settings?.theme && settings.theme !== form.theme) {
      setForm((prev) => ({ ...prev, theme: settings.theme }));
    }
  }, [settings?.theme]);

  const [copiedKey, setCopiedKey] = useState(false);
  const [printedNotice, setPrintedNotice] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [showPasteRestore, setShowPasteRestore] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [copiedBackupCode, setCopiedBackupCode] = useState(false);

  const handleCopyKey = () => {
    if (form?.pairCode && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(form.pairCode).catch(() => {});
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 font-['Outfit'] select-none overflow-y-auto">
      <div className="w-full max-w-xl glass-card bg-white/95 dark:bg-[#092825]/95 rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-white dark:border-white/10 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4 pr-1">
          <div>
            <h2 className="font-bold text-lg sm:text-xl text-[#0D3B36] dark:text-[#DCA134] leading-tight">
              Studio Brand Settings
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
              Configure atelier branding, logo uploads, MoMo accounts & workshop keys
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-xs">
          
          {/* App Theme Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
              APP THEME
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, theme: 'light' }));
                  if (onToggleTheme) onToggleTheme('light');
                }}
                className={`p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all cursor-pointer ${
                  form.theme === 'light'
                    ? 'bg-[#0D3B36]/10 dark:bg-amber-400/20 text-[#0D3B36] dark:text-amber-300 border-[#DCA134] border-2 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-[#DCA134]" />
                <span>Light (Day)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, theme: 'dark' }));
                  if (onToggleTheme) onToggleTheme('dark');
                }}
                className={`p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all cursor-pointer ${
                  form.theme === 'dark'
                    ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] border-[#DCA134] border-2 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-300 dark:text-[#0D3B36]" />
                <span>Dark (Night)</span>
              </button>
            </div>
          </div>

          {/* Studio Name & Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
                STUDIO / BRAND NAME
              </label>
              <input
                type="text"
                value={form.studioName}
                onChange={(e) => setForm({ ...form, studioName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-xs text-[#0D3B36] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
                MASTER TRAINER / OWNER NAME
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>
          </div>

          {/* Studio Brand Logo Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36] dark:text-amber-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#DCA134]" />
                <span>MASTER BRAND LOGO UPLOAD</span>
              </label>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase">
                Applies to Header & Certificates
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Logo Preview Container */}
              <div className="w-16 h-16 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md flex items-center justify-center shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Master Brand Logo" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-8 h-8 text-[#DCA134]" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Upload your custom brand logo. It will immediately take effect on your Top Header, Master Certificate, Apprentice Certificate, and Shop Display Poster.
                </p>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-1.5 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Brand Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tailor Pro Membership & Workshop ID Card Block */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0D3B36]/10 via-amber-500/10 to-[#0D3B36]/10 border-2 border-[#DCA134] dark:border-[#DCA134]/80 space-y-2.5 sm:space-y-3 shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#DCA134] shrink-0" />
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0D3B36] dark:text-amber-300 leading-snug break-words">
                  TAILOR PRO MEMBERSHIP & WORKSHOP ID CARD
                </h3>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-[#0D3B36] bg-[#DCA134] px-2.5 py-0.5 rounded-full uppercase shadow-2xs shrink-0">
                Official Badge
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              Design, customize, and print official vertical <strong>Tailor Pro Workshop Training & Membership ID Badges</strong> featuring dual sponsor logos, participant photo, unique ID, event date, and venue details.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowMembershipCardModal(true);
                if (onOpenMembershipCard) onOpenMembershipCard();
              }}
              className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#061E1B] dark:hover:bg-amber-300 text-white dark:text-[#061E1B] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#DCA134] shadow-md transition-all active:scale-[0.99] cursor-pointer text-center"
            >
              <BadgeCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#DCA134] dark:text-[#061E1B] shrink-0" />
              <span className="truncate">Generate & Customize Membership Card</span>
            </button>
          </div>

          {/* Apprentice Workshop Key & QR Code Block */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-300/60 dark:border-amber-400/30 space-y-3">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5">
              <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#0D3B36] dark:text-amber-300 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#DCA134] shrink-0" />
                <span>APPRENTICE WORKSHOP KEY & QR</span>
              </label>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 shrink-0">
                ● Active Pair Key
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Unique Studio Workshop Key
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pairCode: generateMasterWorkshopCode(form.studioName) })}
                  className="text-[10px] font-bold text-[#DCA134] hover:underline cursor-pointer"
                >
                  ⚡ Auto-Generate New Key
                </button>
              </div>
              <input
                type="text"
                value={form.pairCode}
                onChange={(e) => setForm({ ...form, pairCode: e.target.value.toUpperCase() })}
                placeholder="e.g. TP-MSS-7K92-2026"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>

            <div className="flex flex-col xs:flex-row items-center xs:items-start gap-3 pt-1 text-center xs:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1.5 border border-slate-300 dark:border-slate-700 shrink-0 shadow-sm flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#0D3B36] fill-current">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="30" height="30" fill="#0D3B36" />
                  <rect x="10" y="10" width="20" height="20" fill="white" />
                  <rect x="15" y="15" width="10" height="10" fill="#0D3B36" />
                  <rect x="65" y="5" width="30" height="30" fill="#0D3B36" />
                  <rect x="70" y="10" width="20" height="20" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="#0D3B36" />
                  <rect x="5" y="65" width="30" height="30" fill="#0D3B36" />
                  <rect x="10" y="70" width="20" height="20" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="#0D3B36" />
                  <rect x="42" y="10" width="6" height="6" fill="#DCA134" />
                  <rect x="52" y="10" width="6" height="6" fill="#0D3B36" />
                  <rect x="42" y="22" width="6" height="6" fill="#0D3B36" />
                  <rect x="52" y="22" width="6" height="6" fill="#DCA134" />
                  <rect x="10" y="42" width="6" height="6" fill="#0D3B36" />
                  <rect x="22" y="42" width="6" height="6" fill="#DCA134" />
                  <rect x="34" y="42" width="6" height="6" fill="#0D3B36" />
                  <rect x="46" y="42" width="6" height="6" fill="#0D3B36" />
                  <rect x="58" y="42" width="6" height="6" fill="#DCA134" />
                  <rect x="70" y="42" width="6" height="6" fill="#0D3B36" />
                  <rect x="82" y="42" width="6" height="6" fill="#0D3B36" />
                  <rect x="42" y="54" width="6" height="6" fill="#DCA134" />
                  <rect x="54" y="54" width="6" height="6" fill="#0D3B36" />
                  <rect x="66" y="54" width="6" height="6" fill="#DCA134" />
                  <rect x="42" y="66" width="6" height="6" fill="#0D3B36" />
                  <rect x="54" y="66" width="6" height="6" fill="#DCA134" />
                  <rect x="66" y="66" width="6" height="6" fill="#0D3B36" />
                  <rect x="78" y="66" width="6" height="6" fill="#0D3B36" />
                  <rect x="42" y="78" width="6" height="6" fill="#DCA134" />
                  <rect x="54" y="78" width="6" height="6" fill="#0D3B36" />
                  <rect x="66" y="78" width="6" height="6" fill="#0D3B36" />
                  <rect x="78" y="78" width="6" height="6" fill="#DCA134" />
                </svg>
              </div>

              <div className="space-y-1.5 flex-1 w-full">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
                  Apprentices scan this QR code or enter your Key during onboarding to pair with your studio curriculum.
                </p>
                <div className="flex flex-wrap items-center justify-center xs:justify-start gap-2">
                  <span className="font-mono font-black text-xs text-[#0D3B36] dark:text-amber-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                    {form.pairCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const printWindow = window.open('', '_blank', 'width=800,height=1000');
                if (printWindow) {
                  const workshopCodeStr = form.pairCode || generateMasterWorkshopCode(form.studioName);
                  const studioNameStr = form.studioName || 'MOKARS STITCHES STUDIO';
                  const ownerNameStr = form.ownerName || 'Kausar Mohammed';
                  const tailorProLogoUrl = `${window.location.origin}/tailor_pro_logo.jpg`;

                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8" />
                      <base href="${window.location.origin}/" />
                      <title>${studioNameStr} — Master Atelier Workshop Poster</title>
                      <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@400;600;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
                        
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        
                        body {
                          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
                          background: #041D1A;
                          color: #0F2D2A;
                          padding: 40px 20px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                        }
                        
                        .poster-frame {
                          background: #FFFFFF;
                          width: 100%;
                          max-width: 620px;
                          border-radius: 36px;
                          padding: 42px 36px;
                          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
                          border: 6px solid #DCA134;
                          position: relative;
                          overflow: hidden;
                          text-align: center;
                        }
                        
                        /* Background Watermark & Ornaments */
                        .poster-frame::before {
                          content: '';
                          position: absolute;
                          top: -50px;
                          right: -50px;
                          width: 200px;
                          height: 200px;
                          background: radial-gradient(circle, rgba(220,161,52,0.12) 0%, transparent 70%);
                          border-radius: 50%;
                          pointer-events: none;
                        }
                        
                        .top-seal {
                          display: inline-flex;
                          align-items: center;
                          gap: 6px;
                          background: linear-gradient(135deg, #0D3B36 0%, #061E1B 100%);
                          color: #DCA134;
                          font-size: 10px;
                          font-weight: 900;
                          letter-spacing: 2.5px;
                          text-transform: uppercase;
                          padding: 6px 18px;
                          border-radius: 999px;
                          border: 1px solid rgba(220,161,52,0.5);
                          margin-bottom: 24px;
                          box-shadow: 0 4px 12px rgba(13,59,54,0.15);
                        }

                        .header-logos {
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          gap: 16px;
                          padding-bottom: 22px;
                          border-bottom: 2px solid #F1F5F9;
                          margin-bottom: 24px;
                        }

                        .logo-box {
                          width: 68px;
                          height: 68px;
                          border-radius: 20px;
                          background: #061E1B;
                          border: 2.5px solid #DCA134;
                          overflow: hidden;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          box-shadow: 0 6px 14px rgba(0,0,0,0.1);
                          position: relative;
                        }
                        .logo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

                        .monogram-box {
                          width: 68px;
                          height: 68px;
                          border-radius: 20px;
                          background: #FCFAF6;
                          border: 2.5px solid #DCA134;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                        }

                        .atelier-info {
                          flex: 1;
                          text-align: center;
                        }

                        .atelier-title {
                          font-family: 'Outfit', sans-serif;
                          font-size: 20px;
                          font-weight: 900;
                          color: #0D3B36;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          line-height: 1.2;
                        }

                        .atelier-sub {
                          font-size: 10px;
                          font-weight: 800;
                          color: #DCA134;
                          letter-spacing: 1.8px;
                          text-transform: uppercase;
                          margin-top: 3px;
                        }

                        .main-heading {
                          font-family: 'Cinzel', serif;
                          font-size: 26px;
                          font-weight: 900;
                          color: #0D3B36;
                          letter-spacing: 1px;
                          text-transform: uppercase;
                          margin-bottom: 4px;
                        }

                        .sub-heading {
                          font-size: 12px;
                          font-weight: 800;
                          color: #C98A2B;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                          margin-bottom: 18px;
                        }

                        .instructions-box {
                          background: #F8FAF9;
                          border: 1px solid #E2E8F0;
                          border-radius: 20px;
                          padding: 12px 16px;
                          margin-bottom: 22px;
                          font-size: 12.5px;
                          font-weight: 600;
                          color: #475569;
                          line-height: 1.5;
                        }
                        .instructions-box strong { color: #0D3B36; font-weight: 800; }

                        /* QR Frame Card */
                        .qr-card {
                          background: linear-gradient(180deg, #FCFAF6 0%, #F5EFE4 100%);
                          border: 3px solid #DCA134;
                          border-radius: 32px;
                          padding: 24px;
                          display: inline-block;
                          margin-bottom: 20px;
                          box-shadow: 0 12px 28px rgba(13,59,54,0.08);
                          position: relative;
                        }

                        .qr-card svg {
                          display: block;
                          margin: 0 auto;
                        }

                        .pair-code-section {
                          margin-bottom: 20px;
                        }

                        .pair-code-label {
                          font-size: 10px;
                          font-weight: 900;
                          color: #64748B;
                          text-transform: uppercase;
                          letter-spacing: 2px;
                          margin-bottom: 6px;
                        }

                        .pair-code-badge {
                          font-family: 'JetBrains Mono', monospace;
                          font-size: 30px;
                          font-weight: 800;
                          letter-spacing: 3.5px;
                          color: #0D3B36;
                          background: #EBF5F0;
                          padding: 12px 28px;
                          border-radius: 20px;
                          border: 3px dashed #0D3B36;
                          display: inline-block;
                          box-shadow: inset 0 2px 4px rgba(0,0,0,0.04);
                        }

                        .trainer-card {
                          background: #F1F5F9;
                          border-radius: 16px;
                          padding: 10px 20px;
                          display: inline-flex;
                          align-items: center;
                          gap: 8px;
                          font-size: 13px;
                          font-weight: 700;
                          color: #334155;
                          margin-bottom: 20px;
                        }
                        .trainer-card strong { color: #0D3B36; font-weight: 900; }

                        .poster-footer {
                          font-size: 10.5px;
                          font-weight: 800;
                          color: #94A3B8;
                          text-transform: uppercase;
                          letter-spacing: 2px;
                          border-top: 1px solid #E2E8F0;
                          padding-top: 16px;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                        }

                        .top-preview-bar {
                          position: fixed;
                          top: 0;
                          left: 0;
                          right: 0;
                          z-index: 9999;
                          background: rgba(4, 29, 26, 0.95);
                          backdrop-filter: blur(12px);
                          border-bottom: 2px solid #DCA134;
                          padding: 10px 20px;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                        }
                        .bar-title {
                          color: #DCA134;
                          font-weight: 900;
                          font-size: 12px;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                        }
                        .bar-actions {
                          display: flex;
                          align-items: center;
                          gap: 10px;
                        }
                        .btn-print {
                          background: #DCA134;
                          color: #041D1A;
                          font-weight: 900;
                          font-size: 11px;
                          padding: 8px 18px;
                          border-radius: 99px;
                          border: none;
                          cursor: pointer;
                          box-shadow: 0 4px 12px rgba(220,161,52,0.3);
                          transition: all 0.2s;
                        }
                        .btn-print:hover { background: #e5ab3e; }
                        .btn-close {
                          background: rgba(255,255,255,0.15);
                          color: #FFFFFF;
                          font-weight: 800;
                          font-size: 11px;
                          padding: 8px 16px;
                          border-radius: 99px;
                          border: 1px solid rgba(255,255,255,0.3);
                          cursor: pointer;
                          transition: all 0.2s;
                        }
                        .btn-close:hover { background: rgba(255,255,255,0.25); }

                        @media print {
                          .no-print { display: none !important; }
                          body { background: #FFFFFF !important; padding: 0 !important; }
                          .poster-frame {
                            border: 4px solid #0D3B36 !important;
                            box-shadow: none !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            border-radius: 0 !important;
                            padding: 30px 25px !important;
                            margin-top: 0 !important;
                          }
                        }
                      </style>
                    </head>
                    <body>
                      <!-- Sticky Top Preview & Action Navigation Bar -->
                      <div class="top-preview-bar no-print">
                        <div class="bar-title">
                          <span style="color:#DCA134;">★</span>
                          <span>ATELIER SHOP DISPLAY POSTER PREVIEW</span>
                        </div>
                        <div class="bar-actions">
                          <button onclick="window.print()" class="btn-print">🖨️ Print / Save PDF</button>
                          <button onclick="window.close()" class="btn-close">✕ Close / Back</button>
                        </div>
                      </div>

                      <div class="poster-frame" style="margin-top: 50px;">
                        <div class="top-seal">
                          <span>★ ★ ★</span>
                          <span>OFFICIAL ATELIER WORKSHOP DISPLAY</span>
                          <span>★ ★ ★</span>
                        </div>

                        <div class="header-logos">
                          ${form.logoUrl ? `
                            <div class="logo-box">
                              <img src="${form.logoUrl}" alt="Master Brand Logo" />
                            </div>
                          ` : `
                            <div class="monogram-box">
                              <span style="font-size:24px; font-weight:900; color:#DCA134; line-height:1;">M</span>
                              <span style="font-size:7px; font-weight:900; color:#0D3B36; margin-top:2px;">MOKARS</span>
                            </div>
                          `}
                          
                          <div class="atelier-info">
                            <div class="atelier-title">${studioNameStr}</div>
                            <div class="atelier-sub">AUTHENTICATED BESPOKE TAILORING ATELIER</div>
                          </div>

                          <div class="logo-box">
                            <img src="${tailorProLogoUrl}" alt="Tailor Pro Logo" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div style="display:none; width:100%; height:100%; background:#0D3B36; color:#DCA134; align-items:center; justify-content:center; font-weight:900; font-size:16px;">TP</div>
                          </div>
                        </div>

                        <div class="main-heading">APPRENTICE ONBOARDING</div>
                        <div class="sub-heading">WORKSHOP SYNC & PAIRING POSTER</div>

                        <div class="instructions-box">
                          Apprentices: Open your <strong>Tailor Pro Apprentice App</strong>, tap <strong>"Sync Workshop"</strong>, and scan the QR code below or enter your Workshop Key:
                        </div>
                        
                        <div class="qr-card">
                          <svg width="240" height="240" viewBox="0 0 100 100" fill="#0D3B36">
                            <rect width="100" height="100" fill="white"/>
                            <rect x="5" y="5" width="30" height="30" fill="#0D3B36"/>
                            <rect x="10" y="10" width="20" height="20" fill="white"/>
                            <rect x="15" y="15" width="10" height="10" fill="#0D3B36"/>
                            <rect x="65" y="5" width="30" height="30" fill="#0D3B36"/>
                            <rect x="70" y="10" width="20" height="20" fill="white"/>
                            <rect x="75" y="15" width="10" height="10" fill="#0D3B36"/>
                            <rect x="5" y="65" width="30" height="30" fill="#0D3B36"/>
                            <rect x="10" y="70" width="20" height="20" fill="white"/>
                            <rect x="15" y="75" width="10" height="10" fill="#0D3B36"/>
                            <rect x="42" y="10" width="6" height="6" fill="#DCA134"/>
                            <rect x="52" y="10" width="6" height="6" fill="#0D3B36"/>
                            <rect x="42" y="22" width="6" height="6" fill="#0D3B36"/>
                            <rect x="52" y="22" width="6" height="6" fill="#DCA134"/>
                            <rect x="10" y="42" width="6" height="6" fill="#0D3B36"/>
                            <rect x="22" y="42" width="6" height="6" fill="#DCA134"/>
                            <rect x="34" y="42" width="6" height="6" fill="#0D3B36"/>
                            <rect x="46" y="42" width="6" height="6" fill="#0D3B36"/>
                            <rect x="58" y="42" width="6" height="6" fill="#DCA134"/>
                            <rect x="70" y="42" width="6" height="6" fill="#0D3B36"/>
                            <rect x="82" y="42" width="6" height="6" fill="#0D3B36"/>
                            <rect x="42" y="54" width="6" height="6" fill="#DCA134"/>
                            <rect x="54" y="54" width="6" height="6" fill="#0D3B36"/>
                            <rect x="66" y="54" width="6" height="6" fill="#DCA134"/>
                            <rect x="42" y="66" width="6" height="6" fill="#0D3B36"/>
                            <rect x="54" y="66" width="6" height="6" fill="#DCA134"/>
                            <rect x="66" y="66" width="6" height="6" fill="#0D3B36"/>
                            <rect x="78" y="66" width="6" height="6" fill="#0D3B36"/>
                            <rect x="42" y="78" width="6" height="6" fill="#DCA134"/>
                            <rect x="54" y="78" width="6" height="6" fill="#0D3B36"/>
                            <rect x="66" y="78" width="6" height="6" fill="#0D3B36"/>
                            <rect x="78" y="78" width="6" height="6" fill="#DCA134"/>
                          </svg>
                        </div>

                        <div class="pair-code-section">
                          <div class="pair-code-label">MASTER WORKSHOP KEY</div>
                          <div class="pair-code-badge">${workshopCodeStr}</div>
                        </div>

                        <div class="trainer-card">
                          <span>Master Trainer / Owner:</span>
                          <strong>${ownerNameStr}</strong>
                        </div>

                        <div class="poster-footer">
                          <span>TAILOR PRO ATELIER PLATFORM</span>
                          <span>POWERED BY BESPOKE ENGINE</span>
                        </div>
                      </div>

                      <script>
                        function startPrint() {
                          setTimeout(function() {
                            window.print();
                          }, 350);
                        }
                        if (document.readyState === 'complete') {
                          startPrint();
                        } else {
                          window.addEventListener('load', startPrint);
                        }
                      </script>
                    </body>
                    </html>
                  `);
                  printWindow.document.close();
                }
                setPrintedNotice(true);
                setTimeout(() => setPrintedNotice(false), 3000);
              }}
              className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-amber-500/20 dark:bg-amber-400/20 text-[#0D3B36] dark:text-amber-300 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-2 border border-amber-400/40 shadow-2xs hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#DCA134]" />
              <span>Print / Download Shop Display Poster (Dual Logos & QR)</span>
            </button>

            {printedNotice && (
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold text-center">
                ✓ Poster print window generated!
              </p>
            )}
          </div>

          {/* MoMo Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
                DESIGNER MOBILE MONEY (MOMO) NUMBER
              </label>
              <input
                type="text"
                value={form.momoNumber || ''}
                onChange={(e) => setForm({ ...form, momoNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-xs text-[#0D3B36] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
                MOMO ACCOUNT HOLDER NAME
              </label>
              <input
                type="text"
                value={form.momoHolderName || ''}
                onChange={(e) => setForm({ ...form, momoHolderName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>
          </div>

          {/* Safety PIN */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D3B36]/70 dark:text-amber-300/80">
              WORKSHOP SAFETY PIN (4-DIGITS)
            </label>
            <input
              type="password"
              maxLength={4}
              value={form.safetyPin || ''}
              onChange={(e) => setForm({ ...form, safetyPin: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-xs text-[#0D3B36] dark:text-slate-100 tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
            />
          </div>

          {/* Phone Loss Protection & Cloud Data Backup Section */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-400/40 space-y-3 font-['Outfit']">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36] dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                <span>PHONE LOSS PROTECTION & CLOUD BACKUP</span>
              </label>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full uppercase border border-emerald-300 dark:border-emerald-700 shrink-0">
                ● Cloud Sync Active ✓
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              <strong>Never lose your customer details:</strong> All client records, garment measurements, ledger transactions, inventory items, and workshop settings are continuously saved to your encrypted cloud database.
              If you lose or change your phone, simply log into your account on your new phone to <strong>restore 100% of your customer information automatically!</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  const res = await exportAtelierDataBackup('share');
                  if (res.success) {
                    setBackupNotice(res.message);
                    setTimeout(() => setBackupNotice(null), 6000);
                  } else {
                    setBackupNotice(res.message || 'Could not export backup file.');
                    setTimeout(() => setBackupNotice(null), 5000);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>Save to WhatsApp / Drive</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const res = await exportAtelierDataBackup('download');
                  if (res.success) {
                    setBackupNotice(res.message);
                    setTimeout(() => setBackupNotice(null), 6000);
                  } else {
                    setBackupNotice(res.message || 'Could not export backup file.');
                    setTimeout(() => setBackupNotice(null), 5000);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#0D3B36] dark:bg-emerald-500 hover:bg-[#082824] dark:hover:bg-emerald-600 text-white dark:text-[#061E1B] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Data Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = await copyBackupToClipboard();
                  if (ok) {
                    setCopiedBackupCode(true);
                    setBackupNotice('Full Customer Data Backup JSON code copied to clipboard!');
                    setTimeout(() => setCopiedBackupCode(false), 3000);
                    setTimeout(() => setBackupNotice(null), 5000);
                  } else {
                    setBackupNotice('Failed to copy to clipboard.');
                    setTimeout(() => setBackupNotice(null), 3000);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer sm:col-span-2"
              >
                {copiedBackupCode ? (
                  <ClipboardCheck className="w-4 h-4 text-emerald-200" />
                ) : (
                  <Clipboard className="w-4 h-4 text-amber-200" />
                )}
                <span>{copiedBackupCode ? 'Backup Code Copied! ✓' : 'Copy Backup JSON to Phone Clipboard'}</span>
              </button>

              <label className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0D3B36] dark:text-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4 text-[#DCA134]" />
                <span>Restore Backup File</span>
                <input
                  type="file"
                  accept="application/json,.json,text/plain,*/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const ok = await restoreAtelierDataBackup(e.target.files[0]);
                      if (ok) {
                        setBackupNotice('Data restored successfully from backup file! Reloading app...');
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        setBackupNotice('Invalid backup file format. Please select a valid JSON backup file.');
                        setTimeout(() => setBackupNotice(null), 3500);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowPasteRestore(!showPasteRestore)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0D3B36] dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer text-center"
              >
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{showPasteRestore ? 'Hide Text Restore' : 'Paste Backup Code to Restore'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all mock & local data to start completely afresh? This will remove stored clients, inventory, transactions, and apprentices.')) {
                    clearAllAtelierData();
                    setBackupNotice('All local & mock data cleared! Reloading app...');
                    setTimeout(() => window.location.reload(), 1200);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-300 dark:border-rose-800 shadow-xs transition-all cursor-pointer text-center sm:col-span-2"
              >
                <UserX className="w-4 h-4 text-rose-500" />
                <span>Start Afresh (Clear All Local Data)</span>
              </button>
            </div>

            {showPasteRestore && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-400/60 space-y-2.5 animate-fade-in">
                <label className="text-[11px] font-black uppercase text-[#0D3B36] dark:text-emerald-300 block">
                  Paste JSON Backup Code Below:
                </label>
                <textarea
                  rows={4}
                  value={pastedJsonText}
                  onChange={(e) => setPastedJsonText(e.target.value)}
                  placeholder='Paste full JSON backup code here (e.g. {"app": "Tailor Pro Studio", ...})'
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!pastedJsonText.trim()) {
                      setBackupNotice('Please paste your backup JSON code first.');
                      setTimeout(() => setBackupNotice(null), 3000);
                      return;
                    }
                    const ok = restoreAtelierDataFromText(pastedJsonText);
                    if (ok) {
                      setBackupNotice('Data successfully restored from pasted JSON code! Reloading app...');
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      setBackupNotice('Invalid JSON backup code. Please verify the code and try again.');
                      setTimeout(() => setBackupNotice(null), 4000);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Restore Data from Text Now</span>
                </button>
              </div>
            )}

            {backupNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center animate-fade-in border border-emerald-300 dark:border-emerald-700">
                {backupNotice}
              </div>
            )}
          </div>

          {/* System Actions & Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-700 dark:text-rose-300" />
              <span>Logout Studio</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>

        </form>

      </div>

      {showMembershipCardModal && (
        <TailorProMembershipCardModal
          isOpen={showMembershipCardModal}
          onClose={() => setShowMembershipCardModal(false)}
          studioSettings={settings}
          userRole={userRole}
        />
      )}
    </div>
  );
};
