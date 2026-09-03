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
    id: "tool-oops-game",
    name: "Oops! (Chaos Realm)",
    tagline: "Deceptive multiverse 2D platformer with real-time gravity inversion.",
    category: "Game Engineering",
    icon: "gamepad-2",
    status: "Live / Playable",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://oops-snowy-three.vercel.app/",
    featured: true,
    badge: "Playable Game",
    description: "Experience the deceptive 2D puzzle platformer directly in modern desktop and mobile browsers. Features zero-lag physics, real-time gravity inversion, and synthesized chiptune audio.",
    capabilities: [
      "150 handcrafted stages across 5 multiverse worlds",
      "Touch gamepad for mobile and keyboard arrow controls for desktop",
      "Zero-latency synthesized audio using Web Audio API",
      "Runs with zero installations directly via modern web browsers"
    ],
    pricing: "100% Free / Play Online",
    actionLabel: "Play Oops! Live ↗",
    github: "https://github.com/khalidabdullahh/Oops",
    relatedProject: "proj-oops"
  },
  {
    id: "tool-arenex",
    name: "ARENEX Esports Platform",
    tagline: "Full-stack tournament engine with PostgreSQL RLS & anti-replay payments.",
    category: "Full-Stack & Backend",
    icon: "shield-check",
    status: "Live Engine",
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
    actionLabel: "View Source Code ↗",
    github: "https://github.com/khalidabdullahh/eSports",
    relatedProject: "proj-arenex"
  },
  {
    id: "tool-trading-os",
    name: "Trading OS Intelligence Suite",
    tagline: "Quantitative finance strategy, technical indicator & volatility engine.",
    category: "Quantitative Finance",
    icon: "trending-up",
    status: "Active Repository",
    statusColor: "amber",
    isInteractiveInSite: false,
    externalUrl: "https://github.com/khalidabdullahh/Trading-OS",
    featured: false,
    badge: "Quant Suite",
    description: "Quantitative finance repository containing JavaScript indicator engines, Pine Script strategies, and dynamic risk management models.",
    capabilities: [
      "Dynamic volatility clustering and trend indicators",
      "Custom Pine Script strategies for multi-asset backtesting",
      "Risk-adjusted position sizing models"
    ],
    pricing: "Open Source Repository",
    actionLabel: "Explore Repository ↗",
    github: "https://github.com/khalidabdullahh/Trading-OS",
    relatedProject: "proj-market-suite"
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
  },
  {
    id: "tool-regime-simulator",
    name: "Market Regime & Volatility Simulator",
    tagline: "Simulate stochastic asset prices and classify market states in real time.",
    category: "Interactive Tool",
    icon: "activity",
    status: "Interactive In-Browser",
    statusColor: "amber",
    isInteractiveInSite: true,
    interactiveComponent: "RegimeSimulator",
    featured: false,
    badge: "In-Browser Simulator",
    description: "An in-browser quantitative simulator powered by geometric Brownian motion and a 3-state Hidden Markov Model. Adjust volatility, drift, and observe real-time state decoding.",
    capabilities: [
      "Real-time Monte Carlo price path generation",
      "Dynamic parameter controls: Drift, Volatility, and Jump Shocks",
      "3-State State Machine (Bull Trend 🟢, Range Chop 🟡, Crash 🔴)",
      "Instant parameter presets (Quiet Bull, Choppy Range, Flash Crash)"
    ],
    pricing: "100% Free In-Browser",
    actionLabel: "Open Simulator →",
    github: "https://github.com/khalidabdullahh/Trading-OS",
    relatedProject: "proj-market-suite"
  }
];
