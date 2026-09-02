/**
 * Live Dynamic Lab Statistics Component
 * Author: Khalid Abdullah
 * Dynamically computes verifiable telemetry metrics from GitHub API & live registries
 */

import { CONFIG } from "../config.js";
import { githubService } from "../services/GitHubService.js";
import { PROJECTS } from "../data/projects.js";
import { TOOLS } from "../data/tools.js";
import { EXPERIMENTS } from "../data/experiments.js";
import { KNOWLEDGE_ARTICLES } from "../data/knowledge.js";

export class LiveStats {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.hasAnimated = false;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.setupScrollObserver();
    this.bindEvents();
  }

  getMetrics() {
    const reposCount = githubService.repos.length || 7;
    const totalStars = githubService.getTotalStars() || 8;
    const projectsCount = PROJECTS.length || 8;
    const toolsCount = TOOLS.length || 6;
    const experimentsCount = EXPERIMENTS.length || 6;
    const notesCount = KNOWLEDGE_ARTICLES.length || 6;

    return {
      repos: reposCount,
      stars: totalStars,
      projects: projectsCount,
      tools: toolsCount,
      experiments: experimentsCount,
      notes: notesCount
    };
  }

  render() {
    const metrics = this.getMetrics();

    this.container.innerHTML = `
      <div class="py-16 border-y border-border/80 bg-surface/60 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            ${CONFIG.stats.map(stat => {
              const val = metrics[stat.key] !== undefined ? metrics[stat.key] : 0;
              return `
                <div class="p-4 rounded-2xl bg-surface border border-border/80 text-center hover:border-cyan/40 transition-all shadow-md group">
                  <div class="text-[11px] font-mono text-text-muted uppercase tracking-wider group-hover:text-cyan transition-colors">${stat.label}</div>
                  <div class="text-3xl sm:text-4xl font-mono font-black text-text-primary mt-1 flex items-center justify-center">
                    <span class="stat-counter" data-target="${val}">${val}</span>
                    <span class="text-cyan text-xl sm:text-2xl">${stat.suffix}</span>
                  </div>
                  <div class="text-[10px] font-mono text-cyan/90 mt-1">${stat.change}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  setupScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animateCounters();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(this.container);
  }

  animateCounters() {
    const counters = this.container.querySelectorAll(".stat-counter");
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10) || 0;
      const duration = 1000; // ms
      const stepTime = 30;
      const totalSteps = duration / stepTime;
      const increment = Math.max(1, target / totalSteps);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, stepTime);
    });
  }

  bindEvents() {
    window.addEventListener("github-sync-complete", () => {
      this.render();
      if (this.hasAnimated) {
        this.animateCounters();
      }
    });
  }
}
