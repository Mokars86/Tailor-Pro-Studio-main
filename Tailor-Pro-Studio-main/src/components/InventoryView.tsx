import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Package,
  Palette,
  Search,
  Shirt,
  Scissors,
  Sparkles,
  Tag,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Box,
  ChevronDown,
  ChevronUp,
  Eye,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  items: InventoryItem[];
  onRestockItem: (id: string, amount: number) => void;
  onOpenAddMaterialModal: () => void;
  onOpenFabricScanner?: () => void;
  onRemoveItem?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  FABRIC: Shirt,
  THREAD: Scissors,
  NEEDLES: Sparkles,
  TRIMS: Tag,
  ACCESSORIES: Layers
};

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All Supplies',
  FABRIC: 'Fabrics & Textiles',
  THREAD: 'Threads & Spools',
  NEEDLES: 'Needles & Pins',
  TRIMS: 'Trims & Closures',
  ACCESSORIES: 'Notions & Tools'
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onRestockItem,
  onOpenAddMaterialModal,
  onOpenFabricScanner,
  onRemoveItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isAllMaterialsModalOpen, setIsAllMaterialsModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const unitMatch = item.unit.toLowerCase().includes(q);
        const supplierMatch = item.supplier?.toLowerCase().includes(q) || false;
        const catMatch = item.category.toLowerCase().includes(q);

        if (!nameMatch && !unitMatch && !supplierMatch && !catMatch) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Inventory stats
  const totalCount = items.length;
  const lowStockCount = items.filter((i) => i.stockLevel <= i.minThreshold).length;
  const inStockCount = totalCount - lowStockCount;

  return (
    <div className="space-y-4 sm:space-y-5 my-2 sm:my-4 font-['Outfit'] animate-fade-in max-w-full overflow-hidden px-0.5">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-black text-lg sm:text-2xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-tight">
              FABRIC & MATERIALS INVENTORY
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0D3B36]/10 dark:bg-amber-400/15 text-[#0D3B36] dark:text-amber-300 font-extrabold text-[11px] sm:text-xs border border-[#0D3B36]/20 dark:border-amber-400/30 shrink-0">
              {items.length} Items
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Monitor atelier thread, needles, linings & trim stock with real-time alerts
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenFabricScanner && (
            <button
              type="button"
              onClick={onOpenFabricScanner}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#0D3B36] dark:text-amber-300 border border-[#DCA134] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 text-center truncate"
            >
              <Palette className="w-4 h-4 text-[#DCA134] shrink-0" />
              <span className="truncate">Snap Fabric</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddMaterialModal}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-black flex items-center justify-center gap-1.5 shadow-md fab-shadow transition-all hover:scale-102 active:scale-95 cursor-pointer text-center truncate"
          >
            <Plus className="w-4 h-4 text-amber-300 dark:text-[#0D3B36] shrink-0" />
            <span className="truncate">+ Add Material</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards (Optimized for iPhone SE 375px screens) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-xs">
        {/* Total Supplies */}
        <div className="p-2 sm:p-4 rounded-2xl bg-white dark:bg-[#092825] border border-slate-200 dark:border-white/10 shadow-2xs flex flex-col xs:flex-row items-center gap-1.5 sm:gap-3 text-center xs:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block leading-tight">
              TOTAL SUPPLIES
            </span>
            <span className="font-black text-xs sm:text-lg text-slate-900 dark:text-slate-100 truncate block mt-0.5">
              {totalCount} Items
            </span>
          </div>
        </div>

        {/* In Stock */}
        <div className="p-2 sm:p-4 rounded-2xl bg-white dark:bg-[#092825] border border-slate-200 dark:border-white/10 shadow-2xs flex flex-col xs:flex-row items-center gap-1.5 sm:gap-3 text-center xs:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 dark:text-teal-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block leading-tight">
              IN STOCK
            </span>
            <span className="font-black text-xs sm:text-lg text-teal-700 dark:text-teal-400 truncate block mt-0.5">
              {inStockCount} Good
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-2 sm:p-4 rounded-2xl bg-white dark:bg-[#092825] border border-slate-200 dark:border-white/10 shadow-2xs flex flex-col xs:flex-row items-center gap-1.5 sm:gap-3 text-center xs:text-left">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-bold shrink-0 ${
            lowStockCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          }`}>
            <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400'}`} />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block leading-tight">
              LOW ALERTS
            </span>
            <span className={`font-black text-xs sm:text-lg truncate block mt-0.5 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300'}`}>
              {lowStockCount} Alert{lowStockCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-[#092825] p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material by name, unit, or supplier..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar max-w-full">
          {['ALL', 'FABRIC', 'THREAD', 'NEEDLES', 'TRIMS', 'ACCESSORIES'].map((catKey) => {
            const isSelected = activeCategory === catKey;
            const catCount = catKey === 'ALL' ? items.length : items.filter((i) => i.category === catKey).length;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <span>{CATEGORY_LABELS[catKey] || catKey}</span>
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-white/20 dark:bg-[#0D3B36]/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Inventory Item Cards Grid */}
      {filteredItems.length > 0 ? (() => {
        const hasMoreThanThreeMaterials = filteredItems.length > 3;
        const visibleItems = hasMoreThanThreeMaterials ? filteredItems.slice(0, 3) : filteredItems;

        return (
          <div className="space-y-2.5 sm:space-y-3">
            {visibleItems.map((item) => {
              const Icon = CATEGORY_ICONS[item.category] || Package;
              const isLowStock = item.stockLevel <= item.minThreshold;

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-[#092825] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shadow-2xs hover:border-[#0D3B36]/30 dark:hover:border-amber-400/30 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 border mt-0.5 sm:mt-0 ${
                      isLowStock
                        ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300'
                        : 'bg-[#0D3B36]/10 dark:bg-slate-800 border-[#0D3B36]/20 dark:border-slate-700 text-[#0D3B36] dark:text-amber-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border shrink-0 ${
                          isLowStock
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}>
                          {isLowStock ? '⚠️ Low Stock' : '✓ In Stock'}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span>Category: <strong className="text-slate-700 dark:text-slate-300">{item.category}</strong></span>
                        <span>•</span>
                        <span>Alert at &lt;= {item.minThreshold} {item.unit}</span>
                        {item.supplier && (
                          <>
                            <span>•</span>
                            <span className="text-[#0D3B36] dark:text-amber-300 font-semibold truncate">Vendor: {item.supplier}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Stepper Counter Controls & Actions (Responsive Layout for Mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] sm:hidden font-bold text-slate-400 uppercase tracking-wider">
                      Quantity:
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => onRestockItem(item.id, -1)}
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-90 cursor-pointer"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="px-2.5 sm:px-3.5 font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 whitespace-nowrap min-w-[60px] text-center">
                          {item.stockLevel} {item.unit}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRestockItem(item.id, 1)}
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-90 cursor-pointer"
                          title="Increase Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {onRemoveItem && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${item.name} from inventory?`)) {
                              onRemoveItem(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                          title="Remove Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* View All Materials Footer Action */}
            {hasMoreThanThreeMaterials && (
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#092825] p-3.5 rounded-2xl border border-slate-200 dark:border-amber-400/30 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-amber-200 font-semibold min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/10 border border-[#0D3B36]/20 dark:border-amber-400/30 flex items-center justify-center text-[#0D3B36] dark:text-amber-300 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm truncate">
                      Showing 3 of {filteredItems.length} inventory materials
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-amber-200/70 font-normal block truncate">
                      Click below to open full screen inventory catalog
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllMaterialsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-[#DCA134] dark:hover:bg-[#c9902b] text-white dark:text-[#0D3B36] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>View All Materials ({filteredItems.length})</span>
                </button>
              </div>
            )}
          </div>
        );
      })() : (
        /* Empty State */
        <div className="p-6 sm:p-12 rounded-3xl bg-white dark:bg-[#092825] border border-slate-200 dark:border-white/10 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-amber-500/10 text-[#DCA134] border border-[#DCA134]/30 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-[#DCA134]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              No Inventory Items Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {searchQuery || activeCategory !== 'ALL'
                ? 'No items match your active search or category filters. Try clearing your search.'
                : 'Your inventory catalog is currently empty. Click below to add your first fabric, thread, or trim item.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddMaterialModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Material Supply</span>
          </button>
        </div>
      )}

      {/* Dedicated Full-Screen All Materials Inventory Modal */}
      {isAllMaterialsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-2.5 sm:p-4 pt-10 sm:pt-12 pb-6 sm:pb-8 animate-fade-in font-['Outfit'] select-none h-screen w-screen overflow-hidden">
          <div className="w-full max-w-4xl h-full flex flex-col gap-2.5 sm:gap-3.5 overflow-hidden">
            
            {/* Modal Header Bar (Static) */}
            <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 sm:p-4 sm:px-5 text-slate-900 dark:text-white shadow-2xl space-y-2 sm:space-y-2.5 w-full shrink-0">
              {/* Top Row: Icon + Title + Close Button */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/20 border border-[#0D3B36]/20 dark:border-amber-400/40 text-[#0D3B36] dark:text-amber-300 shrink-0">
                    <Package className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs xs:text-sm sm:text-base font-black tracking-wide uppercase text-[#0D3B36] dark:text-amber-300 leading-snug break-words">
                      ALL FABRICS & MATERIALS INVENTORY ({items.length})
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight mt-0.5 hidden xs:block">
                      Real-time atelier stock catalog, restock counters, and supplier management.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllMaterialsModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shrink-0"
                  title="Close Screen"
                >
                  <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Subtitle for mobile & Action Row */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight xs:hidden">
                  Real-time stock catalog & supplier management.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsAllMaterialsModalOpen(false);
                    onOpenAddMaterialModal();
                  }}
                  className="w-full xs:w-auto ml-auto px-3.5 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white dark:text-[#0D3B36]" />
                  <span>+ Add Material</span>
                </button>
              </div>
            </div>

            {/* Modal Body Container (Scrollable) */}
            <div className="bg-slate-50 dark:bg-[#092825] border-2 border-slate-200 dark:border-amber-400/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 text-slate-800 dark:text-slate-100 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              
              {/* Live Search Bar inside Modal */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#0D3B36] dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Filter supplies by material name, category, or vendor..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#041614] border border-slate-300 dark:border-amber-400/30 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-xs"
                />
              </div>

              {/* Material Items List */}
              {(() => {
                const modalFilteredList = items.filter((item) => {
                  if (!modalSearchQuery.trim()) return true;
                  const q = modalSearchQuery.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q) ||
                    (item.supplier && item.supplier.toLowerCase().includes(q))
                  );
                });

                if (modalFilteredList.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-amber-200/70 font-semibold bg-white dark:bg-[#041614] rounded-2xl border border-slate-200 dark:border-amber-400/20 shadow-xs">
                      No materials matched "{modalSearchQuery}".
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {modalFilteredList.map((item) => {
                      const Icon = CATEGORY_ICONS[item.category] || Package;
                      const isLowStock = item.stockLevel <= item.minThreshold;

                      return (
                        <div
                          key={item.id}
                          className="glass-card rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-[#061E1B] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs hover:border-[#0D3B36]/30 dark:hover:border-amber-400/40 transition-all"
                        >
                          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 border mt-0.5 sm:mt-0 ${
                              isLowStock
                                ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300'
                                : 'bg-[#0D3B36]/10 dark:bg-slate-800 border-[#0D3B36]/20 dark:border-slate-700 text-[#0D3B36] dark:text-amber-300'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 truncate">
                                  {item.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border shrink-0 ${
                                  isLowStock
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                }`}>
                                  {isLowStock ? '⚠️ Low Stock' : '✓ In Stock'}
                                </span>
                              </div>

                              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span>Category: <strong className="text-slate-700 dark:text-slate-300">{item.category}</strong></span>
                                <span>•</span>
                                <span>Alert at &lt;= {item.minThreshold} {item.unit}</span>
                                {item.supplier && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#0D3B36] dark:text-amber-300 font-semibold truncate">Vendor: {item.supplier}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Stepper Counter Controls & Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] sm:hidden font-bold text-slate-400 uppercase tracking-wider">
                              Quantity:
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => onRestockItem(item.id, -1)}
                                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-90 cursor-pointer"
                                  title="Decrease Stock"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                
                                <span className="px-2.5 sm:px-3.5 font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 whitespace-nowrap min-w-[60px] text-center">
                                  {item.stockLevel} {item.unit}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onRestockItem(item.id, 1)}
                                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-90 cursor-pointer"
                                  title="Increase Stock"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {onRemoveItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove ${item.name} from inventory?`)) {
                                      onRemoveItem(item.id);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                                  title="Remove Material"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer Controls (Static) */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 px-4 text-slate-700 dark:text-white text-xs font-semibold gap-2 shadow-xl shrink-0">
              <span className="text-slate-600 dark:text-amber-200/80">
                Showing {items.length} total inventory items in catalog
              </span>
              <button
                type="button"
                onClick={() => setIsAllMaterialsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-amber-400/40 font-bold text-xs cursor-pointer transition-all active:scale-95 text-center"
              >
                Close Inventory Screen
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
