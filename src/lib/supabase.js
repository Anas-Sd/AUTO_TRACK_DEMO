import { createClient } from '@supabase/supabase-js';
import { decryptPayload, encryptPayload } from './crypto';
import { INITIAL_CATEGORIES } from './sampleData';

// Supabase Environment Credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kdiefrqgmoahpfcstbzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaWVmcnFnbW9haHBmY3N0YnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODE0OTEsImV4cCI6MjEwNDE1NzQ5MX0.chEhUh4KKaTQGL4beE6ZSf6V65aiWBHvW3cLXMmmQhE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Registers or updates a Vault Session in Supabase vault_sessions table
 */
export const registerVaultSessionInCloud = async (vaultCode, userName = 'Anas') => {
  try {
    const encryptedName = encryptPayload(userName, vaultCode);
    const { data, error } = await supabase
      .from('vault_sessions')
      .upsert(
        { vault_code: vaultCode, user_name: encryptedName, last_active: new Date().toISOString() },
        { onConflict: 'vault_code' }
      )
      .select();

    if (error) {
      console.warn('Vault session upsert warning:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Failed to sync vault session to Supabase:', err);
    return null;
  }
};

/**
 * Checks if a Vault Session exists in Supabase vault_sessions table
 */
export const verifyVaultSessionInCloud = async (vaultCode) => {
  try {
    const { data, error } = await supabase
      .from('vault_sessions')
      .select('vault_code, user_name')
      .eq('vault_code', vaultCode)
      .maybeSingle();

    if (error) {
      console.error('Error verifying vault session:', error);
      return { exists: false, error: error.message };
    }

    if (data) {
      return { exists: true, session: data };
    } else {
      return { exists: false };
    }
  } catch (err) {
    console.error('Failed to query Supabase vault session:', err);
    return { exists: false, error: err.message };
  }
};

/**
 * Fetches categories for a specific Vault Code from Supabase.
 * If none exist in cloud, seeds standard initial categories into Supabase for this vault.
 */
export const fetchCloudCategories = async (vaultCode) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('vault_code', vaultCode);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || 'Tag',
        color: c.color || '#10b981',
        monthlyLimit: Number(c.monthly_limit || 0)
      }));
    }

    // Seed initial categories for new vault in Supabase
    const seeded = INITIAL_CATEGORIES.map((cat) => ({
      id: `${cat.id}-${vaultCode}`,
      vault_code: vaultCode,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      monthly_limit: cat.monthlyLimit
    }));

    await supabase.from('categories').insert(seeded);
    return INITIAL_CATEGORIES;
  } catch (err) {
    console.error('Error fetching cloud categories:', err);
    return INITIAL_CATEGORIES;
  }
};

/**
 * Updates a Category limit in Supabase cloud
 */
export const updateCloudCategoryLimit = async (categoryId, newLimit, vaultCode) => {
  try {
    await supabase
      .from('categories')
      .update({ monthly_limit: newLimit })
      .eq('vault_code', vaultCode)
      .ilike('name', categoryId);
  } catch (err) {
    console.error('Error updating category limit in cloud:', err);
  }
};

/**
 * Safely decrypts a transaction object retrieved from Supabase
 */
export const decryptTransactionRecord = (tx, vaultCode) => {
  if (!tx) return tx;
  return {
    ...tx,
    title: decryptPayload(tx.title, vaultCode) || tx.title,
    merchant: decryptPayload(tx.merchant, vaultCode) || tx.merchant,
    notes: decryptPayload(tx.notes, vaultCode) || tx.notes
  };
};

/**
 * Fetches all transactions for a specific Vault Code from Supabase and decrypts them
 */
export const fetchCloudTransactions = async (vaultCode) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('vault_code', vaultCode)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((tx) => decryptTransactionRecord(tx, vaultCode));
  } catch (err) {
    console.error('Error fetching cloud transactions:', err);
    return [];
  }
};

/**
 * Inserts a new encrypted transaction into Supabase cloud
 */
export const insertCloudTransaction = async (tx, vaultCode) => {
  try {
    const encTitle = encryptPayload(tx.title || 'Expense', vaultCode);
    const encMerchant = encryptPayload(tx.merchant || tx.category || 'UPI Payment', vaultCode);
    const encNotes = encryptPayload(tx.notes || '', vaultCode);

    const payload = {
      id: tx.id || `tx_${Date.now()}`,
      vault_code: vaultCode,
      title: encTitle,
      merchant: encMerchant,
      amount: Number(tx.amount || 0),
      type: tx.type || 'expense',
      category: tx.category || 'Food & Dining',
      payment_method: tx.payment_method || 'UPI',
      notes: encNotes,
      date: tx.date || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select();

    if (error) throw error;
    return data ? decryptTransactionRecord(data[0], vaultCode) : null;
  } catch (err) {
    console.error('Error inserting transaction to cloud:', err);
    return null;
  }
};

/**
 * Deletes a transaction from Supabase by ID and Vault Code
 */
export const deleteCloudTransaction = async (id, vaultCode) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('vault_code', vaultCode);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting transaction from cloud:', err);
    return false;
  }
};

/**
 * Deletes all transactions for a specific Vault Code from Supabase
 */
export const clearCloudTransactions = async (vaultCode) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('vault_code', vaultCode);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error clearing cloud transactions:', err);
    return false;
  }
};

/**
 * Subscribes to real-time transaction insertions for live phone-to-web sync
 */
export const subscribeToCloudTransactions = (vaultCode, onNewTx) => {
  return supabase
    .channel(`realtime-transactions-${vaultCode}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `vault_code=eq.${vaultCode}`
      },
      (payload) => {
        if (payload && payload.new) {
          const decrypted = decryptTransactionRecord(payload.new, vaultCode);
          onNewTx(decrypted);
        }
      }
    )
    .subscribe();
};
