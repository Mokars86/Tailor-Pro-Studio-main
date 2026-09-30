import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Plus,
  Handshake,
  CheckCircle2,
  PlusCircle,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Apprentice, ApprenticeTask } from '../../types';

interface CurriculumTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprentices?: Apprentice[];
  tasks?: ApprenticeTask[];
  initialApprenticeId?: string;
  onAssignTask?: (apprenticeName: string, taskTitle: string) => void;
}

export interface CurriculumTask {
  id: string;
  title: string;
  unit: string;
  description: string;
  buttonType?: 'default' | 'handshake';
  isCustomAdded?: boolean;
}

export interface CurriculumStage {
  id: string;
  stageTitle: string;
  taskCountLabel: string;
  borderColor: string;
  pillBg: string;
  pillTextColor: string;
  btnBg: string;
  btnHoverBg: string;
  tasks: CurriculumTask[];
}

const INITIAL_STAGES: CurriculumStage[] = [
  {
    id: 'basic',
    stageTitle: 'BASIC STAGE',
    taskCountLabel: 'BASIC STAGE',
    borderColor: 'border-[#3B82F6]',
    pillBg: 'bg-[#EFF6FF]',
    pillTextColor: 'text-[#1D4ED8]',
    btnBg: 'bg-[#2563EB]',
    btnHoverBg: 'hover:bg-blue-700',
    tasks: [
      {
        id: 'b1',
        title: 'TASK 1: MEASUREMENT',
        unit: 'Anatomical Measuring',
        description: 'Master anatomical tape measurements, waist, bust, shoulder, and length guidelines.'
      },
      {
        id: 'b2',
        title: 'TASK 2: IRONING',
        unit: 'Finishing & Pressing',
        description: 'Learn fabric temperature settings, seam pressing, and professional garment ironing.'
      },
      {
        id: 'b3',
        title: 'TASK 3: COLORS IDENTIFICATION OF FABRICS',
        unit: 'Fabrics & Textiles',
        description: 'Identify fabric weave types, color matching, grainlines, and fabric characteristics.'
      },
      {
        id: 'b4',
        title: 'TASK 4: BUTTON STITCHES ON FABRICS',
        unit: 'Hand Stitches & Fasteners',
        description: 'Practice hand buttonhole stitching, shank buttons, and flat button attachment.'
      },
      {
        id: 'b5',
        title: 'TASK 5: INTERNAL DRAWSTRINGS',
        unit: 'Garment Details',
        description: 'Learn casing creation, threading, and internal drawstring seam finishing.'
      },
      {
        id: 'b6',
        title: 'TASK 6: SLIT MAKING ALL TYPES',
        unit: 'Slits & Vent Openings',
        description: 'Construct side slits, back vents, bound slits, and overlap slit finishes.'
      }
    ]
  },
  {
    id: 'intermediate',
    stageTitle: 'INTERMEDIATE STAGE',
    taskCountLabel: 'INTERMEDIATE STAGE',
    borderColor: 'border-[#F59E0B]',
    pillBg: 'bg-[#FEF3C7]',
    pillTextColor: 'text-[#B45309]',
    btnBg: 'bg-[#D97706]',
    btnHoverBg: 'hover:bg-amber-700',
    tasks: [
      {
        id: 'i1',
        title: 'TASK 1: SEWING SIMPLE STRAIGHT DRESS (MANUAL SEWING MACHINE)',
        unit: 'Garment Assembly',
        description: 'Assemble a straight dress using manual treadle or electric sewing machine with straight seams.'
      },
      {
        id: 'i2',
        title: 'TASK 2: ZIP INSERTING ON DRESS',
        unit: 'Fastener Assembly',
        description: 'Insert concealed/invisible zippers and exposed zippers with proper alignment.'
      },
      {
        id: 'i3',
        title: 'TASK 3: ADD STIFF ON PIECES OF FABRICS',
        unit: 'Interfacing & Structuring',
        description: 'Apply fusible interfacing/stiffener to collars, cuffs, facings, and waistbands.'
      }
    ]
  },
  {
    id: 'advance',
    stageTitle: 'ADVANCE STAGE',
    taskCountLabel: 'ADVANCE STAGE',
    borderColor: 'border-[#A855F7]',
    pillBg: 'bg-[#F3E8FF]',
    pillTextColor: 'text-[#7E22CE]',
    btnBg: 'bg-[#7C3AED]',
    btnHoverBg: 'hover:bg-purple-700',
    tasks: [
      {
        id: 'a1',
        title: 'TASK 1: USING INDUSTRIAL MACHINE FOR SEWING',
        unit: 'Industrial Machinery',
        description: 'Master high-speed industrial lockstitch machine operation, tensioning, and speed control.'
      },
      {
        id: 'a2',
        title: 'TASK 2: USING A NEATING MACHINE',
        unit: 'Overlocking & Edging',
        description: 'Operate 3/4-thread overlock neating machine for seam edging and thread tension setup.'
      },
      {
        id: 'a3',
        title: 'TASK 3: LEARN CUTTING OF FABRIC FROM (MASTER INSTRUCTION)',
        unit: 'Pattern Cutting',
        description: 'Perform master fabric layout, grainline alignment, chalk marking, and precision cutting.'
      },
      {
        id: 'a4',
        title: 'TASK 4: FINISHES & TOUCHES',
        unit: 'Couture QC & Finishing',
        description: 'Execute thread trimming, hem finishing, hook-and-eye attachments, and final QC inspection.'
      }
    ]
  },
  {
    id: 'graduation',
    stageTitle: 'GRADUATION STAGES',
    taskCountLabel: 'GRADUATION STAGES',
    borderColor: 'border-[#10B981]',
    pillBg: 'bg-[#D1FAE5]',
    pillTextColor: 'text-[#047857]',
    btnBg: 'bg-[#059669]',
    btnHoverBg: 'hover:bg-emerald-700',
    tasks: [
      {
        id: 'g1',
        title: 'TASK 1: MASTER ACTIVATE HANDSHAKES',
        unit: 'Apprenticeship Graduation',
        description: 'Official Master Trainer Handshake activation to certify full trade competence.',
        buttonType: 'handshake'
      }
    ]
  },
  {
    id: 'opt-pattern-design',
    stageTitle: 'OPTIONAL: PATTERN DESIGN',
    taskCountLabel: 'OPTIONAL: PATTERN DESIGN',
    borderColor: 'border-[#EC4899]',
    pillBg: 'bg-[#FCE7F3]',
    pillTextColor: 'text-[#BE185D]',
    btnBg: 'bg-[#DB2777]',
    btnHoverBg: 'hover:bg-pink-700',
    tasks: [
      {
        id: 'opt-pd-1',
        title: 'TASK 1: FLAT PATTERN DRAFTING & DART MANIPULATION',
        unit: 'Pattern Design',
        description: 'Master flat pattern drafting, dart rotation, slash-and-spread method, and style line development.'
      },
      {
        id: 'opt-pd-2',
        title: 'TASK 2: BODICE & SKIRT SLOPER CONSTRUCTION',
        unit: 'Pattern Design',
        description: 'Construct precise master fitting slopers for bodice, skirt, and trousers based on anatomical measurements.'
      },
      {
        id: 'opt-pd-3',
        title: 'TASK 3: SLEEVE & COLLAR VARIATIONS',
        unit: 'Pattern Design',
        description: 'Design set-in sleeves, raglan sleeves, mandarin collars, lapels, and custom neckline variations.'
      }
    ]
  },
  {
    id: 'opt-illustration',
    stageTitle: 'OPTIONAL: FASHION ILLUSTRATION',
    taskCountLabel: 'OPTIONAL: FASHION ILLUSTRATION',
    borderColor: 'border-[#8B5CF6]',
    pillBg: 'bg-[#EDE9FE]',
    pillTextColor: 'text-[#6D28D9]',
    btnBg: 'bg-[#7C3AED]',
    btnHoverBg: 'hover:bg-violet-700',
    tasks: [
      {
        id: 'opt-fi-1',
        title: 'TASK 1: 9-HEAD FIGURE CROQUIS SKETCHING',
        unit: 'Fashion Illustration',
        description: 'Draw proportional 9-head fashion croquis poses for conceptualizing bespoke gown designs.'
      },
      {
        id: 'opt-fi-2',
        title: 'TASK 2: TECHNICAL FLAT SKETCHING & SPEC SHEETS',
        unit: 'Fashion Illustration',
        description: 'Create clear, production-ready technical flat sketches with seam callouts and trim specifications.'
      },
      {
        id: 'opt-fi-3',
        title: 'TASK 3: FABRIC TEXTURE RENDERING & COLORING',
        unit: 'Fashion Illustration',
        description: 'Render lace, satin, Ankara motifs, and sheer fabrics using colored pencils, markers, or watercolor.'
      }
    ]
  },
  {
    id: 'opt-drawing-patterns',
    stageTitle: 'OPTIONAL: DRAWING PATTERNS',
    taskCountLabel: 'OPTIONAL: DRAWING PATTERNS',
    borderColor: 'border-[#06B6D4]',
    pillBg: 'bg-[#CFFAFE]',
    pillTextColor: 'text-[#0E7490]',
    btnBg: 'bg-[#0891B2]',
    btnHoverBg: 'hover:bg-cyan-700',
    tasks: [
      {
        id: 'opt-dp-1',
        title: 'TASK 1: MANUAL PATTERN GRADING & SCALING',
        unit: 'Drawing Patterns',
        description: 'Grade base master patterns up and down across standard UK/US sizing charts manually.'
      },
      {
        id: 'opt-dp-2',
        title: 'TASK 2: GRAINLINE & SEAM ALLOWANCE MARKING',
        unit: 'Drawing Patterns',
        description: 'Draw precise 1.5in seam allowances, balance notches, fold lines, and grainline arrows on brown paper.'
      },
      {
        id: 'opt-dp-3',
        title: 'TASK 3: MARKER PAPER LAYOUT & FABRIC YIELD',
        unit: 'Drawing Patterns',
        description: 'Layout pattern pieces efficiently on fabric markers to minimize luxury fabric waste.'
      }
    ]
  },
  {
    id: 'opt-corsetry-draping',
    stageTitle: 'OPTIONAL: COUTURE CORSETRY & DRAPING',
    taskCountLabel: 'OPTIONAL: COUTURE CORSETRY & DRAPING',
    borderColor: 'border-[#D97706]',
    pillBg: 'bg-[#FEF3C7]',
    pillTextColor: 'text-[#92400E]',
    btnBg: 'bg-[#B45309]',
    btnHoverBg: 'hover:bg-amber-800',
    tasks: [
      {
        id: 'opt-cd-1',
        title: 'TASK 1: UNDERBUST CORSET & RIGILENE BONING',
        unit: 'Couture Corsetry',
        description: 'Channel and cap spiral steel/Rigilene boning for structured underbust and overbust corsets.'
      },
      {
        id: 'opt-cd-2',
        title: 'TASK 2: DRESS FORM FABRIC DRAPING',
        unit: 'Fabric Draping',
        description: 'Drape calico directly on dress form mannequins to create fluid asymmetrical cowls and gowns.'
      }
    ]
  },
  {
    id: 'opt-studio-business',
    stageTitle: 'OPTIONAL: STUDIO BUSINESS & PRICING',
    taskCountLabel: 'OPTIONAL: STUDIO BUSINESS & PRICING',
    borderColor: 'border-[#10B981]',
    pillBg: 'bg-[#D1FAE5]',
    pillTextColor: 'text-[#065F46]',
    btnBg: 'bg-[#059669]',
    btnHoverBg: 'hover:bg-emerald-800',
    tasks: [
      {
        id: 'opt-sb-1',
        title: 'TASK 1: GARMENT COSTING & RETAIL PRICING',
        unit: 'Studio Operations',
        description: 'Calculate fabric yield, labor hours, studio overheads, and retail markups for client quotes.'
      },
      {
        id: 'opt-sb-2',
        title: 'TASK 2: CLIENT FITTING CONSULTATION',
        unit: 'Studio Operations',
        description: 'Conduct professional fitting consultations, record alterations, and manage client spec logs.'
      }
    ]
  }
];

