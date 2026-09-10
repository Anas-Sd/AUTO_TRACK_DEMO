import { createClient } from '@supabase/supabase-js';
import { decryptPayload, encryptPayload, hashVaultCode } from './crypto';

// Supabase Environment Credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kdiefrqgmoahpfcstbzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaWVmcnFnbW9haHBmY3N0YnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODE0OTEsImV4cCI6MjEwNDE1NzQ5MX0.chEhUh4KKaTQGL4beE6ZSf6V65aiWBHvW3cLXMmmQhE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Registers or updates a Vault Session in Supabase using anonymized SHA-256 Vault ID
 */
export const registerVaultSessionInCloud = async (vaultCode, userName = 'Anas') => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const encryptedName = encryptPayload(userName, vaultCode);
    const { data, error } = await supabase
      .from('vault_sessions')
      .upsert(
        { vault_code: vaultId, user_name: encryptedName, last_active: new Date().toISOString() },
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
 * Checks if a Vault Session exists in Supabase using anonymized SHA-256 Vault ID
 */
export const verifyVaultSessionInCloud = async (vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const { data, error } = await supabase
      .from('vault_sessions')
      .select('vault_code, user_name')
      .eq('vault_code', vaultId)
      .maybeSingle();

    if (error) {
      console.error('Error verifying vault session:', error);
      return { exists: false, error: error.message };
    }

    return { exists: Boolean(data), session: data };
  } catch (err) {
    console.error('Failed to query Supabase vault session:', err);
    return { exists: false, error: err.message };
  }
};

/**
 * Fetches categories strictly for a specific Vault Code from Supabase.
 * Returns empty array [] initially if user hasn't created any categories yet.
 */
export const fetchCloudCategories = async (vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('vault_code', vaultId);

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

    // 100% Zero-Data Policy: Return empty array initially until user adds categories!
    return [];
  } catch (err) {
    console.error('Error fetching cloud categories:', err);
    return [];
  }
};

/**
 * Inserts a new user category directly into Supabase cloud
 */
export const insertCloudCategory = async (category, vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const payload = {
      id: category.id || `cat_${Date.now()}`,
      vault_code: vaultId,
      name: category.name,
      icon: category.icon || 'Tag',
      color: category.color || '#10b981',
      monthly_limit: Number(category.monthlyLimit || 5000)
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error('Error inserting category to cloud:', err);
    return null;
  }
};

/**
 * Updates a Category limit in Supabase cloud using SHA-256 Vault ID
 */
export const updateCloudCategoryLimit = async (categoryId, newLimit, vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    await supabase
      .from('categories')
      .update({ monthly_limit: newLimit })
      .eq('vault_code', vaultId)
      .ilike('name', categoryId);
  } catch (err) {
    console.error('Error updating category limit in cloud:', err);
  }
};

/**
 * Deletes a category from Supabase cloud
 */
export const deleteCloudCategory = async (categoryId, vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    await supabase
      .from('categories')
      .delete()
      .eq('vault_code', vaultId)
      .eq('id', categoryId);
  } catch (err) {
    console.error('Error deleting category from cloud:', err);
  }
};

/**
 * Safely decrypts a transaction object retrieved from Supabase using raw Vault Code
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
 * Fetches all transactions for a specific Vault Code strictly from Supabase
 */
export const fetchCloudTransactions = async (vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('vault_code', vaultId)
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
    const vaultId = hashVaultCode(vaultCode);
    const encTitle = encryptPayload(tx.title || 'Expense', vaultCode);
    const encMerchant = encryptPayload(tx.merchant || tx.category || 'UPI Payment', vaultCode);
    const encNotes = encryptPayload(tx.notes || '', vaultCode);

    const payload = {
      id: tx.id || `tx_${Date.now()}`,
      vault_code: vaultId,
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
 * Deletes a transaction from Supabase by ID and SHA-256 Vault ID
 */
export const deleteCloudTransaction = async (id, vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('vault_code', vaultId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting transaction from cloud:', err);
    return false;
  }
};

/**
 * Deletes all transactions for a specific Vault Code from Supabase using SHA-256 Vault ID
 */
export const clearCloudTransactions = async (vaultCode) => {
  try {
    const vaultId = hashVaultCode(vaultCode);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('vault_code', vaultId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error clearing cloud transactions:', err);
    return false;
  }
};

/**
 * Subscribes to real-time transaction insertions for live phone-to-web sync using SHA-256 Vault ID
 */
export const subscribeToCloudTransactions = (vaultCode, onNewTx) => {
  const vaultId = hashVaultCode(vaultCode);
  return supabase
    .channel(`realtime-transactions-${vaultId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `vault_code=eq.${vaultId}`
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
