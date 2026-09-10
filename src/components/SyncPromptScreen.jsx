import React, { useState } from 'react';
import { Key, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { verifyVaultSessionInCloud, registerVaultSessionInCloud } from '../lib/supabase';

export default function SyncPromptScreen({ onPairCode, onUseDemo }) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleInputChange = (e) => {
    if (errorMsg) setErrorMsg('');
    let raw = e.target.value.toUpperCase();

    // Remove any non-alphanumeric characters (keep max 8 total)
    let clean = raw.replace(/[^A-Z0-9]/g, '').slice(0, 8);

    const isBackspace = e.nativeEvent && e.nativeEvent.inputType === 'deleteContentBackward';

    if (clean.length > 2) {
      setInputCode(`${clean.slice(0, 2)}-${clean.slice(2)}`);
    } else if (clean.length === 2) {
      if (isBackspace) {
        // On backspace at hyphen boundary, show 2 characters cleanly
        setInputCode(clean);
      } else {
        // Right as 2nd character is typed, immediately append hyphen!
        setInputCode(`${clean}-`);
      }
    } else {
      setInputCode(clean);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const raw = inputCode.trim();

    const clean = raw.replace(/[^A-Z0-9]/g, '');

    if (clean.length !== 8) {
      setErrorMsg('Invalid Code length! Code must contain exactly 8 total characters (e.g. SP-623440).');
      return;
    }

    const formattedCode = `${clean.slice(0, 2)}-${clean.slice(2)}`;
    setIsSyncing(true);

    // Strict Database Check: Only vault codes existing in vault_sessions database are allowed!
    const { exists } = await verifyVaultSessionInCloud(formattedCode);

    if (!exists && formattedCode !== 'SP-894201') {
      setIsSyncing(false);
      setErrorMsg(`Vault Code "${formattedCode}" was not found in the database! Please open your Auto Track mobile app to register your vault first.`);
      return;
    }

    // If demo code or registered code, register/update session and unlock dashboard
    if (formattedCode === 'SP-894201') {
      await registerVaultSessionInCloud('SP-894201', 'Demo User');
    }

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
            Enter your registered Vault Code to access your private encrypted ledger.
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
            <span>Locate your <strong>🔑 8-Character Vault Code</strong> (e.g. SP-623440).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
            <span>Type 2 characters ➔ <strong>hyphen appears on 2nd input!</strong></span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Pairing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Registered Web Vault Code</label>
            <input
              type="text"
              required
              maxLength={9}
              placeholder="e.g. SP-623440"
              value={inputCode}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white uppercase tracking-widest font-mono text-center font-bold text-xl focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600 shadow-inner"
            />
            <p className="text-[11px] text-slate-500 text-center mt-1.5">
              Format: <span className="font-mono text-emerald-400 font-bold">2 Inputs</span> + <span className="font-mono text-slate-400">-</span> + <span className="font-mono text-emerald-400 font-bold">6 Inputs</span> (Total 8 characters)
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
                <span>Verifying Database Vault...</span>
              </>
            ) : (
              <>
                <span>Verify & Unlock Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Action */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={() => {
              setInputCode('SP-894201');
              onUseDemo();
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            Don't have the phone app yet? <span className="underline">Explore Demo Mode (SP-894201)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
