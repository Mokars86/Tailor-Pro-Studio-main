import React from 'react';
import { ShieldCheck, X, Lock, ExternalLink, Smartphone, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 pt-10 sm:pt-6 pb-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in font-['Outfit'] overflow-y-auto select-none">
      <div className="relative w-full max-w-3xl my-1 sm:my-6 bg-white dark:bg-[#092825] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[86vh] sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#0D3B36] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#DCA134] shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-xs xs:text-sm sm:text-lg tracking-tight uppercase text-amber-300 truncate">
                  Privacy Policy & Data Security
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[8px] sm:text-[10px] font-black border border-amber-400/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" /> Play Store Verified
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-slate-300 truncate">
                Official privacy guidelines for Tailor Pro Studio (com.tailorpro.studio)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-200 leading-relaxed flex-1">
          
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-xs uppercase block text-[#0D3B36] dark:text-amber-300">
                Commitment to Data Privacy
              </span>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-amber-200/90 mt-0.5">
                Mokars Technology Corporation is committed to protecting your atelier client profiles, garment measurements, and transaction privacy.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>1. Information Collection & Usage</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
              <li><strong>Client Profiles & Measurements:</strong> Names, contact numbers, and body measurement charts are saved locally on your device for offline access.</li>
              <li><strong>Camera & Photo Access:</strong> Used solely for live AI Fabric Color Scanning and Front vs Back Weave Inspection. Photos are analyzed in real time and never shared.</li>
              <li><strong>Payment Transactions:</strong> Subscription and graduation payments are processed via Paystack. No banking PINs or raw credit card data are stored on our servers.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>2. Third-Party Integrations</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
              <li><strong>Paystack Mobile Gateway:</strong> Used for Mobile Money (MTN, Telecel, AT) and card processing.</li>
              <li><strong>Google Gemini AI:</strong> Used for pattern structure analysis and voice dictation processing.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>3. Data Rights & Support</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
              You can edit or delete any client records at any time directly within Tailor Pro. For complete account or payment data removal requests, contact Mokars Technology Corporation via WhatsApp at <strong>+233546920418</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              App Version: 1.0.0 | Package: com.tailorpro.studio
            </span>
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Web Privacy Policy</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 px-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0D3B36] text-amber-300 font-bold text-xs cursor-pointer shadow-md hover:bg-[#082824] transition-colors"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
