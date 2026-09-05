import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../lib/storage';

export default function StatsCards({ transactions, categories }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  // Calculate total monthly budget limit
  const totalBudget = categories.reduce((sum, c) => sum + (c.monthlyLimit || 0), 0);
  const budgetSpentPct = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

  return (
    <div className="mb-4 sm:mb-8 animate-fadeIn">
      
      {/* Collapsible Bar Header (Shown by default) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full glass-panel p-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-800 hover:border-slate-700/80 flex items-center justify-between transition-all group mb-3 shadow-lg"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight block truncate">
              Summary Metrics
            </span>
            <p className="text-[10px] text-slate-400 truncate">
              {isExpanded ? 'Tap to hide metrics breakdown' : 'Tap to reveal Income & Expenses'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
            Net: {formatCurrency(netBalance)}
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </div>
        </div>
      </button>

      {/* REVEALABLE 4 GRID METRICS CARDS */}
      {isExpanded && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 animate-fadeIn">
          
          {/* Net Balance Card */}
          <div className="glass-card glass-card-hover p-3 sm:p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-sm sm:text-2xl font-extrabold text-white tracking-tight mb-0.5 truncate">
              {formatCurrency(netBalance)}
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-xs text-emerald-400 font-medium truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
              <span className="truncate">{savingsRate}% Savings Rate</span>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="glass-card glass-card-hover p-3 sm:p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</span>
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-sm sm:text-2xl font-extrabold text-white tracking-tight mb-0.5 truncate">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-[9px] sm:text-xs text-slate-400 font-medium truncate">
              {transactions.filter(t => t.type === 'income').length} deposits logged
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="glass-card glass-card-hover p-3 sm:p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</span>
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ArrowDownRight className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-sm sm:text-2xl font-extrabold text-white tracking-tight mb-0.5 truncate">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-[9px] sm:text-xs text-rose-400/90 font-medium truncate">
              {transactions.filter(t => t.type === 'expense').length} debits recorded
            </div>
          </div>

          {/* Budget Utilization Card */}
          <div className="glass-card glass-card-hover p-3 sm:p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</span>
              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Target className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-sm sm:text-2xl font-extrabold text-white tracking-tight">
                {budgetSpentPct}%
              </span>
              <span className="text-[9px] sm:text-xs text-slate-400 truncate">spent</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSpentPct > 90
                    ? 'bg-rose-500'
                    : budgetSpentPct > 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetSpentPct, 100)}%` }}
              ></div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
