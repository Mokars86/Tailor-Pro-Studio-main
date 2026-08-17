import { LicenseRecord, UserAccountRecord, LicenseDuration } from '../types';
import { fetchUserAccountsFromSupabase, upsertUserAccountToSupabase } from './supabaseService';

const STORAGE_KEY_LICENSES = 'tailor_license_keys';
const STORAGE_KEY_USERS = 'tailor_user_accounts';

// Initial pre-approved license keys for instant activation (Start clean with 0 generated keys)
const INITIAL_LICENSE_KEYS: LicenseRecord[] = [];

// Initial registered user accounts (Super Admin)
const INITIAL_USER_ACCOUNTS: UserAccountRecord[] = [
  {
    id: 'user-admin',
    email: 'admin@tailorpro.com',
    fullName: 'Mubarik Tuahir Ali',
    studioName: 'Mokars Tech Central Admin',
    role: 'Master (Studio Owner & Financial Control)',
    status: 'approved',
    registeredAt: new Date().toISOString()
  }
];

export function getLicenseKeys(): LicenseRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LICENSES);
    if (saved) {
      const parsed: LicenseRecord[] = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        duration: item.duration || '1_year'
      }));
    }
  } catch (err) {
    console.error('Failed to parse license keys from storage:', err);
  }
  localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify([]));
  return [];
}

export function saveLicenseKeys(keys: LicenseRecord[]) {
  localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(keys));
}

export function getUserAccountRecords(): UserAccountRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to parse user accounts from storage:', err);
  }
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USER_ACCOUNTS));
  return INITIAL_USER_ACCOUNTS;
}

const STORAGE_KEY_WORKSPACE_ACTIVATED = 'tailor_workspace_activated';
const STORAGE_KEY_ACTIVATED_LICENSE = 'tailor_activated_license_key';

export function isWorkspaceActivated(): boolean {
  try {
    const isActivated = localStorage.getItem(STORAGE_KEY_WORKSPACE_ACTIVATED);
    if (isActivated === 'true') return true;

    // Check if any user in user accounts is approved with a valid license key
    const users = getUserAccountRecords();
    const approvedUser = users.find((u) => u.status === 'approved' && u.licenseKey);
    if (approvedUser) {
      localStorage.setItem(STORAGE_KEY_WORKSPACE_ACTIVATED, 'true');
      if (approvedUser.licenseKey) {
        localStorage.setItem(STORAGE_KEY_ACTIVATED_LICENSE, approvedUser.licenseKey);
      }
      return true;
    }
  } catch (err) {
    console.error('Failed to check workspace activation status:', err);
  }
  return false;
}

export function setWorkspaceActivated(activated: boolean, licenseKey?: string): void {
  if (activated) {
    localStorage.setItem(STORAGE_KEY_WORKSPACE_ACTIVATED, 'true');
    if (licenseKey) {
      localStorage.setItem(STORAGE_KEY_ACTIVATED_LICENSE, licenseKey.trim().toUpperCase());
    }
  } else {
    localStorage.removeItem(STORAGE_KEY_WORKSPACE_ACTIVATED);
    localStorage.removeItem(STORAGE_KEY_ACTIVATED_LICENSE);
  }
}

export function saveUserAccountRecords(users: UserAccountRecord[]) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

export function registerUserAccount(data: {
  email: string;
  fullName: string;
  studioName: string;
  role: string;
  licenseKey?: string;
}): UserAccountRecord {
  const users = getUserAccountRecords();
  const licenses = getLicenseKeys();

  // Check if user already exists
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  
  // Verify license key if provided at signup
  let isKeyValid = false;
  const providedKey = data.licenseKey?.trim().toUpperCase();

  if (providedKey) {
    const foundKey = licenses.find((l) => l.licenseKey.toUpperCase() === providedKey && l.status === 'active');
    if (foundKey) {
      isKeyValid = true;
      setWorkspaceActivated(true, providedKey);
    }
  }

  // If workspace is already activated on this device/admin, auto-approve
  if (isWorkspaceActivated()) {
    isKeyValid = true;
  }

  const initialStatus: 'pending' | 'approved' = isKeyValid ? 'approved' : 'pending';

  if (existing) {
    // Update existing user registration
    existing.fullName = data.fullName || existing.fullName;
    existing.studioName = data.studioName || existing.studioName;
    existing.role = data.role || existing.role;
    if (providedKey) existing.licenseKey = providedKey;
    if (isKeyValid) existing.status = 'approved';
    saveUserAccountRecords(users);
    upsertUserAccountToSupabase(existing);
    return existing;
  }

  const newUser: UserAccountRecord = {
    id: `user-${Date.now()}`,
    email: data.email.toLowerCase(),
    fullName: data.fullName,
    studioName: data.studioName,
    role: data.role,
    licenseKey: providedKey || localStorage.getItem(STORAGE_KEY_ACTIVATED_LICENSE) || undefined,
    status: initialStatus,
    registeredAt: new Date().toISOString()
  };

  users.unshift(newUser);
  saveUserAccountRecords(users);
  upsertUserAccountToSupabase(newUser);
  return newUser;
}

