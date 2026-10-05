import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { ScheduledTab } from './components/ScheduledTab';
import { SentTab } from './components/SentTab';
import { ComposeForm } from './components/ComposeForm';
import { ComposeModal } from './components/ComposeModal';
import { SlackModal } from './components/SlackModal';
import { QueueHealthPanel } from './components/QueueHealthPanel';
import { RecentActivityPanel } from './components/RecentActivityPanel';
import { emailApi, slackApi, authApi } from './services/api';
import { Clock, CheckCircle2, Activity, Sparkles, ShieldCheck, Zap, PenSquare, ArrowUpRight, Search } from 'lucide-react';

export function App() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent' | 'compose' | 'activity'>('scheduled');
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isSlackOpen, setIsSlackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // User Profile (Google OAuth)
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
  });

  // Live Queue Metrics (Polls every 3s)
  const { data: metrics } = useQuery({
    queryKey: ['queueMetrics'],
    queryFn: emailApi.getQueueMetrics,
    refetchInterval: 3000,
  });

  // Live Activity Stream (Polls every 3s)
  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: emailApi.getActivities,
    refetchInterval: 3000,
  });

  // Slack Status
  const { data: slackStatus } = useQuery({
    queryKey: ['slackStatus'],
    queryFn: slackApi.getStatus,
  });

  // Scheduled Emails Table
  const { data: scheduledEmails = [], isLoading: isScheduledLoading } = useQuery({
    queryKey: ['scheduledEmails', searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        const res = await emailApi.search(searchQuery, 'SCHEDULED');
        return res.emails;
      }
      return emailApi.getScheduled();
    },
    refetchInterval: 3000,
  });

  // Sent Emails Table
  const { data: sentEmails = [], isLoading: isSentLoading } = useQuery({
    queryKey: ['sentEmails', searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        const res = await emailApi.search(searchQuery, 'SENT');
        return res.emails;
      }
      return emailApi.getSent();
    },
    refetchInterval: 3000,
  });

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: emailApi.scheduleBatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast(`🎉 Scheduled batch of ${data.count} emails in delayed queue!`);
      setActiveTab('scheduled');
    },
    onError: (err: any) => {
      alert(`Error scheduling: ${err.response?.data?.error?.message || err.message}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: emailApi.cancelJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Job cancelled and removed from delayed queue.');
    },
  });

  const resetLimitMutation = useMutation({
    mutationFn: emailApi.resetRateLimit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Rate limit counter reset for sender.');
    },
  });

  const handleSaveSlackWebhook = async (url: string, channel: string) => {
    await slackApi.saveWebhook(url, channel);
    queryClient.invalidateQueries({ queryKey: ['slackStatus'] });
    queryClient.invalidateQueries({ queryKey: ['activities'] });
    showToast('Slack webhook connected!');
  };

  const handleDisconnectSlack = async () => {
    await slackApi.disconnect();
    queryClient.invalidateQueries({ queryKey: ['slackStatus'] });
    showToast('Slack disconnected.');
  };

  const handleLogout = () => {
    showToast('Logged out of Google account (Demo Session ended).');
  };

  const rescheduledCount = scheduledEmails.filter((j) => j.status === 'RESCHEDULED').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 bg-grid-pattern selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/40 text-xs font-semibold animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar with Google OAuth Info (Avatar, Name, Email, Logout) */}
      <Navbar
        user={user || null}
        metrics={metrics}
        slackStatus={slackStatus}
        onOpenSlackModal={() => setIsSlackOpen(true)}
        onOpenComposeModal={() => setIsComposeModalOpen(true)}
        onResetRateLimit={() => resetLimitMutation.mutate()}
        isResettingLimit={resetLimitMutation.isPending}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Delayed Queue */}
          <div className="glass-panel p-4.5 rounded-2xl border-slate-800/80 hover:border-blue-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Scheduled Queue</span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">{metrics?.scheduled ?? scheduledEmails.length}</span>
              <span className="text-xs font-medium text-blue-400">delayed jobs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Status: Blue (Zero-Cron)</p>
          </div>

          {/* Card 2: Sent */}
          <div className="glass-panel p-4.5 rounded-2xl border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Sent Deliveries</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">{metrics?.sent ?? sentEmails.length}</span>
              <span className="text-xs font-medium text-emerald-400">100% delivered</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Status: Green (Ethereal Previews)</p>
          </div>

          {/* Card 3: Rate-Limit Shield */}
          <div className="glass-panel p-4.5 rounded-2xl border-slate-800/80 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Rate Limit Shield</span>
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">{rescheduledCount}</span>
              <span className="text-xs font-medium text-amber-400">auto-delayed</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Status: Orange (Sliding Window)</p>
          </div>

          {/* Card 4: Queue Health */}
          <div className="glass-panel p-4.5 rounded-2xl border-slate-800/80 hover:border-violet-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Queue Diagnostics</span>
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-sm font-bold text-white tracking-tight">Active</span>
              <span className="text-xs font-medium text-violet-400">2s cooldown stagger</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">BullMQ Worker (5 Concurrency)</p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="glass-panel p-2.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {/* Tab 1: Scheduled Emails Table */}
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'scheduled'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>1. Scheduled Emails ({metrics?.scheduled ?? scheduledEmails.length})</span>
            </button>

            {/* Tab 2: Sent Emails Table */}
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>2. Sent Emails ({metrics?.sent ?? sentEmails.length})</span>
            </button>

            {/* Tab 3: Compose Email Form */}
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'compose'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <PenSquare className="h-3.5 w-3.5" />
              <span>3. Compose Outreach Form</span>
            </button>

            {/* Tab 4: Activity & Health */}
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>4. Live Activity & Health</span>
            </button>
          </div>

          {/* Quick Compose Trigger Button */}
          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer shrink-0"
          >
            <PenSquare className="h-3.5 w-3.5" />
            <span>Open Compose Modal</span>
          </button>
        </div>

        {/* Tab 1: Scheduled Emails Table */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <ScheduledTab
              jobs={scheduledEmails}
              isLoading={isScheduledLoading}
              onCancelJob={(id) => cancelMutation.mutate(id)}
              onSearch={(q) => setSearchQuery(q)}
              onOpenCompose={() => setActiveTab('compose')}
            />
            {/* Health & Activity below table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QueueHealthPanel metrics={metrics} slackStatus={slackStatus} />
              <RecentActivityPanel activities={activities} isLoading={isActivitiesLoading} />
            </div>
          </div>
        )}

        {/* Tab 2: Sent Emails Table */}
        {activeTab === 'sent' && (
          <div className="space-y-6">
            <SentTab
              jobs={sentEmails}
              isLoading={isSentLoading}
              onSearch={(q) => setSearchQuery(q)}
              onOpenCompose={() => setActiveTab('compose')}
            />
            {/* Health & Activity below table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QueueHealthPanel metrics={metrics} slackStatus={slackStatus} />
              <RecentActivityPanel activities={activities} isLoading={isActivitiesLoading} />
            </div>
          </div>
        )}

        {/* Tab 3: Dedicated Compose Form */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            <ComposeForm
              onSubmit={async (payload) => {
                await scheduleMutation.mutateAsync(payload);
              }}
              isSubmitting={scheduleMutation.isPending}
            />
            <QueueHealthPanel metrics={metrics} slackStatus={slackStatus} />
          </div>
        )}

        {/* Tab 4: Live Activity & Queue Health */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <QueueHealthPanel metrics={metrics} slackStatus={slackStatus} />
            <RecentActivityPanel activities={activities} isLoading={isActivitiesLoading} />
          </div>
        )}
      </main>

      {/* Compose & Schedule Modal (Alternative Quick Trigger) */}
      <ComposeModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onSubmit={async (payload) => {
          await scheduleMutation.mutateAsync(payload);
        }}
        isSubmitting={scheduleMutation.isPending}
      />

      {/* Slack Integration Modal */}
      <SlackModal
        isOpen={isSlackOpen}
        onClose={() => setIsSlackOpen(false)}
        status={slackStatus}
        onSaveWebhook={handleSaveSlackWebhook}
        onDisconnect={handleDisconnectSlack}
      />
    </div>
  );
}
export default App;
