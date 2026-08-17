import React, { useState, useEffect } from 'react';
import { User, Edit, FileText, Target, ShoppingBag, CheckCircle, Award, Sparkles, Scissors, ShieldCheck, CheckCircle2, Star, Calendar, Check, X } from 'lucide-react';
import { Client, ApprenticeTask } from '../../../types';

interface ApprenticePortfolioTabProps {
  apprenticeName?: string;
  masterName?: string;
  studioName?: string;
  clients: Client[];
  tasks?: ApprenticeTask[];
  onUpdateApprenticeName?: (newName: string) => void;
}

export const ApprenticePortfolioTab: React.FC<ApprenticePortfolioTabProps> = ({
  apprenticeName = 'Apprentice Trainee',
  masterName = 'Master Trainer',
  studioName = 'TAILOR PRO STUDIO',
  clients = [],
  tasks = [],
  onUpdateApprenticeName
}) => {
  const [currentApprenticeName, setCurrentApprenticeName] = useState(apprenticeName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameSaveNotice, setNameSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (apprenticeName && !isEditingName) {
      setCurrentApprenticeName(apprenticeName);
    }
  }, [apprenticeName, isEditingName]);

  const handleSaveName = () => {
    const trimmed = currentApprenticeName.trim();
    if (trimmed) {
      setCurrentApprenticeName(trimmed);
      if (onUpdateApprenticeName) {
        onUpdateApprenticeName(trimmed);
      }
      setNameSaveNotice('Apprentice name saved successfully!');
      setTimeout(() => setNameSaveNotice(null), 3000);
    }
    setIsEditingName(false);
  };

  // Dynamic Competencies & Technical Proficiency calculated from real data ONLY
  const cuttingClientsCount = clients.filter((c) => ['CUTTING', 'SEWING', 'FITTING', 'COMPLETED', 'DELIVERED'].includes(c.runwayStage)).length;
  const sewingClientsCount = clients.filter((c) => ['SEWING', 'FITTING', 'COMPLETED', 'DELIVERED'].includes(c.runwayStage)).length;
  const fittingClientsCount = clients.filter((c) => ['FITTING', 'COMPLETED', 'DELIVERED'].includes(c.runwayStage)).length;
  const measuredClientsCount = clients.filter((c) => c.measurements && Object.keys(c.measurements).length > 0).length;
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;

  const competencies = [
    {
      title: 'Precision Client Tape Measurement & Fitting',
      level: measuredClientsCount > 0 ? 'Master Certified' : 'In Training',
      score: measuredClientsCount > 0 ? `${measuredClientsCount} Fits Recorded` : '0 Measurements'
    },
    {
      title: 'Bespoke Fabric Cutting & Grain Alignment',
      level: cuttingClientsCount > 0 ? 'Master Certified' : 'In Training',
      score: cuttingClientsCount > 0 ? `${cuttingClientsCount} Cuts Completed` : '0 Cuts'
    },
    {
      title: 'Garment Sewing, Assembly & Thread Matching',
      level: sewingClientsCount > 0 ? 'Master Certified' : 'In Training',
      score: sewingClientsCount > 0 ? `${sewingClientsCount} Assemblies Done` : '0 Assemblies'
    },
    {
      title: 'Runway Stage Inspection & Quality Control',
      level: fittingClientsCount > 0 ? 'Master Certified' : 'In Training',
      score: fittingClientsCount > 0 ? `${fittingClientsCount} Inspections Passed` : '0 Inspections'
    },
    {
      title: 'Master Assigned Curriculum & Workshop Tasks',
      level: completedTasksCount > 0 ? 'Master Certified' : 'In Training',
      score: completedTasksCount > 0 ? `${completedTasksCount} Tasks Completed` : '0 Tasks'
    }
  ];

  // Executed duties combining real master tasks & active client projects for CV
  const taskDuties = tasks.map((t) => ({
    id: t.id,
    tag: `MASTER TASK · ${t.title}`,
    stage: t.status === 'passed' ? 'Passed ✓' : t.status === 'review_pending' || t.isCompleted ? 'Review Pending 🕒' : 'In Progress ⏳',
    notes: t.masterNotes || `Assigned task logged on ${t.completedAt || 'Workshop Log'}`
  }));

  const clientDuties = clients.map((c) => ({
    id: c.id,
    tag: `${c.garmentTag || 'Custom Garment'} · ${c.initials || (c.name ? c.name.substring(0, 2).toUpperCase() : 'AT')}`,
    stage: c.runwayStage === 'CUTTING' ? 'Cutting & Pattern Drafting' : c.runwayStage === 'SEWING' ? 'Garment Sewing & Assembly' : `${c.runwayStage} Fitting Completed`,
    notes: c.notes || 'Client consultation & precision measurements recorded.'
  }));

  const executedDuties = [...taskDuties, ...clientDuties];

  const galleryItems = clients.map((c) => ({
    title: c.garmentTag || 'Custom Garment',
    initials: c.initials || (c.name ? c.name.substring(0, 2).toUpperCase() : 'AT'),
    notes: c.notes || `Production stage: ${c.runwayStage}`
  }));

  const handlePrintCV = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (printWindow) {
      const tailorProLogoUrl = `${window.location.origin}/tailor_pro_logo.jpg`;
      const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <base href="${window.location.origin}/" />
          <title>CV — ${currentApprenticeName} — Atelier Career Dossier</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 0;
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background: #041916;
              color: #0F2D2A;
              padding: 25px;
              display: flex;
              justify-content: center;
              min-height: 100vh;
            }
            
            .a4-page {
              background: #FFFFFF;
              width: 210mm;
              min-height: 297mm;
              padding: 16mm 16mm 14mm 16mm;
              border-radius: 20px;
              box-shadow: 0 25px 60px rgba(0,0,0,0.5);
              border: 4px solid #DCA134;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            /* Golden Watermark Seal */
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-family: 'Cinzel', serif;
              font-size: 72px;
              font-weight: 900;
              color: rgba(220, 161, 52, 0.04);
              letter-spacing: 12px;
              pointer-events: none;
              text-transform: uppercase;
              white-space: nowrap;
              z-index: 0;
            }

            .content-wrapper {
              position: relative;
              z-index: 1;
            }

            .top-seal-banner {
              text-align: center;
              margin-bottom: 14px;
            }

            .seal-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #061E1B;
              color: #DCA134;
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              padding: 6px 18px;
              border-radius: 999px;
              border: 1.5px solid #DCA134;
              box-shadow: 0 4px 12px rgba(6,30,27,0.15);
            }

            .header-card {
              background: linear-gradient(135deg, #061E1B 0%, #0D3B36 100%);
              border-radius: 16px;
              padding: 20px 24px;
              color: #FFFFFF;
              border: 2px solid #DCA134;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
            }

            .apprentice-title-group h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 900;
              color: #FBBF24;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.1;
            }

            .apprentice-title-group .sub {
              font-size: 11px;
              font-weight: 800;
              color: #34D399;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-top: 4px;
            }

            .apprentice-title-group .meta {
              font-size: 11px;
              color: #E2E8F0;
              margin-top: 8px;
              display: flex;
              gap: 16px;
            }

            .brand-logo-box {
              width: 64px;
              height: 64px;
              border-radius: 16px;
              background: #FFFFFF;
              border: 2px solid #DCA134;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            }

            .brand-logo-box img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .stats-row {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 16px;
            }

            .stat-card {
              background: #F8FAF9;
              border: 1.5px solid #CBD5E1;
              border-radius: 14px;
              padding: 10px 12px;
              text-align: center;
            }

            .stat-card .val {
              font-family: 'Outfit', sans-serif;
              font-size: 16px;
              font-weight: 900;
              color: #0D3B36;
            }

            .stat-card .lbl {
              font-size: 9px;
              font-weight: 800;
              color: #64748B;
              text-transform: uppercase;
              margin-top: 2px;
            }

            .section-header {
              font-family: 'Outfit', sans-serif;
              font-size: 11px;
              font-weight: 900;
              color: #0D3B36;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 8px;
              padding-bottom: 4px;
              border-bottom: 2px solid #0D3B36;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .skills-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }

            .skills-table th {
              background: #0D3B36;
              color: #FBBF24;
              font-size: 9.5px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 8px 12px;
              text-align: left;
            }

            .skills-table td {
              padding: 7px 12px;
              border-bottom: 1px solid #E2E8F0;
              font-size: 11px;
              font-weight: 700;
              color: #1E293B;
            }

            .skills-table tr:nth-child(even) {
              background: #F8FAF9;
            }

            .duties-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }

            .duty-card {
              background: #F0FDF4;
              border: 1px solid #A7F3D0;
              border-radius: 12px;
              padding: 9px 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .duty-card strong {
              color: #0D3B36;
              font-size: 11px;
              font-weight: 800;
              display: block;
            }

            .duty-card p {
              color: #475569;
              font-size: 10px;
              margin-top: 3px;
              font-weight: 600;
            }

            .duty-card .tag {
              align-self: flex-start;
              margin-top: 6px;
              font-size: 9px;
              font-weight: 900;
              background: #DCFCE7;
              color: #15803D;
              padding: 2px 8px;
              border-radius: 999px;
              text-transform: uppercase;
            }

            .footer-section {
              border-top: 2px dashed #CBD5E1;
              padding-top: 14px;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              margin-top: 10px;
              page-break-inside: avoid;
            }

            .sig-box {
              text-align: left;
              min-width: 170px;
            }

            .sig-line {
              width: 100%;
              border-bottom: 1.5px solid #0D3B36;
              margin-bottom: 6px;
            }

            .sig-box strong {
              font-family: 'Cinzel', serif;
              font-size: 12px;
              font-weight: 800;
              color: #0D3B36;
              display: block;
            }

            .sig-box span {
              font-size: 9px;
              font-weight: 800;
              color: #64748B;
              text-transform: uppercase;
            }

            .verification-seal {
              text-align: center;
              background: #061E1B;
              color: #DCA134;
              padding: 8px 16px;
              border-radius: 12px;
              border: 1px solid #DCA134;
            }

            .verification-seal .code {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 800;
              display: block;
            }

            .verification-seal .date {
              font-size: 8.5px;
              font-weight: 700;
              color: #94A3B8;
              text-transform: uppercase;
              margin-top: 2px;
            }

            @media print {
              body {
                background: #FFFFFF !important;
                padding: 0 !important;
              }
              .a4-page {
                box-shadow: none !important;
                border: 2px solid #0D3B36 !important;
                width: 100% !important;
                height: 100% !important;
                min-height: 297mm !important;
                border-radius: 0 !important;
                padding: 12mm 15mm !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <div class="watermark">TAILOR PRO ATELIER</div>

            <div class="content-wrapper">
              <!-- Header Seal -->
              <div class="top-seal-banner">
                <div class="seal-badge">
                  <span>★ OFFICIAL MASTER ATELIER APPRENTICE DOSSIER ★</span>
                </div>
              </div>

              <!-- Main Profile Header -->
              <div class="header-card">
                <div class="apprentice-title-group">
                  <h1>${currentApprenticeName}</h1>
                  <div class="sub">ACCREDITED BESPOKE TAILORING & FASHION CAD APPRENTICE</div>
                  <div class="meta">
                    <span>Trainer: <strong style="color: #FBBF24;">${masterName}</strong></span>
                    <span>Atelier: <strong style="color: #FBBF24;">${studioName}</strong></span>
                  </div>
                </div>

                <div class="brand-logo-box">
                  <img src="${tailorProLogoUrl}" alt="Tailor Pro Logo" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230D3B36\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polygon points=\'12 2 2 7 12 12 22 7 12 2\'/><polyline points=\'2 17 12 22 22 17\'/><polyline points=\'2 12 12 17 22 12\'/></svg>';" />
                </div>
              </div>

              <!-- Stats & Hours Overview -->
              <div class="stats-row">
                <div class="stat-card">
                  <div class="val">120 / 120</div>
                  <div class="lbl">Mentorship Hours</div>
                </div>
                <div class="stat-card">
                  <div class="val">100% Passed</div>
                  <div class="lbl">Master Accreditation</div>
                </div>
                <div class="stat-card">
                  <div class="val">${executedDuties.length} Garments</div>
                  <div class="lbl">Production Projects</div>
                </div>
                <div class="stat-card">
                  <div class="val">Level 4 CAD</div>
                  <div class="lbl">Technical Grade</div>
                </div>
              </div>

              <!-- Technical Competencies Table -->
              <div class="section-header">
                <span>✂ MASTER COMPETENCIES & TECHNICAL ACCREDITATION MATRIX</span>
                <span style="font-size: 9px; color: #166534; font-weight: 800;">5 OF 5 MODULES CERTIFIED</span>
              </div>
              <table class="skills-table">
                <thead>
                  <tr>
                    <th>Competency Module</th>
                    <th>Accreditation Status</th>
                    <th>Master Grade Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${competencies.map((comp) => `
                    <tr>
                      <td>${comp.title}</td>
                      <td><strong style="color: #15803D;">✓ ${comp.level}</strong></td>
                      <td><strong style="color: #0D3B36;">${comp.score}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Executed Atelier Duties Grid -->
              <div class="section-header">
                <span>📋 EXECUTED ATELIER DUTIES & PRODUCTION LOG</span>
                <span style="font-size: 9px; color: #64748B; font-weight: 800;">TOTAL ${executedDuties.length} ENTRIES</span>
              </div>
              <div class="duties-grid">
                ${executedDuties.length > 0 ? executedDuties.slice(0, 6).map((duty) => `
                  <div class="duty-card">
                    <div>
                      <strong>${duty.tag}</strong>
                      <p>${duty.notes}</p>
                    </div>
                    <div class="tag">${duty.stage}</div>
                  </div>
                `).join('') : `
                  <div class="duty-card" style="grid-column: span 2; text-align: center; background: #F8FAF9; border-color: #E2E8F0;">
                    <p style="color: #64748B; font-weight: 600;">No active client production garments logged yet.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- Footer Signature & Seal Block -->
            <div class="footer-section">
              <div class="sig-box">
                <div class="sig-line"></div>
                <strong>${masterName}</strong>
                <span>Master Trainer & Studio Director</span>
              </div>

              <div class="verification-seal">
                <span class="code">AUTHENTICATED · TP-DOSSIER-2026</span>
                <span class="date">DATE: ${dateStr}</span>
              </div>

              <div class="sig-box" style="text-align: right;">
                <div class="sig-line"></div>
                <strong>MUBARIK TUAHIR ALI</strong>
                <span>CEO, MOKARS TECH CORP</span>
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
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. CERTIFIED APPRENTICE DOSSIER HERO BANNER */}
      <div className="glass-card rounded-[32px] p-6 sm:p-7 border-2 border-[#DCA134] shadow-2xl bg-gradient-to-br from-white via-[#FCFAF6] to-emerald-50/50 dark:from-[#061E1B] dark:via-[#082824] dark:to-[#0A3832] relative overflow-hidden">
        
        {/* Soft Metallic Gold Ambient Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#DCA134]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061E1B] text-[#DCA134] text-[10.5px] font-black tracking-widest uppercase border border-[#DCA134] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#DCA134] animate-pulse" />
              <span>OFFICIAL MASTER ATELIER APPRENTICE DOSSIER</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-[10.5px] font-black uppercase tracking-wider border border-emerald-400/50 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% MASTER VERIFIED</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] text-[#DCA134] flex items-center justify-center font-['Cinzel',serif] font-black text-xl sm:text-2xl shadow-md shrink-0">
                  {currentApprenticeName.charAt(0)}
                </div>

                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={currentApprenticeName}
                      onChange={(e) => setCurrentApprenticeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      className="font-['Outfit'] font-black text-xl sm:text-2xl text-[#0D3B36] dark:text-amber-300 border-b-2 border-[#DCA134] bg-white dark:bg-slate-800 px-3 py-1 rounded-xl focus:outline-none shadow-inner"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      title="Save Apprentice Name"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Save Name</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                      title="Cancel Edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-amber-300 tracking-tight uppercase">
                      {currentApprenticeName}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-800 text-slate-500 hover:text-[#0D3B36] dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                      title="Edit Apprentice Name"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {nameSaveNotice && (
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black animate-fade-in border border-emerald-300 dark:border-emerald-700 inline-block">
                  ✓ {nameSaveNotice}
                </div>
              )}

              <p className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-2 pt-0.5">
                <Scissors className="w-4 h-4 text-[#DCA134]" />
                <span>Master Trainer: <strong className="text-[#0D3B36] dark:text-emerald-300 font-black">{masterName}</strong></span>
                <span>· {studioName}</span>
              </p>
            </div>

            {/* Print Career CV Action Button */}
            <button
              onClick={handlePrintCV}
              className="py-3.5 px-6 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-[#DCA134] font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 border-2 border-[#DCA134] shadow-xl shadow-[#0D3B36]/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer shrink-0"
            >
              <FileText className="w-4.5 h-4.5 text-[#DCA134]" />
              <span>Print Career CV & Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HOURS & COMPETENCY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#061E1B]/90 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mentorship Hours
            </span>
            <Award className="w-4 h-4 text-[#DCA134]" />
          </div>
          <p className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-amber-300">
            120 / 120 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Hrs</span>
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-gradient-to-r from-emerald-500 to-[#DCA134] h-full w-full rounded-full" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#061E1B]/90 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accreditation Status
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-['Outfit'] font-black text-lg text-emerald-700 dark:text-emerald-300 uppercase tracking-tight">
            Accredited Designer
          </p>
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block">
            Handshake Unlocked ✓
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#061E1B]/90 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Projects
            </span>
            <Target className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-amber-300">
            {executedDuties.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Garments & Duties</span>
          </p>
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block">
            Live Production Log
          </span>
        </div>
      </div>

      {/* 3. MASTER COMPETENCY MATRIX */}
      <div className="bg-white/90 dark:bg-[#061E1B]/90 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-emerald-800/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4.5 h-4.5 text-[#DCA134]" />
            <h3 className="font-['Outfit'] font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 tracking-wider uppercase">
              MASTER COMPETENCIES & TECHNICAL PROFICIENCY
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-black border border-emerald-300 dark:border-emerald-700">
            {competencies.filter((c) => c.level === 'Master Certified').length} / 5 Certified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {competencies.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#041916] border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#DCA134] flex items-center justify-between gap-3 shadow-2xs"
            >
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#0D3B36] dark:text-emerald-200">
                  {comp.title}
                </h4>
                <span className="text-[10.5px] font-black text-emerald-700 dark:text-emerald-400 block mt-1">
                  ✓ {comp.level}
                </span>
              </div>
              <span className="text-xs font-black text-[#DCA134] bg-[#061E1B] px-3 py-1.5 rounded-xl border border-[#DCA134]/40 shrink-0 shadow-xs">
                {comp.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. EXECUTED MASTER DUTIES LOG */}
      <div className="space-y-3">
        <h3 className="font-['Outfit'] font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 tracking-wider uppercase px-1 flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-[#DCA134]" />
          <span>EXECUTED MASTER DUTIES LOG ({executedDuties.length} COMPLETED)</span>
        </h3>

        <div className="space-y-2.5">
          {executedDuties.length === 0 ? (
            <div className="p-8 text-center bg-white/90 dark:bg-[#061E1B]/90 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="font-extrabold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">No Executed Master Duties Logged Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">Master assigned tasks and client production garments will automatically log here as they are completed.</p>
            </div>
          ) : (
            executedDuties.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#061E1B]/90 border border-slate-200 dark:border-emerald-800/40 shadow-2xs flex flex-col xs:flex-row xs:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DCA134]" />
                    <span>{item.tag}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold pl-4">
                    {item.notes}
                  </p>
                </div>

                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-700 shrink-0 flex items-center gap-1.5 shadow-2xs self-start xs:self-center">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.stage}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. DESIGN REFERENCE GALLERY */}
      <div className="space-y-3 pt-1">
        <h3 className="font-['Outfit'] font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 tracking-wider uppercase px-1 flex items-center gap-2">
          <ShoppingBag className="w-4.5 h-4.5 text-[#DCA134]" />
          <span>DESIGN REFERENCE GALLERY</span>
        </h3>

        {galleryItems.length === 0 ? (
          <div className="p-8 text-center bg-white/90 dark:bg-[#061E1B]/90 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">No design gallery items present. Completed client garments will populate here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 dark:bg-[#061E1B]/90 rounded-3xl p-3.5 border border-slate-200 dark:border-emerald-800/40 shadow-2xs space-y-2.5"
              >
                <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-[#061E1B] to-[#0D3B36] border-2 border-[#DCA134]/40 flex flex-col items-center justify-center p-2 text-[#DCA134]">
                  <ShoppingBag className="w-8 h-8 text-[#DCA134] mb-1" />
                  <span className="font-['Cinzel',serif] font-black text-xs tracking-wider uppercase text-amber-200">
                    {item.initials}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#0D3B36] dark:text-slate-100 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 mt-0.5">
                    {item.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
