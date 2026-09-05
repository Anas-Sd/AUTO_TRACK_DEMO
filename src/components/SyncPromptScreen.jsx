import React, { useState } from 'react';
import { Key, Smartphone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SyncPromptScreen({ onPairCode, onUseDemo }) {
  const [inputCode, setInputCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      let formatted = inputCode.trim().toUpperCase();
      if (!formatted.startsWith('SP-') && /^\d{6}$/.test(formatted)) {
        formatted = `SP-${formatted}`;
      }
      onPairCode(formatted);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Glowing aura background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/60 mx-auto mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Key className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            Connect Your Mobile Vault
          </h1>
          <p className="text-xs text-slate-400">
            No signup or password required. Pair with your phone's unique sync code.
          </p>
        </div>

        {/* Steps Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
            <span>Open <strong>Auto Track APK</strong> on your Android phone.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
            <span>Go to <strong>Settings</strong> &rarr; <strong>Web Sync Category</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
            <span>Enter the 6-digit code shown in your phone below.</span>
          </div>
        </div>

        {/* Pairing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Phone's Web Sync Code</label>
            <input
              type="text"
              required
              placeholder="e.g. SP-755019"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white uppercase tracking-widest font-mono text-center font-bold text-lg focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Unlock My Financial Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Mode Action */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={onUseDemo}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            Don't have the phone app yet? <span className="underline">Explore Demo Mode</span>
          </button>
        </div>

      </div>
    </div>
  );
}
