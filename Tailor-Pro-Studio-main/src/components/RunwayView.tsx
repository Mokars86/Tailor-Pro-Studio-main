import React from 'react';
import { Lock, Play, CheckCircle2, ShoppingBag, Scissors } from 'lucide-react';
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
  const stageSequence: RunwayStage[] = ['CONSULT', 'CUTTING', 'SEWING', 'FITTING', 'COMPLETED', 'DELIVERED'];

  const stages: { stage: RunwayStage; label: string }[] = [
    { stage: 'CONSULT', label: 'CONSULTATION & MEASUREMENT' },
    { stage: 'CUTTING', label: 'CUTTING' },
    { stage: 'SEWING', label: 'SEWING' },
    { stage: 'FITTING', label: 'FITTING' },
    { stage: 'COMPLETED', label: 'COMPLETED' },
    { stage: 'DELIVERED', label: 'DELIVERED & PICKUP' }
  ];

  return (
    <div className="space-y-4 my-3 font-['Outfit'] select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-none">
            RUNWAY PRODUCTION TRACKER
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time stage tracking for all clients in your atelier database
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] text-xs font-black flex items-center gap-1.5 shadow-xs uppercase tracking-wider shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#DCA134] dark:text-[#0D3B36]" />
          <span>LIVE TRACKING</span>
        </div>
      </div>

      {/* Horizontal Runway Columns Container */}
      <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-1 snap-x custom-scrollbar items-start min-h-[520px]">
        {stages.map(({ stage, label }) => {
          const stageClients = clients.filter((c) => {
            const current = c.runwayStage || 'CONSULT';
            return current === stage;
          });
          const isCompletedStage = stage === 'COMPLETED' || stage === 'DELIVERED';

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
                    const canGoNext = currentIndex < stageSequence.length - 1;

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

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          <div className="flex items-center gap-1.5">
                            {canGoBack && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAdvanceStage(
                                    client.id,
                                    stageSequence[currentIndex - 1]
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                title="Previous Stage"
                              >
                                <Play className="w-2.5 h-2.5 fill-current rotate-180" />
                              </button>
                            )}

                            {canGoNext && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAdvanceStage(
                                    client.id,
                                    stageSequence[currentIndex + 1]
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-extrabold flex items-center gap-1 border border-slate-200/90 dark:border-amber-400 shadow-2xs transition-all active:scale-95 cursor-pointer"
                              >
                                <span>Next Stage</span>
                                <Play className="w-2.5 h-2.5 fill-current" />
                              </button>
                            )}
                          </div>

                          {isCompletedStage && (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700">
                              {clientStage === 'DELIVERED' ? 'Delivered 🛍️' : 'Ready ✅'}
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
    </div>
  );
};
