# Neon Migration Audit

## Executive Summary
This document provides an exhaustive, code-level reality audit of the **Trading OS Business Automation Engine** prior to executing the migration to **Neon PostgreSQL** as the sole production source of truth. 

The previous development milestone successfully established domain schemas, scoring heuristics, prompt templates, Fastify API endpoints, and Vitest test suites. However, runtime persistence currently relies on an in-memory fallback store (`memory-store.ts`), and external services (`Apollo`, `Gemini`, `Instantly`) operate with development mock fallbacks when API keys are unconfigured.

This audit establishes the exact baseline reality of every system component, identifies what will be reused, what must be replaced, outlines production risks, and defines the phased migration plan to lock the Neon PostgreSQL architecture.

---

## Current Architecture
The current codebase is structured as a modular TypeScript Node.js monorepo:
- **`packages/shared`**: Domain types, enums, Zod validation schemas, environment variable parser.
- **`packages/logging`**: Structured Pino logger with credential redaction.
- **`packages/database`**: Supabase JS client with `memory-store.ts` in-memory fallback.
- **`packages/scoring`**: Deterministic keyword scanner and weighted composite scoring algorithm.
- **`packages/gemini`**: `@google/generative-ai` wrapper with mock response generator for dummy keys.
- **`packages/apollo`**: REST client with rate limiting and mock data generator.
- **`packages/instantly`**: REST client with mock campaign generator.
- **`workers/`**: 7 worker scripts and an orchestrator runner.
- **`apps/api/`**: Fastify REST API server.
- **`apps/dashboard/`**: Static HTML5/JS dashboard interface.

---

## Database Reality
- **Status:** `IN_MEMORY` (with `PLACEHOLDER` Supabase driver)
- **Current Connection:** Uses `@supabase/supabase-js` attempting connection to `dummy.supabase.co`. When connection fails or credentials match placeholders, all database operations divert to `memoryStore` in RAM.
- **Persistence:** Process-bound. Any restart of the application completely wipes all leads, research dossiers, AI scoring results, outreach drafts, and audit events.
- **PostgreSQL / Neon Driver:** Currently NOT installed (`pg` and `@types/pg` are absent).
- **Target Reality:** Direct connection to Neon PostgreSQL via standard `DATABASE_URL` connection pool with SSL enforcement and schema migrations.

---

## memory-store.ts Analysis
- **Status:** `IN_MEMORY`
- **Analysis:** `packages/database/src/memory-store.ts` contains full in-memory Map collections (`leads`, `research`, `aiAnalysis`, `outreach`, `replies`, `events`, `campaigns`).
- **Production Risk:** If silently used in production, customer acquisition data will vanish on server restart or worker container lifecycle events.
- **Required Action:** Decouple production runtime from `memory-store.ts`. Production mode (`APP_ENV=production` or presence of `DATABASE_URL`) must strictly require a valid Neon PostgreSQL connection and fail explicitly if unreachable. `memory-store.ts` will be retained strictly for offline unit tests in `APP_ENV=test`.

---

## Repository Analysis
- **`LeadsRepository`**: `IN_MEMORY` (diverts to `memoryStore` when `isUsingMemoryStore()` is true; Supabase branch exists but is unverified against Neon).
- **`ResearchRepository`**: `IN_MEMORY` (stores research dossiers in memory).
- **`AIAnalysisRepository`**: `IN_MEMORY` (stores scoring breakdown in memory).
- **`OutreachRepository`**: `IN_MEMORY` (stores email drafts and approval state in memory).
- **`RepliesRepository`**: `IN_MEMORY` (stores inbound replies in memory).
- **`EventsRepository`**: `IN_MEMORY` (appends audit records to in-memory array).
- **`CampaignsRepository`**: `IN_MEMORY` (initializes one hardcoded mock campaign in memory).
- **Required Action:** Replace Supabase JS client and in-memory branch with a production PostgreSQL connection pool (`pg.Pool`) executing parameterized SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) with strict Neon SSL support.

---

## Pipeline Analysis
- **Status:** `REAL` (Logic & Orchestration) / `IN_MEMORY` (Data Persistence) / `MOCK` (External APIs)
- **Current Flow:** `orchestrator.ts` sequentially invokes `lead-discovery` $\rightarrow$ `lead-research` $\rightarrow$ `lead-scoring` $\rightarrow$ `outreach-generation` $\rightarrow$ `analytics`.
- **Safety Violation:** The previous orchestrator included an `autoApproveHighPriority` flag that could invoke `instantly-sync`.
- **Required Action:** Enforce strict pipeline cutoff at `PENDING_APPROVAL`. The pipeline MUST halt immediately after storing generated outreach in `PENDING_APPROVAL` status. Auto-send and continuous daemon modes must be permanently removed/disabled for production safety.

---

## Apollo Integration Status
- **Status:** `MOCK`
- **Implementation:** `packages/apollo/src/client.ts` contains real HTTP fetch logic against `https://api.apollo.io/v1/mixed_people/search`. However, when `APOLLO_API_KEY` is missing or default, it falls back to `getMockResults()` returning 4 hardcoded sample prospects.
- **Verification:** Not verified against live Apollo API credentials yet.
- **Required Action:** Make mock mode explicit via `MOCK_APOLLO=true|false`. If `MOCK_APOLLO=false` and `APOLLO_API_KEY` is missing in production, fail explicitly.

---

