import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Check, Mic, Sparkles, Ruler, Plus, PlusCircle, Trash2 } from 'lucide-react';
import { Client, GarmentMeasurements, StudioSettings } from '../../types';
import { AiBodyScanModal } from './AiBodyScanModal';
import { VoiceMeasurementAssistantModal } from './VoiceMeasurementAssistantModal';
import { FullMeasurementsModal } from './FullMeasurementsModal';

interface GarmentMeasurementsModalProps {
  client: Client;
  studioSettings?: StudioSettings;
  onSave: (clientId: string, measurements: GarmentMeasurements) => void;
  onClose: () => void;
}

type MeasurementKey = keyof Omit<GarmentMeasurements, 'genderCategory' | 'segment' | 'garmentType' | 'customMeasurements'>;

interface FieldConfig {
  key: MeasurementKey;
  label: string;
  segment: 'UPPER BODY' | 'LOWER BODY';
  category: 'Female' | 'Male' | 'Both';
  croquisTopPercent: number; // For position of highlight band on croquis
}

const MEASUREMENT_FIELDS: FieldConfig[] = [
  // Upper Body Fields
  { key: 'bust', label: 'Bust', segment: 'UPPER BODY', category: 'Female', croquisTopPercent: 28 },
  { key: 'chest', label: 'Chest', segment: 'UPPER BODY', category: 'Male', croquisTopPercent: 28 },
  { key: 'shoulder', label: 'Shoulder', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 18 },
  { key: 'underbust', label: 'Underbust', segment: 'UPPER BODY', category: 'Female', croquisTopPercent: 33 },
  { key: 'breastLength', label: 'Breast Length', segment: 'UPPER BODY', category: 'Female', croquisTopPercent: 31 },
  { key: 'neck', label: 'Neck', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 12 },
  { key: 'sleeveLength', label: 'Sleeve Length', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 38 },
  { key: 'roundSleeves', label: 'Round Sleeves', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 36 },
  { key: 'topLength', label: 'Top Length', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 44 },
  { key: 'waist', label: 'Waist', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 46 },
  { key: 'hips', label: 'Hips', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 54 },
  { key: 'skirtLength', label: 'Skirt Length', segment: 'UPPER BODY', category: 'Female', croquisTopPercent: 70 },
  { key: 'fullLength', label: 'Full Length', segment: 'UPPER BODY', category: 'Both', croquisTopPercent: 88 },

  // Lower Body Fields
  { key: 'waist', label: 'Waist', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 46 },
  { key: 'hips', label: 'Hips', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 54 },
  { key: 'thigh', label: 'Thigh', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 62 },
  { key: 'knee', label: 'Knee', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 72 },
  { key: 'ankle', label: 'Ankle', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 86 },
  { key: 'inseam', label: 'Inseam', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 75 },
  { key: 'fullLength', label: 'Full Length', segment: 'LOWER BODY', category: 'Both', croquisTopPercent: 90 },
];

