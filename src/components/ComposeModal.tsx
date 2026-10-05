import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Send, AlertCircle, CheckCircle2, Clock, Gauge, Calendar, Sparkles, HelpCircle, Users } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    recipients: string[];
    subject: string;
    body: string;
    startTime?: string;
    delayBetweenEmailsSeconds: number;
    hourlyLimit: number;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [subject, setSubject] = useState('Quick question regarding cold outreach at Acme Corp');
  const [body, setBody] = useState(
    'Hi {{name}},\n\nI noticed your team is actively expanding sales outreach. ReachInbox offers zero-cron delayed queue mechanics with automatic sliding rate-limits and crash-proof persistence.\n\nWould you have 10 minutes next Tuesday for a quick walkthrough?\n\nBest regards,\nAlex Morgan'
  );
  const [manualRecipients, setManualRecipients] = useState('sarah.connor@cyberdyne.io, thomas.shelby@peaky.co.uk');
  const [csvRecipients, setCsvRecipients] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Configuration settings
  const [startTime, setStartTime] = useState<string>('');
  const [delaySeconds, setDelaySeconds] = useState<number>(2);
  const [hourlyLimit, setHourlyLimit] = useState<number>(5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/[\r\n]+/);
      const parsedEmails: string[] = [];

      for (const line of lines) {
        const cells = line.split(/[,;\t]/);
        for (const cell of cells) {
          const trimmed = cell.trim().replace(/^["']|["']$/g, '');
          if (emailRegex.test(trimmed)) {
            parsedEmails.push(trimmed);
          }
        }
      }

      const unique = Array.from(new Set(parsedEmails));
      setCsvRecipients(unique);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    const samples = [
      'sarah.connor@cyberdyne.io',
      'john.anderson@matrix.corp',
      'thomas.shelby@peaky.co.uk',
      'bruce.wayne@wayne-enterprises.com',
      'tony.stark@starkindustries.com',
      'ellen.ripley@weyland-yutani.com',
    ];
    setCsvRecipients(samples);
    setCsvFileName('sample_sales_leads.csv');
  };

  const manualList = manualRecipients
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => emailRegex.test(e));

  const totalValidRecipients = Array.from(new Set([...manualList, ...csvRecipients]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalValidRecipients.length === 0) {
      alert('Please provide at least one valid recipient email address.');
      return;
    }

    await onSubmit({
      recipients: totalValidRecipients,
      subject,
      body,
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      delayBetweenEmailsSeconds: delaySeconds,
      hourlyLimit,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b101b] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Send className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Compose & Schedule Outreach</h2>
              <p className="text-xs text-slate-400">Zero-cron delayed queue engine with per-email throttling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4.5">
          {/* CSV Lead Parser & Upload Zone */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Audience & CSV Lead Import</span>
              </label>

              <button
                type="button"
                onClick={handleLoadSampleCSV}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span>+ Load 6 Sample Leads</span>
              </button>
            </div>

            {/* Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-3.5 text-center cursor-pointer transition bg-slate-900/30 hover:bg-slate-900/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-300">
                {csvFileName ? (
                  <span className="text-indigo-300 font-semibold">Attached: {csvFileName}</span>
                ) : (
                  'Drop CSV lead list here, or click to browse'
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Extracts emails, cleans whitespace & deduplicates</p>
            </div>

            {/* Valid Leads Counter Pill */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Or type manual recipients:</span>
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full font-semibold text-xs ${
                  totalValidRecipients.length > 0
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>{totalValidRecipients.length} Valid Leads Found</span>
              </span>
            </div>

            <textarea
              rows={2}
              value={manualRecipients}
              onChange={(e) => setManualRecipients(e.target.value)}
              placeholder="Comma separated emails (e.g. alex@acme.com, sarah@stripe.com)"
              className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-200">Email Template Body</label>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                <span>Variables:</span>
                <span className="font-mono text-indigo-400 bg-slate-900 px-1 rounded">{`{{name}}`}</span>
                <span className="font-mono text-indigo-400 bg-slate-900 px-1 rounded">{`{{company}}`}</span>
              </div>
            </div>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Throttling & Rate Limit Configurations */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Delivery Throttling & Throttler Engine</span>
              <span className="text-[11px] text-indigo-400 font-medium">Zero-Cron Delayed Mechanics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Time */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-indigo-400" />
                  <span>Start Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Leave empty to start now</span>
              </div>

              {/* Provider Delay */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  <span>Provider Delay (sec)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Stagger between emails</span>
              </div>

              {/* Hourly Limit */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                  <Gauge className="h-3 w-3 text-indigo-400" />
                  <span>Max Emails / Hour</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Reschedules + Slack alert</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalValidRecipients.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Pushing to Delayed Queue...' : `Schedule ${totalValidRecipients.length} Outreach Emails`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
