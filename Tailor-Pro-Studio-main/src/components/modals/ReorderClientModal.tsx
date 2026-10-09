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

const MEASUREMENT_LABELS: Record<string, string> = {
  bust: 'Bust',
  chest: 'Chest',
  bustOrChest: 'Bust/Chest',
  waist: 'Waist',
  hips: 'Hips',
  shoulder: 'Shoulder',
  sleeve: 'Sleeve',
  sleeveLength: 'Sleeve',
  neck: 'Neck',
  length: 'Length',
  fullLength: 'Full Len',
  trouserLength: 'Trouser',
  inseam: 'Inseam',
  thigh: 'Thigh',
  ankle: 'Ankle',
  wrist: 'Wrist',
  bicep: 'Bicep',
  armHole: 'Armhole',
  crossBack: 'Cross Back',
  underBust: 'Underbust',
  roundUnderBust: 'Underbust',
  neckToWaist: 'Neck-Waist',
  shoulderToWaist: 'Shldr-Waist',
  waistToKnee: 'Waist-Knee',
  crotchDepth: 'Crotch',
  roundKnee: 'Knee'
};

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

  const formattedMeasurements = React.useMemo(() => {
    if (!client?.measurements) return [];
    const list: { key: string; label: string; value: string | number }[] = [];
    const raw = client.measurements as Record<string, any>;

    for (const [k, v] of Object.entries(raw)) {
      if (v === null || v === undefined || v === '' || v === 0 || v === '0') continue;
      if (typeof v === 'object') {
        for (const [subK, subV] of Object.entries(v)) {
          if (subV !== null && subV !== undefined && subV !== '' && subV !== 0 && subV !== '0') {
            list.push({
              key: `${k}-${subK}`,
              label: MEASUREMENT_LABELS[subK] || subK.replace(/([A-Z])/g, ' $1').trim(),
              value: String(subV)
            });
          }
        }
      } else {
        list.push({
          key: k,
          label: MEASUREMENT_LABELS[k] || k.replace(/([A-Z])/g, ' $1').trim(),
          value: String(v)
        });
      }
    }
    return list;
  }, [client?.measurements]);

  if (!isOpen || !client) return null;

  const numTotal = parseCleanNumber(totalCost);
  const numPaid = parseCleanNumber(depositPaid);
  const balanceDue = Math.max(0, numTotal - numPaid);

  const hasMeasurements = formattedMeasurements.length > 0;

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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-xl max-w-full bg-gradient-to-b from-[#F3F9F6] via-[#EBF5F0] to-[#E2F0EA] dark:from-[#061E1B] dark:via-[#092825] dark:to-[#051816] rounded-[22px] sm:rounded-[32px] p-3 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl border border-white/90 dark:border-white/10 max-h-[92vh] flex flex-col my-auto relative overflow-hidden overflow-x-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-emerald-900/10 dark:border-white/10 pr-0.5 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] flex items-center justify-center font-black shadow-md shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-['Outfit'] font-black text-sm sm:text-lg text-[#0D3B36] dark:text-emerald-300 truncate">
                Start New Garment Order
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Returning client re-order with instant Runway sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs shrink-0 ml-1.5"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="py-4 sm:py-6 text-center space-y-3.5 sm:space-y-4 animate-fade-in w-full overflow-hidden">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-700 animate-bounce shadow-md">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-base sm:text-xl text-slate-900 dark:text-slate-100">
                New Order Launched on Runway!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                <strong className="text-[#0D3B36] dark:text-amber-300">{createdOrderSummary?.garmentTag}</strong> has been added to <strong>{client.name}</strong>'s active runway pipeline and recorded in the shop ledger.
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-white/90 dark:bg-[#041614] rounded-2xl border border-emerald-900/10 dark:border-white/10 text-xs space-y-2 max-w-sm mx-auto text-left shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <strong className="text-slate-800 dark:text-slate-200 truncate ml-2">{client.name}</strong>
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

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleShareWhatsAppReceipt}
                className="w-full xs:flex-1 py-2.5 sm:py-3 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp Receipt</span>
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full xs:w-auto py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                <span>Done & View Runway</span>
              </button>
            </div>
          </div>
        ) : (
          /* REORDER FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 overflow-y-auto overflow-x-hidden pr-0.5 sm:pr-1 text-xs font-medium w-full max-w-full">
            
            {/* 1. Client Identity & Measurements Badge (Pre-filled, Zero Re-keying) */}
            <div className="p-3 sm:p-3.5 bg-white/90 dark:bg-[#092825] rounded-2xl border border-emerald-900/10 dark:border-white/10 shadow-xs space-y-2.5 overflow-hidden w-full max-w-full">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {client.initials || 'CL'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate max-w-[140px] xs:max-w-[170px]">
                        {client.name}
                      </h3>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 shrink-0">
                        <UserCheck className="w-2.5 h-2.5" />
                        <span>Saved</span>
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      📞 {client.phone || 'No phone'} {client.email ? `• ${client.email}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="w-full xs:w-auto px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 active:scale-95"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                  <span>{showMeasurements ? 'Hide Measurements' : 'Measurements'}</span>
                  {showMeasurements ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Measurements Drawer */}
              {showMeasurements && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in w-full overflow-hidden">
                  {hasMeasurements ? (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1.5 text-[11px] w-full">
                      {formattedMeasurements.map(({ label, value, key }) => (
                        <div
                          key={key}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center min-w-0 overflow-hidden"
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block truncate" title={label}>
                            {label}
                          </span>
                          <strong className="text-slate-800 dark:text-slate-200 font-black truncate block">
                            {value}″
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic text-center py-1">No custom body measurements saved yet.</p>
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

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {['Cash', 'MoMo', 'Card', 'Bank Transfer'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border text-center transition-all cursor-pointer truncate ${
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
                <strong className={`font-['Outfit'] font-black text-xs sm:text-sm ${balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {balanceDue > 0 ? `GHS ${balanceDue.toLocaleString()}` : 'PAID IN FULL ✓'}
                </strong>
              </div>
            </div>

            {/* 4. Runway Pipeline Configuration & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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
            <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 sm:gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full xs:w-auto px-4 py-2 sm:py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full xs:w-auto px-5 sm:px-6 py-2.5 rounded-full bg-[#DCA134] hover:bg-[#c9902b] text-slate-950 font-black gold-shadow transition-all hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-center"
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
