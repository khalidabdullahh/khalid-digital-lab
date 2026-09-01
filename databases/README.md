# 🗄️ Database Engineering, PostgreSQL & Supabase Standards

This section contains schema designs, Row Level Security (RLS) policies, query optimization benchmarks, and relational modeling standards implemented by **Khalid Abdullah**.

---

## 🏛️ Database Architectural Principles

```mermaid
graph TD
    subgraph "1. Relational Integrity"
        DDL["Strict Foreign Keys & Cascade Rules"]
        Check["CHECK Constraints & ENUM State Machines"]
        Unique["Composite Unique Indexes (Anti-Replay)"]
    end

    subgraph "2. Security & Isolation"
        RLS["PostgreSQL Row Level Security (RLS)"]
        Iso["Public vs Private Financial Partitioning"]
    end

    subgraph "3. Performance & Scaling"
        Index["Targeted B-Tree & Partial Indexes"]
        Pool["Connection Pooling via PgBouncer / Supabase SSR"]
    end

    DDL --> RLS
    Check --> RLS
    Unique --> Iso
    RLS --> Index
    Iso --> Pool
```

---

## 📚 Technical Reference Guides

1. **Full Production Schema & RLS:**
   - [`databases/supabase/arenex-schema-and-rls.md`](./supabase/arenex-schema-and-rls.md): Complete DDL specifications for `profiles`, `games`, `game_accounts`, `tournaments`, `tournament_registrations`, `payout_profiles`, `payment_records`, `room_credentials`, and `leaderboard_entries` with exhaustive RLS policies.
2. **Financial Privacy & Isolation:**
   - [`databases/schema-design/financial-privacy-isolation.md`](./schema-design/financial-privacy-isolation.md): Isolating public player-facing data (entry fees, prize distributions) from private business accounting (platform margins, transaction fees).
3. **Indexing & Optimization:**
   - [`databases/indexing/performance-and-query-optimization.md`](./indexing/performance-and-query-optimization.md): Composite and partial indexes for high-concurrency tournament queries and live leaderboards.
