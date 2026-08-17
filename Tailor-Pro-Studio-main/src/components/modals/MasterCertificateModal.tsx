import React, { useRef, useState } from 'react';
import { X, Printer, ShieldCheck, Award, Edit3, Calendar, Scissors, Building2 } from 'lucide-react';
import { generateUniqueCertNumber, formatCertificateDate, generateQRCodeUrl } from '../../utils/certificateGenerator';

interface MasterCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioName?: string;
  masterTrainer?: string;
  ceoName?: string;
  studioLogoUrl?: string;
}

export const MasterCertificateModal: React.FC<MasterCertificateModalProps> = ({
  isOpen,
  onClose,
  studioName = 'MOKARS STITCHES STUDIO',
  masterTrainer = 'MUBARIK TUAHIR ALI',
  ceoName = 'MUBARIK TUAHIR ALI',
  studioLogoUrl
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [recipientTitle, setRecipientTitle] = useState<string>(studioName);
  const [trainerName, setTrainerName] = useState<string>(masterTrainer);
  const [issueDate, setIssueDate] = useState<string>(() => formatCertificateDate());
  const [certCode, setCertCode] = useState<string>(() => generateUniqueCertNumber(studioName));
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!isOpen) return null;

  const qrCodeUrl = generateQRCodeUrl(certCode, recipientTitle, studioName);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none">
      {/* Container wrapping Certificate & Controls */}
      <div className="w-full max-w-5xl my-auto space-y-3 sm:space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-2.5 text-white shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#DCA134]" />
              Official Master Craftsman Certificate of Tailoring Excellence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Customize Details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEditing ? 'Done Editing' : 'Edit Info'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#DCA134] hover:bg-[#c9902b] text-[#0A332C] text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF (Landscape)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Close Certificate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Info Panel (collapsible) */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-[#DCA134]/40 text-slate-200 text-xs shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                Accredited Recipient
              </label>
              <input
                type="text"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                Master Trainer
              </label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                Accreditation Date
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={certCode}
                onChange={(e) => setCertCode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Master Accreditation Status Banner */}
        <div className="p-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/70 text-emerald-200 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-extrabold uppercase tracking-wide">
                Master Craftsman Accreditation • Authenticated Landscape Document
              </p>
              <p className="text-[11px] text-slate-300 opacity-90">
                Official accreditation recognized under Mokars Tech Corp & Tailor Pro Studio Network.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-500/40 shrink-0">
            Gold Tier Certified
          </span>
        </div>

        {/* ========================================================================= */}
        {/* LANDSCAPE MASTER CRAFTSMAN CERTIFICATE DOCUMENT */}
        {/* ========================================================================= */}
        <div className="w-full overflow-x-auto pb-1">
          <div
            ref={certificateRef}
            id="printable-master-certificate"
            className="relative w-full min-w-[320px] aspect-[1.414/1] bg-[#FDFCF7] text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-[#DCA134] select-none print:m-0 print:border-none print:shadow-none print:rounded-none flex flex-col justify-between"
          >
          {/* Background Decorative Great App Teal Polygon Shape (Pure Great Teal Color #0D3B36 - Gold Accent Stripe Removed) */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[24%] bg-[#0D3B36] z-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 36% 100%, 0% 100%)',
            }}
          />

          {/* Golden Corner Trim Accents */}
          <div className="absolute top-4 left-4 w-9 h-9 border-t-2 border-l-2 border-[#DCA134] z-20 pointer-events-none rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-9 h-9 border-t-2 border-r-2 border-[#DCA134] z-20 pointer-events-none rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-9 h-9 border-b-2 border-l-2 border-[#DCA134] z-20 pointer-events-none rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-9 h-9 border-b-2 border-r-2 border-[#DCA134] z-20 pointer-events-none rounded-br-xl" />

          {/* Certificate Inner Content Canvas */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-4 flex flex-col justify-between h-full">

            {/* Top Header Row: Left Master Brand Logo | Center Tailor Pro Emblem | Right Mokars Tech Corp Logo */}
            <div className="flex flex-row items-center justify-between gap-4">
              
              {/* Left Side: Master Brand Logo Emblem & Studio Title in High-Contrast Gold/White over Green Polygon */}
              <div className="flex items-center gap-3 relative z-20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-lg flex items-center justify-center shrink-0">
                  <img
                    src={studioLogoUrl || '/tailor_pro_logo.jpg'}
                    alt="Master Studio Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tailor_pro_logo.jpg';
                    }}
                  />
                </div>

                <div className="text-left">
                  <h3 className="font-['Outfit'] font-black text-xs sm:text-sm md:text-base text-black tracking-wider uppercase leading-tight">
                    {studioName || 'MOKARS STITCHES STUDIO'}
                  </h3>
                  {/* SOLID BLACK SUBTITLE TEXT */}
                  <p className="text-xs sm:text-sm font-black text-black tracking-tight mt-0.5 uppercase">
                    Master Principal & Founder
                  </p>
                </div>
              </div>

              {/* Center: Official Tailor Pro Emblem & Spaced Subtitle */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md relative p-0.5">
                  <img
                    src="/tailor_pro_logo.jpg"
                    alt="Tailor Pro Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="text-[8px] sm:text-[9px] font-black text-black tracking-[0.3em] uppercase mt-1">
                  TAILOR PRO
                </span>
              </div>

              {/* Right Side: Mokars Tech Corp & Corporate Emblem */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <h4 className="font-['Outfit'] font-black text-xs sm:text-sm md:text-base text-black tracking-wider uppercase leading-tight">
                    MOKARS TECH CORP
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
                    Engineering Suite
                  </p>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#DCA134] shadow-md flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src="/mokars_tech_logo.png"
                    alt="Mokars Tech Corp Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

            </div>

            {/* Center Area: Main Master Certificate Title in Black */}
            <div className="text-center space-y-1.5 pt-1">
              <h1 className="font-['Outfit'] font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-black tracking-[0.14em] uppercase leading-none">
                MASTER CRAFTSMAN
              </h1>

              <div className="flex items-center justify-center gap-3 pt-1">
                <h2 className="font-['Outfit'] font-black text-[11px] sm:text-xs md:text-sm text-[#DCA134] tracking-[0.35em] uppercase">
                  C E R T I F I C A T E &nbsp; O F &nbsp; T A I L O R I N G &nbsp; E X C E L L E N C E
                </h2>
              </div>

              <p className="font-['Outfit'] font-extrabold text-[10px] sm:text-xs text-slate-600 tracking-[0.25em] uppercase pt-2">
                T H I S &nbsp; O F F I C I A L &nbsp; A C C R E D I T A T I O N &nbsp; I S &nbsp; G R A N T E D &nbsp; T O
              </p>
            </div>

            {/* Recipient Full Name / Studio Principal in Solid Black */}
            <div className="text-center py-1">
              <div className="inline-block relative">
                <h2 className="font-['Playfair_Display',serif] italic font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black tracking-wider uppercase px-6">
                  {recipientTitle.toUpperCase()}
                </h2>
                {/* Thick Gold Accent Underline */}
                <div className="h-1 sm:h-1.5 w-full bg-[#DCA134] rounded-full mt-1.5 shadow-xs" />
              </div>
            </div>

            {/* Narrative Body Text */}
            <div className="text-center max-w-2xl mx-auto px-2 sm:px-6">
              <p className="text-xs sm:text-sm md:text-[15px] text-slate-800 leading-relaxed font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                is hereby certified as an accredited <strong className="text-black font-black">Master Tailor & Studio Principal</strong> of{' '}
                <strong className="text-black font-black">{studioName}</strong>, recognized for exemplary craftsmanship, CAD silhouette blueprinting, and digital fashion studio leadership authorized by{' '}
                <strong className="text-black font-black">Mokars Tech Corp (MTC)</strong> and{' '}
                <strong className="text-black font-black">Tailor Pro Engineering Suite</strong>.
              </p>
            </div>

            {/* Highlighted Credentials Card with Lucide Vector Icons (4 Columns) */}
            <div className="bg-[#FAF7F0] border-2 border-[#DCA134]/70 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left divide-y md:divide-y-0 md:divide-x divide-amber-300/80">
                
                {/* Item 1: Graduation Date */}
                <div className="pt-2 md:pt-0 md:px-2 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>GRADUATION DATE</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1">
                    {issueDate}
                  </p>
                </div>

                {/* Item 2: Master Trainer */}
                <div className="pt-2 md:pt-0 md:px-3 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>MASTER TRAINER</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1 uppercase">
                    {trainerName}
                  </p>
                </div>

                {/* Item 3: Graduation Studio */}
                <div className="pt-2 md:pt-0 md:px-3 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>GRADUATION STUDIO</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1 leading-tight uppercase">
                    {studioName}
                  </p>
                </div>

                {/* Item 4: Certification Level */}
                <div className="pt-2 md:pt-0 md:px-3 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>CERTIFICATION</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1 leading-tight">
                    Master Studio Principal
                  </p>
                </div>

              </div>
            </div>

            {/* Bottom Section: Dual Signatures + EXPANDED HIGH-RESOLUTION VERIFICATION QR CODE */}
            <div className="pt-2 border-t border-[#DCA134]/40">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 sm:gap-2">
                
                {/* Left Signature: Mubarik Tuahir Ali (CEO) */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <div className="inline-flex flex-col items-center sm:items-start">
                    <p className="font-['Playfair_Display',serif] italic font-black text-sm sm:text-base md:text-lg text-black leading-none uppercase">
                      {ceoName}
                    </p>
                    <div className="h-[2px] w-full min-w-[140px] max-w-[220px] bg-slate-900 mt-1 rounded-full" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    CEO, MOKARS TECH CORP <br className="hidden sm:block" />(MTC)
                  </p>
                </div>

                {/* Center Verification Badge with ENLARGED HIGH-RES QR MATRIX */}
                <div className="mx-auto">
                  <div className="bg-white border-2 border-[#DCA134] rounded-2xl p-3 sm:p-3.5 shadow-md flex items-center gap-3">
                    {/* Enlarged QR Code (w-16 h-16 sm:w-20 sm:h-20) */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-300 rounded-xl p-1 shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                      <img
                        src={qrCodeUrl}
                        alt={`QR Verification Code for ${certCode}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Enlarged Verification Text */}
                    <div className="text-left leading-tight space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <span className="font-black text-xs sm:text-sm text-emerald-800 uppercase tracking-wide">
                          100% VERIFIED
                        </span>
                      </div>
                      <p className="font-mono font-black text-xs sm:text-sm text-[#0D3B36] tracking-tight">
                        {certCode}
                      </p>
                      <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        SCAN TO VERIFY CERTIFICATE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Signature: Kausara Mohammed (Master Designer) */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
                  <div className="inline-flex flex-col items-center sm:items-end">
                    <p className="font-['Playfair_Display',serif] italic font-black text-sm sm:text-base md:text-lg text-black leading-none uppercase">
                      {trainerName}
                    </p>
                    <div className="h-[2px] w-full min-w-[140px] max-w-[220px] bg-slate-900 mt-1 rounded-full" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    MASTER DESIGNER & TRAINER <br className="hidden sm:block" />({studioName})
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Print Stylesheet for true high-res Landscape PDF & physical printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @page {
            size: landscape;
            margin: 0;
          }
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-master-certificate, #printable-master-certificate * {
              visibility: visible !important;
            }
            #printable-master-certificate {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 24px !important;
              border: 3px solid #DCA134 !important;
              box-shadow: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}} />

      </div>
    </div>
  );
};
