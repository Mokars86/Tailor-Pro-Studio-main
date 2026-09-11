import React, { useState } from 'react';
import { Sparkles, Lock, ChevronDown, ChevronUp, Award, Printer, Handshake, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { ApprenticeCertificateModal } from '../../modals/ApprenticeCertificateModal';
import { GraduationPaymentModal } from '../../modals/GraduationPaymentModal';
import { Apprentice, ApprenticeTask, Client } from '../../../types';
import { getGraduationPayment } from '../../../services/subscriptionService';

interface ApprenticeMilestonesTabProps {
  apprenticeName?: string;
  masterName?: string;
  studioName?: string;
  studioLogoUrl?: string;
  apprentice?: Apprentice;
  tasks?: ApprenticeTask[];
  clients?: Client[];
  onToggleHandshake?: (id: string) => void;
}

export const ApprenticeMilestonesTab: React.FC<ApprenticeMilestonesTabProps> = ({
  apprenticeName = 'Apprentice Trainee',
  masterName = 'Master Trainer',
  studioName = 'MOKARS STITCHES STUDIO',
  studioLogoUrl,
  apprentice,
  tasks = [],
  clients = [],
  onToggleHandshake
}) => {
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Default checked units for basic stage
  const [checkedUnits, setCheckedUnits] = useState<string[]>([
    'Body Measurements & Tape Handling',
    'Fabric Pressing & Steam Ironing',
    'Fabric Identification & Color Matching',
    'Hand Sewing & Button Attachments'
  ]);

  const activeApprentice: Apprentice = apprentice || {
    id: `app_${Date.now()}`,
    name: apprenticeName,
    initials: apprenticeName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT',
    role: 'Apprentice Trainee & Scholar',
    mentor: masterName,
    isLinked: true,
    handshakeLocked: true, // Locked by default until master approves handshake
    hasCert: false,
    hoursCompleted: 0,
    totalRequiredHours: 120,
    certifications: [],
    tasksCount: 0,
    status: 'On Track',
    specialty: 'Couture Assembly & Pattern Cutting'
  };

  const isHandshakeApproved = !activeApprentice.handshakeLocked;

  const toggleUnitCheck = (unitName: string) => {
    setCheckedUnits((prev) =>
      prev.includes(unitName) ? prev.filter((u) => u !== unitName) : [...prev, unitName]
    );
  };

  const stages = [
    {
      id: 1,
      title: 'Stage 1: Basic Stage (6 Units)',
      badge: 'IN TRAINING',
      badgeStyle: 'bg-[#0D3B36] text-amber-300 border-[#DCA134] font-extrabold',
      subtext: 'Measurements, Ironing, Fabric Colors, Buttons & Slits',
      units: [
        'Body Measurements & Tape Handling',
        'Fabric Pressing & Steam Ironing',
        'Fabric Identification & Color Matching',
        'Hand Sewing & Button Attachments',
        'Skirt & Dress Slits',
        'Basic Pattern Tracing'
      ]
    },
    {
      id: 2,
      title: 'Stage 2: Intermediate Stage (3 Units)',
      badge: 'IN PROGRESS',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      subtext: 'Simple Straight Dress, Zippers & Fabric Stiffening',
      units: [
        'Simple Straight Dress Construction',
        'Concealed Zippers & Seam Finishing',
        'Fabric Stiffening & Interfacing'
      ]
    },
    {
      id: 3,
      title: 'Stage 3: Advance Stage (4 Units)',
      badge: 'ADVANCED',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      subtext: 'Industrial Machine, Overlocking/Neating, Master Cutting & Finishes',
      units: [
        'Industrial Machine Operation & Tension',
        'Overlocking & Edging Neating',
        'Master Pattern Cutting Principles',
        'High-End Garment Finishing & Lining'
      ]
    },
    {
      id: 4,
      title: 'Stage 4: Graduation Stage (1 Unit)',
      badge: isHandshakeApproved ? 'HANDSHAKE APPROVED ✓' : 'UNAPPROVED (HANDSHAKE LOCKED 🔒)',
      badgeStyle: isHandshakeApproved
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
        : 'bg-amber-100 text-[#B87C14] border-amber-300 font-extrabold',
      subtext: isHandshakeApproved
        ? 'Master Trainer Handshake Approved — Graduation Active ✓'
        : 'Handshake Unapproved — Pending Master Trainer Approval on Master Dashboard',
      units: [
        isHandshakeApproved
          ? 'Master Trainer Verification & Handshake Granted ✓'
          : 'Master Trainer Verification & Handshake Pending Approval 🔒'
      ]
    },
    {
      id: 5,
      title: 'Optional Track: Pattern Design (3 Units)',
      badge: 'OPTIONAL ELECTIVE',
      badgeStyle: 'bg-pink-100 text-pink-700 border-pink-300 font-bold',
      subtext: 'Flat Pattern Drafting, Dart Manipulation & Slopers',
      units: [
        'Flat Pattern Drafting & Dart Rotation',
        'Bodice & Skirt Sloper Construction',
        'Sleeve & Collar Pattern Variations'
      ]
    },
    {
      id: 6,
      title: 'Optional Track: Fashion Illustration (3 Units)',
      badge: 'OPTIONAL ELECTIVE',
      badgeStyle: 'bg-purple-100 text-purple-700 border-purple-300 font-bold',
      subtext: '9-Head Croquis, Technical Flats & Texture Rendering',
      units: [
        '9-Head Fashion Figure Croquis Sketching',
        'Technical Flat Sketching & Spec Sheets',
        'Fabric Texture Rendering & Swatch Coloring'
      ]
    },
    {
      id: 7,
      title: 'Optional Track: Drawing Patterns (3 Units)',
      badge: 'OPTIONAL ELECTIVE',
      badgeStyle: 'bg-cyan-100 text-cyan-700 border-cyan-300 font-bold',
      subtext: 'Manual Size Grading, Grainline Marking & Marker Layout',
      units: [
        'Manual Pattern Grading & Size Scaling',
        'Grainline & Seam Allowance Drawing',
        'Marker Paper Layout & Fabric Efficiency'
      ]
    },
    {
      id: 8,
      title: 'Optional Track: Couture Corsetry & Draping (2 Units)',
      badge: 'OPTIONAL ELECTIVE',
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      subtext: 'Underbust Corsetry, Boning Channels & Fabric Draping',
      units: [
        'Underbust Corset & Rigilene Boning Channels',
        'Dress Form Fabric Draping & Pinning'
      ]
    },
    {
      id: 9,
      title: 'Optional Track: Studio Business & Pricing (2 Units)',
      badge: 'OPTIONAL ELECTIVE',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      subtext: 'Garment Costing, Retail Margins & Client Fitting Consultations',
      units: [
        'Garment Costing & Retail Pricing Calculation',
        'Client Fitting Consultation & Alteration Logs'
      ]
    }
  ];

  // Dynamic Real-Data Progress Calculation
  const totalCoreUnits = 13; // Stages 1, 2 & 3 core curriculum units
  const totalAllUnits = stages.reduce((acc, s) => acc + s.units.length, 0);
  const unitsProgress = Math.round((checkedUnits.length / totalCoreUnits) * 100);

  const passedTasksCount = (tasks || []).filter((t) => t.isCompleted || t.status === 'passed').length;
  const totalTasksCount = (tasks || []).length;
  const taskProgress = totalTasksCount > 0 ? Math.round((passedTasksCount / totalTasksCount) * 100) : 0;

  const hoursCompleted = activeApprentice.hoursCompleted || 0;
  const totalRequiredHours = activeApprentice.totalRequiredHours || 120;
  const hoursProgress = Math.round((Math.min(hoursCompleted, totalRequiredHours) / totalRequiredHours) * 100);

  const realProgressPercent = isHandshakeApproved
    ? 100
    : Math.min(100, Math.max(unitsProgress, taskProgress, hoursProgress, 10));

  return (
    <div className="space-y-4 pt-2 sm:pt-2 font-['Outfit'] select-none">
      {/* Section 4.1: Progress Tracker Card */}
      <div className="bg-white/85 dark:bg-[#061E1B] backdrop-blur-md rounded-3xl p-3.5 sm:p-5 border border-white dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
            APPRENTICE CURRICULUM MASTERY PROGRESS
          </span>
          <span className="text-xs font-black text-[#0D3B36] dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            {isHandshakeApproved ? '100% Curriculum Approved ✓' : `${realProgressPercent}% Completed`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['Outfit'] font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
              {isHandshakeApproved ? 'Master Handshake Granted' : 'Apprentice Training Stage'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              {checkedUnits.length} of {totalAllUnits} Curriculum Units Mastered ({passedTasksCount} / {totalTasksCount} Tasks Passed)
            </p>
          </div>
        </div>

        {/* Dynamic Real-Data Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-[#0D3B36] via-[#10B981] to-[#DCA134] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${realProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Section 4.2: Official Curriculum Stage Checklist */}
      <div className="space-y-2.5">
        <h3 className="font-['Outfit'] font-black text-xs text-[#0D3B36] dark:text-amber-300 tracking-wider uppercase px-1">
          OFFICIAL CURRICULUM STAGE CHECKLIST (CLICK UNIT TO TOGGLE MASTERY)
        </h3>

        <div className="space-y-2.5">
          {stages.map((stg) => {
            const isExpanded = expandedStage === stg.id;

            return (
              <div
                key={stg.id}
                className="bg-white/85 dark:bg-[#061E1B] backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border border-white dark:border-white/10 shadow-2xs space-y-2 transition-all overflow-hidden"
              >
                <div
                  onClick={() => setExpandedStage(isExpanded ? null : stg.id)}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 cursor-pointer select-none"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-['Outfit'] font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {stg.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-normal">{stg.subtext}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold border max-w-full text-center truncate ${stg.badgeStyle}`}>
                      {stg.badge}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    )}
                  </div>
                </div>

                {/* Expanded Units List */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fade-in">
                    {stg.units.map((unit, idx) => {
                      const isChecked = checkedUnits.includes(unit) || isHandshakeApproved;

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleUnitCheck(unit)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold gap-2 transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="leading-snug">{unit}</span>
                          </div>
                          <span className={`text-[9.5px] font-bold uppercase shrink-0 px-2 py-0.5 rounded-md ${
                            isChecked ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'text-slate-400'
                          }`}>
                            {isChecked ? 'Verified ✓' : 'Pending ⭕'}
                          </span>
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

      {/* Section 4.3: Official Graduation Certificate Card */}
      <div className="bg-white/85 dark:bg-[#061E1B] backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white dark:border-white/10 shadow-sm space-y-4 text-center font-['Outfit']">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0D3B36] text-[#DCA134] flex items-center justify-center mx-auto shadow-md border-2 border-[#DCA134]">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCA134]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100">
            Official Graduation Certificate
          </h3>

          {isHandshakeApproved ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] sm:text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>🤝 Master Handshake Approved ✓</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-[#B87C14] dark:text-amber-300 border border-amber-300/80 text-[11px] sm:text-xs font-bold max-w-full">
              <Lock className="w-3.5 h-3.5 text-[#B87C14] dark:text-amber-300 shrink-0" />
              <span className="truncate">Pending Master Handshake Approval 🔒</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
          {isHandshakeApproved
            ? 'Your Master Trainer has granted Handshake Approval! Your official graduation certificate of competence is unlocked and ready to view or print.'
            : 'Handshake Unapproved. Your Master Trainer must approve your handshake on the Master Dashboard before you can view or download your certificate.'}
        </p>

        {/* Certificate View Action CTA */}
        {(() => {
          const certPayment = getGraduationPayment(activeApprentice.id);
          const isPaid = certPayment?.isPaid || false;

          return (
            <>
              <button
                type="button"
                disabled={!isHandshakeApproved}
                onClick={() => {
                  if (!isHandshakeApproved) return;
                  if (!isPaid) {
                    setIsPaymentModalOpen(true);
                  } else {
                    setIsCertModalOpen(true);
                  }
                }}
                className={`w-full py-3 px-3 sm:px-4 rounded-2xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-2 shadow-xs transition-all uppercase tracking-wider ${
                  !isHandshakeApproved
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-70'
                    : !isPaid
                    ? 'bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] active:scale-95 cursor-pointer shadow-md'
                    : 'bg-[#0D3B36] hover:bg-[#082824] text-white active:scale-95 cursor-pointer'
                }`}
                title={
                  !isHandshakeApproved
                    ? 'Certificate Locked: Master Trainer must approve your handshake on the Master Dashboard first'
                    : !isPaid
                    ? 'Pay GHS 300 graduation fee to unlock official certificate'
                    : 'View and print your official graduation certificate'
                }
              >
                {!isHandshakeApproved ? (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Certificate Locked 🔒 (Awaiting Approval)</span>
                  </div>
                ) : !isPaid ? (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap font-extrabold">
                    <Sparkles className="w-4 h-4 text-[#0D3B36] shrink-0" />
                    <span>Pay GHS 300 Graduation Fee & Unlock Certificate 📜</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <Sparkles className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>View / Print Official Graduation Certificate 📜</span>
                  </div>
                )}
              </button>

              <GraduationPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                apprentice={activeApprentice}
                onPaymentSuccess={() => {
                  setIsPaymentModalOpen(false);
                  setIsCertModalOpen(true);
                }}
              />
            </>
          );
        })()}
      </div>

      {/* Certificate Modal */}
      {isHandshakeApproved && (
        <ApprenticeCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          apprentice={activeApprentice}
          studioLogoUrl={studioLogoUrl}
          studioName={studioName}
          onToggleHandshake={(id) => {
            if (onToggleHandshake) {
              onToggleHandshake(id);
            }
          }}
        />
      )}
    </div>
  );
};
