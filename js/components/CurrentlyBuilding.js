/**
 * Currently Building - Live Status Radar
 * Author: Khalid Abdullah
 */

export class CurrentlyBuilding {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [
      {
        num: "01",
        name: "AI CV Builder v2.0",
        tagline: "Build a job-winning, ATS-optimized CV in minutes with Gemini AI & 10 templates.",
        status: "Shipping / Live",
        statusColor: "emerald",
        progress: 100,
        tech: ["Next.js 16", "React 19", "Gemini 1.5", "Tailwind"],
        metric: "10 Templates • HD PDF Export",
        actionUrl: "https://first-project-plum-phi.vercel.app",
        actionLabel: "Try Live App ↗",
        isExternal: true
      },
      {
        num: "02",
        name: "Market Regime Detector",
        tagline: "Unsupervised machine learning identifying when markets are trending vs ranging.",
        status: "Experimenting",
        statusColor: "amber",
        progress: 72,
        tech: ["Python", "HMM", "Monte Carlo", "Canvas 2D"],
        metric: "3-State Gaussian Markov Engine",
        actionUrl: "#tools",
        actionLabel: "Open Simulator",
        isExternal: false
      },
      {
        num: "03",
        name: "LLM Financial Research",
        tagline: "Extracting guidance signals and sentiment from SEC 10-K company filings without hallucinations.",
        status: "Research",
        statusColor: "blue",
        progress: 48,
        tech: ["PyTorch", "ChromaDB", "LangChain", "FastAPI"],
        metric: "SEC Item 7 MD&A Parser",
        actionUrl: "#lab",
        actionLabel: "View Research",
        isExternal: false
      },
      {
        num: "04",
        name: "Oops! Multiverse Game",
        tagline: "150-stage deceptive puzzle platformer with zero-lag physics and retro chiptune audio.",
        status: "Shipped",
        statusColor: "emerald",
        progress: 100,
        tech: ["Phaser 2D", "Web Audio API", "PWA"],
        metric: "150 Levels • 5 Worlds • 60 FPS",
        actionUrl: "https://oops-snowy-three.vercel.app/",
        actionLabel: "Play in Browser ↗",
        isExternal: true
      }
    ];

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="relative py-14 border-y border-border/80 bg-surface/40 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Section Header -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold tracking-widest text-cyan uppercase">CURRENT PIPELINE</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">● Active</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-text-primary mt-0.5">What I'm Working On Right Now</h2>
              </div>
            </div>

            <div class="text-xs font-mono text-text-muted">
              Updated Live from Development Hub
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            ${this.items.map(item => `
              <div class="group relative p-6 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/90 transition-all duration-300 flex flex-col justify-between shadow-lg">
                <div>
                  <!-- Header: Num & Status -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-mono font-bold text-cyan">${item.num} // PIPELINE</span>
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

                  <h3 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                    ${item.name}
                  </h3>

                  <p class="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                    ${item.tagline}
                  </p>
                </div>

                <!-- Progress & Action -->
                <div class="mt-6 pt-4 border-t border-border/70">
                  <div class="flex items-center justify-between text-[11px] font-mono text-text-muted mb-1.5">
                    <span>${item.metric}</span>
                    <span class="font-bold text-text-primary">${item.progress}%</span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full h-1.5 rounded-full bg-border overflow-hidden mb-4">
                    <div class="h-full rounded-full transition-all duration-500 ${
                      item.statusColor === "emerald" ? "bg-emerald-400" :
                      item.statusColor === "amber" ? "bg-amber-400" : "bg-cyan"
                    }" style="width: ${item.progress}%"></div>
                  </div>

                  <!-- Action Button -->
                  <a href="${item.actionUrl}" ${item.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="w-full py-2 px-3.5 rounded-xl bg-surface-elevated hover:bg-cyan/20 border border-border hover:border-cyan/50 text-text-primary hover:text-cyan text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm">
                    <span>${item.actionLabel}</span>
                  </a>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
}
