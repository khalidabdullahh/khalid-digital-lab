/**
 * The Lab - Research & Experiments Dashboard Component
 * Author: Khalid Abdullah
 */

import { EXPERIMENTS } from "../data/experiments.js";

export class LabSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = "all";
    this.activeExperiment = null;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    const filtered = this.currentFilter === "all" 
      ? EXPERIMENTS 
      : EXPERIMENTS.filter(e => e.status === this.currentFilter);

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>🧪</span>
              <span>THE LAB // RESEARCH & INQUIRIES</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Curious Questions & Scientific Experiments
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              Every tool and system begins with an open question. Explore ongoing research experiments across AI, market regime modeling, and high-speed software architectures.
            </p>
          </div>

          <!-- Actions & Filter Pills -->
          <div class="flex flex-wrap items-center gap-2">
            <button id="btn-add-experiment" class="px-4 py-2 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
              <span>🧪 + New Experiment</span>
            </button>

            <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
              <button class="lab-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "all" ? "bg-cyan/15 border border-cyan/40 text-cyan font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="all">All (${EXPERIMENTS.length})</button>
              <button class="lab-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "active" ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="active">Active 🟢</button>
              <button class="lab-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "experimenting" ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="experimenting">Experimenting 🟡</button>
              <button class="lab-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "research" ? "bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="research">Research 🔵</button>
            </div>
          </div>
        </div>

        <!-- Experiments Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(exp => `
            <div class="experiment-card group relative p-7 rounded-3xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer" data-exp-id="${exp.id}">
              <div>
                <!-- Status & Category Header -->
                <div class="flex items-center justify-between gap-2 mb-4">
                  <span class="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-surface-elevated border border-border text-cyan">
                    ${exp.category}
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    exp.statusColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                    exp.statusColor === "amber" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                    "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  }">
                    <span class="w-1.5 h-1.5 rounded-full ${
                      exp.statusColor === "emerald" ? "bg-emerald-400 animate-pulse" :
                      exp.statusColor === "amber" ? "bg-amber-400" : "bg-blue-400"
                    }"></span>
                    ${exp.statusLabel}
                  </span>
                </div>

                <!-- Title -->
                <h3 class="text-xl font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight leading-snug">
                  ${exp.title}
                </h3>

                <!-- Clean Research Question Preview -->
                <div class="mt-4 p-4 rounded-2xl bg-surface-elevated/60 border border-border/80">
                  <div class="text-[10px] font-mono font-bold text-cyan uppercase mb-1">CORE RESEARCH QUESTION</div>
                  <p class="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    "${exp.researchQuestion}"
                  </p>
                </div>

                <!-- Tech Badges -->
                <div class="flex flex-wrap gap-1.5 mt-4">
                  ${exp.technologies.slice(0, 4).map(t => `
                    <span class="px-2.5 py-0.5 rounded-md bg-surface-elevated border border-border/60 text-[10px] font-mono text-text-muted">
                      ${t}
                    </span>
                  `).join("")}
                  ${exp.technologies.length > 4 ? `<span class="px-2 py-0.5 rounded bg-surface-elevated border border-border/60 text-[10px] font-mono text-text-muted">+${exp.technologies.length - 4}</span>` : ""}
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-mono text-text-muted">
                  <span>Progress:</span>
                  <span class="font-bold text-text-primary">${exp.progress}%</span>
                </div>

                <span class="text-xs font-mono font-bold text-cyan group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                  <span>Read Breakdown</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Experiment Detail Modal Container -->
      <div id="experiment-modal-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div id="experiment-modal-content" class="relative w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl">
          <!-- Injected dynamically via openModal() -->
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById("btn-add-experiment")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-lab-studio", { detail: { type: "experiment" } }));
    });

    this.container.querySelectorAll(".lab-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentFilter = btn.dataset.filter;
        this.render();
        this.bindEvents();
      });
    });

    this.container.querySelectorAll(".experiment-card").forEach(card => {
      card.addEventListener("click", () => {
        const expId = card.dataset.expId;
        const exp = EXPERIMENTS.find(e => e.id === expId);
        if (exp) this.openModal(exp);
      });
    });

    const backdrop = document.getElementById("experiment-modal-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop && !backdrop.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  openModal(exp) {
    const backdrop = document.getElementById("experiment-modal-backdrop");
    const modalContent = document.getElementById("experiment-modal-content");
    if (!backdrop || !modalContent) return;

    modalContent.innerHTML = `
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-0.5 rounded-full text-xs font-mono bg-surface-elevated border border-border text-cyan">
              ${exp.category}
            </span>
            <span class="px-3 py-0.5 rounded-full text-xs font-mono font-semibold ${
              exp.statusColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
              exp.statusColor === "amber" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
              "bg-blue-500/15 text-blue-300 border border-blue-500/30"
            }">
              ● ${exp.statusLabel}
            </span>
            <span class="text-xs font-mono text-text-muted">${exp.lastUpdated}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            ${exp.title}
          </h2>
        </div>

        <button id="btn-close-modal" class="p-2 rounded-xl bg-surface-elevated hover:bg-border text-text-muted hover:text-text-primary transition-all cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-6 py-6 text-sm">
        <!-- Question & Hypothesis -->
        <div class="space-y-3">
          <div class="p-4 rounded-2xl bg-cyan/10 border border-cyan/30">
            <div class="text-xs font-mono font-bold text-cyan uppercase mb-1">🎯 Core Research Question</div>
            <p class="text-sm font-medium text-text-primary leading-relaxed">${exp.researchQuestion}</p>
          </div>

          <div class="p-4 rounded-2xl bg-surface-elevated/70 border border-border">
            <div class="text-xs font-mono font-bold text-amber-400 uppercase mb-1">🔬 Working Hypothesis</div>
            <p class="text-xs text-text-secondary leading-relaxed">${exp.hypothesis}</p>
          </div>
        </div>

        <!-- Methodology -->
        <div>
          <h4 class="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-2">Step-by-Step Methodology</h4>
          <ul class="space-y-2">
            ${exp.methodology.map(step => `
              <li class="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                <span class="text-cyan font-bold mt-0.5">▸</span>
                <span>${step}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        ${exp.mathFormula ? `
          <div class="p-4 rounded-2xl bg-[#050810] border border-border font-mono text-center overflow-x-auto text-cyan">
            <div class="text-[10px] text-text-muted uppercase mb-1">Mathematical Proof & Formula</div>
            <div class="text-xs sm:text-sm text-text-primary py-1">${exp.mathFormula}</div>
          </div>
        ` : ""}

        <!-- Code Snippet -->
        ${exp.codeSnippet ? `
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-text-muted uppercase">Algorithm Implementation</span>
              <button id="btn-copy-code" class="px-2.5 py-1 text-[11px] font-mono rounded bg-surface-elevated hover:bg-border text-text-secondary hover:text-cyan transition-all flex items-center gap-1 cursor-pointer">
                <span>Copy Code</span>
              </button>
            </div>
            <pre class="p-4 rounded-2xl bg-[#050810] border border-border text-xs font-mono text-text-secondary overflow-x-auto leading-relaxed max-h-48"><code>${exp.codeSnippet}</code></pre>
          </div>
        ` : ""}

        <!-- Results & Learnings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-surface-elevated/40 border border-border">
            <div class="text-xs font-mono font-bold text-emerald-400 uppercase mb-2">📊 Key Results & Outcomes</div>
            <ul class="space-y-1.5">
              ${exp.results.map(res => `
                <li class="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
                  <span class="text-emerald-400">✓</span>
                  <span>${res}</span>
                </li>
              `).join("")}
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-surface-elevated/40 border border-border">
            <div class="text-xs font-mono font-bold text-violet-400 uppercase mb-2">💡 Core Takeaways</div>
            <ul class="space-y-1.5">
              ${exp.learnings.map(lrn => `
                <li class="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
                  <span class="text-violet-400">●</span>
                  <span>${lrn}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border">
        <div class="flex items-center gap-2">
          ${exp.interactiveDemoAvailable ? `
            <a href="#tools" class="modal-jump-link px-5 py-2.5 rounded-xl bg-cyan hover:bg-cyan-glow text-black text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg">
              <span>Launch Interactive Simulator</span>
              <span>→</span>
            </a>
          ` : ""}
        </div>

        <button id="btn-close-modal-footer" class="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-border text-text-secondary text-xs font-mono transition-all cursor-pointer">
          Close Window
        </button>
      </div>
    `;

    document.getElementById("btn-close-modal")?.addEventListener("click", () => this.closeModal());
    document.getElementById("btn-close-modal-footer")?.addEventListener("click", () => this.closeModal());
    document.querySelector(".modal-jump-link")?.addEventListener("click", () => this.closeModal());

    const copyBtn = document.getElementById("btn-copy-code");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(exp.codeSnippet);
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => copyBtn.textContent = "Copy Code", 2000);
    });

    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const backdrop = document.getElementById("experiment-modal-backdrop");
    if (!backdrop) return;
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}
