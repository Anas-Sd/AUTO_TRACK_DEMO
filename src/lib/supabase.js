import { createClient } from '@supabase/supabase-js';

// Supabase Environment Credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kdiefrqgmoahpfcstbzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaWVmcnFnbW9haHBmY3N0YnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODE0OTEsImV4cCI6MjEwNDE1NzQ5MX0.chEhUh4KKaTQGL4beE6ZSf6V65aiWBHvW3cLXMmmQhE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const registerVaultSessionInCloud = async (vaultCode, userName = 'Anas') => {
  try {
    const { data, error } = await supabase
      .from('vault_sessions')
      .upsert(
        { vault_code: vaultCode, user_name: userName, last_active: new Date().toISOString() },
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
