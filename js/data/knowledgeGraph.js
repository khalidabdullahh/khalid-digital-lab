/**
 * Interactive Knowledge Graph Nodes & Relationships
 * Author: Khalid Abdullah
 */

export const KNOWLEDGE_GRAPH = {
  nodes: [
    // Core Domain Hubs
    { id: "domain-cs", label: "Computer Science", group: "core", radius: 24, color: "#3b82f6", desc: "Algorithms, complexity theory, state machines & systems" },
    { id: "domain-ai", label: "Artificial Intelligence", group: "core", radius: 24, color: "#8b5cf6", desc: "LLMs, vector embeddings, prompt distillation & neural architectures" },
    { id: "domain-quant", label: "Quantitative Finance", group: "core", radius: 24, color: "#00f0ff", desc: "Statistical arbitrage, regime switching, volatility modeling & risk" },
    { id: "domain-math", label: "Mathematics & Statistics", group: "core", radius: 22, color: "#10b981", desc: "Linear algebra, probability theory, stochastic processes & optimization" },
    { id: "domain-swe", label: "Software Engineering", group: "core", radius: 22, color: "#f59e0b", desc: "Modern frontend, high-performance web systems, reactive architectures & databases" },

    // Concept Nodes
    { id: "node-regime", label: "Market Regime Detection", group: "quant", radius: 16, color: "#00f0ff", desc: "HMM-based segmentation of market states" },
    { id: "node-hmm", label: "Hidden Markov Models", group: "math", radius: 14, color: "#10b981", desc: "Unsupervised statistical sequence models" },
    { id: "node-pca", label: "Principal Component Analysis", group: "math", radius: 15, color: "#10b981", desc: "Spectral decomposition of equity covariance matrices" },
    { id: "node-volatility", label: "Volatility Modeling", group: "quant", radius: 14, color: "#00f0ff", desc: "Parkinson, Garman-Klass & realized volatility estimators" },
    { id: "node-amt", label: "Auction Market Theory", group: "quant", radius: 14, color: "#00f0ff", desc: "Volume profile, value area & order flow liquidity dynamics" },
    { id: "node-kelly", label: "Kelly Criterion", group: "quant", radius: 13, color: "#00f0ff", desc: "Optimal logarithmic capital allocation & drawdown risk" },
    { id: "node-vector-norms", label: "Vector Norms (L1 / L2)", group: "math", radius: 14, color: "#10b981", desc: "Geometric unit balls, Lasso sparsity & Ridge shrinkage" },
    { id: "node-llm", label: "LLM Agents & Embeddings", group: "ai", radius: 16, color: "#8b5cf6", desc: "Semantic retrieval, cosine distance & structured output generation" },
    { id: "node-prompt", label: "Prompt Distillation", group: "ai", radius: 14, color: "#8b5cf6", desc: "Chain-of-verification and structured JSON schema enforcement" },
    { id: "node-ats", label: "ATS Resume Engineering", group: "swe", radius: 15, color: "#f59e0b", desc: "Lexical similarity matching & vector PDF generation" },
    { id: "node-rbac", label: "Supabase RBAC & RLS", group: "swe", radius: 15, color: "#f59e0b", desc: "Edge middleware guards & database-level cryptographic Row Level Security" },
    { id: "node-postgres", label: "PostgreSQL Architecture", group: "swe", radius: 14, color: "#f59e0b", desc: "ACID schema designs, anti-replay unique constraints & partial indexes" },
    { id: "node-tournament-engine", label: "Tournament State Machine", group: "cs", radius: 14, color: "#3b82f6", desc: "Anti-overbooking locks, payment reconciliation & gated lobby access" },
    { id: "node-physics", label: "Zero-Allocation Physics", group: "cs", radius: 14, color: "#3b82f6", desc: "Pre-allocated memory pools for 60 FPS browser engines" },
    { id: "node-state-machines", label: "Finite State Machines", group: "cs", radius: 14, color: "#3b82f6", desc: "Deterministic game state transitions & gravity inversion" }
  ],

  links: [
    // Core Domain Interlinks
    { source: "domain-cs", target: "domain-ai", strength: 0.8 },
    { source: "domain-ai", target: "domain-quant", strength: 0.7 },
    { source: "domain-quant", target: "domain-math", strength: 0.9 },
    { source: "domain-math", target: "domain-cs", strength: 0.7 },
    { source: "domain-cs", target: "domain-swe", strength: 0.85 },
    { source: "domain-swe", target: "domain-ai", strength: 0.75 },

    // Quant / Math Connections
    { source: "node-regime", target: "domain-quant" },
    { source: "node-regime", target: "node-hmm" },
    { source: "node-regime", target: "node-volatility" },
    { source: "node-hmm", target: "domain-math" },
    { source: "node-hmm", target: "domain-ai" },
    { source: "node-pca", target: "domain-math" },
    { source: "node-pca", target: "domain-quant" },
    { source: "node-pca", target: "node-vector-norms" },
    { source: "node-amt", target: "domain-quant" },
    { source: "node-kelly", target: "domain-quant" },
    { source: "node-kelly", target: "domain-math" },
    { source: "node-vector-norms", target: "domain-math" },
    { source: "node-vector-norms", target: "domain-ai" },

    // AI / Software Connections
    { source: "node-llm", target: "domain-ai" },
    { source: "node-llm", target: "node-prompt" },
    { source: "node-prompt", target: "node-ats" },
    { source: "node-ats", target: "domain-swe" },
    { source: "node-ats", target: "node-llm" },
    { source: "node-rbac", target: "domain-swe" },
    { source: "node-rbac", target: "node-postgres" },
    { source: "node-postgres", target: "domain-swe" },
    { source: "node-tournament-engine", target: "node-rbac" },
    { source: "node-tournament-engine", target: "node-postgres" },
    { source: "node-tournament-engine", target: "domain-cs" },

    // Systems / CS Connections
    { source: "node-physics", target: "domain-cs" },
    { source: "node-physics", target: "node-state-machines" },
    { source: "node-state-machines", target: "domain-cs" },
    { source: "node-physics", target: "domain-swe" }
  ]
};
