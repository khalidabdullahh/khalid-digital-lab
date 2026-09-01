/**
 * Chronological Build Log / Activity Timeline
 * Author: Khalid Abdullah
 */

export const BUILD_LOG = [
  {
    id: "log-0828",
    date: "AUG 28, 2026",
    title: "Documented ARENEX Full-Stack Esports Architecture & RLS Security Matrix",
    type: "builds",
    typeLabel: "Build",
    icon: "shield-check",
    color: "emerald",
    commit: "9c2d4f1",
    description: "Completed full architectural audit and documentation of the ARENEX esports platform. Formulated Next.js Edge Middleware RBAC, PostgreSQL Row Level Security (RLS) policies, multi-step anti-replay payment workflows, and time-gated lobby credential distribution.",
    metrics: "11 Tables • 14 RLS Policies • 3 Role Levels • Multi-Game Support",
    tags: ["Next.js", "Supabase", "PostgreSQL", "RLS", "Esports"]
  },
  {
    id: "log-0826",
    date: "AUG 26, 2026",
    title: "Launched Personal Digital Lab & Innovation Hub v2.4",
    type: "releases", // builds, research, learning, experiments, releases
    typeLabel: "Release",
    icon: "rocket",
    color: "emerald",
    commit: "7f9a2e1",
    description: "Built and launched the unified Personal Digital Lab architecture. Integrated the Lab research dashboard, live in-browser Market Regime simulator, ATS keyword analyzer, Knowledge Graph, Cmd+K command palette, and interactive terminal.",
    metrics: "12 Projects • 5 Interactive Tools • 6 Experiments",
    tags: ["Personal Lab", "Frontend Architecture", "Interactive Web"]
  },
  {
    id: "log-0824",
    date: "AUG 24, 2026",
    title: "Implemented In-Browser HMM Market Regime Simulation Engine",
    type: "experiments",
    typeLabel: "Experiment",
    icon: "activity",
    color: "amber",
    commit: "4c8b91a",
    description: "Engineered a client-side Monte Carlo price path generator and 3-state Hidden Markov Model classifier in JavaScript Canvas. Allows real-time parameter tuning of drift, volatility, and jump shocks.",
    metrics: "60 FPS Canvas • 500-bar real-time classification",
    tags: ["Quant Finance", "HMM", "Canvas 2D"]
  },
  {
    id: "log-0822",
    date: "AUG 22, 2026",
    title: "Released AI CV Builder v2.0 with 10 ATS-Optimized Templates",
    type: "releases",
    typeLabel: "Release",
    icon: "package",
    color: "emerald",
    commit: "a1b2c3d",
    description: "Major release of AI CV Builder featuring 10 handcrafted templates (Swiss Grid, Developer Terminal, Executive Navy, Minimalist Monochrome), Gemini AI bullet rephrasing, image auto-compression, and 1-click clean HD PDF download.",
    metrics: "10 Templates • Gemini 1.5 Flash • 100% Vector PDF",
    tags: ["Next.js", "AI", "Tailwind CSS", "PDF Engine"]
  },
  {
    id: "log-0818",
    date: "AUG 18, 2026",
    title: "Research Note: PCA & Eigenstructure in Equity Factor Models",
    type: "learning",
    typeLabel: "Learning",
    icon: "book-open",
    color: "blue",
    commit: "9e3f84b",
    description: "Formulated the mathematical foundation of spectral decomposition on asset correlation matrices. Documented empirical eigenvalues vs Marchenko-Pastur random matrix noise bounds.",
    metrics: "Eigenvalues • Marchenko-Pastur • Python NumPy",
    tags: ["Linear Algebra", "PCA", "Portfolio Theory"]
  },
  {
    id: "log-0814",
    date: "AUG 14, 2026",
    title: "Two-Pass Prompt Distillation Experiment for Resume Achievements",
    type: "research",
    typeLabel: "Research",
    icon: "microscope",
    color: "violet",
    commit: "2d5c78a",
    description: "Conducted benchmark tests comparing single-shot vs two-pass prompt chains for resume optimization. Achieved 98.2% factual consistency by isolating entity extraction from syntactic generation.",
    metrics: "-87% Hallucinations • +42% ATS Match Score",
    tags: ["LLM", "Prompt Engineering", "NLP"]
  },
  {
    id: "log-0810",
    date: "AUG 10, 2026",
    title: "Shipped 'Oops! (Chaos Realm)' 150-Stage Multiverse Platformer",
    type: "builds",
    typeLabel: "Build",
    icon: "gamepad-2",
    color: "emerald",
    commit: "5e7a10f",
    description: "Completed and deployed 150 handcrafted stages across 5 multiverse worlds. Implemented zero-allocation physics state machine, procedural Web Audio chiptunes, and mobile touch gamepad.",
    metrics: "150 Levels • 5 Worlds • 60 FPS • 0 KB Audio Files",
    tags: ["Game Dev", "Phaser", "Web Audio", "PWA"]
  },
  {
    id: "log-0804",
    date: "AUG 04, 2026",
    title: "SEC 10-K Guidance Extraction Benchmark with Quantized LLMs",
    type: "research",
    typeLabel: "Research",
    icon: "microscope",
    color: "blue",
    commit: "3f8b19c",
    description: "Evaluated 4-bit AWQ quantized models on SEC Item 7 MD&A disclosure tables. Hierarchical parent-document retrieval boosted numerical precision by 34% over flat chunking.",
    metrics: "1,200 Filings • ChromaDB • 4-bit AWQ",
    tags: ["LLM", "SEC Filings", "Quant NLP"]
  },
  {
    id: "log-0728",
    date: "JUL 28, 2026",
    title: "Mathematical Visualization: Vector Norms ($L_p$) & Lasso Geometry",
    type: "learning",
    typeLabel: "Learning",
    icon: "book-open",
    color: "blue",
    commit: "1b4c90e",
    description: "Wrote interactive geometric proofs visualizing why the sharp vertices of $L_1$ balls enforce parameter sparsity whereas smooth $L_2$ spheres yield dense shrinkage.",
    metrics: "Interactive Canvas • KaTeX Math • L1 vs L2",
    tags: ["Mathematics", "Machine Learning", "Optimization"]
  }
];
