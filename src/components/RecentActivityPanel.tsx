import React from 'react';
import { ActivityItem } from '../types';
import { Clock, Send, ShieldAlert, Slack, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface RecentActivityPanelProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  activities,
  isLoading,
}) => {
  const getEventIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'SENT':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'RATE_LIMIT':
        return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case 'SLACK':
        return <Slack className="h-4 w-4 text-[#E01E5A]" />;
      case 'RESCHEDULED':
        return <RefreshCw className="h-4 w-4 text-amber-400" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'SCHEDULED':
      default:
        return <Send className="h-4 w-4 text-blue-400" />;
    }
  };

  const getEventBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'SENT':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">SENT</span>;
      case 'RATE_LIMIT':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">RATE LIMIT</span>;
      case 'SLACK':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E01E5A]/15 text-[#E01E5A] border border-[#E01E5A]/30">SLACK ALERT</span>;
      case 'RESCHEDULED':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">RESCHEDULED</span>;
      case 'PROCESSING':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">PROCESSING</span>;
      case 'FAILED':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">FAILED</span>;
      case 'SCHEDULED':
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">QUEUED</span>;
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Live Activity Stream</h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Real-Time Event Journal</span>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-10 rounded-xl bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && activities.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-500">
          No activity logs recorded yet.
        </div>
      )}

      {!isLoading && activities.length > 0 && (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {activities.map((act) => {
            let timeStr = '';
            try {
              timeStr = format(new Date(act.timestamp), 'h:mm:ss a');
            } catch (_) {
              timeStr = 'Just now';
            }

            return (
              <div
                key={act.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition text-xs"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="shrink-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getEventIcon(act.type)}
                  </div>
                  <div className="truncate">
                    <span className="text-slate-200 font-medium">{act.message}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pl-3">
                  {getEventBadge(act.type)}
                  <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
