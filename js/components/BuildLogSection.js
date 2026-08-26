/**
 * Chronological Build Log & Activity Feed Component
 * Author: Khalid Abdullah
 */

import { BUILD_LOG } from "../data/buildLog.js";

export class BuildLogSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = "all";

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    const filtered = this.currentFilter === "all"
      ? BUILD_LOG
      : BUILD_LOG.filter(item => item.type === this.currentFilter);

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>⏱️</span>
              <span>ACTIVITY STREAM // CHRONOLOGICAL TIMELINE</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Build Log & Research Milestones
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              A transparent, chronological log showing that this digital lab is continuously evolving through daily experiments, code commits, and releases.
            </p>
          </div>

          <!-- Timeline Filters -->
          <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
            <button class="log-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "all" ? "bg-cyan/15 border border-cyan/40 text-cyan font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="all">All (${BUILD_LOG.length})</button>
            <button class="log-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "releases" ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="releases">Releases 📦</button>
            <button class="log-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "experiments" ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="experiments">Experiments 🧪</button>
            <button class="log-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "learning" ? "bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="learning">Learning 📚</button>
            <button class="log-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${this.currentFilter === "research" ? "bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold" : "text-text-secondary hover:text-text-primary"}" data-filter="research">Research 🔬</button>
          </div>
        </div>

        <!-- Vertical Timeline Tree -->
        <div class="relative pl-6 sm:pl-8 border-l border-border/80 space-y-8">
          ${filtered.map(item => `
            <div class="relative group">
              <!-- Timeline Dot Node -->
              <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 ${
                item.color === "emerald" ? "border-emerald-400 group-hover:bg-emerald-400/20" :
                item.color === "amber" ? "border-amber-400 group-hover:bg-amber-400/20" :
                item.color === "violet" ? "border-violet-400 group-hover:bg-violet-400/20" :
                "border-cyan group-hover:bg-cyan/20"
              } transition-all"></div>

              <!-- Log Item Card -->
              <div class="p-6 rounded-2xl bg-surface border border-border hover:border-cyan/40 hover:bg-surface-elevated/70 transition-all duration-300 shadow-lg">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold ${
                      item.color === "emerald" ? "text-emerald-400" :
                      item.color === "amber" ? "text-amber-400" :
                      item.color === "violet" ? "text-violet-400" : "text-cyan"
                    }">
                      ${item.date}
                    </span>
                    <span class="text-border">|</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-elevated border border-border text-text-secondary">
                      ${item.typeLabel}
                    </span>
                  </div>

                  <span class="text-[11px] font-mono text-text-muted">commit #${item.commit}</span>
                </div>

                <h3 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                  ${item.title}
                </h3>

                <p class="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  ${item.description}
                </p>

                <!-- Metrics & Tags Footer -->
                <div class="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <span class="text-cyan font-medium">${item.metrics}</span>

                  <div class="flex flex-wrap gap-1.5">
                    ${item.tags.map(t => `<span class="px-2 py-0.5 rounded bg-surface-elevated text-[10px] text-text-muted">#${t}</span>`).join("")}
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll(".log-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentFilter = btn.dataset.filter;
        this.render();
        this.bindEvents();
      });
    });
  }
}
