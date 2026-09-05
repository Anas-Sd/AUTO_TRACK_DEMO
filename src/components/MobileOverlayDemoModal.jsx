import React, { useState, useEffect } from 'react';
import { Clock, Smartphone, CheckCircle, ArrowRight, ArrowLeft, Plus, BellRing } from 'lucide-react';
import { formatCurrency } from '../lib/storage';

export default function MobileOverlayDemoModal({
  isOpen,
  onClose,
  onSaveTransaction,
  categories,
  onAddNewCategory
}) {
  const [step, setStep] = useState(1);
  const [vendor, setVendor] = useState('Starbucks Coffee');
  const [amount, setAmount] = useState('350');
  const [notes, setNotes] = useState('Team afternoon snack');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ? categories[0].name : 'Food & Dining');
  
  // Custom new category creation state inside modal
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Snooze state
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [snoozeSecondsLeft, setSnoozeSecondsLeft] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isSnoozed && snoozeSecondsLeft > 0) {
      interval = setInterval(() => {
        setSnoozeSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsSnoozed(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSnoozed, snoozeSecondsLeft]);

  if (!isOpen) return null;

  const handleSnooze = () => {
    setIsSnoozed(true);
    setSnoozeSecondsLeft(120); // 2 minutes (120 seconds)
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!vendor || !amount || isNaN(amount)) return;
    setStep(2);
  };

  const handleAddNewCatSubmit = (e) => {
    e.preventDefault();
    if (newCatName.trim()) {
      const created = onAddNewCategory(newCatName.trim());
      setSelectedCategory(created.name);
      setNewCatName('');
      setIsAddingNewCat(false);
    }
  };

  const handleFinalSave = () => {
    setIsSaved(true);

    setTimeout(() => {
      onSaveTransaction({
        id: 'tx-' + Date.now(),
        title: vendor || 'UPI Transaction',
        amount: Number(amount) || 0,
        type: 'expense',
        category: selectedCategory,
        paidFrom: 'HDFC Bank (UPI)',
        paidTo: vendor,
        paymentApp: 'Google Pay',
        date: new Date().toISOString().slice(0, 10),
        notes
      });
      setIsSaved(false);
      setStep(1);
      onClose();
    }, 1200);
  };

  // Render NON-BLOCKING Snoozed Floating Pill in Bottom-Left if snoozed
  if (isSnoozed) {
    const mins = Math.floor(snoozeSecondsLeft / 60);
    const secs = snoozeSecondsLeft % 60;
    const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
      <div className="fixed bottom-6 left-4 sm:left-8 z-40 animate-bounce-short pointer-events-auto">
        <div className="glass-panel px-3.5 py-2.5 rounded-2xl border-2 border-amber-500/50 shadow-2xl shadow-amber-950/90 flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-none">Snoozed Payment</div>
            <div className="text-[10px] text-amber-400 font-mono font-medium mt-0.5">Auto-popup in {timeFormatted}</div>
          </div>
          <button
            onClick={() => setIsSnoozed(false)}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] ml-1 hover:bg-amber-400 shadow"
          >
            Open Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      
      {/* Background Frame simulating phone screen overlay */}
      <div className="relative w-full max-w-sm rounded-[36px] bg-slate-900 border-4 border-slate-700 p-1 shadow-2xl shadow-emerald-950/80">
        
        {/* Phone Notch */}
        <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Outer Phone Mock Context */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-[28px] p-4 text-slate-100 relative overflow-hidden">
          
          {/* Header Bar with NO X BUTTON - SNOOZE BUTTON INSTEAD */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
            <span className="flex items-center gap-1 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Android Floating Overlay
            </span>
            
            {/* Snooze 2 Min Button */}
            <button
              type="button"
              onClick={handleSnooze}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold transition-all"
              title="Snooze popup for 2 minutes"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Snooze (2 min)</span>
            </button>
          </div>

          {/* MULTI-STEP FLOATING OVERLAY POPUP CARD */}
          <div className="glass-panel p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/90 relative min-h-[310px] flex flex-col justify-between">
            
            {/* Header / Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wide border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  UPI Payment Detected
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Step {step} of 2</span>
              </div>

              {/* Progress Indicator Dots */}
              <div className="flex gap-1.5 mb-4">
                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-emerald-400' : 'bg-slate-800'}`}></div>
                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-emerald-400' : 'bg-slate-800'}`}></div>
              </div>
            </div>

            {/* Saved State */}
            {isSaved ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn my-auto">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-white">Saved & Real-Time Synced!</div>
                <p className="text-xs text-slate-400">Updating Web Dashboard & DB...</p>
              </div>
            ) : step === 1 ? (
              
              /* STEP 1: PAYMENT DETAILS */
              <form onSubmit={handleNextStep} className="space-y-3 text-xs animate-fadeIn flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Vendor Name */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Payment Name / Vendor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Starbucks / Chai Stall"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-emerald-400 text-base">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-emerald-400 font-extrabold text-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Note (Optional) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Meeting coffee with team"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all mt-4"
                >
                  <span>Next: Select Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

            ) : (

              /* STEP 2: CATEGORY SELECT ONLY */
              <div className="space-y-3 text-xs animate-fadeIn flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  
                  {/* Category Dropdown + Add Category Option */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase">Category</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                        className="text-[10px] font-semibold text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    {isAddingNewCat ? (
                      <div className="flex gap-1.5 p-2 bg-slate-950 rounded-xl border border-emerald-500/40">
                        <input
                          type="text"
                          placeholder="New category name..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCatSubmit}
                          className="px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-medium text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-white">{vendor}</span>
                      <div className="text-[10px] text-slate-400">{selectedCategory} • Auto UPI</div>
                    </div>
                    <span className="font-extrabold text-emerald-400 text-sm">₹{amount}</span>
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Add Transaction & Sync</span>
                  </button>
                </div>

              </div>

            )}

          </div>

          <div className="text-[10px] text-center text-slate-500 mt-3 font-mono">
            Snoozing releases screen backdrop • Menu button stays 100% active
          </div>

        </div>

      </div>

    </div>
  );
}
