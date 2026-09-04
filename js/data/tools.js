/**
 * Tools & Products Hub Dataset
 * Author: Khalid Abdullah
 */

export const TOOLS = [
  {
    id: "tool-cv-builder",
    name: "AI CV Builder v2.0",
    tagline: "Build an ATS-optimized, job-ready resume in minutes with Google Gemini AI.",
    category: "Career & AI",
    icon: "file-text",
    status: "Live / Production",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://first-project-plum-phi.vercel.app",
    featured: true,
    badge: "Flagship Product",
    description: "An AI-powered CV generator with 10 industry-standard templates (Classic ATS, Modern Dark Sidebar, Executive Minimalist, Creative Developer Terminal, Swiss Grid). Features real-time AI bullet polishing and 1-click clean HD PDF export.",
    capabilities: [
      "10 Professional Design Models for developers, researchers & executives",
      "Built-in Google Gemini AI writing assistant for summaries & achievements",
      "100% ATS-Compliant structure to maximize recruiter scanner pass rates",
      "Instant 1-Click HD PDF Download with clean vector typography",
      "Custom profile photo upload with automatic client-side compression"
    ],
    pricing: "Free & Open Web App",
    actionLabel: "Launch AI CV Builder ↗",
    github: "https://github.com/khalidabdullahh/CV-Builder",
    relatedProject: "proj-cv-builder"
  },
  {
    id: "tool-devils-door",
    name: "Devil's Door",
    tagline: "Endless Dark Fantasy 2.5D action-platformer with 6 playable ninja & samurai heroes.",
    category: "Game Engineering",
    icon: "swords",
    status: "Live / Playable",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://devils-door.vercel.app/",
    featured: true,
    badge: "Playable Game",
    description: "An atmospheric 2.5D dark fantasy action-platformer featuring 6 distinct hero classes (Shadow Ninja, Ronin, Oni Warrior, Cursed Monk, Assassin, Void Entity), dynamic biome cycles, and 60 FPS canvas combat physics.",
    capabilities: [
      "6 Playable Hero Classes with unique sprites, movement physics, and signature combat abilities",
      "Dynamic Biome Engine with 6 signature visual environments cycling every 3 minutes",
      "60 FPS 2.5D Canvas Physics Engine with frame-locked combat and dash strikes",
      "Playable directly in modern desktop and mobile web browsers without installation"
    ],
    pricing: "100% Free / Play Online",
    actionLabel: "Play Devil's Door ↗",
    github: "https://github.com/khalidabdullahh/DevilsDoor",
    relatedProject: "proj-devil-door"
  },
  {
    id: "tool-arenex",
    name: "ARENEX Esports Platform",
    tagline: "Full-stack tournament engine with PostgreSQL RLS & anti-replay payments.",
    category: "Full-Stack & Backend",
    icon: "shield-check",
    status: "Active Engine",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://github.com/khalidabdullahh/eSports",
    featured: true,
    badge: "Competitive Engine",
    description: "A production-grade esports tournament platform engineered for match matchmaking, automated payment verification workflows, and time-gated lobby credential distribution.",
    capabilities: [
      "Role-Based Access Control (USER, SUPER_ADMIN, OWNER) at Edge & Database layers",
      "Anti-replay payment verification state machine for local MFS gateways",
      "Time-gated room credential release engine for confirmed players",
      "Dynamic leaderboard scoring linked to real player profiles via Supabase Storage"
    ],
    pricing: "Open Source Platform",
    actionLabel: "Explore on GitHub ↗",
    github: "https://github.com/khalidabdullahh/eSports",
    relatedProject: "proj-arenex"
  },
  {
    id: "tool-trading-os",
    name: "Trading OS Suite",
    tagline: "Quantitative finance strategy, technical indicator & volatility engine.",
    category: "Quantitative Finance",
    icon: "trending-up",
    status: "Active Repository",
    statusColor: "amber",
    isInteractiveInSite: false,
    externalUrl: "https://github.com/khalidabdullahh/Trading-OS",
    featured: false,
    badge: "Quant Suite",
    description: "Quantitative finance suite containing JavaScript indicator engines, Pine Script strategies, and dynamic risk management models.",
    capabilities: [
      "Dynamic volatility clustering and trend indicators",
      "Custom Pine Script strategies for multi-asset backtesting",
      "Risk-adjusted position sizing models"
    ],
    pricing: "Open Source Repository",
    actionLabel: "Explore on GitHub ↗",
    github: "https://github.com/khalidabdullahh/Trading-OS",
    relatedProject: "proj-trading-os"
  },
  {
    id: "tool-aurex",
    name: "AuRex Combat Framework",
    tagline: "Deterministic Action Combat Framework & Frame-Locked State Machines.",
    category: "Game Engineering",
    icon: "zap",
    status: "Active Engine",
    statusColor: "violet",
    isInteractiveInSite: false,
    externalUrl: "https://github.com/khalidabdullahh/AuRex",
    featured: false,
    badge: "Combat Engine",
    description: "A high-performance action combat engineering framework featuring deterministic state transitions, input buffering queues, and spatial collision indexing for multi-entity combat systems.",
    capabilities: [
      "Deterministic frame-locked input buffering queue",
      "Decoupled movement vs combat hierarchical state machine",
      "Spatial broad-phase hitbox/hurtbox partitioner"
    ],
    pricing: "Open Source Framework",
    actionLabel: "Explore on GitHub ↗",
    github: "https://github.com/khalidabdullahh/AuRex",
    relatedProject: "proj-aurex"
  },
  {
    id: "tool-ats-analyzer",
    name: "ATS Resume Keyword Scanner",
    tagline: "Audit your CV against target job descriptions for keyword alignment.",
    category: "Interactive Tool",
    icon: "check-circle-2",
    status: "Interactive In-Browser",
    statusColor: "emerald",
    isInteractiveInSite: true,
    interactiveComponent: "ATSAnalyzer",
    featured: true,
    badge: "In-Browser Tool",
    description: "Paste your resume summary alongside a target job description to compute instant lexical overlap, technical keyword extraction, and an overall ATS Match Score.",
    capabilities: [
      "Instant lexical and token-level similarity calculation",
      "Automatic technical keyword and action-verb extraction",
      "Identifies missing high-value keywords present in job descriptions",
      "Readability index and bullet point action-verb density scoring"
    ],
    pricing: "100% Free In-Browser",
    actionLabel: "Open Keyword Scanner →",
    github: "https://github.com/khalidabdullahh/CV-Builder",
    relatedProject: "proj-cv-builder"
  }
];
