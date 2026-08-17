import React, { useState } from 'react';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Phone,
  Paperclip,
  ShoppingBag,
  FileText,
  MessageSquare,
  Scissors,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Ruler
} from 'lucide-react';
import { Client, StudioSettings } from '../../types';
import { FullMeasurementsModal } from './FullMeasurementsModal';

interface ClientProfileModalProps {
  isOpen: boolean;
  client: Client | null;
  studioSettings?: StudioSettings;
  onClose: () => void;
  onEditClient?: (client: Client) => void;
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onOpenMeasurements?: (client: Client) => void;
  onOpenSpecSheet?: (client: Client) => void;
  onOpenInvoice?: (client: Client) => void;
  onUpdateNotes?: (clientId: string, newNotes: string) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  client,
  studioSettings,
  onClose,
  onEditClient,
  onUpdateClient,
  onDeleteClient,
  onOpenMeasurements,
  onOpenSpecSheet,
  onOpenInvoice,
  onUpdateNotes
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'orders' | 'notes'>('details');
  const [notesText, setNotesText] = useState(client?.notes || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Client Details Popup State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFullMeasurementsOpen, setIsFullMeasurementsOpen] = useState(false);
  const [editName, setEditName] = useState(client?.name || '');
  const [editPhone, setEditPhone] = useState(client?.phone || '');
  const [editGarmentTag, setEditGarmentTag] = useState(client?.garmentTag || '');
  const [editTotalBilling, setEditTotalBilling] = useState<number>(client?.totalCost || 0);
  const [editPaidDeposit, setEditPaidDeposit] = useState<number>(client?.depositPaid || 0);

  if (!isOpen || !client) return null;

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleOpenEditModal = () => {
    setEditName(client.name || '');
    setEditPhone(client.phone || '');
    setEditGarmentTag(client.garmentTag || '');
    setEditTotalBilling(client.totalCost || 0);
    setEditPaidDeposit(client.depositPaid || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveClientDetails = () => {
    const updatedTotal = Number(editTotalBilling) || 0;
    const updatedDeposit = Number(editPaidDeposit) || 0;
    const updatedBalance = Math.max(0, updatedTotal - updatedDeposit);

    const updatedClient: Client = {
      ...client,
      name: editName,
      initials: editName.split(' ').map((n) => n[0]).join('').toUpperCase() || 'CL',
      phone: editPhone,
      garmentTag: editGarmentTag,
      totalCost: updatedTotal,
      depositPaid: updatedDeposit,
      balanceDue: updatedBalance
    };

    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
    setIsEditModalOpen(false);
    showNotification('Client details updated successfully!');
  };

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(client.id, notesText);
    }
    showNotification('Tailor notes updated successfully!');
  };

