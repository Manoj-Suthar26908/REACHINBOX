import React, { useState, useRef } from 'react';
import { Upload, FileText, Send, CheckCircle2, Clock, Gauge, Calendar, Sparkles, Users } from 'lucide-react';

interface ComposeFormProps {
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

export const ComposeForm: React.FC<ComposeFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [subject, setSubject] = useState('Quick question regarding cold outreach at Acme Corp');
  const [body, setBody] = useState(
    'Hi {{name}},\n\nI noticed your team is actively scaling cold email outreach. ReachInbox Scheduler features zero-cron delayed queue mechanics, atomic hourly rate limits, and live crash-recovery persistence.\n\nWould you have 10 minutes next Tuesday for a quick walkthrough?\n\nBest regards,\nAlex Morgan'
  );
  const [manualRecipients, setManualRecipients] = useState('sarah.connor@cyberdyne.io, thomas.shelby@peaky.co.uk');
  const [csvRecipients, setCsvRecipients] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Configuration settings
  const [startTime, setStartTime] = useState<string>('');
  const [delaySeconds, setDelaySeconds] = useState<number>(2);
  const [hourlyLimit, setHourlyLimit] = useState<number>(5);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl">
      <div className="pb-4 mb-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Compose & Schedule Cold Outreach</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-cron delayed queue engine with configurable delay and sliding-window rate limit
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <span>Zero-Cron Delayed</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FIELD 1: CSV Upload & Audience Validation */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <span>3. CSV Upload (Lead List Parser)</span>
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

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/30 hover:bg-slate-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-5 w-5 text-indigo-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-300">
              {csvFileName ? (
                <span className="text-indigo-300 font-semibold">Attached File: {csvFileName}</span>
              ) : (
                'Drop CSV file here, or click to browse'
              )}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Client-side parser validates email formats and counts leads</p>
          </div>

          {/* Validation badge */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Or enter manual email recipients below:</span>
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold text-xs ${
                totalValidRecipients.length > 0
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
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

        {/* FIELD 2: Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">1. Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* FIELD 3: Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-200">2. Body</label>
            <div className="flex items-center space-x-1 text-[11px] text-slate-500">
              <span>Personalization:</span>
              <span className="font-mono text-indigo-400 bg-slate-900 px-1 rounded">{`{{name}}`}</span>
              <span className="font-mono text-indigo-400 bg-slate-900 px-1 rounded">{`{{company}}`}</span>
            </div>
          </div>
          <textarea
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* FIELDS 4, 5, 6: Start Time, Delay Between Emails, Hourly Limit */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Rate Limiter & Schedule Parameters</span>
            <span className="text-[11px] text-indigo-400 font-medium">Sliding Window Protection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* FIELD 4: Start Time */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-indigo-400" />
                <span>4. Start Time</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Leave blank to start immediately</span>
            </div>

            {/* FIELD 5: Delay Between Emails */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Clock className="h-3 w-3 text-indigo-400" />
                <span>5. Delay Between Emails (sec)</span>
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Sequential stagger cooldown</span>
            </div>

            {/* FIELD 6: Hourly Limit */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Gauge className="h-3 w-3 text-indigo-400" />
                <span>6. Hourly Limit (Max / Hr)</span>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Reschedules + Slack notification</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || totalValidRecipients.length === 0}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Enqueuing Delayed Jobs...' : `Schedule ${totalValidRecipients.length} Outreach Emails`}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
