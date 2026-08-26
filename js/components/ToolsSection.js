/**
 * Tools & Products Hub Component
 * Author: Khalid Abdullah
 */

import { TOOLS } from "../data/tools.js";
import { RegimeSimulator } from "./InteractiveTools/RegimeSimulator.js";
import { ATSAnalyzer } from "./InteractiveTools/ATSAnalyzer.js";
import { KellyCalculator } from "./InteractiveTools/KellyCalculator.js";
import { VectorNormVisualizer } from "./InteractiveTools/VectorNormVisualizer.js";

export class ToolsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeInteractiveTool = "regime";
    this.toolInstances = {};

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
    this.mountActiveTool();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>🛠️</span>
              <span>TOOLS & PRODUCTS // LIVE BENCH</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Interactive Tools & Software Products
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              «What people can actually use.» Test quantitative market simulations, audit your CV against real ATS algorithms, or launch full-scale web applications directly.
            </p>
          </div>
        </div>

        <!-- 1. Interactive Tool In-Browser Workbench (Embedded Execution) -->
        <div class="mb-14 p-6 sm:p-8 rounded-3xl bg-surface-elevated/40 border border-cyan/30 shadow-2xl relative">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-md bg-cyan/15 border border-cyan/30 text-cyan text-xs font-mono font-bold">LIVE BENCH</span>
              <span class="text-xs font-mono text-text-muted">Select an interactive tool to test in real-time</span>
            </div>

            <!-- Tool Switcher Tabs -->
            <div class="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-surface border border-border">
              <button class="tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all active bg-cyan/15 border border-cyan/40 text-cyan font-bold" data-tool="regime">
                📈 Regime Simulator
              </button>
              <button class="tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all text-text-secondary hover:text-text-primary" data-tool="ats">
                📄 ATS Resume Analyzer
              </button>
              <button class="tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all text-text-secondary hover:text-text-primary" data-tool="kelly">
                🎲 Kelly Position Calculator
              </button>
              <button class="tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all text-text-secondary hover:text-text-primary" data-tool="vector">
                🧭 Vector Norms ($L_p$)
              </button>
            </div>
          </div>

          <!-- Dynamic Mount Container for Active Interactive Tool -->
          <div id="interactive-tool-mount"></div>
        </div>

        <!-- 2. Scalable Tool Registry Grid (All Tools) -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xs font-mono font-bold tracking-widest text-text-muted uppercase">
            PRODUCT ECOSYSTEM DIRECTORY
          </h3>
          <span class="text-xs font-mono text-cyan">${TOOLS.length} Tools Available</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${TOOLS.map(tool => `
            <div class="tool-card group relative p-7 rounded-3xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-elevated border border-border text-cyan">
                    ${tool.category}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    tool.statusColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                    tool.statusColor === "amber" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                    "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  }">
                    ● ${tool.status}
                  </span>
                </div>

                <h4 class="text-xl font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight">
                  ${tool.name}
                </h4>

                <p class="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  ${tool.description}
                </p>

                <!-- Capabilities list -->
                <ul class="space-y-1.5 mt-4 pt-3 border-t border-border/60">
                  ${tool.capabilities.slice(0, 3).map(cap => `
                    <li class="flex items-start gap-2 text-[11px] text-text-secondary">
                      <span class="text-cyan font-bold">✓</span>
                      <span class="line-clamp-1">${cap}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>

              <!-- Footer -->
              <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                <span class="text-[11px] font-mono text-text-muted">${tool.pricing}</span>

                ${tool.isInteractiveInSite ? `
                  <button class="launch-bench-btn text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1 cursor-pointer" data-bench="${tool.id}">
                    <span>${tool.actionLabel} →</span>
                  </button>
                ` : `
                  <a href="${tool.externalUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1">
                    <span>${tool.actionLabel}</span>
                  </a>
                `}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll(".tool-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.container.querySelectorAll(".tool-tab-btn").forEach(b => {
          b.className = "tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all text-text-secondary hover:text-text-primary";
        });
        btn.className = "tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all active bg-cyan/15 border border-cyan/40 text-cyan font-bold";
        this.activeInteractiveTool = btn.dataset.tool;
        this.mountActiveTool();
      });
    });

    this.container.querySelectorAll(".launch-bench-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const toolId = btn.dataset.bench;
        if (toolId === "tool-regime-simulator") this.switchTab("regime");
        else if (toolId === "tool-ats-analyzer") this.switchTab("ats");
        else if (toolId === "tool-kelly-calculator") this.switchTab("kelly");
        else if (toolId === "tool-vector-viz") this.switchTab("vector");

        const mount = document.getElementById("interactive-tool-mount");
        mount?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  switchTab(toolKey) {
    this.activeInteractiveTool = toolKey;
    this.container.querySelectorAll(".tool-tab-btn").forEach(b => {
      if (b.dataset.tool === toolKey) {
        b.className = "tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all active bg-cyan/15 border border-cyan/40 text-cyan font-bold";
      } else {
        b.className = "tool-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all text-text-secondary hover:text-text-primary";
      }
    });
    this.mountActiveTool();
  }

  mountActiveTool() {
    const mountEl = document.getElementById("interactive-tool-mount");
    if (!mountEl) return;

    mountEl.innerHTML = `<div id="tool-active-canvas-container"></div>`;

    if (this.activeInteractiveTool === "regime") {
      this.toolInstances.regime = new RegimeSimulator("tool-active-canvas-container");
    } else if (this.activeInteractiveTool === "ats") {
      this.toolInstances.ats = new ATSAnalyzer("tool-active-canvas-container");
    } else if (this.activeInteractiveTool === "kelly") {
      this.toolInstances.kelly = new KellyCalculator("tool-active-canvas-container");
    } else if (this.activeInteractiveTool === "vector") {
      this.toolInstances.vector = new VectorNormVisualizer("tool-active-canvas-container");
    }
  }
}
