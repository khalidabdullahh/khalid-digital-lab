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
    technologies: ["Next.js 16", "React 19", "Google Gemini AI", "Tailwind CSS", "PDF Engine"],
    shortDescription: "An intelligent, user-first resume creator designed to help job seekers, developers, and students craft outstanding, ATS-proof resumes in minutes with 1-click HD PDF export.",
    problem: "Job seekers spend hours wrestling with misaligned Word templates and getting silently rejected by modern Applicant Tracking Systems (ATS) due to unstructured layouts, missing keywords, and poor typographic hierarchy.",
    solution: "Built a lightning-fast web platform featuring 10 versatile design templates (Academic ATS, Modern Dark Sidebar, Swiss Grid, Executive Gold, Developer Terminal), integrated Google Gemini for instant accomplishment rephrasing, custom photo compression, and 1-click pixel-perfect PDF export without watermarks.",
    highlights: [
      "10 Tailored Resume Templates for developers, researchers, and executives",
      "Built-in Google Gemini AI writer to polish summaries and work experience",
      "100% ATS-Compliant layouts designed to pass corporate scanners",
      "Instant 1-Click HD PDF Download with clean vector typography",
      "Client-side image compression and seamless monetization modal"
    ],
    liveUrl: "https://first-project-plum-phi.vercel.app",
    githubUrl: "https://github.com/khalidabdullahh/CV-Builder",
    relatedExperiment: "exp-cv-intelligence",
    relatedTool: "tool-cv-builder",
    badge: "Flagship Product"
  },
  {
    id: "proj-market-suite",
    title: "Market Regime & Volatility Intelligence Suite",
    tagline: "Quantitative HMM Regime Detection & Volatility Modeling Platform",
    category: "Quantitative Finance & ML",
    featured: true,
    status: "Active Development",
    statusColor: "amber",
    year: "2026",
    technologies: ["Python", "Hidden Markov Models", "NumPy", "Pandas", "Chart.js / Canvas", "FastAPI"],
    shortDescription: "A quantitative research and simulation engine that segments asset price action into trending, ranging, and high-volatility liquidity regimes using unsupervised statistical models.",
    problem: "Traditional algorithmic trading strategies rely heavily on linear moving averages and fixed indicator thresholds, causing massive drawdowns during unexpected market regime shifts from trending to mean-reverting states.",
    solution: "Designed a multi-state Gaussian HMM pipeline combined with Parkinson and Garman-Klass volatility estimators to classify tick data in real-time, compute transition probability matrices, and optimize dynamic position sizing.",
    highlights: [
      "3-State Gaussian Hidden Markov Model for bull, chop, and liquidation regimes",
      "Dynamic volatility clustering and transition probability matrices",
      "Interactive Monte Carlo simulation playground directly in the browser",
      "Real-time regime classification without lookahead data leakage",
      "Kelly Criterion integration for regime-adjusted risk allocation"
    ],
    liveUrl: "#tools",
    githubUrl: "https://github.com/khalidabdullahh",
    relatedExperiment: "exp-market-regime",
    relatedTool: "tool-regime-simulator",
    badge: "Core Research"
  },
  {
    id: "proj-oops",
    title: "Oops! (Chaos Realm)",
    tagline: "Multiverse Deceptive 2D Platformer with Real-Time Gravity Inversion",
    category: "Game Engineering & Systems",
    featured: false,
    status: "Shipped / Live",
    statusColor: "emerald",
    year: "2026",
    technologies: ["Phaser 2D", "JavaScript ES6", "Web Audio API", "Capacitor", "PWA"],
    shortDescription: "A deceptive, trap-filled 2D puzzle platformer featuring 150 handcrafted stages across 5 multiverse worlds, real-time gravity inversion mechanics, and pure synthesized Web Audio chiptunes.",
    problem: "Modern web games frequently suffer from micro-stutters and high memory overhead on mobile devices due to constant object allocation in animation loops and bulky audio file streaming.",
    solution: "Engineered a zero-garbage-collection state machine architecture with pre-allocated vector pools and real-time procedural sound synthesis via the Web Audio API, delivering a butter-smooth 60 FPS across desktop and mobile.",
    highlights: [
      "150 Handcrafted Levels across 5 Worlds (Desert, Frost, Shadow, Gravity Nexus, Glitch)",
      "Real-Time Gravity Inversion (ceiling walking, inverted hazards)",
      "Zero-Latency Synthesized Chiptune Audio without external MP3 files",
      "Responsive Mobile Touch Gamepad with multi-touch support",
      "PWA offline installation and Android APK build"
    ],
    liveUrl: "https://oops-snowy-three.vercel.app/",
    githubUrl: "https://github.com/khalidabdullahh",
    relatedExperiment: "exp-game-physics",
    relatedTool: "tool-vector-viz",
    badge: "Live Game"
  },
  {
    id: "proj-findoc",
    title: "FinDoc: LLM Financial Alpha Extractor",
    tagline: "Semantic SEC 10-K/10-Q Disclosure Parser & PEAD Sentiment Indexer",
    category: "AI & Natural Language Processing",
    featured: false,
    status: "Research Prototype",
    statusColor: "blue",
    year: "2026",
    technologies: ["PyTorch", "LangChain", "Hugging Face", "ChromaDB", "FastAPI"],
    shortDescription: "A specialized NLP vector search and sentiment extraction pipeline that parses corporate financial disclosures to quantify management certainty and guidance revisions.",
    problem: "Financial filings contain thousands of dense legalistic sentences where critical sentiment shifts and subtle risk warnings are easily buried under corporate boilerplates.",
    solution: "Engineered a hierarchical document chunking architecture with parent-document retrieval and Chain-of-Verification prompting to score sentence-level optimism, risk exposure, and CAPEX guidance.",
    highlights: [
      "Hierarchical SEC EDGAR XML & Markdown parser",
      "Parent-document vector retrieval with dense and sparse hybrid search",
      "Chain-of-Verification to eliminate hallucinations on numeric tables",
      "Correlation analysis with Post-Earnings Announcement Drift (PEAD)"
    ],
    liveUrl: "#lab",
    githubUrl: "https://github.com/khalidabdullahh",
    relatedExperiment: "exp-llm-fin-research",
    relatedTool: "tool-ats-analyzer",
    badge: "AI Pipeline"
  },
  {
    id: "proj-algoviz",
    title: "AlgoViz: High-Performance Algorithm Visualizer",
    tagline: "Interactive Graph, Sorting & Dynamic Programming Canvas",
    category: "Algorithms & Education",
    featured: false,
    status: "Completed",
    statusColor: "emerald",
    year: "2026",
    technologies: ["JavaScript ES6", "HTML5 Canvas", "Tailwind CSS", "Data Structures"],
    shortDescription: "An interactive educational workbench that visualizes graph traversals (Dijkstra, A*, BFS/DFS), sorting algorithms, and dynamic programming memory matrices step-by-step.",
    problem: "Understanding abstract algorithmic time complexities and pointer manipulations can be difficult without real-time state introspection.",
    solution: "Built a hardware-accelerated Canvas engine that renders step-by-step array state swaps, priority queue states, and shortest path wavefront expansions with controllable execution speeds.",
    highlights: [
      "Pathfinding visualizer with obstacle generation (Dijkstra, A*, Greedy Best-First)",
      "Sorting algorithm comparison arena (QuickSort, MergeSort, HeapSort)",
      "Interactive Dynamic Programming 2D memoization grid",
      "Real-time operation counters and time complexity telemetry"
    ],
    liveUrl: "#tools",
    githubUrl: "https://github.com/khalidabdullahh",
    relatedExperiment: "exp-game-physics",
    relatedTool: "tool-vector-viz",
    badge: "Interactive"
  }
];