  const handleWhatsAppClick = () => {
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      showNotification(`Opening WhatsApp messaging for ${client.name}...`);
    }
  };

  const measurements = client.measurements || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#EBF5F0] dark:bg-[#061E1B] rounded-[36px] p-5 sm:p-6 space-y-4 shadow-2xl border border-white dark:border-white/10 max-h-[86vh] sm:max-h-[92vh] flex flex-col my-0 sm:my-auto relative overflow-hidden mt-1 sm:mt-0">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-400/40 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header / Navigation Bar */}
        <div className="flex items-center justify-between shrink-0 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[#0D3B36] dark:text-[#DCA134] font-['Outfit'] font-black text-lg tracking-tight uppercase hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
            <span>CLIENT PROFILE</span>
          </button>

          {/* Top Right Action Buttons (Pencil & Trash) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Edit Client"
            >
              <Pencil className="w-4 h-4 text-slate-700 dark:text-amber-300" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onDeleteClient && window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                  onDeleteClient(client.id);
                  onClose();
                }
              }}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4 text-slate-700 dark:text-rose-400 hover:text-rose-600" />
            </button>
          </div>
        </div>

        {/* Client Summary Header Card */}
        <div className="flex items-center justify-between bg-transparent pt-1 shrink-0">
          <div className="space-y-1">
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-amber-300 tracking-tight uppercase">
              {client.name}
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {client.garmentTag || 'GARMENT'}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>{client.status || 'Active'}</span>
              </span>
            </div>
          </div>

          {/* Large Avatar Block */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[24px] bg-[#0D3B36] dark:bg-[#12423D] text-white font-['Outfit'] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 border-2 border-white dark:border-slate-700">
            {client.initials || client.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Sub-Tab Navigation Pills */}
        <div className="grid grid-cols-3 gap-2 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
        </div>

        {/* Scrollable Main Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 custom-scrollbar">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* 1. CONTACT INFO */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  CONTACT INFO
                </h3>
                <div className="p-3 bg-[#EBF5F0]/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Phone className="w-4 h-4 text-slate-600 dark:text-amber-300" />
                    <span>{client.phone || '0233612233'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppClick}
                    className="w-9 h-9 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title="Message Client on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 fill-white text-white" />
                  </button>
                </div>
              </div>

              {/* 2. LAST MEASUREMENTS */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    LAST MEASUREMENTS
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    DATE: {client.timestamp || 'JUST NOW'}
                  </span>
                </div>

                {/* 2-Column Measurements Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Bust / Chest:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.bustOrChest || '0.0"'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Waist:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.waist || '0.0"'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Hip:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.hips || '0.0"'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Shoulder-to-Waist:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.neckToWaist || '0.0"'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Sleeve:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.sleeveLength || '0.0"'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Length:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{measurements.fullLength || '0.0"'}</span>
                  </div>
                </div>

                {/* Measurement Actions */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenMeasurements) {
                          onOpenMeasurements(client);
                        }
                      }}
                      className="py-3 px-4 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-white dark:text-[#0D3B36]" />
                      <span>Take Measurements</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenSpecSheet) {
                          onOpenSpecSheet(client);
                        } else {
                          showNotification(`Opening spec sheet for ${client.name}...`);
                        }
                      }}
                      className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-700 dark:text-amber-300" />
                      <span>View Spec Sheet</span>
                    </button>
                  </div>

                  {/* View Full Measurements button below Spec Sheet button */}
                  <button
                    type="button"
                    onClick={() => setIsFullMeasurementsOpen(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-[#0D3B36] dark:from-emerald-800 dark:to-emerald-950 hover:from-emerald-800 hover:to-[#082824] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-600/30 cursor-pointer"
                  >
                    <Ruler className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>View Full Measurements</span>
                  </button>
                </div>
              </div>

              {/* 3. PAYMENT SUMMARY */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    PAYMENT SUMMARY
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">
                      TOTAL BILLING
                    </span>
                    <span className="font-['Outfit'] font-black text-sm sm:text-base text-[#0D3B36] dark:text-amber-300 block mt-1">
                      GH₵ {client.totalCost}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">
                      DEPOSIT PAID
                    </span>
                    <span className="font-['Outfit'] font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 block mt-1">
                      GH₵ {client.depositPaid}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">
                      BALANCE DUE
                    </span>
                    <span className="font-['Outfit'] font-black text-sm sm:text-base text-[#E11D48] dark:text-rose-400 block mt-1">
                      GH₵ {client.balanceDue}
                    </span>
                  </div>
                </div>

                {/* Generate Invoice Action */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenInvoice) {
                        onOpenInvoice(client);
                      } else {
                        showNotification(`Generating invoice for ${client.name}...`);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <FileText className="w-4 h-4 text-[#DCA134] dark:text-[#0D3B36]" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              {/* ORDER HISTORY SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ORDER HISTORY
                </h3>

                <div className="space-y-2.5">
                  {/* History Item 2 */}
                  <div className="p-3 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-300 shrink-0 shadow-2xs">
                        <Scissors className="w-4 h-4 text-slate-700 dark:text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 uppercase">
                          {client.garmentTag || 'VLISCO'} — Session #2
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          Recorded: {client.timestamp || '10/08/2026 08:31'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#D1F4E2] dark:bg-emerald-950/80 text-[#0D6348] dark:text-emerald-300 border border-transparent dark:border-emerald-700 text-[11px] font-black shrink-0">
                      Recorded
                    </span>
                  </div>

                  {/* History Item 1 */}
                  <div className="p-3 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-300 shrink-0 shadow-2xs">
                        <Scissors className="w-4 h-4 text-slate-700 dark:text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 uppercase">
                          {client.garmentTag || 'VLISCO'} — Session #1
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          Recorded: 10/08/2026 08:28
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#D1F4E2] dark:bg-emerald-950/80 text-[#0D6348] dark:text-emerald-300 border border-transparent dark:border-emerald-700 text-[11px] font-black shrink-0">
                      Recorded
                    </span>
                  </div>
                </div>
              </div>

              {/* CURRENT ORDER SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  CURRENT ORDER
                </h3>

                <div className="p-3 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] flex items-center justify-center shrink-0 shadow-xs">
                      <Scissors className="w-5 h-5 text-white dark:text-[#0D3B36]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 uppercase">
                        {client.garmentTag || 'VLISCO'}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        Stage: {client.runwayStage || 'Cutting'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-extrabold shrink-0">
                    {client.runwayStage || 'Cutting'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in">
              {/* FITTING NOTES SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  FITTING NOTES
                </h3>
                <div className="p-3.5 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {client.notes || notesText || 'Initial fitting scheduled.'}
                </div>
              </div>

              {/* FITTING TIMELINE SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  FITTING TIMELINE
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300/80 dark:before:bg-slate-700">
                  {/* Timeline Entry 1 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-amber-400 ring-4 ring-white dark:ring-[#092825]" />
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                      <span className="text-rose-500 text-xs">📅</span>
                      <span>{client.timestamp || '10/08/2026 08:31'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Hips: {measurements.hips || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Chest: {measurements.bustOrChest || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Waist: {measurements.waist || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Length: {measurements.fullLength || '0.0"'}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Entry 2 */}
                  <div className="relative pt-2">
                    <span className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-amber-400 ring-4 ring-white dark:ring-[#092825]" />
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                      <span className="text-rose-500 text-xs">📅</span>
                      <span>10/08/2026 08:28</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Hips: {measurements.hips || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Chest: {measurements.bustOrChest || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Waist: {measurements.waist || '0.0"'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Length: {measurements.fullLength || '0.0"'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* EDIT CLIENT DETAILS MODAL OVERLAY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-['Outfit']">
          <div className="w-full max-w-sm sm:max-w-md bg-[#EBF5F0] dark:bg-[#061E1B] rounded-[32px] p-6 space-y-4 shadow-2xl border border-white dark:border-white/10">
            <h3 className="font-['Outfit'] font-black text-2xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight">
              Edit Client Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editName || ''}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone || ''}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Garment Type
                </label>
                <input
                  type="text"
                  value={editGarmentTag || ''}
                  onChange={(e) => setEditGarmentTag(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Total Billing (GHS)
                  </label>
                  <input
                    type="number"
                    value={editTotalBilling ?? 0}
                    onChange={(e) => setEditTotalBilling(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Paid Deposit (GHS)
                  </label>
                  <input
                    type="number"
                    value={editPaidDeposit ?? 0}
                    onChange={(e) => setEditPaidDeposit(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 font-black text-sm shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveClientDetails}
                className="py-3 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Measurements Modal Component */}
      <FullMeasurementsModal
        isOpen={isFullMeasurementsOpen}
        onClose={() => setIsFullMeasurementsOpen(false)}
        client={client}
        studioSettings={studioSettings}
        onOpenMeasurements={(c) => {
          setIsFullMeasurementsOpen(false);
          if (onOpenMeasurements) {
            onOpenMeasurements(c);
          }
        }}
      />

    </div>
  );
};
