import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, CreditCard, Send, ShieldCheck } from 'lucide-react';
import { UnpaidDeposit } from '../../types';

interface CollectDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit?: UnpaidDeposit | null;
  unpaidDepositsList: UnpaidDeposit[];
  onProcessCollection: (depositId: string, paymentMethod: string) => void;
}

export const CollectDepositModal: React.FC<CollectDepositModalProps> = ({
  isOpen,
  onClose,
  deposit,
  unpaidDepositsList,
  onProcessCollection
}) => {
  const [selectedDepositId, setSelectedDepositId] = useState<string>(
    deposit ? deposit.id : unpaidDepositsList[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentDep = deposit || unpaidDepositsList.find((d) => d.id === selectedDepositId);

  const handleProcess = () => {
    if (!currentDep) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onProcessCollection(currentDep.id, paymentMethod);
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-white/80">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#DCA134] text-slate-950 flex items-center justify-center font-bold gold-shadow">
            <DollarSign className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-xl text-[#0E3832]">
              Collect Session Deposit
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Secure deposit clearance & generate digital receipt
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-['Outfit'] font-bold text-lg text-slate-900">
              Deposit Collected Successfully!
            </h4>
            <p className="text-xs text-slate-500">
              ${currentDep?.amount} received via {paymentMethod}. Receipt sent to client.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Target Deposit Selection if not preselected */}
            {!deposit && unpaidDepositsList.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Client Deposit</label>
                <select
                  value={selectedDepositId}
                  onChange={(e) => setSelectedDepositId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
                >
                  {unpaidDepositsList.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.clientName} - ${dep.amount} ({dep.serviceName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentDep ? (
              <>
                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Client:</span>
                    <strong className="text-slate-900 font-bold">{currentDep.clientName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Service:</span>
                    <span className="text-slate-700 font-semibold">{currentDep.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Session Date:</span>
                    <span className="text-slate-700 font-semibold">{currentDep.sessionDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-bold text-sm">Deposit Amount:</span>
                    <strong className="font-['Outfit'] font-extrabold text-xl text-emerald-800">
                      ${currentDep.amount}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Card', 'Apple Pay', 'Cash', 'Bank Transfer'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-2.5 rounded-xl font-bold text-xs border transition-all text-center ${
                          paymentMethod === m
                            ? 'bg-[#0E3832] text-white border-[#0E3832] shadow-2xs'
                            : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transaction will automatically sync to shop ledger and send instant SMS receipt.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="px-6 py-2.5 rounded-full bg-[#DCA134] hover:bg-[#c9902b] text-slate-950 font-bold text-xs gold-shadow transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    {isProcessing ? 'Processing Payment...' : `Clear $${currentDep.amount} Deposit`}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 font-medium py-4 text-center">No pending deposits found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
