# Database Design Document

## Database Engine

PostgreSQL 16+

Architecture:
Multi-Tenant

Isolation:
Organization Based

---

## organizations

Purpose:
Tenant Management

Fields:

id UUID PK

name VARCHAR(255)

slug VARCHAR(255)

subscription_plan VARCHAR(50)

status VARCHAR(50)

created_at TIMESTAMP

updated_at TIMESTAMP

---

## users

Purpose:
Application Users

Fields:

id UUID PK

organization_id UUID FK

name VARCHAR(255)

email VARCHAR(255)

role VARCHAR(50)

is_active BOOLEAN

created_at TIMESTAMP

updated_at TIMESTAMP

---

## leads

Purpose:
Lead Management (maps to `crm_Leads` in Prisma schema)

Fields:

id UUID PK

organization_id UUID FK

assigned_to UUID FK

source_id UUID FK

name VARCHAR(255)

email VARCHAR(255)

phone VARCHAR(50)

company VARCHAR(255)

status VARCHAR(50)

lead_score INTEGER

notes TEXT

created_at TIMESTAMP

updated_at TIMESTAMP

---

## lead_comments

Purpose:
Internal Notes

Fields:

id UUID PK

lead_id UUID FK

user_id UUID FK

comment TEXT

created_at TIMESTAMP

---

## activities

Purpose:
Audit Trail (maps to `crm_Activities` in Prisma schema)

Fields:

id UUID PK

lead_id UUID FK

user_id UUID FK

activity_type VARCHAR(100)

metadata JSONB

created_at TIMESTAMP

---

## lead_sources

Purpose:
Lead Origin Tracking (maps to `crm_Lead_Sources` in Prisma schema)

Fields:

id UUID PK

organization_id UUID FK

name VARCHAR(255)

type VARCHAR(50)

created_at TIMESTAMP

---

## assignments

Purpose:
Lead Distribution (maps to `LeadAssignment` in Prisma schema)

Fields:

id UUID PK

lead_id UUID FK

assigned_to UUID FK

assigned_by UUID FK

created_at TIMESTAMP

---

## followups

Purpose:
Task Management (maps to `Followup` in Prisma schema)

Fields:

id UUID PK

lead_id UUID FK

assigned_user UUID FK

followup_date TIMESTAMP

status VARCHAR(50)

created_at TIMESTAMP

---

## webhook_logs

Purpose:
Webhook Auditing (maps to `WebhookLog` in Prisma schema)

Fields:

id UUID PK

source VARCHAR(100)

payload JSONB

status VARCHAR(50)

created_at TIMESTAMP

---

## Relationships

organizations
│
├── users
├── leads
├── lead_sources
└── settings

leads
│
├── comments
├── activities
├── assignments
└── followups

---

## Indexes

users(email)

leads(phone)

leads(email)

leads(status)

activities(created_at)

webhook_logs(created_at)

---

## Expected Scale

Organizations:
10,000+

Users:
100,000+

Leads:
100 Million+

Activities:
500 Million+
