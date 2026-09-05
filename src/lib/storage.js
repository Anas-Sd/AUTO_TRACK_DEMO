import { INITIAL_TRANSACTIONS, INITIAL_CATEGORIES, INITIAL_SUBSCRIPTIONS } from './sampleData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendpulse_transactions_v1',
  CATEGORIES: 'spendpulse_categories_v1',
  SUBSCRIPTIONS: 'spendpulse_subscriptions_v1',
  SUPABASE_CONFIG: 'spendpulse_supabase_config_v1',
  VAULT_CODE: 'spendpulse_vault_code_v1'
};

export const generateVaultCode = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `SP-${randomDigits}`;
};

export const getStoredVaultCode = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.VAULT_CODE);
  } catch (e) {
    return null;
  }
};

export const saveStoredVaultCode = (code) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VAULT_CODE, code);
  } catch (e) {
    console.error('Error saving vault code', e);
  }
};

export const getStoredTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Error reading transactions from storage', e);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
};

export const getStoredCategories = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  } catch (e) {
    return INITIAL_CATEGORIES;
  }
};

export const saveStoredCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories', e);
  }
};

export const getStoredSubscriptions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : INITIAL_SUBSCRIPTIONS;
  } catch (e) {
    return INITIAL_SUBSCRIPTIONS;
  }
};

export const saveStoredSubscriptions = (subs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  } catch (e) {
    console.error('Error saving subscriptions', e);
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
