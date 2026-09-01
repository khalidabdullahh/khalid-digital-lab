/**
 * Knowledge Base & Learning Space Dataset
 * Author: Khalid Abdullah
 */

export const KNOWLEDGE_ARTICLES = [
  {
    id: "kb-supabase-rbac",
    title: "Architecting Role-Based Access Control (RBAC) & Row Level Security in Supabase",
    category: "Backend & Security",
    readTime: "7 min read",
    date: "Aug 2026",
    tags: ["PostgreSQL", "Supabase", "Row Level Security", "RBAC", "Next.js"],
    summary: "How defense-in-depth authorization with Next.js Edge Middleware and PostgreSQL RLS prevents privilege escalation in multi-role platforms.",
    content: `
### 1. The Multi-Layer Authorization Imperative
In modern web applications, client-side route guards and server-side action checks are necessary but insufficient on their own. A robust security model enforces authorization at three distinct boundaries:
1. **Edge Middleware Guard:** Intercepts route requests before component rendering to redirect unauthorized requests.
2. **Server Action Mutation Boundary:** Validates request parameters against strict schemas (e.g. Zod) and authenticates session identities.
3. **Database Row Level Security (RLS) Layer:** Cryptographically limits which rows can be read, inserted, or mutated directly within the SQL engine.

### 2. Role Taxonomy & Defense-in-Depth
In ARENEX, users are categorized into \`USER\`, \`SUPER_ADMIN\`, and \`OWNER\`. To prevent privilege escalation (e.g. a user patching their own role column to SUPER_ADMIN), RLS update policies enforce immutable role attributes:
\`\`\`sql
CREATE POLICY "Users can only update safe profile fields" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);
\`\`\`

### 3. Synchronous Profile Provisioning
To avoid race conditions where users log in via OAuth but disconnect before profile creation, an asynchronous PostgreSQL trigger on \`auth.users\` guarantees synchronous profile provisioning in the public schema with default \`USER\` privileges.
    `,
    relatedExperiment: "exp-cv-intelligence",
    relatedNodeId: "node-rbac"
  },
  {
    id: "kb-payment-reconciliation",
    title: "Designing Fraud-Proof Payment Verification & Time-Gated Credential State Machines",
    category: "Software Architecture",
    readTime: "6 min read",
    date: "Aug 2026",
    tags: ["State Machines", "PostgreSQL", "Esports", "Payments", "Concurrency"],
    summary: "Preventing transaction replay attacks, slot overbooking race conditions, and premature lobby credential leaks in tournament platforms.",
    content: `
### 1. Challenges in Semi-Automated Payment Systems
When players submit transaction IDs from Mobile Financial Services (bKash, Nagad, Rocket, UPI), systems face three distinct failure modes:
1. **Replay Attacks:** Submitting the same transaction ID multiple times across different tournaments.
2. **Concurrent Slot Overbooking:** Two players paying when only 1 slot remains in a 48-slot lobby.
3. **Premature Room Discovery:** Unconfirmed players discovering match room credentials before payment verification.

### 2. The Anti-Replay Unique Constraint
\`\`\`sql
ALTER TABLE public.payment_records
ADD CONSTRAINT unique_payment_tx_per_method 
UNIQUE (payment_method, transaction_id);
\`\`\`

### 3. ACID Row Locking with FOR UPDATE
When a Super Admin approves a payment, the slot allocation transaction executes an atomic \`SELECT ... FOR UPDATE\` lock on the tournament row to prevent concurrent race conditions from overbooking lobby slots.

### 4. Time-Gated Credential RLS
Room credentials remain invisible until the server timestamp exceeds the configured \`release_time\` (e.g. 15 minutes before match start), enforced directly at the SQL query layer.
    `,
    relatedExperiment: "exp-market-regime",
    relatedNodeId: "node-state-machines"
  },
  {
    id: "kb-pca-factors",
    title: "Understanding Principal Component Analysis (PCA) in Equity Factor Models",
    category: "Quantitative Finance",
    readTime: "6 min read",
    date: "Aug 2026",
    tags: ["Linear Algebra", "PCA", "Eigenvalues", "Risk Models", "Python"],
    summary: "How spectral decomposition of the covariance matrix extracts statistical risk factors (Market, Size, Momentum) and reduces noise in multi-asset portfolio optimization.",
    content: `
### 1. The Dimensionality Problem in Financial Covariance
When managing a portfolio of $N = 500$ equities, estimating the full sample covariance matrix $\\mathbf{\\Sigma} \\in \\mathbb{R}^{500 \\times 500}$ requires estimating $N(N+1)/2 = 125,250$ distinct parameters. When the number of observations $T$ is on the same order as $N$, the sample covariance matrix is ill-conditioned and dominated by noise (Marchenko-Pastur distribution).

### 2. Spectral Decomposition & Eigenstructure
PCA decomposes the standardized return matrix $\\mathbf{X} \\in \\mathbb{R}^{T \\times N}$ by computing the eigendecomposition of the sample correlation matrix:
$$\\mathbf{C} = \\frac{1}{T} \\mathbf{X}^T \\mathbf{X} = \\mathbf{V} \\mathbf{\\Lambda} \\mathbf{V}^T$$
where $\\mathbf{V} = [\\mathbf{v}_1, \\mathbf{v}_2, \\dots, \\mathbf{v}_N]$ are orthonormal eigenvectors (factor loadings) and $\\mathbf{\\Lambda} = \\operatorname{diag}(\\lambda_1, \\lambda_2, \\dots, \\lambda_N)$ are ordered eigenvalues representing variance explained.

### 3. Financial Interpretation of Top Components
- **First Component (PC1 - The Market Mode):** All loadings $\\mathbf{v}_1$ share the same sign (typically positive), explaining 40% to 65% of total variance across equities. This corresponds to systemic market beta.
- **Second Component (PC2 - Sector Divergence):** Loadings split between Cyclicals/Tech and Defensives/Utilities, capturing interest rate and macroeconomic sensitivity.
- **Third Component (PC3 - Momentum / Size):** Reflects cross-sectional relative strength.

### 4. Code Implementation
\`\`\`python
import numpy as np

def compute_pca_factors(returns_matrix, k_components=3):
    # Standardize returns
    X = (returns_matrix - np.mean(returns_matrix, axis=0)) / np.std(returns_matrix, axis=0)
    # Correlation matrix & Eigendecomposition
    corr_matrix = np.corrcoef(X, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(corr_matrix)
    
    # Sort in descending order
    idx = np.argsort(eigenvalues)[::-1]
    top_eigenvalues = eigenvalues[idx][:k_components]
    top_eigenvectors = eigenvectors[:, idx][:, :k_components]
    
    # Project returns onto statistical factors
    factor_returns = X @ top_eigenvectors
    return top_eigenvalues, top_eigenvectors, factor_returns
\`\`\`

### 5. Key Takeaways
1. Truncating the eigenvalues below the Marchenko-Pastur noise threshold yields cleaned covariance matrices with drastically superior out-of-sample minimum-variance portfolio stability.
2. Statistical factors change over time; rolling 252-day PCA windows reveal regime shifts in factor correlations.
    `,
    relatedExperiment: "exp-market-regime",
    relatedNodeId: "node-pca"
  },
  {
    id: "kb-auction-market-theory",
    title: "How Auction Market Theory & Volume Profile Explain Market Structure",
    category: "Market Microstructure",
    readTime: "7 min read",
    date: "Aug 2026",
    tags: ["Microstructure", "Volume Profile", "Auction Theory", "Order Flow"],
    summary: "A structural view of price discovery: Value Area ($VA$), Point of Control ($POC$), responsive vs. initiative participants, and liquidity distribution across horizontal volume nodes.",
    content: `
### 1. The Fundamental Law of Financial Auctions
Auction Market Theory posits that financial markets exist for a single purpose: **to facilitate two-way trade between buyers and sellers**. 
Price is an advertising mechanism; **time** regulates opportunities; **volume** measures market acceptance or rejection.

### 2. Gaussian Bell Distribution & Value Area
In balanced conditions, auction volume conforms to a bell curve across price levels:
$$\\text{Value Area} (VA) = \\left\\{ P_k \\;\\middle|\\; \\sum_{k \\in VA} \\text{Vol}(P_k) \\approx 0.682 \\times \\sum_{\\text{all } j} \\text{Vol}(P_j) \\right\\}$$
- **Point of Control ($POC$):** The single price level with the highest traded volume during the session. Represents maximum fair value consensus.
- **Value Area High ($VAH$) & Value Area Low ($VAL$):** The upper and lower boundaries containing 1 standard deviation ($68.2\\%$) of traded volume.

### 3. High Volume Nodes ($HVN$) vs Low Volume Nodes ($LVN$)
- **High Volume Nodes ($HVN$):** Price zones of prolonged acceptance and high liquidity. Price tends to slow down and consolidate inside HVNs.
- **Low Volume Nodes ($LVN$):** Price zones of rapid rejection and thin order book depth. Price moves through LVNs with high velocity because market orders easily sweep limited resting liquidity.

### 4. Participant Dynamics: Initiative vs. Responsive
| Participant Type | Action Condition | Strategic Intent |
|---|---|---|
| **Responsive Buyer** | Price drops below $VAL$ into discount | Buys perceived undervalue, driving price back toward $POC$ |
| **Initiative Buyer** | Price breaks above $VAH$ on heavy volume | Aggressively buys at premium, seeking to discover a new higher value area |

### 5. Algorithmic Application
Tracking whether price opens inside or outside the previous day's Value Area provides an immediate statistical prior: **In-Value opens mean-revert $73\\%$ of the time**, whereas **Out-of-Value opens with high initiative volume trend with $68\\%$ directional persistence**.
    `,
    relatedExperiment: "exp-market-regime",
    relatedNodeId: "node-amt"
  },
  {
    id: "kb-vector-norms",
    title: "Geometric Intuition Behind Vector Norms and Regularization (L1 vs L2)",
    category: "Mathematics & ML",
    readTime: "5 min read",
    date: "Aug 2026",
    tags: ["Linear Algebra", "Optimization", "Lasso", "Ridge", "Geometry"],
    summary: "Visualizing why L1 regularization produces exact parameter sparsity (zeros) at diamond corners while L2 regularization produces spherical weight shrinkage without feature elimination.",
    content: `
### 1. Defining the General $L_p$ Norm
For a weight vector $\\mathbf{w} = (w_1, w_2, \\dots, w_d)^T \\in \\mathbb{R}^d$:
$$\\|\\mathbf{w}\\|_p = \\left( \\sum_{i=1}^d |w_i|^p \\right)^{1/p}$$
- **$L_1$ Norm (Manhattan):** $\\|\\mathbf{w}\\|_1 = \\sum_{i=1}^d |w_i|$ $\\longrightarrow$ Shapes a rotated square/diamond in 2D.
- **$L_2$ Norm (Euclidean):** $\\|\\mathbf{w}\\|_2 = \\sqrt{\\sum_{i=1}^d w_i^2}$ $\\longrightarrow$ Shapes a perfect circle in 2D.
- **$L_\\infty$ Norm (Max Norm):** $\\|\\mathbf{w}\\|_\\infty = \\max_i |w_i|$ $\\longrightarrow$ Shapes an axis-aligned box in 2D.

### 2. The Constrained Optimization View
Regularized regression solves:
$$\\min_{\\mathbf{w}} \\; \\mathcal{L}(\\mathbf{w}) \\quad \\text{subject to} \\quad \\|\\mathbf{w}\\|_p \\le C$$
where $\\mathcal{L}(\\mathbf{w}) = \\|\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\|^2_2$ is the quadratic residual sum of squares, forming elliptical contour lines centered at the unconstrained OLS estimate $\\hat{\\mathbf{w}}_{\\text{OLS}}$.

### 3. Why $L_1$ Enforces Sparsity
As the elliptical loss contours expand outward from $\\hat{\\mathbf{w}}_{\\text{OLS}}$, the first point of contact with the constraint region determines the optimal regularized solution $\\mathbf{w}^*$:
- For $L_1$, the constraint region has **sharp corners located directly on the coordinate axes** where $w_j = 0$ for other features. The elliptical contours are probabilistically far more likely to hit these sharp vertices first.
- For $L_2$, the constraint circle is smooth with continuous tangent lines everywhere; the contact point rarely coincides with an exact axis intercept.

### 4. Interactive Simulation
You can interactively adjust the $p$-value and vector coordinates in the **[Vector Norm Visualizer](#tools)** to inspect unit ball transformations in real time.
    `,
    relatedExperiment: "exp-vector-geometry",
    relatedNodeId: "node-vector-norms"
  },
  {
    id: "kb-prompt-distillation",
    title: "Engineering Prompt Distillation for Resume Generation at Scale",
    category: "AI & Software",
    readTime: "6 min read",
    date: "Aug 2026",
    tags: ["LLM", "Prompt Engineering", "ATS", "Gemini", "Next.js"],
    summary: "Production lessons from building AI CV Builder: context chunking, XYZ achievement formatting, preventing hallucinations, and client-side vector PDF generation.",
    content: `
### 1. The Challenge of Unconstrained LLM Generation
When users ask an LLM to "improve my resume", naive zero-shot prompts produce over-embellished corporate clichés ("spearheaded synergistic paradigms") and invent non-existent statistics. 

### 2. The XYZ Accomplishment Framework
Google's celebrated resume formula is structured as:
$$\\text{Accomplished } [X], \\text{ as measured by } [Y], \\text{ by doing } [Z]$$
To enforce this without hallucination, our prompt pipeline breaks resume optimization into two distinct stages:
1. **Pass 1 (Entity & Metric Extraction):** Extract verified technologies, user actions, and existing metric baselines into a structured JSON schema.
2. **Pass 2 (Syntactic Reconstruction):** Rebuild the bullet point adhering strictly to $X-Y-Z$ cadence while prohibiting introducing unmentioned quantitative numbers.

### 3. Prompt Distillation Pattern
\`\`\`typescript
const ATS_OPTIMIZATION_PROMPT = \`
ROLE: Elite Technical Recruiter & Resume Architect
INPUT BULLET: "\${rawBullet}"
TARGET ROLE: "\${targetJobTitle}"
KEY COMPETENCIES: \${JSON.stringify(extractedSkills)}

RULES:
1. Start with a decisive past-tense action verb (Engineered, Architected, Reduced, Accelerated).
2. Follow XYZ structure: Action -> Context -> Business / System Impact.
3. NEVER invent numbers; if metrics are absent, focus on architectural impact.
4. Keep character count between 90 and 160 characters.
\`;
\`\`\`

### 4. Lessons from 10 Template Layouts
- **Vector text purity:** Avoid rasterizing HTML onto canvas when exporting PDFs; maintain pure vector character glyphs to ensure ATS search indexing.
- **Single-column fallback:** While two-column designs look visually stunning on screen, providing 1-click conversion to clean single-column Swiss Grid guarantees $100\\%$ parsing accuracy in older enterprise ATS parsers.
    `,
    relatedExperiment: "exp-cv-intelligence",
    relatedNodeId: "node-llm"
  },
  {
    id: "kb-zero-gc-physics",
    title: "Zero-Allocation State Machines for 60FPS Browser Physics",
    category: "Computer Science",
    readTime: "5 min read",
    date: "Aug 2026",
    tags: ["Game Engine", "Performance", "Phaser", "Garbage Collection", "JavaScript"],
    summary: "How eliminating object allocations in 60Hz animation loops prevents garbage collection pauses in browser games and interactive canvases.",
    content: `
### 1. The Garbage Collector (GC) Enemy of 60 FPS
At 60 frames per second, a web application has precisely $16.67\\text{ ms}$ per frame to execute JavaScript, update physics, resolve collisions, and render to canvas. 
If an animation loop creates hundreds of temporary \`{ x: 0, y: 0 }\` vector objects per frame, the browser V8 engine triggers a Minor GC pause ($4-12\\text{ ms}$), causing visible stutter (jank) and dropped frames.

### 2. Pre-Allocated Object Pools & Scratch Vectors
Instead of allocating fresh vector instances:
\`\`\`javascript
// BAD: Allocates 2 objects every physics step per entity
function getNextPosition(entity, delta) {
  const velocity = { x: entity.vx * delta, y: entity.vy * delta };
  return { x: entity.x + velocity.x, y: entity.y + velocity.y };
}

// GOOD: Zero allocations, reuses pre-allocated scratch objects
const SCRATCH_VEC = { x: 0, y: 0 };
function updatePosition(entity, delta) {
  SCRATCH_VEC.x = entity.vx * delta;
  SCRATCH_VEC.y = entity.vy * delta;
  entity.x += SCRATCH_VEC.x;
  entity.y += SCRATCH_VEC.y;
}
\`\`\`

### 3. State Machine Inversion in 'Oops!'
In the Oops! platformer, gravity inversion shifts the coordinate frame dynamically across 4 directions. Using integer lookup tables rather than trigonometric rotation calls (\`Math.sin\`, \`Math.cos\`) reduced per-frame CPU cycles by $85\\%$.
    `,
    relatedExperiment: "exp-game-physics",
    relatedNodeId: "node-physics"
  }
];
