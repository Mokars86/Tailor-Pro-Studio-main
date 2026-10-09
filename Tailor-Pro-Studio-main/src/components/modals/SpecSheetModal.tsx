import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Upload,
  Plus,
  Minus,
  Trash2,
  Check,
  Ruler,
  Eye,
  Sparkles,
  Scissors,
  Layers,
  FileText,
  X,
  Maximize2,
  Calculator,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  ChevronRight,
  Palette
} from 'lucide-react';
import { Client, SpecSheetGarment, StudioSettings } from '../../types';
import { FullMeasurementsModal } from './FullMeasurementsModal';
import { storageService } from '../../services/storageService';

interface SpecSheetModalProps {
  client: Client;
  studioSettings?: StudioSettings;
  onClose: () => void;
  onSaveSpecSheet?: (clientId: string, garments: SpecSheetGarment[]) => void;
}

export const POPULAR_GARMENT_STYLES = [
  'Straight Dress',
  'Evening Gown',
  'Senator Wear',
  'Kente Corset Gown',
  'Tailored Suit & Blazer',
  'Kaftan / Boubou / Agbada',
  'Skirt & Blouse (Slit & Kaba)',
  'Corset & Trousers',
  'Couture Jumpsuit',
  'Smock / Fugu'
];

/* =========================================================
   Modern Human Fashion Croquis Vector Component
   ========================================================= */
interface HumanCroquisProps {
  garmentType: string;
  viewAngle: 'front' | 'back';
  showGuideLines: boolean;
}

