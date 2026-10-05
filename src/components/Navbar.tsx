import React, { useState } from 'react';
import { Mail, Slack, Activity, Send, ExternalLink, RotateCcw, Zap, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import { User, QueueMetrics, SlackStatus } from '../types';

interface NavbarProps {
  user: User | null;
  metrics?: QueueMetrics;
  slackStatus?: SlackStatus;
  onOpenSlackModal: () => void;
  onOpenComposeModal: () => void;
  onResetRateLimit: () => void;
  isResettingLimit: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  metrics,
  slackStatus,
  onOpenSlackModal,
  onOpenComposeModal,
  onResetRateLimit,
  isResettingLimit,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Workspace */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/15">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">ReachInbox</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                PRO SCHEDULER
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Zero-Cron Delayed Engine</span>
              </span>
              <span>•</span>
              <span className="hidden sm:inline text-slate-500">v1.0 Production</span>
            </div>
          </div>
        </div>

        {/* Center Live Counters & Tools */}
        <div className="hidden lg:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            <span className="text-slate-400">Scheduled:</span>
            <span className="font-bold text-blue-400">{metrics?.scheduled ?? 0}</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Sent:</span>
            <span className="font-bold text-emerald-400">{metrics?.sent ?? 0}</span>
          </div>

          <button
            onClick={onResetRateLimit}
            disabled={isResettingLimit}
            title="Reset hourly counter for test senders"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition text-xs font-medium cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResettingLimit ? 'animate-spin' : ''}`} />
            <span>Reset Counter</span>
          </button>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center space-x-3">
          {/* BullMQ Monitor Link */}
          <a
            href="http://localhost:4000/admin/queues"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition text-xs font-medium"
          >
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>BullMQ Monitor</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </a>

          {/* Slack Integration Status */}
          <button
            onClick={onOpenSlackModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              slackStatus?.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
            }`}
          >
            <Slack className="h-3.5 w-3.5 text-[#E01E5A]" />
            <span className="hidden sm:inline">
              {slackStatus?.isConnected ? 'Slack Connected' : 'Connect Slack'}
            </span>
            {slackStatus?.isConnected && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* Schedule Email Action */}
          <button
            onClick={onOpenComposeModal}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Compose Email</span>
          </button>

          {/* Google OAuth User Profile (Avatar + Name + Email + Logout) */}
          <div className="relative pl-3 border-l border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name || 'User'}
                  className="h-9 w-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              </div>

              {/* Name & Email Display */}
              <div className="hidden md:flex flex-col text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white tracking-tight leading-none">
                    {user?.name || 'Alex Morgan'}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    Google Auth
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono leading-tight mt-0.5">
                  {user?.email || 'alex.morgan@reachinbox.ai'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Sign out of ReachInbox"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
