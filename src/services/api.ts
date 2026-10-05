import axios from 'axios';
import { EmailJob, User, QueueMetrics, SlackStatus, ActivityItem } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const emailApi = {
  getScheduled: async (): Promise<EmailJob[]> => {
    const res = await api.get('/emails/scheduled');
    return res.data.data;
  },

  getSent: async (): Promise<EmailJob[]> => {
    const res = await api.get('/emails/sent');
    return res.data.data;
  },

  search: async (q: string, status?: string): Promise<{ total: number; emails: EmailJob[] }> => {
    const res = await api.get('/emails/search', {
      params: { q, status },
    });
    return res.data.data;
  },

  scheduleBatch: async (payload: {
    recipients: string[];
    subject: string;
    body: string;
    startTime?: string;
    delayBetweenEmailsSeconds: number;
    hourlyLimit: number;
  }) => {
    const res = await api.post('/emails/schedule', payload);
    return res.data.data;
  },

  cancelJob: async (id: string) => {
    const res = await api.post(`/emails/${id}/cancel`);
    return res.data;
  },

  resetRateLimit: async () => {
    const res = await api.post('/emails/reset-rate-limit');
    return res.data;
  },

  getQueueMetrics: async (): Promise<QueueMetrics> => {
    const res = await api.get('/admin/queue-stats');
    return res.data.data;
  },

  getActivities: async (): Promise<ActivityItem[]> => {
    const res = await api.get('/emails/activities');
    return res.data.data;
  },
};

export const slackApi = {
  getStatus: async (): Promise<SlackStatus> => {
    const res = await api.get('/slack/status');
    return res.data.data;
  },

  saveWebhook: async (webhookUrl: string, channel: string) => {
    const res = await api.post('/slack/webhook', { webhookUrl, channel });
    return res.data;
  },

  disconnect: async () => {
    const res = await api.post('/slack/disconnect');
    return res.data;
  },
};

export const authApi = {
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
