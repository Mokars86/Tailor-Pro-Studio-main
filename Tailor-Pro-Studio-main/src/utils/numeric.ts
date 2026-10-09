import { Client, LedgerTransaction, UnpaidDeposit } from '../types';

/**
 * Safely extracts a clean numeric value from any number or string (e.g. "150Cash" -> 150, "GH₵ 500" -> 500, 0 -> 0)
 */
export const parseCleanNumber = (val: unknown): number => {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (val === null || val === undefined || val === '') {
    return 0;
  }
  const str = String(val).trim();
  // Match the first valid numeric segment
  const match = str.match(/-?\d+(\.\d+)?/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

/**
 * Sanitizes client record to guarantee totalCost, depositPaid, and balanceDue are pure numbers.
 * Also corrects any legacy corrupted strings in localStorage/database.
 */
export const sanitizeClient = (c: Client): Client => {
  if (!c || typeof c !== 'object') return c;
  const totalCost = parseCleanNumber(c.totalCost);
  let depositPaid = parseCleanNumber(c.depositPaid);
  
  // If balance was marked 0 (paid in full) or totalCost is reached
  if (c.balanceDue === 0 && totalCost > 0 && depositPaid === 0) {
    depositPaid = totalCost;
  } else if (depositPaid > totalCost && totalCost > 0) {
    depositPaid = totalCost;
  }

  const balanceDue = totalCost > 0 ? Math.max(0, totalCost - depositPaid) : parseCleanNumber(c.balanceDue);

  return {
    ...c,
    totalCost,
    depositPaid,
    balanceDue
  };
};

/**
 * Sanitizes ledger transaction record so amount is always a valid number.
 */
export const sanitizeTransaction = (t: LedgerTransaction): LedgerTransaction => {
  if (!t || typeof t !== 'object') return t;
  return {
    ...t,
    amount: parseCleanNumber(t.amount)
  };
};

/**
 * Detects whether an apprentice object or identifier represents mock, dummy, or test data.
 */
export const isMockOrTestApprentice = (app?: any): boolean => {
  if (!app) return true;
  if (typeof app === 'string') {
    const s = app.toLowerCase().trim();
    if (['app-1', 'app-2', 'app-3', 'cli-1', 'cli-2', 'cli-3', 'cli-4'].includes(s)) return true;
    if (s.startsWith('mock') || s.startsWith('test-') || s.includes('_mock') || s.includes('_test')) return true;
    if (['apprentice scholar', 'apprentice trainee', 'test apprentice', 'mock apprentice', 'scholar', 'test user', 'mock user'].includes(s)) return true;
    return false;
  }
  const id = (app.id || '').toLowerCase().trim();
  const name = (app.name || '').toLowerCase().trim();
  const email = (app.email || '').toLowerCase().trim();

  // Mock ID checks
  if (['app-1', 'app-2', 'app-3', 'cli-1', 'cli-2', 'cli-3', 'cli-4'].includes(id)) return true;
  if (id.startsWith('mock') || id.startsWith('test-') || id.includes('_mock') || id.includes('_test')) return true;

  // Mock / generic test names
  const mockNames = [
    'apprentice scholar',
    'apprentice trainee',
    'test apprentice',
    'mock apprentice',
    'sample apprentice',
    'demo apprentice',
    'test trainee',
    'mock trainee',
    'scholar',
    'test user',
    'mock user'
  ];
  if (mockNames.includes(name)) return true;
  if (name.includes('mock apprentice') || name.includes('test apprentice')) return true;

  // Mock / dummy email domains & patterns
  if (
    email.endsWith('@example.com') ||
    email.includes('mock') ||
    email.startsWith('test@') ||
    email.includes('testapprentice') ||
    email.includes('mockapprentice')
  ) {
    return true;
  }

  return false;
};

/**
 * Sanitizes unpaid deposit record so amount is always a valid number.
 */
export const sanitizeDeposit = (d: UnpaidDeposit): UnpaidDeposit => {
  if (!d || typeof d !== 'object') return d;
  return {
    ...d,
    amount: parseCleanNumber(d.amount)
  };
};


