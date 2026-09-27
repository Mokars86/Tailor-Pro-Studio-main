import React, { useState } from 'react';
import { X, Phone, MessageSquare, Download, Check, Copy, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { Client, StudioSettings } from '../../types';
import { downloadOrShareDocument, generateInvoiceHtml } from '../../utils/mobileDocumentDownloader';

interface InvoiceModalProps {
  isOpen?: boolean;
  onClose: () => void;
  client: Client | null;
  studioSettings?: StudioSettings;
  studioName?: string;
  momoNumber?: string;
  momoHolderName?: string;
  studioLogoUrl?: string;
  currency?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen = true,
  onClose,
  client,
  studioSettings,
  studioName: studioNameProp,
  momoNumber: momoNumberProp,
  momoHolderName: momoHolderNameProp,
  studioLogoUrl: studioLogoUrlProp,
  currency: currencyProp
}) => {
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen || !client) return null;

  const totalCost = Number(client.totalCost) || 0;
  const depositPaid = Number(client.depositPaid) || 0;
  const balanceDue = client.balanceDue !== undefined ? Number(client.balanceDue) : Math.max(0, totalCost - depositPaid);
  const isPaid = balanceDue <= 0;

  const invoiceNumber = `INV-${client.id ? client.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() : '1001'}`;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const displayStudioName = studioSettings?.studioName || studioNameProp || 'MOKARS STITCHES STUDIO';
  const currency = studioSettings?.currency || currencyProp || 'GHS';
  const momoNumber = studioSettings?.momoNumber || momoNumberProp || '0546920418';
  const momoHolderName = studioSettings?.momoName || studioSettings?.momoHolderName || momoHolderNameProp || 'Mubarik Tuahir Ali';
  const studioLogoUrl = studioSettings?.studioLogoUrl || studioSettings?.logoUrl || studioLogoUrlProp || '';

  const formatStage = (stage?: string) => {
    if (!stage) return 'Consultation';
    return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
  };

  const getWhatsAppMessageText = () => {
    return (
      `*${displayStudioName.toUpperCase()} - OFFICIAL INVOICE #${invoiceNumber}*\n` +
      `------------------------------------------\n` +
      `👤 *Billed To:* ${client.name}\n` +
      `📞 *Phone:* ${client.phone || 'N/A'}\n` +
      `👗 *Garment Order:* ${client.garmentTag || 'Custom Order'}\n` +
      `✂️ *Runway Stage:* ${formatStage(client.runwayStage)}\n` +
      `📅 *Date:* ${currentDate}\n` +
      `------------------------------------------\n` +
      `💵 *Total Cost:* ${currency} ${totalCost.toLocaleString()}\n` +
      `✅ *Deposit Paid:* ${currency} ${depositPaid.toLocaleString()}\n` +
      `💰 *Balance Due:* ${currency} ${balanceDue.toLocaleString()}\n` +
      `------------------------------------------\n` +
      `📌 *Status:* ${isPaid ? 'PAID IN FULL ✓' : 'BALANCE OUTSTANDING ⏳'}\n\n` +
      `💳 *Mobile Money (MoMo) Payment Details:*\n` +
      `Number: ${momoNumber} (${momoHolderName})\n` +
      `Reference: #${invoiceNumber}\n\n` +
      `Thank you for choosing ${displayStudioName}! ✂️✨`
    );
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppMessageText());
    const phoneNum = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
    const url = phoneNum ? `https://wa.me/${phoneNum}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyInvoiceStatement = () => {
    navigator.clipboard.writeText(getWhatsAppMessageText());
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsExporting(true);
      setDownloadNotice('Preparing invoice for download / sharing...');

      const html = generateInvoiceHtml({
        invoiceNumber,
        date: currentDate,
        client: {
          name: client.name || 'Client',
          email: client.email,
          phone: client.phone,
          garmentTag: client.garmentTag,
          totalCost,
          depositPaid,
          balanceDue,
          notes: client.notes
        },
        studioSettings: {
          studioName: displayStudioName,
          ownerName: studioSettings?.ownerName,
          phone: studioSettings?.phone,
          email: studioSettings?.email,
          currency,
          momoNumber,
          momoName: momoHolderName,
          studioLogoUrl
        }
      });

      const res = await downloadOrShareDocument({
        filename: `Invoice_${invoiceNumber}_${(client.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`,
        title: `Invoice #${invoiceNumber} — ${client.name || 'Client'}`,
        htmlContent: html,
        text: `Official Invoice #${invoiceNumber} for ${client.name} (${currency} ${totalCost})`
      });

      setDownloadNotice(res.message || 'Invoice ready!');
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err: any) {
      console.error('Invoice download failed:', err);
      setDownloadNotice('Unable to export invoice. Please try again.');
      setTimeout(() => setDownloadNotice(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none"
    >
      {/* Invoice Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg my-auto bg-white dark:bg-[#061E1B] rounded-[32px] p-4 xs:p-6 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl border-2 border-[#DCA134] relative overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white text-slate-900 dark:text-slate-100"
      >
        {/* Soft Ambient Glow Orbs (Hidden in Print) */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#DCA134]/15 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Top Close Button (Hidden in Print) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 xs:top-4 xs:right-4 z-50 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 shadow-md transition-all cursor-pointer print:hidden active:scale-95 flex items-center justify-center"
          title="Close Invoice"
        >
          <X className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]" />
        </button>

        {/* 1. Header Banner: Studio Branding & Invoice Specs */}
        <div className="flex flex-col xs:flex-row items-start justify-between border-b-2 border-[#DCA134]/30 pb-3.5 pr-10 xs:pr-12 relative z-10 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {studioLogoUrl ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md shrink-0">
                <img src={studioLogoUrl} alt="Studio Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] text-[#DCA134] font-['Cinzel',serif] font-black text-lg sm:text-xl flex items-center justify-center shadow-md shrink-0">
                {displayStudioName.charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="font-['Outfit'] font-black text-sm sm:text-lg text-[#0D3B36] dark:text-amber-300 tracking-tight uppercase leading-tight truncate">
                {displayStudioName}
              </h2>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Bespoke Couture & Fashion Studio
              </p>
            </div>
          </div>

          <div className="text-left xs:text-right shrink-0 flex xs:flex-col items-center xs:items-end justify-between xs:justify-start w-full xs:w-auto pt-1 xs:pt-0 border-t xs:border-t-0 border-slate-200/50 dark:border-slate-800">
            <span className="px-2.5 py-0.5 rounded-full bg-[#061E1B] text-[#DCA134] text-[9px] sm:text-[9.5px] font-black uppercase tracking-widest border border-[#DCA134]">
              OFFICIAL INVOICE
            </span>
            <div className="text-right xs:mt-1">
              <p className="text-xs font-mono font-black text-slate-900 dark:text-amber-200">
                #{invoiceNumber}
              </p>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                Date: <span className="font-black text-slate-800 dark:text-slate-200">{currentDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Client Billed To & Order Specs */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-3 relative z-10 shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-[#DCA134] uppercase tracking-wider block">
              BILLED TO CLIENT
            </span>
            <h4 className="font-black text-sm text-[#0D3B36] dark:text-amber-300 mt-0.5">
              {client.name}
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3 text-[#DCA134] shrink-0" />
              <span>{client.phone || 'Contact Info Recorded'}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-[#DCA134] uppercase tracking-wider block">
              ORDER SPECIFICATIONS
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-0.5">
              {client.garmentTag || 'Custom Order'}
            </h4>
            <span className="inline-block text-[10.5px] font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase">
              Stage: {formatStage(client.runwayStage)}
            </span>
          </div>
        </div>

        {/* 3. Itemized Financial Breakdown Table */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between text-[10.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>DESCRIPTION & BESPOKE SERVICES</span>
            <span>AMOUNT</span>
          </div>

          <div className="flex items-start justify-between text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
            <span className="max-w-[70%]">
              {client.garmentTag || 'Custom Order'} (Tailoring, Materials & Fitting Assembly)
            </span>
            <span className="font-mono font-black text-[#0D3B36] dark:text-amber-300">
              {currency} {totalCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            <span>Less Deposit / Advance Paid</span>
            <span className="font-mono font-black">- {currency} {depositPaid.toLocaleString()}</span>
          </div>
        </div>

        {/* 4. Payment Status Card */}
        <div className={`rounded-2xl p-4 border-2 flex items-center justify-between relative z-10 shadow-xs ${
          isPaid
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
            : 'bg-amber-500/10 border-[#DCA134]/60 text-amber-900 dark:text-amber-300'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
              PAYMENT STATUS
            </span>
            <div className="font-black text-xs sm:text-sm flex items-center gap-1.5 mt-1 uppercase tracking-tight">
              {isPaid ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>PAID IN FULL ✓</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#DCA134] animate-pulse" />
                  <span>BALANCE OUTSTANDING ⏳</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
              {isPaid ? 'TOTAL PAID' : 'BALANCE DUE'}
            </span>
            <div className="font-mono font-black text-xl sm:text-2xl mt-0.5 text-[#0D3B36] dark:text-amber-300">
              {currency} {(isPaid ? totalCost : balanceDue).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 5. MoMo Payment Instructions Box */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800 text-center space-y-1 relative z-10">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#0D3B36] dark:text-amber-300 uppercase">
            <span>💳</span>
            <span>Mobile Money (MoMo) Payment Details</span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Number: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{momoNumber}</strong> <span className="text-slate-500 font-medium">({momoHolderName})</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Please quote invoice <strong className="font-mono text-slate-700 dark:text-slate-300">#{invoiceNumber}</strong> as reference when making payment.
          </p>
        </div>

        {/* Copy Notice Banner */}
        {copiedNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center justify-center gap-2 animate-fade-in relative z-10">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Invoice statement text copied to clipboard!</span>
          </div>
        )}

        {/* Download Notice Banner */}
        {downloadNotice && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in relative z-10">
            <Sparkles className="w-4 h-4 text-[#DCA134]" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* 6. Action Buttons Grid (Hidden in Print) */}
        <div className="space-y-2 relative z-10 pt-1 print:hidden">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Download / Print Invoice Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadInvoice}
              className="py-3 px-4 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-[#DCA134] font-black text-xs flex items-center justify-center gap-2 border border-[#DCA134]/50 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-[#DCA134]" /> : <Download className="w-4 h-4 text-[#DCA134]" />}
              <span>{isExporting ? 'Exporting...' : 'Download Invoice (PDF)'}</span>
            </button>

            {/* Share to WhatsApp Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Share to WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyInvoiceStatement}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text Statement</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