const ModernHumanCroquis: React.FC<HumanCroquisProps> = ({
  garmentType,
  viewAngle,
  showGuideLines
}) => {
  const normalizedType = (garmentType || '').toLowerCase();

  const isSuit = normalizedType.includes('suit') || normalizedType.includes('blazer') || normalizedType.includes('jacket') || normalizedType.includes('tuxedo') || normalizedType.includes('senator');
  const isKaftan = normalizedType.includes('kaftan') || normalizedType.includes('boubou') || normalizedType.includes('agbada') || normalizedType.includes('robe') || normalizedType.includes('smock') || normalizedType.includes('fugu');
  const isGown = normalizedType.includes('gown') || normalizedType.includes('maxi') || normalizedType.includes('evening') || normalizedType.includes('wedding') || normalizedType.includes('ball');
  const isSkirt = normalizedType.includes('skirt') || normalizedType.includes('two piece') || normalizedType.includes('top &') || normalizedType.includes('slit') || normalizedType.includes('kaba');

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 160 300"
        className="w-full h-full max-h-[290px] drop-shadow-md transition-all duration-300"
      >
        <defs>
          {/* Subtle Ambient Gradients */}
          <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="garmentFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D3B36" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0D3B36" stopOpacity="0.06" />
          </linearGradient>

          <linearGradient id="garmentStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D3B36" />
            <stop offset="50%" stopColor="#0D6348" />
            <stop offset="100%" stopColor="#DCA134" />
          </linearGradient>
        </defs>

        {/* ----------------------------------------------------
            1. REALISTIC HUMAN ANATOMICAL BODY CONTOURS
           ---------------------------------------------------- */}
        <g className="opacity-90">
          {/* Head & Hair Contour */}
          <ellipse cx="80" cy="28" rx="11" ry="15" className="fill-slate-200 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500 stroke-[1.2]" />
          <path d="M72 20 Q80 12 88 20 Q80 16 72 20 Z" className="fill-slate-400 dark:fill-slate-500" />
          
          {/* Graceful Neck */}
          <path d="M75 42 L75 52 M85 42 L85 52" className="stroke-slate-400 dark:stroke-slate-500 stroke-[1.5] fill-none" />

          {/* Collarbones */}
          <path d="M68 53 Q80 57 92 53" className="stroke-slate-300 dark:stroke-slate-600 stroke-[1] fill-none" />

          {/* Torso Silhouette (Bust, Waist, Hips) */}
          <path
            d="M60 56 Q52 75 58 92 Q62 108 59 122 Q54 138 52 165 L56 220 L58 280 M58 220 L60 280"
            className="stroke-slate-400 dark:stroke-slate-500 stroke-[1.2] fill-none"
          />
          <path
            d="M100 56 Q108 75 102 92 Q98 108 101 122 Q106 138 108 165 L104 220 L102 280 M102 220 L100 280"
            className="stroke-slate-400 dark:stroke-slate-500 stroke-[1.2] fill-none"
          />

          {/* Anatomical Bust Curves */}
          {viewAngle === 'front' && (
            <>
              <path d="M62 76 Q70 88 80 88 Q90 88 98 76" className="stroke-slate-300 dark:stroke-slate-600 stroke-[1] fill-none" />
              <path d="M72 74 Q80 72 88 74" className="stroke-slate-300 dark:stroke-slate-600 stroke-[1] fill-none" />
            </>
          )}

          {/* Arms Pose */}
          <path d="M59 56 Q48 90 44 135 L42 170" className="stroke-slate-400 dark:stroke-slate-500 stroke-[1.2] fill-none" />
          <path d="M101 56 Q112 90 116 135 L118 170" className="stroke-slate-400 dark:stroke-slate-500 stroke-[1.2] fill-none" />
          {/* Hands */}
          <circle cx="41.5" cy="173" r="2.5" className="fill-slate-400 dark:fill-slate-500" />
          <circle cx="118.5" cy="173" r="2.5" className="fill-slate-400 dark:fill-slate-500" />

          {/* Legs Divider Line */}
          <path d="M80 142 L80 270" className="stroke-slate-300 dark:stroke-slate-600 stroke-[1] stroke-dasharray-[2,2] fill-none" />
        </g>

        {/* ----------------------------------------------------
            2. DYNAMIC FASHION GARMENT OVERLAY SILHOUETTE
           ---------------------------------------------------- */}

        {/* GARMENT TYPE: KAFTAN / BOUBOU / AGBADA */}
        {isKaftan && (
          <g className="animate-fade-in">
            <path
              d="M72 52 L50 60 L20 110 L25 250 Q80 260 135 250 L140 110 L110 60 L88 52 Z"
              className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2] stroke-linejoin-round"
            />
            {/* Kaftan V-Neck Collar */}
            <path d="M72 52 L80 85 L88 52" className="stroke-[#0D3B36] dark:stroke-amber-400 stroke-[2] fill-none" />
            {/* Center Embroidery Placket */}
            <path d="M80 85 L80 160" className="stroke-[#DCA134] stroke-[2] stroke-dasharray-[3,3] fill-none" />
          </g>
        )}

        {/* GARMENT TYPE: SUIT / BLAZER / JACKET */}
        {isSuit && (
          <g className="animate-fade-in">
            {/* Tailored Blazer Torso */}
            <path
              d="M58 54 L38 60 L45 155 L78 155 L80 150 L82 155 L115 155 L122 60 L102 54 Z"
              className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]"
            />
            {/* Lapels */}
            <path d="M68 54 L80 95 L65 110 M92 54 L80 95 L95 110" className="stroke-[#0D3B36] dark:stroke-amber-400 stroke-[2] fill-none" />
            {/* Double Buttons */}
            <circle cx="75" cy="120" r="2" className="fill-[#DCA134]" />
            <circle cx="85" cy="120" r="2" className="fill-[#DCA134]" />
            <circle cx="75" cy="135" r="2" className="fill-[#DCA134]" />
            <circle cx="85" cy="135" r="2" className="fill-[#DCA134]" />
            {/* Tailored Trousers */}
            <path d="M62 155 L56 270 L76 270 L79 160 M98 155 L104 270 L84 270 L81 160" className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]" />
          </g>
        )}

        {/* GARMENT TYPE: EVENING GOWN / MAXI */}
        {isGown && (
          <g className="animate-fade-in">
            {/* Corset / Bodice */}
            <path
              d="M62 62 Q80 70 98 62 L102 110 Q80 114 58 110 Z"
              className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]"
            />
            {/* Sweeping Flared Skirt */}
            <path
              d="M58 110 Q25 210 15 275 Q80 285 145 275 Q135 210 102 110 Z"
              className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]"
            />
            {/* Skirt Pleat Guidelines */}
            <path d="M80 114 Q80 200 80 280 M68 112 Q50 200 40 278 M92 112 Q110 200 120 278" className="stroke-[#0D3B36]/40 dark:stroke-amber-400/40 stroke-[1] stroke-dasharray-[3,3] fill-none" />
          </g>
        )}

        {/* GARMENT TYPE: SKIRT & BLOUSE / TOP & TROUSERS */}
        {isSkirt && (
          <g className="animate-fade-in">
            {/* Top Blouse */}
            <path d="M60 56 Q80 62 100 56 L104 108 L56 108 Z" className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]" />
            {/* Skirt Drop */}
            <path d="M56 112 L45 240 Q80 248 115 240 L104 112 Z" className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2]" />
          </g>
        )}

        {/* DEFAULT GARMENT TYPE: STRAIGHT DRESS (SHEATH) */}
        {!isKaftan && !isSuit && !isGown && !isSkirt && (
          <g className="animate-fade-in">
            {/* Fitted Straight Sheath Dress Outline */}
            <path
              d="M60 54 Q80 62 100 54 L103 92 Q98 112 100 135 L96 230 Q80 234 64 230 L60 135 Q62 112 57 92 Z"
              className="fill-[url(#garmentFillGrad)] stroke-[url(#garmentStrokeGrad)] stroke-[2.2] stroke-linejoin-round"
            />
            {/* Bust Darts */}
            <path d="M64 80 L74 92 M96 80 L86 92" className="stroke-[#0D3B36] dark:stroke-amber-400 stroke-[1.5] fill-none" />
            {/* Waist Seam Line */}
            <path d="M58 110 Q80 114 102 110" className="stroke-[#DCA134] stroke-[1.8] stroke-dasharray-[2,2] fill-none" />
            {/* Hem Band Line */}
            <path d="M63 222 Q80 226 97 222" className="stroke-[#0D3B36] dark:stroke-amber-400 stroke-[1.5] fill-none" />
          </g>
        )}

        {/* ----------------------------------------------------
            3. FASHION STRUCTURAL GUIDE LINES (Bust, Waist, Hips)
           ---------------------------------------------------- */}
        {showGuideLines && (
          <g className="animate-fade-in opacity-80">
            {/* Bust Line (y=80) */}
            <line x1="25" y1="80" x2="135" y2="80" className="stroke-emerald-600 dark:stroke-emerald-400 stroke-[1] stroke-dasharray-[3,3]" />
            <text x="26" y="76" className="fill-emerald-700 dark:fill-emerald-300 font-bold text-[8px]">BUST</text>

            {/* Waist Line (y=110) */}
            <line x1="25" y1="110" x2="135" y2="110" className="stroke-amber-600 dark:stroke-amber-400 stroke-[1] stroke-dasharray-[3,3]" />
            <text x="26" y="106" className="fill-amber-700 dark:fill-amber-300 font-bold text-[8px]">WAIST</text>

            {/* Hip Line (y=138) */}
            <line x1="25" y1="138" x2="135" y2="138" className="stroke-indigo-600 dark:stroke-indigo-400 stroke-[1] stroke-dasharray-[3,3]" />
            <text x="26" y="134" className="fill-indigo-700 dark:fill-indigo-300 font-bold text-[8px]">HIPS</text>

            {/* Hem Line (y=230) */}
            <line x1="25" y1="230" x2="135" y2="230" className="stroke-rose-600 dark:stroke-rose-400 stroke-[1] stroke-dasharray-[3,3]" />
            <text x="26" y="226" className="fill-rose-700 dark:fill-rose-300 font-bold text-[8px]">HEM</text>
          </g>
        )}
      </svg>

      {/* Angle Badge */}
      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#0D3B36]/80 text-amber-300 text-[9px] font-black uppercase tracking-widest backdrop-blur-xs">
        {viewAngle} View
      </span>
    </div>
  );
};

