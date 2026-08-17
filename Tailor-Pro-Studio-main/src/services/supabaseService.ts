import { supabase } from '../lib/supabase';
import {
  Client,
  Apprentice,
  ApprenticeTask,
  UnpaidDeposit,
  RunwaySession,
  LedgerTransaction,
  InventoryItem,
  StudioSettings,
  UserAccountRecord
} from '../types';

// ==========================================
// CLIENTS SYNCRONIZATION
// ==========================================

export async function fetchClientsFromSupabase(): Promise<Client[] | null> {
  try {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.warn('[Supabase DB] Error fetching clients:', error.message);
      return null;
    }
    if (!data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      initials: row.initials || '',
      garmentTag: row.garment_tag || '',
      timestamp: row.timestamp || 'Just now',
      email: row.email || '',
      phone: row.phone || '',
      avatarUrl: row.avatar_url,
      status: row.status || 'Active',
      runwayStage: row.runway_stage || 'CONSULT',
      totalCost: Number(row.total_cost || 0),
      depositPaid: Number(row.deposit_paid || 0),
      balanceDue: Number(row.balance_due || 0),
      measurements: row.measurements || {},
      notes: row.notes || '',
      assignedDesigner: row.assigned_designer || '',
      tags: row.tags || []
    }));
  } catch (err) {
    console.error('[Supabase DB] Failed to fetch clients:', err);
    return null;
  }
}

export async function upsertClientToSupabase(client: Client): Promise<boolean> {
  try {
    const dbRecord = {
      id: client.id,
      name: client.name,
      initials: client.initials,
      garment_tag: client.garmentTag,
      timestamp: client.timestamp,
      email: client.email,
      phone: client.phone,
      avatar_url: client.avatarUrl,
      status: client.status,
      runway_stage: client.runwayStage,
      total_cost: client.totalCost,
      deposit_paid: client.depositPaid,
      balance_due: client.balanceDue,
      measurements: client.measurements || {},
      notes: client.notes || '',
      assigned_designer: client.assignedDesigner || '',
      tags: client.tags || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('clients').upsert(dbRecord);
    if (error) {
      console.warn('[Supabase DB] Upsert client error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Failed to upsert client:', err);
    return false;
  }
}

export async function deleteClientFromSupabase(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      console.warn('[Supabase DB] Delete client error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Failed to delete client:', err);
    return false;
  }
}

// ==========================================
// APPRENTICES SYNCRONIZATION
// ==========================================

export async function fetchApprenticesFromSupabase(): Promise<Apprentice[] | null> {
  try {
    const { data, error } = await supabase.from('apprentices').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      initials: row.initials || '',
      role: row.role || 'Apprentice',
      mentor: row.mentor || '',
      isLinked: row.is_linked ?? true,
      handshakeLocked: row.handshake_locked ?? true,
      hasCert: row.has_cert ?? false,
      avatarUrl: row.avatar_url,
      hoursCompleted: Number(row.hours_completed || 0),
      totalRequiredHours: Number(row.total_required_hours || 500),
      certifications: row.certifications || [],
      tasksCount: Number(row.tasks_count || 0),
      status: row.status || 'On Track',
      specialty: row.specialty || ''
    }));
  } catch (err) {
    console.error('[Supabase DB] Failed to fetch apprentices:', err);
    return null;
  }
}

