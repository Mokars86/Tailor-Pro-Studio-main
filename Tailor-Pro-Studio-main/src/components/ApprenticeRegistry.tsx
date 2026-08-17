import React, { useState } from 'react';
import { BookOpen, Plus, RefreshCw, Handshake, Sparkles, CheckCircle2, QrCode, KeyRound, Info, Copy, Check, Clock, UserX } from 'lucide-react';
import { Apprentice, ApprenticeTask } from '../types';
import { CurriculumTemplateModal } from './modals/CurriculumTemplateModal';
import { ApprenticeCertificateModal } from './modals/ApprenticeCertificateModal';
import { generateMasterWorkshopCode } from '../utils/workshopCode';

interface ApprenticeRegistryProps {
  apprentices: Apprentice[];
  tasks?: ApprenticeTask[];
  pairCode?: string;
  onRefreshApprentices: () => void;
  onOpenCustomTaskModal: () => void;
  onAssignCurriculumTask?: (apprenticeName: string, taskTitle: string) => void;
  onToggleHandshake?: (apprenticeId: string) => void;
  onPassTask?: (taskId: string) => void;
  onUnlinkApprentice?: (apprenticeId: string) => void;
  studioLogoUrl?: string;
  studioName?: string;
  masterTrainer?: string;
}

