import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, XCircle, Search, MailCheck, Calendar, Eye, ArrowRight } from 'lucide-react';
import { EmailJob } from '../types';
import { format } from 'date-fns';

interface SentTabProps {
  jobs: EmailJob[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onOpenCompose: () => void;
}

export const SentTab: React.FC<SentTabProps> = ({
  jobs,
  isLoading,
  onSearch,
  onOpenCompose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  /**
   * Status Colors Mapping:
   * Sent   -> Green
   * Failed -> Red
   */
  const renderStatusBadge = (status: EmailJob['status']) => {
    if (status === 'SENT') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Sent</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
        <XCircle className="h-3.5 w-3.5 text-red-400" />
        <span>Failed</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Elasticsearch Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Search sent emails (Elasticsearch multi-match query)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <MailCheck className="h-4 w-4 text-emerald-400" />
          <span>Total Dispatched: <strong className="text-white font-bold">{jobs.length}</strong></span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-slate-800">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <MailCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Dispatched Emails in Outbox</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            When your scheduled outreach jobs are executed by the worker engine, they will appear in this table along with real Ethereal email preview links.
          </p>
          <button
            onClick={onOpenCompose}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition cursor-pointer"
          >
            <span>Compose & Send First Outreach</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* SENT EMAILS TABLE (Explicit Columns: Email | Subject | Sent Time | Status | Preview Link) */}
      {!isLoading && jobs.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Email (Recipient)</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Sent Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Preview Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {jobs.map((job) => {
                  const isSent = job.status === 'SENT';
                  const sentDate = job.sentAt ? new Date(job.sentAt) : new Date(job.updatedAt);

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-900/50 transition-colors duration-150"
                    >
                      {/* Column 1: Email */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-7 w-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300 uppercase">
                            {job.recipient.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{job.recipient}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {job.idempotencyKey.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Subject */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{job.subject}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{job.body}</div>
                      </td>

                      {/* Column 3: Sent Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{format(sentDate, 'MMM d, h:mm:ss a')}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Delivered via Ethereal SMTP
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderStatusBadge(job.status)}
                        {!isSent && job.errorMessage && (
                          <div className="text-[10px] text-red-400 mt-1 max-w-xs leading-tight">
                            {job.errorMessage}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Ethereal Preview Button */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {job.etherealPreviewUrl ? (
                          <a
                            href={job.etherealPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 font-semibold text-xs shadow-sm transition transform active:scale-95 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            <span>View Email Preview</span>
                            <ExternalLink className="h-3 w-3 text-indigo-400" />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-xs italic">No preview URL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
