# OrvixCRM

<p align="center">
  <strong>AI-powered CRM platform built on Next.js</strong><br/>
  Capture, distribute, and manage leads across multiple channels while enabling teams to collaborate and track sales performance.
</p>

<p align="center">
  <a href="https://github.com/rahul200618/orvixcrm/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/rahul200618/orvixcrm">
  </a>
</p>

---

## About OrvixCRM

OrvixCRM is an open-source, AI-powered CRM platform that solves the core problem businesses face with leads:

- **Leads are lost** — centralize everything in one place
- **Uneven distribution** — automated round-robin, weighted, and team-based assignment
- **No accountability** — full audit trail, activity logs, and performance dashboards
- **Poor reporting** — real-time KPIs, conversion funnels, and employee analytics

Built with **Next.js 16**, **React 19**, **TypeScript**, **PostgreSQL** (Prisma 7), **Supabase Auth**, and **shadcn/ui**.

---

## Features

### Lead Management
- Multi-channel lead capture (Website, Meta Lead Ads, Google Lead Forms, WhatsApp, API, CSV)
- Automatic lead assignment (Round Robin, Weighted, Team-based, Manual)
- Full lead lifecycle tracking (New → Contacted → Interested → Proposal → Negotiation → Won/Lost)
- Duplicate detection and merge

### CRM Core
- Accounts, Contacts, Opportunities, Contracts
- Activities (calls, emails, meetings, notes, tasks)
- Comments & internal notes with @mentions
- Follow-up scheduling with reminders
- Document storage

### Team & Organization
- Multi-role access (Super Admin, Org Admin, Manager, Sales Executive)
- Multi-organization support
- Employee performance tracking
- Audit logs & change history

### AI & Automation
- AI-powered lead enrichment (E2B sandboxed browser agent)
- Semantic search across all CRM records
- MCP server for AI agent access (127 tools)
- Inngest background job queue

### Reporting & Dashboards
- Lead KPI dashboard (Total, Active, Converted, Lost)
- Lead response time tracking
- Conversion rate analytics
- Sales funnel visualization
- Employee leaderboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Supabase Auth |
| Database | PostgreSQL 17+ with pgvector |
| ORM | Prisma 7 |
| UI | Tailwind CSS v4, shadcn/ui |
| Background Jobs | Inngest |
| AI | OpenAI, Anthropic Claude |
| File Storage | S3-compatible (DigitalOcean Spaces / Supabase Storage) |
| Email | Resend + React Email |
| Package Manager | pnpm |

---

## Installation

### Prerequisites

- Node.js >= 22.12.0
- pnpm >= 9.0.0
- PostgreSQL 17+ with pgvector extension
- Supabase project

### Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/rahul200618/orvixcrm.git
   cd orvixcrm
   ```

2. **Install dependencies**
   ```sh
   pnpm install
   ```

3. **Configure environment variables**
   ```sh
   cp .env.example .env
   ```

   Required variables:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/orvixcrm?schema=public"
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Initialize database**
   ```sh
   pnpm prisma generate
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

5. **Run development server**
   ```sh
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Docker Installation

```sh
git clone https://github.com/rahul200618/orvixcrm.git
cd orvixcrm
cp .env.docker .env
# Edit .env — set ADMIN_EMAIL and Supabase credentials
docker compose up -d
```

---

## Webhook Endpoints

OrvixCRM provides webhook endpoints for multi-channel lead capture:

| Endpoint | Source |
|----------|--------|
| `POST /api/webhooks/meta` | Meta Lead Ads |
| `POST /api/webhooks/google` | Google Lead Forms |
| `POST /api/webhooks/website` | Website Forms |
| `POST /api/webhooks/whatsapp` | WhatsApp Business |
| `POST /api/webhooks/custom` | Custom Sources |

---

## MCP Server (AI Agent Access)

OrvixCRM ships with a built-in MCP server for AI agent access:

```json
{
  "mcpServers": {
    "orvixcrm": {
      "type": "http",
      "url": "https://your-orvixcrm.com/api/mcp/mcp",
      "headers": { "Authorization": "Bearer your_token_here" }
    }
  }
}
```

---

## License

Licensed under the [MIT license](LICENSE).

Copyright (c) 2026 rahul200618
