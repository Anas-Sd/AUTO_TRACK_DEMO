import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, Smartphone, Calendar, Tag, FileText } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onSave, categories, editingTransaction }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [paidFrom, setPaidFrom] = useState('HDFC Bank');
  const [paidTo, setPaidTo] = useState('');
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title || '');
      setAmount(editingTransaction.amount || '');
      setType(editingTransaction.type || 'expense');
      setCategory(editingTransaction.category || (categories[0] ? categories[0].name : 'Food & Dining'));
      setPaidFrom(editingTransaction.paidFrom || 'HDFC Bank');
      setPaidTo(editingTransaction.paidTo || '');
      setPaymentApp(editingTransaction.paymentApp || 'Google Pay');
      setDate(editingTransaction.date || new Date().toISOString().slice(0, 10));
      setNotes(editingTransaction.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory(categories[0] ? categories[0].name : 'Food & Dining');
      setPaidFrom('HDFC Bank');
      setPaidTo('');
      setPaymentApp('Google Pay');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
  }, [editingTransaction, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || isNaN(amount)) return;

    onSave({
      id: editingTransaction ? editingTransaction.id : 'tx-' + Date.now(),
      title,
      amount: Number(amount),
      type,
      category,
      paidFrom,
      paidTo,
      paymentApp,
      date,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-700/80 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Log New Transaction'}
              </h3>
              <p className="text-xs text-slate-400">Manual ledger entry & categorization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense Debit
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income Credit
            </button>
          </div>

          {/* Amount & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-extrabold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Transaction Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Chai Stall / Starbucks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Payment App */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">UPI Payment App</label>
              <select
                value={paymentApp}
                onChange={(e) => setPaymentApp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Google Pay">Google Pay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
                <option value="CRED">CRED</option>
                <option value="Amazon Pay">Amazon Pay</option>
                <option value="BHIM UPI">BHIM UPI</option>
                <option value="Bank Transfer">Bank NetBanking</option>
              </select>
            </div>
          </div>

          {/* Paid From & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Paid From (Account / Card)</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank / SBI Credit Card"
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. Coffee with team after meeting"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-950/50"
            >
              Save Transaction
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
