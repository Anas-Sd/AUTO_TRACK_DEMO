import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, Check, RefreshCw, Smartphone, ShieldCheck, Database, Building2, CheckCircle2 } from 'lucide-react';

export default function SettingsManager({
  vaultCode,
  onChangeVaultCode,
  onGenerateNewCode,
  onResetData,
  transactionCount,
  categoryCount,
  userName = "Anas"
}) {
  const [showVaultCode, setShowVaultCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Auto-hide vault code after 5 seconds for privacy
  useEffect(() => {
    let timer;
    if (showVaultCode) {
      timer = setTimeout(() => {
        setShowVaultCode(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showVaultCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(vaultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePairExisting = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      let formatted = inputCode.trim().toUpperCase();
      if (!formatted.startsWith('SP-') && /^\d{6}$/.test(formatted)) {
        formatted = `SP-${formatted}`;
      }
      onChangeVaultCode(formatted);
      setIsEditing(false);
      setInputCode('');
    }
  };

  const maskedVaultCode = vaultCode ? `${vaultCode.slice(0, 3)}••••••` : 'SP-••••••';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-xl font-bold text-white">System Settings & Device Sync</h2>
            <p className="text-[10px] sm:text-xs text-slate-400">Manage your private Web Sync Vault Code and local storage</p>
          </div>
        </div>
      </div>

      {/* PRIVACY-FIRST VAULT SESSION CARD (Vault Code is NEVER printed on UI screens) */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-xl relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Private Vault Session
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                End-to-End Encrypted Financial Stream
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero-Knowledge Privacy
          </span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 rounded-xl sm:rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Vault Owner Identity</div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">{userName}'s Private Vault</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Security Standard</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">SMS One-Time Delivered</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] sm:text-xs text-slate-400 leading-relaxed">
            🔒 For your privacy and security, your 6-digit Vault Code is delivered strictly via SMS during mobile onboarding. It is never rendered on website screens or accessible via browser tools.
          </div>
        </div>

      </div>

      {/* STORAGE & DATA MANAGEMENT */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Data & Local Storage</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 sm:mb-5">
          <div className="bg-slate-950/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800">
            <div className="text-[9px] text-slate-500 font-semibold uppercase">Total Transactions</div>
            <div className="text-base sm:text-xl font-extrabold text-white mt-0.5">{transactionCount}</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800">
            <div className="text-[9px] text-slate-500 font-semibold uppercase">Active Categories</div>
            <div className="text-base sm:text-xl font-extrabold text-white mt-0.5">{categoryCount}</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[9px] text-slate-500 font-semibold uppercase">Storage Type</div>
            <div className="text-[10px] sm:text-xs font-bold text-emerald-400 mt-1">Local & Cloud Sync</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div>
            <div className="text-[11px] sm:text-xs font-bold text-rose-300">Reset Demo Data</div>
            <div className="text-[9px] sm:text-[10px] text-rose-400/80">Restore initial sample transactions</div>
          </div>
          <button
            onClick={onResetData}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] sm:text-xs shadow-md transition-colors"
          >
            Reset
          </button>
        </div>

      </div>

    </div>
  );
}
