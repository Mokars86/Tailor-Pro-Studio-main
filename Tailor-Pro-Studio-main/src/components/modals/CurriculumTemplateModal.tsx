import React, { useState } from 'react';
import { X, Sparkles, Check, Plus, Handshake, CheckCircle2, PlusCircle, BookOpen } from 'lucide-react';
import { Apprentice } from '../../types';

interface CurriculumTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprentices?: Apprentice[];
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

export const CurriculumTemplateModal: React.FC<CurriculumTemplateModalProps> = ({
  isOpen,
  onClose,
  apprentices = [],
  onAssignTask
}) => {
  const [stages, setStages] = useState<CurriculumStage[]>(INITIAL_STAGES);
  const [selectedApprenticeId, setSelectedApprenticeId] = useState<string>('default');
  const [assignedTaskIds, setAssignedTaskIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state for adding custom tasks
  const [activeStageForNewTask, setActiveStageForNewTask] = useState<CurriculumStage | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUnit, setNewTaskUnit] = useState('Pattern Drafting & Cutting');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  if (!isOpen) return null;

  const getTargetApprenticeName = () => {
    if (selectedApprenticeId === 'default') {
      return apprentices.length > 0 ? apprentices[0].name : 'First Active Apprentice';
    }
    const found = apprentices.find((a) => a.id === selectedApprenticeId);
    return found ? found.name : 'Target Apprentice';
  };

  const handleAssign = (task: CurriculumTask) => {
    const targetName = getTargetApprenticeName();
    setAssignedTaskIds((prev) => ({ ...prev, [task.id]: true }));

    if (onAssignTask) {
      onAssignTask(targetName, task.title);
    }

    setToastMessage(`Assigned "${task.title}" to ${targetName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#ECF3F1] rounded-[36px] p-5 sm:p-7 space-y-5 shadow-2xl border border-white max-h-[92vh] flex flex-col my-auto relative overflow-hidden font-['Outfit']">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-400/40 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DCA134]" />
              <h2 className="font-black text-lg sm:text-xl text-[#0D3B36] tracking-tight uppercase">
                APPRENTICE SKILLS CURRICULUM
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium pl-7">
              Select, Assign & Create Custom Stage Tasks for Apprentice Learning
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 transition-colors text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Apprentice Selector */}
        <div className="space-y-1.5 shrink-0">
          <label className="text-[11px] font-extrabold text-[#DCA134] uppercase tracking-wider block">
            SELECT TARGET APPRENTICE
          </label>
          <div className="relative">
            <select
              value={selectedApprenticeId}
              onChange={(e) => setSelectedApprenticeId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D3B36] appearance-none cursor-pointer"
            >
              <option value="default">Default (First Active Apprentice)</option>
              {apprentices.map((apprentice) => (
                <option key={apprentice.id} value={apprentice.id}>
                  {apprentice.name} ({apprentice.role})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Scrollable Curriculum Stages List */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1 custom-scrollbar">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`border-2 ${stage.borderColor} rounded-[28px] p-4 bg-white/70 shadow-2xs space-y-3.5 transition-all`}
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
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 transition-all border border-slate-200/80 shadow-2xs active:scale-95"
                  title="Add custom task to this learning stage"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#0D3B36]" />
                  <span>+ Add Additional Task</span>
                </button>
              </div>

              {/* Stage Tasks Cards List */}
              <div className="space-y-3">
                {stage.tasks.map((task) => {
                  const isAssigned = !!assignedTaskIds[task.id];

                  return (
                    <div
                      key={task.id}
                      className={`bg-slate-50/90 border ${
                        task.isCustomAdded ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/90'
                      } rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative`}
                    >
                      {/* Task Content */}
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#0D3B36] tracking-tight uppercase">
                            {task.title}
                          </h4>
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
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {task.buttonType === 'handshake' ? (
                          <button
                            type="button"
                            onClick={() => handleAssign(task)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 ${
                              isAssigned
                                ? 'bg-emerald-800 text-white'
                                : `${stage.btnBg} ${stage.btnHoverBg} text-white`
                            }`}
                          >
                            <Handshake className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isAssigned ? 'Handshake Activated' : 'Activate Handshake'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssign(task)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 ${
                              isAssigned
                                ? 'bg-slate-800 text-white'
                                : `${stage.btnBg} ${stage.btnHoverBg} text-white`
                            }`}
                          >
                            {isAssigned ? (
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
            className="px-8 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-extrabold text-xs shadow-2xs transition-all active:scale-95"
          >
            Close Curriculum
          </button>
        </div>

      </div>

      {/* Add Additional Task Sub-Modal Overlay */}
      {activeStageForNewTask && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in font-['Outfit']">
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
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-white font-extrabold text-xs shadow-md"
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
