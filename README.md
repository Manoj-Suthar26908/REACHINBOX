# 🚀 ReachInbox Scheduler

A production-grade, zero-cron email scheduling web application designed for cold outreach and high-throughput pipelines. Built with **Node.js/TypeScript**, **BullMQ**, **Redis**, **PostgreSQL (Prisma ORM)**, **Elasticsearch**, **Nodemailer (Ethereal)**, and **React (Vite + Tailwind CSS)**.

---

## 🌟 Key Architecture & Capabilities

### 1. Zero-Cron Scheduling & Idempotency
- **No Cron Dependencies**: Scheduling uses pure delayed job mechanisms (`delay = targetTimestamp - Date.now()`).
- **Persistence First**: Every email job is committed to the database with status `SCHEDULED` and a distinct UUID `idempotency_key` **before** pushing to the queue.
- **Deduplication Across Restarts**: The job's idempotency key is passed directly as BullMQ's `jobId`. Even if the application restarts or crashes, duplicate jobs are never created.
- **Worker Boot Reconciliation**: On startup, a reconciliation service scans the database for any pending `SCHEDULED` or `RESCHEDULED` jobs and re-enqueues them with calculated delays.

### 2. Provider Throttling & Sliding-Window Rate Limiting
- **Per-Email Delay**: Sequential staggered delivery (e.g. 2–5 seconds) between sends per sender to mimic human behavior and avoid provider flagging.
- **Hourly Sliding Window**: Enforces `MAX_EMAILS_PER_HOUR_PER_SENDER` via atomic counter keys (`rate_limit:{senderId}:{hourWindow}`).
- **Zero-Loss Rescheduling**: When a sender hits the hourly limit:
  1. The job is **not dropped** or failed.
  2. The system computes the time remaining until the next hour window (`nextHourTimestamp - now`).
  3. The job is updated to `RESCHEDULED` and delayed until the start of the next hour window.
  4. A rich Slack notification is automatically dispatched to the user's workspace.

### 3. Nodemailer & Ethereal Test Accounts
- Automatically creates and caches ethereal test SMTP credentials.
- Dispatches emails with HTML formatting.
- Automatically generates live preview URLs (`https://ethereal.email/message/...`) viewable directly in the dashboard.

### 4. Search & Analytics via Elasticsearch
- Dual-writes email documents (`reachinbox_emails` index) across status changes (`SCHEDULED`, `PROCESSING`, `SENT`, `FAILED`, `RESCHEDULED`).
- Exposes `GET /api/emails/search?q={query}&status={status}` with fuzzy `multi_match` queries across `recipient`, `subject`, `body_preview`, and `sender`.

### 5. Bull-Board Queue Visibility
- Real-time BullMQ monitoring mounted at `http://localhost:4000/admin/queues`.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Backend** | Node.js, Express.js, TypeScript (`strict: true`) |
| **Queue Engine** | BullMQ + Redis 7 (ioredis) |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Search Engine** | Elasticsearch 8 |
| **Email Transport** | Nodemailer (Ethereal test accounts) |
| **Integrations** | Google OAuth 2.0 & Slack Incoming Webhooks |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, Axios |

---

## ⚡ Quickstart

### Mode A: Zero-Dependency Standalone / Demo Mode (Instant Run)

You can run the full system immediately without starting Docker:

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs at `http://localhost:4000` (API, Bull-Board at `/admin/queues`).*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs at `http://localhost:3000` (Vite dev server).*

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

### Mode B: Full Production Docker Stack

1. **Spin up Infrastructure**:
   ```bash
   docker compose up -d
   ```
   *Starts PostgreSQL (`5432`), Redis (`6379`), and Elasticsearch (`9200`).*

2. **Run Prisma Migrations**:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

3. **Start Applications**:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

---

## 📡 Key API Endpoints

- `POST /api/emails/schedule` — Batch schedule emails with per-email provider delay and hourly limit.
- `GET /api/emails/scheduled` — List upcoming delayed and rescheduled emails.
- `GET /api/emails/sent` — List sent emails with live Ethereal preview URLs.
- `GET /api/emails/search?q={query}` — Multi-match Elasticsearch query.
- `POST /api/emails/:id/cancel` — Cancel and remove delayed job from queue.
- `POST /api/emails/reset-rate-limit` — Reset hourly sender counter for testing.
- `GET /api/admin/queue-stats` — Live queue metrics (delayed, sent, processing).
- `GET /admin/queues` — Bull-Board Queue Dashboard.


-- Architecture--
- User
 │
 ▼
React Frontend
 │
 ▼
Express / Node API
 │
 ├── PostgreSQL
 │
 ├── Elasticsearch
 │
 ├── Redis
 │
 ▼
BullMQ Queue
 │
 ▼
Worker
 │
 ▼
Email Delivery
 │
 ▼
Slack Notifications explain
