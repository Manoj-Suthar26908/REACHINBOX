export interface EmailJob {
  id: string;
  idempotencyKey: string;
  tenantId: string;
  userId: string;
  senderAccountId: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RESCHEDULED';
  scheduledAt: string;
  sentAt?: string | null;
  failedAt?: string | null;
  etherealPreviewUrl?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  batchId?: string | null;
  metadata?: {
    delayBetweenEmailsSeconds?: number;
    senderEmail?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  tenantId: string;
}

export interface QueueMetrics {
  total: number;
  scheduled: number;
  processing: number;
  sent: number;
  failed: number;
  activeTimers: number;
}

export interface SlackStatus {
  isConnected: boolean;
  teamName: string | null;
  channel: string | null;
  webhookConfigured: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RATE_LIMIT' | 'SLACK' | 'RESCHEDULED';
  message: string;
  timestamp: string;
  metadata?: any;
}
