import React, { useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, Trash2, Calendar, Search, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EmailJob } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

interface ScheduledTabProps {
  jobs: EmailJob[];
  isLoading: boolean;
  onCancelJob: (id: string) => void;
  onSearch: (query: string) => void;
  onOpenCompose: () => void;
}

export const ScheduledTab: React.FC<ScheduledTabProps> = ({
  jobs,
  isLoading,
  onCancelJob,
  onSearch,
  onOpenCompose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SCHEDULED' | 'RESCHEDULED'>('ALL');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterType === 'SCHEDULED') return j.status === 'SCHEDULED' || j.status === 'PROCESSING';
    if (filterType === 'RESCHEDULED') return j.status === 'RESCHEDULED';
    return true;
  });

  const scheduledCount = jobs.filter((j) => j.status === 'SCHEDULED' || j.status === 'PROCESSING').length;
  const rateLimitCount = jobs.filter((j) => j.status === 'RESCHEDULED').length;

  /**
   * Status Colors Mapping according to Assignment Specifications:
   * Scheduled  -> Blue
   * Sending    -> Yellow
   * Rate Limit -> Orange
   */
  const renderStatusBadge = (status: EmailJob['status']) => {
    if (status === 'SCHEDULED') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          <span>Scheduled</span>
        </span>
      );
    }
    if (status === 'PROCESSING') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 animate-pulse">
          <Clock className="h-3 w-3 animate-spin" />
          <span>Sending</span>
        </span>
      );
    }
    if (status === 'RESCHEDULED') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <RefreshCw className="h-3 w-3 text-amber-400" />
          <span>Rate Limit (Delayed)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Sub-Filters Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Elasticsearch Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Search scheduled emails (Elasticsearch multi-match query)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({jobs.length})
          </button>

          <button
            onClick={() => setFilterType('SCHEDULED')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'SCHEDULED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>

          <button
            onClick={() => setFilterType('RESCHEDULED')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'RESCHEDULED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Rate-Limited ({rateLimitCount})
          </button>
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
      {!isLoading && filteredJobs.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-slate-800">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Scheduled Emails in Queue</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            All delayed jobs have executed and moved to the Sent Deliveries table, or no jobs are currently scheduled.
          </p>
          <button
            onClick={onOpenCompose}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition cursor-pointer"
          >
            <span>Compose & Schedule Outreach</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* SCHEDULED EMAILS TABLE (Explicit Columns: Email | Subject | Scheduled Time | Status | Actions) */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Email (Recipient)</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Scheduled Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredJobs.map((job) => {
                  const scheduledDate = new Date(job.scheduledAt);
                  const isRescheduled = job.status === 'RESCHEDULED';

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-900/50 transition-colors duration-150"
                    >
                      {/* Column 1: Email */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-7 w-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase">
                            {job.recipient.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{job.recipient}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Key: {job.idempotencyKey.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Subject */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{job.subject}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{job.body}</div>
                      </td>

                      {/* Column 3: Scheduled Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{format(scheduledDate, 'MMM d, h:mm:ss a')}</span>
                        </div>
                        <div className="text-[11px] text-indigo-400 mt-0.5">
                          in {formatDistanceToNow(scheduledDate)}
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderStatusBadge(job.status)}
                        {isRescheduled && (
                          <div className="text-[10px] text-amber-400/90 mt-1 max-w-xs leading-tight">
                            Hourly limit exceeded (Auto-delayed)
                          </div>
                        )}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onCancelJob(job.id)}
                          title="Cancel and drop from queue"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="text-xs">Cancel</span>
                        </button>
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
