import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-['Outfit'] select-none animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#092825] rounded-[32px] p-6 space-y-5 shadow-2xl border-2 border-amber-400/40 text-center relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 text-[#DCA134] border-2 border-[#DCA134] flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-7 h-7 text-[#DCA134]" />
        </div>

        {/* Content Header & Message */}
        <div className="space-y-1.5">
          <h3 className="font-black text-lg sm:text-xl text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight">
            Confirm Logout
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Are you sure you want to logout?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Yes, Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
