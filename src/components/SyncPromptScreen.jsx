import React, { useState } from 'react';
import { Key, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { registerVaultSessionInCloud } from '../lib/supabase';

export default function SyncPromptScreen({ onPairCode, onUseDemo }) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleInputChange = (e) => {
    let raw = e.target.value.toUpperCase();
    if (errorMsg) setErrorMsg('');

    // Strip non-alphanumeric characters
    let cleaned = raw.replace(/[^A-Z0-9]/g, '');

    // Strip leading "SP" if present
    if (cleaned.startsWith('SP')) {
      cleaned = cleaned.substring(2);
    }

    // Retain only digits (up to 6 max)
    cleaned = cleaned.replace(/\D/g, '').slice(0, 6);

    if (cleaned.length > 0) {
      setInputCode(`SP-${cleaned}`);
    } else {
      setInputCode('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const raw = inputCode.trim();

    if (!raw) {
      setErrorMsg('Please enter your phone\'s 6-digit Vault Code.');
      return;
    }

    let cleaned = raw.toUpperCase().replace(/[^0-9]/g, '');

    // Validate exactly 6-digit numeric Vault Code
    if (cleaned.length !== 6) {
      setErrorMsg('Invalid Vault Code! Please enter all 6 numeric digits displayed in your Auto Track phone app.');
      return;
    }

    const formattedCode = `SP-${cleaned}`;
    setIsSyncing(true);
    
    // Sync session to Supabase database
    await registerVaultSessionInCloud(formattedCode, 'Syed Anas');
    setIsSyncing(false);
    
    onPairCode(formattedCode);
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
            No password needed. Type the 6-digit code shown in your phone app.
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
            <span>Locate your <strong>🔑 6-Digit Web Vault Sync Code</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
            <span>Type the digits below — <strong>SP-</strong> is added automatically!</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pairing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Phone's Web Sync Code</label>
            <input
              type="text"
              required
              maxLength={9}
              placeholder="e.g. SP-623440"
              value={inputCode}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white uppercase tracking-widest font-mono text-center font-bold text-xl focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600 shadow-inner"
            />
            <p className="text-[11px] text-slate-500 text-center mt-1">
              Simply type your 6 digits (e.g. <span className="font-mono text-emerald-400">623440</span>)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSyncing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Cloud Vault...</span>
              </>
            ) : (
              <>
                <span>Unlock My Financial Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Action */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={onUseDemo}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            Don't have the phone app yet? <span className="underline">Explore Demo Mode (SP-894201)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
