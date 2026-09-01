# Changelog

All notable changes and milestones for the **Khalid Abdullah Personal Digital Lab** ecosystem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] - 2026-08-28

### Added
- **Two-Level GitHub Portfolio Architecture:**
  - Established Level 1 individual project repositories as authoritative technical sources.
  - Formatted Level 2 central repository (`khalid-digital-lab`) as the technical lab, cross-project engineering knowledge base, and architecture showcase.
- **Project Case Studies (`projects/`):**
  - `projects/arenex/README.md`: Next.js 15+, Supabase, PostgreSQL RLS, Edge RBAC, multi-step anti-replay payment state machines, time-gated room credentials, and dynamic leaderboard avatars.
  - `projects/cv-builder/README.md`: AI CV Builder v2.0 with 10 templates, Google Gemini prompt distillation, and vector PDF compilation.
  - `projects/trading-os/README.md`: Quantitative HMM regime detection, Parkinson & Garman-Klass volatility modeling, and Kelly Criterion risk sizing.
  - `projects/oops/README.md`: 150-stage multiverse platformer, zero-allocation physics state loops, and procedural Web Audio chiptunes.
  - `projects/findoc/README.md`: SEC 10-K/10-Q NLP disclosure parser, parent-document retrieval, and PEAD sentiment scoring.
  - `projects/algoviz/README.md`: Canvas 2D algorithm and data structure visualizer.
  - `projects/aurex/README.md`: Real-time deterministic action combat state framework.
  - `projects/devil-door/README.md`: Atmospheric horror sanity accumulator FSM and dynamic shaders.
- **Backend Knowledge Base (`backend/`):**
  - Supabase OAuth & session lifecycle case study with Edge middleware guards.
  - Hierarchical RBAC security matrix (`USER`, `SUPER_ADMIN`, `OWNER`) and privilege escalation prevention.
  - Next.js Server Actions vs REST vs PostgreSQL stored procedures.
  - Multi-step payment verification state machine with anti-replay guarantees.
- **Database Engineering Guides (`databases/`):**
  - Full production DDL schema and RLS policies for 9 core relational tables in ARENEX.
  - Decoupled financial privacy accounting pattern.
  - High-concurrency PostgreSQL indexing strategies (composite, partial).
- **System Design & Scalability Standards (`system-design/`):**
  - Multi-tenant esports tournament engine system design.
  - Zero-Garbage-Collection state machines in 60 FPS animation loops.
  - In-browser high-frequency stochastic Monte Carlo and HMM simulation.
- **Engineering Guidelines (`engineering/`):**
  - Storage bucket RLS and dynamic profile-linked avatars.
  - Pure vector PDF document compilation vs HTML canvas rasterization.
  - Decoupled data-driven UI layering and Single Page Architecture.
- **Showcase Synchronizations:**
  - Added ARENEX as a flagship featured platform in `js/data/projects.js`.
  - Added Supabase RBAC and fraud-proof payment state machine articles to `js/data/knowledge.js`.
  - Added backend, PostgreSQL, and tournament engine nodes to `js/data/knowledgeGraph.js`.

---

## [2.4.0] - 2026-08-26

### Added
- **Core Platform:** Built the unified Personal Digital Lab & Innovation Hub architecture.
- **Hero Experience:** High-performance algorithmic particle and vector-field canvas with cursor attractor physics.
- **Currently Building Radar:** Live telemetry ticker displaying in-progress software pipelines and status chips.
- **🧪 The Lab:** Research dashboard with 5 featured inquiries, filter pills, and deep-dive modals containing hypotheses, LaTeX formulas, code, and empirical results.
- **🛠️ Tools & Products Hub:** Scalable tool registry with an embedded live execution workbench.
- **Interactive Tools Built In:**
  - `RegimeSimulator.js`: Real-time Monte Carlo price path generator and 3-state Gaussian Hidden Markov Model classifier.
  - `ATSAnalyzer.js`: Lexical similarity and TF-IDF keyword match engine for CVs vs job descriptions.
  - `KellyCalculator.js`: Quantitative logarithmic position sizing and drawdown risk estimator.
  - `VectorNormVisualizer.js`: Geometric 2D continuous $L_p$ unit ball canvas ($L_1, L_2, L_\infty$).
- **📚 Knowledge Space:** Interactive dynamic Knowledge Graph canvas and curated technical essays (PCA, Auction Market Theory, Vector Norms, Prompt Distillation).
- **⏱️ Chronological Build Log:** Filterable activity timeline tracking commits, tags, and milestone metrics.
- **Power Features:**
  - Global `⌘K` / `Ctrl+K` Command Palette with instant fuzzy search.
  - Developer CLI Terminal emulator (`~`) with interactive system commands.
  - Custom desktop magnetic morphing cursor.
  - Dark/Light theme toggle with persistence.
- **Documentation:** Created comprehensive `AGENTS.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, and `docs/CV_BUILDER_INTEGRATION.md`.

---

## [2.0.0] - 2026-08-22

### Added
- **AI CV Builder v2.0 Release:**
  - 10 professional ATS-optimized resume templates (Swiss Grid, Creative Developer Terminal, Executive Navy, Classic Academic).
  - Built-in Google Gemini AI writing assistant for resume summaries and achievement bullet points.
  - Client-side image upload and auto-compression.
  - 1-click clean HD vector PDF export with zero watermarks.
  - Deployed live on Vercel ([first-project-plum-phi.vercel.app](https://first-project-plum-phi.vercel.app)).

---

## [1.0.0] - 2026-08-10

### Added
- **Oops! (Chaos Realm) Multiverse Game:**
  - 150 handcrafted puzzle-platformer stages across 5 multiverse worlds.
  - Real-time gravity inversion mechanics and zero-allocation physics state machines.
  - Synthesized Web Audio API retro chiptune sound generator.
  - Mobile touch gamepad and PWA support ([oops-snowy-three.vercel.app](https://oops-snowy-three.vercel.app/)).
