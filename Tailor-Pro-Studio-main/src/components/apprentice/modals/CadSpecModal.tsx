import React from 'react';
import { X, Ruler, Layers, CheckCircle2 } from 'lucide-react';
import { Client } from '../../../types';

interface CadSpecModalProps {
  client: Client | null;
  onClose: () => void;
}

export const CadSpecModal: React.FC<CadSpecModalProps> = ({ client, onClose }) => {
  if (!client) return null;

  const m = client.measurements || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[32px] p-6 space-y-5 shadow-2xl border border-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#082824] text-[#DCA134]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-black text-lg text-[#0D3B36] tracking-tight">
                CAD Blueprint & Garment Spec
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {client.name} · <span className="text-[#0D3B36] font-bold">{client.garmentTag}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CAD Blueprint Spec Canvas Card */}
        <div className="p-4 rounded-2xl bg-[#082824] text-white space-y-3 border border-[#DCA134]/40 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#DCA134] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> PATTERN CUTTING SPECIFICATION
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              VERIFIED TAPE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Bust / Chest</span>
              <span className="font-mono text-base font-black text-[#DCA134]">{m.bustOrChest || '--'}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Waist</span>
              <span className="font-mono text-base font-black text-[#DCA134]">{m.waist || '--'}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Hips</span>
              <span className="font-mono text-base font-black text-[#DCA134]">{m.hips || '--'}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Shoulder Width</span>
              <span className="font-mono text-base font-black text-white">{m.shoulderWidth || '--'}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Sleeve Length</span>
              <span className="font-mono text-base font-black text-white">{m.sleeveLength || '--'}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Full Length</span>
              <span className="font-mono text-base font-black text-white">{m.fullLength || '--'}</span>
            </div>
          </div>
        </div>

        {/* Master Cutting Notes */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <span className="font-bold block text-amber-950 uppercase tracking-wider text-[10px]">
            📌 Master Pattern Cutter Note:
          </span>
          <p className="font-medium">
            {client.notes || 'No specific pattern cutter notes recorded yet for this client.'}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-[#082824] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-[#DCA134]" />
          <span>Close CAD Specification</span>
        </button>
      </div>
    </div>
  );
};
