# 🗄️ ARENEX Complete PostgreSQL Schema & Row Level Security (RLS) Specification

**Reference Project:** ARENEX (Esports Tournament Platform)  
**Database Engine:** PostgreSQL 16 / Supabase Managed Database  
**Author:** Khalid Abdullah  

---

## 📌 Complete Production DDL & RLS Policies

```sql
-- ============================================================================
-- 1. EXTENSIONS & ENUMS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. PROFILES TABLE (User Identity & Role Matrix)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL CHECK (role IN ('USER', 'SUPER_ADMIN', 'OWNER')),
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own safe fields" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ============================================================================
-- 3. GAMES TABLE (Supported Competitive Titles)
-- ============================================================================
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    banner_url TEXT,
    account_id_label VARCHAR(50) DEFAULT 'In-Game UID' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are publicly readable" 
    ON public.games FOR SELECT USING (true);

CREATE POLICY "Super Admins can manage games" 
    ON public.games FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')));

-- ============================================================================
-- 4. GAME ACCOUNTS (Player In-Game Identifiers)
-- ============================================================================
CREATE TABLE public.game_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
    in_game_name VARCHAR(100) NOT NULL,
    in_game_uid VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_game_account UNIQUE(user_id, game_id, in_game_uid)
);

ALTER TABLE public.game_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game accounts readable by owner or admins" 
    ON public.game_accounts FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')
    ));

CREATE POLICY "Users manage own game accounts" 
    ON public.game_accounts FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. TOURNAMENTS TABLE (Matches & Lifecycle)
-- ============================================================================
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    format VARCHAR(50) NOT NULL, -- SOLO, DUO, SQUAD
    max_participants INT NOT NULL CHECK (max_participants > 0),
    entry_fee NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (entry_fee >= 0),
    prize_pool NUMERIC(10,2) NOT NULL CHECK (prize_pool >= 0),
    prize_distribution JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'UPCOMING' NOT NULL CHECK (
        status IN ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED')
    ),
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,
    tournament_start TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments viewable by all" 
    ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Super Admins manage tournaments" 
    ON public.tournaments FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')));

-- ============================================================================
-- 6. TOURNAMENT REGISTRATIONS (Multi-Tournament Enrolment Ledger)
-- ============================================================================
CREATE TABLE public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_account_id UUID NOT NULL REFERENCES public.game_accounts(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' NOT NULL CHECK (
        status IN ('PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'REJECTED', 'DISQUALIFIED')
    ),
    slot_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_registration_per_tournament UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own registrations or admins view all" 
    ON public.tournament_registrations FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')
    ));

CREATE POLICY "Users insert own registrations" 
    ON public.tournament_registrations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. PAYMENT RECORDS (Verification Ledger & Anti-Replay)
-- ============================================================================
CREATE TABLE public.payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    sender_number VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
    proof_screenshot_url TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_payment_tx_per_method UNIQUE(payment_method, transaction_id)
);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" 
    ON public.payment_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users submit own payment" 
    ON public.payment_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super Admins manage all payment records" 
    ON public.payment_records FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')));

-- ============================================================================
-- 8. ROOM CREDENTIALS (Time-Gated Lobby Access)
-- ============================================================================
CREATE TABLE public.room_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    room_id VARCHAR(100) NOT NULL,
    room_password VARCHAR(100) NOT NULL,
    release_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.room_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins or Confirmed players view room credentials after release_time" 
    ON public.room_credentials FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER'))
        OR (
            NOW() >= release_time AND EXISTS (
                SELECT 1 FROM public.tournament_registrations tr 
                WHERE tr.tournament_id = room_credentials.tournament_id 
                  AND tr.user_id = auth.uid() 
                  AND tr.status = 'CONFIRMED'
            )
        )
    );

CREATE POLICY "Super Admins manage room credentials" 
    ON public.room_credentials FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')));

-- ============================================================================
-- 9. LEADERBOARD ENTRIES (Dynamic Rankings & Results)
-- ============================================================================
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank INT NOT NULL CHECK (rank > 0),
    kills INT DEFAULT 0 NOT NULL CHECK (kills >= 0),
    placement_points NUMERIC(8,2) DEFAULT 0 NOT NULL,
    total_points NUMERIC(8,2) NOT NULL,
    prize_won NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_rank_per_tournament UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboards are publicly viewable" 
    ON public.leaderboard_entries FOR SELECT USING (true);

CREATE POLICY "Super Admins manage leaderboard entries" 
    ON public.leaderboard_entries FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'OWNER')));
```
