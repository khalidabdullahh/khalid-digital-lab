-- =============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Core schema for Trading OS Business Automation Engine
-- =============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. CAMPAIGNS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    icp_target VARCHAR(100) NOT NULL,
    instantly_campaign_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. LEADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    company VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    linkedin_url TEXT,
    company_url TEXT,
    location VARCHAR(255),
    industry VARCHAR(255),
    company_size VARCHAR(100),
    source VARCHAR(50) NOT NULL DEFAULT 'apollo',
    source_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    qualification_status VARCHAR(50) NOT NULL DEFAULT 'UNQUALIFIED',
    lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    opted_out BOOLEAN NOT NULL DEFAULT FALSE,
    last_contacted_at TIMESTAMPTZ,
    last_replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint for source deduplication & normalized email deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_lower_email ON leads(LOWER(TRIM(email)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_source_source_id ON leads(source, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_opted_out ON leads(opted_out);

-- -----------------------------------------------------------------------------
-- 3. RESEARCH TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    professional_focus TEXT NOT NULL,
    trading_related BOOLEAN NOT NULL DEFAULT FALSE,
    quant_related BOOLEAN NOT NULL DEFAULT FALSE,
    pine_script_related BOOLEAN NOT NULL DEFAULT FALSE,
    systematic_trading_related BOOLEAN NOT NULL DEFAULT FALSE,
    company_description TEXT,
    professional_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    relevant_projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    relevant_public_activity JSONB NOT NULL DEFAULT '[]'::jsonb,
    potential_pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    potential_use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1',
    researched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_lead_id ON research(lead_id);

-- -----------------------------------------------------------------------------
-- 4. AI_ANALYSIS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    qualification VARCHAR(50) NOT NULL,
    composite_score INTEGER NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    role_relevance INTEGER NOT NULL CHECK (role_relevance >= 0 AND role_relevance <= 100),
    company_fit INTEGER NOT NULL CHECK (company_fit >= 0 AND company_fit <= 100),
    problem_relevance INTEGER NOT NULL CHECK (problem_relevance >= 0 AND problem_relevance <= 100),
    evidence_strength INTEGER NOT NULL CHECK (evidence_strength >= 0 AND evidence_strength <= 100),
    reasoning TEXT NOT NULL,
    pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    model_name VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1',
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_lead_id ON ai_analysis(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_composite_score ON ai_analysis(composite_score DESC);

-- -----------------------------------------------------------------------------
-- 5. OUTREACH TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outreach (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    personalization_snippet TEXT NOT NULL,
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_reason TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    instantly_lead_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_lead_id ON outreach(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach(status);
CREATE INDEX IF NOT EXISTS idx_outreach_campaign_id ON outreach(campaign_id);

-- -----------------------------------------------------------------------------
-- 6. REPLIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    outreach_id UUID REFERENCES outreach(id) ON DELETE SET NULL,
    raw_reply_text TEXT NOT NULL,
    classification VARCHAR(50) NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    summary TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    draft_reply TEXT,
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1',
    requires_human_action BOOLEAN NOT NULL DEFAULT TRUE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_lead_id ON replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_replies_classification ON replies(classification);
CREATE INDEX IF NOT EXISTS idx_replies_requires_action ON replies(requires_human_action);

-- -----------------------------------------------------------------------------
-- 7. EVENTS TABLE (Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    actor VARCHAR(100) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. WEBHOOKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_provider_event ON webhooks(provider, event_type);

-- -----------------------------------------------------------------------------
-- Auto-update updated_at timestamp triggers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
