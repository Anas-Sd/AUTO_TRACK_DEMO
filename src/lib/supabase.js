import { createClient } from '@supabase/supabase-js';
import { decryptPayload, encryptPayload } from './crypto';

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
 * Fetches all transactions for a specific Vault Code and decrypts them locally
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
