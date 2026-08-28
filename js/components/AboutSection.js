/**
 * About & Researcher Profile Component
 * Author: Khalid Abdullah
 */

import { CONFIG } from "../config.js";

export class AboutSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>👤</span>
              <span>PROFILE // THE BUILDER</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Behind The Digital Laboratory
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              Who I am, what I study, and how I approach engineering software, quantitative modeling, and machine intelligence.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 1. Editorial Bio & Philosophy (Left Column) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="p-8 rounded-3xl bg-surface border border-border shadow-xl space-y-6">
              <div class="flex items-center gap-4 pb-6 border-b border-border">
                <div class="w-16 h-16 rounded-2xl bg-surface-elevated border border-cyan/40 flex items-center justify-center font-mono font-black text-cyan text-2xl shadow-inner">
                  KA
                </div>
                <div>
                  <h3 class="text-xl font-bold text-text-primary">${CONFIG.author.name}</h3>
                  <p class="text-xs font-mono text-cyan mt-0.5">${CONFIG.author.tagline}</p>
                  <p class="text-xs text-text-muted mt-0.5 font-mono">📍 ${CONFIG.author.location}</p>
                </div>
              </div>

              <div class="text-sm text-text-secondary leading-relaxed space-y-4">
                <p>
                  I am a computer science researcher, creative developer, and builder obsessed with exploring systems where mathematics, machine learning, and high-performance software converge.
                </p>
                <p>
                  Rather than treating software as static code or resumes as paper documents, I treat every project as an evolving laboratory experiment. My workflow is anchored on continuous discovery:
                </p>
              </div>

              <!-- Workflow Badges -->
              <div class="grid grid-cols-5 gap-1.5 p-3 rounded-2xl bg-surface-elevated/70 border border-border text-center text-[10px] font-mono">
                <div class="p-1.5 rounded-lg bg-surface text-cyan font-bold">1. Learn</div>
                <div class="p-1.5 rounded-lg bg-surface text-purple-400 font-bold">2. Research</div>
                <div class="p-1.5 rounded-lg bg-surface text-amber-400 font-bold">3. Experiment</div>
                <div class="p-1.5 rounded-lg bg-surface text-blue-400 font-bold">4. Build</div>
                <div class="p-1.5 rounded-lg bg-surface text-emerald-400 font-bold">5. Ship</div>
              </div>

              <!-- Core Focus Pillars -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                ${CONFIG.focusAreas.map(area => `
                  <div class="p-4 rounded-xl bg-surface-elevated/40 border border-border">
                    <h4 class="text-xs font-mono font-bold text-text-primary uppercase tracking-wide mb-1">${area.title}</h4>
                    <p class="text-xs text-text-secondary leading-relaxed">${area.desc}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 2. Technical Stack & Direct Contact Console (Right Column) -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Tech Mastery Matrix -->
            <div class="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xl space-y-5">
              <h3 class="text-xs font-mono font-bold text-cyan uppercase tracking-widest">
                TOOLKIT & TECHNICAL MATRIX
              </h3>

              <div class="space-y-3 text-xs font-mono">
                <div>
                  <div class="text-text-muted text-[11px] mb-1.5">LANGUAGES:</div>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">Python</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">TypeScript / JS</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">C++</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">SQL</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">HTML5/CSS3</span>
                  </div>
                </div>

                <div>
                  <div class="text-text-muted text-[11px] mb-1.5">FRAMEWORKS & ENGINES:</div>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">Next.js / React</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">PyTorch</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">FastAPI</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">Phaser 2D</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">Tailwind CSS</span>
                  </div>
                </div>

                <div>
                  <div class="text-text-muted text-[11px] mb-1.5">QUANT & AI LIBRARIES:</div>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-cyan">NumPy / Pandas</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-cyan">HMMlearn</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-cyan">Scikit-Learn</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-cyan">LangChain / ChromaDB</span>
                    <span class="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-cyan">Gemini API</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Direct Contact Dispatch Box -->
            <div class="p-6 sm:p-8 rounded-3xl bg-surface border border-cyan/40 shadow-xl space-y-4">
              <div class="flex items-center gap-2 text-xs font-mono font-bold text-cyan uppercase tracking-widest">
                <span>📡</span>
                <span>DIRECT TRANSMISSION // CONNECT</span>
              </div>

              <p class="text-xs text-text-secondary leading-relaxed">
                Open to collaborations on research projects, quantitative trading systems, AI tools, or software engineering inquiries.
              </p>

              <!-- Email Copy Action -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border font-mono text-xs">
                <span id="email-text" class="text-text-primary select-all">${CONFIG.author.email}</span>
                <button id="btn-copy-email" class="px-2.5 py-1 rounded bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-[11px] transition-all cursor-pointer">
                  Copy
                </button>
              </div>

              <!-- Social Buttons -->
              <div class="grid grid-cols-2 gap-3 pt-2">
                <a href="${CONFIG.author.github}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-surface-elevated hover:bg-border border border-border text-xs font-mono text-text-primary text-center transition-all flex items-center justify-center gap-2">
                  <span>GitHub</span>
                  <span>↗</span>
                </a>
                <a href="${CONFIG.author.linkedin}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-surface-elevated hover:bg-border border border-border text-xs font-mono text-text-primary text-center transition-all flex items-center justify-center gap-2">
                  <span>LinkedIn</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const copyBtn = document.getElementById("btn-copy-email");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(CONFIG.author.email);
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => copyBtn.textContent = "Copy", 2000);
    });
  }
}
