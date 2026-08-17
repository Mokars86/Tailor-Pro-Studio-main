import React, { useState } from 'react';
import { X, Sparkles, ClipboardList, ChevronDown, Check } from 'lucide-react';
import { Apprentice } from '../../types';

interface CustomTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskTitle: string | { title: string; assignedTo?: string; category?: string; masterNotes?: string }) => void;
  apprentices?: Apprentice[];
}

export interface StageTemplate {
  id: string;
  stageGroup?: string;
  displayTitle: string;
  taskTitle: string;
  skillUnit: string;
  masterNotes: string;
}

export const STAGE_GROUPS = [
  {
    name: 'BASIC STAGE',
    tasks: [
      {
        id: 'basic-1',
        displayTitle: 'BASIC STAGE - TASK 1: MEASUREMENT',
        taskTitle: 'Basic Client Measurement & Tape Calibration',
        skillUnit: 'Client Fitting & Measurements',
        masterNotes: 'Confirm accurate bust, waist, and shoulder measurements using standard studio tape.'
      },
      {
        id: 'basic-2',
        displayTitle: 'BASIC STAGE - TASK 2: IRONING',
        taskTitle: 'Fabric Ironing & Steam Press Technique',
        skillUnit: 'Studio Operations & Fabric Prep',
        masterNotes: 'Press cotton and satin fabric blocks thoroughly without scorching or water spots.'
      },
      {
        id: 'basic-3',
        displayTitle: 'BASIC STAGE - TASK 3: COLORS IDENTIFICATION OF FABRICS',
        taskTitle: 'Colors & Fabric Type Identification',
        skillUnit: 'Studio Operations & Fabric Prep',
        masterNotes: 'Identify Vlisco prints, Kente blends, satin, and lace swatches correctly.'
      },
      {
        id: 'basic-4',
        displayTitle: 'BASIC STAGE - TASK 4: BUTTON STITCHES ON FABRICS',
        taskTitle: 'Hand Button Stitches & Eyelet Assembly',
        skillUnit: 'Garment Construction & Sewing',
        masterNotes: 'Stitch 4-hole buttons securely with reinforced thread backing on cuff edges.'
      },
      {
        id: 'basic-5',
        displayTitle: 'BASIC STAGE - TASK 5: INTERNAL DRAWSTRINGS',
        taskTitle: 'Internal Drawstring Channel Stitching',
        skillUnit: 'Garment Construction & Sewing',
        masterNotes: 'Fold and stitch 0.75in inner channels for waist drawstring casing.'
      },
      {
        id: 'basic-6',
        displayTitle: 'BASIC STAGE - TASK 6: SLIT MAKING ALL TYPES',
        taskTitle: 'Slit Making & Edge Finishing (All Types)',
        skillUnit: 'Pattern Drafting & Cutting',
        masterNotes: 'Cut and mitre skirt side slits cleanly with stay-stitch reinforcement.'
      }
    ]
  },
  {
    name: 'INTERMEDIATE STAGE',
    tasks: [
      {
        id: 'inter-1',
        displayTitle: 'INTERMEDIATE STAGE - TASK 1: SEWING SIMPLE STRAIGHT DRESS (MANUAL SEWING MACHINE)',
        taskTitle: 'Sewing Simple Straight Dress on Manual Machine',
        skillUnit: 'Garment Construction & Sewing',
        masterNotes: 'Stitch straight side seams with balanced foot pedal control and clean 1.5in seam allowance.'
      },
      {
        id: 'inter-2',
        displayTitle: 'INTERMEDIATE STAGE - TASK 2: ZIP INSERTING ON DRESS',
        taskTitle: 'Invisible Zip Insertion on Dress Back',
        skillUnit: 'Garment Construction & Sewing',
        masterNotes: 'Install invisible zipper seamlessly without puckering or visible teeth on outer fabric.'
      },
      {
        id: 'inter-3',
        displayTitle: 'INTERMEDIATE STAGE - TASK 3: ADD STIFF ON PIECES OF FABRICS',
        taskTitle: 'Fusible Stiffener & Interfacing Application',
        skillUnit: 'Corsetry & Structure',
        masterNotes: 'Fuse haircloth or canvas interfacing to collar and waistbands without air bubbles.'
      }
    ]
  },
  {
    name: 'ADVANCE STAGES',
    tasks: [
      {
        id: 'adv-1',
        displayTitle: 'ADVANCE STAGES - TASK 1: USING INDUSTRIAL MACHINE FOR SEWING',
        taskTitle: 'Industrial High-Speed Sewing Machine Operation',
        skillUnit: 'Garment Construction & Sewing',
        masterNotes: 'Operate industrial straight-stitch machine for heavy lace and thick gown fabrics.'
      },
      {
        id: 'adv-2',
        displayTitle: 'ADVANCE STAGES - TASK 2: USING A NEATING MACHINE',
        taskTitle: 'Overlock Neating Machine Edge Finishing',
        skillUnit: 'Finishing & Pressing',
        masterNotes: 'Neaten all raw interior seam allowances with 4-thread overlock stitch.'
      },
      {
        id: 'adv-3',
        displayTitle: 'ADVANCE STAGES - TASK 3: LEARN CUTTING OF FABRIC FROM (MASTER INSTRUCTION)',
        taskTitle: 'Master Fabric Cutting & Pattern Layout',
        skillUnit: 'Pattern Drafting & Cutting',
        masterNotes: 'Execute precision pattern layout on patterned Ankara/Vlisco fabric matching motifs.'
      },
      {
        id: 'adv-4',
        displayTitle: 'ADVANCE STAGES - TASK 4: FINISHES & TOUCHES',
        taskTitle: 'Final Garment Finishes & Studio Touches',
        skillUnit: 'Finishing & Pressing',
        masterNotes: 'Inspect lining, trim loose threads, hand-tack hems, and attach studio authenticity tag.'
      }
    ]
  },
  {
    name: 'GRADUATION STAGES',
    tasks: [
      {
        id: 'grad-1',
        displayTitle: 'GRADUATION STAGES - TASK 1: MASTER ACTIVATE HANDSHAKES',
        taskTitle: 'Master Graduation Capstone & Studio Handshake',
        skillUnit: 'Corsetry & Structure',
        masterNotes: 'Complete full custom bridal gown from draft to fitting independently.'
      }
    ]
  },
  {
    name: 'OPTIONAL: PATTERN DESIGN',
    tasks: [
      {
        id: 'opt-pd-1',
        displayTitle: 'OPTIONAL PATTERN DESIGN - TASK 1: FLAT PATTERN DRAFTING & DART MANIPULATION',
        taskTitle: 'Flat Pattern Drafting & Dart Rotation',
        skillUnit: 'Pattern Design',
        masterNotes: 'Master flat pattern drafting, dart rotation, slash-and-spread method, and style line development.'
      },
      {
        id: 'opt-pd-2',
        displayTitle: 'OPTIONAL PATTERN DESIGN - TASK 2: BODICE & SKIRT SLOPER CONSTRUCTION',
        taskTitle: 'Bodice & Skirt Fitting Sloper Construction',
        skillUnit: 'Pattern Design',
        masterNotes: 'Construct precise master fitting slopers for bodice, skirt, and trousers based on anatomical measurements.'
      },
      {
        id: 'opt-pd-3',
        displayTitle: 'OPTIONAL PATTERN DESIGN - TASK 3: SLEEVE & COLLAR VARIATIONS',
        taskTitle: 'Sleeve & Collar Pattern Variations',
        skillUnit: 'Pattern Design',
        masterNotes: 'Design set-in sleeves, raglan sleeves, mandarin collars, lapels, and custom neckline variations.'
      }
    ]
  },
  {
    name: 'OPTIONAL: FASHION ILLUSTRATION',
    tasks: [
      {
        id: 'opt-fi-1',
        displayTitle: 'OPTIONAL FASHION ILLUSTRATION - TASK 1: 9-HEAD FIGURE CROQUIS SKETCHING',
        taskTitle: '9-Head Fashion Figure Croquis Sketching',
        skillUnit: 'Fashion Illustration',
        masterNotes: 'Draw proportional 9-head fashion croquis poses for conceptualizing bespoke gown designs.'
      },
      {
        id: 'opt-fi-2',
        displayTitle: 'OPTIONAL FASHION ILLUSTRATION - TASK 2: TECHNICAL FLAT SKETCHING & SPEC SHEETS',
        taskTitle: 'Technical Flat Sketching & Spec Sheets',
        skillUnit: 'Fashion Illustration',
        masterNotes: 'Create clear, production-ready technical flat sketches with seam callouts and trim specifications.'
      },
      {
        id: 'opt-fi-3',
        displayTitle: 'OPTIONAL FASHION ILLUSTRATION - TASK 3: FABRIC TEXTURE RENDERING & COLORING',
        taskTitle: 'Fabric Texture Rendering & Swatch Coloring',
        skillUnit: 'Fashion Illustration',
        masterNotes: 'Render lace, satin, Ankara motifs, and sheer fabrics using colored pencils, markers, or watercolor.'
      }
    ]
  },
  {
    name: 'OPTIONAL: DRAWING PATTERNS',
    tasks: [
      {
        id: 'opt-dp-1',
        displayTitle: 'OPTIONAL DRAWING PATTERNS - TASK 1: MANUAL PATTERN GRADING & SCALING',
        taskTitle: 'Manual Pattern Grading & Size Scaling',
        skillUnit: 'Drawing Patterns',
        masterNotes: 'Grade base master patterns up and down across standard UK/US sizing charts manually.'
      },
      {
        id: 'opt-dp-2',
        displayTitle: 'OPTIONAL DRAWING PATTERNS - TASK 2: GRAINLINE & SEAM ALLOWANCE MARKING',
        taskTitle: 'Grainline & Seam Allowance Drawing',
        skillUnit: 'Drawing Patterns',
        masterNotes: 'Draw precise 1.5in seam allowances, balance notches, fold lines, and grainline arrows on brown paper.'
      },
      {
        id: 'opt-dp-3',
        displayTitle: 'OPTIONAL DRAWING PATTERNS - TASK 3: MARKER PAPER LAYOUT & FABRIC YIELD',
        taskTitle: 'Marker Paper Layout & Fabric Efficiency',
        skillUnit: 'Drawing Patterns',
        masterNotes: 'Layout pattern pieces efficiently on fabric markers to minimize luxury fabric waste.'
      }
    ]
  },
  {
    name: 'OPTIONAL: COUTURE CORSETRY & DRAPING',
    tasks: [
      {
        id: 'opt-cd-1',
        displayTitle: 'OPTIONAL COUTURE CORSETRY - TASK 1: UNDERBUST CORSET & RIGILENE BONING',
        taskTitle: 'Underbust Corset & Rigilene Boning Channels',
        skillUnit: 'Couture Corsetry',
        masterNotes: 'Channel and cap spiral steel/Rigilene boning for structured underbust and overbust corsets.'
      },
      {
        id: 'opt-cd-2',
        displayTitle: 'OPTIONAL COUTURE CORSETRY - TASK 2: DRESS FORM FABRIC DRAPING',
        taskTitle: 'Dress Form Fabric Draping & Pinning',
        skillUnit: 'Fabric Draping',
        masterNotes: 'Drape calico directly on dress form mannequins to create fluid asymmetrical cowls and gowns.'
      }
    ]
  },
  {
    name: 'OPTIONAL: STUDIO BUSINESS & PRICING',
    tasks: [
      {
        id: 'opt-sb-1',
        displayTitle: 'OPTIONAL STUDIO BUSINESS - TASK 1: GARMENT COSTING & RETAIL PRICING',
        taskTitle: 'Garment Costing & Retail Pricing Calculation',
        skillUnit: 'Studio Operations',
        masterNotes: 'Calculate fabric yield, labor hours, studio overheads, and retail markups for client quotes.'
      },
      {
        id: 'opt-sb-2',
        displayTitle: 'OPTIONAL STUDIO BUSINESS - TASK 2: CLIENT FITTING CONSULTATION',
        taskTitle: 'Client Fitting Consultation & Alteration Logs',
        skillUnit: 'Studio Operations',
        masterNotes: 'Conduct professional fitting consultations, record alterations, and manage client spec logs.'
      }
    ]
  }
];

