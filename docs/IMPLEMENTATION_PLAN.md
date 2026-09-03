# Implementation Plan — Trading OS Business Automation Engine

## 1. Overview & Phased Roadmap

This roadmap outlines the systematic, phase-by-phase implementation of the **Trading OS Business Automation & Growth Engine**. Each phase includes clear objectives, implementation tasks, data contracts, and verification gates.

```mermaid
gantt
    title Trading OS Business Automation Engine — Phased Delivery
    dateFormat  YYYY-MM-DD
    section Core Infrastructure
    Phase 1: Foundation, Types & Config          :active, p1, 2026-09-02, 2d
    Phase 2: Supabase Schema & Repositories      :p2, after p1, 2d
    section AI & Lead Ingestion
    Phase 3: Gemini AI Intelligence Modules       :p3, after p2, 3d
    Phase 4: Apollo Discovery & Normalization    :p4, after p3, 2d
    Phase 5: Qualification & Scoring Pipeline    :p5, after p4, 2d
    section Delivery & UI
    Phase 6: Human Approval Dashboard            :p6, after p5, 3d
    Phase 7: Instantly Outbound Execution        :p7, after p6, 2d
    section Intelligence & Analytics
    Phase 8: Webhook & Reply Intelligence        :p8, after p7, 2d
    Phase 9: Funnel Analytics & Audit Reporting  :p9, after p8, 2d
    Phase 10: Production Hardening & CI/CD       :p10, after p9, 2d
```

---

## 2. Phase Breakdown

### Phase 1 — Foundation, Project Setup & Shared Core
- **Objective:** Establish modular monorepo structure, TypeScript configuration, environment validation, structured Pino logging, and shared domain models.
- **Deliverables:**
  - `package.json` with workspace configuration and scripts (`build`, `test`, `lint`, `worker:*`).
  - `tsconfig.json` with strict type checking and ESM path aliases.
  - `packages/shared/`: Type definitions for `Lead`, `ResearchRecord`, `AIAnalysis`, `OutreachDraft`, `ReplyClassification`, and event enums.
  - `packages/logging/`: Structured JSON logger with correlation ID tracking.
  - Configuration validator with Zod checking for all required environment variables (`.env`).
  - Baseline test framework with Vitest.
- **Verification Gate:** `npm run build` succeeds with zero type errors; `npm test` passes baseline test suite.

---

### Phase 2 — Supabase Relational Schema & Repositories
- **Objective:** Implement PostgreSQL migrations, row-level security (RLS), triggers, and TypeScript repository classes.
- **Deliverables:**
  - `database/migrations/001_initial_schema.sql`: DDL for `campaigns`, `leads`, `research`, `ai_analysis`, `outreach`, `replies`, `events`, `webhooks`.
  - Composite unique indexes on `leads(email)` and `leads(source, source_id)`.
  - `packages/database/`:
    - `SupabaseClientFactory`: Configured Supabase client with connection pooling and service role access.
    - Repositories: `LeadsRepository`, `ResearchRepository`, `AIAnalysisRepository`, `OutreachRepository`, `RepliesRepository`, `EventsRepository`.
  - `database/seed/dev_seed.ts`: Realistic sample leads across all 4 ICPs for development.
- **Verification Gate:** Migrations execute idempotently; CRUD integration tests verify constraint enforcement and query performance.

---

### Phase 3 — Gemini AI Intelligence Modules
- **Objective:** Build robust Google Gemini client wrapper and prompt pipelines with strict Zod schema validation and anti-hallucination guardrails.
- **Deliverables:**
  - `packages/gemini/`:
    - `GeminiClient`: Rate limiter, exponential backoff, cost/token awareness, schema validator.
  - `prompts/`:
    - `lead-analyzer/v1.ts`: ICP qualification prompt.
    - `researcher/v1.ts`: Public evidence extraction with fact/inference/unknown classification.
    - `pain-point-detector/v1.ts`: Trading OS specific pain point identification.
    - `personalization/v1.ts`: Contextual, non-flattering icebreakers.
    - `outreach/v1.ts`: Concise (<100 words), low-pressure cold email generator.
    - `reply-intelligence/v1.ts`: 10-state intent classifier.
  - Unit tests verifying that malformed LLM responses trigger retry/repair mechanisms.
- **Verification Gate:** All 6 prompts produce deterministic, validated JSON output on mock prospect profiles.

---

### Phase 4 — Apollo Lead Discovery & Normalization
- **Objective:** Build dedicated Apollo REST client with rate limiting, pagination, query builder, and normalization into standard `Lead` records.
- **Deliverables:**
  - `packages/apollo/`:
    - `ApolloClient`: API integration for `/v1/mixed_people/search`.
    - `ApolloNormalizer`: Transforms Apollo raw payloads into typed `Lead` schemas.
    - Leaky-bucket rate limiter with automatic pause on HTTP 429.
  - `workers/lead-discovery/`:
    - Ingests candidates matching ICP queries (job titles: Quant Trader, Pine Script Developer, Algorithmic Strategist).
    - Checks duplicate `source_id` and `email` against database before insertion.
- **Verification Gate:** Apollo search correctly imports and deduplicates 20 test prospects without duplicate inserts.

---

