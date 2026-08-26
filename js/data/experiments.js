/**
 * The Lab - Research Experiments Dataset
 * Author: Khalid Abdullah
 */

export const EXPERIMENTS = [
  {
    id: "exp-market-regime",
    title: "Market Regime Detection via Hidden Markov Models",
    category: "Quantitative Finance",
    status: "experimenting", // active, experimenting, research, archived
    statusLabel: "Experimenting",
    statusColor: "amber",
    progress: 72,
    lastUpdated: "Aug 2026",
    technologies: ["Python", "HMMlearn", "NumPy", "Pandas", "Scikit-Learn", "Matplotlib"],
    researchQuestion: "Can unsupervised Hidden Markov Models and Gaussian Mixture Models reliably segment financial time series into trending, mean-reverting, and high-volatility regimes without lookahead bias?",
    hypothesis: "A 3-state Gaussian HMM trained on rolling logarithmic returns, Parkinson high-low volatility, and volume imbalance will identify regime transitions 2 to 4 bars earlier than traditional moving-average crossover indicators.",
    methodology: [
      "Extracted 5-minute tick data for equity indices and FX pairs over 3 years.",
      "Computed continuous features: Log Returns $r_t = \\ln(P_t / P_{t-1})$, Realized Volatility $\\sigma_t$, and Order Flow Imbalance (OFI).",
      "Fitted a 3-state Gaussian Hidden Markov Model with transition matrix $A \\in \\mathbb{R}^{3 \\times 3}$ using Baum-Welch Expectation-Maximization.",
      "Evaluated out-of-sample forward filtering with Viterbi path decoding.",
      "Benchmarked against standard Markov Switching Autoregression (MS-AR)."
    ],
    mathFormula: `P(S_t = j \\mid S_{t-1} = i) = A_{ij}, \\quad Y_t \\mid S_t = j \\sim \\mathcal{N}(\\mu_j, \\Sigma_j)`,
    codeSnippet: `import numpy as np
from hmmlearn.hmm import GaussianHMM

# Fit 3-State Gaussian Hidden Markov Model
model = GaussianHMM(n_components=3, covariance_type="full", n_iter=1000, random_state=42)
features = np.column_stack([log_returns, parkinson_volatility, ofi_ratio])
model.fit(features)

# Decode hidden state sequence (0: Bull Trend, 1: Range, 2: Volatile Bear)
hidden_states = model.predict(features)
transition_matrix = model.transmat_
print("Stationary Regime Probabilities:", model.get_stationary_distribution())`,
    results: [
      "Identified Regime 0 (Low Volatility Trend): Mean return +0.08%/bar, annual Sharpe ratio 2.1.",
      "Identified Regime 1 (Mean Reversion Chop): Mean return ~0.00%, autocorrelation -0.34 at lag 1.",
      "Identified Regime 2 (High Volatility Liquidation): Standard deviation 3.8x baseline, cluster decay 6.2 hours.",
      "Out-of-sample regime classification precision reached 78.4% on validation windows."
    ],
    learnings: [
      "Raw prices and returns alone are insufficient; volatility estimators (Garman-Klass or Parkinson) are necessary for rapid state transitions.",
      "Standard EM algorithms can get stuck in local optima without proper Dirichlet priors on transition matrices.",
      "Adding a minimum regime duration penalty prevents high-frequency flickering between states."
    ],
    relatedProject: "proj-market-suite",
    relatedTool: "tool-regime-simulator",
    interactiveDemoAvailable: true
  },
  {
    id: "exp-llm-fin-research",
    title: "LLM Alpha Signal Extraction from Financial Filings",
    category: "AI & NLP",
    status: "research",
    statusLabel: "Research",
    statusColor: "blue",
    progress: 48,
    lastUpdated: "Aug 2026",
    technologies: ["PyTorch", "Hugging Face", "LangChain", "Gemini Pro", "ChromaDB", "FastAPI"],
    researchQuestion: "Can small, quantized Large Language Models (7B-8B parameters) extract structured sentiment and forward-looking guidance signals from SEC 10-K/10-Q filings with lower hallucination rates than zero-shot commercial frontier models?",
    hypothesis: "By combining sentence-level tabular retrieval with chain-of-verification (CoVe) and structured JSON schema enforcement, domain-adapted models will outperform generic LLM sentiment indices by >25% in post-earnings announcement drift (PEAD) correlation.",
    methodology: [
      "Parsed Item 7 (MD&A) and Item 1A (Risk Factors) from 1,200 annual reports across S&P 500 companies.",
      "Built hierarchical chunking index with parent-document retrieval in ChromaDB.",
      "Engineered structured prompt templates with strict certainty calibration metrics (Hedging, Optimism, Contingent Liabilities).",
      "Tested cross-encoder verification pipelines against SEC EDGAR ground-truth financial outcomes."
    ],
    mathFormula: `\\text{Sentiment Score} = \\frac{\\sum_{k} w_k \\cdot S_{\\text{positive}}(c_k) - \\sum_{k} w_k \\cdot S_{\\text{negative}}(c_k)}{\\sum_{k} w_k \\cdot (S_{\\text{positive}} + S_{\\text{negative}} + \\epsilon)}`,
    codeSnippet: `from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

# Context-Aware Financial Chunking Pipeline
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")
vectorstore = Chroma(collection_name="sec_10k_mda", embedding_function=embeddings)

def extract_guidance_signals(filing_text, ticker):
    relevant_chunks = vectorstore.similarity_search_with_score(
        f"{ticker} forward looking capital expenditures revenue guidance", k=6
    )
    # Structured schema validation
    return generate_verified_alpha_profile(relevant_chunks)`,
    results: [
      "Hallucination rate reduced from 14.2% (zero-shot) to 1.8% using hierarchical CoVe retrieval.",
      "Spearman rank correlation of $\\rho = 0.41$ with 3-day post-earnings excess returns on test sample.",
      "Inference speed optimized to 42 tokens/sec on local consumer GPUs using 4-bit AWQ quantization."
    ],
    learnings: [
      "Standard token chunking destroys financial tabular contexts; tables must be serialized as Markdown or XML with header repetition.",
      "Quantized models handle numeric comparisons poorly unless prompted to show intermediate calculation steps."
    ],
    relatedProject: "proj-findoc",
    relatedTool: "tool-ats-analyzer",
    interactiveDemoAvailable: false
  },
  {
    id: "exp-cv-intelligence",
    title: "Embedding Distance & Prompt Distillation for ATS Optimization",
    category: "Software & AI",
    status: "active",
    statusLabel: "Active / Shipped",
    statusColor: "emerald",
    progress: 100,
    lastUpdated: "Aug 2026",
    technologies: ["Next.js", "React", "Gemini 1.5 Flash", "Tailwind CSS", "PDFKit", "Cosine Similarity"],
    researchQuestion: "What is the optimal balance between automated semantic keyword injection and authentic natural language cadence when optimizing resumes for Applicant Tracking Systems (Workday, Greenhouse, Lever)?",
    hypothesis: "A two-pass prompt distillation model that first extracts hard technical competencies from a target job description and then weaves them into the candidate's authentic project achievements will yield ATS match scores $\\ge 90\\%$ without keyword stuffing penalties.",
    methodology: [
      "Built automated parser for 10 distinct industry resume formats (Swiss Grid, Academic, Developer Terminal, Executive).",
      "Implemented a token-distance metric measuring candidate bullet point alignment against weighted job description embeddings.",
      "Designed real-time prompt chains using Google Gemini for context-aware achievement rephrasing with Action-Context-Result (CAR) structure.",
      "Shipped production implementation in the live AI CV Builder product with instant 1-click HD PDF compilation."
    ],
    mathFormula: `\\text{Match Score}(C, J) = \\alpha \\cos(\\mathbf{e}_C, \\mathbf{e}_J) + \\beta \\frac{|K_C \\cap K_J|}{|K_J|} + \\gamma \\text{Readability}(C)`,
    codeSnippet: `// Two-Pass Semantic Resume Optimizer
export async function optimizeResumeBullet(bulletText, targetJobKeywords) {
  const prompt = \`
    You are an expert technical recruiter and resume editor.
    Refactor the following bullet point to highlight high-impact metrics (XYZ format):
    Original: "\${bulletText}"
    Target Keywords: \${targetJobKeywords.join(", ")}
    Preserve truthfulness, eliminate fluff, and maintain natural human tone.
  \`;
  const response = await geminiClient.generateContent(prompt);
  return response.text.trim();
}`,
    results: [
      "Deployed to production serving thousands of generated resumes with 10 ATS-ready templates.",
      "Average ATS score improvement of +42% across sample benchmark resumes.",
      "Sub-second client-side PDF rendering with zero watermarks."
    ],
    learnings: [
      "Multi-column complex CSS grid templates frequently break legacy PDF rasterizers; pure semantic flex layouts ensure 100% vector fidelity.",
      "User control is critical: providing side-by-side before/after comparisons dramatically increases user trust in AI suggestions."
    ],
    relatedProject: "proj-cv-builder",
    relatedTool: "tool-cv-builder",
    interactiveDemoAvailable: true
  },
  {
    id: "exp-game-physics",
    title: "Zero-Allocation State Machines for 60FPS Multiverse Physics",
    category: "Computer Science",
    status: "active",
    statusLabel: "Active / Shipped",
    statusColor: "emerald",
    progress: 100,
    lastUpdated: "Aug 2026",
    technologies: ["Phaser 2D", "JavaScript ES6", "Web Audio API", "HTML5 Canvas", "Capacitor"],
    researchQuestion: "Can complex frame-locked gravity inversion and dynamic hazard state machines be implemented in web mobile browsers with zero per-frame heap allocations to guarantee 60 FPS without garbage collection stutter?",
    hypothesis: "By utilizing pre-allocated object pools, bitwise collision masks, and integer lookup tables for gravity vectors, mobile browser frame drops can be reduced by 99% compared to traditional object-instantiation event loops.",
    methodology: [
      "Engineered a custom physics layer for 'Oops! (Chaos Realm)' spanning 150 stages across 5 multiverse worlds.",
      "Implemented a circular particle pool and reusable vector state machine for real-time gravity flipping (`Shift` / touch).",
      "Constructed a pure Web Audio API procedural synthesizer to eliminate audio asset loading latency.",
      "Benchmarked memory profiles across low-end mobile devices and Chrome/Safari engines."
    ],
    mathFormula: `\\vec{v}_{t+1} = \\vec{v}_t + \\mathbf{R}(\\theta_{\\text{gravity}}) \\vec{g} \\Delta t - \\mu \\vec{v}_t \\Delta t`,
    codeSnippet: `// Pre-Allocated Zero-GC Gravity State Transition
class GravityManager {
  constructor(player) {
    this.player = player;
    this.gravityState = 0; // 0: Down, 1: Up, 2: Left, 3: Right
    this.vectorLookup = [
      { x: 0, y: 980 },
      { x: 0, y: -980 },
      { x: -980, y: 0 },
      { x: 980, y: 0 }
    ];
  }
  invertGravity() {
    this.gravityState = (this.gravityState + 1) % 4;
    const g = this.vectorLookup[this.gravityState];
    this.player.body.setGravity(g.x, g.y);
  }
}`,
    results: [
      "Achieved stable 60.0 FPS with 0 garbage collection pauses across 150 handcrafted levels.",
      "Total game memory footprint kept below 24MB including all 5 world sprite sheets and synthesized audio.",
      "Successfully wrapped and packaged for web, desktop, and Android APK."
    ],
    learnings: [
      "Avoid creating temporary vectors or coordinate objects inside update() loops.",
      "Procedural Web Audio nodes (oscillators and gain ramps) require strict lifecycle recycling to prevent browser audio context exhaustion."
    ],
    relatedProject: "proj-oops",
    relatedTool: "tool-vector-viz",
    interactiveDemoAvailable: true
  },
  {
    id: "exp-vector-geometry",
    title: "High-Dimensional Vector Norms & Distance Metric Behavior",
    category: "Mathematical Modeling",
    status: "research",
    statusLabel: "Research",
    statusColor: "blue",
    progress: 60,
    lastUpdated: "Aug 2026",
    technologies: ["Linear Algebra", "Python", "NumPy", "Canvas 2D", "KaTeX"],
    researchQuestion: "How do sparsity-inducing $L_1$ norms and smooth $L_2$ regularizations behave geometrically when applied to multi-factor risk attribution in high-dimensional financial asset spaces ($d > 500$)?",
    hypothesis: "Visualizing the intersection of least-squares loss contours with $L_p$ unit balls in real-time provides immediate intuitive clarity on why Lasso ($L_1$) produces exact zero factor loadings whereas Ridge ($L_2$) produces dense shrinkage.",
    methodology: [
      "Formulated the continuous $L_p$ norm: $\\|x\\|_p = (\\sum |x_i|^p)^{1/p}$ for $p \\in (0, \\infty]$.",
      "Constructed an interactive 2D/3D geometric visualization of unit balls and gradient projection dynamics.",
      "Tested factor selection stability across collinear macroeconomic indicator sets."
    ],
    mathFormula: `\\|\\mathbf{x}\\|_p = \\left( \\sum_{i=1}^n |x_i|^p \\right)^{1/p}, \\quad \\lim_{p \\to \\infty} \\|\\mathbf{x}\\|_p = \\max_i |x_i|`,
    codeSnippet: `// Compute Lp norm for arbitrary p >= 1
function computeLpNorm(vector, p) {
  if (p === Infinity) {
    return Math.max(...vector.map(Math.abs));
  }
  const sum = vector.reduce((acc, val) => acc + Math.pow(Math.abs(val), p), 0);
  return Math.pow(sum, 1 / p);
}`,
    results: [
      "Demonstrated exact sparse corner intersections for $p \\le 1$.",
      "Interactive unit ball canvas built and integrated into the Tools Hub for public exploration."
    ],
    learnings: [
      "Geometric intuition significantly accelerates algorithmic tuning compared to purely algebraic proofs.",
      "For $p < 1$, non-convex optimization introduces multiple local minima, requiring subgradient heuristics."
    ],
    relatedProject: "proj-market-suite",
    relatedTool: "tool-vector-viz",
    interactiveDemoAvailable: true
  }
];
