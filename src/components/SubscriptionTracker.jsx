import React, { useState } from 'react';
import { Calendar, Tv, ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../lib/storage';

export default function SubscriptionTracker({ subscriptions, onAddSubscription, onDeleteSubscription }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const totalMonthlyBurn = subscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
    return sum + monthlyCost;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !cost) return;

    onAddSubscription({
      id: 'sub-' + Date.now(),
      name,
      cost: Number(cost),
      billingCycle,
      nextBillingDate: new Date().toISOString().slice(0, 10),
      category: 'Entertainment',
      provider: name
    });

    setName('');
    setCost('');
    setIsModalOpen(false);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Recurring Subscriptions</h2>
          </div>
          <p className="text-xs text-slate-400">Track monthly/yearly fixed digital expenses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Monthly Burn: </span>
            <span className="font-bold text-emerald-400">{formatCurrency(totalMonthlyBurn)}/mo</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white truncate">{sub.name}</span>
                <button
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-lg font-extrabold text-emerald-400 mb-1">
                {formatCurrency(sub.cost)}
                <span className="text-[10px] text-slate-400 font-normal">/{sub.billingCycle}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {sub.nextBillingDate}
              </span>
              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                {sub.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Subscription</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subscription Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, ChatGPT"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 649"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
