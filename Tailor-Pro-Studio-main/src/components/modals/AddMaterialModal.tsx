import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Scissors,
  Shirt,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Tag,
  Hash,
  Ruler,
  Layers
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMaterial: (newItem: InventoryItem) => void;
}

type MaterialCategory = InventoryItem['category'];

interface CategoryConfig {
  id: MaterialCategory;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  defaultUnit: string;
  accentColor: string;
  darkAccent: string;
  badgeBg: string;
  presets: { name: string; unit: string; stock: number; min: number; supplier?: string }[];
}

const CATEGORY_CONFIGS: Record<MaterialCategory, CategoryConfig> = {
  FABRIC: {
    id: 'FABRIC',
    label: 'Fabric & Textiles',
    sublabel: 'Vlisco, Lace, Silk, Lining',
    icon: Shirt,
    defaultUnit: 'Yards',
    accentColor: 'from-emerald-600 to-teal-700',
    darkAccent: 'from-emerald-700 to-teal-900',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    presets: [
      { name: 'Vlisco Premium Silk Lining', unit: 'Yards', stock: 25, min: 5, supplier: 'Makola Fabrics Hub' },
      { name: 'Kente Patterned Wax Cloth', unit: 'Yards', stock: 18, min: 6, supplier: 'Kumasi Cultural Depot' },
      { name: 'French Embroidered Lace', unit: 'Yards', stock: 12, min: 4, supplier: 'Accra Textile Mart' },
      { name: 'Organza Sheer Satin', unit: 'Yards', stock: 30, min: 10, supplier: 'Kejetia Fabrics' }
    ]
  },
  THREAD: {
    id: 'THREAD',
    label: 'Threads & Spools',
    sublabel: 'Gutermann, Overlock, Cotton',
    icon: Scissors,
    defaultUnit: 'Spools',
    accentColor: 'from-amber-500 to-yellow-600',
    darkAccent: 'from-amber-600 to-yellow-800',
    badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    presets: [
      { name: 'Gutermann Heavy Duty Gold #40', unit: 'Spools', stock: 15, min: 5, supplier: 'Singer Ghana' },
      { name: 'Coats Cotton White All-Purpose', unit: 'Spools', stock: 40, min: 10, supplier: 'Atelier Central Store' },
      { name: 'Overlock 4-Cone Polyester Black', unit: 'Boxes', stock: 8, min: 2, supplier: 'Singer Ghana' }
    ]
  },
  NEEDLES: {
    id: 'NEEDLES',
    label: 'Needles & Pins',
    sublabel: 'Singer Machine, Hand Pins',
    icon: Sparkles,
    defaultUnit: 'Boxes',
    accentColor: 'from-sky-500 to-blue-600',
    darkAccent: 'from-sky-600 to-blue-800',
    badgeBg: 'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    presets: [
      { name: 'Singer Ballpoint Machine Needles #14', unit: 'Boxes', stock: 10, min: 3, supplier: 'Needle & Craft Depot' },
      { name: 'Organ Heavy Leather Needles #16', unit: 'Boxes', stock: 5, min: 2, supplier: 'Singer Ghana' },
      { name: 'Glass Head Tailor Pins (1000pc)', unit: 'Boxes', stock: 6, min: 2, supplier: 'Makola Notions' }
    ]
  },
  TRIMS: {
    id: 'TRIMS',
    label: 'Trims & Closures',
    sublabel: 'Zippers, Buttons, Lace Edge',
    icon: Tag,
    defaultUnit: 'Pieces',
    accentColor: 'from-rose-500 to-pink-600',
    darkAccent: 'from-rose-600 to-pink-800',
    badgeBg: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    presets: [
      { name: 'YKK Heavy Duty Brass Zipper #5 (24")', unit: 'Pieces', stock: 50, min: 15, supplier: 'YKK Ghana' },
      { name: 'Pearl Gown Buttons (12mm)', unit: 'Pieces', stock: 200, min: 50, supplier: 'Notion World' },
      { name: 'Metallic Gold Braided Trim', unit: 'Yards', stock: 35, min: 10, supplier: 'Accra Trims Outlet' }
    ]
  },
  ACCESSORIES: {
    id: 'ACCESSORIES',
    label: 'Tools & Notions',
    sublabel: 'Chalk, Fusible Tape, Interfacing',
    icon: Layers,
    defaultUnit: 'Pieces',
    accentColor: 'from-purple-500 to-indigo-600',
    darkAccent: 'from-purple-600 to-indigo-800',
    badgeBg: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    presets: [
      { name: 'Taylor Triangular Fabric Chalk White', unit: 'Boxes', stock: 12, min: 4, supplier: 'Atelier Notions' },
      { name: 'Non-Woven Fusible Interfacing', unit: 'Yards', stock: 45, min: 10, supplier: 'Kejetia Interfacing' },
      { name: 'Iron-On Hemming Tape (50m)', unit: 'Rolls', stock: 10, min: 3, supplier: 'Makola Notions' }
    ]
  }
};