// Helper to determine if a curriculum task is passed or in-progress for an apprentice
export function getCurriculumTaskStatus(
  curriculumTask: CurriculumTask,
  apprentice: Apprentice | null | undefined,
  tasks: ApprenticeTask[] = []
): { isPassed: boolean; isAssigned: boolean; isPendingReview: boolean; taskRecord?: ApprenticeTask } {
  if (!apprentice) {
    return { isPassed: false, isAssigned: false, isPendingReview: false };
  }

  // If apprentice handshake is approved, handshake task is passed
  if (curriculumTask.buttonType === 'handshake' && !apprentice.handshakeLocked) {
    return { isPassed: true, isAssigned: true, isPendingReview: false };
  }

  const apprenticeTasks = tasks.filter(
    (t) =>
      t.assignedTo === 'all' ||
      t.assignedTo === apprentice.id ||
      (apprentice.name && t.assignedTo?.toLowerCase() === apprentice.name.toLowerCase())
  );

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normCurrTitle = normalize(curriculumTask.title);

  // Keyword extraction for reliable curriculum cross-matching
  const getKeywords = (title: string): string[] => {
    const kw: string[] = [];
    const t = title.toUpperCase();
    if (t.includes('MEASUREMENT')) kw.push('measurement');
    if (t.includes('IRONING')) kw.push('ironing');
    if (t.includes('COLOR')) kw.push('color');
    if (t.includes('BUTTON')) kw.push('button');
    if (t.includes('DRAWSTRING')) kw.push('drawstring');
    if (t.includes('SLIT')) kw.push('slit');
    if (t.includes('STRAIGHT DRESS')) kw.push('straight dress', 'sewing simple');
    if (t.includes('ZIP')) kw.push('zip');
    if (t.includes('STIFF')) kw.push('stiff');
    if (t.includes('INDUSTRIAL MACHINE')) kw.push('industrial');
    if (t.includes('NEATING')) kw.push('neating', 'overlock');
    if (t.includes('CUTTING')) kw.push('cutting');
    if (t.includes('FINISHES')) kw.push('finishes');
    if (t.includes('HANDSHAKE')) kw.push('handshake');
    if (t.includes('FLAT PATTERN') || t.includes('DART')) kw.push('flat pattern', 'dart');
    if (t.includes('SLOPER') || t.includes('BODICE')) kw.push('sloper', 'bodice');
    if (t.includes('SLEEVE') && t.includes('COLLAR')) kw.push('sleeve', 'collar');
    if (t.includes('CROQUIS') || t.includes('9-HEAD')) kw.push('croquis', '9-head');
    if (t.includes('TECHNICAL FLAT') || t.includes('SPEC')) kw.push('technical flat', 'spec sheet');
    if (t.includes('FABRIC TEXTURE') || t.includes('SWATCH')) kw.push('texture', 'swatch');
    if (t.includes('GRADING')) kw.push('grading');
    if (t.includes('GRAINLINE') || t.includes('SEAM ALLOWANCE')) kw.push('grainline', 'seam allowance');
    if (t.includes('MARKER PAPER') || t.includes('YIELD')) kw.push('marker', 'yield');
    if (t.includes('BONING') || t.includes('CORSET')) kw.push('boning', 'corset');
    if (t.includes('DRAPING') || t.includes('DRESS FORM')) kw.push('draping');
    if (t.includes('COSTING') || t.includes('PRICING')) kw.push('costing', 'pricing');
    if (t.includes('FITTING CONSULTATION')) kw.push('consultation');
    return kw;
  };

  const currKeywords = getKeywords(curriculumTask.title);

  const matchedTask = apprenticeTasks.find((t) => {
    if (!t.title) return false;
    const normTitle = normalize(t.title);
    if (normTitle === normCurrTitle) return true;
    if (normTitle.includes(normCurrTitle) || normCurrTitle.includes(normTitle)) return true;

    if (currKeywords.length > 0) {
      const tUpper = t.title.toUpperCase();
      return currKeywords.some((kw) => tUpper.includes(kw.toUpperCase()));
    }
    return false;
  });

  if (matchedTask) {
    const isPassed = matchedTask.status === 'passed';
    const isPendingReview = matchedTask.status === 'review_pending';
    const isAssigned = true;
    return { isPassed, isAssigned, isPendingReview, taskRecord: matchedTask };
  }

  return { isPassed: false, isAssigned: false, isPendingReview: false };
}

