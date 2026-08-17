import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, Trash2, Check, Ruler } from 'lucide-react';
import { Client, SpecSheetGarment, StudioSettings } from '../../types';
import { FullMeasurementsModal } from './FullMeasurementsModal';

interface SpecSheetModalProps {
  client: Client;
  studioSettings?: StudioSettings;
  onClose: () => void;
  onSaveSpecSheet?: (clientId: string, garments: SpecSheetGarment[]) => void;
}

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  client,
  studioSettings,
  onClose,
  onSaveSpecSheet
}) => {
  const calculateYardage = (lengthStr?: string) => {
    if (!lengthStr || lengthStr === '0.0"' || lengthStr === '0' || lengthStr === '—') return null;
    const num = parseFloat(lengthStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return null;
    const yards = Math.max(1, Math.ceil(((num + 6) / 36) * 2) / 2);
    return yards;
  };

  const defaultGarments: SpecSheetGarment[] = [
    {
      id: `g-${Date.now()}`,
      garmentType: client.garmentTag || 'Custom Garment',
      fabricBoltWidth: '60 Inches Width',
      fabricPhotos: [],
      notes: client.notes || '',
      yardsNeeded: calculateYardage(client.measurements?.fullLength) || 2.0
    }
  ];

  const [garments, setGarments] = useState<SpecSheetGarment[]>(defaultGarments);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isFullMeasurementsOpen, setIsFullMeasurementsOpen] = useState(false);

  const handleUpdateGarment = (index: number, updated: Partial<SpecSheetGarment>) => {
    setGarments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleAddGarment = () => {
    const newG: SpecSheetGarment = {
      id: `g-${Date.now()}`,
      garmentType: 'New Garment',
      fabricBoltWidth: '60 Inches Width',
      fabricPhotos: [],
      notes: '',
      yardsNeeded: calculateYardage(client.measurements?.fullLength) || 2.0
    };
    setGarments((prev) => [...prev, newG]);
  };

  const handleRemoveGarment = (index: number) => {
    if (garments.length <= 1) return;
    setGarments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFabricPhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGarments((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          fabricPhotos: [...next[index].fabricPhotos, url]
        };
        return next;
      });
    }
  };

  const handleConfirm = () => {
    if (onSaveSpecSheet) {
      onSaveSpecSheet(client.id, garments);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const rawBust = client.measurements?.bustOrChest || client.measurements?.bust || client.measurements?.chest;
  const rawLength = client.measurements?.fullLength;

  const bustVal = rawBust && rawBust !== '0.0' && rawBust !== '0' ? `${rawBust}"` : 'Not recorded';
  const lengthVal = rawLength && rawLength !== '0.0' && rawLength !== '0' ? `${rawLength}"` : 'Not recorded';

  return (
    <div className="fixed inset-0 z-[80] bg-[#EDF4F1] dark:bg-[#061E1B] overflow-y-auto flex flex-col font-['Outfit'] animate-fade-in">
      
      {/* Sticky Top Bar Header */}
      <div className="sticky top-0 z-30 bg-[#EDF4F1]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-4 pb-3.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 hover:text-emerald-950 font-bold text-sm transition-colors py-1 px-3 rounded-full bg-slate-200/80 dark:bg-slate-800 sm:bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          <span>Back</span>
        </button>

        <h1 className="font-extrabold text-lg sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight text-center">
          Spec Sheet: {client.name}
        </h1>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-extrabold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          Confirm
        </button>
      </div>

      {savedNotice && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>Spec sheet order confirmed and saved!</span>
        </div>
      )}

      {/* Main Form Content */}
      <div className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-24">
        
        {garments.map((g, idx) => (
          <div key={g.id} className="bg-white dark:bg-[#092825] rounded-[32px] p-6 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5 relative">
            
            {/* Card Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  {idx + 1}
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                  Garment #{idx + 1}: {g.garmentType || client.garmentTag || 'Custom Garment'}
                </h3>
              </div>

              {garments.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveGarment(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                  title="Remove Garment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Visual Croquis Spec Container */}
            <div className="bg-slate-50/70 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center gap-2 relative">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
                Visual Croquis spec
              </span>

              {/* Mannequin SVG */}
              <div className="w-24 h-36 my-1">
                <svg
                  viewBox="0 0 100 220"
                  className="w-full h-full text-slate-400 stroke-current fill-none stroke-[1.5]"
                >
                  <circle cx="50" cy="20" r="10" />
                  <path d="M47 30 L47 38 M53 30 L53 38" />
                  <path d="M50 38 L30 46 L22 90 L20 120" />
                  <path d="M50 38 L70 46 L78 90 L80 120" />
                  <path d="M30 46 Q32 65 36 90 Q38 105 34 125 L32 170 L28 210" />
                  <path d="M70 46 Q68 65 64 90 Q62 105 66 125 L68 170 L72 210" />
                  <path d="M48 128 L47 170 L48 210" />
                  <path d="M52 128 L53 170 L52 210" />
                </svg>
              </div>

              <span className="font-black text-xs text-slate-800 dark:text-amber-300 tracking-wider uppercase">
                {g.garmentType || client.garmentTag || 'Custom Garment'}
              </span>
            </div>

            {/* Garment Type Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Garment Type
              </label>
              <input
                type="text"
                value={g.garmentType || ''}
                onChange={(e) => handleUpdateGarment(idx, { garmentType: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
              />
            </div>

            {/* Fabric Bolt Width Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Fabric Bolt Width
              </label>
              <select
                value={g.fabricBoltWidth || '60 Inches Width'}
                onChange={(e) => handleUpdateGarment(idx, { fabricBoltWidth: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 appearance-none"
              >
                <option value="60 Inches Width">60 Inches Width</option>
                <option value="45 Inches Width">45 Inches Width</option>
                <option value="72 Inches Width">72 Inches Width</option>
              </select>
            </div>

            {/* Fabric Photos Section */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                Fabric Photos ({g.fabricPhotos.length})
              </label>

              {g.fabricPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {g.fabricPhotos.map((photoUrl, pIdx) => (
                    <img
                      key={pIdx}
                      src={photoUrl}
                      alt="Fabric Photo"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                  ))}
                </div>
              )}

              <label className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-200 text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-slate-500 dark:text-amber-300" />
                <span>Add Fabric Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAddFabricPhoto(idx, e)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Automated Yardage Calculator */}
            <div className="border-2 border-dashed border-slate-800 dark:border-amber-400/60 rounded-2xl p-5 text-center space-y-1 bg-white dark:bg-slate-800">
              <span className="text-[11px] font-black text-slate-700 dark:text-amber-300 tracking-wider uppercase block">
                AUTOMATED YARDAGE CALCULATOR ({g.garmentType || client.garmentTag || 'Garment'})
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Bust: <strong className="text-slate-800 dark:text-slate-200">{bustVal}</strong> • Length: <strong className="text-slate-800 dark:text-slate-200">{lengthVal}</strong>
              </p>
              <div className="pt-2">
                <span className="font-black text-2xl text-slate-900 dark:text-slate-100">
                  {g.yardsNeeded ?? calculateYardage(client.measurements?.fullLength) ?? '2.0'}
                </span>
                <span className="font-extrabold text-sm text-slate-700 dark:text-amber-300 ml-1.5">
                  Yards Needed
                </span>
              </div>
            </div>

            {/* Pattern Notes & Sewing Specs */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Pattern Notes & Sewing Specs
              </label>
              <textarea
                rows={3}
                value={g.notes || ''}
                onChange={(e) => handleUpdateGarment(idx, { notes: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 resize-none mb-3"
              />

              {/* View Full Measurements Button below Spec Sheet button/section */}
              <button
                type="button"
                onClick={() => setIsFullMeasurementsOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0D3B36] to-[#082824] dark:from-emerald-800 dark:to-emerald-950 hover:from-[#082824] hover:to-[#051c19] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-700/40 cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>View Full Measurements ({client.name})</span>
              </button>
            </div>

          </div>
        ))}

        {/* Add Another Garment Button */}
        <button
          type="button"
          onClick={handleAddGarment}
          className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white/80 dark:bg-slate-800/80 font-black text-slate-800 dark:text-slate-100 text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 text-slate-800 dark:text-amber-300" />
          <span>Add Another Garment to Order</span>
        </button>

      </div>

      {/* Full Measurements Modal Component */}
      <FullMeasurementsModal
        isOpen={isFullMeasurementsOpen}
        onClose={() => setIsFullMeasurementsOpen(false)}
        client={client}
        studioSettings={studioSettings}
      />

    </div>
  );
};
