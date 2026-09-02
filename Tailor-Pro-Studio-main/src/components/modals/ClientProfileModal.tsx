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
  Ruler,
  X,
  Sparkles,
  DollarSign,
  User
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#F3F9F6] via-[#EBF5F0] to-[#E2F0EA] dark:from-[#061E1B] dark:via-[#092825] dark:to-[#051816] rounded-[36px] p-4 sm:p-6 space-y-4 shadow-2xl border border-white/90 dark:border-white/10 max-h-[90vh] flex flex-col my-0 sm:my-auto relative overflow-hidden">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/40 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header / Navigation Bar */}
        <div className="flex items-center justify-between shrink-0 pt-1 border-b border-emerald-900/10 dark:border-white/10 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-[#0D3B36] dark:text-[#DCA134] font-['Outfit'] font-extrabold text-xs tracking-wider uppercase hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs border border-white dark:border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>Close Profile</span>
          </button>

          {/* Top Right Action Buttons (Edit & Delete & Close X) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Edit Client Profile"
            >
              <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onDeleteClient && window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                  onDeleteClient(client.id);
                  onClose();
                }
              }}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-600" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#0D3B36] text-white hover:bg-[#082824] shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ml-1"
              title="Close Modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Client Hero Header Card */}
        <div className="relative rounded-[28px] p-4 sm:p-5 bg-gradient-to-r from-[#0D3B36] via-[#092825] to-[#061E1B] text-white shadow-lg border border-emerald-500/20 overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{client.status || 'Active Client'}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold uppercase tracking-wider truncate">
                  ✂️ {client.garmentTag || 'Garment'}
                </span>
              </div>

              <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-white tracking-tight uppercase truncate drop-shadow-sm">
                {client.name}
              </h2>

              <p className="text-xs font-bold text-emerald-200/80 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{client.phone || 'No phone recorded'}</span>
              </p>
            </div>

            {/* Avatar Pill */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-br from-[#12423D] to-[#061E1B] text-amber-300 font-['Outfit'] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shrink-0 border-2 border-amber-400/40 relative group">
              <span>{client.initials || client.name.substring(0, 2).toUpperCase()}</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0D3B36] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="grid grid-cols-3 gap-2 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] shadow-md border border-amber-400/30'
                : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] shadow-md border border-amber-400/30'
                : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#0D3B36] shadow-md border border-amber-400/30'
                : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes</span>
          </button>
        </div>

        {/* Scrollable Main Content Area */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 custom-scrollbar">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* 1. CONTACT INFO & QUICK CONNECT */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                    <span>CLIENT CONTACT INFORMATION</span>
                  </h3>
                </div>

                <div className="p-3 bg-[#EBF5F0]/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between border border-emerald-900/10 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="w-9 h-9 rounded-xl bg-[#0D3B36] text-amber-300 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Phone Number</p>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{client.phone || '0233612233'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppClick}
                    className="py-2 px-3.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title="Message Client on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 fill-white text-white" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* 2. BODY MEASUREMENTS */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                    <span>KEY BODY MEASUREMENTS</span>
                  </h3>
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Recorded: {client.timestamp || 'JUST NOW'}
                  </span>
                </div>

                {/* 2-Column Measurements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Bust / Chest</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.bustOrChest || '0.0"'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Waist</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.waist || '0.0"'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Hips</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.hips || '0.0"'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Shld-to-Waist</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.neckToWaist || '0.0"'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Sleeve</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.sleeveLength || '0.0"'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#EBF5F0]/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Full Length</span>
                    <span className="font-['Outfit'] font-black text-lg text-[#0D3B36] dark:text-amber-300">{measurements.fullLength || '0.0"'}</span>
                  </div>
                </div>

                {/* Measurement Action Buttons */}
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
                      <Paperclip className="w-4 h-4 text-white dark:text-[#0D3B36]" />
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
                      <FileText className="w-4 h-4 text-slate-700 dark:text-amber-300" />
                      <span>View Spec Sheet</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullMeasurementsOpen(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-[#0D3B36] to-emerald-800 hover:from-emerald-800 hover:to-[#082824] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-500/30 cursor-pointer uppercase tracking-wider"
                  >
                    <Ruler className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>View All Detailed Measurements Blueprint</span>
                  </button>
                </div>
              </div>

              {/* 3. FINANCIAL & PAYMENT SUMMARY */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                    <span>PAYMENT & FINANCIAL SUMMARY</span>
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

                {/* Invoice Generation Action */}
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
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <FileText className="w-4 h-4 text-[#DCA134] dark:text-[#0D3B36]" />
                    <span>Generate Official Atelier Invoice</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              {/* CURRENT ORDER SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                  <span>CURRENT ACTIVE ORDER</span>
                </h3>

                <div className="p-4 bg-gradient-to-r from-[#EBF5F0] to-[#E2F0EA] dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-emerald-900/10 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] flex items-center justify-center shrink-0 shadow-md">
                      <Scissors className="w-6 h-6 text-white dark:text-[#0D3B36]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 uppercase">
                        {client.garmentTag || 'VLISCO ATELIER'}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Production Stage: <span className="font-bold text-[#0D3B36] dark:text-amber-300">{client.runwayStage || 'Cutting Phase'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-4 py-2 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider shrink-0">
                    {client.runwayStage || 'Cutting'}
                  </span>
                </div>
              </div>

              {/* ORDER HISTORY SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                  <span>PREVIOUS ORDER LOGS</span>
                </h3>

                <div className="space-y-2.5">
                  {/* History Item 2 */}
                  <div className="p-3.5 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-300 shrink-0 shadow-2xs">
                        <Scissors className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
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

                    <span className="px-3 py-1 rounded-full bg-[#D1F4E2] dark:bg-emerald-950/80 text-[#0D6348] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-black shrink-0">
                      Completed
                    </span>
                  </div>

                  {/* History Item 1 */}
                  <div className="p-3.5 bg-[#EBF5F0]/60 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-300 shrink-0 shadow-2xs">
                        <Scissors className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
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

                    <span className="px-3 py-1 rounded-full bg-[#D1F4E2] dark:bg-emerald-950/80 text-[#0D6348] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-black shrink-0">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in">
              {/* FITTING NOTES SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                    <span>TAILOR & FITTING NOTES</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 rounded-xl bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>

                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Enter bespoke fitting notes, style preferences, posture observations..."
                  rows={4}
                  className="w-full p-3.5 bg-[#EBF5F0]/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 transition-all"
                />
              </div>

              {/* FITTING TIMELINE SECTION */}
              <div className="bg-white/90 dark:bg-[#092825]/90 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white dark:border-white/10 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                  <span>FITTING SESSION TIMELINE</span>
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-600/30 dark:before:bg-slate-700">
                  {/* Timeline Entry 1 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0D3B36] dark:bg-amber-400 ring-4 ring-white dark:ring-[#092825]" />
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                      <span className="text-emerald-600 text-xs">📅</span>
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
                    <span className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-[#0D3B36] dark:bg-amber-400 ring-4 ring-white dark:ring-[#092825]" />
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                      <span className="text-emerald-600 text-xs">📅</span>
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
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="w-full max-w-sm sm:max-w-md bg-[#EBF5F0] dark:bg-[#061E1B] rounded-[32px] p-6 space-y-4 shadow-2xl border border-white dark:border-white/10">
            <h3 className="font-['Outfit'] font-black text-2xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase">
              Edit Client Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Client Full Name
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
                  Garment Type / Fabric Tag
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
