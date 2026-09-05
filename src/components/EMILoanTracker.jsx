import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Smartphone,
  Car,
  Plus,
  Calendar,
  Percent,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Info,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import { formatCurrency } from '../lib/storage';

const INITIAL_LOANS = [
  {
    id: 'loan-1',
    name: 'Home Loan (HDFC Housing)',
    lender: 'HDFC Bank',
    type: 'Home Loan',
    totalAmount: 2500000,
    paidAmount: 660000,
    monthlyEmi: 21500,
    interestRate: 8.5,
    dueDateDay: 5,
    totalTenureMonths: 180,
    paidTenureMonths: 30,
    icon: Building2,
    color: '#3b82f6', // blue
    status: 'active'
  },
  {
    id: 'loan-2',
    name: 'iPhone 15 Pro (No-Cost EMI)',
    lender: 'HDFC Credit Card',
    type: 'Gadget EMI',
    totalAmount: 120000,
    paidAmount: 80000,
    monthlyEmi: 10000,
    interestRate: 0,
    dueDateDay: 15,
    totalTenureMonths: 12,
    paidTenureMonths: 8,
    icon: Smartphone,
    color: '#10b981', // emerald
    status: 'active'
  },
  {
    id: 'loan-3',
    name: 'Hyundai Creta Auto Loan',
    lender: 'SBI Bank',
    type: 'Vehicle Loan',
    totalAmount: 750000,
    paidAmount: 510000,
    monthlyEmi: 14200,
    interestRate: 9.1,
    dueDateDay: 10,
    totalTenureMonths: 60,
    paidTenureMonths: 41,
    icon: Car,
    color: '#f59e0b', // amber
    status: 'active'
  }
];

