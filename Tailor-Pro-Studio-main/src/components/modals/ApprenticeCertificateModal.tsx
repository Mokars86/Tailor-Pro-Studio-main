import React, { useRef } from 'react';
import { X, Printer, Handshake, ShieldCheck, Lock, Calendar, Scissors, Building2, Award } from 'lucide-react';
import { Apprentice } from '../../types';
import { generateUniqueCertNumber, formatCertificateDate, generateQRCodeUrl } from '../../utils/certificateGenerator';

interface ApprenticeCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprentice: Apprentice | null;
  onToggleHandshake: (apprenticeId: string) => void;
  studioLogoUrl?: string;
  studioName?: string;
  masterTrainer?: string;
}

export const ApprenticeCertificateModal: React.FC<ApprenticeCertificateModalProps> = ({
  isOpen,
  onClose,
  apprentice,
  onToggleHandshake,
  studioLogoUrl,
  studioName = 'MOKARS STITCHES STUDIO',
  masterTrainer
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !apprentice) return null;

  const logoSrc = studioLogoUrl || '/tailor_pro_logo.jpg';
  const displayStudioName = studioName && studioName !== 'My Atelier Studio' ? studioName : 'MOKARS STITCHES STUDIO';
  const displayMasterTrainer = masterTrainer || apprentice.mentor || 'Mubarik Tuahir Ali';

  const isHandshakeApproved = !apprentice.handshakeLocked;
  const issueDate = formatCertificateDate();
  const certNumber = generateUniqueCertNumber(apprentice.id || apprentice.name);
  const qrCodeUrl = generateQRCodeUrl(certNumber, apprentice.name, displayStudioName);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none">
      
      {/* Container wrapping Certificate & Controls */}
      <div className="w-full max-w-5xl my-auto space-y-3 sm:space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-2.5 text-white shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-amber-300">
              Official Apprentice Certificate of Proficiency (Landscape)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Handshake Approval Switch */}
            <button
              type="button"
              disabled={isHandshakeApproved}
              onClick={() => onToggleHandshake(apprentice.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                isHandshakeApproved
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-not-allowed opacity-90'
                  : 'bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] font-extrabold shadow-md cursor-pointer'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>
                {isHandshakeApproved
                  ? 'Handshake Approved ✓'
                  : 'Grant Master Handshake 🤝'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!isHandshakeApproved}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                isHandshakeApproved
                  ? 'bg-[#DCA134] hover:bg-[#c9902b] text-[#0A332C] shadow-md active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
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

        {/* Status Lock Warning Banner if Handshake Pending */}
        {!isHandshakeApproved && (
          <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-left">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Handshake Seal Pending:</strong> Master Designer approval is required before printing the official graduation certificate.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleHandshake(apprentice.id)}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Approve Now
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANDSCAPE APPRENTICE CERTIFICATE DOCUMENT */}
        {/* ========================================================================= */}
        <div className="w-full overflow-x-auto pb-1">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="relative w-full min-w-[320px] aspect-[1.414/1] bg-[#FDFCF7] text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-[#DCA134] select-none print:m-0 print:border-none print:shadow-none print:rounded-none flex flex-col justify-between"
          >
          {/* Background Decorative Great App Teal Polygon Shape (Positioned gracefully at lower left) */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[26%] bg-[#0D3B36] z-0"
            style={{
              clipPath: 'polygon(0 32%, 75% 100%, 0% 100%)',
            }}
          />

          {/* Golden Corner Trim Accents */}
          <div className="absolute top-4 left-4 w-9 h-9 border-t-2 border-l-2 border-[#DCA134] z-20 pointer-events-none rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-9 h-9 border-t-2 border-r-2 border-[#DCA134] z-20 pointer-events-none rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-9 h-9 border-b-2 border-l-2 border-[#DCA134] z-20 pointer-events-none rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-9 h-9 border-b-2 border-r-2 border-[#DCA134] z-20 pointer-events-none rounded-br-xl" />

          {/* Certificate Inner Content Canvas */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-4 flex flex-col justify-between h-full">

            {/* Top Header Row: Left Studio Brand Logo | Center Tailor Pro Emblem | Right Mokars Tech Corp Logo */}
            <div className="flex flex-row items-center justify-between gap-4">
              
              {/* Left Side: Master Studio Brand Logo & Title in Solid Black */}
              <div className="flex items-center gap-3 relative z-20">
                <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl bg-[#061E1B] border-3 border-[#DCA134] overflow-hidden shadow-md flex items-center justify-center shrink-0">
                  <img
                    src={logoSrc}
                    alt="Master Studio Brand Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tailor_pro_logo.jpg';
                    }}
                  />
                </div>

                <div className="text-left">
                  <h3 className="font-['Outfit'] font-black text-xs sm:text-sm md:text-base text-black tracking-wider uppercase leading-tight">
                    {displayStudioName}
                  </h3>
                  {/* SOLID BLACK SUBTITLE TEXT */}
                  <p className="text-xs sm:text-sm font-black text-black tracking-tight mt-0.5 uppercase">
                    Master Trainer: <strong className="text-black font-black">{apprentice.mentor || 'Kausar Mohammed'}</strong>
                  </p>
                </div>
              </div>

              {/* Center: Tailor Pro Emblem */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-[#061E1B] border-4 border-[#DCA134] overflow-hidden shadow-xl relative p-0.5">
                  <img
                    src="/tailor_pro_logo.jpg"
                    alt="Tailor Pro Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="text-xs sm:text-sm md:text-base font-black text-[#0D3B36] tracking-[0.35em] uppercase mt-1.5">
                  TAILOR PRO
                </span>
              </div>

              {/* Right Side: Mokars Tech Corp Logo */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <h4 className="font-['Outfit'] font-black text-xs sm:text-sm md:text-base text-black tracking-wider uppercase leading-tight">
                    MOKARS TECH CORP
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
                    Engineering Suite
                  </p>
                </div>

                <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-white border-3 border-[#DCA134] shadow-md flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src="/mokars_tech_logo.png"
                    alt="Mokars Tech Corp Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

            </div>

            {/* Center Area: Main Certificate Title in Solid Black */}
            <div className="text-center space-y-1.5 pt-1">
              <h1 className="font-['Outfit'] font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-black tracking-[0.14em] uppercase leading-none">
                CERTIFICATE
              </h1>

              <div className="flex items-center justify-center gap-3 pt-1">
                <h2 className="font-['Outfit'] font-black text-xs sm:text-sm md:text-base text-[#DCA134] tracking-[0.35em] uppercase">
                  O F &nbsp; P R O F I C I E N C Y &nbsp; A N D &nbsp; G R A D U A T I O N
                </h2>
              </div>

              <p className="font-['Outfit'] font-extrabold text-[10px] sm:text-xs text-slate-600 tracking-[0.25em] uppercase pt-2">
                T H I S &nbsp; O F F I C I A L &nbsp; D I P L O M A &nbsp; I S &nbsp; A W A R D E D &nbsp; T O
              </p>
            </div>

            {/* Recipient Full Name in Solid Black */}
            <div className="text-center py-1">
              <div className="inline-block relative">
                <h2 className="font-['Playfair_Display',serif] italic font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black tracking-wider uppercase px-6">
                  {apprentice.name.toUpperCase()}
                </h2>
                <div className="h-1 sm:h-1.5 w-full bg-[#DCA134] rounded-full mt-1.5 shadow-xs" />
              </div>
            </div>

            {/* Narrative Body Text */}
            <div className="text-center max-w-2xl mx-auto px-2 sm:px-6">
              <p className="text-xs sm:text-sm md:text-[15px] text-slate-800 leading-relaxed font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                having successfully completed <strong className="text-black font-black">{apprentice.hoursCompleted} hours</strong> of intensive CAD blueprint drafting, garment pattern cutting, and bespoke tailoring under the mentorship of <strong className="text-black font-black">{apprentice.mentor}</strong> at <strong className="text-black font-black">MOKARS STITCHES STUDIO</strong>.
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
                    {displayMasterTrainer}
                  </p>
                </div>

                {/* Item 3: Specialty */}
                <div className="pt-2 md:pt-0 md:px-3 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>SPECIALTY</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1 leading-tight uppercase">
                    {apprentice.specialty || 'Pattern Cutting & CAD'}
                  </p>
                </div>

                {/* Item 4: Certification */}
                <div className="pt-2 md:pt-0 md:px-3 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#DCA134] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#DCA134] shrink-0" />
                    <span>STATUS</span>
                  </span>
                  <p className="font-black text-xs sm:text-sm text-black mt-1 leading-tight">
                    {isHandshakeApproved ? 'Accredited Designer' : 'Pending Seal'}
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
                      MUBARIK TUAHIR ALI
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
                        alt={`QR Verification Code for ${certNumber}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Hide broken img and show fallback SVG
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
                        {certNumber}
                      </p>
                      <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        SCAN TO VERIFY CERTIFICATE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Signature: Master Trainer */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
                  <div className="inline-flex flex-col items-center sm:items-end">
                    <p className="font-['Playfair_Display',serif] italic font-black text-sm sm:text-base md:text-lg text-black leading-none uppercase">
                      {displayMasterTrainer}
                    </p>
                    <div className="h-[2px] w-full min-w-[140px] max-w-[220px] bg-slate-900 mt-1 rounded-full" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    MASTER DESIGNER & TRAINER <br className="hidden sm:block" />({displayStudioName})
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
            #printable-certificate, #printable-certificate * {
              visibility: visible !important;
            }
            #printable-certificate {
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