export const CustomTaskModal: React.FC<CustomTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  apprentices = []
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedDisplayTitle, setSelectedDisplayTitle] = useState<string>('Custom Task or Select Stage Template...');
  
  const [title, setTitle] = useState('');
  const [assignedApprentice, setAssignedApprentice] = useState('');
  const [skillUnit, setSkillUnit] = useState('Pattern Drafting & Cutting');
  const [masterNotes, setMasterNotes] = useState('');
  
  const [isStagePickerOpen, setIsStagePickerOpen] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: StageTemplate | null) => {
    if (!template) {
      setSelectedTemplateId('');
      setSelectedDisplayTitle('Custom Task or Select Stage Template...');
    } else {
      setSelectedTemplateId(template.id);
      setSelectedDisplayTitle(template.displayTitle);
      setTitle(template.taskTitle);
      setSkillUnit(template.skillUnit);
      setMasterNotes(template.masterNotes);
    }
    setIsStagePickerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSaveTask({
        title,
        assignedTo: assignedApprentice,
        category: skillUnit,
        masterNotes
      });
      // Reset form
      setTitle('');
      setSelectedTemplateId('');
      setSelectedDisplayTitle('Custom Task or Select Stage Template...');
      setAssignedApprentice('');
      setMasterNotes('');
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Outfit'] animate-fade-in">
        <div className="w-full max-w-lg bg-[#EDF4F1] dark:bg-[#092825] rounded-[32px] p-6 space-y-4 shadow-2xl border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DCA134]" />
              <h2 className="font-extrabold text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight">
                Create Daily Apprentice Task
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Quick-Fill from Curriculum Template Trigger */}
            <div>
              <label className="text-xs font-bold text-[#DCA134] flex items-center gap-1.5 mb-1.5">
                <ClipboardList className="w-4 h-4 text-[#DCA134]" />
                <span>Quick-Fill from Curriculum Template (Optional)</span>
              </label>

              <button
                type="button"
                onClick={() => setIsStagePickerOpen(true)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left shadow-2xs cursor-pointer"
              >
                <span className="truncate pr-2">{selectedDisplayTitle}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Task Title / Duty */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Task Title / Duty
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cut 60-inch Off-Shoulder Corset Pattern"
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
              />
            </div>

            {/* Assign to Apprentice */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Assign to Apprentice
              </label>
              <select
                value={assignedApprentice}
                onChange={(e) => setAssignedApprentice(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Choose Apprentice...</option>
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Active Apprentices</option>
                {apprentices.map((a) => (
                  <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Unit / Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Skill Unit / Category
              </label>
              <select
                value={skillUnit}
                onChange={(e) => setSkillUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
              >
                <option value="Pattern Drafting & Cutting" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Pattern Drafting & Cutting</option>
                <option value="Pattern Design" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Pattern Design (Optional)</option>
                <option value="Fashion Illustration" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Fashion Illustration (Optional)</option>
                <option value="Drawing Patterns" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Drawing Patterns (Optional)</option>
                <option value="Couture Corsetry" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Couture Corsetry & Boning</option>
                <option value="Fabric Draping" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Fabric Draping & Molding</option>
                <option value="Garment Construction & Sewing" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Garment Construction & Sewing</option>
                <option value="Finishing & Pressing" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Finishing & Pressing</option>
                <option value="Client Fitting & Measurements" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Client Fitting & Measurements</option>
                <option value="Studio Operations & Fabric Prep" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Studio Operations & Pricing</option>
              </select>
            </div>

            {/* Master Notes & Passing Criteria */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Master Notes & Passing Criteria
              </label>
              <textarea
                rows={3}
                value={masterNotes}
                onChange={(e) => setMasterNotes(e.target.value)}
                placeholder="e.g. Ensure seam allowance is 1.5 inches with clean edge overlock..."
                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center shadow-2xs active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 px-5 rounded-full bg-[#082824] dark:bg-amber-400 hover:bg-[#051c19] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#DCA134] dark:text-[#0D3B36]" />
                <span>Create Task</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Stage Selection Overlay Modal */}
      {isStagePickerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Outfit'] animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#092825] rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/90 dark:border-white/10 overflow-hidden text-slate-900 dark:text-slate-100">
            
            {/* Scrollable List of Stages */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Default Option */}
              <button
                type="button"
                onClick={() => handleSelectTemplate(null)}
                className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between transition-colors text-left ${
                  selectedTemplateId === ''
                    ? 'bg-slate-100/90 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="text-base tracking-tight">
                  Custom Task or Select Stage Template...
                </span>
                
                {/* Radio Button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedTemplateId === ''
                      ? 'border-[#0D3B36] dark:border-amber-400 bg-[#0D3B36] dark:bg-amber-400'
                      : 'border-slate-400 dark:border-slate-600 bg-transparent'
                  }`}
                >
                  {selectedTemplateId === '' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#0D3B36]" />
                  )}
                </div>
              </button>

              {/* Stage Groups */}
              {STAGE_GROUPS.map((group) => (
                <div key={group.name} className="space-y-1.5 pt-2">
                  <h3 className="px-4 text-sm font-black tracking-wider text-slate-900 dark:text-amber-300 uppercase">
                    {group.name}
                  </h3>

                  <div className="space-y-1">
                    {group.tasks.map((task) => {
                      const isSelected = selectedTemplateId === task.id;

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleSelectTemplate(task)}
                          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between gap-3 text-left transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold text-slate-900 dark:text-slate-200'
                          }`}
                        >
                          <span className="text-sm uppercase leading-snug tracking-tight text-slate-900 dark:text-slate-100 pr-2">
                            {task.displayTitle}
                          </span>

                          {/* Radio Button */}
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-[#0D3B36] dark:border-amber-400 bg-[#0D3B36] dark:bg-amber-400'
                                : 'border-slate-400 dark:border-slate-600 bg-transparent'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#0D3B36]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>

          </div>
        </div>
      )}
    </>
  );
};
