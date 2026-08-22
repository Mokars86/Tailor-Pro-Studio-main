import { StudioSubscription, GraduationCertificatePayment, SubscriptionTier } from '../types';

const STORAGE_KEY_SUBSCRIPTION = 'tailor_studio_subscription';
const STORAGE_KEY_GRADUATION_PAYMENTS = 'tailor_graduation_payments';
const STORAGE_KEY_WORKSHOP_KEYS = 'tailor_workshop_keys';

export const DEFAULT_FREE_SUBSCRIPTION: StudioSubscription = {
  tier: 'FREE',
  status: 'ACTIVE',
  clientProfileLimit: 10,
  updatedAt: new Date().toISOString()
};

export function getStudioSubscription(): StudioSubscription {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    if (saved) {
      const parsed: StudioSubscription = JSON.parse(saved);
      // Check expiration if expiresAt is set
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        return {
          ...parsed,
          status: 'EXPIRED',
          tier: 'FREE',
          clientProfileLimit: 10
        };
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse subscription from storage:', err);
  }
  return DEFAULT_FREE_SUBSCRIPTION;
}

export function saveStudioSubscription(subscription: StudioSubscription): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(subscription));
  } catch (err) {
    console.error('Failed to save studio subscription:', err);
  }
}

export function canAddClientProfile(currentClientCount: number): { allowed: boolean; limit: number; tier: SubscriptionTier } {
  const sub = getStudioSubscription();
  if (sub.tier === 'MASTER' || sub.tier === 'ENTERPRISE') {
    return { allowed: true, limit: 999999, tier: sub.tier };
  }
  const allowed = currentClientCount < sub.clientProfileLimit;
  return { allowed, limit: sub.clientProfileLimit, tier: sub.tier };
}

export function canLinkApprentice(currentApprenticeCount: number): { allowed: boolean; limit: number; tier: SubscriptionTier } {
  const sub = getStudioSubscription();
  if (sub.tier === 'MASTER' || sub.tier === 'ENTERPRISE') {
    return { allowed: true, limit: 999999, tier: sub.tier };
  }
  // Free tier allows max 1 linked apprentice
  const limit = 1;
  const allowed = currentApprenticeCount < limit;
  return { allowed, limit, tier: sub.tier };
}

export function upgradeToMasterTier(
  momoNumber: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): StudioSubscription {
  const expires = new Date();
  if (billingCycle === 'yearly') {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }

  const txRef = `MOMO_SUB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const updatedSub: StudioSubscription = {
    tier: 'MASTER',
    status: 'ACTIVE',
    clientProfileLimit: 999999,
    expiresAt: expires.toISOString(),
    momoNumber,
    txRef,
    updatedAt: new Date().toISOString()
  };

  saveStudioSubscription(updatedSub);
  return updatedSub;
}

export function redeemWorkshopKey(key: string): { success: boolean; subscription?: StudioSubscription; message: string } {
  const cleanKey = key.trim().toUpperCase();
  if (!cleanKey || cleanKey.length < 6) {
    return { success: false, message: 'Invalid key format. Please enter a valid workshop voucher key.' };
  }

  const savedKeysRaw = localStorage.getItem(STORAGE_KEY_WORKSHOP_KEYS);
  let savedKeys: Array<{ code: string; status: string; usedAt?: string }> = savedKeysRaw ? JSON.parse(savedKeysRaw) : [];

  const isPreApproved = cleanKey.startsWith('TPS-') || cleanKey.startsWith('MOKARS-') || cleanKey.includes('WORKSHOP');
  const foundKey = savedKeys.find((k) => k.code.toUpperCase() === cleanKey);

  if (foundKey && foundKey.status === 'used') {
    return { success: false, message: 'This workshop key voucher has already been redeemed.' };
  }

  if (!isPreApproved && !foundKey) {
    return { success: false, message: 'Unrecognized workshop key code. Please check your voucher or card.' };
  }

  if (foundKey) {
    foundKey.status = 'used';
    foundKey.usedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_WORKSHOP_KEYS, JSON.stringify(savedKeys));
  }

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const updatedSub: StudioSubscription = {
    tier: 'MASTER',
    status: 'ACTIVE',
    clientProfileLimit: 999999,
    expiresAt: expires.toISOString(),
    txRef: cleanKey,
    updatedAt: new Date().toISOString()
  };

  saveStudioSubscription(updatedSub);
  return {
    success: true,
    subscription: updatedSub,
    message: `Workshop Voucher (${cleanKey}) verified! 1-Year Tailor Pro Master Activated.`
  };
}

export function getGraduationPayments(): Record<string, GraduationCertificatePayment> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GRADUATION_PAYMENTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to read graduation payments:', err);
  }
  return {};
}

export function getGraduationPayment(apprenticeId: string): GraduationCertificatePayment | null {
  const payments = getGraduationPayments();
  return payments[apprenticeId] || null;
}

export function recordGraduationPayment(
  apprenticeId: string,
  apprenticeName: string,
  paymentMethod: 'MoMo' | 'Card' | 'License' = 'MoMo',
  txRef?: string
): GraduationCertificatePayment {
  const payments = getGraduationPayments();
  const generatedTxRef = txRef || `CERT_GHS250_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const record: GraduationCertificatePayment = {
    apprenticeId,
    apprenticeName,
    masterHandshakeLocked: true,
    isPaid: true,
    amountGHS: 250,
    paidAt: new Date().toISOString(),
    txRef: generatedTxRef,
    paymentMethod
  };

  payments[apprenticeId] = record;
  localStorage.setItem(STORAGE_KEY_GRADUATION_PAYMENTS, JSON.stringify(payments));
  return record;
}