export const ApprenticeRegistry: React.FC<ApprenticeRegistryProps> = ({
  apprentices,
  tasks = [],
  pairCode = generateMasterWorkshopCode(),
  onRefreshApprentices,
  onOpenCustomTaskModal,
  onAssignCurriculumTask,
  onToggleHandshake,
  onPassTask,
  onUnlinkApprentice,
  studioLogoUrl,
  studioName,
  masterTrainer
}) => {
  const [curriculumNotice, setCurriculumNotice] = useState<string | null>(null);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [selectedCertApprentice, setSelectedCertApprentice] = useState<Apprentice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedPairCode, setCopiedPairCode] = useState(false);

  const handleCopyPairCode = () => {
    navigator.clipboard.writeText(pairCode);
    setCopiedPairCode(true);
    setTimeout(() => setCopiedPairCode(false), 2000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshApprentices();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleAssignTaskFromModal = (apprenticeName: string, taskTitle: string) => {
    if (onAssignCurriculumTask) {
      onAssignCurriculumTask(apprenticeName, taskTitle);
    }
    setCurriculumNotice(`Task "${taskTitle}" assigned to ${apprenticeName}!`);
    setTimeout(() => setCurriculumNotice(null), 3000);
  };

  const handleToggleHandshakeAction = (apprentice: Apprentice) => {
    if (onToggleHandshake) {
      onToggleHandshake(apprentice.id);
    }
  };

  return (
    <div className="w-full bg-[#061E1B] border-2 border-[#DCA134] rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden font-['Outfit'] space-y-4 my-3">
      {/* Background Soft Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#DCA134]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Notice Banner */}
      {curriculumNotice && (
        <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{curriculumNotice}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0D3B36] border border-[#DCA134] flex items-center justify-center text-[#DCA134] shadow-sm shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight uppercase">
                Master Apprentice Registry
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Workshop Sync
              </span>
            </div>
            <p className="text-xs text-white/70 font-medium">
              Manage synced apprentice accounts, track duty progress, and evaluate completed tasks.
            </p>
          </div>
        </div>

        {/* Master Workshop Pair Code Card */}
        <div className="flex items-center gap-2 bg-[#082824] px-3 py-1.5 rounded-2xl border border-amber-400/30 shadow-xs self-start sm:self-auto">
          <KeyRound className="w-4 h-4 text-[#DCA134] shrink-0" />
          <div>
            <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block leading-none">
              WORKSHOP SYNC KEY
            </span>
            <span className="font-mono text-xs font-black text-white tracking-wider">
              {pairCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyPairCode}
            className="ml-1 p-1 text-white/70 hover:text-amber-300 transition-colors cursor-pointer"
            title="Copy Workshop Key"
          >
            {copiedPairCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Apprentice List Grid */}
      <div className="space-y-3 relative z-10">
        {apprentices.length === 0 ? (
          <div className="text-center py-8 bg-black/20 rounded-2xl border border-white/10 space-y-3">
            <Info className="w-8 h-8 text-amber-400/80 mx-auto" />
            <div>
              <p className="text-xs font-bold text-white">No Apprentices Synced Yet</p>
              <p className="text-[11px] text-white/60 mt-0.5">
                Share your Workshop Sync Key <strong className="text-amber-300 font-mono">{pairCode}</strong> with your apprentice during signup.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 hover:bg-amber-400/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Apprentice Registry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 relative z-10">
            {apprentices.map((apprentice) => {
              const isHandshakeApproved = !apprentice.handshakeLocked;
              const assignedDuties = tasks.filter(
                (t) => t.assignedTo === 'all' || t.assignedTo === apprentice.id || t.assignedTo === apprentice.name
              );
              const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
              
              // Strict Curriculum Completion:
              // Requires all assigned duties to be passed (with at least 1 duty passed), OR Handshake already approved, OR status is 'Graduating'
              const isCurriculumCompleted =
                isHandshakeApproved ||
                apprentice.status === 'Graduating' ||
                (assignedDuties.length > 0 && passedDuties.length === assignedDuties.length) ||
                (apprentice.hoursCompleted > 0 && apprentice.hoursCompleted >= apprentice.totalRequiredHours && passedDuties.length > 0);

              return (
                <div
                  key={apprentice.id}
                  className="bg-[#082824] rounded-2xl p-4 sm:p-5 border-2 border-[#DCA134]/50 shadow-xl space-y-3.5 text-white"
                >
                  {/* Top Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="w-11 h-11 rounded-full bg-[#041916] border-2 border-[#DCA134] text-[#DCA134] font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                        {apprentice.initials || apprentice.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT'}
                      </div>

                      <div>
                        <h3 className="font-black text-base text-white flex items-center gap-1.5">
                          {apprentice.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-amber-100 font-semibold mt-0.5 flex-wrap">
                          <span className="font-bold text-amber-200">{apprentice.role || 'Apprentice Trainee'}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Auto-Synced
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                            {passedDuties.length} / {assignedDuties.length} Duties Passed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                      {/* Handshake Button - Disabled until curriculum completion */}
                      <button
                        type="button"
                        disabled={!isCurriculumCompleted || isHandshakeApproved}
                        onClick={() => handleToggleHandshakeAction(apprentice)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all border shadow-sm ${
                          isHandshakeApproved
                            ? 'bg-emerald-600/40 text-emerald-300 border-emerald-500/60 cursor-not-allowed opacity-90'
                            : !isCurriculumCompleted
                            ? 'bg-slate-800/90 text-slate-300 border-slate-700 cursor-not-allowed opacity-70'
                            : 'bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] border-amber-200 active:scale-95 cursor-pointer'
                        }`}
                        title={
                          isHandshakeApproved
                            ? 'Master Handshake Granted (Approved)'
                            : !isCurriculumCompleted
                            ? `Handshake Locked: Complete all curriculum duties first (${passedDuties.length}/${assignedDuties.length} passed)`
                            : 'Grant Master Handshake Approval'
                        }
                      >
                        <Handshake className={`w-3.5 h-3.5 ${isHandshakeApproved ? 'text-emerald-300' : !isCurriculumCompleted ? 'text-slate-300' : 'text-[#0D3B36]'}`} />
                        <span>
                          {isHandshakeApproved
                            ? 'Handshake Approved ✓'
                            : !isCurriculumCompleted
                            ? 'Handshake Locked 🔒'
                            : 'Grant Handshake 🤝'}
                        </span>
                      </button>

                      {/* Cert Button - Blocked until curriculum completion */}
                      <button
                        type="button"
                        disabled={!isCurriculumCompleted}
                        onClick={() => isCurriculumCompleted && setSelectedCertApprentice(apprentice)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
                          !isCurriculumCompleted
                            ? 'bg-slate-900/90 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60'
                            : 'bg-[#061E1B] hover:bg-[#041412] text-amber-300 border border-[#DCA134] active:scale-95 cursor-pointer'
                        }`}
                        title={
                          !isCurriculumCompleted
                            ? `Certificate Locked: Available upon curriculum completion (${passedDuties.length}/${assignedDuties.length} passed)`
                            : 'View / Print Graduation Certificate'
                        }
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${!isCurriculumCompleted ? 'text-slate-400' : 'text-amber-300'}`} />
                        <span>{!isCurriculumCompleted ? 'Cert 🔒' : 'Cert 📜'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={onOpenCustomTaskModal}
                        className="px-3.5 py-1.5 rounded-xl bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] text-xs font-black flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#0D3B36]" />
                        <span>Assign Duty</span>
                      </button>

                      {onUnlinkApprentice && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to unlink and unbind ${apprentice.name} from your Master Studio?`)) {
                              onUnlinkApprentice(apprentice.id);
                              setCurriculumNotice(`${apprentice.name} unlinked from Master Studio.`);
                              setTimeout(() => setCurriculumNotice(null), 3000);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-400/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Unbind / Unlink Apprentice from Master Studio"
                        >
                          <UserX className="w-3.5 h-3.5 text-rose-400" />
                          <span>Unbind</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Assigned Duties & Evaluation List */}
                  <div className="pt-3 border-t border-amber-400/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
                        <BookOpen className="w-4 h-4 text-[#DCA134]" />
                        Assigned Duties & Progress Evaluation
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/40">
                        {assignedDuties.length} Duties Assigned
                      </span>
                    </div>

                    {assignedDuties.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-[#041916] border border-amber-400/30 text-xs font-semibold text-slate-200 text-center">
                        No active duties assigned. Click "+ Assign Duty" above to delegate a task.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {assignedDuties.map((duty) => {
                          const isPassed = duty.status === 'passed';
                          const isReviewPending = duty.status === 'review_pending' || (duty.isCompleted && !isPassed);

                          return (
                            <div
                              key={duty.id}
                              className="p-3 rounded-2xl bg-[#041916] border border-amber-400/30 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-extrabold text-white text-xs sm:text-sm truncate">
                                  {duty.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium mt-0.5">
                                  <span className="font-bold text-amber-300">{duty.category || 'Workshop Duty'}</span>
                                  {duty.dueDate && <span>· Due: {duty.dueDate}</span>}
                                </div>
                              </div>

                              {/* Status Badge & Master Pass Action Button */}
                              <div className="flex items-center gap-2 shrink-0">
                                {isPassed ? (
                                  <span className="px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-black uppercase border border-emerald-400/50 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    Passed ✓
                                  </span>
                                ) : isReviewPending ? (
                                  <span className="px-3 py-1 rounded-full bg-indigo-500/25 text-indigo-200 text-xs font-black uppercase border border-indigo-400/50 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                                    Review Pending
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-amber-500/25 text-amber-200 text-xs font-black uppercase border border-amber-400/50 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                                    In Progress ⏳
                                  </span>
                                )}

                                {/* Master Pass Action Button */}
                                {!isPassed && onPassTask && (
                                  <button
                                    type="button"
                                    onClick={() => onPassTask(duty.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                                    title="Approve apprentice duty and mark as Passed"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    <span>Pass</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Curriculum Template Selection Modal */}
      <CurriculumTemplateModal
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        apprentices={apprentices}
        onAssignTask={handleAssignTaskFromModal}
      />

      {/* Apprentice Certificate Modal */}
      <ApprenticeCertificateModal
        isOpen={!!selectedCertApprentice}
        onClose={() => setSelectedCertApprentice(null)}
        apprentice={selectedCertApprentice}
        studioLogoUrl={studioLogoUrl}
        studioName={studioName}
        masterTrainer={masterTrainer}
        onToggleHandshake={(id) => {
          if (onToggleHandshake) onToggleHandshake(id);
          if (selectedCertApprentice && selectedCertApprentice.id === id) {
            setSelectedCertApprentice({
              ...selectedCertApprentice,
              handshakeLocked: !selectedCertApprentice.handshakeLocked
            });
          }
        }}
      />
    </div>
  );
};
