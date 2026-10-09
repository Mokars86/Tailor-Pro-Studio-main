import React, { useState, useRef, useCallback } from 'react';
import { Phone, MessageSquare, DollarSign, ChevronRight, Ruler, FileText, Trash2, Pencil, Sparkles, Scissors } from 'lucide-react';
import { Client } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

interface SwipeableClientCardProps {
  client: Client;
  studioName?: string;
  onSelectClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onOpenMeasurements: (client: Client) => void;
  onOpenFullMeasurements?: (client: Client) => void;
  onOpenSpecSheet?: (client: Client) => void;
  onOpenInvoice: (client: Client) => void;
  onOpenCollectDeposit?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const SwipeableClientCard: React.FC<SwipeableClientCardProps> = ({
  client,
  studioName = 'MOKARS STITCHES STUDIO',
  onSelectClient,
  onEditClient,
  onOpenMeasurements,
  onOpenFullMeasurements,
  onOpenSpecSheet,
  onOpenInvoice,
  onOpenCollectDeposit,
  onDeleteClient
}) => {
  const { t } = useTranslation();
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatPhoneNumberForWhatsApp = (rawPhone: string): string => {
    const cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '233' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.phone) {
      alert('No phone number recorded for this client.');
      return;
    }
    window.open(`tel:${client.phone}`, '_self');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.phone) {
      alert('No phone number recorded for this client.');
      return;
    }
    const cleanPhone = formatPhoneNumberForWhatsApp(client.phone);
    const text = encodeURIComponent(
      `Hello ${client.name}! ✨ Greetings from ${studioName}. We are reaching out regarding your bespoke ${client.garmentTag || 'garment'} order.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    // Swipe left reveals Call + WhatsApp + Deposit (up to -210px)
    // Swipe right reveals Edit + Measurements (up to +140px)
    if (diff < 0) {
      setTranslateX(Math.max(-210, diff));
    } else {
      setTranslateX(Math.min(140, diff));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    const diff = currentXRef.current - startXRef.current;

    if (diff < -60) {
      setTranslateX(-200); // Snap open right action drawer
    } else if (diff > 60) {
      setTranslateX(130); // Snap open left action drawer
    } else {
      setTranslateX(0); // Snap back to center
    }
  };

  const handleResetSwipe = (e: React.MouseEvent) => {
    if (translateX !== 0) {
      e.stopPropagation();
      setTranslateX(0);
    }
  };

  const hasBalance = (client.balanceDue || 0) > 0 || (client.totalCost - (client.depositPaid || 0)) > 0 || client.status === 'Pending Deposit';

  const handleAction = (e: React.SyntheticEvent, callback?: (c: Client) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setTranslateX(0);
    if (callback) {
      callback(client);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xs transition-all select-none">
      {/* BACKGROUND SWIPE ACTION BUTTONS (Left Actions: Edit & Measurements) */}
      <div className="absolute inset-y-0 left-0 flex items-center bg-gradient-to-r from-teal-600 to-emerald-600 px-3 gap-2 rounded-l-2xl sm:rounded-l-3xl z-0">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => handleAction(e, onOpenMeasurements || onOpenFullMeasurements)}
          className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/25 hover:bg-white/35 active:bg-white/40 text-white active:scale-95 transition-all text-[10px] font-black cursor-pointer shadow-xs"
          title="Record or View Garment Measurements"
        >
          <Ruler className="w-4 h-4 mb-0.5" />
          <span>{t('measure')}</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => handleAction(e, onEditClient)}
          className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/25 hover:bg-white/35 active:bg-white/40 text-white active:scale-95 transition-all text-[10px] font-black cursor-pointer shadow-xs"
          title="Edit Client Dossier"
        >
          <Pencil className="w-4 h-4 mb-0.5" />
          <span>{t('edit')}</span>
        </button>
      </div>

      {/* BACKGROUND SWIPE ACTION BUTTONS (Right Actions: Call, WhatsApp, Deposit) */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-emerald-600 via-teal-700 to-[#0D3B36] px-3 gap-2 rounded-r-2xl sm:rounded-r-3xl justify-end z-0">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleCall}
          className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md active:scale-95 transition-all text-[10px] font-black cursor-pointer"
          title="Call Client"
        >
          <Phone className="w-4 h-4 mb-0.5" />
          <span>{t('call')}</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleWhatsApp}
          className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95 transition-all text-[10px] font-black cursor-pointer"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>{t('chat')}</span>
        </button>
        {hasBalance && onOpenCollectDeposit && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => handleAction(e, onOpenCollectDeposit)}
            className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#DCA134] hover:bg-amber-500 text-[#0D3B36] shadow-md active:scale-95 transition-all text-[10px] font-black cursor-pointer"
            title="Collect Client Deposit or Settlement"
          >
            <DollarSign className="w-4 h-4 mb-0.5" />
            <span>{t('deposit')}</span>
          </button>
        )}
      </div>

      {/* FOREGROUND CLIENT CARD */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (translateX !== 0) {
            handleResetSwipe(e);
          } else {
            onSelectClient(client);
          }
        }}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)'
        }}
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer relative z-10 bg-white dark:bg-[#082824] backdrop-blur-md"
      >
        {/* Left Avatar & Client Details */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Initial / Photo Badge */}
          <div className="relative shrink-0">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={client.name}
                className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-white/40 dark:border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#0D3B36] dark:bg-[#12423D] text-white font-black text-sm flex items-center justify-center shadow-xs border border-white/40 dark:border-white/20">
                {client.initials || client.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                client.status === 'VIP'
                  ? 'bg-amber-400'
                  : hasBalance
                  ? 'bg-orange-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>

          {/* Name & Subtext */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                {client.name}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0D3B36] dark:text-amber-300 border border-slate-200 dark:border-slate-700 shrink-0">
                {client.garmentTag || 'Bespoke Order'}
              </span>
              {client.status === 'VIP' && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600 flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 fill-current" /> VIP
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
              {client.phone && <span>📞 {client.phone}</span>}
              {client.runwayStage && (
                <span className="font-bold text-[#0D3B36] dark:text-amber-300/80">
                  {t('stageLabel')}: {client.runwayStage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Financial & Quick Desktop Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
          {/* Cost & Balance Due */}
          <div className="text-left sm:text-right">
            <div className="text-sm font-black text-[#0D3B36] dark:text-white">
              GH₵{client.totalCost || 0}
            </div>
            {hasBalance ? (
              <div className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
                {t('due')}: GH₵{client.balanceDue}
              </div>
            ) : (
              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {t('paidInFull')}
              </div>
            )}
          </div>

          {/* Quick Action Buttons (Desktop & Hover) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shrink-0"
              title="WhatsApp Direct Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCall}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shrink-0"
              title="Call Client"
            >
              <Phone className="w-4 h-4" />
            </button>
            {onOpenSpecSheet && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSpecSheet(client);
                }}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shrink-0"
                title="Atelier Spec Sheet"
              >
                <Scissors className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenInvoice(client);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
              title="View Invoice"
            >
              <FileText className="w-4 h-4" />
            </button>
            {onDeleteClient && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClient(client.id);
                }}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shrink-0"
                title="Delete Dossier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
