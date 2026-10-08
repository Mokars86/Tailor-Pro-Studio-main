import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { Client } from '../../types';

interface UndoDeleteToastProps {
  deletedClient: Client | null;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export const UndoDeleteToast: React.FC<UndoDeleteToastProps> = ({
  deletedClient,
  onUndo,
  onDismiss,
  durationMs = 6000
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMs);

  useEffect(() => {
    if (!deletedClient) return;

    setTimeLeft(durationMs);
    const interval = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= interval) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [deletedClient, durationMs, onDismiss]);

  if (!deletedClient) return null;

  const percentage = (timeLeft / durationMs) * 100;

  return (
    <div className="fixed bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-[250] w-[90vw] max-w-md animate-fade-in">
      <div className="relative overflow-hidden bg-[#0D3B36] dark:bg-[#041614] text-white rounded-2xl shadow-2xl border-2 border-[#DCA134] p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Progress Bar at top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-amber-400 transition-all duration-100 linear"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Info Text */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              Deleted <span className="text-amber-300 font-black">{deletedClient.name}</span>
            </p>
            <p className="text-[10px] text-slate-300">
              Auto-purges in {Math.ceil(timeLeft / 1000)}s
            </p>
          </div>
        </div>

        {/* Undo and Close buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0D3B36] font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
