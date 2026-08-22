export type TabType = 'clients' | 'runway' | 'ledger' | 'inventory';

export type UserRole = 
  | 'Master (Studio Owner & Financial Control)' 
  | 'Head Designer (Lead Pattern Cutter & Stylist)' 
  | 'Apprentice (Trainee & CAD Blueprint View)';

export type ClientStatus = 'VIP' | 'Active' | 'Pending Deposit' | 'Archived';

export type RunwayStage = 'CONSULT' | 'CUTTING' | 'SEWING' | 'FITTING' | 'COMPLETED' | 'DELIVERED';

export interface GarmentMeasurements {
  bustOrChest?: string;
  waist?: string;
  hips?: string;
  shoulderWidth?: string;
  sleeveLength?: string;
  fullLength?: string;
  neckToWaist?: string;
  genderCategory?: 'Male' | 'Female';
  segment?: 'UPPER BODY' | 'LOWER BODY';
  bust?: string;
  shoulder?: string;
  underbust?: string;
  breastLength?: string;
  roundSleeves?: string;
  topLength?: string;
  skirtLength?: string;
  chest?: string;
  neck?: string;
  thigh?: string;
  knee?: string;
  ankle?: string;
  inseam?: string;
  garmentType?: string;
  customMeasurements?: Record<string, string>;
  [key: string]: any;
}

export interface SpecSheetGarment {
  id: string;
  garmentType: string;
  fabricBoltWidth: string;
  fabricPhotos: string[];
  notes: string;
  yardsNeeded?: number;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  garmentTag: string; // e.g. VLISCO, Kente Gown, GTP
  timestamp: string; // e.g. Just now, 2 mins ago
  email: string;
  phone: string;
  avatarUrl?: string;
  status: ClientStatus;
  runwayStage: RunwayStage;
  totalCost: number; // in GHS / GH₵
  depositPaid: number;
  balanceDue: number;
  measurements?: GarmentMeasurements;
  notes?: string;
  assignedDesigner?: string;
  fittingDate?: string;
  tags?: string[];
}

export type ApprenticeTaskStatus = 'in_progress' | 'review_pending' | 'passed';

export interface ApprenticeTask {
  id: string;
  title: string;
  assignedTo: string;
  isCompleted: boolean;
  status?: ApprenticeTaskStatus;
  dueDate?: string;
  category?: string;
  masterNotes?: string;
  completedAt?: string;
  passedAt?: string;
}

export interface Apprentice {
  id: string;
  name: string;
  initials: string;
  role: string;
  mentor: string;
  isLinked: boolean;
  handshakeLocked: boolean;
  hasCert: boolean;
  avatarUrl?: string;
  hoursCompleted: number;
  totalRequiredHours: number;
  certifications: string[];
  tasksCount: number;
  status: 'On Track' | 'Review Due' | 'Graduating';
  specialty: string;
}

export interface UnpaidDeposit {
  id: string;
  clientId: string;
  clientName: string;
  garmentTag: string;
  amount: number;
  dueDate: string;
  phone: string;
}

export interface RunwaySession {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  serviceTitle: string;
  artistName: string;
  timeSlot: string;
  durationHours: number;
  price: number;
  depositPaid: number;
  status: 'Confirmed' | 'Deposit Pending' | 'In Progress' | 'Completed';
}

export interface LedgerTransaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'deposit' | 'payout';
  category: string;
  description: string;
  amount: number;
  clientOrVendor: string;
  status: 'cleared' | 'pending';
  method: 'MoMo' | 'Cash' | 'Card' | 'Bank Transfer';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'FABRIC' | 'NEEDLES' | 'THREAD' | 'TRIMS' | 'ACCESSORIES';
  stockLevel: number;
  minThreshold: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  supplier?: string;
  alertThreshold: number;
}

export interface StudioSettings {
  studioName: string;
  ownerName: string;
  email: string;
  logoUrl: string;
  pairCode: string;
  momoNumber: string;
  momoHolderName: string;
  safetyPin: string;
  theme: 'light' | 'dark';
}

export interface ShopStats {
  shopRevenue: number; // e.g. 1100
  unpaidDeposits: number; // e.g. 600
  cashReceived: number; // e.g. 500
  jobsCompletedTotal: number; // e.g. 3
  jobsCompletedCount: number; // e.g. 0
  paymentCollectionRate: number; // e.g. 45
}

export type LicenseDuration = '1_year' | '6_months' | '1_month' | 'lifetime';

export interface LicenseRecord {
  id: string;
  licenseKey: string; // e.g. TPS-1YR-8A39, TPS-6MO-X72K
  duration: LicenseDuration;
  expiresAt?: string;
  assignedEmail?: string;
  assignedStudioName?: string;
  assignedUserName?: string;
  status: 'active' | 'revoked' | 'unassigned' | 'expired';
  createdAt: string;
}

export interface UserAccountRecord {
  id: string;
  email: string;
  fullName: string;
  studioName: string;
  role: UserRole | string;
  licenseKey?: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
}

export interface FabricSideInspectionResult {
  verdict: 'Side A is Right Side (Face)' | 'Side B is Right Side (Face)' | 'Reversible / Identical Double-Faced Fabric';
  confidence: 'High' | 'Medium' | 'Low';
  faceSide: 'Side A' | 'Side B' | 'Both';
  fabricType: string;
  keyDifferentiators: string[];
  tailoringAdvice: {
    markingGuidance: string;
    cuttingAdvice: string;
    pressingNotes: string;
  };
}

export interface SavedFabricSideInspection {
  id: string;
  title: string;
  date: string;
  sideAImage: string;
  sideBImage: string;
  result: FabricSideInspectionResult;
}

export type SubscriptionTier = 'FREE' | 'MASTER' | 'ENTERPRISE';

export interface StudioSubscription {
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  clientProfileLimit: number; // 10 for Free, 999999 for Master/Enterprise
  expiresAt?: string;
  momoNumber?: string;
  txRef?: string;
  updatedAt: string;
}

export interface GraduationCertificatePayment {
  apprenticeId: string;
  apprenticeName: string;
  masterHandshakeLocked: boolean;
  isPaid: boolean;
  amountGHS: number; // 250
  paidAt?: string;
  txRef?: string;
  paymentMethod?: 'MoMo' | 'Card' | 'License';
}




