/**
 * Interactive ATS Resume & Keyword Density Analyzer
 * Author: Khalid Abdullah
 */

export class ATSAnalyzer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.presets = {
      ai: {
        role: "AI / ML Engineer",
        jobDescription: `We are looking for an AI/ML Engineer with expertise in PyTorch, Large Language Models (LLMs), LangChain, vector embeddings (ChromaDB/Pinecone), prompt engineering, and fine-tuning. Experience with Transformer architectures, model quantization (AWQ/GGUF), Docker, FastAPI, and CI/CD pipelines is required. Strong mathematical foundations in linear algebra, gradient descent, and statistical evaluation (BLEU, ROUGE, Cosine Similarity) are essential.`,
        cvText: `Machine Learning Engineer with experience designing LLM applications using PyTorch, LangChain, and Gemini API. Built vector search pipelines with ChromaDB and cosine similarity indexing. Implemented prompt distillation and fine-tuning workflows, reducing hallucinations by 40%. Deployed REST APIs using FastAPI and Docker in containerized production environments. Strong foundation in linear algebra and algorithms.`
      },
      quant: {
        role: "Quantitative Researcher",
        jobDescription: `Seeking a Quantitative Researcher to design statistical arbitrage and market regime detection models. Required skills: Python, NumPy, Pandas, Scikit-Learn, Hidden Markov Models (HMM), Stochastic Calculus, Time Series Analysis (ARIMA, GARCH), Monte Carlo simulations, Order Flow Imbalance, and Sharpe Ratio optimization. Experience backtesting intraday tick data and managing maximum drawdown risk is critical.`,
        cvText: `Quantitative developer researching market regime detection using Hidden Markov Models and Gaussian Mixture Models in Python. Analyzed multi-asset tick time series data using NumPy, Pandas, and Scikit-Learn. Engineered Monte Carlo simulation paths to evaluate volatility clustering and drawdown probability. Strong knowledge of Kelly Criterion position sizing and statistical distributions.`
      },
      frontend: {
        role: "Frontend Architect",
        jobDescription: `Looking for a Senior Frontend Architect proficient in Next.js, React, TypeScript, Tailwind CSS, WebGL / Canvas 2D, state machines, and web performance optimization. Must have proven experience crafting responsive 60fps user interfaces, keyboard-accessible navigation (WCAG), PWA architecture, and zero-allocation animation loops.`,
        cvText: `Frontend engineer specializing in Next.js, React, TypeScript, and Tailwind CSS. Built high-performance interactive web tools utilizing HTML5 Canvas 2D and Web Audio API with zero-allocation state machines achieving 60 FPS. Implemented accessible keyboard command palettes (Cmd+K) and responsive dark/light design systems.`
      }
    };

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderLayout();
    this.bindEvents();
    this.analyze();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="ats-wrapper p-6 rounded-2xl bg-surface border border-border/80 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-cyan animate-pulse"></span>
              <h3 class="text-lg font-bold text-text-primary tracking-tight">ATS Resume & Competency Matcher</h3>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">Lexical token alignment, keyword density scoring & missing skill extraction</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted font-mono">SAMPLE ROLES:</span>
            <button class="ats-preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono active" data-preset="ai">AI / ML</button>
            <button class="ats-preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono" data-preset="quant">Quant Finance</button>
            <button class="ats-preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono" data-preset="frontend">Frontend Architect</button>
          </div>
        </div>

        <!-- Input Grids -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
          <div>
            <div class="flex items-center justify-between mb-1.5 text-xs font-mono">
              <span class="text-text-secondary flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                TARGET JOB DESCRIPTION:
              </span>
              <span id="jd-word-count" class="text-text-muted">0 words</span>
            </div>
            <textarea id="ats-jd-input" rows="5" class="w-full p-3 text-xs font-mono rounded-xl bg-surface-elevated/70 border border-border focus:border-cyan focus:outline-none text-text-primary resize-none placeholder:text-text-muted/50 leading-relaxed"></textarea>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5 text-xs font-mono">
              <span class="text-text-secondary flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                YOUR RESUME / BULLETS:
              </span>
              <span id="cv-word-count" class="text-text-muted">0 words</span>
            </div>
            <textarea id="ats-cv-input" rows="5" class="w-full p-3 text-xs font-mono rounded-xl bg-surface-elevated/70 border border-border focus:border-emerald-400 focus:outline-none text-text-primary resize-none placeholder:text-text-muted/50 leading-relaxed"></textarea>
          </div>
        </div>

        <!-- Score Results Section -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
          <!-- Overall Gauge -->
          <div class="p-4 rounded-xl bg-surface-elevated/40 border border-border flex flex-col items-center justify-center text-center">
            <div class="text-xs font-mono text-text-muted uppercase mb-1">ATS Match Score</div>
            <div class="relative flex items-center justify-center my-1">
              <div id="ats-score-display" class="text-3xl font-mono font-black text-emerald-400">92%</div>
            </div>
            <div id="ats-verdict" class="text-xs font-medium text-emerald-400 mt-1 font-mono">Strong ATS Fit</div>
          </div>

          <!-- Matched Keywords -->
          <div class="p-4 rounded-xl bg-surface-elevated/40 border border-border sm:col-span-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                ✓ Matched Keywords (<span id="matched-count">0</span>)
              </span>
              <span class="text-xs font-mono text-rose-400 uppercase font-semibold flex items-center gap-1">
                ✗ Missing Opportunities (<span id="missing-count">0</span>)
              </span>
            </div>
            
            <div id="matched-chips" class="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-1 mb-3"></div>
            <div id="missing-chips" class="flex flex-wrap gap-1.5 max-h-[50px] overflow-y-auto pr-1"></div>
          </div>
        </div>

        <!-- Call to Action Banner -->
        <div class="mt-4 p-3.5 rounded-xl bg-cyan/10 border border-cyan/30 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 text-xs text-text-secondary">
            <span class="text-cyan text-base font-bold">💡</span>
            <span>Want to generate 100% formatted ATS resumes with 10 templates?</span>
          </div>
          <a href="https://first-project-plum-phi.vercel.app" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-lg bg-cyan hover:bg-cyan-glow text-black text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1">
            Open AI CV Builder ↗
          </a>
        </div>
      </div>
    `;

    // Load initial AI preset
    this.loadPreset("ai");
  }

  loadPreset(key) {
    const preset = this.presets[key];
    if (!preset) return;

    const jdEl = document.getElementById("ats-jd-input");
    const cvEl = document.getElementById("ats-cv-input");

    if (jdEl) jdEl.value = preset.jobDescription.trim();
    if (cvEl) cvEl.value = preset.cvText.trim();

    this.analyze();
  }

  bindEvents() {
    const jdEl = document.getElementById("ats-jd-input");
    const cvEl = document.getElementById("ats-cv-input");

    jdEl?.addEventListener("input", () => this.analyze());
    cvEl?.addEventListener("input", () => this.analyze());

    this.container.querySelectorAll(".ats-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.container.querySelectorAll(".ats-preset-btn").forEach(b => b.classList.remove("active", "border-cyan", "text-cyan"));
        btn.classList.add("active", "border-cyan", "text-cyan");
        this.loadPreset(btn.dataset.preset);
      });
    });
  }

  tokenize(text) {
    const stopWords = new Set(["the", "and", "a", "an", "in", "on", "of", "to", "for", "with", "is", "are", "as", "by", "that", "this", "from", "at", "it", "or", "be", "we", "you", "your", "our", "must", "have", "with", "such", "an", "all"]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#./-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  analyze() {
    const jdEl = document.getElementById("ats-jd-input");
    const cvEl = document.getElementById("ats-cv-input");
    if (!jdEl || !cvEl) return;

    const jdText = jdEl.value;
    const cvText = cvEl.value;

    document.getElementById("jd-word-count").textContent = `${jdText.trim() ? jdText.trim().split(/\s+/).length : 0} words`;
    document.getElementById("cv-word-count").textContent = `${cvText.trim() ? cvText.trim().split(/\s+/).length : 0} words`;

    const jdTokens = this.tokenize(jdText);
    const cvTokens = this.tokenize(cvText);

    const jdFreq = {};
    jdTokens.forEach(t => jdFreq[t] = (jdFreq[t] || 0) + 1);

    const cvSet = new Set(cvTokens);

    const matched = [];
    const missing = [];

    // Filter unique important keywords
    const uniqueJdKeywords = Object.keys(jdFreq).sort((a, b) => jdFreq[b] - jdFreq[a]);

    uniqueJdKeywords.forEach(word => {
      if (cvSet.has(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    });

    const totalJdKeywords = uniqueJdKeywords.length;
    const score = totalJdKeywords > 0 ? Math.round((matched.length / totalJdKeywords) * 100) : 0;

    this.renderResults(score, matched, missing);
  }

  renderResults(score, matched, missing) {
    const scoreEl = document.getElementById("ats-score-display");
    const verdictEl = document.getElementById("ats-verdict");
    const matchedCountEl = document.getElementById("matched-count");
    const missingCountEl = document.getElementById("missing-count");
    const matchedChipsEl = document.getElementById("matched-chips");
    const missingChipsEl = document.getElementById("missing-chips");

    if (scoreEl) {
      scoreEl.textContent = `${score}%`;
      if (score >= 80) scoreEl.className = "text-3xl font-mono font-black text-emerald-400";
      else if (score >= 50) scoreEl.className = "text-3xl font-mono font-black text-amber-400";
      else scoreEl.className = "text-3xl font-mono font-black text-rose-400";
    }

    if (verdictEl) {
      if (score >= 85) verdictEl.textContent = "🟢 Exceptional ATS Fit";
      else if (score >= 70) verdictEl.textContent = "🟡 Moderate Match (Add Missing Terms)";
      else verdictEl.textContent = "🔴 High Rejection Risk (Missing Critical Terms)";
    }

    if (matchedCountEl) matchedCountEl.textContent = matched.length;
    if (missingCountEl) missingCountEl.textContent = missing.length;

    if (matchedChipsEl) {
      matchedChipsEl.innerHTML = matched.slice(0, 16).map(w => 
        `<span class="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">${w}</span>`
      ).join("") || `<span class="text-xs text-text-muted">No matches yet</span>`;
    }

    if (missingChipsEl) {
      missingChipsEl.innerHTML = missing.slice(0, 10).map(w => 
        `<span class="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono">+ ${w}</span>`
      ).join("") || `<span class="text-xs text-text-muted">None! Fully optimized</span>`;
    }
  }
}
