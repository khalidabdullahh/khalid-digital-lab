/**
 * Projects Showcase Component (Featured & Supporting Projects)
 * Author: Khalid Abdullah
 */

import { PROJECTS } from "../data/projects.js";

export class ProjectsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    const featuredProjects = PROJECTS.filter(p => p.featured);
    const supportingProjects = PROJECTS.filter(p => !p.featured);

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>⚡</span>
              <span>PROJECTS // PRODUCTION SYSTEMS</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Featured Work & Shipped Applications
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              Real, usable software built with modern stacks — from AI career tools with Gemini to quantitative simulation engines and arcade physics.
            </p>
          </div>
        </div>

        <!-- 1. Featured Projects Showcase -->
        <div class="space-y-8 mb-14">
          ${featuredProjects.map(proj => `
            <div class="group relative p-8 sm:p-10 rounded-3xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-500 shadow-2xl overflow-hidden project-card-interactive">
              <!-- Radial Accent Glow -->
              <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-cyan/5 blur-3xl group-hover:bg-cyan/10 transition-all pointer-events-none"></div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <!-- Left Column -->
                <div class="lg:col-span-7 space-y-5">
                  <div class="flex flex-wrap items-center gap-2.5">
                    <span class="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan/15 border border-cyan/40 text-cyan">
                      ★ ${proj.badge}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-mono bg-surface-elevated border border-border text-text-secondary">
                      ${proj.category}
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ${proj.status}
                    </span>
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                    ${proj.title}
                  </h3>

                  <p class="text-sm font-medium text-text-secondary leading-relaxed">
                    ${proj.tagline}
                  </p>

                  <!-- Problem & Solution Cards -->
                  <div class="space-y-3 pt-1">
                    <div class="p-4 rounded-2xl bg-surface-elevated/70 border border-border">
                      <div class="text-[11px] font-mono font-bold text-amber-400 uppercase mb-1">THE PROBLEM</div>
                      <p class="text-xs text-text-secondary leading-relaxed">${proj.problem}</p>
                    </div>

                    <div class="p-4 rounded-2xl bg-surface-elevated/70 border border-border">
                      <div class="text-[11px] font-mono font-bold text-emerald-400 uppercase mb-1">HOW IT'S SOLVED</div>
                      <p class="text-xs text-text-secondary leading-relaxed">${proj.solution}</p>
                    </div>
                  </div>

                  <!-- Tech Badges -->
                  <div class="flex flex-wrap gap-2 pt-2">
                    ${proj.technologies.map(t => `
                      <span class="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border/80 text-xs font-mono text-text-secondary">
                        ${t}
                      </span>
                    `).join("")}
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-wrap items-center gap-3 pt-3">
                    ${proj.liveUrl.startsWith("http") ? `
                      <a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-cyan hover:bg-cyan-glow text-black text-xs font-mono font-bold transition-all shadow-xl flex items-center gap-2">
                        <span>Launch Live Application</span>
                        <span>↗</span>
                      </a>
                    ` : `
                      <a href="${proj.liveUrl}" class="px-5 py-2.5 rounded-xl bg-cyan hover:bg-cyan-glow text-black text-xs font-mono font-bold transition-all shadow-xl flex items-center gap-2">
                        <span>Launch Simulator</span>
                        <span>→</span>
                      </a>
                    `}

                    ${proj.githubUrl ? `
                      <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-text-primary text-xs font-mono transition-all flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        <span>GitHub</span>
                      </a>
                    ` : ""}

                    <a href="#lab" class="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-border border border-border text-text-muted hover:text-cyan text-xs font-mono transition-all">
                      View Experiment 🧪
                    </a>
                  </div>
                </div>

                <!-- Right Column: Specs Card -->
                <div class="lg:col-span-5 p-6 rounded-2xl bg-[#060910] border border-border/80 flex flex-col justify-between space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-border/60">
                    <span class="text-xs font-mono text-cyan uppercase font-bold">Key Technical Highlights</span>
                    <span class="text-xs font-mono text-text-muted">${proj.year}</span>
                  </div>

                  <ul class="space-y-3">
                    ${proj.highlights.map(h => `
                      <li class="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan mt-1.5 shrink-0"></span>
                        <span>${h}</span>
                      </li>
                    `).join("")}
                  </ul>

                  <div class="pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span>Performance Target</span>
                    <span class="text-emerald-400 font-bold">100% Vector Quality • &lt;50ms</span>
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- 2. Supporting Projects Grid -->
        <h3 class="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-6">
          MORE PROJECTS & RESEARCH ENGINES
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${supportingProjects.map(proj => `
            <div class="group relative p-7 rounded-3xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl project-card-interactive">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-elevated border border-border text-cyan">
                    ${proj.category}
                  </span>
                  <span class="text-xs font-mono text-text-muted">${proj.year}</span>
                </div>

                <h4 class="text-xl font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                  ${proj.title}
                </h4>

                <p class="text-xs text-text-secondary mt-2.5 line-clamp-3 leading-relaxed">
                  ${proj.shortDescription}
                </p>

                <!-- Tech Badges -->
                <div class="flex flex-wrap gap-1.5 mt-4">
                  ${proj.technologies.slice(0, 3).map(t => `
                    <span class="px-2 py-0.5 rounded-md bg-surface-elevated border border-border/60 text-[10px] font-mono text-text-muted">
                      ${t}
                    </span>
                  `).join("")}
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                <a href="${proj.liveUrl}" ${proj.liveUrl.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1.5">
                  <span>${proj.liveUrl.startsWith("http") ? "Play / Launch ↗" : "Explore →"}</span>
                </a>

                <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-text-primary transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
}
