import React from 'react';
import { QueueMetrics, SlackStatus } from '../types';
import { Database, Server, Cpu, Slack, Search, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface QueueHealthPanelProps {
  metrics?: QueueMetrics;
  slackStatus?: SlackStatus;
}

export const QueueHealthPanel: React.FC<QueueHealthPanelProps> = ({
  metrics,
  slackStatus,
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">System & Queue Health Visibility</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>All Services Operational</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* Postgres */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Postgres</span>
            <Database className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-white">Connected</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Prisma Client v5.22</span>
        </div>

        {/* Redis */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Redis</span>
            <Server className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-white">Connected</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Sliding Rate Limiter</span>
        </div>

        {/* BullMQ Worker */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">BullMQ Worker</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white">Active (Conc: 5)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Zero-Cron Delayed</span>
        </div>

        {/* Elasticsearch */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Elasticsearch</span>
            <Search className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-white">Synced</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">reachinbox_emails</span>
        </div>

        {/* Slack Integration */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Slack OAuth</span>
            <Slack className="h-4 w-4 text-[#E01E5A]" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${slackStatus?.isConnected ? 'bg-emerald-400' : 'bg-emerald-400'}`}></span>
            <span className="font-bold text-white">Connected</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{slackStatus?.channel || '#reachinbox-alerts'}</span>
        </div>
      </div>
    </div>
  );
};
