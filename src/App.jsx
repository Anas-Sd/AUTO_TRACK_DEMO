import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionLedger from './components/TransactionLedger';
import BudgetManager from './components/BudgetManager';
import EMILoanTracker from './components/EMILoanTracker';
import SettingsManager from './components/SettingsManager';
import AddTransactionModal from './components/AddTransactionModal';
import VaultModal from './components/VaultModal';
import SyncPromptScreen from './components/SyncPromptScreen';
import MobileBottomNav from './components/MobileBottomNav';

import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredCategories,
  saveStoredCategories,
  getStoredVaultCode,
  saveStoredVaultCode,
  generateVaultCode,
  formatCurrency
} from './lib/storage';
import { INITIAL_TRANSACTIONS } from './lib/sampleData';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vaultCode, setVaultCode] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ledger' | 'budgets' | 'emis' | 'settings'

  useEffect(() => {
    setTransactions(getStoredTransactions());
    setCategories(getStoredCategories());
    const storedCode = getStoredVaultCode();
    if (storedCode) {
      setVaultCode(storedCode);
    }
  }, []);

  const handleChangeVaultCode = (newCode) => {
    setVaultCode(newCode);
    saveStoredVaultCode(newCode);
  };

  const handleGenerateNewVaultCode = () => {
    const newCode = generateVaultCode();
    setVaultCode(newCode);
    saveStoredVaultCode(newCode);
  };

  const handleLogout = () => {
    setVaultCode(null);
    saveStoredVaultCode(null);
  };

  const handleUseDemoMode = () => {
    const demoCode = 'SP-894201';
    setVaultCode(demoCode);
    saveStoredVaultCode(demoCode);
  };

  // Save changes to localStorage
  const handleSaveTransaction = (tx) => {
    let updated;
    if (editingTransaction) {
      updated = transactions.map(t => t.id === tx.id ? tx : t);
    } else {
      updated = [tx, ...transactions];
    }
    setTransactions(updated);
    saveStoredTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
  };

  const handleUpdateCategoryLimit = (categoryId, newLimit) => {
    const updated = categories.map(c => c.id === categoryId ? { ...c, monthlyLimit: newLimit } : c);
    setCategories(updated);
    saveStoredCategories(updated);
  };

  const handleEditCategory = (categoryId, updatedCat) => {
    const updated = categories.map(c => c.id === categoryId ? { ...c, ...updatedCat } : c);
    setCategories(updated);
    saveStoredCategories(updated);
  };

  const handleDeleteCategory = (categoryId) => {
    const updated = categories.filter(c => c.id !== categoryId);
    setCategories(updated);
    saveStoredCategories(updated);
  };

  const handleAddNewCategory = (catData) => {
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
    const isObj = typeof catData === 'object' && catData !== null;
    const newCat = {
      id: 'cat-' + Date.now(),
      name: isObj ? catData.name : catData,
      icon: 'Tag',
      color: (isObj && catData.color) || colors[Math.floor(Math.random() * colors.length)],
      monthlyLimit: isObj && catData.monthlyLimit !== undefined ? Number(catData.monthlyLimit) : 5000
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStoredCategories(updated);
    return newCat;
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveStoredTransactions(INITIAL_TRANSACTIONS);
  };

  // If phone hasn't been paired yet and demo hasn't been activated, show Sync Prompt Screen
  if (!vaultCode) {
    return (
      <SyncPromptScreen
        onPairCode={handleChangeVaultCode}
        onUseDemo={handleUseDemoMode}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white animate-fadeIn ${
      activeTab === 'ledger' || activeTab === 'budgets' ? 'h-screen h-[100dvh] overflow-hidden' : ''
    }`}>
      
      {/* Fixed Navigation Header */}
      <Header
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenSettings={() => setActiveTab('settings')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transactionCount={transactions.length}
        vaultCode={vaultCode}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 pt-16 sm:pt-20 ${
        activeTab === 'ledger' || activeTab === 'budgets' ? 'pb-20 sm:pb-3 flex flex-col min-h-0 overflow-hidden' : 'pb-12'
      }`}>

        {/* Global Summary Stats (Only when not in settings or EMIs) */}
        {activeTab !== 'settings' && activeTab !== 'emis' && (
          <StatsCards transactions={transactions} categories={categories} />
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <AnalyticsCharts transactions={transactions} categories={categories} />
        )}

        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager
            categories={categories}
            transactions={transactions}
            onAddCategory={handleAddNewCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateCategoryLimit={handleUpdateCategoryLimit}
          />
        )}

        {activeTab === 'emis' && (
          <EMILoanTracker />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            vaultCode={vaultCode}
            onChangeVaultCode={handleChangeVaultCode}
            onGenerateNewCode={handleGenerateNewVaultCode}
            onResetData={handleResetData}
            transactionCount={transactions.length}
            categoryCount={categories.length}
          />
        )}

      </main>

      {/* Floating Bottom-Right Navigation Button for Mobile View */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        transactionCount={transactions.length}
        onLogout={handleLogout}
      />

      {/* Footer (Hidden when in Ledger or Budgets tab to prevent page scroll) */}
      <footer className={`border-t border-slate-900 bg-slate-950/60 py-6 px-4 text-center text-xs text-slate-500 ${
        activeTab === 'ledger' || activeTab === 'budgets' ? 'hidden' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Auto Track — Smart Automatic Expense Tracker</span>
          <span className="text-slate-600">Vault Code Sync • Zero Signup Required</span>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
      />

    </div>
  );
}
