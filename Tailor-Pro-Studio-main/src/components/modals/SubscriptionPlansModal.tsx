import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Crown,
  Sparkles,
  Zap,
  Phone,
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  CreditCard,
  RefreshCw,
  Award,
  Coffee,
  Heart,
  Info
} from 'lucide-react';
import { StudioSubscription } from '../../types';
import { getStudioSubscription, upgradeToMasterTier, redeemWorkshopKey } from '../../services/subscriptionService';
import { initializePaystackCheckout } from '../../services/paystackService';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: (newSub: StudioSubscription) => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionUpdated
}) => {
  const [currentSub, setCurrentSub] = useState<StudioSubscription>(getStudioSubscription);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedProvider, setSelectedProvider] = useState<'MTN' | 'TELECEL' | 'AT' | 'CARD'>('MTN');
  const [momoNumber, setMomoNumber] = useState<string>('0240000000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Workshop Key State
  const [workshopKeyCode, setWorkshopKeyCode] = useState<string>('');
  const [isRedeemingKey, setIsRedeemingKey] = useState<boolean>(false);
  const [workshopKeyNotice, setWorkshopKeyNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Donation state
  const [donationAmount, setDonationAmount] = useState<number>(20);
  const [customDonationInput, setCustomDonationInput] = useState<string>('');
  const [isDonating, setIsDonating] = useState<boolean>(false);
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeemWorkshopKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopKeyCode || workshopKeyCode.trim().length < 6) {
      alert('Please enter a valid Workshop Voucher Key.');
      return;
    }

    setIsRedeemingKey(true);
    setWorkshopKeyNotice(null);

    setTimeout(() => {
      const res = redeemWorkshopKey(workshopKeyCode);
      setIsRedeemingKey(false);
      setWorkshopKeyNotice({ success: res.success, message: res.message });

      if (res.success && res.subscription) {
        setCurrentSub(res.subscription);
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(res.subscription);
        }
      }
    }, 1000);
  };

  const handleDonateCoffee = () => {
    const finalAmount = customDonationInput ? parseFloat(customDonationInput) : donationAmount;
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    setIsDonating(true);
    setDonationSuccess(null);

    initializePaystackCheckout({
      email: 'supporter@tailorprostudio.com',
      amountGHS: finalAmount,
      referencePrefix: 'PAYSTACK_DONATION',
      metadata: {
        type: 'BUY_ME_A_COFFEE',
        amount: finalAmount
      },
      onSuccess: (txRef) => {
        setIsDonating(false);
        setDonationSuccess(`Thank you so much! Your coffee donation of GHS ${finalAmount} was verified (${txRef}). We appreciate your support for Tailor Pro! ☕❤️`);
      },
      onCancel: () => {
        setIsDonating(false);
      }
    });
  };

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoNumber || momoNumber.trim().length < 9) {
      alert('Please enter a valid Mobile Money or phone number.');
      return;
    }

    setIsProcessing(true);
    setSuccessNotice(null);

    const priceGHS = billingCycle === 'yearly' ? 200 : 35;

    initializePaystackCheckout({
      email: `${momoNumber.replace(/\D/g, '')}@tailorpro.com`,
      amountGHS: priceGHS,
      referencePrefix: 'PAYSTACK_SUB',
      metadata: {
        plan: `TAILOR_PRO_MASTER_${billingCycle.toUpperCase()}`,
        phone: momoNumber,
        provider: selectedProvider
      },
      onSuccess: (txRef) => {
        const updated = upgradeToMasterTier(momoNumber, billingCycle);
        updated.txRef = txRef;
        setCurrentSub(updated);
        setIsProcessing(false);
        setSuccessNotice(`Paystack Payment Verified (${txRef})! Studio upgraded to TAILOR PRO MASTER (${billingCycle.toUpperCase()}).`);
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(updated);
        }
      },
      onCancel: () => {
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in font-['Outfit'] overflow-y-auto select-none">
      <div className="relative w-full max-w-4xl my-2 sm:my-6 bg-white dark:bg-[#092825] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-5 bg-gradient-to-r from-[#0D3B36] via-[#092D29] to-[#155e56] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#DCA134] shrink-0">
              <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-xs xs:text-sm sm:text-xl tracking-tight uppercase text-amber-300 truncate">
                  Tailor Pro Subscriptions
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] sm:text-[10px] font-black border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" /> Mokars SaaS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                Choose the perfect atelier plan to scale client profiles and finance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-6 flex-1">
          
          {/* Active Plan Alert */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0D3B36] text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                {currentSub.tier === 'MASTER' ? '👑' : '🟢'}
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  Current Active Plan
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  TAILOR PRO {currentSub.tier} {currentSub.tier === 'FREE' ? '(10 Profile Limit)' : '(Unlimited)'}
                </span>
              </div>
            </div>

            {currentSub.expiresAt && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Renews: {new Date(currentSub.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 py-2">
            <span className={`text-xs font-black ${billingCycle === 'monthly' ? 'text-[#0D3B36] dark:text-amber-300' : 'text-slate-500'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))}
              className="w-14 h-8 rounded-full bg-[#0D3B36] p-1 flex items-center transition-colors cursor-pointer relative"
            >
              <div
                className={`w-6 h-6 rounded-full bg-amber-400 shadow-md transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-black flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-[#0D3B36] dark:text-amber-300' : 'text-slate-500'}`}>
              Yearly Billing
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-900 font-black text-[9px] uppercase">
                SAVE GHS 220
              </span>
            </span>
          </div>

          {/* Subscription Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            
            {/* TIER 1: FREE (Apprentice / Basic) */}
            <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex flex-col justify-between space-y-3 sm:space-y-4 transition-all ${
              currentSub.tier === 'FREE'
                ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] sm:text-[10px] font-black uppercase">
                    Apprentice & Starter
                  </span>
                  {currentSub.tier === 'FREE' && (
                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    Tailor Pro Free
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For young tailors & trainees starting out
                  </p>
                </div>

                <div className="pt-1 sm:pt-2">
                  <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100">
                    GHS 0
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 ml-1">/ forever</span>
                </div>

                <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Up to 10 Local Client Profiles</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Offline Garment Measurement Form</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Basic Fabric Scanner</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                    <span>Unlimited Profiles & Ledger</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                    <span>Offline Hotspot Studio Sync</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-xs cursor-default"
                >
                  {currentSub.tier === 'FREE' ? 'Current Active Tier' : 'Basic Tier'}
                </button>
              </div>
            </div>

            {/* TIER 2: MASTER PRO (SaaS Core Tier) */}
            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0D3B36] via-[#092D29] to-[#0A2E2A] border-2 border-amber-400 text-white shadow-xl flex flex-col justify-between space-y-3 sm:space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-[#0D3B36] text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-bl-xl uppercase tracking-widest">
                RECOMMENDED
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase border border-amber-400/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-300" /> Master Studio
                  </span>
                  {currentSub.tier === 'MASTER' && (
                    <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-xl text-amber-300">
                    Tailor Pro Master
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    For independent shop owners & bespoke ateliers
                  </p>
                </div>

                <div className="pt-2">
                  <span className="font-black text-3xl text-white">
                    GHS {billingCycle === 'yearly' ? '200' : '35'}
                  </span>
                  <span className="text-xs font-bold text-amber-200 ml-1">
                    / {billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs pt-2 border-t border-amber-500/20">
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>UNLIMITED</strong> Client Profiles</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Full Ledger & Deposit Tracking</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Fabric Face & Back AI Inspector</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Unlimited Apprentice Links</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Offline Hotspot Studio Sync</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-100 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Priority WhatsApp Invoice Templates</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="#momo-checkout-form"
                  className="w-full py-3 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#0D3B36]" />
                  <span>{currentSub.tier === 'MASTER' ? 'Renew / Extend Master Tier' : 'Upgrade to Master (GHS 35)'}</span>
                </a>
              </div>
            </div>

            {/* TIER 3: ENTERPRISE / ACADEMY */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase">
                    Schools & NGOs
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                    Enterprise / Academy
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For vocational schools & ANF NGO programs
                  </p>
                </div>

                <div className="pt-2">
                  <span className="font-black text-2xl text-slate-900 dark:text-slate-100">
                    Custom
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ annual licensing</span>
                </div>

                <ul className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Bulk Apprentice Management</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Centralized Master Dashboards</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Batch Graduation Processing</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Mokars Co-Branded Portal</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="mailto:licensing@mokarstech.com?subject=Tailor%20Pro%20Enterprise%20Licensing"
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Sales</span>
                </a>
              </div>
            </div>

          </div>

          {/* Success Notice */}
          {successNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. WORKSHOP VOUCHER KEY REDEMPTION CARD */}

          {/* WORKSHOP VOUCHER KEY REDEMPTION CARD */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#061E1B] border-2 border-amber-400/60 text-white space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-base shrink-0 border border-amber-400/30">
                  🔑
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
                    <span>Redeem 1-Year Workshop Voucher Key</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Attended a Tailor Pro training workshop or received a voucher code card? Redeem it here for instant 1-Year Master access!
                  </p>
                </div>
              </div>
            </div>

            {workshopKeyNotice && (
              <div className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2 animate-fade-in ${
                workshopKeyNotice.success
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-400/50 text-rose-300'
              }`}>
                {workshopKeyNotice.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{workshopKeyNotice.message}</span>
              </div>
            )}

            <form onSubmit={handleRedeemWorkshopKey} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                required
                value={workshopKeyCode}
                onChange={(e) => setWorkshopKeyCode(e.target.value.toUpperCase())}
                placeholder="e.g. TPS-WORKSHOP-2026-9812"
                className="w-full font-mono uppercase px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-extrabold focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isRedeemingKey}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                {isRedeemingKey ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#0D3B36] animate-spin" />
                    <span>VERIFYING KEY...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0D3B36]" />
                    <span>REDEEM KEY 🔑</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form Option 2: Paystack Checkout */}
          <form onSubmit={handleUpgrade} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-extrabold text-xs text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#DCA134]" />
                  <span>Direct Paystack Mobile Money & Card Checkout</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant subscription upgrade powered by Paystack
                </p>
              </div>
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
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedProvider === prov.id
                      ? `${prov.color} font-black shadow-md border-amber-400 scale-102`
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{prov.name}</span>
                </button>
              ))}
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Mobile Money Phone Number:
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

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Selected Billing Option:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`TAILOR PRO MASTER (${billingCycle.toUpperCase()} - GHS ${billingCycle === 'yearly' ? '200' : '35'})`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 font-black text-[#0D3B36] dark:text-amber-300 text-xs"
                />
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>PROCESSING MOMO PAYMENT PROMPT...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>PAY GHS {billingCycle === 'yearly' ? '200' : '35'} VIA {selectedProvider} & UPGRADE NOW</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DONATION / BUY ME A COFFEE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-2 border-amber-400/40 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0D3B36] text-amber-300 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                  ☕
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
                    <span>Buy Me a Coffee — Support Tailor Pro</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                    Love using Tailor Pro? Support continuous AI updates and server maintenance via Paystack!
                  </p>
                </div>
              </div>
            </div>

            {donationSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{donationSuccess}</span>
              </div>
            )}

            {/* Donation Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-bold">
              {[
                { amount: 10, label: 'GHS 10 ☕' },
                { amount: 20, label: 'GHS 20 ☕' },
                { amount: 50, label: 'GHS 50 ☕' },
                { amount: 100, label: 'GHS 100 🌟' }
              ].map((preset) => (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => {
                    setDonationAmount(preset.amount);
                    setCustomDonationInput('');
                  }}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    donationAmount === preset.amount && !customDonationInput
                      ? 'bg-[#0D3B36] text-amber-300 font-black border-amber-400 shadow-md scale-102'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              {/* Custom Amount Input */}
              <input
                type="number"
                min="1"
                placeholder="Custom GHS"
                value={customDonationInput}
                onChange={(e) => setCustomDonationInput(e.target.value)}
                className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0D3B36]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleDonateCoffee}
                disabled={isDonating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isDonating ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#0D3B36] animate-spin" />
                    <span>PROCESSING PAYSTACK DONATION...</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4 text-[#0D3B36]" />
                    <span>DONATE GHS {customDonationInput || donationAmount} VIA PAYSTACK ☕</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 inline" /> Secured by Mokars Technology Corporation Mobile Payment Gateway.
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