export const GarmentMeasurementsModal: React.FC<GarmentMeasurementsModalProps> = ({
  client,
  studioSettings,
  onSave,
  onClose
}) => {
  const existingMeas = (client.measurements as GarmentMeasurements) || {};

  const [genderCategory, setGenderCategory] = useState<'Female' | 'Male'>(
    existingMeas.genderCategory || 'Female'
  );
  const [segment, setSegment] = useState<'UPPER BODY' | 'LOWER BODY'>(
    existingMeas.segment || 'UPPER BODY'
  );
  const [autoNext, setAutoNext] = useState<boolean>(true);

  const [measValues, setMeasValues] = useState<Record<string, string>>({
    bust: existingMeas.bust || existingMeas.bustOrChest || '',
    chest: existingMeas.chest || existingMeas.bustOrChest || '',
    shoulder: existingMeas.shoulder || existingMeas.shoulderWidth || '',
    underbust: existingMeas.underbust || '',
    breastLength: existingMeas.breastLength || '',
    neck: existingMeas.neck || '',
    sleeveLength: existingMeas.sleeveLength || '',
    roundSleeves: existingMeas.roundSleeves || '',
    topLength: existingMeas.topLength || '',
    waist: existingMeas.waist || '',
    hips: existingMeas.hips || '',
    skirtLength: existingMeas.skirtLength || '',
    fullLength: existingMeas.fullLength || '',
    thigh: existingMeas.thigh || '',
    knee: existingMeas.knee || '',
    ankle: existingMeas.ankle || '',
    inseam: existingMeas.inseam || '',
  });

  // Dynamic Custom Measurements State
  const [customMeas, setCustomMeas] = useState<Array<{ name: string; value: string }>>(() => {
    const custom = existingMeas.customMeasurements || {};
    return Object.entries(custom).map(([name, value]) => ({ name, value: String(value) }));
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');

  const handleAddCustomItem = () => {
    if (!newCustomName.trim()) return;
    const name = newCustomName.trim();
    const val = newCustomValue.trim();

    setCustomMeas((prev) => {
      const existsIdx = prev.findIndex((i) => i.name.toLowerCase() === name.toLowerCase());
      if (existsIdx >= 0) {
        const updated = [...prev];
        updated[existsIdx] = { name: prev[existsIdx].name, value: val };
        return updated;
      }
      return [...prev, { name, value: val }];
    });

    setNewCustomName('');
    setNewCustomValue('');
    setIsAddingCustom(false);
  };

  const handleCustomValueChange = (index: number, val: string) => {
    setCustomMeas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: val };
      return updated;
    });
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomMeas((prev) => prev.filter((_, i) => i !== index));
  };

  const [activeKey, setActiveKey] = useState<MeasurementKey>('bust');
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isFullMeasurementsOpen, setIsFullMeasurementsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter fields based on active category & segment
  const currentFields = MEASUREMENT_FIELDS.filter(
    (f) => f.segment === segment && (f.category === 'Both' || f.category === genderCategory)
  );

  const activeFieldConfig = MEASUREMENT_FIELDS.find((f) => f.key === activeKey) || currentFields[0];

  const handleInputChange = (key: string, value: string) => {
    setMeasValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent, currentKey: MeasurementKey) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (autoNext) {
        const currentIndex = currentFields.findIndex((f) => f.key === currentKey);
        if (currentIndex >= 0 && currentIndex < currentFields.length - 1) {
          e.preventDefault();
          const nextKey = currentFields[currentIndex + 1].key;
          setActiveKey(nextKey);
        }
      }
    }
  };

  const getMergedMeasurements = (): GarmentMeasurements => {
    const customObj: Record<string, string> = {};
    customMeas.forEach((item) => {
      if (item.name.trim()) {
        customObj[item.name.trim()] = item.value;
      }
    });

    return {
      ...existingMeas,
      ...measValues,
      customMeasurements: customObj,
      genderCategory,
      segment,
      bustOrChest: (genderCategory === 'Female' ? (measValues.bust || measValues.bustOrChest) : (measValues.chest || measValues.bustOrChest)) || existingMeas.bustOrChest || '',
      bust: measValues.bust || measValues.bustOrChest || existingMeas.bust || '',
      chest: measValues.chest || measValues.bustOrChest || existingMeas.chest || '',
      shoulderWidth: measValues.shoulder || measValues.shoulderWidth || existingMeas.shoulderWidth || '',
      shoulder: measValues.shoulder || measValues.shoulderWidth || existingMeas.shoulder || '',
      waist: measValues.waist || existingMeas.waist || '',
      hips: measValues.hips || existingMeas.hips || '',
      sleeveLength: measValues.sleeveLength || existingMeas.sleeveLength || '',
      fullLength: measValues.fullLength || existingMeas.fullLength || '',
    };
  };

  const handleSave = () => {
    const updated = getMergedMeasurements();

    onSave(client.id, updated);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setClientPhoto(url);
    }
  };

  const activeVal = measValues[activeKey as string] || '';

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-[#EDF4F1] dark:bg-[#061E1B] overflow-y-auto flex flex-col font-['Outfit'] animate-fade-in">
        
        {/* Sticky Screen Header Bar */}
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
            {client.name}
          </h1>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-extrabold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Save
          </button>
        </div>

        {/* Saved Toast Notification */}
        {savedNotice && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>Garment measurements saved successfully!</span>
          </div>
        )}

        <div className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4 pb-24">

          {/* AI Tools & Hands-Free Voice Assistant Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0D3B36] via-[#082824] to-emerald-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-emerald-500/30">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#DCA134]" />
                <span className="font-['Outfit'] font-black text-xs uppercase tracking-wider text-[#DCA134]">
                  SMART TAILORING TOOLS
                </span>
              </div>
              <p className="text-xs text-slate-200 font-semibold">
                Hands-free voice dictation or AI camera scanning
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsFullMeasurementsOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-300" />
                <span>View Full Measurements</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse text-[#0D3B36]" />
                <span>Voice Tape-Recorder</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiScanOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AI Body Scan</span>
              </button>
            </div>
          </div>

          {/* Gender Category Segment Switcher */}
          <div className="bg-[#182928] dark:bg-[#092825] p-1.5 rounded-full flex items-center gap-1 shadow-inner border border-white/10">
            <button
              type="button"
              onClick={() => {
                setGenderCategory('Male');
                if (activeKey === 'bust') setActiveKey('chest');
              }}
              className={`flex-1 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                genderCategory === 'Male'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-300 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-sm">♂</span>
              <span>Male Category</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGenderCategory('Female');
                if (activeKey === 'chest') setActiveKey('bust');
              }}
              className={`flex-1 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                genderCategory === 'Female'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-300 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-sm">♀</span>
              <span>Female Category</span>
            </button>
          </div>

          {/* Segment & Auto-Next Row */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSegment('UPPER BODY')}
                className={`text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer ${
                  segment === 'UPPER BODY' ? 'text-[#0D3B36] dark:text-[#DCA134] border-b-2 border-[#0D3B36] dark:border-[#DCA134] pb-0.5' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                SEGMENT: UPPER BODY
              </button>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setSegment('LOWER BODY')}
                className={`text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer ${
                  segment === 'LOWER BODY' ? 'text-[#0D3B36] dark:text-[#DCA134] border-b-2 border-[#0D3B36] dark:border-[#DCA134] pb-0.5' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                LOWER BODY
              </button>
            </div>

            {/* Auto-Next Switch */}
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
              <span>Auto-Next:</span>
              <button
                type="button"
                onClick={() => setAutoNext(!autoNext)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center cursor-pointer ${
                  autoNext ? 'bg-[#0D6348] dark:bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform ${
                    autoNext ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Measurement Fields Input Cards */}
          <div className="space-y-3">
            {currentFields.map((field) => {
              const val = measValues[field.key] || '';
              const isActive = activeKey === field.key;

              return (
                <div
                  key={field.key}
                  onClick={() => setActiveKey(field.key)}
                  className={`bg-white dark:bg-[#092825] rounded-2xl p-4 transition-all cursor-pointer relative shadow-2xs ${
                    isActive
                      ? 'border-2 border-[#0D3B36] dark:border-[#DCA134] ring-2 ring-[#0D3B36]/10 dark:ring-amber-400/20 shadow-md'
                      : 'border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1 pointer-events-none">
                    {field.label}
                  </label>

                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={val}
                      onFocus={() => setActiveKey(field.key)}
                      onChange={(e) => handleInputChange(String(field.key), e.target.value)}
                      onKeyDown={(e) => handleFieldKeyDown(e, field.key)}
                      placeholder="Tap to enter"
                      className="w-full bg-transparent font-extrabold text-slate-900 dark:text-slate-100 text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-normal"
                    />
                    <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 ml-2 shrink-0">
                      in
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom & Additional Measurement Types Section */}
          <div className="bg-white dark:bg-[#092825] rounded-2xl p-3.5 sm:p-4 border border-[#0D3B36]/20 dark:border-amber-400/20 shadow-2xs space-y-3">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0D3B36] dark:text-amber-300 uppercase tracking-wider min-w-0">
                <PlusCircle className="w-4 h-4 text-[#DCA134] shrink-0" />
                <span className="truncate">Custom / Additional ({customMeas.length})</span>
              </div>
              {!isAddingCustom && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full xs:w-auto px-3.5 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-amber-300 dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 shrink-0 border border-[#DCA134]/30"
                >
                  <Plus className="w-4 h-4 text-amber-300 dark:text-[#0D3B36] shrink-0 stroke-[3]" />
                  <span>+ Add Measurement Type</span>
                </button>
              )}
            </div>

            {/* Inline Form to Add New Custom Measurement Type */}
            {isAddingCustom && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border-2 border-[#DCA134]/40 dark:border-amber-400/30 space-y-3 font-['Outfit']">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#0D3B36] dark:text-amber-300 uppercase tracking-wider">
                    Add New Custom Measurement Type
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newCustomName}
                    onChange={(e) => setNewCustomName(e.target.value)}
                    placeholder="Name (e.g. Cap Sleeve, Wrist...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-xs"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCustomValue}
                      onChange={(e) => setNewCustomValue(e.target.value)}
                      placeholder="Value (e.g. 14.5)"
                      className="w-full flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-xs"
                    />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 shrink-0">in</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustom(false);
                      setNewCustomName('');
                      setNewCustomValue('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-4 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-amber-300 dark:text-[#0D3B36] font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add to Tape</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Custom Measurement Cards */}
            {customMeas.length === 0 && !isAddingCustom && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic text-center py-1">
                No custom measurements added yet. Tap "+ Add Measurement Type" above to add any custom metric.
              </p>
            )}

            {customMeas.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-black text-[#0D3B36] dark:text-amber-300 mb-0.5 truncate">
                    {item.name}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleCustomValueChange(index, e.target.value)}
                      placeholder="Tap to enter"
                      className="w-full bg-transparent font-extrabold text-slate-900 dark:text-slate-100 text-base focus:outline-none placeholder:text-slate-400"
                    />
                    <span className="text-xs font-extrabold text-slate-400 shrink-0">
                      in
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomItem(index)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                  title="Remove custom measurement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Card: ACTIVE FITTING TELEMETRY & VISUAL CROQUIS */}
          <div className="bg-white dark:bg-[#092825] rounded-[28px] p-6 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-5">
            
            {/* Header Box */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl py-2 px-4 text-center">
              <span className="text-[11px] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                ACTIVE FITTING TELEMETRY
              </span>
              <p className="font-extrabold text-[#0D3B36] dark:text-amber-300 text-sm mt-0.5">
                {activeFieldConfig?.label}: {activeVal ? `${activeVal}"` : 'Not set'}
              </p>
            </div>

            {/* Photo Upload Buttons */}
            <div className="flex flex-col items-center justify-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full bg-[#EDF4F1] border border-slate-200 flex items-center justify-center text-[#0D3B36] hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <Camera className="w-7 h-7 text-[#0D3B36]" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:bg-slate-50"
              >
                <Camera className="w-4 h-4 text-[#0D3B36]" />
                <span>Add Client Photo</span>
              </button>

              {clientPhoto && (
                <div className="mt-2 text-center">
                  <img
                    src={clientPhoto}
                    alt="Client Fitting"
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-[#0D3B36] shadow-sm"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1">Photo Attached</span>
                </div>
              )}
            </div>

            {/* Visual Croquis Diagram with Dynamic Highlight Band */}
            <div className="relative w-full max-w-[200px] mx-auto h-[260px] flex items-center justify-center">
              
              {/* Croquis SVG Mannequin Outline */}
              <svg
                viewBox="0 0 100 240"
                className="w-full h-full text-slate-400 stroke-current fill-none stroke-[1.5]"
              >
                {/* Head */}
                <circle cx="50" cy="20" r="10" />
                {/* Neck */}
                <path d="M47 30 L47 38 M53 30 L53 38" />
                {/* Shoulders & Arms */}
                <path d="M50 38 L30 46 L22 90 L20 120" />
                <path d="M50 38 L70 46 L78 90 L80 120" />
                {/* Torso & Bust */}
                <path d="M30 46 Q32 65 36 90 Q38 105 34 125 L32 170 L28 220" />
                <path d="M70 46 Q68 65 64 90 Q62 105 66 125 L68 170 L72 220" />
                {/* Inner Legs */}
                <path d="M48 128 L47 170 L48 220" />
                <path d="M52 128 L53 170 L52 220" />
              </svg>

              {/* Dynamic Measurement Site Highlight Band */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-28 border-y-2 border-dashed border-[#0D6348] bg-[#0D6348]/15 h-5 flex items-center justify-center transition-all duration-300"
                style={{ top: `${activeFieldConfig?.croquisTopPercent || 30}%` }}
              >
                <div className="w-full border-t border-[#0D6348] opacity-70" />
              </div>

              <div className="absolute bottom-1 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                {activeFieldConfig?.label || 'Croquis Spec'}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Full Measurements Modal */}
      <FullMeasurementsModal
        isOpen={isFullMeasurementsOpen}
        onClose={() => setIsFullMeasurementsOpen(false)}
        client={{
          ...client,
          measurements: getMergedMeasurements()
        }}
        studioSettings={studioSettings}
      />

      {/* Voice Measurement Assistant Modal */}
      <VoiceMeasurementAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        client={client}
        currentMeasurements={measValues}
        onApplyMeasurements={(newMeas) => {
          setMeasValues((prev) => {
            const updated = { ...prev };
            Object.entries(newMeas).forEach(([k, v]) => {
              if (v) updated[k] = v;
            });
            return updated;
          });
        }}
      />

      {/* AI Camera Body Scanner Modal */}
      <AiBodyScanModal
        client={client}
        isOpen={isAiScanOpen}
        onClose={() => setIsAiScanOpen(false)}
        onSaveMeasurements={(clientId, newMeas) => {
          setMeasValues((prev) => ({
            ...prev,
            bust: newMeas.bustOrChest || prev.bust,
            chest: newMeas.bustOrChest || prev.chest,
            shoulder: newMeas.shoulderWidth || prev.shoulder,
            waist: newMeas.waist || prev.waist,
            hips: newMeas.hips || prev.hips,
            sleeveLength: newMeas.sleeveLength || prev.sleeveLength,
            fullLength: newMeas.fullLength || prev.fullLength,
          }));
          setIsAiScanOpen(false);
        }}
      />
    </>
  );
};