const COMMON_UNITS = ['Yards', 'Pieces', 'Spools', 'Boxes', 'Rolls', 'Meters', 'Sets'];

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSaveMaterial
}) => {
  const [category, setCategory] = useState<MaterialCategory>('FABRIC');
  const [name, setName] = useState('');
  const [stockLevel, setStockLevel] = useState<number | ''>(15);
  const [minThreshold, setMinThreshold] = useState<number | ''>(5);
  const [unit, setUnit] = useState('Yards');
  const [supplier, setSupplier] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  if (!isOpen) return null;

  const currentConfig = CATEGORY_CONFIGS[category];
  const activeStock = Number(stockLevel) || 0;
  const activeMin = Number(minThreshold) || 0;
  const isLowStock = activeStock <= activeMin;

  const handleCategoryChange = (cat: MaterialCategory) => {
    setCategory(cat);
    const cfg = CATEGORY_CONFIGS[cat];
    setUnit(cfg.defaultUnit);
    setIsCustomUnit(false);
  };

  const handleApplyPreset = (preset: typeof currentConfig.presets[0]) => {
    setName(preset.name);
    setUnit(preset.unit);
    setStockLevel(preset.stock);
    setMinThreshold(preset.min);
    if (preset.supplier) setSupplier(preset.supplier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStock = Number(stockLevel) || 0;
    const finalMin = Number(minThreshold) || 0;

    onSaveMaterial({
      id: `inv-${Date.now()}`,
      name: name.trim() || `${currentConfig.label} Item`,
      category,
      stockLevel: finalStock,
      minThreshold: finalMin,
      alertThreshold: finalMin,
      unit: unit.trim() || currentConfig.defaultUnit,
      supplier: supplier.trim() || undefined,
      status: finalStock <= finalMin ? 'Low Stock' : 'In Stock'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pt-10 sm:pt-12 pb-6 sm:pb-8 overflow-y-auto font-['Outfit'] animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-[#061E1B] rounded-[32px] sm:rounded-[36px] shadow-2xl border border-white/80 dark:border-white/10 my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Modal Decorative Header Bar */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${currentConfig.accentColor} dark:${currentConfig.darkAccent} text-white relative shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-black/25 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  ATELIER INVENTORY MANAGEMENT
                </span>
              </div>
              <h2 className="font-extrabold text-lg sm:text-2xl text-white tracking-tight leading-tight mt-0.5">
                Add New Studio Material
              </h2>
              <p className="text-[11px] sm:text-xs text-white/80 font-medium">
                Register fabrics, spools, trims, and tools into workshop inventory
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 custom-scrollbar text-xs">
          
          {/* STEP 1: Select Category Grid */}
          <div>
            <label className="block font-black text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider text-[11px]">
              1. Select Material Category
            </label>

            <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5 sm:gap-2">
              {(Object.keys(CATEGORY_CONFIGS) as MaterialCategory[]).map((catKey) => {
                const cfg = CATEGORY_CONFIGS[catKey];
                const Icon = cfg.icon;
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryChange(catKey)}
                    className={`p-2 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] border-[#0D3B36] dark:border-amber-400 shadow-md scale-[1.02] ring-2 ring-[#0D3B36]/20 dark:ring-amber-400/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-amber-300 dark:bg-[#0D3B36]/20 dark:text-[#0D3B36]' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 dark:text-[#0D3B36]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[11px] sm:text-xs leading-tight truncate">{cfg.label}</div>
                      <div className={`text-[9px] sm:text-[10px] font-medium truncate ${isSelected ? 'text-white/80 dark:text-[#0D3B36]/80' : 'text-slate-400 dark:text-slate-400'}`}>
                        {cfg.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/30">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-extrabold text-[11px] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#DCA134]" />
              <span>Quick Atelier Presets ({currentConfig.label}):</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {currentConfig.presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[10px] whitespace-nowrap shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3 h-3 text-[#DCA134]" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Item Name & Supplier */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Material Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`e.g. ${currentConfig.presets[0]?.name || 'Sawing Needles / Vlisco Lining'}`}
                  className="w-full pl-3.5 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs flex items-center justify-between">
                <span>Supplier / Source (Optional)</span>
                <span className="text-[10px] font-medium text-slate-400">Vendor Hub</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Makola Market Textile Hub / Singer Ghana"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Stock Quantity & Unit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Initial Stock Quantity *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  required
                  value={stockLevel}
                  onChange={(e) => setStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 font-extrabold text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Unit of Measure *
              </label>
              {!isCustomUnit ? (
                <div className="space-y-1.5">
                  <select
                    value={unit}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomUnit(true);
                        setUnit('');
                      } else {
                        setUnit(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Unit...</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Pack, Meter, Bundle"
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomUnit(false)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] shrink-0"
                  >
                    Select
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Unit Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Quick Units:</span>
            {COMMON_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  setUnit(u);
                  setIsCustomUnit(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  unit === u
                    ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] border-[#0D3B36] dark:border-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* STEP 4: Low Stock Alert Threshold */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low Stock Alert Threshold</span>
              </label>
              <span className="font-black text-xs text-[#0D3B36] dark:text-amber-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
                &lt;= {activeMin} {unit}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              The studio will display a warning alert when stock drops to or below this amount.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="1"
                max="50"
                value={activeMin}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full accent-[#0D3B36] dark:accent-amber-400 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-extrabold text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* LIVE ATELIER INVENTORY CARD PREVIEW */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Live Atelier Card Preview
            </span>

            <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#092825] border border-slate-300 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D3B36] dark:bg-[#12423D] text-amber-300 flex items-center justify-center font-bold shrink-0">
                  <Package className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {name.trim() || `${currentConfig.label} Item`}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Alert at &lt;= {activeMin} {unit} • {supplier || 'Internal Stock'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  isLowStock
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}>
                  {isLowStock ? 'Low Stock Alert' : 'In Stock'}
                </span>
                <span className="font-black text-xs text-[#0D3B36] dark:text-amber-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {activeStock} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs fab-shadow transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300 dark:text-[#0D3B36]" />
              <span>Save Material to Inventory</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