/* =========================================================
   Real-Data Measurement Extractor & Yardage Engine
   ========================================================= */
export function extractClientMeasurementValues(client: Client) {
  const m = client.measurements || {};
  const cm = m.customMeasurements || {};

  const findVal = (...keys: string[]) => {
    for (const k of keys) {
      if (m[k] && m[k] !== '0.0"' && m[k] !== '0' && m[k] !== '—') return String(m[k]);
      if (cm[k] && cm[k] !== '0.0"' && cm[k] !== '0' && cm[k] !== '—') return String(cm[k]);
    }
    return '';
  };

  const lengthStr = findVal('fullLength', 'dressLength', 'gownLength', 'kaftanLength', 'topLength', 'skirtLength', 'trouserLength', 'length', 'Length', 'Full Length', 'Dress Length');
  const bustStr = findVal('bustOrChest', 'bust', 'chest', 'Bust', 'Chest', 'Bust/Chest');
  const waistStr = findVal('waist', 'Waist');
  const hipsStr = findVal('hips', 'Hips');
  const shoulderStr = findVal('shoulderWidth', 'shoulder', 'Shoulder');
  const sleeveStr = findVal('sleeveLength', 'Sleeve', 'Sleeve Length');

  const parseNum = (val?: string) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const length = parseNum(lengthStr);
  const bust = parseNum(bustStr);
  const waist = parseNum(waistStr);
  const hips = parseNum(hipsStr);
  const shoulder = parseNum(shoulderStr);
  const sleeve = parseNum(sleeveStr);

  return {
    length,
    bust,
    waist,
    hips,
    shoulder,
    sleeve,
    rawLengthStr: length ? `${length}"` : null,
    rawBustStr: bust ? `${bust}"` : null,
    rawWaistStr: waist ? `${waist}"` : null,
    rawHipsStr: hips ? `${hips}"` : null,
    rawSleeveStr: sleeve ? `${sleeve}"` : null,
    hasRealData: length > 0 || bust > 0 || hips > 0
  };
}