## Gemini Integration Status
- **Status:** `MOCK`
- **Implementation:** `packages/gemini/src/client.ts` contains real `@google/generative-ai` SDK invocation. However, when `GEMINI_API_KEY` is missing or default, it intercepts execution and returns deterministic mock JSON objects for all 6 prompt modules.
- **Verification:** Not verified against live Google Gemini API network calls.
- **Required Action:** Make mock mode explicit via `MOCK_GEMINI=true|false`. In production mode, require valid `GEMINI_API_KEY`.

---

## Instantly Integration Status
- **Status:** `MOCK`
- **Implementation:** `packages/instantly/src/client.ts` contains real HTTP fetch logic against `https://api.instantly.ai/api/v2/campaigns`. When `INSTANTLY_API_KEY` is missing or default, it returns simulated campaign IDs and success payloads.
- **Verification:** Not verified against live Instantly API credentials.
- **Required Action:** Keep outbound execution locked behind mandatory Human Approval. Under no circumstances should automated jobs send emails without explicit manual user approval in the dashboard.

---

## Dashboard Integration Status
- **Status:** `PLACEHOLDER`
- **Implementation:** `apps/dashboard/app.js` and `index.html` contain static mock arrays (`mockLeads`, `mockPendingApprovals`, `mockReplies`) hardcoded in JavaScript. Although Fastify API endpoints exist (`/api/leads`, `/api/outreach/pending`), the dashboard frontend does not fetch from them dynamically.
- **Required Action:** Connect dashboard frontend to real `/api/*` endpoints with live async fetching, error handling, and private API key/token protection.

---

## What Can Be Reused
1. **Domain Types & Schemas (`packages/shared`):** 100% reusable (`Lead`, `ResearchRecord`, `AIAnalysisResult`, `OutreachRecord`, `ReplyRecord`, `Zod` schemas).
2. **Deterministic & Composite Scoring Engine (`packages/scoring`):** 100% reusable (deterministic keyword rules, mathematical weighting formula).
3. **Prompt Engineering Registry (`prompts/`):** 100% reusable (all 6 versioned prompts with anti-hallucination and brevity constraints).
4. **Structured Logger (`packages/logging`):** 100% reusable (Pino logger with correlation tracking and credential redactions).
5. **Fastify Server Architecture (`apps/api`):** Reusable REST routes (`leads`, `outreach`, `replies`, `analytics`, `webhooks`).
6. **SQL Schema DDL (`database/migrations/001_initial_schema.sql`):** Fully compatible with Neon PostgreSQL.

---

## What Must Be Replaced
1. **Database Client (`packages/database/src/client.ts`):** Replace `@supabase/supabase-js` with a PostgreSQL connection pool (`pg`) connecting directly to Neon via `DATABASE_URL`.
2. **Repository Implementations (`packages/database/src/repositories/*`):** Rewrite repositories to execute parameterized SQL statements against Neon PostgreSQL.
3. **Silent In-Memory Fallbacks:** Eliminate silent branching to `memory-store.ts`. Production must fail clearly if `DATABASE_URL` is unavailable.
4. **Pipeline Orchestrator (`workers/orchestrator.ts`):** Strip auto-approval/auto-send branches and enforce the strict stop condition at `PENDING_APPROVAL`.
5. **Dashboard Frontend (`apps/dashboard/app.js`):** Replace hardcoded static arrays with live REST API integration.
6. **Environment Configuration (`packages/shared/src/config/env.ts`):** Add `DATABASE_URL`, `APP_ENV`, `MOCK_APOLLO`, `MOCK_GEMINI`, `MOCK_INSTANTLY`.

---

## Production Risks
1. **Silent Fallback Data Loss:** If a service silently falls back to memory, leads and approval actions will disappear on container restart.
2. **Accidental Live Outreach:** Automated daemon execution could accidentally email real prospects without review.
3. **Unvalidated SQL Injections:** If raw strings are concatenated instead of parameterized queries, database security is compromised.
4. **Credential Exposure:** If `DATABASE_URL` or API keys are exposed to the client-side dashboard, security is breached.

---

## Migration Plan

### Step 1: Install PostgreSQL Driver & Update Configuration
- Install `pg` and `@types/pg`.
- Update `packages/shared/src/config/env.ts` to validate `DATABASE_URL` and `APP_ENV` (`production` | `development` | `test`).

### Step 2: Implement Neon PostgreSQL Client & Migration Runner
- Create `packages/database/src/pool.ts` managing `pg.Pool` with SSL configuration.
- Adapt `database/migrate.ts` to execute `database/migrations/001_initial_schema.sql` idempotently against Neon.

### Step 3: Implement Production PostgreSQL Repositories
- Refactor all 7 repository classes (`LeadsRepository`, `ResearchRepository`, `AIAnalysisRepository`, `OutreachRepository`, `RepliesRepository`, `EventsRepository`, `CampaignsRepository`) with parameterized SQL queries.

### Step 4: Lock Pipeline Safety & Approval Workflow
- Update `workers/orchestrator.ts` to strictly stop at `PENDING_APPROVAL`.
- Ensure backend route `POST /api/outreach/:id/approve` is the only transition to `APPROVED`.
- Enforce that `instantly-sync` rejects any outreach that is not strictly `status = 'APPROVED'`.

### Step 5: Connect Private Dashboard to Real API
- Update `apps/dashboard/app.js` to fetch real data from `/api/leads`, `/api/outreach/pending`, `/api/replies/actionable`, and `/api/analytics/funnel`.

### Step 6: Automated Testing & Verification
- Test Neon database connection and migration execution.
- Run unit and integration test suite (`tests/unit/`, `tests/integration/`).
- Verify production isolation (missing `DATABASE_URL` in production fails explicitly).
