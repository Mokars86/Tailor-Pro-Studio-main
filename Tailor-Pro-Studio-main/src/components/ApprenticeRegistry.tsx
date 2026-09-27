import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, RefreshCw, Handshake, Sparkles, CheckCircle2, QrCode, KeyRound, Info, Copy, Check, Clock, UserX, Users, ChevronDown, ChevronUp, Eye, X, Search, GraduationCap, Award, FileText, Download, Archive, ShieldCheck, Printer } from 'lucide-react';
import { Apprentice, ApprenticeTask } from '../types';
import { CurriculumTemplateModal } from './modals/CurriculumTemplateModal';
import { ApprenticeCertificateModal } from './modals/ApprenticeCertificateModal';
import { generateMasterWorkshopCode } from '../utils/workshopCode';
import { getGraduationPayment, canLinkApprentice } from '../services/subscriptionService';
import { downloadOrShareDocument } from '../utils/mobileDocumentDownloader';

export interface GraduatedAlumniRecord {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  mentor: string;
  hoursCompleted: number;
  totalRequiredHours: number;
  graduatedAt: string;
  certNumber: string;
  passedTasksCount: number;
  totalTasksCount: number;
  passedDutiesTitles: string[];
}

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
  const [expandedPassedTasks, setExpandedPassedTasks] = useState<Record<string, boolean>>({});

  // Registry Tab: 'active' (enrolled apprentices) | 'graduated' (alumni history reference)
  const [registryTab, setRegistryTab] = useState<'active' | 'graduated'>('active');
  const [alumniSearchQuery, setAlumniSearchQuery] = useState('');

  // Persisted list of Graduated Alumni
  const [graduatedAlumni, setGraduatedAlumni] = useState<GraduatedAlumniRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tailor_graduated_alumni_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auto-sync active graduated apprentices into permanent alumni history
  useEffect(() => {
    let updated = false;
    const currentAlumni = [...graduatedAlumni];

    apprentices.forEach((apprentice) => {
      const assignedDuties = tasks.filter(
        (t) => t.assignedTo === 'all' || t.assignedTo === apprentice.id || t.assignedTo === apprentice.name
      );
      const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
      const isGraduated =
        apprentice.status === 'Graduated' ||
        apprentice.hasCert === true ||
        (!apprentice.handshakeLocked && passedDuties.length >= 13);

      if (isGraduated) {
        const exists = currentAlumni.some((a) => a.id === apprentice.id);
        if (!exists) {
          currentAlumni.push({
            id: apprentice.id,
            name: apprentice.name,
            initials: apprentice.initials || apprentice.name.slice(0, 2).toUpperCase(),
            role: apprentice.role || 'Graduated Bespoke Tailor',
            specialty: apprentice.specialty || 'Master Garment Construction',
            mentor: apprentice.mentor || masterTrainer || 'Kausara Mohammed',
            hoursCompleted: apprentice.hoursCompleted || 500,
            totalRequiredHours: apprentice.totalRequiredHours || 500,
            graduatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            certNumber: `CERT-MOKARS-${new Date().getFullYear()}-${apprentice.id.toUpperCase().slice(-5)}`,
            passedTasksCount: passedDuties.length,
            totalTasksCount: assignedDuties.length,
            passedDutiesTitles: passedDuties.map((d) => d.title)
          });
          updated = true;
        }
      }
    });

    if (updated) {
      setGraduatedAlumni(currentAlumni);
      localStorage.setItem('tailor_graduated_alumni_history', JSON.stringify(currentAlumni));
    }
  }, [apprentices, tasks, masterTrainer]);

  const handleGraduateAndArchive = (apprentice: Apprentice) => {
    const assignedDuties = tasks.filter(
      (t) => t.assignedTo === 'all' || t.assignedTo === apprentice.id || t.assignedTo === apprentice.name
    );
    const passedDuties = assignedDuties.filter((t) => t.status === 'passed');

    const newRecord: GraduatedAlumniRecord = {
      id: apprentice.id,
      name: apprentice.name,
      initials: apprentice.initials || apprentice.name.slice(0, 2).toUpperCase(),
      role: apprentice.role || 'Graduated Bespoke Tailor',
      specialty: apprentice.specialty || 'Master Garment Construction',
      mentor: apprentice.mentor || masterTrainer || 'Kausara Mohammed',
      hoursCompleted: apprentice.hoursCompleted || 500,
      totalRequiredHours: apprentice.totalRequiredHours || 500,
      graduatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      certNumber: `CERT-MOKARS-${new Date().getFullYear()}-${apprentice.id.toUpperCase().slice(-5)}`,
      passedTasksCount: passedDuties.length,
      totalTasksCount: assignedDuties.length,
      passedDutiesTitles: passedDuties.map((d) => d.title)
    };

    const next = [...graduatedAlumni.filter((a) => a.id !== apprentice.id), newRecord];
    setGraduatedAlumni(next);
    localStorage.setItem('tailor_graduated_alumni_history', JSON.stringify(next));

    if (onUnlinkApprentice) {
      onUnlinkApprentice(apprentice.id);
    }
    setCurriculumNotice(`Graduated & archived ${apprentice.name} to Master Atelier Alumni Roster! 🎓`);
    setTimeout(() => setCurriculumNotice(null), 3500);
  };

  const handlePrintAlumniRecommendationLetter = async (alumni: GraduatedAlumniRecord) => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const letterHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Master Letter of Recommendation - ${alumni.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; background: #fff !important; }
              button { display: none !important; }
            }
            body { font-family: 'Georgia', serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff; line-height: 1.6; }
            .header { border-bottom: 3px double #0d3b36; padding-bottom: 20px; text-align: center; margin-bottom: 30px; }
            .studio-title { font-size: 24px; font-weight: 900; color: #0d3b36; letter-spacing: 2px; text-transform: uppercase; font-family: 'Cinzel', serif; }
            .sub-title { font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
            .cert-badge { background: #0d3b36; color: #dca134; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; margin-top: 10px; }
            .date { text-align: right; font-size: 12px; color: #64748b; margin-bottom: 25px; font-style: italic; }
            .salutation { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #0d3b36; }
            .content { font-size: 14px; color: #334155; text-align: justify; margin-bottom: 20px; }
            .skills-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin: 20px 0; }
            .skills-title { font-size: 12px; font-weight: bold; color: #0d3b36; text-transform: uppercase; margin-bottom: 8px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; color: #475569; }
            .signature-line { border-top: 1px solid #0d3b36; width: 220px; margin-top: 40px; padding-top: 5px; font-weight: bold; text-align: center; color: #0d3b36; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="studio-title">${studioName || 'MOKARS STITCHES STUDIO'}</div>
            <div class="sub-title">ATELIER ACADEMY OF ADVANCED GARMENT CONSTRUCTION</div>
            <div class="cert-badge">OFFICIAL LETTER OF RECOMMENDATION & CHARACTER TESTIMONIAL</div>
          </div>

          <div class="date">Date: ${today} | Ref: ${alumni.certNumber}</div>

          <div class="salutation">TO WHOM IT MAY CONCERN,</div>

          <div class="content">
            <p>It is with great pride and high regard that I write this official letter of recommendation for <strong>${alumni.name}</strong>, who has successfully completed the rigorous Haute Couture & Bespoke Garment Construction Apprenticeship Curriculum at <strong>${studioName || 'Mokars Stitches Studio'}</strong>.</p>
            
            <p>During their tenure under my direct mentorship, ${alumni.name} demonstrated exemplary work ethic, precision pattern drafting, garment tailoring skills, and dedication. They completed over <strong>${alumni.hoursCompleted} hours</strong> of supervised workshop training and successfully executed all <strong>${alumni.passedTasksCount} core curriculum mastery duties</strong> with outstanding technical accuracy.</p>

            <div class="skills-box">
              <div class="skills-title">MASTERED TECHNICAL COMPETENCIES & SPECIALIZATION:</div>
              <p style="margin: 0; font-size: 13px; color: #1e293b;">
                Specialty: <strong>${alumni.specialty}</strong><br/>
                Key Competencies: Bespoke Fitting & Measurement Analysis, Flat Pattern Manipulation, Haute Couture Finishing, Fabric Yardage Estimation, Machine Operation & Maintenance, Client Consultation.
              </p>
            </div>

            <p>${alumni.name} has proven to possess both the technical proficiency and professional maturity required for high-end fashion ateliers and commercial production houses. I unreservedly recommend them for any advanced tailoring, pattern cutting, or atelier management role.</p>
          </div>

          <div class="footer">
            <div>
              <strong>Official Verification:</strong><br/>
              Certificate ID: ${alumni.certNumber}<br/>
              Graduation Date: ${alumni.graduatedAt}
            </div>
            <div>
              <div class="signature-line">
                ${masterTrainer || alumni.mentor || 'KAUSARA MOHAMMED'}<br/>
                <span style="font-size: 10px; font-weight: normal; color: #64748b;">Master Tailor & Atelier Principal</span>
              </div>
            </div>
          </div>

          <script>
            function startPrint() {
              setTimeout(function() {
                window.print();
              }, 400);
            }
            if (document.readyState === 'complete') {
              startPrint();
            } else {
              window.addEventListener('load', startPrint);
            }
          </script>
        </body>
      </html>
    `;

    await downloadOrShareDocument({
      filename: `Master_Recommendation_Letter_${alumni.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`,
      title: `Master Letter of Recommendation - ${alumni.name}`,
      htmlContent: letterHtml,
      text: `Official Master Recommendation Letter for ${alumni.name} from ${studioName || 'Mokars Stitches Studio'}.`
    });
  };

  const togglePassedTasks = (apprenticeId: string) => {
    setExpandedPassedTasks((prev) => ({
      ...prev,
      [apprenticeId]: !prev[apprenticeId]
    }));
  };

  const handleCopyPairCode = () => {
    navigator.clipboard.writeText(pairCode);
    setCopiedPairCode(true);
    setTimeout(() => setCopiedPairCode(false), 2000);
  };

  const handleManualRefresh = () => {
    if (linkCheck.isExpired) {
      alert(linkCheck.reason || 'Subscription Plan Expired: Cannot sync with apprentices until you renew your subscription plan.');
      if (onTriggerUpgradeModal) {
        onTriggerUpgradeModal();
      }
      return;
    }
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

      {/* Free Tier / Subscription Expired Apprentice Limit Banner */}
      {!linkCheck.allowed && (
        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center justify-between flex-wrap gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {linkCheck.isExpired
                ? 'Subscription Expired: Apprentice syncing and profile linking is currently restricted. Please renew your subscription to resume workshop sync.'
                : `Free Tier Limit: Tailor Pro Free allows linking max 1 apprentice profile (${apprentices.length}/1). Upgrade to Master Pro for unlimited linked apprentices!`}
            </span>
          </div>
          {onTriggerUpgradeModal && (
            <button
              type="button"
              onClick={onTriggerUpgradeModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-xs flex items-center gap-1 shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{linkCheck.isExpired ? 'Renew Subscription 👑' : 'Upgrade to Master 👑'}</span>
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

      {/* Registry Mode Switcher Pills: Active Trainees vs Graduated Alumni History */}
      <div className="flex items-center justify-between gap-2 bg-[#041916] p-1.5 rounded-2xl border border-amber-400/30 relative z-10">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRegistryTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              registryTab === 'active'
                ? 'bg-[#DCA134] text-[#0D3B36] shadow-xs'
                : 'text-amber-100/70 hover:text-white bg-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Trainees ({apprentices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setRegistryTab('graduated')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              registryTab === 'graduated'
                ? 'bg-[#DCA134] text-[#0D3B36] shadow-xs'
                : 'text-amber-100/70 hover:text-white bg-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Graduated Alumni History 🎓 ({graduatedAlumni.length})</span>
          </button>
        </div>
      </div>

      {/* Main Apprentice List Grid */}
      {registryTab === 'graduated' ? (
        <div className="space-y-3 relative z-10 animate-fade-in">
          {/* Alumni Search & Header */}
          <div className="bg-[#082824] p-3 rounded-2xl border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#DCA134]" />
                <span>Atelier Master Alumni Registry ({graduatedAlumni.length})</span>
              </span>
              <span className="text-[10px] text-amber-200/80 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                Permanent Reference Archive
              </span>
            </div>
            
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={alumniSearchQuery}
                onChange={(e) => setAlumniSearchQuery(e.target.value)}
                placeholder="Filter alumni by name, specialty, or certificate ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#041916] border border-amber-400/30 text-xs font-bold text-white placeholder-amber-200/40 focus:outline-none focus:ring-1 focus:ring-[#DCA134]"
              />
            </div>
          </div>

          {/* List of Graduated Alumni Cards */}
          {(() => {
            const filteredAlumni = graduatedAlumni.filter((alumni) => {
              if (!alumniSearchQuery.trim()) return true;
              const q = alumniSearchQuery.toLowerCase();
              return (
                alumni.name.toLowerCase().includes(q) ||
                (alumni.specialty && alumni.specialty.toLowerCase().includes(q)) ||
                (alumni.certNumber && alumni.certNumber.toLowerCase().includes(q))
              );
            });

            if (filteredAlumni.length === 0) {
              return (
                <div className="p-6 text-center text-xs text-amber-200/80 font-bold bg-[#082824] rounded-2xl border border-amber-400/30 space-y-1">
                  <GraduationCap className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                  <p>No Graduated Alumni Records Found</p>
                  <p className="text-[11px] text-white/50 font-normal">
                    {alumniSearchQuery.trim()
                      ? `No alumni records matched "${alumniSearchQuery}".`
                      : 'Apprentices who complete their 13 core curriculum duties and earn their certificate will be automatically recorded here as permanent reference.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredAlumni.map((alumni) => {
                  const isPassedExpanded = Boolean(expandedPassedTasks[`alumni_${alumni.id}`]);

                  return (
                    <div
                      key={alumni.id}
                      className="bg-[#082824] rounded-2xl p-3.5 sm:p-5 border-2 border-amber-400/50 shadow-xl space-y-3 text-white"
                    >
                      {/* Row 1: Profile & Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#041916] border-2 border-[#DCA134] text-[#DCA134] font-black flex items-center justify-center text-xs sm:text-sm shadow-md shrink-0 relative">
                            <span>{alumni.initials}</span>
                            <span className="absolute -top-1 -right-1 text-xs">👑</span>
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                              <span>{alumni.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
                                Graduated ✓
                              </span>
                            </h3>
                            <p className="text-[11px] text-amber-200/90 font-semibold truncate mt-0.5">
                              {alumni.specialty || 'Master Garment Tailor'} • Graduated: <strong>{alumni.graduatedAt}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Cert Serial Badge */}
                        <div className="px-3 py-1 rounded-xl bg-[#041916] border border-amber-400/30 text-right shrink-0">
                          <span className="text-[8px] font-black text-amber-300 uppercase tracking-widest block">
                            CERTIFICATE SERIAL ID
                          </span>
                          <span className="font-mono text-xs font-black text-white">
                            {alumni.certNumber}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Metrics */}
                      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-[#041916] border border-amber-400/20">
                          <span className="text-[9px] font-bold text-amber-300 uppercase block">HOURS LOGGED</span>
                          <span className="font-black text-xs text-white">{alumni.hoursCompleted} / {alumni.totalRequiredHours} hrs</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#041916] border border-amber-400/20">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase block">CURRICULUM DUTIES</span>
                          <span className="font-black text-xs text-emerald-300">{alumni.passedTasksCount} Passed ✓</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#041916] border border-amber-400/20 col-span-2 xs:col-span-1">
                          <span className="text-[9px] font-bold text-amber-300 uppercase block">MASTER TRAINER</span>
                          <span className="font-black text-xs text-white truncate block">{alumni.mentor}</span>
                        </div>
                      </div>

                      {/* Row 3: Action Buttons */}
                      <div className="pt-2 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Re-print Recommendation Letter Button */}
                          <button
                            type="button"
                            onClick={() => handlePrintAlumniRecommendationLetter(alumni)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            title="Print Master Recommendation Letter for this Alumni"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#DCA134]" />
                            <span>Recommendation Letter 📜</span>
                          </button>

                          {/* Toggle Passed Duties List */}
                          {alumni.passedDutiesTitles && alumni.passedDutiesTitles.length > 0 && (
                            <button
                              type="button"
                              onClick={() => togglePassedTasks(`alumni_${alumni.id}`)}
                              className="px-3 py-1.5 rounded-xl bg-[#041916] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isPassedExpanded ? 'Hide Duties' : 'View Duties Log'}</span>
                              {isPassedExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Collapsible Passed Duties List for Alumni */}
                      {isPassedExpanded && alumni.passedDutiesTitles && (
                        <div className="p-3 rounded-xl bg-[#041916] border border-emerald-500/30 space-y-1.5 text-xs animate-fade-in">
                          <span className="font-extrabold text-emerald-400 uppercase text-[10px] tracking-wider block">
                            Executed Master Duties Log ({alumni.passedDutiesTitles.length}):
                          </span>
                          <ul className="space-y-1 pl-2 text-[11px] text-slate-200">
                            {alumni.passedDutiesTitles.map((title, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
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
                    const pendingDuties = assignedDuties.filter((t) => t.status !== 'passed');
                    const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
                    const isPassedExpanded = Boolean(expandedPassedTasks[apprentice.id]);
                    
                    // Strict Curriculum Completion: Requires all 13 core curriculum tasks passed (or explicit graduation status)
                    const TOTAL_CORE_CURRICULUM_TASKS = 13;
                    const isCurriculumCompleted =
                      apprentice.status === 'Graduated' ||
                      apprentice.hasCert === true ||
                      (passedDuties.length >= TOTAL_CORE_CURRICULUM_TASKS && passedDuties.length === assignedDuties.length) ||
                      (apprentice.totalRequiredHours > 0 && apprentice.hoursCompleted >= apprentice.totalRequiredHours && passedDuties.length >= TOTAL_CORE_CURRICULUM_TASKS && passedDuties.length === assignedDuties.length);

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
                                  ? `Handshake Locked 🔒: Requires full curriculum completion (${passedDuties.length}/13 core tasks passed)`
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
                                        alert(`Graduation fee payment (GHS 300) is required to unlock certificate for ${apprentice.name}.`);
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
                                      ? `Certificate Locked 🔒: Requires full curriculum completion (${passedDuties.length}/13 core tasks passed)`
                                      : !isCertPaid
                                      ? 'Pay GHS 300 Graduation Fee to Unlock Certificate 📜'
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

                            {/* Graduate & Archive Button */}
                            {isCurriculumCompleted && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Graduate and archive ${apprentice.name} to the Master Atelier Alumni History Roster?`)) {
                                    handleGraduateAndArchive(apprentice);
                                  }
                                }}
                                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] sm:text-xs font-extrabold border border-amber-400/40 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer truncate"
                                title="Graduate & Archive apprentice to permanent Alumni History"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                <span className="truncate">Graduate 🎓</span>
                              </button>
                            )}

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
                      <div className="pt-3 border-t border-amber-400/20 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm truncate">
                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DCA134] shrink-0" />
                            <span className="truncate">Assigned Duties & Evaluation</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {pendingDuties.length > 0 && (
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                                {pendingDuties.length} Active
                              </span>
                            )}
                            {passedDuties.length > 0 && (
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/40">
                                {passedDuties.length} Passed ✓
                              </span>
                            )}
                          </div>
                        </div>

                        {assignedDuties.length === 0 ? (
                          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#041916] border border-amber-400/30 text-[11px] sm:text-xs font-semibold text-slate-200 text-center">
                            No active duties assigned. Click "+ Assign Duty" above to delegate a task.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {/* Active / Pending Duties List */}
                            {pendingDuties.length > 0 && (
                              <div className="space-y-2">
                                {pendingDuties.map((duty) => {
                                  const isReviewPending = duty.status === 'review_pending' || duty.isCompleted;

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
                                        {isReviewPending ? (
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
                                        {onPassTask && (
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

                            {/* Collapsible Passed Tasks Section */}
                            {passedDuties.length > 0 && (
                              <div className="space-y-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => togglePassedTasks(apprentice.id)}
                                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="font-extrabold uppercase tracking-wide text-[11px] sm:text-xs">
                                      Passed Tasks ({passedDuties.length})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-300 font-extrabold">
                                    <span>{isPassedExpanded ? 'Hide Passed' : 'Show Passed'}</span>
                                    {isPassedExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                                  </div>
                                </button>

                                {isPassedExpanded && (
                                  <div className="space-y-2 pt-1 pl-1 sm:pl-2 border-l-2 border-emerald-500/30 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                    {passedDuties.map((duty) => (
                                      <div
                                        key={duty.id}
                                        className="p-2.5 sm:p-3 rounded-xl bg-[#041916]/80 border border-emerald-500/30 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="font-extrabold text-white text-xs sm:text-sm truncate flex items-center gap-1.5">
                                            <span className="text-emerald-400 font-bold">✓</span>
                                            <span>{duty.title}</span>
                                          </p>
                                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-emerald-200/80 font-medium mt-0.5 flex-wrap">
                                            <span className="font-bold text-emerald-400">{duty.category || 'Workshop Duty'}</span>
                                            {duty.passedAt && <span>· Passed: {duty.passedAt}</span>}
                                          </div>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-400/40 flex items-center gap-1 shrink-0 self-end xs:self-auto">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                          <span>Passed ✓</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
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
      </div>)}

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
                      const pendingDuties = assignedDuties.filter((t) => t.status !== 'passed');
                      const passedDuties = assignedDuties.filter((t) => t.status === 'passed');
                      const isPassedExpanded = Boolean(expandedPassedTasks[`modal_${apprentice.id}`]);

                      // Strict Curriculum Completion: Requires all 13 core curriculum tasks passed (or explicit graduation status)
                      const TOTAL_CORE_CURRICULUM_TASKS = 13;
                      const isCurriculumCompleted =
                        apprentice.status === 'Graduated' ||
                        apprentice.hasCert === true ||
                        (passedDuties.length >= TOTAL_CORE_CURRICULUM_TASKS && passedDuties.length === assignedDuties.length) ||
                        (apprentice.totalRequiredHours > 0 && apprentice.hoursCompleted >= apprentice.totalRequiredHours && passedDuties.length >= TOTAL_CORE_CURRICULUM_TASKS && passedDuties.length === assignedDuties.length);

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
                                    ? `Handshake Locked 🔒: Requires full curriculum completion (${passedDuties.length}/13 core tasks passed)`
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
                                          alert(`Graduation fee payment (GHS 300) is required to unlock certificate for ${apprentice.name}.`);
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
                                        ? `Certificate Locked 🔒: Requires full curriculum completion (${passedDuties.length}/13 core tasks passed)`
                                        : !isCertPaid
                                        ? 'Pay GHS 300 Graduation Fee to Unlock Certificate 📜'
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

                          {/* Assigned Duties & Evaluation List in Modal */}
                          {assignedDuties.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              {/* Active / Pending Duties List */}
                              {pendingDuties.length > 0 && (
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-extrabold text-[#0D3B36] dark:text-amber-300 uppercase tracking-wider">
                                    Active Duties ({pendingDuties.length})
                                  </div>
                                  {pendingDuties.map((duty) => {
                                    const isReviewPending = duty.status === 'review_pending' || duty.isCompleted;

                                    return (
                                      <div
                                        key={duty.id}
                                        className="p-2 rounded-xl bg-slate-50 dark:bg-[#041916] border border-slate-200 dark:border-amber-400/30 flex items-center justify-between gap-2 text-xs"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                                            {duty.title}
                                          </p>
                                          <div className="text-[10px] text-slate-500 dark:text-amber-200/80 font-medium">
                                            {duty.category || 'Workshop Duty'} {duty.dueDate && `· Due: ${duty.dueDate}`}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {isReviewPending ? (
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/25 text-indigo-800 dark:text-indigo-200 text-[10px] font-black uppercase border border-indigo-200 dark:border-indigo-400/50">
                                              Pending
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/25 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase border border-amber-200 dark:border-amber-400/50">
                                              In Progress
                                            </span>
                                          )}
                                          {onPassTask && (
                                            <button
                                              type="button"
                                              onClick={() => onPassTask(duty.id)}
                                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                            >
                                              <CheckCircle2 className="w-3 h-3" />
                                              <span>Pass</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Collapsible Passed Tasks in Modal */}
                              {passedDuties.length > 0 && (
                                <div className="space-y-1.5 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => togglePassedTasks(`modal_${apprentice.id}`)}
                                    className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      <span className="font-extrabold uppercase text-[10px] sm:text-[11px]">
                                        Passed Tasks ({passedDuties.length})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-extrabold">
                                      <span>{isPassedExpanded ? 'Hide' : 'Show'}</span>
                                      {isPassedExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                                    </div>
                                  </button>

                                  {isPassedExpanded && (
                                    <div className="space-y-1.5 pt-1 pl-1.5 border-l-2 border-emerald-400 dark:border-emerald-500/30 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                      {passedDuties.map((duty) => (
                                        <div
                                          key={duty.id}
                                          className="p-2 rounded-xl bg-white dark:bg-[#041916]/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-2 text-xs"
                                        >
                                          <div className="min-w-0 flex-1">
                                            <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1">
                                              <span className="text-emerald-500 font-bold">✓</span>
                                              <span>{duty.title}</span>
                                            </p>
                                            <div className="text-[10px] text-slate-500 dark:text-emerald-200/80 font-medium">
                                              {duty.category || 'Workshop Duty'} {duty.passedAt && `· Passed: ${duty.passedAt}`}
                                            </div>
                                          </div>
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase border border-emerald-200 dark:border-emerald-400/40 shrink-0">
                                            Passed ✓
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

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
