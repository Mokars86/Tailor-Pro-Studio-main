import React from 'react';
import { Scissors, Pin, Ruler, CheckCircle2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Client, RunwayStage, ApprenticeTask } from '../../../types';

interface ApprenticeProductionTabProps {
  clients: Client[];
  tasks?: ApprenticeTask[];
  onAdvanceStage: (clientId: string, newStage: RunwayStage) => void;
  onViewCadSpec: (client: Client) => void;
  onCompleteTask?: (taskId: string) => void;
  onOpenTakeTape?: () => void;
}

export const ApprenticeProductionTab: React.FC<ApprenticeProductionTabProps> = ({
  clients,
  tasks = [],
  onAdvanceStage,
  onViewCadSpec,
  onCompleteTask,
  onOpenTakeTape
}) => {
  // Filter active production garments
  const activeGarments = clients.filter(
    (c) => c.runwayStage === 'CUTTING' || c.runwayStage === 'SEWING' || c.runwayStage === 'CONSULT'
  );

  // Compute stage counts
  const toCutCount = clients.filter((c) => c.runwayStage === 'CUTTING').length;
  const sewingCount = clients.filter((c) => c.runwayStage === 'SEWING').length;
  const doneCount = clients.filter((c) => c.runwayStage === 'FITTING' || c.runwayStage === 'COMPLETED' || c.runwayStage === 'DELIVERED').length;

  return (
    <div className="space-y-6 font-['Outfit'] select-none">
      
      {/* Global Tape Measurement Button */}
      {onOpenTakeTape && (
        <button
          type="button"
          onClick={onOpenTakeTape}
          className="w-full py-3 px-4 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-['Outfit'] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all border border-[#0D3B36] cursor-pointer"
        >
          <Ruler className="w-4 h-4 text-emerald-300" />
          <span>Take Client Measurement (Tape)</span>
        </button>
      )}

      {/* 1. MASTER ASSIGNED WORKSHOP DUTIES SECTION */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#DCA134]" />
            <h2 className="font-['Outfit'] font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 tracking-widest uppercase">
              MASTER ASSIGNED WORKSHOP DUTIES
            </h2>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-[#0D3B36] text-[#DCA134] border border-[#DCA134]/30 shadow-2xs">
            {tasks.length} Assigned Duties
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-6 text-center bg-white/80 dark:bg-[#092825]/90 rounded-3xl border border-slate-200 dark:border-white/10 space-y-1.5 shadow-2xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-xs sm:text-sm text-[#0D3B36] dark:text-slate-100">
              No Master Assigned Duties Right Now
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Duties assigned by your Master Trainer will appear here for you to work on and complete.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isPassed = task.status === 'passed';
              const isReviewPending = task.status === 'review_pending' || (task.isCompleted && !isPassed);

              return (
                <div
                  key={task.id}
                  className="bg-white/90 dark:bg-[#061E1B] rounded-3xl p-4 sm:p-5 border-2 border-amber-400/40 dark:border-amber-400/30 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0D3B36] text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          {task.category || 'Master Workshop Duty'}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Due: {task.dueDate}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPassed ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase border border-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Passed ✓
                        </span>
                      ) : isReviewPending ? (
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-xs font-black uppercase border border-indigo-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          Review Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-black uppercase border border-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          In Progress ⏳
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Master Notes */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300/60 text-xs space-y-0.5">
                    <span className="font-black text-[10px] uppercase tracking-wider text-[#B87C14] dark:text-amber-300 block">
                      MASTER INSTRUCTIONS & NOTES:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.masterNotes || 'Execute assignment according to atelier precision standards.'}
                    </p>
                  </div>

                  {/* Apprentice Action Button */}
                  {!task.isCompleted && !isPassed && onCompleteTask && (
                    <button
                      type="button"
                      onClick={() => onCompleteTask(task.id)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Mark Duty as Completed (Submit to Master for Review)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. ACTIVE CLIENT PRODUCTION GARMENTS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-['Outfit'] font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 tracking-widest uppercase">
            ACTIVE CLIENT PRODUCTION GARMENTS
          </h2>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#0D3B36] text-[#DCA134] border border-[#DCA134]/30 shadow-2xs">
            {activeGarments.length} Active Garments
          </span>
        </div>

        {/* Runway Production Stage Pipeline Pills */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#FFF8EA] dark:bg-amber-950/40 border border-[#F3D188] dark:border-amber-700/60 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="font-['Outfit'] font-black text-lg sm:text-xl text-[#B87C14] dark:text-amber-300">
              {toCutCount}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-[#B87C14] dark:text-amber-400">
              TO CUT
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="font-['Outfit'] font-black text-lg sm:text-xl text-slate-700 dark:text-slate-200">
              {sewingCount}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              SEWING
            </div>
          </div>

          <div className="bg-[#EAF8F2] dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="font-['Outfit'] font-black text-lg sm:text-xl text-emerald-700 dark:text-emerald-300">
              {doneCount}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              DONE
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {activeGarments.length === 0 ? (
            <div className="p-8 text-center bg-white/70 dark:bg-[#092825]/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-[#0D3B36] dark:text-slate-100">No Active Production Garments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All current workshop garments are completed or delivered.</p>
            </div>
          ) : (
            activeGarments.map((client) => {
              const currentStage = client.runwayStage || 'CONSULT';
              const isConsult = currentStage === 'CONSULT';
              const isCutting = currentStage === 'CUTTING';
              const stageLabel = isConsult ? 'Consultation' : isCutting ? 'Cutting' : 'Sewing';
              const nextStage: RunwayStage = isConsult ? 'CUTTING' : isCutting ? 'SEWING' : 'FITTING';
              const buttonText = isConsult
                ? 'Mark Stage Done (Consult ➔ Cutting)'
                : isCutting
                ? 'Mark Stage Done (Cutting ➔ Sewing)'
                : 'Mark Stage Done (Sewing ➔ Fitting)';

              return (
                <div
                  key={client.id}
                  className="bg-white/85 dark:bg-[#061E1B] backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0D3B36] dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-['Outfit'] font-black text-base text-slate-900 dark:text-slate-100 tracking-tight">
                            {client.initials || client.name.substring(0, 2).toUpperCase()} · {client.garmentTag}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-[#B87C14] dark:text-amber-300 border border-amber-300/80">
                            {stageLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          <Pin className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span>Client Garment Production</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300/70 text-xs space-y-0.5">
                    <span className="font-black text-[10px] uppercase tracking-wider text-[#B87C14] dark:text-amber-300 block">
                      GARMENT SPECIFICATIONS:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {client.notes || 'Custom atelier tailoring specifications.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => onViewCadSpec(client)}
                      className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300/80 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                      <span>View CAD Spec</span>
                    </button>

                    <button
                      onClick={() => onAdvanceStage(client.id, nextStage)}
                      className="py-2.5 px-3 rounded-2xl bg-[#038555] hover:bg-[#026c45] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span className="truncate">{buttonText}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
