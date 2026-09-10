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
  getStoredCategories,
  saveStoredCategories,
  getStoredVaultCode,
  saveStoredVaultCode,
  generateVaultCode
} from './lib/storage';

import {
  fetchCloudTransactions,
  insertCloudTransaction,
  deleteCloudTransaction,
  clearCloudTransactions,
  subscribeToCloudTransactions
} from './lib/supabase';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vaultCode, setVaultCode] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ledger' | 'budgets' | 'emis' | 'settings'

  useEffect(() => {
    setCategories(getStoredCategories());
    const storedCode = getStoredVaultCode();
    if (storedCode) {
      setVaultCode(storedCode);
    }
  }, []);

  // Fetch and sync transactions purely from Supabase Cloud
  useEffect(() => {
    if (!vaultCode) return;

    fetchCloudTransactions(vaultCode).then((cloudTxs) => {
      setTransactions(cloudTxs || []);
    });

    // Subscribe to real-time payment updates from mobile app
    const channel = subscribeToCloudTransactions(vaultCode, (newTx) => {
      setTransactions((prev) => {
        const exists = prev.some((t) => t.id === newTx.id);
        if (exists) return prev;
        return [newTx, ...prev];
      });
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [vaultCode]);

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

  // Save transaction to Supabase Cloud
  const handleSaveTransaction = async (tx) => {
    if (!vaultCode) return;
    const inserted = await insertCloudTransaction(tx, vaultCode);
    if (inserted) {
      setTransactions((prev) => [inserted, ...prev.filter(t => t.id !== inserted.id)]);
    } else {
      setTransactions((prev) => [tx, ...prev]);
    }
    setEditingTransaction(null);
  };

  // Delete transaction from Supabase Cloud
  const handleDeleteTransaction = async (id) => {
    if (!vaultCode) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await deleteCloudTransaction(id, vaultCode);
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

  // Reset transactions in Supabase Cloud
  const handleResetData = async () => {
    if (!vaultCode) return;
    setTransactions([]);
    await clearCloudTransactions(vaultCode);
  };

  // If phone hasn't been paired yet, show Sync Prompt Screen
  if (!vaultCode) {
    return (
      <SyncPromptScreen
        onPairCode={handleChangeVaultCode}
        onUseDemo={handleUseDemoMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-0">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultCode={vaultCode}
        transactionCount={transactions.length}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <StatsCards transactions={transactions} categories={categories} />
            <AnalyticsCharts transactions={transactions} categories={categories} />
          </>
        )}

        {/* TAB 2: LEDGER */}
        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            categories={categories}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: BUDGETS */}
        {activeTab === 'budgets' && (
          <BudgetManager
            categories={categories}
            transactions={transactions}
            onUpdateLimit={handleUpdateCategoryLimit}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddCategory={handleAddNewCategory}
          />
        )}

        {/* TAB 4: EMIS & LOANS */}
        {activeTab === 'emis' && (
          <EMILoanTracker />
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsManager
            vaultCode={vaultCode}
            onGenerateNewVaultCode={handleGenerateNewVaultCode}
            onResetData={handleResetData}
            transactionsCount={transactions.length}
            categoriesCount={categories.length}
          />
        )}
      </main>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add / Edit Transaction Modal */}
      {isAddModalOpen && (
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          categories={categories}
          editingTransaction={editingTransaction}
          onAddCategory={handleAddNewCategory}
        />
      )}

      {/* Vault Code Sync Status Modal */}
      {isVaultModalOpen && (
        <VaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          vaultCode={vaultCode}
          onChangeCode={handleChangeVaultCode}
        />
      )}

    </div>
  );
}
