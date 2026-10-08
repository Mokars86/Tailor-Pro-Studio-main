import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Scissors,
  CheckCircle2,
  Calendar,
  Ruler,
  DollarSign,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Client, RunwayStage, ClientOrder } from '../../types';
import { parseCleanNumber } from '../../utils/numeric';

interface ReorderClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  artistsList?: string[];
  onConfirmReorder: (
    clientId: string,
    newOrder: {
      garmentTag: string;
      totalCost: number;
      depositPaid: number;
      paymentMethod: string;
      fittingDate?: string;
      runwayStage: RunwayStage;
      assignedDesigner?: string;
      notes?: string;
    }
  ) => void;
  onOpenInvoice?: (client: Client) => void;
}

const POPULAR_STYLES = [
  'Senator Wear',
  'Agbada 3-Piece',
  'Kente Corset Gown',
  'Kaftan & Trousers',
  'Slit & Kaba',
  'Corporate Suit',
  'Kids Style',
  'Flair Style',
  'Couture Wedding Gown'
];

export const ReorderClientModal: React.FC<ReorderClientModalProps> = ({
  isOpen,
  onClose,
  client,
  artistsList = ['Master Atelier'],
  onConfirmReorder,
  onOpenInvoice
}) => {
  const [garmentTag, setGarmentTag] = useState('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [depositPaid, setDepositPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [fittingDate, setFittingDate] = useState('');
  const [runwayStage, setRunwayStage] = useState<RunwayStage>('CUTTING');
  const [assignedDesigner, setAssignedDesigner] = useState(artistsList[0] || 'Master Atelier');
  const [notes, setNotes] = useState('');
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderSummary, setCreatedOrderSummary] = useState<any>(null);

  if (!isOpen || !client) return null;

  const numTotal = parseCleanNumber(totalCost);
  const numPaid = parseCleanNumber(depositPaid);
  const balanceDue = Math.max(0, numTotal - numPaid);

  const measurements = client.measurements || {};
  const hasMeasurements = Object.keys(measurements).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!garmentTag.trim()) {
      alert('Please enter or select a garment style for the new order.');
      return;
    }

    const orderData = {
      garmentTag: garmentTag.trim(),
      totalCost: numTotal,
      depositPaid: numPaid,
      paymentMethod,
      fittingDate: fittingDate || undefined,
      runwayStage,
      assignedDesigner: assignedDesigner || artistsList[0] || 'Master Atelier',
      notes: notes.trim()
    };

    setCreatedOrderSummary(orderData);
    onConfirmReorder(client.id, orderData);
    setIsSuccess(true);
  };

  const handleCloseModal = () => {
    setIsSuccess(false);
    setGarmentTag('');
    setTotalCost('');
    setDepositPaid('');
    setNotes('');
    setFittingDate('');
    onClose();
  };

  const handleShareWhatsAppReceipt = () => {
    if (!createdOrderSummary) return;
    const text = encodeURIComponent(
      `*MOKARS FASHION STITCHES — NEW ORDER CONFIRMATION*\n` +
      `------------------------------------------\n` +
      `👤 *Client:* ${client.name}\n` +
      `👗 *New Garment Design:* ${createdOrderSummary.garmentTag}\n` +
      `✂️ *Initial Runway Stage:* ${createdOrderSummary.runwayStage}\n` +
      `📅 *Fitting Date:* ${createdOrderSummary.fittingDate || 'To be scheduled'}\n` +
      `------------------------------------------\n` +
      `💵 *Total Cost:* GHS ${createdOrderSummary.totalCost.toLocaleString()}\n` +
      `✅ *Deposit Paid:* GHS ${createdOrderSummary.depositPaid.toLocaleString()} (${createdOrderSummary.paymentMethod})\n` +
      `💰 *Remaining Balance:* GHS ${Math.max(0, createdOrderSummary.totalCost - createdOrderSummary.depositPaid).toLocaleString()}\n` +
      `------------------------------------------\n` +
      `📐 *Body Measurements:* Verified & already on file ✓\n\n` +
      `Thank you for trusting Mokars Fashion Stitches again! ✂️✨`
    );
    const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
    window.open(cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#F3F9F6] via-[#EBF5F0] to-[#E2F0EA] dark:from-[#061E1B] dark:via-[#092825] dark:to-[#051816] rounded-[32px] p-5 sm:p-7 space-y-4 shadow-2xl border border-white/90 dark:border-white/10 max-h-[92vh] flex flex-col my-auto relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] flex items-center justify-center font-black shadow-md shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-black text-lg sm:text-xl text-[#0D3B36] dark:text-emerald-300">
                Start New Garment Order
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Returning client re-order with instant Runway & Ledger sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-white/80 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-700 animate-bounce shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-xl text-slate-900 dark:text-slate-100">
                New Order Launched on Runway!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                <strong className="text-[#0D3B36] dark:text-amber-300">{createdOrderSummary?.garmentTag}</strong> has been added to <strong>{client.name}</strong>'s active runway pipeline and recorded in the shop ledger.
              </p>
            </div>

            <div className="p-4 bg-white/90 dark:bg-[#041614] rounded-2xl border border-emerald-900/10 dark:border-white/10 text-xs space-y-2 max-w-sm mx-auto text-left shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <strong className="text-slate-800 dark:text-slate-200">{client.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billing:</span>
                <strong className="text-slate-800 dark:text-slate-200">GHS {createdOrderSummary?.totalCost.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Collected:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">GHS {createdOrderSummary?.depositPaid.toLocaleString()} ({createdOrderSummary?.paymentMethod})</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                <span className="text-slate-600 dark:text-slate-400">Balance Due:</span>
                <strong className="text-amber-600 dark:text-amber-400">GHS {Math.max(0, (createdOrderSummary?.totalCost || 0) - (createdOrderSummary?.depositPaid || 0)).toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleShareWhatsAppReceipt}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp Receipt</span>
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="py-3 px-5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Done & View Runway</span>
              </button>
            </div>
          </div>
        ) : (
          /* REORDER FORM */
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 text-xs font-medium">
            
            {/* 1. Client Identity & Measurements Badge (Pre-filled, Zero Re-keying) */}
            <div className="p-3.5 bg-white/90 dark:bg-[#092825] rounded-2xl border border-emerald-900/10 dark:border-white/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {client.initials || 'CL'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{client.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                        <UserCheck className="w-3 h-3" />
                        <span>Profile Saved</span>
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      📞 {client.phone || 'No phone'} {client.email ? `• ${client.email}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                  <span>Measurements</span>
                  {showMeasurements ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Measurements Drawer */}
              {showMeasurements && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                  {hasMeasurements ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-[11px]">
                      {Object.entries(measurements).map(([key, val]) => (
                        <div key={key} className="p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                          <span className="text-[9px] text-slate-400 uppercase block truncate">{key}</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-black">{String(val)}″</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No custom body measurements saved yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. New Garment Style Selection */}
            <div className="space-y-1.5">
              <label className="block font-black text-slate-800 dark:text-slate-200 text-xs">
                New Garment Design / Style Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 3-Piece Senator Wear, Kente Corset, Kaftan"
                value={garmentTag}
                onChange={(e) => setGarmentTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />

              {/* Quick Select Style Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setGarmentTag(style)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      garmentTag === style
                        ? 'bg-[#0D3B36] text-white border-[#0D3B36] dark:bg-amber-400 dark:text-slate-950 shadow-2xs'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white'
                    }`}
                  >
                    + {style}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Financials & Deposit Collection */}
            <div className="p-3.5 bg-white/90 dark:bg-[#092825] rounded-2xl border border-emerald-900/10 dark:border-white/10 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>New Order Billing & Deposit</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Total Billing (GHS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-black text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Deposit Paid (GHS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-black text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Payment Method selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Deposit Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Cash', 'MoMo', 'Card', 'Bank Transfer'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border text-center transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-[#0D3B36] text-white border-[#0D3B36] dark:bg-amber-400 dark:text-slate-950 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Balance Telemetry */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-between font-bold text-xs">
                <span className="text-slate-500 dark:text-slate-400">Calculated Balance Due:</span>
                <strong className={`font-['Outfit'] font-black text-sm ${balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {balanceDue > 0 ? `GHS ${balanceDue.toLocaleString()}` : 'PAID IN FULL ✓'}
                </strong>
              </div>
            </div>

            {/* 4. Runway Pipeline Configuration & Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  Initial Runway Stage
                </label>
                <select
                  value={runwayStage}
                  onChange={(e) => setRunwayStage(e.target.value as RunwayStage)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="CONSULT">Consultation</option>
                  <option value="CUTTING">Cutting Phase</option>
                  <option value="SEWING">Sewing / Assembly</option>
                  <option value="FITTING">Fitting Phase</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  Assigned Tailor / Designer
                </label>
                <select
                  value={assignedDesigner}
                  onChange={(e) => setAssignedDesigner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100"
                >
                  {artistsList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Scheduled Fitting Date
              </label>
              <input
                type="date"
                value={fittingDate}
                onChange={(e) => setFittingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Special Design Instructions / Style Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Double breasted, golden buttons, 2 inches added to sleeve length..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#DCA134] hover:bg-[#c9902b] text-slate-950 font-black gold-shadow transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Scissors className="w-4 h-4" />
                <span>Launch New Order on Runway 🚀</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
