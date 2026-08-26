/**
 * Tools & Products Hub Dataset
 * Author: Khalid Abdullah
 */

export const TOOLS = [
  {
    id: "tool-cv-builder",
    name: "AI CV Builder",
    tagline: "Build an ATS-optimized, job-ready resume in minutes with AI.",
    category: "Career & AI",
    icon: "file-text",
    status: "Live / Production",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://first-project-plum-phi.vercel.app",
    featured: true,
    badge: "Flagship Tool",
    description: "An AI-powered CV generator with 10 industry-standard templates (Classic ATS, Modern Dark Sidebar, Executive Minimalist, Creative Developer Terminal, Swiss Grid). Features real-time AI bullet polishing and 1-click clean HD PDF export.",
    capabilities: [
      "10 Professional Design Models for developers, researchers & executives",
      "Built-in Google Gemini AI writing assistant for summaries & achievements",
      "100% ATS-Compliant structure to maximize recruiter scanner pass rates",
      "Instant 1-Click HD PDF Download with clean vector typography",
      "Custom profile photo upload with automatic client-side compression"
    ],
    pricing: "Free & Pro Tiers",
    actionLabel: "Launch AI CV Builder ↗",
    github: "https://github.com/khalidabdullahh/CV-Builder",
    relatedProject: "proj-cv-builder",
    relatedExperiment: "exp-cv-intelligence"
  },
  {
    id: "tool-regime-simulator",
    name: "Market Regime & Volatility Simulator",
    tagline: "Simulate stochastic asset prices and classify market regimes in real time.",
    category: "Finance & ML",
    icon: "activity",
    status: "Interactive In-Browser",
    statusColor: "amber",
    isInteractiveInSite: true,
    interactiveComponent: "RegimeSimulator",
    featured: true,
    badge: "Interactive Lab Tool",
    description: "An in-browser quantitative simulator powered by geometric Brownian motion and a 3-state Hidden Markov Model. Adjust volatility, drift, regime persistence, and observe real-time state decoding with color-coded price trajectories.",
    capabilities: [
      "Real-time Monte Carlo price path generation (100-500 bars)",
      "Dynamic parameter controls: Drift ($\\mu$), Base Volatility ($\\sigma$), Shock Jump Intensity",
      "3-State HMM State Machine (Bull Trend 🟢, Range / Chop 🟡, Liquidation Crash 🔴)",
      "Live rolling volatility and maximum drawdown metrics",
      "Instant parameter presets (Quiet Bull, Choppy Range, Flash Crash)"
    ],
    pricing: "100% Free & Open Source",
    actionLabel: "Open Simulation Playground",
    github: "https://github.com/khalidabdullahh",
    relatedProject: "proj-market-suite",
    relatedExperiment: "exp-market-regime"
  },
  {
    id: "tool-ats-analyzer",
    name: "ATS Resume & Keyword Density Analyzer",
    tagline: "Audit your CV against target job descriptions for ATS keyword alignment.",
    category: "Career & Developer",
    icon: "check-circle-2",
    status: "Interactive In-Browser",
    statusColor: "emerald",
    isInteractiveInSite: true,
    interactiveComponent: "ATSAnalyzer",
    featured: true,
    badge: "Interactive Utility",
    description: "Paste your resume summary or bullet points alongside a target job description to compute instant lexical overlap, TF-IDF keyword extraction, missing critical competencies, and an overall ATS Match Score.",
    capabilities: [
      "Instant lexical and token-level similarity calculation",
      "Automatic technical keyword and action-verb extraction",
      "Identifies missing high-value keywords present in the job description",
      "Readability index and bullet point action-verb density scoring",
      "Preloaded sample datasets (AI Engineer, Quant Trader, Frontend Architect)"
    ],
    pricing: "100% Free",
    actionLabel: "Open Keyword Scanner",
    github: "https://github.com/khalidabdullahh",
    relatedProject: "proj-cv-builder",
    relatedExperiment: "exp-cv-intelligence"
  },
  {
    id: "tool-kelly-calculator",
    name: "Quantitative Position Sizing & Kelly Calculator",
    tagline: "Calculate optimal bet sizing, fractional leverage & drawdown probability.",
    category: "Finance & Math",
    icon: "percent",
    status: "Interactive In-Browser",
    statusColor: "blue",
    isInteractiveInSite: true,
    interactiveComponent: "KellyCalculator",
    featured: false,
    badge: "Risk Tool",
    description: "A mathematical risk-management calculator implementing the Kelly Criterion: $f^* = \\frac{p(b+1) - 1}{b}$. Computes optimal capital allocation, fractional Kelly dampening (Half/Quarter Kelly), and projected maximum drawdown trajectories.",
    capabilities: [
      "Standard and fractional Kelly Criterion calculation",
      "Payoff ratio ($b = \\text{Win}/\\text{Loss}$) and Win Probability ($p$) sensitivity matrix",
      "Drawdown probability estimation and expected compound growth rate",
      "Risk of ruin curve visualization under varying sample sizes"
    ],
    pricing: "100% Free",
    actionLabel: "Launch Position Calculator",
    github: "https://github.com/khalidabdullahh",
    relatedProject: "proj-market-suite",
    relatedExperiment: "exp-market-regime"
  },
  {
    id: "tool-vector-viz",
    name: "Vector Norm ($L_p$) & Distance Visualizer",
    tagline: "Explore geometric unit balls for L1 (Manhattan), L2 (Euclidean), and Linf norms.",
    category: "Research & Math",
    icon: "compass",
    status: "Interactive In-Browser",
    statusColor: "blue",
    isInteractiveInSite: true,
    interactiveComponent: "VectorNormVisualizer",
    featured: false,
    badge: "Math Visualizer",
    description: "Interactive 2D geometric canvas demonstrating how different vector norms $\\|x\\|_p$ shape unit circles, regularization loss surfaces (Lasso vs. Ridge), and cosine distance metrics in machine learning feature spaces.",
    capabilities: [
      "Continuous $p$-value slider ($p \\in [0.5, 10]$ and $p = \\infty$)",
      "Interactive draggable vector handles with real-time norm telemetry",
      "Visual demonstration of Lasso corner sparsity vs Ridge circular shrinkage",
      "Inner product and cosine angle geometry overlay"
    ],
    pricing: "100% Free",
    actionLabel: "Launch Geometry Canvas",
    github: "https://github.com/khalidabdullahh",
    relatedProject: "proj-algoviz",
    relatedExperiment: "exp-vector-geometry"
  },
  {
    id: "tool-oops-game",
    name: "Oops! Web Multiverse Player",
    tagline: "Play the 150-stage multiverse platformer directly in browser.",
    category: "Developer & Game",
    icon: "gamepad-2",
    status: "Live / Playable",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://oops-snowy-three.vercel.app/",
    featured: false,
    badge: "Playable Arcade",
    description: "Experience the deceptive 2D puzzle platformer directly in modern desktop and mobile browsers. Features zero-lag physics, real-time gravity inversion, and synthesized audio.",
    capabilities: [
      "150 handcrafted stages across 5 multiverse worlds",
      "Touch gamepad for mobile and keyboard arrow controls for desktop",
      "Runs with zero installations directly via HTML5 & Web Audio"
    ],
    pricing: "100% Free",
    actionLabel: "Play Oops! Live ↗",
    github: "https://github.com/khalidabdullahh",
    relatedProject: "proj-oops",
    relatedExperiment: "exp-game-physics"
  }
];
