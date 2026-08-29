/**
 * Currently Building - Live Status Radar
 * Author: Khalid Abdullah
 */

import { githubService } from "../services/GitHubService.js";

export class CurrentlyBuilding {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [
      {
        num: "01",
        name: "AI CV Builder v2.0",
        repoMatch: "CV-Builder",
        tagline: "ATS-optimized resume generator with 10 templates and Google Gemini AI writer.",
        status: "Shipping / Live",
        statusColor: "emerald",
        progress: 100,
        tech: ["Next.js 16", "React 19", "Gemini 1.5", "Tailwind"],
        metric: "10 Templates • HD PDF Export",
        actionUrl: "https://first-project-plum-phi.vercel.app",
        actionLabel: "Launch App ↗",
        isExternal: true
      },
      {
        num: "02",
        name: "HMM Market Regime Detector",
        repoMatch: null,
        tagline: "Unsupervised statistical segmentation of asset volatility and trend regimes.",
        status: "Experimenting",
        statusColor: "amber",
        progress: 72,
        tech: ["Python", "HMMlearn", "NumPy", "Canvas 2D"],
        metric: "3-State Gaussian Markov Engine",
        actionUrl: "#tools",
        actionLabel: "Open Simulator",
        isExternal: false
      },
      {
        num: "03",
        name: "LLM Financial Alpha Extractor",
        repoMatch: null,
        tagline: "Quantitative sentiment and forward-looking guidance parsing from SEC 10-K filings.",
        status: "Research",
        statusColor: "blue",
        progress: 48,
        tech: ["PyTorch", "ChromaDB", "LangChain", "FastAPI"],
        metric: "SEC Item 7 MD&A Parser",
        actionUrl: "#lab",
        actionLabel: "View Experiment",
        isExternal: false
      },
      {
        num: "04",
        name: "Oops! (Chaos Realm) Game Engine",
        repoMatch: "Oops",
        tagline: "Zero-allocation state-machine physics and procedural chiptune audio in browser.",
        status: "Shipped",
        statusColor: "emerald",
        progress: 100,
        tech: ["Phaser 2D", "Web Audio API", "PWA"],
        metric: "150 Multiverse Levels • 60 FPS",
        actionUrl: "https://oops-snowy-three.vercel.app/",
        actionLabel: "Play Live ↗",
        isExternal: true
      }
    ];

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="relative py-12 border-y border-border/80 bg-surface/40 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Section Header -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <h2 class="text-xs font-mono font-bold tracking-widest text-cyan uppercase">CURRENTLY BUILDING // LIVE PIPELINE</h2>
                <p class="text-sm text-text-secondary mt-0.5">Real-time status of active tools, experiments, and shipped systems</p>
              </div>
            </div>

            <div class="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>4 ACTIVE TRACKS</span>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${this.items.map(item => {
              const matchedRepo = item.repoMatch 
                ? (githubService.repos || []).find(r => r.name.toLowerCase() === item.repoMatch.toLowerCase())
                : null;

              const displayMetric = matchedRepo 
                ? `GitHub: Updated ${githubService.getTimeAgo(matchedRepo.pushedAt)}`
                : item.metric;

              return `
                <div class="group relative p-5 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/80 transition-all duration-300 flex flex-col justify-between shadow-lg">
                  <!-- Header: Num & Status -->
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-mono font-bold text-text-muted group-hover:text-cyan transition-colors">${item.num}</span>
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        item.statusColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                        item.statusColor === "amber" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                        "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      }">
                        <span class="w-1.5 h-1.5 rounded-full ${
                          item.statusColor === "emerald" ? "bg-emerald-400 animate-pulse" :
                          item.statusColor === "amber" ? "bg-amber-400" : "bg-blue-400"
                        }"></span>
                        ${item.status}
                      </span>
                    </div>

                    <h3 class="text-base font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                      ${item.name}
                    </h3>

                    <p class="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      ${item.tagline}
                    </p>
                  </div>

                  <!-- Progress & Footer -->
                  <div class="mt-5 pt-3 border-t border-border/70">
                    <div class="flex items-center justify-between text-[11px] font-mono text-text-muted mb-1.5">
                      <span class="truncate max-w-[170px]" title="${displayMetric}">${displayMetric}</span>
                      <span class="font-bold text-text-primary">${item.progress}%</span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full h-1 rounded-full bg-border overflow-hidden mb-3">
                      <div class="h-full rounded-full transition-all duration-500 ${
                        item.statusColor === "emerald" ? "bg-emerald-400" :
                        item.statusColor === "amber" ? "bg-amber-400" : "bg-cyan"
                      }" style="width: ${item.progress}%"></div>
                    </div>

                    <!-- Action Link -->
                    <a href="${item.actionUrl}" ${item.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="w-full py-1.5 px-3 rounded-lg bg-surface-elevated hover:bg-cyan/15 border border-border hover:border-cyan/40 text-text-secondary hover:text-cyan text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5">
                      <span>${item.actionLabel}</span>
                    </a>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    window.addEventListener("github-sync-complete", () => {
      this.render();
    });
  }
}
