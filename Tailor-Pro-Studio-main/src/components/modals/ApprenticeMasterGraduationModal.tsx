import React, { useState } from 'react';
import { X, Sparkles, Building2, User, QrCode, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { generateMasterWorkshopCode } from '../../utils/workshopCode';

interface ApprenticeMasterGraduationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprenticeName: string;
  masterName: string;
  onGraduateToMasterStudio: (newStudioName: string, ownerName: string, newWorkshopCode: string) => void;
}

export const ApprenticeMasterGraduationModal: React.FC<ApprenticeMasterGraduationModalProps> = ({
  isOpen,
  onClose,
  apprenticeName,
  masterName,
  onGraduateToMasterStudio
}) => {
  const [studioName, setStudioName] = useState(`${apprenticeName}'s Couture Studio`);
  const [ownerName, setOwnerName] = useState(apprenticeName);
  const [newWorkshopCode, setNewWorkshopCode] = useState(() => generateMasterWorkshopCode(`${apprenticeName}'s Studio`));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudio = studioName.trim() || `${apprenticeName}'s Atelier`;
    const finalOwner = ownerName.trim() || apprenticeName;
    const finalCode = newWorkshopCode || generateMasterWorkshopCode(finalStudio);
    onGraduateToMasterStudio(finalStudio, finalOwner, finalCode);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none">
      <div className="w-full max-w-lg my-auto glass-card rounded-[32px] p-6 sm:p-8 border-2 border-[#DCA134] shadow-2xl bg-gradient-to-b from-[#061E1B] via-[#082824] to-[#0A3832] text-slate-100 relative overflow-hidden space-y-5">
        
        {/* Soft Gold Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#DCA134]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header Icon & Seal */}
        <div className="text-center space-y-2 relative z-10 pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#061E1B] border-2 border-[#DCA134] shadow-xl flex items-center justify-center text-[#DCA134] relative group">
            <Award className="w-8 h-8 text-[#DCA134]" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DCA134] text-[#061E1B] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#061E1B] animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MASTER HANDSHAKE ACTIVATED ✓</span>
            </span>

            <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-white tracking-tight uppercase mt-2">
              Congratulations, Master! 🎉
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Your Master Trainer <strong className="text-amber-300 font-bold">{masterName}</strong> has granted official Handshake Approval. You are now certified to launch your own Master Atelier Studio!
            </p>
          </div>
        </div>

        {/* Master Studio Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 pt-2 border-t border-white/10">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#DCA134]" />
              <span>YOUR NEW MASTER STUDIO NAME *</span>
            </label>
            <input
              type="text"
              required
              value={studioName}
              onChange={(e) => {
                setStudioName(e.target.value);
                setNewWorkshopCode(generateMasterWorkshopCode(e.target.value));
              }}
              placeholder="e.g. Raeesa Couture Atelier"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-bold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DCA134] focus:bg-black/30 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#DCA134]" />
              <span>MASTER OWNER FULL NAME *</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Raeesa Mubarick"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-bold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DCA134] focus:bg-black/30 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-[#DCA134]/40">
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#DCA134]" />
                <span>YOUR NEW WORKSHOP SYNC KEY</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                AUTO-GENERATED
              </span>
            </label>
            <input
              type="text"
              readOnly
              value={newWorkshopCode}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-black text-sm text-emerald-300 uppercase select-all focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Apprentices can use this key to link their devices to your new workshop.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#DCA134] hover:bg-[#c9902b] text-[#061E1B] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer tracking-wider uppercase"
            >
              <span>Launch Master Studio Shop ✂</span>
              <ArrowRight className="w-4 h-4 text-[#061E1B]" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
            >
              Remind Me Later (Remain in Apprentice Mode)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