export const CurriculumTemplateModal: React.FC<CurriculumTemplateModalProps> = ({
  isOpen,
  onClose,
  apprentices = [],
  tasks = [],
  initialApprenticeId,
  onAssignTask
}) => {
  const [stages, setStages] = useState<CurriculumStage[]>(INITIAL_STAGES);
  const [selectedApprenticeId, setSelectedApprenticeId] = useState<string>(
    initialApprenticeId || (apprentices.length > 0 ? apprentices[0].id : 'default')
  );
  const [assignedTaskIds, setAssignedTaskIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state for adding custom tasks
  const [activeStageForNewTask, setActiveStageForNewTask] = useState<CurriculumStage | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUnit, setNewTaskUnit] = useState('Pattern Drafting & Cutting');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Sync initial apprentice when opened
  useEffect(() => {
    if (isOpen) {
      if (initialApprenticeId) {
        setSelectedApprenticeId(initialApprenticeId);
      } else if (apprentices.length > 0 && selectedApprenticeId === 'default') {
        setSelectedApprenticeId(apprentices[0].id);
      }
    }
  }, [isOpen, initialApprenticeId, apprentices]);

  if (!isOpen) return null;

  const activeApprentice =
    selectedApprenticeId === 'default'
      ? apprentices.length > 0
        ? apprentices[0]
        : null
      : apprentices.find((a) => a.id === selectedApprenticeId) || (apprentices.length > 0 ? apprentices[0] : null);

  const targetApprenticeName = activeApprentice ? activeApprentice.name : 'First Active Apprentice';

  // Calculate total core tasks passed for active apprentice
  const CORE_TASK_IDS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'i1', 'i2', 'i3', 'a1', 'a2', 'a3', 'a4'];
  const allCoreTasks = stages
    .filter((s) => ['basic', 'intermediate', 'advance'].includes(s.id))
    .flatMap((s) => s.tasks);

  const passedCoreCount = allCoreTasks.filter((t) => {
    const st = getCurriculumTaskStatus(t, activeApprentice, tasks);
    return st.isPassed;
  }).length;

  const totalCoreCount = 13;
  const progressPercent = Math.min(100, Math.round((passedCoreCount / totalCoreCount) * 100));

  const handleAssign = (task: CurriculumTask) => {
    const taskStatus = getCurriculumTaskStatus(task, activeApprentice, tasks);

    setAssignedTaskIds((prev) => ({ ...prev, [task.id]: true }));

    if (onAssignTask) {
      onAssignTask(targetApprenticeName, task.title);
    }

    if (taskStatus.isPassed) {
      setToastMessage(`Re-assigned "${task.title}" to ${targetApprenticeName} (Previously Passed ✓)`);
    } else {
      setToastMessage(`Assigned "${task.title}" to ${targetApprenticeName}`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateAdditionalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStageForNewTask || !newTaskTitle.trim()) return;

    const stageId = activeStageForNewTask.id;
    const newTask: CurriculumTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.toUpperCase().startsWith('TASK')
        ? newTaskTitle.toUpperCase()
        : `TASK ${activeStageForNewTask.tasks.length + 1}: ${newTaskTitle.toUpperCase()}`,
      unit: newTaskUnit,
      description: newTaskDesc || 'Specialized learning task assigned by Master Trainer.',
      isCustomAdded: true
    };

    setStages((prevStages) =>
      prevStages.map((stg) => {
        if (stg.id === stageId) {
          return {
            ...stg,
            tasks: [...stg.tasks, newTask]
          };
        }
        return stg;
      })
    );

    setToastMessage(`Added "${newTask.title}" to ${activeStageForNewTask.stageTitle}`);
    setTimeout(() => setToastMessage(null), 3000);

    // Reset sub-form
    setActiveStageForNewTask(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Outfit'] animate-fade-in">
      <div className="w-full max-w-2xl bg-[#ECF3F1] rounded-[36px] p-5 sm:p-7 space-y-4 shadow-2xl border border-white max-h-[92vh] flex flex-col my-auto relative overflow-hidden">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-400/40 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 pb-3.5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DCA134]" />
              <h2 className="font-black text-lg sm:text-xl text-[#0D3B36] tracking-tight uppercase">
                APPRENTICE SKILLS CURRICULUM
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium pl-7">
              Select, assign duties & review passed curriculum tasks for your apprentices.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Apprentice Selector & Live Progress Card */}
        <div className="space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-[#DCA134] uppercase tracking-wider block">
              SELECT TARGET APPRENTICE
            </label>
            {activeApprentice && (
              <span className="text-[11px] font-black text-[#0D3B36] bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                {passedCoreCount} / {totalCoreCount} Core Duties Passed ({progressPercent}%)
              </span>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedApprenticeId}
              onChange={(e) => setSelectedApprenticeId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D3B36] appearance-none cursor-pointer"
            >
              {apprentices.map((apprentice) => {
                const passedCount = allCoreTasks.filter((t) => getCurriculumTaskStatus(t, apprentice, tasks).isPassed).length;
                return (
                  <option key={apprentice.id} value={apprentice.id}>
                    {apprentice.name} ({apprentice.role || 'Apprentice'}) — {passedCount}/13 Passed ✓
                  </option>
                );
              })}
              {apprentices.length === 0 && (
                <option value="default">Default Apprentice (No active apprentices synced)</option>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Apprentice Passed Progress Bar Card */}
          {activeApprentice && (
            <div className="p-3 rounded-2xl bg-[#082824] text-white border border-[#DCA134]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#041916] border border-[#DCA134] text-[#DCA134] font-black flex items-center justify-center text-xs">
                  {activeApprentice.initials || activeApprentice.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>{activeApprentice.name}</span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.2 rounded-md">
                      {activeApprentice.role || 'Trainee'}
                    </span>
                  </h4>
                  <p className="text-[10px] text-emerald-200 font-medium mt-0.5">
                    Core Curriculum Progress: <strong className="text-white">{passedCoreCount} of 13 duties passed</strong>
                  </p>
                </div>
              </div>

              {/* Progress Visual Bar */}
              <div className="w-full sm:w-44 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-200">
                  <span>Passed Completion</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercent >= 100
                        ? 'bg-emerald-400'
                        : progressPercent >= 50
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Curriculum Stages List */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1 custom-scrollbar">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`border-2 ${stage.borderColor} rounded-[28px] p-4 bg-white/80 shadow-2xs space-y-3.5 transition-all`}
            >
              {/* Stage Pill Header & Add Task CTA */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={`inline-block px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider ${stage.pillBg} ${stage.pillTextColor}`}
                >
                  {`${stage.stageTitle} (${stage.tasks.length} TASKS)`}
                </span>

                {/* Master Add Task Button */}
                <button
                  type="button"
                  onClick={() => setActiveStageForNewTask(stage)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 transition-all border border-slate-200/80 shadow-2xs active:scale-95 cursor-pointer"
                  title="Add custom task to this learning stage"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#0D3B36]" />
                  <span>+ Add Additional Task</span>
                </button>
              </div>

              {/* Stage Tasks Cards List */}
              <div className="space-y-3">
                {stage.tasks.map((task) => {
                  const statusInfo = getCurriculumTaskStatus(task, activeApprentice, tasks);
                  const isPassed = statusInfo.isPassed;
                  const isPendingReview = statusInfo.isPendingReview;
                  const isAssigned = statusInfo.isAssigned || !!assignedTaskIds[task.id];

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative transition-all ${
                        isPassed
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/20'
                          : isPendingReview
                          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400'
                          : isAssigned
                          ? 'bg-blue-50/70 border-2 border-blue-300'
                          : task.isCustomAdded
                          ? 'border border-amber-300 bg-amber-50/40'
                          : 'bg-slate-50/90 border border-slate-200/90'
                      }`}
                    >
                      {/* Task Content */}
                      <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Passed Checkmark Icon */}
                          {isPassed && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}

                          <h4
                            className={`font-extrabold text-xs sm:text-sm tracking-tight uppercase ${
                              isPassed
                                ? 'text-emerald-950 dark:text-emerald-200'
                                : 'text-[#0D3B36]'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {/* Status Badge */}
                          {isPassed && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>PASSED & CERTIFIED</span>
                            </span>
                          )}

                          {isPendingReview && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Under Review</span>
                            </span>
                          )}

                          {isAssigned && !isPassed && !isPendingReview && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                              In Progress
                            </span>
                          )}

                          {task.isCustomAdded && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#B87C14] border border-amber-300 text-[9px] font-bold">
                              Master Custom
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-bold text-slate-700">
                          Unit: <span className="font-semibold text-slate-900">{task.unit}</span>
                        </p>

                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          {task.description}
                        </p>

                        {isPassed && (
                          <div className="pt-0.5 flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                            <span>✓ Passed and verified for {targetApprenticeName}</span>
                            {statusInfo.taskRecord?.passedAt && (
                              <span className="text-slate-400">({statusInfo.taskRecord.passedAt})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {task.buttonType === 'handshake' ? (
                          <button
                            type="button"
                            onClick={() => handleAssign(task)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                              isPassed
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : isAssigned
                                ? 'bg-emerald-800 text-white'
                                : `${stage.btnBg} ${stage.btnHoverBg} text-white`
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Handshake Passed ✓</span>
                              </>
                            ) : (
                              <>
                                <Handshake className="w-3.5 h-3.5 text-amber-300" />
                                <span>{isAssigned ? 'Handshake Activated' : 'Activate Handshake'}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssign(task)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                              isPassed
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                : isPendingReview
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : isAssigned
                                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                : `${stage.btnBg} ${stage.btnHoverBg} text-white`
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Passed Duty ✓</span>
                              </>
                            ) : isPendingReview ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-200" />
                                <span>Review Pending</span>
                              </>
                            ) : isAssigned ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Task Assigned</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-white" />
                                <span>Assign Task</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200/80 flex justify-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-extrabold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            Close Curriculum
          </button>
        </div>

      </div>

      {/* Add Additional Task Sub-Modal Overlay */}
      {activeStageForNewTask && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-['Outfit']">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#DCA134]" />
                <h3 className="font-extrabold text-base text-[#0D3B36]">
                  Add Task to {activeStageForNewTask.stageTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveStageForNewTask(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdditionalTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Task Title / Duty
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Corset Eyelet Lacing & Boning"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skill Category / Unit
                </label>
                <select
                  value={newTaskUnit}
                  onChange={(e) => setNewTaskUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
                >
                  <option value="Pattern Drafting & Cutting">Pattern Drafting & Cutting</option>
                  <option value="Garment Construction & Sewing">Garment Construction & Sewing</option>
                  <option value="Corsetry & Structure">Corsetry & Structure</option>
                  <option value="Finishing & Pressing">Finishing & Pressing</option>
                  <option value="Client Fitting & Measurements">Client Fitting & Measurements</option>
                  <option value="Studio Operations & Fabric Prep">Studio Operations & Fabric Prep</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Master Notes / Learning Criteria
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="e.g. Ensure even spacing on eyelet holes and cap boning channels securely..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStageForNewTask(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Add to Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
