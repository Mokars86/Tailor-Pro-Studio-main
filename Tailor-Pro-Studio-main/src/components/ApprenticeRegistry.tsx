import React, { useState } from 'react';
import { BookOpen, Plus, RefreshCw, Handshake, Sparkles, CheckCircle2, QrCode, KeyRound, Info, Copy, Check, Clock, UserX, Users, ChevronDown, ChevronUp, Eye, X, Search } from 'lucide-react';
import { Apprentice, ApprenticeTask } from '../types';
import { CurriculumTemplateModal } from './modals/CurriculumTemplateModal';
import { ApprenticeCertificateModal } from './modals/ApprenticeCertificateModal';
import { generateMasterWorkshopCode } from '../utils/workshopCode';
import { getGraduationPayment, canLinkApprentice } from '../services/subscriptionService';

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
  onOpenGraduationPaymentModal?: (apprentice: Apprentice) => void;
  onTriggerUpgradeModal?: () => void;
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
  onOpenGraduationPaymentModal,
  onTriggerUpgradeModal,
  studioLogoUrl,
  studioName,
  masterTrainer
}) => {
  const [curriculumNotice, setCurriculumNotice] = useState<string | null>(null);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [selectedCertApprentice, setSelectedCertApprentice] = useState<Apprentice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedPairCode, setCopiedPairCode] = useState(false);
  const [isAllApprenticesModalOpen, setIsAllApprenticesModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

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

  const linkCheck = canLinkApprentice(apprentices.length);

  return (
    <div className="w-full bg-[#061E1B] border-2 border-[#DCA134] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-xl relative overflow-hidden font-['Outfit'] space-y-3.5 sm:space-y-4 my-2 sm:my-3">
      {/* Background Soft Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#DCA134]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Notice Banner */}
      {curriculumNotice && (
        <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{curriculumNotice}</span>
        </div>
      )}

      {/* Free Tier Apprentice Limit Banner */}
      {!linkCheck.allowed && (
        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center justify-between flex-wrap gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Free Tier Limit: Tailor Pro Free allows linking max 1 apprentice profile ({apprentices.length}/1). Upgrade to Master Pro for unlimited linked apprentices!</span>
          </div>
          {onTriggerUpgradeModal && (
            <button
              type="button"
              onClick={onTriggerUpgradeModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-xs flex items-center gap-1 shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Master 👑</span>
            </button>
          )}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0D3B36] border border-[#DCA134] flex items-center justify-center text-[#DCA134] shadow-sm shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="font-extrabold text-sm sm:text-lg text-white tracking-tight uppercase flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span>Master Apprentice Registry</span>
                {apprentices.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#DCA134]/20 text-[#DCA134] text-[10px] sm:text-xs font-extrabold border border-[#DCA134]/40 lowercase tracking-normal">
                    {apprentices.length} {apprentices.length === 1 ? 'apprentice' : 'apprentices'}
                  </span>
                )}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-black border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Workshop Sync
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight mt-0.5">
              Manage synced apprentice accounts, track duty progress, and evaluate completed tasks.
            </p>
          </div>
        </div>

        {/* Master Workshop Pair Code Card */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#082824] px-3 py-1.5 rounded-2xl border border-amber-400/30 shadow-xs w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound className="w-4 h-4 text-[#DCA134] shrink-0" />
            <div className="min-w-0">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase tracking-widest block leading-none">
                WORKSHOP SYNC KEY
              </span>
              <span className="font-mono text-xs font-black text-white tracking-wider truncate block">
                {pairCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyPairCode}
            className="ml-1 p-1 text-white/70 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
            title="Copy Workshop Key"
          >
            {copiedPairCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Apprentice List Grid */}
      <div className="space-y-3 relative z-10">
        {apprentices.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-3 bg-black/20 rounded-2xl border border-white/10 space-y-3">
            <Info className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400/80 mx-auto" />
            <div>
              <p className="text-xs font-bold text-white">No Apprentices Synced Yet</p>
              <p className="text-[11px] text-white/60 mt-0.5 max-w-md mx-auto">
                Share your Workshop Sync Key <strong className="text-amber-300 font-mono">{pairCode}</strong> with your apprentices. When entered on their device, their profile will automatically sync into your master registry.
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
        ) : (() => {
          const visibleApprentices = apprentices.slice(0, 1);
          const hasMultipleApprentices = apprentices.length > 1;

          return (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 relative z-10">
                {visibleApprentices.map((apprentice) => {
                  const isHandshakeApproved = !apprentice.handshakeLocked;
                  const assignedDuties = tasks.filter(
                    (t) => t.assignedTo === 'all' || t.assignedTo === apprentice.id || t.assignedTo === apprentice.name
                  );
                  const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
                  
                  // Strict Curriculum Completion:
                  const isCurriculumCompleted =
                    isHandshakeApproved ||
                    apprentice.status === 'Graduating' ||
                    (assignedDuties.length > 0 && passedDuties.length === assignedDuties.length) ||
                    (apprentice.hoursCompleted > 0 && apprentice.hoursCompleted >= apprentice.totalRequiredHours && passedDuties.length > 0);

                  return (
                    <div
                      key={apprentice.id}
                      className="bg-[#082824] rounded-2xl p-3.5 sm:p-5 border-2 border-[#DCA134]/50 shadow-xl space-y-3 sm:space-y-3.5 text-white overflow-hidden"
                    >
                      {/* Top Info Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#041916] border-2 border-[#DCA134] text-[#DCA134] font-black flex items-center justify-center text-xs sm:text-sm shadow-sm shrink-0">
                            {apprentice.initials || apprentice.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-sm sm:text-base text-white truncate">
                              {apprentice.name}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-amber-100 font-semibold mt-0.5 flex-wrap">
                              <span className="font-bold text-amber-200">{apprentice.role || 'Apprentice Trainee'}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-Synced
                              </span>
                              <span>•</span>
                              <span className="text-amber-300 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                                {passedDuties.length} / {assignedDuties.length} Duties Passed
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Action Buttons */}
                        <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-amber-400/20">
                          {/* Handshake Button */}
                          <button
                            type="button"
                            disabled={!isCurriculumCompleted}
                            onClick={() => {
                              if (!isCurriculumCompleted) return;
                              handleToggleHandshakeAction(apprentice);
                            }}
                            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all border shadow-xs truncate ${
                              isHandshakeApproved
                                ? 'bg-emerald-600/40 text-emerald-300 border-emerald-500/60 cursor-pointer opacity-90'
                                : !isCurriculumCompleted
                                ? 'bg-slate-800/90 text-slate-400 border-slate-700 cursor-not-allowed opacity-60'
                                : 'bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] border-amber-200 active:scale-95 cursor-pointer'
                            }`}
                            title={
                              isHandshakeApproved
                                ? 'Master Handshake Granted (Approved)'
                                : !isCurriculumCompleted
                                ? `Handshake Locked 🔒: Complete all curriculum duties/hours first (${passedDuties.length}/${assignedDuties.length} passed)`
                                : 'Grant Master Handshake Approval'
                            }
                          >
                            <Handshake className={`w-3.5 h-3.5 shrink-0 ${isHandshakeApproved ? 'text-emerald-300' : !isCurriculumCompleted ? 'text-slate-400' : 'text-[#0D3B36]'}`} />
                            <span className="truncate">
                              {isHandshakeApproved
                                ? 'Handshake Approved ✓'
                                : !isCurriculumCompleted
                                ? 'Handshake Locked 🔒'
                                : 'Grant Handshake 🤝'}
                            </span>
                          </button>

                          {/* Cert Button */}
                          {(() => {
                            const payment = getGraduationPayment(apprentice.id);
                            const isCertPaid = payment?.isPaid || false;

                            return (
                              <button
                                type="button"
                                disabled={!isCurriculumCompleted}
                                onClick={() => {
                                  if (!isCurriculumCompleted) return;
                                  if (!isCertPaid) {
                                    if (onOpenGraduationPaymentModal) {
                                      onOpenGraduationPaymentModal(apprentice);
                                    } else {
                                      alert(`Graduation fee payment (GHS 250) is required to unlock certificate for ${apprentice.name}.`);
                                    }
                                  } else {
                                    setSelectedCertApprentice(apprentice);
                                  }
                                }}
                                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs truncate ${
                                  !isCurriculumCompleted
                                    ? 'bg-slate-900/90 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60'
                                    : !isCertPaid
                                    ? 'bg-amber-400 hover:bg-amber-300 text-[#061E1B] border border-amber-500 cursor-pointer active:scale-95 font-black'
                                    : 'bg-[#061E1B] hover:bg-[#041412] text-amber-300 border border-[#DCA134] active:scale-95 cursor-pointer'
                                }`}
                                title={
                                  !isCurriculumCompleted
                                    ? `Certificate Locked 🔒: Available upon curriculum completion (${passedDuties.length}/${assignedDuties.length} passed)`
                                    : !isCertPaid
                                    ? 'Pay GHS 250 Graduation Fee to Unlock Certificate 📜'
                                    : 'View / Print Graduation Certificate 📜'
                                }
                              >
                                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${!isCurriculumCompleted ? 'text-slate-400' : 'text-amber-300'}`} />
                                <span className="truncate">
                                  {!isCurriculumCompleted
                                    ? 'Cert 🔒'
                                    : !isCertPaid
                                    ? 'Pay Cert 📜'
                                    : 'Cert 📜'}
                                </span>
                              </button>
                            );
                          })()}

                          {/* Assign Duty */}
                          <button
                            type="button"
                            onClick={onOpenCustomTaskModal}
                            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#0D3B36] shrink-0" />
                            <span className="truncate">Assign Duty</span>
                          </button>

                          {/* Unbind Button */}
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
                              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-bold border border-rose-400/40 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer truncate"
                              title="Unbind / Unlink Apprentice from Master Studio"
                            >
                              <UserX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">Unbind</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Assigned Duties & Evaluation List */}
                      <div className="pt-3 border-t border-amber-400/20 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm truncate">
                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DCA134] shrink-0" />
                            <span className="truncate">Assigned Duties & Evaluation</span>
                          </span>
                          <span className="text-[9px] sm:text-[11px] font-extrabold text-amber-200 bg-amber-500/20 px-2 sm:px-2.5 py-0.5 rounded-md border border-amber-400/40 shrink-0">
                            {assignedDuties.length} Assigned
                          </span>
                        </div>

                        {assignedDuties.length === 0 ? (
                          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#041916] border border-amber-400/30 text-[11px] sm:text-xs font-semibold text-slate-200 text-center">
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
                                  className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#041916] border border-amber-400/30 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-extrabold text-white text-xs sm:text-sm truncate">
                                      {duty.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-amber-200/90 font-medium mt-0.5 flex-wrap">
                                      <span className="font-bold text-amber-300">{duty.category || 'Workshop Duty'}</span>
                                      {duty.dueDate && <span>· Due: {duty.dueDate}</span>}
                                    </div>
                                  </div>

                                  {/* Status Badge & Master Pass Action Button */}
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end xs:self-auto">
                                    {isPassed ? (
                                      <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-[10px] sm:text-xs font-black uppercase border border-emerald-400/50 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                        <span>Passed ✓</span>
                                      </span>
                                    ) : isReviewPending ? (
                                      <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-indigo-500/25 text-indigo-200 text-[10px] sm:text-xs font-black uppercase border border-indigo-400/50 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-indigo-300 shrink-0" />
                                        <span>Pending</span>
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/25 text-amber-200 text-[10px] sm:text-xs font-black uppercase border border-amber-400/50 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                                        <span>In Progress</span>
                                      </span>
                                    )}

                                    {/* Master Pass Action Button */}
                                    {!isPassed && onPassTask && (
                                      <button
                                        type="button"
                                        onClick={() => onPassTask(duty.id)}
                                        className="px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                                        title="Approve apprentice duty and mark as Passed"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
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

              {/* View All Apprentices Footer Action */}
              {hasMultipleApprentices && (
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 bg-[#041916]/50 p-3 sm:p-3.5 rounded-2xl border border-[#DCA134]/30 shadow-md">
                  <div className="flex items-center gap-2.5 text-xs text-amber-200 font-semibold min-w-0 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-[#DCA134] shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white block text-xs sm:text-sm truncate">
                        Showing 1 of {apprentices.length} registered apprentices
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-amber-200/70 font-normal block truncate">
                        Click below to open full screen training roster
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAllApprenticesModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] font-black text-xs border border-amber-200 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Eye className="w-4 h-4 text-[#0D3B36]" />
                    <span>View All Apprentices ({apprentices.length})</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Dedicated Full-Screen All Master Apprentices & Trainees Modal */}
      {isAllApprenticesModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-2.5 sm:p-4 pt-10 sm:pt-12 pb-6 sm:pb-8 animate-fade-in font-['Outfit'] select-none h-screen w-screen overflow-hidden">
          <div className="w-full max-w-4xl h-full flex flex-col gap-2.5 sm:gap-3.5 overflow-hidden">
            
            {/* Modal Header Bar (Static) */}
            <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 sm:p-4 sm:px-5 text-slate-900 dark:text-white shadow-2xl space-y-2 sm:space-y-2.5 w-full shrink-0">
              {/* Top Row: Icon + Title + Close Button */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/20 border border-[#0D3B36]/20 dark:border-amber-400/40 text-[#0D3B36] dark:text-amber-300 shrink-0">
                    <Users className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs xs:text-sm sm:text-base font-black tracking-wide uppercase text-[#0D3B36] dark:text-amber-300 leading-snug break-words">
                      ALL MASTER APPRENTICES & TRAINEES ({apprentices.length})
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight mt-0.5 hidden xs:block">
                      Master supervision roster, curriculum task evaluation, and certificate issuance.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllApprenticesModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shrink-0"
                  title="Close Screen"
                >
                  <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Subtitle for mobile & Action Row */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight xs:hidden">
                  Master supervision roster & task evaluation.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsAllApprenticesModalOpen(false);
                    onOpenCustomTaskModal();
                  }}
                  className="w-full xs:w-auto ml-auto px-3.5 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white dark:text-[#0D3B36]" />
                  <span>+ Assign Duty</span>
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
                  placeholder="Filter apprentices by name, status, or duty..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#041614] border border-slate-300 dark:border-amber-400/30 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-xs"
                />
              </div>

              {/* Apprentice Cards List */}
              {(() => {
                const modalFilteredApprentices = apprentices.filter((apprentice) => {
                  if (!modalSearchQuery.trim()) return true;
                  const q = modalSearchQuery.toLowerCase();
                  return (
                    apprentice.name.toLowerCase().includes(q) ||
                    (apprentice.status && apprentice.status.toLowerCase().includes(q))
                  );
                });

                if (modalFilteredApprentices.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-amber-200/70 font-semibold bg-white dark:bg-[#041614] rounded-2xl border border-slate-200 dark:border-amber-400/20 shadow-xs">
                      No apprentices matched "{modalSearchQuery}".
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {modalFilteredApprentices.map((apprentice) => {
                      const isHandshakeApproved = !apprentice.handshakeLocked;
                      const assignedDuties = tasks.filter(
                        (t) => t.assignedTo === 'all' || t.assignedTo === apprentice.id || t.assignedTo === apprentice.name
                      );
                      const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
                      const isCurriculumCompleted =
                        isHandshakeApproved ||
                        apprentice.status === 'Graduating' ||
                        (assignedDuties.length > 0 && passedDuties.length === assignedDuties.length);

                      return (
                        <div
                          key={apprentice.id}
                          className="glass-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#061E1B] border border-slate-200 dark:border-white/10 space-y-3 sm:space-y-4 shadow-xs hover:border-[#0D3B36]/30 dark:hover:border-amber-400/40 transition-all"
                        >
                          {/* Top Apprentice Profile Row */}
                          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0D3B36] text-amber-300 font-black text-xs sm:text-base flex items-center justify-center border border-amber-400/30 shrink-0 shadow-xs">
                                {apprentice.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                                  {apprentice.name}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 flex-wrap">
                                  <span>{apprentice.specialty || apprentice.role || 'Bespoke Trainee'}</span>
                                  <span>•</span>
                                  <span className="text-[#0D3B36] dark:text-amber-300 font-bold">
                                    {passedDuties.length}/{assignedDuties.length} Duties Passed
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons Grid for Mobile */}
                            <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-1.5 w-full xs:w-auto shrink-0 pt-2 xs:pt-0 border-t xs:border-t-0 border-slate-100 dark:border-slate-800">
                              {/* Handshake Toggle Button */}
                              <button
                                type="button"
                                disabled={!isCurriculumCompleted}
                                onClick={() => {
                                  if (!isCurriculumCompleted) return;
                                  if (onToggleHandshake) onToggleHandshake(apprentice.id);
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-2xs truncate ${
                                  isHandshakeApproved
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-pointer'
                                    : !isCurriculumCompleted
                                    ? 'bg-slate-200 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-300 dark:border-slate-800 cursor-not-allowed opacity-60'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 cursor-pointer'
                                }`}
                                title={
                                  isHandshakeApproved
                                    ? 'Master Handshake Granted (Approved)'
                                    : !isCurriculumCompleted
                                    ? `Handshake Locked 🔒: Complete curriculum/hours first (${passedDuties.length}/${assignedDuties.length} passed)`
                                    : 'Grant Master Handshake Approval'
                                }
                              >
                                <Handshake className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {isHandshakeApproved
                                    ? 'Approved ✓'
                                    : !isCurriculumCompleted
                                    ? 'Handshake 🔒'
                                    : 'Handshake 🤝'}
                                </span>
                              </button>

                              {/* Certificate Button */}
                              {(() => {
                                const payment = getGraduationPayment(apprentice.id);
                                const isCertPaid = payment?.isPaid || false;

                                return (
                                  <button
                                    type="button"
                                    disabled={!isCurriculumCompleted}
                                    onClick={() => {
                                      if (!isCurriculumCompleted) return;
                                      if (!isCertPaid) {
                                        if (onOpenGraduationPaymentModal) {
                                          onOpenGraduationPaymentModal(apprentice);
                                        } else {
                                          alert(`Graduation fee payment (GHS 250) is required to unlock certificate for ${apprentice.name}.`);
                                        }
                                      } else {
                                        setSelectedCertApprentice(apprentice);
                                      }
                                    }}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-xs truncate ${
                                      !isCurriculumCompleted
                                        ? 'bg-slate-200 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-300 dark:border-slate-800 cursor-not-allowed opacity-60'
                                        : !isCertPaid
                                        ? 'bg-amber-400 hover:bg-amber-300 text-[#061E1B] border border-amber-500 cursor-pointer active:scale-95 font-black'
                                        : 'bg-[#061E1B] hover:bg-[#041412] text-amber-300 border border-[#DCA134] cursor-pointer active:scale-95'
                                    }`}
                                    title={
                                      !isCurriculumCompleted
                                        ? `Certificate Locked 🔒: Available upon curriculum completion & GHS 250 fee payment (${passedDuties.length}/${assignedDuties.length} passed)`
                                        : !isCertPaid
                                        ? 'Pay GHS 250 Graduation Fee to Unlock Certificate 📜'
                                        : 'View & Print Graduation Certificate 📜'
                                    }
                                  >
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      {!isCurriculumCompleted
                                        ? 'Cert 🔒'
                                        : !isCertPaid
                                        ? 'Pay Cert 📜'
                                        : 'Cert 📜'}
                                    </span>
                                  </button>
                                );
                              })()}

                              {/* Assign Duty Button */}
                              <button
                                type="button"
                                onClick={() => onOpenCustomTaskModal()}
                                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0D3B36] hover:bg-[#061E1B] dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
                              >
                                <Plus className="w-3.5 h-3.5 shrink-0" />
                                <span>Assign</span>
                              </button>

                              {/* Unbind Button */}
                              {onUnlinkApprentice && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Unbind ${apprentice.name} from studio?`)) {
                                      onUnlinkApprentice(apprentice.id);
                                    }
                                  }}
                                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
                                  title="Unbind Apprentice"
                                >
                                  <UserX className="w-3.5 h-3.5 shrink-0" />
                                  <span>Unbind</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress Evaluation Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                              <span>Master Training Progress</span>
                              <span className="text-[#0D3B36] dark:text-amber-300">
                                {assignedDuties.length > 0
                                  ? `${Math.round((passedDuties.length / assignedDuties.length) * 100)}%`
                                  : '0%'}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    assignedDuties.length > 0
                                      ? (passedDuties.length / assignedDuties.length) * 100
                                      : 0
                                  }%`
                                }}
                              />
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
                Showing {apprentices.length} registered apprentices in studio roster
              </span>
              <button
                type="button"
                onClick={() => setIsAllApprenticesModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-amber-400/40 font-bold text-xs cursor-pointer transition-all active:scale-95 text-center"
              >
                Close Training Roster
              </button>
            </div>

          </div>
        </div>
      )}

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
