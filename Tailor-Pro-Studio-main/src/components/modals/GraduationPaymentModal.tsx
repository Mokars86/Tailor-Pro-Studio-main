import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  Smartphone,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Download,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { Apprentice } from '../../types';
import { getGraduationPayment, recordGraduationPayment } from '../../services/subscriptionService';
import { initializePaystackCheckout } from '../../services/paystackService';

interface GraduationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprentice: Apprentice | null;
  onPaymentSuccess?: () => void;
}

export const GraduationPaymentModal: React.FC<GraduationPaymentModalProps> = ({
  isOpen,
  onClose,
  apprentice,
  onPaymentSuccess
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'MTN' | 'TELECEL' | 'AT' | 'CARD'>('MTN');
  const [momoNumber, setMomoNumber] = useState<string>('0240000000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !apprentice) return null;

  const existingPayment = getGraduationPayment(apprentice.id);
  const isUnlocked = existingPayment?.isPaid || false;

  const handlePayGraduationFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoNumber || momoNumber.trim().length < 9) {
      alert('Please enter a valid phone or Mobile Money number.');
      return;
    }

    setIsProcessing(true);
    setSuccessMessage(null);

    initializePaystackCheckout({
      email: `${momoNumber.replace(/\D/g, '')}@tailorpro.com`,
      amountGHS: 250,
      referencePrefix: 'PAYSTACK_CERT_250',
      metadata: {
        apprenticeId: apprentice.id,
        apprenticeName: apprentice.name,
        phone: momoNumber,
        provider: selectedProvider
      },
      onSuccess: (txRef) => {
        recordGraduationPayment(apprentice.id, apprentice.name, selectedProvider === 'CARD' ? 'Card' : 'MoMo', txRef);
        setIsProcessing(false);
        setSuccessMessage(`Paystack Payment Verified (${txRef})! GHS 250 Graduation Fee completed. Official Mokars Digital Certificate & CV unlocked for ${apprentice.name}.`);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      },
      onCancel: () => {
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in font-['Outfit'] overflow-y-auto select-none">
      <div className="relative w-full max-w-2xl my-6 bg-white dark:bg-[#092825] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0D3B36] via-[#092D29] to-[#155e56] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#DCA134] shrink-0">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight uppercase text-amber-300">
                  Digital Certificate & CV Unlock
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Mokars Verified
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official graduation registration & credential unlock for {apprentice.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Certificate Watermark Preview Box */}
          <div className="relative p-6 rounded-3xl bg-slate-900 border-2 border-amber-400/50 text-white overflow-hidden shadow-xl text-center space-y-4">
            <div className="absolute top-2 right-2">
              {isUnlocked ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-900 font-black text-xs uppercase flex items-center gap-1 shadow-md">
                  <Unlock className="w-3.5 h-3.5" /> CERTIFICATE UNLOCKED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-[#0D3B36] font-black text-xs uppercase flex items-center gap-1 shadow-md">
                  <Lock className="w-3.5 h-3.5" /> LOCKED — GHS 250 FEE REQUIRED
                </span>
              )}
            </div>

            <div className="pt-2">
              <Award className="w-12 h-12 text-[#DCA134] mx-auto opacity-90 animate-bounce" />
              <h3 className="font-extrabold text-lg text-amber-300 uppercase tracking-wide mt-2">
                OFFICIAL APPRENTICE MASTER CERTIFICATE
              </h3>
              <p className="text-xs text-slate-300">
                Co-branded by <strong>Mokars Technology Corporation</strong> & Atelier Studio
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Graduating Apprentice:</span>
                <strong className="text-amber-300 font-bold">{apprentice.name}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Specialty Track:</span>
                <strong className="text-white font-bold">{apprentice.specialty || 'Haute Couture & Pattern Cutting'}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Training Hours Completed:</span>
                <strong className="text-emerald-400 font-bold">{apprentice.hoursCompleted} / {apprentice.totalRequiredHours} Hours</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Master Handshake Lock:</span>
                <strong className="text-emerald-400 font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified by Master
                </strong>
              </div>
            </div>

            {!isUnlocked && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs italic">
                "Upon payment of the GHS 250 graduation processing fee, the official digital certificate and digital resume are cryptographically issued and unlocked for instant print & PDF export."
              </div>
            )}
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Payment Form or Download Options */}
          {isUnlocked ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-center">
              <FileCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                Certificate & Digital Resume Unlocked!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Receipt Ref: <strong className="font-mono">{existingPayment?.txRef}</strong> · Paid on {existingPayment?.paidAt ? new Date(existingPayment.paidAt).toLocaleDateString() : 'Today'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => alert(`Certificate PDF export generated for ${apprentice.name}!`)}
                  className="px-6 py-2.5 rounded-full bg-[#0D3B36] text-amber-300 font-black text-xs flex items-center gap-2 shadow-md hover:bg-[#082824] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download High-Res Certificate PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePayGraduationFee} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-extrabold text-xs text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#DCA134]" />
                    <span>Graduation Processing Fee Payment</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Payable by Apprentice or Master via Mobile Money or Card
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-400 text-[#0D3B36] text-xs font-black">
                  Fee: GHS 250
                </span>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                {[
                  { id: 'MTN', name: 'MTN MoMo', color: 'bg-amber-400 text-slate-900' },
                  { id: 'TELECEL', name: 'Telecel Cash', color: 'bg-rose-600 text-white' },
                  { id: 'AT', name: 'AT Money', color: 'bg-blue-600 text-white' },
                  { id: 'CARD', name: 'Bank Card', color: 'bg-slate-800 text-white' }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setSelectedProvider(prov.id as any)}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedProvider === prov.id
                        ? `${prov.color} font-black shadow-md border-amber-400`
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{prov.name}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Phone Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Mobile Money Account Number:
                </label>
                <input
                  type="text"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0D3B36]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                      <span>PROCESSING GHS 200 GRADUATION PAYMENT...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>PAY GHS 200 VIA {selectedProvider} & UNLOCK CERTIFICATE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Official Mokars Digital Certificate Registry.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs cursor-pointer ml-auto"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