export function calculateFabricYardage(
  garmentType: string,
  boltWidth: string,
  measurements: { length: number; bust: number; waist: number; hips: number; sleeve: number }
) {
  const type = (garmentType || '').toLowerCase();
  const width = (boltWidth || '').toLowerCase();

  let widthMult = 1.0;
  let widthLabel = '60" Bolt';
  if (width.includes('45')) {
    widthMult = 1.38;
    widthLabel = '45" Narrow Bolt';
  } else if (width.includes('72')) {
    widthMult = 0.85;
    widthLabel = '72" Wide Bolt';
  }

  const baseLength = measurements.length > 0 ? measurements.length : 44;
  const sleeveLen = measurements.sleeve > 0 ? measurements.sleeve : 22;
  const isRealData = measurements.length > 0;

  let baseInches = 0;
  let liningRatio = 0.8;
  let interfacingYards = 0.5;
  let typeLabel = garmentType || 'Straight Dress';

  if (type.includes('gown') || type.includes('evening') || type.includes('maxi') || type.includes('ball') || type.includes('wedding')) {
    baseInches = baseLength * 2.4 + 16;
    liningRatio = 1.0;
    interfacingYards = 0.75;
    typeLabel = 'Evening / Flared Gown';
  } else if (type.includes('kaftan') || type.includes('boubou') || type.includes('agbada') || type.includes('robe') || type.includes('smock') || type.includes('fugu')) {
    baseInches = baseLength * 2.2 + sleeveLen + 10;
    liningRatio = 0.5;
    interfacingYards = 0.5;
    typeLabel = 'Kaftan / Boubou / Agbada';
  } else if (type.includes('suit') || type.includes('blazer') || type.includes('jacket') || type.includes('tuxedo') || type.includes('senator')) {
    const trouserLen = baseLength > 30 ? baseLength : 40;
    baseInches = 30 + trouserLen + sleeveLen + 14;
    liningRatio = 1.0;
    interfacingYards = 1.25;
    typeLabel = 'Tailored Suit / Senator Wear';
  } else if (type.includes('skirt') || type.includes('two piece') || type.includes('top &') || type.includes('slit') || type.includes('kaba')) {
    baseInches = baseLength * 1.6 + 14;
    liningRatio = 0.8;
    interfacingYards = 0.5;
    typeLabel = 'Skirt & Blouse (Slit & Kaba)';
  } else if (type.includes('corset') || type.includes('pants') || type.includes('trouser') || type.includes('jumpsuit')) {
    baseInches = baseLength * 1.5 + 12;
    liningRatio = 0.7;
    interfacingYards = 0.75;
    typeLabel = 'Corset / Trousers / Jumpsuit';
  } else {
    baseInches = baseLength + sleeveLen + 10;
    liningRatio = 0.8;
    interfacingYards = 0.5;
    typeLabel = garmentType || 'Custom Garment';
  }

  const totalInches = baseInches * widthMult;
  const rawYards = totalInches / 36;
  const mainYards = Math.max(1.5, Math.ceil(rawYards * 4) / 4);
  const liningYards = Math.max(1.0, Math.ceil(mainYards * liningRatio * 4) / 4);

  const formulaNote = isRealData
    ? `Calculated from client length (${baseLength}") on ${widthLabel} for ${typeLabel}`
    : `Estimated baseline (44" length) on ${widthLabel} for ${typeLabel}`;

  return {
    mainYards,
    liningYards,
    interfacingYards,
    formulaNote,
    isBasedOnRealData: isRealData
  };
}

/* =========================================================
   Main SpecSheetModal Component
   ========================================================= */
