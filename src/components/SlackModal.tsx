import React, { useState } from 'react';
import { X, Slack, CheckCircle2, AlertCircle, Send, ExternalLink, ShieldAlert } from 'lucide-react';
import { SlackStatus } from '../types';

interface SlackModalProps {
  isOpen: boolean;
  onClose: () => void;
  status?: SlackStatus;
  onSaveWebhook: (url: string, channel: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const SlackModal: React.FC<SlackModalProps> = ({
  isOpen,
  onClose,
  status,
  onSaveWebhook,
  onDisconnect,
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [channel, setChannel] = useState('#reachinbox-alerts');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSaveWebhook(webhookUrl, channel);
      setSuccessMessage('Slack Webhook connected and verified!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to connect Slack webhook');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0b101b] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 ring-1 ring-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#E01E5A]/15 text-[#E01E5A] flex items-center justify-center border border-[#E01E5A]/30">
              <Slack className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Slack OAuth & Rate-Limit Alerts</h2>
              <p className="text-xs text-slate-400">Receive instant Slack notifications when sender hourly limits trigger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current status display */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Slack Connection Status:</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  status?.isConnected ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-600'
                }`}
              />
              <span className="text-sm font-bold text-slate-200">
                {status?.isConnected ? `Connected to ${status.channel || '#reachinbox-alerts'}` : 'Not Connected'}
              </span>
            </div>
          </div>

          {status?.isConnected && (
            <button
              onClick={onDisconnect}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Live Preview of Slack Alert */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-2">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>Preview of Alert Sent to Slack:</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1d21] border-l-4 border-amber-500 text-xs font-sans text-slate-200 space-y-1">
            <div className="font-bold text-white flex items-center space-x-1">
              <span>🚨 ReachInbox Rate Limit Alert: Hourly Limit Reached</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Sender <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">outreach@reachinbox.ai</code> sent 5/5 emails this hour window.
            </p>
            <p className="text-[11px] text-slate-400">
              ⚡ Action: Automatically delayed and rescheduled to start of next hour. Zero emails dropped.
            </p>
          </div>
        </div>

        {/* Webhook form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incoming Webhook URL</label>
            <input
              type="url"
              required
              placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Channel</label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/25"
            >
              <Send className="h-3 w-3" />
              <span>{isSaving ? 'Verifying...' : 'Save & Test Ping'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