### Phase 5 — Qualification & Scoring Pipeline
- **Objective:** Construct the automated pipeline connecting Discovery $\rightarrow$ Research $\rightarrow$ Scoring $\rightarrow$ Qualification.
- **Deliverables:**
  - `packages/scoring/`:
    - Deterministic scoring rules (keyword weights, seniority, firmographic sizing).
    - Composite formula combining deterministic rules + Gemini AI breakdown.
  - `workers/lead-research/`: Executes factual research tasks and persists to `research` table.
  - `workers/lead-scoring/`: Calculates scores, assigns priority (`HIGH_PRIORITY`, `QUALIFIED`, `REVIEW`, `REJECTED`), and records audit events.
- **Verification Gate:** Pipeline accurately filters out non-ICP candidates (e.g. manual retail scalpers) and promotes high-conviction quant candidates.

---

### Phase 6 — Human-in-the-Loop (HITL) Dashboard & Outreach Approval
- **Objective:** Build internal operator dashboard allowing human review, inline copy editing, one-click approval, and regeneration of outreach drafts.
- **Deliverables:**
  - `apps/api/`: REST endpoints for lead listings, detail views, score breakdowns, and approval actions (`POST /api/leads/:id/approve`, `POST /api/leads/:id/reject`, `POST /api/leads/:id/regenerate`).
  - `apps/dashboard/`:
    - **Leads Table:** Sortable by score, ICP segment, priority, status.
    - **Lead Detail View:** Factual evidence timeline, pain points, score breakdown.
    - **Outreach Approval Portal:** Side-by-side view of lead research, generated email draft, inline markdown/text editor, and approval buttons.
- **Verification Gate:** User can view generated emails, make edits, and transition status to `APPROVED`.

---

### Phase 7 — Instantly Cold Outreach Execution
- **Objective:** Integrate Instantly v2 API to push approved leads into campaigns, sync custom variables, and verify opt-out safety.
- **Deliverables:**
  - `packages/instantly/`:
    - `InstantlyClient`: Methods to list campaigns, add leads to campaign, update lead status, and pause contacts.
  - `workers/instantly-sync/`:
    - Polls for `status = APPROVED` outreach records.
    - Pushes leads to Instantly with personalized subject, body, and custom fields.
    - Updates local outreach status to `SENT` with `sent_at` timestamp.
- **Verification Gate:** Approved lead is synchronized with Instantly campaign with all custom personalization variables populated.

---

### Phase 8 — Webhook Receiver & Reply Intelligence
- **Objective:** Implement secure webhook ingestion for Instantly reply events, automated classification via Gemini, and human alerting.
- **Deliverables:**
  - `apps/api/src/routes/webhooks.ts`:
    - Ingests Instantly event webhooks (`reply_received`, `email_bounced`, `unsubscribed`).
    - Validates HMAC signature and deduplicates incoming webhook events.
  - `workers/reply-analysis/`:
    - Feeds reply content to `Gemini Reply Intelligence v1`.
    - Classifies intent (`INTERESTED`, `QUESTION`, `NOT_NOW`, `UNSUBSCRIBE`, etc.).
    - Immediate opt-out execution if `UNSUBSCRIBE` is detected (`opted_out = true`).
    - Generates suggested response draft for human review.
- **Verification Gate:** Simulated replies (interested, objection, unsubscribe) are classified accurately; unsubscribe immediately disables future outreach.

---

### Phase 9 — Funnel Analytics & Reporting Engine
- **Objective:** Aggregate metrics across all stages (Discovery $\rightarrow$ Qualification $\rightarrow$ Sent $\rightarrow$ Replied $\rightarrow$ Converted).
- **Deliverables:**
  - `workers/analytics/`: Computes hourly/daily aggregate snapshots.
  - API endpoints returning:
    - Qualification conversion rates per ICP.
    - Reply rates and positive sentiment breakdown.
    - AI scoring confidence distribution and prompt accuracy.
    - Lead source ROI comparison.
  - Dashboard analytics view with interactive KPI cards and conversion funnels.
- **Verification Gate:** Dashboard displays accurate metrics matching raw database counts.

---

### Phase 10 — Production Hardening & Deployment
- **Objective:** Complete end-to-end integration tests, rate limiting, error monitoring, scheduled cron jobs, and deployment guides.
- **Deliverables:**
  - Independent worker runners deployable to serverless/container runtimes (Railway, Fly.io, Render, Vercel).
  - Cron scheduler for periodic discovery and sync tasks.
  - Full test suite passing with unit and integration test coverage.
  - Operational runbook and deployment documentation.
- **Verification Gate:** Automated test suite passes 100%; system runs uninterrupted with full structured logging and zero secret leakage.

---

## 3. Immediate Next Step (Phase 1 Execution)

Upon approval, Phase 1 will execute immediately:
1. Initialize root TypeScript monorepo environment (`package.json`, `tsconfig.json`).
2. Implement shared domain interfaces and schemas (`packages/shared`).
3. Implement structured JSON logger (`packages/logging`).
4. Implement environment validation configuration (`.env.example`, `.env.local` handler).
5. Implement initial PostgreSQL migration script (`database/migrations/001_initial_schema.sql`).
6. Set up Vitest test suite and verify build integrity.
