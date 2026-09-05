import React, { useState } from 'react';
import { Menu, X, BarChart3, Receipt, Target, Settings, Plus, CreditCard, LogOut } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  transactionCount,
  onLogout
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      
      {/* Floating Menu Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-64 glass-panel rounded-3xl p-3 shadow-2xl border border-slate-800 animate-fadeIn space-y-1 bg-slate-950/95 backdrop-blur-xl">
          
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 px-3 py-1.5 border-b border-slate-800/80 mb-1">
            Navigation Menu
          </div>

          {/* MANUAL LOG TRANSACTION BUTTON */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenAddModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-950/80 active:scale-98 transition-all mb-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Manual Log Transaction</span>
          </button>

          {/* FINANCIAL OVERVIEW */}
          <button
            onClick={() => handleSelectTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Financial Overview</span>
          </button>

          {/* TRANSACTIONS LEDGER */}
          <button
            onClick={() => handleSelectTab('ledger')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
              activeTab === 'ledger'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Receipt className={`w-4 h-4 ${activeTab === 'ledger' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Transactions Ledger</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'ledger'
                ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                : 'bg-slate-900 text-slate-400'
            }`}>
              {transactionCount}
            </span>
          </button>

          {/* CATEGORIES & BUDGETS */}
          <button
            onClick={() => handleSelectTab('budgets')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
              activeTab === 'budgets'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === 'budgets' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Categories & Budgets</span>
          </button>

          {/* EMIS & LOANS TRACKER */}
          <button
            onClick={() => handleSelectTab('emis')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
              activeTab === 'emis'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'emis' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>EMIs & Loans Tracker</span>
          </button>

          {/* SYSTEM SETTINGS */}
          <button
            onClick={() => handleSelectTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>System Settings</span>
          </button>

          {/* LOG OUT BUTTON */}
          <div className="pt-2 border-t border-slate-800/80 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out & Lock Vault</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/90 active:scale-95 transition-all border-2 border-emerald-400/40"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
      </button>

    </div>
  );
}
