/**
 * Projects Showcase Dataset
 * Author: Khalid Abdullah
 */

export const PROJECTS = [
  {
    id: "proj-cv-builder",
    title: "AI CV Builder v2.0",
    tagline: "ATS-Optimized Resume Creator with Google Gemini AI & 10 Design Models",
    category: "AI & Web Application",
    featured: true,
    status: "Shipping / Live",
    statusColor: "emerald",
    year: "2026",
    technologies: ["Next.js 16", "React 19", "Google Gemini AI", "Tailwind CSS", "Vector PDF Engine"],
    shortDescription: "An intelligent, user-first resume creator designed to help job seekers, developers, and students craft outstanding, ATS-proof resumes in minutes with 1-click HD PDF export.",
    problem: "Job seekers spend hours wrestling with misaligned Word templates and getting silently rejected by modern Applicant Tracking Systems (ATS) due to unstructured layouts, missing keywords, and poor typographic hierarchy.",
    solution: "Built a lightning-fast web platform featuring 10 versatile design templates (Academic ATS, Modern Dark Sidebar, Swiss Grid, Executive Gold, Developer Terminal), integrated Google Gemini for instant accomplishment rephrasing, custom photo compression, and 1-click pixel-perfect PDF export without watermarks.",
    highlights: [
      "10 Tailored Resume Templates for developers, researchers, and executives",
      "Built-in Google Gemini AI writer to polish summaries and work experience",
      "100% ATS-Compliant layouts designed to pass corporate scanners",
      "Instant 1-Click HD PDF Download with clean vector typography",
      "Client-side image compression and seamless export pipeline"
    ],
    liveUrl: "https://first-project-plum-phi.vercel.app",
    githubUrl: "https://github.com/khalidabdullahh/CV-Builder",
    badge: "Flagship Product"
  },
  {
    id: "proj-devil-door",
    title: "Devil's Door — 2.5D Dark Fantasy Action Platformer",
    tagline: "Atmospheric Action-Platformer with 6 Hero Classes & Procedural Biome Cycles",
    category: "Game Engineering & Systems",
    featured: true,
    status: "Live / Playable",
    statusColor: "emerald",
    year: "2026",
    technologies: ["HTML5 Canvas", "2.5D Physics", "Verlet Ribbons", "Web Audio API", "Vercel"],
    shortDescription: "An atmospheric 2.5D dark fantasy action-platformer featuring 6 distinct hero classes (Shadow Ninja, Ronin, Oni Warrior, Cursed Monk, Assassin, Void Entity), dynamic biome cycles, and 60 FPS canvas combat physics.",
    problem: "Web action games often suffer from imprecise hitboxes, floaty jump physics, and repetitive static environments that fail to keep players immersed.",
    solution: "Engineered a zero-lag 2.5D canvas game engine with frame-locked input buffering, directional dash mechanics, Verlet ribbon physics for hero scarves, and procedural biome cycles evolving every 180 seconds across 6 dark fantasy environments.",
    highlights: [
      "6 Playable Hero Classes with unique physics, dashes, and combat traits",
      "Dynamic Biome Engine cycling through 6 visual environments every 3 minutes",
      "60 FPS hardware-accelerated Canvas engine with zero frame drops",
      "Touch gamepad for mobile and keyboard arrow controls for desktop",
      "Runs directly in the browser with zero installations"
    ],
    liveUrl: "https://devils-door.vercel.app/",
    githubUrl: "https://github.com/khalidabdullahh/DevilsDoor",
    badge: "Flagship Game"
  },
  {
    id: "proj-arenex",
    title: "ARENEX — Esports Tournament & Competitive Platform",
    tagline: "Full-Stack Competitive Gaming Engine with Supabase, PostgreSQL RLS & Server Actions",
    category: "Full-Stack & Backend Systems",
    featured: true,
    status: "Active Engine",
    statusColor: "emerald",
    year: "2026",
    technologies: ["Next.js 15+", "React 19", "Supabase", "PostgreSQL", "Row Level Security", "Tailwind CSS"],
    shortDescription: "A production-grade esports tournament platform engineered for multi-game match matchmaking, automated payment verification workflows, time-gated room credential distribution, and dynamic profile-linked leaderboards.",
    problem: "Competitive gaming communities face rampant fraud with fake payment transaction IDs, unauthorized room access leaks, race conditions during slot registration, and fragile client-side authorization.",
    solution: "Engineered an authoritative server-driven architecture with Next.js Edge middleware RBAC (USER, SUPER_ADMIN, OWNER), PostgreSQL Row Level Security (RLS), multi-step payment verification state machines, and time-gated lobby credential distribution.",
    highlights: [
      "Role-Based Access Control (USER, SUPER_ADMIN, OWNER) enforced at Edge & Database layers",
      "Anti-replay payment verification state machine supporting local MFS gateways",
      "Time-gated room credential release engine (only unlocks for confirmed players at T-15m)",
      "Dynamic leaderboard scoring linked to real player profile avatars via Supabase Storage",
      "Multi-tournament registration capability allowing players to enter multiple active events"
    ],
    liveUrl: "https://github.com/khalidabdullahh/eSports",
    githubUrl: "https://github.com/khalidabdullahh/eSports",
    badge: "Competitive Engine"
  },
  {
    id: "proj-trading-os",
    title: "Trading OS — Quantitative Strategy & Volatility Suite",
    tagline: "Quantitative Trading Strategy, Technical Indicator & Dynamic Risk Engine",
    category: "Quantitative Finance",
    featured: false,
    status: "Active Repository",
    statusColor: "amber",
    year: "2026",
    technologies: ["JavaScript ES6", "Pine Script", "Technical Indicators", "Risk Management"],
    shortDescription: "A quantitative finance suite containing algorithmic strategy scripts, custom Pine Script indicators, and volatility risk modeling frameworks.",
    problem: "Discretionary trading lacks systematic execution rules and fails to adapt position sizing dynamically during high-volatility market regimes.",
    solution: "Developed custom technical indicators and risk management models to calculate dynamic position sizing and trade filtering.",
    highlights: [
      "Dynamic volatility clustering and trend indicators",
      "Custom Pine Script strategies for multi-asset backtesting",
      "Risk-adjusted position sizing models"
    ],
    liveUrl: "https://github.com/khalidabdullahh/Trading-OS",
    githubUrl: "https://github.com/khalidabdullahh/Trading-OS",
    badge: "Quant Suite"
  },
  {
    id: "proj-aurex",
    title: "AuRex: Real-Time Game Mechanics Engine",
    tagline: "Deterministic Action Combat Framework & Frame-Locked State Machines",
    category: "Game Engineering & Systems",
    featured: false,
    status: "Active Engine",
    statusColor: "violet",
    year: "2026",
    technologies: ["Game Systems", "State Machines", "Spatial Partitioning", "Combat FSM"],
    shortDescription: "A high-performance action combat engineering framework featuring deterministic state transitions, input buffering, and spatial collision indexing for multi-entity combat systems.",
    problem: "Action games struggle with dropped inputs, inconsistent combo cancellation windows, and unoptimized spatial queries during multi-entity encounters.",
    solution: "Implemented fixed-window input buffering, decoupled movement and combat state machines, and grid-based spatial partitioning.",
    highlights: [
      "Deterministic frame-locked input buffering queue",
      "Decoupled movement vs combat hierarchical state machine",
      "Spatial broad-phase hitbox/hurtbox partitioner"
    ],
    liveUrl: "https://github.com/khalidabdullahh/AuRex",
    githubUrl: "https://github.com/khalidabdullahh/AuRex",
    badge: "Combat Core"
  }
];
