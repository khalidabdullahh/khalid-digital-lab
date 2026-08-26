/**
 * Live Dynamic Lab Statistics Component
 * Author: Khalid Abdullah
 */

import { CONFIG } from "../config.js";

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
  }

  render() {
    this.container.innerHTML = `
      <div class="py-16 border-y border-border/80 bg-surface/60 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            ${CONFIG.stats.map(stat => `
              <div class="p-5 rounded-3xl bg-surface border border-border/80 text-center hover:border-cyan/40 transition-all shadow-md">
                <div class="text-[11px] font-mono text-text-muted uppercase tracking-wider">${stat.label}</div>
                <div class="text-3xl sm:text-4xl font-mono font-black text-text-primary mt-1 flex items-center justify-center">
                  <span class="stat-counter" data-target="${stat.value}">0</span>
                  <span class="text-cyan text-xl sm:text-2xl">${stat.suffix}</span>
                </div>
                <div class="text-[10px] font-mono text-cyan/90 mt-1">${stat.change}</div>
              </div>
            `).join("")}
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
      const duration = 1200; // ms
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;
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
}