export default function EMILoanTracker() {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [selectedLoanId, setSelectedLoanId] = useState('loan-1');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding New Loan
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState('Personal Loan');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDateDay, setDueDateDay] = useState('5');
  const [totalTenureMonths, setTotalTenureMonths] = useState('12');

  const selectedLoan = loans.find(l => l.id === selectedLoanId) || loans[0];

  // Calculated Stats
  const totalLoanDebt = loans.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);
  const totalMonthlyOutflow = loans.reduce((sum, l) => sum + l.monthlyEmi, 0);
  const overallPaidAmount = loans.reduce((sum, l) => sum + l.paidAmount, 0);
  const overallTotalAmount = loans.reduce((sum, l) => sum + l.totalAmount, 0);
  const overallProgressPercentage = overallTotalAmount > 0 ? Math.round((overallPaidAmount / overallTotalAmount) * 100) : 0;

  const handleAddLoan = (e) => {
    e.preventDefault();
    if (!name || !totalAmount || !monthlyEmi) return;

    const newLoan = {
      id: 'loan-' + Date.now(),
      name,
      lender: lender || 'Bank/Lender',
      type,
      totalAmount: Number(totalAmount),
      paidAmount: 0,
      monthlyEmi: Number(monthlyEmi),
      interestRate: Number(interestRate) || 0,
      dueDateDay: Number(dueDateDay) || 5,
      totalTenureMonths: Number(totalTenureMonths) || 12,
      paidTenureMonths: 0,
      icon: CreditCard,
      color: '#ec4899',
      status: 'active'
    };

    setLoans([newLoan, ...loans]);
    setSelectedLoanId(newLoan.id);
    setIsAddModalOpen(false);

    // Reset Form
    setName('');
    setLender('');
    setType('Personal Loan');
    setTotalAmount('');
    setMonthlyEmi('');
    setInterestRate('');
  };

  const handleLogEmiPayment = (loanId) => {
    setLoans(loans.map(l => {
      if (l.id === loanId) {
        const newPaidAmount = Math.min(l.totalAmount, l.paidAmount + l.monthlyEmi);
        const newPaidMonths = Math.min(l.totalTenureMonths, l.paidTenureMonths + 1);
        return {
          ...l,
          paidAmount: newPaidAmount,
          paidTenureMonths: newPaidMonths,
          status: newPaidAmount >= l.totalAmount ? 'completed' : 'active'
        };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* HEADER TITLE & QUICK ACTION */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              EMIs & Loan Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track active loan balances, monthly repayment schedules, and due dates
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Loan / EMI</span>
        </button>
      </div>

      {/* OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Remaining Debt</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-white font-mono">
            {formatCurrency(totalLoanDebt)}
          </div>
          <div className="text-[10px] text-slate-400">Total unpaid principal</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Monthly EMI Outflow</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-400 font-mono">
            {formatCurrency(totalMonthlyOutflow)}
          </div>
          <div className="text-[10px] text-slate-400">Due every month</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Active Accounts</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-white font-mono">
            {loans.length} Loans
          </div>
          <div className="text-[10px] text-slate-400">EMIs currently running</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Overall Payoff</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-400 font-mono">
            {overallProgressPercentage}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${overallProgressPercentage}%` }}></div>
          </div>
        </div>

      </div>

      {/* ACTIVE LOANS LIST & DETAIL SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOANS LIST (1 col on lg) */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Active Loan Accounts ({loans.length})
          </div>

          <div className="space-y-2.5">
            {loans.map(loan => {
              const IconComp = loan.icon || CreditCard;
              const remaining = loan.totalAmount - loan.paidAmount;
              const progressPct = Math.round((loan.paidAmount / loan.totalAmount) * 100);
              const isSelected = loan.id === selectedLoanId;

              return (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoanId(loan.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${loan.color}20`, color: loan.color }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate">{loan.name}</div>
                        <div className="text-[10px] text-slate-400">{loan.lender} • Due on {loan.dueDateDay}th</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono">
                      <div className="text-xs font-bold text-emerald-400">{formatCurrency(loan.monthlyEmi)}/mo</div>
                      <div className="text-[9px] text-slate-500">EMI Amount</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Paid: {formatCurrency(loan.paidAmount)}</span>
                      <span>Left: {formatCurrency(remaining)}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%`, backgroundColor: loan.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED LOAN REPAYMENT BREAKDOWN & SKELETON (2 cols on lg) */}
        {selectedLoan && (
          <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedLoan.color}20`, color: selectedLoan.color }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedLoan.name}</h3>
                  <div className="text-xs text-slate-400">{selectedLoan.lender} • {selectedLoan.type}</div>
                </div>
              </div>

              <button
                onClick={() => handleLogEmiPayment(selectedLoan.id)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all"
              >
                Log EMI Paid ({formatCurrency(selectedLoan.monthlyEmi)})
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Total Loan</div>
                <div className="text-sm font-extrabold text-white font-mono mt-0.5">{formatCurrency(selectedLoan.totalAmount)}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Interest Rate</div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">{selectedLoan.interestRate}% p.a.</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Tenure Completed</div>
                <div className="text-sm font-extrabold text-white font-mono mt-0.5">{selectedLoan.paidTenureMonths} / {selectedLoan.totalTenureMonths} Mo</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Next Due Date</div>
                <div className="text-sm font-extrabold text-amber-400 font-mono mt-0.5">Every {selectedLoan.dueDateDay}th</div>
              </div>
            </div>

            {/* Repayment Schedule Amortization Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Upcoming EMI Amortization Schedule
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Monthly: {formatCurrency(selectedLoan.monthlyEmi)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                      <th className="pb-2 px-2">Installment</th>
                      <th className="pb-2 px-2">EMI Amount</th>
                      <th className="pb-2 px-2">Principal Component</th>
                      <th className="pb-2 px-2">Interest Component</th>
                      <th className="pb-2 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {[1, 2, 3, 4, 5].map((item) => {
                      const isPaid = item <= 2;
                      const approxInterest = Math.round((selectedLoan.totalAmount * (selectedLoan.interestRate / 100)) / 12);
                      const approxPrincipal = Math.max(0, selectedLoan.monthlyEmi - approxInterest);

                      return (
                        <tr key={item} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-2 text-slate-300">
                            Month {selectedLoan.paidTenureMonths + item}
                          </td>
                          <td className="py-2.5 px-2 text-white font-bold">
                            {formatCurrency(selectedLoan.monthlyEmi)}
                          </td>
                          <td className="py-2.5 px-2 text-emerald-400">
                            {formatCurrency(approxPrincipal)}
                          </td>
                          <td className="py-2.5 px-2 text-rose-400">
                            {formatCurrency(approxInterest)}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {isPaid ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                Paid
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Due {selectedLoan.dueDateDay}th
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ADD NEW LOAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-700/80 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log New Loan or EMI</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLoan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Loan Title / Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro No-Cost EMI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lender / Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC / Bajaj"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Loan Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Gadget EMI">Gadget EMI</option>
                    <option value="Education Loan">Education Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Loan Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12500"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Interest %</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 8.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="5"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Months</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={totalTenureMonths}
                    onChange={(e) => setTotalTenureMonths(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg"
                >
                  Save Loan Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
