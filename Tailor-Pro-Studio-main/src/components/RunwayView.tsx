import React, { useState } from 'react';
import { Lock, Play, CheckCircle2, ShoppingBag, Scissors, Archive, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Client, RunwayStage } from '../types';

interface RunwayViewProps {
  clients: Client[];
  onAdvanceStage: (clientId: string, newStage: RunwayStage) => void;
  onOpenBookSession?: () => void;
}

export const RunwayView: React.FC<RunwayViewProps> = ({
  clients,
  onAdvanceStage
}) => {
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const stageSequence: RunwayStage[] = ['CONSULT', 'CUTTING', 'SEWING', 'FITTING', 'COMPLETED', 'DELIVERED'];

  const activeStages: { stage: RunwayStage; label: string }[] = [
    { stage: 'CONSULT', label: 'CONSULTATION & MEASUREMENT' },
    { stage: 'CUTTING', label: 'CUTTING' },
    { stage: 'SEWING', label: 'SEWING' },
    { stage: 'FITTING', label: 'FITTING' },
    { stage: 'COMPLETED', label: 'COMPLETED (READY)' }
  ];

  const activeClients = clients.filter((c) => (c.runwayStage || 'CONSULT') !== 'DELIVERED');
  const deliveredClients = clients.filter((c) => (c.runwayStage || 'CONSULT') === 'DELIVERED');

  const handleAdvanceAndNotice = (client: Client, nextStage: RunwayStage) => {
    onAdvanceStage(client.id, nextStage);
    if (nextStage === 'DELIVERED') {
      setToastNotice(`Garment for "${client.name}" marked Delivered & Archived to Atelier Records 🛍️`);
      setTimeout(() => setToastNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-4 my-3 font-['Outfit'] select-none">
      
      {/* Toast Banner Notice */}
      {toastNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fade-in border border-emerald-400/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-amber-300 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-white/80 hover:text-white text-xs font-black cursor-pointer px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-white/10 pb-3">
        <div>
          <h1 className="font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-none flex items-center gap-2">
            <span>RUNWAY PRODUCTION TRACKER</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {viewMode === 'ACTIVE'
              ? 'Active work in progress pipeline. Completed orders automatically archive upon delivery.'
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
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-1 snap-x custom-scrollbar items-start min-h-[520px]">
          {activeStages.map(({ stage, label }) => {
            const stageClients = activeClients.filter((c) => (c.runwayStage || 'CONSULT') === stage);
            const isCompletedStage = stage === 'COMPLETED';

            return (
              <div
                key={stage}
                className={`w-[82vw] max-w-[280px] sm:w-[300px] shrink-0 snap-start bg-white dark:bg-[#092825] rounded-[28px] p-3.5 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-4 ${
                  isCompletedStage ? 'border-emerald-200/80 dark:border-emerald-500/30' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5">
                    {isCompletedStage && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <h3 className="font-black text-xs sm:text-sm text-slate-700 dark:text-slate-200 tracking-wider uppercase">
                      {label}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black border border-slate-200 dark:border-slate-700">
                    {stageClients.length}
                  </span>
                </div>

                {/* Column Garment Cards or Empty State */}
                {stageClients.length === 0 ? (
                  <div className="w-full h-32 border-2 border-dashed border-slate-200/90 dark:border-slate-800 rounded-[20px] flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Empty
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stageClients.map((client) => {
                      const clientStage = client.runwayStage || 'CONSULT';
                      const currentIndex = stageSequence.indexOf(clientStage);
                      const canGoBack = currentIndex > 0;
                      const nextStage = stageSequence[currentIndex + 1];

                      return (
                        <div
                          key={client.id}
                          className={`bg-[#ECF3F1] dark:bg-[#0F3B36] rounded-[22px] p-4 border border-slate-200/80 dark:border-slate-700 space-y-3 shadow-2xs ${
                            isCompletedStage ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30' : ''
                          }`}
                        >
                          {/* Garment / Client Info */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-tight">
                                {client.name}
                              </h4>
                              <p className="text-xs font-extrabold text-[#0D3B36] dark:text-amber-300/80 uppercase mt-0.5">
                                {client.garmentTag || 'Custom Garment'}
                              </p>
                            </div>
                            {client.phone && (
                              <span className="text-[10px] text-slate-400 font-mono font-medium">
                                {client.phone}
                              </span>
                            )}
                          </div>

                          {/* Stage Navigation & Actions */}
                          <div className="flex items-center justify-between gap-1.5 pt-1">
                            <div className="flex items-center gap-1.5">
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
                                  title="Previous Stage"
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

                            {isCompletedStage && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700">
                                Ready ✅
                              </span>
                            )}
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
      ) : (
        /* MODE 2: DELIVERED GARMENTS ARCHIVE CATALOG */
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Delivered orders are archived here automatically. Client measurements & financial records remain preserved in Customer Directory & Ledger.
              </span>
            </div>
            <span className="font-extrabold bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-700 shrink-0">
              {deliveredClients.length} Total Delivered
            </span>
          </div>

          {deliveredClients.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-white dark:bg-[#092825] rounded-3xl border border-slate-200 dark:border-white/10">
              <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                No Delivered Garments Archived Yet
              </h3>
              <p className="text-xs text-slate-400">
                Garments moved to the "Delivered & Pickup" stage will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {deliveredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white dark:bg-[#092825] rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#0D3B36] dark:bg-[#12423D] text-white font-black text-xs flex items-center justify-center border border-white/20 shrink-0">
                        {client.initials || client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {client.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                          {client.garmentTag || 'Bespoke Garment'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-700 shrink-0">
                      Delivered 🛍️
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Balance: <strong className="text-[#DCA134]">GH₵ {client.balanceDue}</strong>
                    </span>

                    {/* Re-open / Return to Consult Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onAdvanceStage(client.id, 'CONSULT');
                        setViewMode('ACTIVE');
                        setToastNotice(`New Order started for "${client.name}"! Moved back to Consult column.`);
                        setTimeout(() => setToastNotice(null), 4000);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title="Re-open Consultation for a new garment order"
                    >
                      <RotateCcw className="w-3 h-3 text-[#0D3B36] dark:text-amber-300" />
                      <span>New Order</span>
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

