import React, { useState } from 'react';
import { X, Key, QrCode, Smartphone, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';

export default function VaultModal({ isOpen, onClose, vaultCode, onChangeVaultCode, onGenerateNewCode }) {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(vaultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = (e) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-700/80 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Device Vault Sync</h3>
              <p className="text-xs text-slate-400">Pair your Android Phone to Web without accounts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Vault Display */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-5 text-center relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium mb-1">Your Active Vault Code</div>
          <div className="text-3xl font-extrabold text-white tracking-widest font-mono mb-3 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {vaultCode}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={onGenerateNewCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Code</span>
            </button>
          </div>
        </div>

        {/* QR Code / Instructions */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300">
            <Smartphone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Connecting a New Android Phone:</span>
              Open your Android App settings and enter code <strong className="text-emerald-400">{vaultCode}</strong>. Your transactions will instantly stream to this web dashboard!
            </div>
          </div>
        </div>

        {/* Connect to another existing Vault Code */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Connect to an existing Vault Code from another device
          </button>
        ) : (
          <form onSubmit={handleConnect} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300">Enter Vault Code from your Phone</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SP-894201"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950"
              >
                Sync
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