export async function syncUserAccountsFromSupabase(): Promise<UserAccountRecord[]> {
  try {
    const dbUsers = await fetchUserAccountsFromSupabase();
    if (dbUsers && dbUsers.length > 0) {
      const localUsers = getUserAccountRecords();
      const mergedMap = new Map<string, UserAccountRecord>();

      localUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));

      dbUsers.forEach((dbU) => {
        const key = dbU.email.toLowerCase();
        const existing = mergedMap.get(key);
        if (!existing) {
          mergedMap.set(key, dbU);
        } else {
          if (dbU.status === 'approved') {
            existing.status = 'approved';
            if (dbU.licenseKey) existing.licenseKey = dbU.licenseKey;
          }
        }
      });

      const updated = Array.from(mergedMap.values());
      saveUserAccountRecords(updated);

      const approvedUser = updated.find((u) => u.status === 'approved');
      if (approvedUser) {
        setWorkspaceActivated(true, approvedUser.licenseKey);
      }
      return updated;
    }
  } catch (err) {
    console.warn('Failed to sync user accounts from Supabase:', err);
  }
  return getUserAccountRecords();
}

export function verifyAndActivateUserLicense(email: string, licenseKey: string): { success: boolean; message: string } {
  const keyUpper = licenseKey.trim().toUpperCase();
  const licenses = getLicenseKeys();
  const users = getUserAccountRecords();

  const foundKey = licenses.find((l) => l.licenseKey.toUpperCase() === keyUpper && l.status === 'active');
  
  if (!foundKey) {
    return { success: false, message: 'Invalid or expired License Key. Please check and try again or contact Admin.' };
  }

  // Mark workspace as activated globally on this device
  setWorkspaceActivated(true, keyUpper);

  // Update user account status
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  let activeUser: UserAccountRecord;
  if (userIndex !== -1) {
    users[userIndex].status = 'approved';
    users[userIndex].licenseKey = keyUpper;
    activeUser = users[userIndex];
  } else {
    // Create approved account for this email
    activeUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      fullName: 'Atelier Designer',
      studioName: 'Bespoke Studio',
      role: 'Master (Studio Owner & Financial Control)',
      licenseKey: keyUpper,
      status: 'approved',
      registeredAt: new Date().toISOString()
    };
    users.unshift(activeUser);
  }

  // Also approve all pending users on this device since key activated workspace
  users.forEach((u) => {
    if (u.status === 'pending') {
      u.status = 'approved';
      if (!u.licenseKey) u.licenseKey = keyUpper;
      upsertUserAccountToSupabase(u);
    }
  });

  saveUserAccountRecords(users);
  upsertUserAccountToSupabase(activeUser);

  return { success: true, message: 'License Key verified successfully! Account activated.' };
}

export function approveUserByAdmin(userId: string): boolean {
  const users = getUserAccountRecords();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = 'approved';
    if (!user.licenseKey) {
      const generated = generateNewLicenseKey('1_year', user.studioName, user.email);
      user.licenseKey = generated.licenseKey;
    }
    setWorkspaceActivated(true, user.licenseKey);
    saveUserAccountRecords(users);
    upsertUserAccountToSupabase(user);
    return true;
  }
  return false;
}

export function rejectUserByAdmin(userId: string): boolean {
  const users = getUserAccountRecords();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = 'rejected';
    saveUserAccountRecords(users);
    return true;
  }
  return false;
}

export function generateNewLicenseKey(
  duration: LicenseDuration = '1_year',
  assignedStudio?: string,
  assignedEmail?: string
): LicenseRecord {
  const licenses = getLicenseKeys();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  let prefix = 'TPS';
  let expirationDate: Date | null = null;
  const now = new Date();

  if (duration === '1_year') {
    prefix = 'TPS-1YR';
    expirationDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  } else if (duration === '6_months') {
    prefix = 'TPS-6MO';
    expirationDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  } else if (duration === '1_month') {
    prefix = 'TPS-1MO';
    expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    prefix = 'TPS-LIFE';
    expirationDate = null;
  }

  const newKeyStr = `${prefix}-${randomChars}${randomNum}`;

  const newRecord: LicenseRecord = {
    id: `lic-${Date.now()}`,
    licenseKey: newKeyStr,
    duration,
    expiresAt: expirationDate ? expirationDate.toISOString() : undefined,
    assignedStudioName: assignedStudio || 'General Atelier License',
    assignedEmail: assignedEmail || undefined,
    status: 'active',
    createdAt: now.toISOString()
  };

  licenses.unshift(newRecord);
  saveLicenseKeys(licenses);
  return newRecord;
}

export function revokeLicenseKey(keyId: string): boolean {
  const licenses = getLicenseKeys();
  const record = licenses.find((l) => l.id === keyId);
  if (record) {
    record.status = 'revoked';
    saveLicenseKeys(licenses);
    return true;
  }
  return false;
}

export function deleteLicenseKey(keyId: string): boolean {
  const licenses = getLicenseKeys();
  const updated = licenses.filter((l) => l.id !== keyId);
  saveLicenseKeys(updated);
  return true;
}

export function clearAllLicenses(): void {
  saveLicenseKeys([]);
}

const STORAGE_KEY_ADMIN_PIN = 'tailor_admin_security_pin';

export function getAdminPin(): string {
  return localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || '8888';
}

export function updateAdminPin(newPin: string): void {
  localStorage.setItem(STORAGE_KEY_ADMIN_PIN, newPin.trim());
}

