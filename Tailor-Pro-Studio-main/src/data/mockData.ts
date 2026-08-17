import { Client, Apprentice, UnpaidDeposit, LedgerTransaction, InventoryItem, ShopStats, StudioSettings, RunwaySession } from '../types';
import { generateMasterWorkshopCode } from '../utils/workshopCode';

export const initialClients: Client[] = [];

export const initialApprentices: Apprentice[] = [];

export const initialUnpaidDeposits: UnpaidDeposit[] = [];

export const initialLedgerTransactions: LedgerTransaction[] = [];

export const initialInventoryItems: InventoryItem[] = [];

export const initialRunwaySessions: RunwaySession[] = [];

export const initialStats: ShopStats = {
  shopRevenue: 0,
  unpaidDeposits: 0,
  cashReceived: 0,
  jobsCompletedTotal: 0,
  jobsCompletedCount: 0,
  paymentCollectionRate: 0
};

export const defaultStudioSettings: StudioSettings = {
  studioName: 'TAILOR PRO STUDIO',
  ownerName: '',
  email: '',
  logoUrl: '',
  pairCode: 'TP-TPS-8F92-2026',
  momoNumber: '',
  momoHolderName: '',
  safetyPin: '8888',
  theme: 'light'
};