export async function upsertApprenticeToSupabase(apprentice: Apprentice): Promise<boolean> {
  try {
    const dbRecord = {
      id: apprentice.id,
      name: apprentice.name,
      initials: apprentice.initials,
      role: apprentice.role,
      mentor: apprentice.mentor,
      is_linked: apprentice.isLinked,
      handshake_locked: apprentice.handshakeLocked,
      has_cert: apprentice.hasCert,
      avatar_url: apprentice.avatarUrl,
      hours_completed: apprentice.hoursCompleted,
      total_required_hours: apprentice.totalRequiredHours,
      certifications: apprentice.certifications || [],
      tasks_count: apprentice.tasksCount,
      status: apprentice.status,
      specialty: apprentice.specialty,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('apprentices').upsert(dbRecord);
    if (error) return false;
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteApprenticeFromSupabase(apprenticeId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('apprentices').delete().eq('id', apprenticeId);
    if (error) {
      console.warn('[Supabase DB] Delete apprentice error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Failed to delete apprentice:', err);
    return false;
  }
}

// ==========================================
// APPRENTICE TASKS SYNCRONIZATION
// ==========================================

export async function fetchApprenticeTasksFromSupabase(): Promise<ApprenticeTask[] | null> {
  try {
    const { data, error } = await supabase.from('apprentice_tasks').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      assignedTo: row.assigned_to || 'all',
      isCompleted: row.is_completed ?? false,
      status: row.status || 'in_progress',
      category: row.category || '',
      dueDate: row.due_date || '',
      completedAt: row.completed_at || '',
      passedAt: row.passed_at || '',
      masterNotes: row.master_notes || ''
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertApprenticeTaskToSupabase(task: ApprenticeTask): Promise<boolean> {
  try {
    const dbRecord = {
      id: task.id,
      title: task.title,
      assigned_to: task.assignedTo || 'all',
      is_completed: task.isCompleted,
      status: task.status || 'in_progress',
      category: task.category || '',
      due_date: task.dueDate || '',
      completed_at: task.completedAt || '',
      passed_at: task.passedAt || '',
      master_notes: task.masterNotes || '',
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('apprentice_tasks').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// UNPAID DEPOSITS SYNCRONIZATION
// ==========================================

export async function fetchUnpaidDepositsFromSupabase(): Promise<UnpaidDeposit[] | null> {
  try {
    const { data, error } = await supabase.from('unpaid_deposits').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      clientId: row.client_id || '',
      clientName: row.client_name || '',
      garmentTag: row.garment_tag || '',
      amount: Number(row.amount || 0),
      dueDate: row.due_date || '',
      phone: row.phone || ''
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertUnpaidDepositToSupabase(deposit: UnpaidDeposit): Promise<boolean> {
  try {
    const dbRecord = {
      id: deposit.id,
      client_id: deposit.clientId,
      client_name: deposit.clientName,
      garment_tag: deposit.garmentTag,
      amount: deposit.amount,
      due_date: deposit.dueDate,
      phone: deposit.phone
    };
    const { error } = await supabase.from('unpaid_deposits').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteUnpaidDepositFromSupabase(depositId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('unpaid_deposits').delete().eq('id', depositId);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// RUNWAY SESSIONS SYNCRONIZATION
// ==========================================

export async function fetchRunwaySessionsFromSupabase(): Promise<RunwaySession[] | null> {
  try {
    const { data, error } = await supabase.from('runway_sessions').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      clientId: row.client_id || '',
      clientName: row.client_name || '',
      clientAvatar: row.client_avatar || '',
      serviceTitle: row.service_title || '',
      artistName: row.artist_name || '',
      timeSlot: row.time_slot || '',
      durationHours: Number(row.duration_hours || 1),
      price: Number(row.price || 0),
      depositPaid: Number(row.deposit_paid || 0),
      status: row.status || 'Confirmed'
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertRunwaySessionToSupabase(session: RunwaySession): Promise<boolean> {
  try {
    const dbRecord = {
      id: session.id,
      client_id: session.clientId,
      client_name: session.clientName,
      client_avatar: session.clientAvatar,
      service_title: session.serviceTitle,
      artist_name: session.artistName,
      time_slot: session.timeSlot,
      duration_hours: session.durationHours,
      price: session.price,
      deposit_paid: session.depositPaid,
      status: session.status
    };
    const { error } = await supabase.from('runway_sessions').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// LEDGER TRANSACTIONS SYNCRONIZATION
// ==========================================

export async function fetchLedgerTransactionsFromSupabase(): Promise<LedgerTransaction[] | null> {
  try {
    const { data, error } = await supabase.from('ledger_transactions').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      date: row.date || '',
      type: row.type || 'revenue',
      category: row.category || '',
      description: row.description || '',
      amount: Number(row.amount || 0),
      clientOrVendor: row.client_or_vendor || '',
      status: row.status || 'cleared',
      method: row.method || 'MoMo'
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertLedgerTransactionToSupabase(tx: LedgerTransaction): Promise<boolean> {
  try {
    const dbRecord = {
      id: tx.id,
      date: tx.date,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      client_or_vendor: tx.clientOrVendor,
      status: tx.status,
      method: tx.method
    };
    const { error } = await supabase.from('ledger_transactions').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// INVENTORY ITEMS SYNCRONIZATION
// ==========================================

export async function fetchInventoryItemsFromSupabase(): Promise<InventoryItem[] | null> {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || 'FABRIC',
      stockLevel: Number(row.stock_level || 0),
      minThreshold: Number(row.min_threshold || 5),
      alertThreshold: Number(row.alert_threshold || 5),
      unit: row.unit || 'Pieces',
      status: row.status || 'In Stock',
      supplier: row.supplier || ''
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertInventoryItemToSupabase(item: InventoryItem): Promise<boolean> {
  try {
    const dbRecord = {
      id: item.id,
      name: item.name,
      category: item.category,
      stock_level: item.stockLevel,
      min_threshold: item.minThreshold,
      alert_threshold: item.alertThreshold,
      unit: item.unit,
      status: item.status,
      supplier: item.supplier
    };
    const { error } = await supabase.from('inventory_items').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteInventoryItemFromSupabase(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', itemId);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// STUDIO SETTINGS SYNCRONIZATION
// ==========================================

export async function fetchStudioSettingsFromSupabase(): Promise<StudioSettings | null> {
  try {
    const { data, error } = await supabase.from('studio_settings').select('*').eq('id', 'default').single();
    if (error || !data) return null;

    return {
      studioName: data.studio_name || '',
      ownerName: data.owner_name || '',
      email: data.email || '',
      logoUrl: data.logo_url || '',
      pairCode: data.pair_code || '',
      momoNumber: data.momo_number || '',
      momoHolderName: data.momo_holder_name || '',
      safetyPin: data.safety_pin || '1234',
      theme: (data.theme as 'light' | 'dark') || 'light'
    };
  } catch (err) {
    return null;
  }
}

export async function upsertStudioSettingsToSupabase(settings: StudioSettings): Promise<boolean> {
  try {
    const dbRecord = {
      id: 'default',
      studio_name: settings.studioName,
      owner_name: settings.ownerName,
      email: settings.email,
      logo_url: settings.logoUrl,
      pair_code: settings.pairCode,
      momo_number: settings.momoNumber,
      momo_holder_name: settings.momoHolderName,
      safety_pin: settings.safetyPin,
      theme: settings.theme,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('studio_settings').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// SEED INITIAL DATA IF TABLES EMPTY
// ==========================================

export async function seedInitialSupabaseData(
  initialClients: Client[],
  initialApprentices: Apprentice[],
  initialUnpaidDeposits: UnpaidDeposit[],
  initialRunwaySessions: RunwaySession[],
  initialLedgerTransactions: LedgerTransaction[],
  initialInventoryItems: InventoryItem[],
  defaultStudioSettings: StudioSettings
) {
  try {
    const existingClients = await fetchClientsFromSupabase();
    if (existingClients && existingClients.length === 0) {
      console.log('[Supabase DB] Seeding initial clients...');
      for (const client of initialClients) {
        await upsertClientToSupabase(client);
      }
    }

    const existingApprentices = await fetchApprenticesFromSupabase();
    if (existingApprentices && existingApprentices.length === 0) {
      console.log('[Supabase DB] Seeding initial apprentices...');
      for (const app of initialApprentices) {
        await upsertApprenticeToSupabase(app);
      }
    }

    const existingDeposits = await fetchUnpaidDepositsFromSupabase();
    if (existingDeposits && existingDeposits.length === 0) {
      for (const dep of initialUnpaidDeposits) {
        await upsertUnpaidDepositToSupabase(dep);
      }
    }

    const existingSessions = await fetchRunwaySessionsFromSupabase();
    if (existingSessions && existingSessions.length === 0) {
      for (const sess of initialRunwaySessions) {
        await upsertRunwaySessionToSupabase(sess);
      }
    }

    const existingTx = await fetchLedgerTransactionsFromSupabase();
    if (existingTx && existingTx.length === 0) {
      for (const tx of initialLedgerTransactions) {
        await upsertLedgerTransactionToSupabase(tx);
      }
    }

    const existingInv = await fetchInventoryItemsFromSupabase();
    if (existingInv && existingInv.length === 0) {
      for (const inv of initialInventoryItems) {
        await upsertInventoryItemToSupabase(inv);
      }
    }

    const existingSettings = await fetchStudioSettingsFromSupabase();
    if (!existingSettings) {
      await upsertStudioSettingsToSupabase(defaultStudioSettings);
    }
  } catch (err) {
    console.warn('[Supabase DB] Data seeding warning:', err);
  }
}

// ==========================================
// SUPABASE AUTHENTICATION
// ==========================================

export async function signUpSupabaseUser(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });
    if (error) {
      console.warn('[Supabase Auth] Sign up warning:', error.message);
      return { success: false, error: error.message };
    }
    console.log('[Supabase Auth] User registered successfully in auth.users:', data.user?.id);
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error('[Supabase Auth] Exception during sign up:', err);
    return { success: false, error: err.message || 'Registration failed' };
  }
}

export async function signInSupabaseUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.warn('[Supabase Auth] Sign in warning:', error.message);
      return { success: false, error: error.message };
    }
    console.log('[Supabase Auth] User signed in successfully:', data.user?.id);
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error('[Supabase Auth] Exception during sign in:', err);
    return { success: false, error: err.message || 'Login failed' };
  }
}

// ==========================================
// USER ACCOUNTS & LICENSE APPROVAL SYNCRONIZATION
// ==========================================

export async function fetchUserAccountsFromSupabase(): Promise<UserAccountRecord[] | null> {
  try {
    const { data, error } = await supabase.from('user_accounts').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name || '',
      studioName: row.studio_name || '',
      role: row.role || '',
      licenseKey: row.license_key || undefined,
      status: row.status || 'pending',
      registeredAt: row.registered_at || new Date().toISOString()
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertUserAccountToSupabase(userRecord: UserAccountRecord): Promise<boolean> {
  try {
    const dbRecord = {
      id: userRecord.id,
      email: userRecord.email.toLowerCase(),
      full_name: userRecord.fullName,
      studio_name: userRecord.studioName,
      role: userRecord.role,
      license_key: userRecord.licenseKey || null,
      status: userRecord.status,
      registered_at: userRecord.registeredAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('user_accounts').upsert(dbRecord);
    return !error;
  } catch (err) {
    return false;
  }
}