export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  client,
  studioSettings,
  onClose,
  onSaveSpecSheet
}) => {
  const clientMeasures = extractClientMeasurementValues(client);

  const getInitialGarments = (): SpecSheetGarment[] => {
    if (client.specSheetGarments && Array.isArray(client.specSheetGarments) && client.specSheetGarments.length > 0) {
      return client.specSheetGarments;
    }
    const cached = storageService.getItemSync<SpecSheetGarment[]>(`tailor_spec_sheets_${client.id}`, null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    return [
      {
        id: `g-${Date.now()}`,
        garmentType: client.garmentTag || 'Straight Dress',
        fabricBoltWidth: '60 Inches Width',
        fabricPhotos: [],
        notes: client.notes || '',
        yardsNeeded: calculateFabricYardage(
          client.garmentTag || 'Straight Dress',
          '60 Inches Width',
          clientMeasures
        ).mainYards
      }
    ];
  };

  const [garments, setGarments] = useState<SpecSheetGarment[]>(getInitialGarments);
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isFullMeasurementsOpen, setIsFullMeasurementsOpen] = useState(false);
  const [croquisAngles, setCroquisAngles] = useState<{ [key: string]: 'front' | 'back' }>({});
  const [showGuideLines, setShowGuideLines] = useState(true);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Common Tailor Specification Quick Chips
  const quickSpecs = [
    'Concealed Zipper',
    'Bust Darts',
    'Full Satin Lining',
    'Inseam Pockets',
    'High Collar',
    'Off-Shoulder',
    'Side Slit',
    'Horsehair Hemline',
    'Interfacing Stabilized',
    'French Seams'
  ];

  // Overview Summary Totals across all garments in the order
  const summaryTotals = useMemo(() => {
    let totalMainYards = 0;
    let totalLiningYards = 0;
    let totalInterfacingYards = 0;
    let totalPhotos = 0;

    garments.forEach((g) => {
      const autoYards = calculateFabricYardage(
        g.garmentType || 'Straight Dress',
        g.fabricBoltWidth || '60 Inches Width',
        clientMeasures
      );
      const main = g.yardsNeeded !== undefined ? g.yardsNeeded : autoYards.mainYards;
      totalMainYards += main;
      totalLiningYards += (g.liningYards !== undefined ? g.liningYards : autoYards.liningYards);
      totalInterfacingYards += (g.interfacingYards !== undefined ? g.interfacingYards : autoYards.interfacingYards);
      totalPhotos += (g.fabricPhotos?.length || 0);
    });

    return {
      totalMainYards: Math.round(totalMainYards * 100) / 100,
      totalLiningYards: Math.round(totalLiningYards * 100) / 100,
      totalInterfacingYards: Math.round(totalInterfacingYards * 100) / 100,
      totalPhotos
    };
  }, [garments, clientMeasures]);

  const handleUpdateGarment = (index: number, updated: Partial<SpecSheetGarment>) => {
    setGarments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleAddGarment = (initialStyle: string = '') => {
    const styleName = initialStyle.trim() || 'Straight Dress';
    const defaultYards = calculateFabricYardage(
      styleName,
      '60 Inches Width',
      clientMeasures
    ).mainYards;

    const newG: SpecSheetGarment = {
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      garmentType: styleName,
      fabricBoltWidth: '60 Inches Width',
      fabricPhotos: [],
      notes: '',
      yardsNeeded: defaultYards
    };
    setGarments((prev) => {
      const updated = [...prev, newG];
      // Switch active tab to the newly added garment
      setActiveTab(updated.length - 1);
      return updated;
    });
  };

  const handleAdjustYards = (index: number, delta: number, currentAutoYards: number) => {
    const current = garments[index].yardsNeeded !== undefined ? garments[index].yardsNeeded! : currentAutoYards;
    const nextVal = Math.max(0.5, Math.round((current + delta) * 100) / 100);
    handleUpdateGarment(index, { yardsNeeded: nextVal });
  };

  const handleResetYards = (index: number, currentAutoYards: number) => {
    handleUpdateGarment(index, { yardsNeeded: currentAutoYards });
  };

  const handleRemoveGarment = (index: number) => {
    if (garments.length <= 1) return;
    setGarments((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof activeTab === 'number') {
        if (activeTab >= updated.length) {
          setActiveTab(Math.max(0, updated.length - 1));
        }
      }
      return updated;
    });
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

  const handleRemoveFabricPhoto = (garmentIdx: number, photoIdx: number) => {
    setGarments((prev) => {
      const next = [...prev];
      const updatedPhotos = next[garmentIdx].fabricPhotos.filter((_, pIdx) => pIdx !== photoIdx);
      next[garmentIdx] = { ...next[garmentIdx], fabricPhotos: updatedPhotos };
      return next;
    });
  };

  const handleToggleQuickSpec = (index: number, specTag: string) => {
    const currentNotes = garments[index].notes || '';
    if (currentNotes.includes(specTag)) {
      const updatedNotes = currentNotes
        .replace(new RegExp(`• ${specTag}\n?`, 'g'), '')
        .replace(new RegExp(specTag, 'g'), '')
        .trim();
      handleUpdateGarment(index, { notes: updatedNotes });
    } else {
      const updatedNotes = currentNotes ? `${currentNotes}\n• ${specTag}` : `• ${specTag}`;
      handleUpdateGarment(index, { notes: updatedNotes });
    }
  };

  const toggleAngle = (id: string) => {
    setCroquisAngles((prev) => ({
      ...prev,
      [id]: prev[id] === 'back' ? 'front' : 'back'
    }));
  };

  const handleConfirm = () => {
    storageService.setItem(`tailor_spec_sheets_${client.id}`, garments);
    if (onSaveSpecSheet) {
      onSaveSpecSheet(client.id, garments);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const displayedGarments = activeTab === 'all'
    ? garments.map((g, idx) => ({ garment: g, originalIndex: idx }))
    : garments[activeTab]
    ? [{ garment: garments[activeTab], originalIndex: activeTab }]
    : garments.map((g, idx) => ({ garment: g, originalIndex: idx }));

  return (
    <div className="fixed inset-0 z-[80] bg-[#EDF4F1] dark:bg-[#061E1B] overflow-y-auto flex flex-col font-['Plus_Jakarta_Sans',sans-serif] animate-fade-in">
      
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#EDF4F1]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-2.5 sm:px-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:pt-4 pb-3 flex items-center justify-between gap-2 shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-[#0D3B36] dark:text-[#DCA134] font-['Outfit'] font-black text-xs sm:text-sm transition-transform active:scale-95 py-1.5 px-3 sm:px-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>Back</span>
        </button>

        <div className="text-center space-y-0.5 min-w-0 flex-1 px-1">
          <h1 className="font-['Outfit'] font-black text-xs xs:text-sm sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase truncate">
            Atelier Spec Sheet
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
            Client: <span className="font-extrabold text-[#0D3B36] dark:text-slate-200">{client.name}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-['Outfit'] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
        >
          <span className="hidden xs:inline">Confirm & Save</span>
          <span className="xs:hidden">Save</span>
        </button>
      </div>

      {savedNotice && (
        <div className="mx-3 sm:mx-4 mt-2.5 p-3 rounded-2xl bg-[#0D3B36] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xl border border-emerald-400/40 animate-bounce text-center">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All garment spec details saved to client order records!</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-2xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-5 pb-24">
        
        {/* =====================================================
            1. MULTI-GARMENT OVERVIEW SUMMARY DASHBOARD
           ===================================================== */}
        <div className="rounded-[30px] p-5 sm:p-6 bg-gradient-to-br from-[#0D3B36] via-[#092825] to-[#061E1B] text-white shadow-xl border border-amber-400/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-['Outfit'] font-black text-sm sm:text-base text-amber-300 uppercase tracking-wide">
                  Order Production Overview
                </h2>
                <p className="text-[11px] font-semibold text-emerald-200/80">
                  Total of <strong className="text-white">{garments.length} Garment{garments.length > 1 ? 's' : ''}</strong> in this client order
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFullMeasurementsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white font-extrabold text-[11px] border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Full Measurements</span>
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-emerald-200/80 uppercase">Total Garments</span>
              <span className="font-['Outfit'] font-black text-xl text-amber-300 mt-1">{garments.length}</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-emerald-200/80 uppercase">Main Fabric</span>
              <span className="font-['Outfit'] font-black text-xl text-white mt-1">{summaryTotals.totalMainYards} <span className="text-xs text-amber-300 font-bold">Yds</span></span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-emerald-200/80 uppercase">Est. Lining</span>
              <span className="font-['Outfit'] font-black text-xl text-emerald-300 mt-1">{summaryTotals.totalLiningYards} <span className="text-xs text-emerald-200 font-bold">Yds</span></span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-emerald-200/80 uppercase">Fabric Swatches</span>
              <span className="font-['Outfit'] font-black text-xl text-indigo-300 mt-1">{summaryTotals.totalPhotos}</span>
            </div>
          </div>

          {/* Real Client Measurement Key Metrics Pill */}
          <div className="bg-[#041916]/80 rounded-2xl p-2.5 border border-emerald-500/20 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-100 flex-wrap">
              <span>Length: <strong className="text-amber-300">{clientMeasures.rawLengthStr || '44" (Std)'}</strong></span>
              <span>•</span>
              <span>Bust: <strong className="text-amber-300">{clientMeasures.rawBustStr || '—'}</strong></span>
              <span>•</span>
              <span>Waist: <strong className="text-amber-300">{clientMeasures.rawWaistStr || '—'}</strong></span>
              <span>•</span>
              <span>Hips: <strong className="text-amber-300">{clientMeasures.rawHipsStr || '—'}</strong></span>
            </div>
            {clientMeasures.hasRealData ? (
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live CAD Data
              </span>
            ) : (
              <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Baseline Estimates
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            2. GARMENT TABS NAVIGATION BAR
           ===================================================== */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-['Outfit'] font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#0D3B36] text-amber-300 dark:bg-amber-400 dark:text-[#0D3B36] shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All Garments ({garments.length})
            </button>

            {garments.map((g, idx) => (
              <button
                key={g.id || idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-['Outfit'] font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === idx
                    ? 'bg-[#0D3B36] text-amber-300 dark:bg-amber-400 dark:text-[#0D3B36] shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>#{idx + 1}: {g.garmentType || 'Garment'}</span>
                {g.fabricPhotos && g.fabricPhotos.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Has fabric photos" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddGarment}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-dashed border-[#0D3B36]/50 dark:border-amber-400/50 hover:bg-[#EBF5F0] dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 font-['Outfit'] font-black text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
            title="Add Garment Spec"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Garment</span>
          </button>
        </div>

        {/* =====================================================
            3. GARMENT TECHNICAL SPEC CARDS
           ===================================================== */}
        {displayedGarments.map(({ garment: g, originalIndex: idx }) => {
          const angle = croquisAngles[g.id] || 'front';
          const autoYardage = calculateFabricYardage(
            g.garmentType || 'Straight Dress',
            g.fabricBoltWidth || '60 Inches Width',
            clientMeasures
          );
          const currentYards = g.yardsNeeded !== undefined ? g.yardsNeeded : autoYardage.mainYards;

          return (
            <div
              key={g.id || idx}
              className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[36px] p-5 sm:p-6 border border-white dark:border-white/10 shadow-xl space-y-5 relative"
            >
              {/* Card Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] font-['Outfit'] font-black text-sm flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-black text-slate-900 dark:text-slate-100 text-base uppercase">
                      Garment #{idx + 1}: {g.garmentType || 'Straight Dress'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Technical Spec & Fabric Requirement
                    </p>
                  </div>
                </div>

                {garments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGarment(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                    title="Remove Garment from Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Modern Visual Croquis Spec Container */}
              <div className="bg-gradient-to-b from-[#F3F9F6] to-[#EBF5F0] dark:from-[#061E1B] dark:to-[#082824] rounded-[28px] p-5 border border-emerald-900/10 dark:border-slate-700/80 flex flex-col items-center justify-center gap-3 relative shadow-inner">
                
                {/* Header Controls for Croquis */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                    <span className="text-[11px] font-black text-[#0D3B36] dark:text-amber-300 uppercase tracking-wider">
                      CAD VISUAL CROQUIS BLUEPRINT
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowGuideLines(!showGuideLines)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        showGuideLines
                          ? 'bg-[#0D3B36] text-amber-300 dark:bg-amber-400 dark:text-[#0D3B36]'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {showGuideLines ? 'Guides On' : 'Guides Off'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAngle(g.id)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0D3B36] dark:text-slate-200 text-[10px] font-bold shadow-2xs hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{angle === 'front' ? 'Back View' : 'Front View'}</span>
                    </button>
                  </div>
                </div>

                {/* Render Realistic Human Croquis Vector */}
                <div className="w-full h-64 py-2">
                  <ModernHumanCroquis
                    garmentType={g.garmentType || 'Straight Dress'}
                    viewAngle={angle}
                    showGuideLines={showGuideLines}
                  />
                </div>

                {/* Garment Type Label Chip */}
                <div className="pt-1 flex items-center justify-center">
                  <span className="px-4 py-1.5 rounded-full bg-[#0D3B36] text-amber-300 dark:bg-amber-400 dark:text-[#0D3B36] font-['Outfit'] font-black text-xs tracking-widest uppercase shadow-xs">
                    ✂️ {g.garmentType || 'Straight Dress'}
                  </span>
                </div>
              </div>

              {/* Garment Style & Category Input with Direct Custom Typing & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    GARMENT TYPE / BESPOKE STYLE TO DESIGN <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold hidden xs:inline">
                    Type custom design or tap presets
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={g.garmentType || ''}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newAutoYards = calculateFabricYardage(
                        newType,
                        g.fabricBoltWidth || '60 Inches Width',
                        clientMeasures
                      ).mainYards;
                      handleUpdateGarment(idx, {
                        garmentType: newType,
                        yardsNeeded: g.yardsNeeded === undefined || g.yardsNeeded === autoYardage.mainYards ? newAutoYards : g.yardsNeeded
                      });
                    }}
                    placeholder="Enter style (e.g. Kente Corset Gown, Senator Wear, Agbada...)"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#EBF5F0]/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-black text-[#0D3B36] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-2xs"
                  />
                </div>

                {/* Popular Style Selection Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Quick Style Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GARMENT_STYLES.map((style) => {
                      const isSelected = (g.garmentType || '').toLowerCase() === style.toLowerCase();
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            const newAutoYards = calculateFabricYardage(
                              style,
                              g.fabricBoltWidth || '60 Inches Width',
                              clientMeasures
                            ).mainYards;
                            handleUpdateGarment(idx, {
                              garmentType: style,
                              yardsNeeded: g.yardsNeeded === undefined || g.yardsNeeded === autoYardage.mainYards ? newAutoYards : g.yardsNeeded
                            });
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-extrabold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0D3B36] text-amber-300 border-[#0D3B36] dark:bg-amber-400 dark:text-[#0D3B36] shadow-xs scale-105'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-[#EBF5F0]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{style}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fabric Bolt Width Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  FABRIC BOLT WIDTH
                </label>
                <select
                  value={g.fabricBoltWidth || '60 Inches Width'}
                  onChange={(e) => handleUpdateGarment(idx, { fabricBoltWidth: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#EBF5F0]/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-[#0D3B36] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 cursor-pointer"
                >
                  <option value="60 Inches Width">60 Inches Width (Standard Tailor Bolt)</option>
                  <option value="45 Inches Width">45 Inches Width (Narrow African Print/Lace)</option>
                  <option value="72 Inches Width">72 Inches Width (Extra Wide Curtain/Brocade)</option>
                </select>
              </div>

              {/* Fabric Photos Section */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  FABRIC PHOTOS & PATTERN SAMPLES ({g.fabricPhotos.length})
                </label>

                {g.fabricPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mb-2">
                    {g.fabricPhotos.map((photoUrl, pIdx) => (
                      <div key={pIdx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#0D3B36]/20 shadow-md">
                        <img
                          src={photoUrl}
                          alt="Fabric Spec Photo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoUrl(photoUrl)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Zoom Photo"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFabricPhoto(idx, pIdx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs hover:bg-rose-700 cursor-pointer"
                          title="Delete Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#0D3B36]/30 dark:border-slate-700 hover:border-[#0D3B36] bg-[#EBF5F0]/40 dark:bg-slate-800/60 font-black text-[#0D3B36] dark:text-slate-200 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                  <Upload className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
                  <span>Upload Fabric Photo / Swatch</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAddFabricPhoto(idx, e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Automated Fabric Yardage & Atelier Material Requirement Engine */}
              <div className="rounded-[28px] p-4 sm:p-5 space-y-3.5 bg-gradient-to-br from-[#0D3B36] via-[#092825] to-[#061E1B] text-white shadow-xl border border-amber-400/40 relative overflow-hidden">
                {/* Header Title & Status Badge */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-300 tracking-wider uppercase block leading-none">
                        FABRIC YARDAGE & MATERIAL ENGINE
                      </span>
                      <span className="text-[10px] text-emerald-200/70 font-semibold block mt-0.5">
                        {autoYardage.formulaNote}
                      </span>
                    </div>
                  </div>

                  {clientMeasures.hasRealData ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Real Client Measurements</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsFullMeasurementsOpen(true)}
                      className="px-2.5 py-0.5 rounded-full bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-300" />
                      <span>+ Record Measurements</span>
                    </button>
                  )}
                </div>

                {/* Yardage Display & Quick Adjustment Controls */}
                <div className="py-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                  <div className="text-center sm:text-left space-y-0.5">
                    <span className="text-[10px] font-extrabold text-amber-200/80 uppercase tracking-widest block">
                      ESTIMATED MAIN FABRIC REQUIRED
                    </span>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                      <span className="font-['Outfit'] font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-md">
                        {currentYards}
                      </span>
                      <span className="font-black text-sm text-white uppercase tracking-wider">
                        Yards ({g.fabricBoltWidth || '60" Bolt'})
                      </span>
                    </div>
                  </div>

                  {/* Adjuster Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAdjustYards(idx, -0.25, autoYardage.mainYards)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
                      title="Decrease by 0.25 Yards"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustYards(idx, 0.25, autoYardage.mainYards)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
                      title="Increase by 0.25 Yards"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {g.yardsNeeded !== undefined && g.yardsNeeded !== autoYardage.mainYards && (
                      <button
                        type="button"
                        onClick={() => handleResetYards(idx, autoYardage.mainYards)}
                        className="px-2 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[10px] border border-amber-400/40 flex items-center gap-1 transition-all cursor-pointer ml-1"
                        title="Reset to Auto Yardage"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Atelier Material Requirement Breakdown Cards */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-black/20 border border-emerald-500/20">
                    <span className="text-[9px] font-extrabold text-emerald-200 uppercase block">Main Fabric</span>
                    <span className="font-['Outfit'] font-black text-sm text-amber-300">{currentYards} Yds</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-emerald-500/20">
                    <span className="text-[9px] font-extrabold text-emerald-200 uppercase block">Est. Lining</span>
                    <span className="font-['Outfit'] font-black text-sm text-emerald-300">{autoYardage.liningYards} Yds</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-emerald-500/20">
                    <span className="text-[9px] font-extrabold text-emerald-200 uppercase block">Interfacing</span>
                    <span className="font-['Outfit'] font-black text-sm text-indigo-300">{autoYardage.interfacingYards} Yds</span>
                  </div>
                </div>
              </div>

              {/* Pattern Notes & Sewing Specs */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  PATTERN NOTES & SEWING SPECS
                </label>

                {/* Quick Spec Chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {quickSpecs.map((tag) => {
                    const isSelected = (g.notes || '').includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleQuickSpec(idx, tag)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D3B36] text-amber-300 dark:bg-amber-400 dark:text-[#0D3B36] shadow-xs'
                            : 'bg-[#EBF5F0] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[#E2F0EA]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={3}
                  value={g.notes || ''}
                  onChange={(e) => handleUpdateGarment(idx, { notes: e.target.value })}
                  placeholder="Enter custom pattern alterations, seam finish instructions, embellishment notes..."
                  className="w-full p-3.5 rounded-2xl bg-[#EBF5F0]/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 resize-none"
                />

                {/* View Detailed Blueprint Button */}
                <button
                  type="button"
                  onClick={() => setIsFullMeasurementsOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-[#0D3B36] to-emerald-800 hover:from-emerald-800 hover:to-[#082824] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-500/30 cursor-pointer uppercase tracking-wider"
                >
                  <Ruler className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>View All Measurements ({client.name})</span>
                </button>
              </div>

            </div>
          );
        })}

        {/* Add Another Garment Button */}
        <button
          type="button"
          onClick={() => handleAddGarment('')}
          className="w-full py-3.5 sm:py-4 rounded-3xl border-2 border-dashed border-[#0D3B36]/30 dark:border-slate-700 hover:border-[#0D3B36] bg-white/90 dark:bg-slate-800/80 font-['Outfit'] font-black text-[#0D3B36] dark:text-slate-100 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D3B36] dark:text-amber-300" />
          <span>Add Another Garment Spec to Order</span>
        </button>

      </div>

      {/* Full Measurements Modal Component */}
      <FullMeasurementsModal
        isOpen={isFullMeasurementsOpen}
        onClose={() => setIsFullMeasurementsOpen(false)}
        client={client}
        studioSettings={studioSettings}
      />

      {/* Photo Preview Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl p-4 overflow-hidden border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhotoUrl} alt="Fabric Spec Large Preview" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
