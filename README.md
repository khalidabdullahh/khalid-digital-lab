# 🧪 Khalid Abdullah — Personal Digital Lab & Engineering Innovation Hub

A modern, interactive, dark-first personal digital engineering laboratory, cross-project architecture showcase, and living product ecosystem representing:

$$\text{Learning} \longrightarrow \text{Researching} \longrightarrow \text{Experimenting} \longrightarrow \text{Building} \longrightarrow \text{Shipping}$$

[![Live Portfolio](https://img.shields.io/badge/Live%20Demo-khalid--digital--lab-00f0ff?style=for-the-badge)](https://first-project-plum-phi.vercel.app)
[![GitHub Repositories](https://img.shields.io/badge/GitHub-@khalidabdullahh-emerald?style=for-the-badge&logo=github)](https://github.com/khalidabdullahh)

---

## ⚡ Private Growth OS: Trading OS Business Automation Engine

A private, internal AI-powered customer acquisition, lead qualification, and cold outreach management system designed specifically for **[Trading OS](https://trading-os-blue.vercel.app)**.

```text
                    PRIVATE GROWTH OS
                           │
                           ▼
                  ┌────────────────┐
                  │ Web Dashboard  │
                  │ Private Access │
                  └───────┬────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │ Backend API    │
                  │ Fastify + TS   │
                  └───────┬────────┘
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
      Neon PostgreSQL    Gemini           Apollo
      Source of Truth    AI Brain       Lead Source
          │
          │
          ▼
      Outreach Drafts
          │
          ▼
   HUMAN APPROVAL REQUIRED
          │
          ▼
       Instantly
          │
          ▼
        Replies
          │
          ▼
       Gemini AI
          │
          ▼
       Neon DB
          │
          ▼
       Dashboard
```

### Core Architecture & Production Rules:
1. **Neon PostgreSQL is the sole production source of truth.** No production lead data depends on memory stores.
2. **Mandatory Human Approval Gate:** Outbound emails are NEVER sent automatically. Outreach drafts halt strictly in `PENDING_APPROVAL` status until explicitly reviewed and approved in the private dashboard.
3. **Anti-Hallucination AI Research:** Google Gemini categorizes evidence into `verified_fact`, `reasonable_inference`, or `unknown`.
4. **Independent & Deployable:** Operates independently of Antigravity on standard Node.js servers or serverless runtimes.

---

## 🛠️ Quickstart & Local Execution

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and set your credentials:

```bash
cp .env.example .env.local
```

Key environment variables:
```bash
# Environment Mode (development | production | test)
APP_ENV=development

# Neon PostgreSQL Connection URL
DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Apollo API Key
APOLLO_API_KEY=your_apollo_api_key_here

# Instantly API Key
INSTANTLY_API_KEY=your_instantly_api_key_here

# Mock Modes (set false when live API keys are provided)
MOCK_APOLLO=false
MOCK_GEMINI=false
MOCK_INSTANTLY=true
```

### 2. Run Database Migrations (Neon PostgreSQL)
To apply the 8-table schema and indexes to Neon:
```bash
npm run db:migrate
```

### 3. Run the Controlled Acquisition Pipeline
Executes Discovery $\rightarrow$ AI Research $\rightarrow$ Lead Scoring $\rightarrow$ Outreach Drafting $\rightarrow$ `PENDING_APPROVAL` (stops safely without sending):
```bash
npm run pipeline
```

### 4. Start Backend REST API
Starts the Fastify REST API on port `4000`:
```bash
npm run api:dev
```

### 5. Launch Private Operator Dashboard
Serve the dashboard interface locally:
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080/apps/dashboard/index.html` to review generated drafts, inspect lead scores, and click **Approve** to authorize delivery.

### 6. Run Automated Test Suite
```bash
npm test
```

---

## 📚 Technical Specifications & Audit Docs

- **[Neon Migration Audit](./docs/NEON_MIGRATION_AUDIT.md):** Detailed reality audit of all components, database migration plan, and production risk analysis.
- **[System Architecture](./docs/ARCHITECTURE.md):** Complete technical architecture, 4 ICP definitions, mathematical scoring equations, and relational schema models.
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md):** Phased delivery roadmap and data contracts.

---

## 🏛️ Master Portfolio Architecture

This central repository acts as my **Digital Engineering Portfolio, Technical Lab, Architecture Showcase, and Cross-Project Knowledge Base**.

```mermaid
graph TD
    A["khalid-digital-lab (Central Showcase & Architecture)"] --> B["projects/ (Engineering Case Studies)"]
    A --> C["backend/ (Auth, RBAC, Server Actions, Payments)"]
    A --> D["databases/ (PostgreSQL DDL, Supabase RLS, Indexes)"]
    A --> E["system-design/ (Zero-GC Loops, Multi-Tenant Queues)"]
    A --> F["engineering/ (Storage RLS, Dynamic Avatars, Vector PDFs)"]
    A --> G["js/ (Interactive 60 FPS Web Application)"]
    A --> H["Business Automation Engine (Neon + Gemini + Apollo Growth Infrastructure)"]

    subgraph "Level 1: Individual Authoritative Repositories"
        B1["ARENEX (Esports Tournament Platform)"] -.-> R1["github.com/khalidabdullahh/eSports"]
        B2["AI CV Builder v2.0 (Career AI Platform)"] -.-> R2["github.com/khalidabdullahh/CV-Builder"]
        B3["Trading OS (Quantitative HMM Volatility Suite)"] -.-> R3["github.com/khalidabdullahh/Trading-OS"]
        B4["Oops! (Chaos Realm 2D Platformer)"] -.-> R4["github.com/khalidabdullahh/Oops"]
        B5["AuRex (Action Combat Engine)"] -.-> R5["github.com/khalidabdullahh/AuRex"]
        B6["DevilsDoor (Atmospheric Horror)"] -.-> R6["github.com/khalidabdullahh/DevilsDoor"]
    end
```

---

## 👤 Author
**Khalid Abdullah**
- **GitHub:** [github.com/khalidabdullahh](https://github.com/khalidabdullahh)
- **LinkedIn:** [linkedin.com/in/khalid-abdullah-847724339](https://linkedin.com/in/khalid-abdullah-847724339)
- **Email:** seamafridi123456789@gmail.com
