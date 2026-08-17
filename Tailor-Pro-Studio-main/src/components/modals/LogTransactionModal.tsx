import React, { useState } from 'react';
import { X, PieChart, Plus } from 'lucide-react';
import { LedgerTransaction } from '../../types';

interface LogTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: LedgerTransaction) => void;
}

export const LogTransactionModal: React.FC<LogTransactionModalProps> = ({
  isOpen,
  onClose,
  onSaveTransaction
}) => {
  const [type, setType] = useState<LedgerTransaction['type']>('revenue');
  const [category, setCategory] = useState('Tattoo Session');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(350);
  const [clientOrVendor, setClientOrVendor] = useState('');
  const [method, setMethod] = useState<LedgerTransaction['method']>('Card');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      description: description.trim(),
      amount: Number(amount) || 0,
      clientOrVendor: clientOrVendor.trim() || 'Studio General',
      status: 'cleared',
      method
    };

    onSaveTransaction(newTx);
    onClose();
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
          <div className="w-10 h-10 rounded-2xl bg-[#0E3832] text-amber-300 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5 text-[#DCA134]" />
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-xl text-[#0E3832]">
              Log Ledger Transaction
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Record gross revenue, material expenses & artist payouts
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Transaction Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['revenue', 'expense', 'deposit', 'payout'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl font-bold text-[11px] capitalize transition-all border ${
                    type === t
                      ? 'bg-[#0E3832] text-white border-[#0E3832] shadow-2xs'
                      : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Flash Session Payment or Needle Cartridges Restock"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Tattoo Session, Supplies, Payout"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount ($)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client or Vendor</label>
              <input
                type="text"
                value={clientOrVendor}
                onChange={(e) => setClientOrVendor(e.target.value)}
                placeholder="e.g. Soren Vance or Kingpin Supply"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as LedgerTransaction['method'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
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
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0E3832] hover:bg-[#0A2B26] text-white font-bold text-xs fab-shadow transition-all hover:scale-105"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
