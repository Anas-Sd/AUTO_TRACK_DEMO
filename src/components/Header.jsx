import React from 'react';
import { Wallet, Plus, Settings, BarChart3, Receipt, Target, CreditCard, LogOut } from 'lucide-react';

export default function Header({
  onOpenAddModal,
  onOpenSettings,
  activeTab,
  setActiveTab,
  transactionCount = 0,
  vaultCode,
  userName = "Anas",
  onLogout
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-slate-800/80 px-3 sm:px-8 py-3 bg-[#090d16]/95 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                Auto Track
              </h1>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Smart Tracker
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none mt-0.5">
              Smart Automatic Expense Tracker
            </p>
          </div>
        </div>

        {/* PERMANENTLY FIXED DESKTOP NAVIGATION TABS */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ledger ({transactionCount ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'budgets'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Budgets</span>
          </button>

          {/* EMIs & Loans Tab Right Beside Budgets */}
          <button
            onClick={() => setActiveTab('emis')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'emis'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>EMIs & Loans</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right Actions: Vault Badge, Logout & Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Vault Badge */}
          {vaultCode && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{userName}'s Vault</span>
            </div>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Logout Vault"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          )}

          {/* Add Transaction Primary CTA */}
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Log Transaction</span>
          </button>
        </div>

      </div>
    </header>
  );
}
