import React, { useState, useRef } from 'react';
import { Play, CheckCircle2, Scissors, Archive, RotateCcw, Sparkles, Layers, ArrowRight, Check, GripVertical } from 'lucide-react';
import { Client, RunwayStage } from '../types';

interface RunwayViewProps {
  clients: Client[];
  onAdvanceStage: (clientId: string, newStage: RunwayStage) => void;
  onOpenBookSession?: () => void;
}

export const RunwayView: React.FC<RunwayViewProps> = ({
  clients = [],
  onAdvanceStage
}) => {
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [selectedMobileStage, setSelectedMobileStage] = useState<'ALL' | RunwayStage>('ALL');
  const [draggingClientId, setDraggingClientId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<RunwayStage | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const stageSequence: RunwayStage[] = ['CONSULT', 'CUTTING', 'SEWING', 'FITTING', 'COMPLETED', 'DELIVERED'];

  const stageLabels: Record<RunwayStage, string> = {
    CONSULT: 'Consultation & Measure',
    CUTTING: 'Cutting',
    SEWING: 'Sewing',
    FITTING: 'Fitting',
    COMPLETED: 'Completed (Ready)',
    DELIVERED: 'Delivered & Archived'
  };

  const activeStages: { stage: RunwayStage; label: string; shortLabel: string; stepNumber: number }[] = [
    { stage: 'CONSULT', label: '1. CONSULTATION & MEASUREMENT', shortLabel: 'Consult', stepNumber: 1 },
    { stage: 'CUTTING', label: '2. CUTTING PHASE', shortLabel: 'Cutting', stepNumber: 2 },
    { stage: 'SEWING', label: '3. SEWING & ASSEMBLY', shortLabel: 'Sewing', stepNumber: 3 },
    { stage: 'FITTING', label: '4. FITTING & ADJUSTMENT', shortLabel: 'Fitting', stepNumber: 4 },
    { stage: 'COMPLETED', label: '5. COMPLETED (READY)', shortLabel: 'Ready', stepNumber: 5 }
  ];

  // Safe client filtering with null guards
  const safeClients = (clients || []).filter((c): c is Client => Boolean(c && c.id));
  const activeClients = safeClients.filter((c) => (c.runwayStage || 'CONSULT') !== 'DELIVERED');
  const deliveredClients = safeClients.filter((c) => (c.runwayStage || 'CONSULT') === 'DELIVERED');

  const handleAdvanceAndNotice = (client: Client, nextStage: RunwayStage) => {
    if (!client || !client.id) return;

    onAdvanceStage(client.id, nextStage);

    if (nextStage === 'DELIVERED') {
      setToastNotice(`Garment for "${client.name || 'Client'}" marked Delivered & Archived to Atelier Records 🛍️`);
      if (selectedMobileStage !== 'ALL') {
        setSelectedMobileStage('ALL');
      }
    } else {
      const nextLabel = stageLabels[nextStage] || nextStage;
      setToastNotice(`"${client.name || 'Client'}" moved to ${nextLabel} stage ✂️`);

      if (selectedMobileStage !== 'ALL') {
        setSelectedMobileStage(nextStage);
      }

      setTimeout(() => {
        const targetEl = document.getElementById(`runway-column-${nextStage}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }, 100);
    }

    setTimeout(() => setToastNotice(null), 4500);
  };

  const handleDropOnStage = (clientId: string, targetStage: RunwayStage) => {
    const client = safeClients.find((c) => c.id === clientId);
    if (!client || client.runwayStage === targetStage) {
      setDraggingClientId(null);
      setDragOverStage(null);
      return;
    }
    handleAdvanceAndNotice(client, targetStage);
    setDraggingClientId(null);
    setDragOverStage(null);
  };

  // Touch drag support for mobile
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchDragClientId = useRef<string | null>(null);

  const handleCardTouchStart = (e: React.TouchEvent, clientId: string) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchDragClientId.current = clientId;
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !touchDragClientId.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    // Detect column element under finger
    const element = document.elementFromPoint(currentX, currentY);
    const columnEl = element?.closest('[data-runway-stage]') as HTMLElement | null;
    if (columnEl) {
      const stage = columnEl.dataset.runwayStage as RunwayStage;
      if (stage && dragOverStage !== stage) {
        setDragOverStage(stage);
      }
    }
  };

  const handleCardTouchEnd = () => {
    if (touchDragClientId.current && dragOverStage) {
      handleDropOnStage(touchDragClientId.current, dragOverStage);
    }
    touchStartPos.current = null;
    touchDragClientId.current = null;
    setDragOverStage(null);
    setDraggingClientId(null);
  };

  // Compute stage progress percentage
  const getStageProgress = (stage?: RunwayStage): number => {
    switch (stage) {
      case 'CONSULT': return 20;
      case 'CUTTING': return 40;
      case 'SEWING': return 60;
      case 'FITTING': return 80;
      case 'COMPLETED': return 100;
      case 'DELIVERED': return 100;
      default: return 20;
    }
  };

  return (
    <div className="space-y-4 my-3 font-['Outfit'] select-none">
      
      {/* Toast Banner Notice */}
      {toastNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xl animate-fade-in border border-emerald-400/50 sticky top-20 z-40">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{toastNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-white/80 hover:text-white text-xs font-black cursor-pointer px-1.5 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-none flex items-center gap-2">
            <span>RUNWAY PRODUCTION TRACKER</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {viewMode === 'ACTIVE'
              ? 'Drag & drop garment cards between stages or use quick advancement controls.'
              : 'Archive of past delivered atelier garments. Data & measurements remain 100% saved.'}
          </p>
        </div>

        {/* View Mode Segment Toggle Button */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-[#041614] rounded-2xl border border-slate-300 dark:border-amber-400/30 w-full sm:w-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('ACTIVE')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'ACTIVE'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Active Runway ({activeClients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ARCHIVE')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'ARCHIVE'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Delivered Archive ({deliveredClients.length}) 🛍️</span>
          </button>
        </div>
      </div>

      {/* MODE 1: ACTIVE RUNWAY PIPELINE COLUMNS */}
      {viewMode === 'ACTIVE' ? (
        <div className="space-y-3">
          {/* Stage Filter Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedMobileStage('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedMobileStage === 'ALL'
                  ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                  : 'bg-white dark:bg-[#092825] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#DCA134]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Pipeline ({activeClients.length})</span>
            </button>

            {activeStages.map(({ stage, shortLabel }) => {
              const count = activeClients.filter((c) => (c.runwayStage || 'CONSULT') === stage).length;
              const isSelected = selectedMobileStage === stage;

              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => {
                    setSelectedMobileStage(stage);
                    const targetEl = document.getElementById(`runway-column-${stage}`);
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                      : 'bg-white dark:bg-[#092825] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#DCA134]'
                  }`}
                >
                  <span>{shortLabel}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-amber-400 dark:bg-[#0D3B36] text-[#0D3B36] dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Runway Pipeline Horizontal Drag & Drop Grid */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-6 pt-1 snap-x custom-scrollbar items-start min-h-[480px]"
          >
            {activeStages
              .filter(({ stage }) => selectedMobileStage === 'ALL' || selectedMobileStage === stage)
              .map(({ stage, label, shortLabel, stepNumber }) => {
                const stageClients = activeClients.filter((c) => (c.runwayStage || 'CONSULT') === stage);
                const isCompletedStage = stage === 'COMPLETED';
                const isTargetHovered = dragOverStage === stage;

                return (
                  <div
                    key={stage}
                    id={`runway-column-${stage}`}
                    data-runway-stage={stage}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStage !== stage) setDragOverStage(stage);
                    }}
                    onDragLeave={() => {
                      if (dragOverStage === stage) setDragOverStage(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedId = e.dataTransfer.getData('text/plain') || draggingClientId;
                      if (droppedId) {
                        handleDropOnStage(droppedId, stage);
                      }
                    }}
                    className={`w-[85vw] max-w-[300px] sm:w-[310px] shrink-0 snap-start bg-white dark:bg-[#092825] rounded-[28px] p-3.5 sm:p-5 border transition-all space-y-3.5 ${
                      isTargetHovered
                        ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-50/40 dark:bg-amber-950/20 scale-[1.01]'
                        : isCompletedStage
                        ? 'border-emerald-300/80 dark:border-emerald-500/30'
                        : 'border-slate-200/90 dark:border-white/10 shadow-2xs'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isCompletedStage ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] text-[10px] font-black flex items-center justify-center shrink-0">
                            {stepNumber}
                          </span>
                        )}
                        <h3 className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 tracking-wider uppercase truncate">
                          {label}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black border border-slate-200 dark:border-slate-700 shrink-0">
                        {stageClients.length}
                      </span>
                    </div>

                    {/* Column Garment Cards or Empty Drop Zone */}
                    {stageClients.length === 0 ? (
                      <div
                        className={`w-full py-10 px-4 border-2 border-dashed rounded-[22px] flex flex-col items-center justify-center text-center space-y-2 transition-all ${
                          isTargetHovered
                            ? 'border-amber-400 bg-amber-100/30 dark:bg-amber-900/20'
                            : 'border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {isTargetHovered ? 'Drop Garment Here ✂️' : `No garments in ${shortLabel}`}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {isTargetHovered
                            ? 'Release to assign to this stage'
                            : stage === 'CONSULT'
                            ? 'New client orders start here.'
                            : 'Drag garments from other columns.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stageClients.map((client) => {
                          const clientStage = client.runwayStage || 'CONSULT';
                          const currentIndex = stageSequence.indexOf(clientStage);
                          const canGoBack = currentIndex > 0;
                          const nextStage = currentIndex >= 0 && currentIndex < stageSequence.length - 1
                            ? stageSequence[currentIndex + 1]
                            : undefined;
                          const progress = getStageProgress(clientStage);

                          const clientName = client.name || 'Client Order';
                          const garmentTag = client.garmentTag || 'Custom Bespoke Garment';
                          const initials = client.initials || (client.name ? client.name.trim().substring(0, 2).toUpperCase() : 'CO');
                          const isBeingDragged = draggingClientId === client.id;

                          return (
                            <div
                              key={client.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', client.id);
                                setDraggingClientId(client.id);
                              }}
                              onDragEnd={() => {
                                setDraggingClientId(null);
                                setDragOverStage(null);
                              }}
                              onTouchStart={(e) => handleCardTouchStart(e, client.id)}
                              onTouchMove={handleCardTouchMove}
                              onTouchEnd={handleCardTouchEnd}
                              className={`bg-[#ECF3F1] dark:bg-[#0F3B36] rounded-[22px] p-3.5 sm:p-4 border space-y-3 shadow-2xs cursor-grab active:cursor-grabbing transition-all ${
                                isBeingDragged
                                  ? 'opacity-40 scale-95 border-dashed border-amber-400'
                                  : isCompletedStage
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 hover:border-emerald-400'
                                  : 'border-slate-200/80 dark:border-slate-700 hover:border-amber-400/60'
                              }`}
                            >
                              {/* Garment / Client Info */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight truncate">
                                      {clientName}
                                    </h4>
                                    <p className="text-xs font-extrabold text-[#0D3B36] dark:text-amber-300/90 uppercase mt-0.5 truncate">
                                      {garmentTag}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                  <GripVertical className="w-4 h-4 cursor-grab" title="Drag to move stage" />
                                </div>
                              </div>

                              {/* Visual Progress Stepper Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                                  <span>Progress</span>
                                  <span className="text-[#0D3B36] dark:text-amber-300">{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isCompletedStage
                                        ? 'bg-emerald-500'
                                        : 'bg-[#0D3B36] dark:bg-amber-400'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Stage Navigation & Actions */}
                              <div className="flex items-center justify-between gap-1.5 pt-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {canGoBack && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAdvanceAndNotice(
                                          client,
                                          stageSequence[currentIndex - 1]
                                        )
                                      }
                                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                      title="Move to Previous Stage"
                                    >
                                      <Play className="w-2.5 h-2.5 fill-current rotate-180" />
                                    </button>
                                  )}

                                  {nextStage && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdvanceAndNotice(client, nextStage)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                                        nextStage === 'DELIVERED'
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400'
                                          : 'bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] border border-slate-200/90 dark:border-amber-400'
                                      }`}
                                    >
                                      <span>{nextStage === 'DELIVERED' ? 'Deliver & Archive 🛍️' : 'Next Stage'}</span>
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* MODE 2: DELIVERED & ARCHIVED ATELIER RECORDS */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              <span>Delivered Atelier Garments ({deliveredClients.length} Archived Orders)</span>
            </div>
          </div>

          {deliveredClients.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl space-y-2">
              <Archive className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No garments in delivered archive yet
              </p>
              <p className="text-xs text-slate-400">
                When an active order is marked delivered, it will appear here permanently.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {deliveredClients.map((client) => (
                <div
                  key={client.id}
                  className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {client.name}
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      Delivered ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Garment: {client.garmentTag}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-black text-[#0D3B36] dark:text-white">
                      GH₵{client.totalCost}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdvanceAndNotice(client, 'COMPLETED')}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore to Runway</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
