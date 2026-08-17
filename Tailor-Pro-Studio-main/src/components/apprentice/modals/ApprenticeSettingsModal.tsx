import React, { useState } from 'react';
import { X, Sun, Moon, RefreshCw, LogOut, Shield, QrCode, CheckCircle2, AlertCircle, Sparkles, Download, Upload, ShieldCheck, Share2, Clipboard, ClipboardCheck, FileText } from 'lucide-react';
import { formatWorkshopCodeInput, validateWorkshopCode } from '../../../utils/workshopCode';
import { exportAtelierDataBackup, restoreAtelierDataBackup, restoreAtelierDataFromText, copyBackupToClipboard } from '../../../utils/dataBackup';

interface ApprenticeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (newTheme: 'light' | 'dark') => void;
  masterName?: string;
  studioName?: string;
  currentWorkshopCode?: string;
  onSyncNewWorkshopCode?: (newCode: string) => void;
  onSwitchRoleToMaster?: () => void;
  onLogout: () => void;
}

export const ApprenticeSettingsModal: React.FC<ApprenticeSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  masterName = 'Kausar Mohammed',
  studioName = 'MOKARS STITCHES STUDIO',
  currentWorkshopCode,
  onSyncNewWorkshopCode,
  onSwitchRoleToMaster,
  onLogout
}) => {
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [newWorkshopCode, setNewWorkshopCode] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [showPasteRestore, setShowPasteRestore] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [copiedBackupCode, setCopiedBackupCode] = useState(false);

  if (!isOpen) return null;

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');

    const validation = validateWorkshopCode(newWorkshopCode);
    if (!validation.isValid) {
      setTransferError(validation.error || 'Invalid Workshop Code format.');
      return;
    }

    if (onSyncNewWorkshopCode) {
      onSyncNewWorkshopCode(validation.normalizedCode);
    }
    setTransferSuccess(`Successfully synced to Master Workshop Code: ${validation.normalizedCode}!`);
    setTimeout(() => {
      setShowTransferInput(false);
      setTransferSuccess('');
      setNewWorkshopCode('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[32px] p-6 space-y-5 shadow-2xl border border-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#DCA134] font-black text-lg">⚙</span>
            <h2 className="font-['Outfit'] font-black text-lg text-[#0D3B36] tracking-tight uppercase">
              APPRENTICE SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            APP APPEARANCE & THEME MODE
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onToggleTheme('light')}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all border ${
                theme === 'light'
                  ? 'bg-amber-500/10 border-[#DCA134] text-[#0D3B36] shadow-2xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light (Day)</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleTheme('dark')}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all border ${
                theme === 'dark'
                  ? 'bg-[#0D3B36] text-white border-[#0D3B36] shadow-2xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Moon className="w-4 h-4 text-[#DCA134]" />
              <span>Dark (Night)</span>
            </button>
          </div>
        </div>

        {/* Current Master Connection Card */}
        <div className="p-4 rounded-2xl bg-[#EAF8F2] border border-emerald-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#DCA134] block">
              CURRENT MASTER CONNECTION
            </span>
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full font-mono">
              ● SYNC ACTIVE
            </span>
          </div>
          <h3 className="font-['Outfit'] font-extrabold text-base text-[#0D3B36] uppercase">
            {studioName}
          </h3>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-0.5">
            <span>Trainer: <strong className="text-[#0D3B36]">{masterName}</strong></span>
            {currentWorkshopCode && (
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 text-[#0D3B36]">
                {currentWorkshopCode}
              </span>
            )}
          </div>
        </div>

        {/* Phone Loss Protection & Device Data Backup */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B36] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DATA BACKUP & LOSS PROTECTION</span>
            </label>
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              Drive & WhatsApp Ready
            </span>
          </div>

          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
            Store your full customer & mentorship backup safely on <strong>Google Drive</strong>, <strong>WhatsApp</strong>, or local device storage to restore 100% of your data anytime!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={async () => {
                const res = await exportAtelierDataBackup('whatsapp');
                if (res.success) {
                  setBackupNotice(res.message);
                  setTimeout(() => setBackupNotice(null), 6000);
                } else {
                  setBackupNotice(res.message || 'Could not export backup.');
                  setTimeout(() => setBackupNotice(null), 5000);
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const res = await exportAtelierDataBackup('drive');
                if (res.success) {
                  setBackupNotice(res.message);
                  setTimeout(() => setBackupNotice(null), 6000);
                } else {
                  setBackupNotice(res.message || 'Could not export backup.');
                  setTimeout(() => setBackupNotice(null), 5000);
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Save to Google Drive</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const res = await exportAtelierDataBackup('download');
                if (res.success) {
                  setBackupNotice(res.message);
                  setTimeout(() => setBackupNotice(null), 5000);
                } else {
                  setBackupNotice(res.message || 'Could not export backup.');
                  setTimeout(() => setBackupNotice(null), 5000);
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#DCA134]" />
              <span>Download Backup (.json)</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const ok = await copyBackupToClipboard();
                if (ok) {
                  setCopiedBackupCode(true);
                  setBackupNotice('Backup JSON copied to phone clipboard!');
                  setTimeout(() => setCopiedBackupCode(false), 3000);
                  setTimeout(() => setBackupNotice(null), 5000);
                } else {
                  setBackupNotice('Failed to copy to clipboard.');
                  setTimeout(() => setBackupNotice(null), 3000);
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              {copiedBackupCode ? (
                <ClipboardCheck className="w-4 h-4 text-emerald-200" />
              ) : (
                <Clipboard className="w-4 h-4 text-amber-200" />
              )}
              <span>{copiedBackupCode ? 'Copied! ✓' : 'Copy Backup to Clipboard'}</span>
            </button>

            <label className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer text-center">
              <Upload className="w-4 h-4 text-[#DCA134]" />
              <span>Restore Backup File</span>
              <input
                type="file"
                accept="application/json,.json,text/plain,*/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const ok = await restoreAtelierDataBackup(e.target.files[0]);
                    if (ok) {
                      setBackupNotice('Data restored successfully! Reloading app...');
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      setBackupNotice('Invalid backup file format. Please try again.');
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
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer text-center"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{showPasteRestore ? 'Hide Text Restore' : 'Paste Code to Restore'}</span>
            </button>
          </div>

          {showPasteRestore && (
            <div className="p-3.5 rounded-xl bg-white border border-emerald-400/60 space-y-2 animate-fade-in">
              <label className="text-[11px] font-black uppercase text-[#0D3B36] block">
                Paste JSON Backup Code Below:
              </label>
              <textarea
                rows={4}
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='Paste full JSON backup code here (e.g. {"app": "Tailor Pro Studio", ...})'
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 font-mono text-[10px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    setBackupNotice('Invalid JSON backup code. Please try again.');
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
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold text-center border border-emerald-300 animate-fade-in">
              {backupNotice}
            </div>
          )}
        </div>

        {/* Actions Stack */}
        <div className="space-y-2.5">
          {/* Workshop Transfer Action */}
          <button
            type="button"
            onClick={() => setShowTransferInput(!showTransferInput)}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-amber-50/50 text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-2 border-2 border-[#DCA134] shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#DCA134] ${showTransferInput ? 'rotate-180' : ''} transition-transform`} />
            <span>{showTransferInput ? 'Close Workshop Sync Form' : 'Switch / Transfer Master Workshop'}</span>
          </button>

          {/* Expanded Sync Input Form */}
          {showTransferInput && (
            <form onSubmit={handleSyncSubmit} className="p-4 rounded-2xl bg-amber-50/60 border border-[#DCA134]/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#DCA134]" />
                <h4 className="text-xs font-black uppercase text-[#0D3B36]">Enter Master Workshop Sync Code</h4>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Enter your Master Trainer&apos;s active <strong className="text-[#0D3B36] font-mono">TP-MSS-</strong> code to pair your device and sync atelier garments:
              </p>

              <input
                type="text"
                required
                value={newWorkshopCode}
                onChange={(e) => {
                  setNewWorkshopCode(formatWorkshopCodeInput(e.target.value));
                  setTransferError('');
                }}
                placeholder="e.g. TP-MSS-7K92-2026"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-black text-sm text-[#0D3B36] uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />

              {transferError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              {transferSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{transferSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DCA134]" />
                <span>Pair Device with Master Atelier</span>
              </button>
            </form>
          )}

          {/* Account Logout Action */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

