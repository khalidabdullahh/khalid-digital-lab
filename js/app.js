/**
 * Personal Digital Lab - Main Application Entrypoint
 * Author: Khalid Abdullah
 */

import { CONFIG } from "./config.js";
import { Navigation } from "./components/Navigation.js";
import { HeroCanvas } from "./components/HeroCanvas.js";
import { CurrentlyBuilding } from "./components/CurrentlyBuilding.js";
import { LabSection } from "./components/LabSection.js";
import { ProjectsSection } from "./components/ProjectsSection.js";
import { ToolsSection } from "./components/ToolsSection.js";
import { KnowledgeSection } from "./components/KnowledgeSection.js";
import { BuildLogSection } from "./components/BuildLogSection.js";
import { AboutSection } from "./components/AboutSection.js";
import { LiveStats } from "./components/LiveStats.js";
import { CommandPalette } from "./components/CommandPalette.js";
import { TerminalModal } from "./components/TerminalModal.js";
import { CustomCursor } from "./components/CustomCursor.js";
import { githubService } from "./services/GitHubService.js";

class App {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    console.log(`%c🧪 Khalid Abdullah // Personal Digital Lab v${CONFIG.system.version} Initialized.`, "color: #00f0ff; font-weight: bold; font-family: monospace; font-size: 14px;");

    // Initialize GitHub Auto-Sync Service in background
    githubService.init();

    // Initialize Navigation & Utilities
    this.components.navigation = new Navigation();
    this.components.heroCanvas = new HeroCanvas("hero-bg-canvas");
    this.components.currentlyBuilding = new CurrentlyBuilding("currently-building-container");
    this.components.lab = new LabSection("lab-container");
    this.components.projects = new ProjectsSection("projects-container");
    this.components.tools = new ToolsSection("tools-container");
    this.components.knowledge = new KnowledgeSection("knowledge-container");
    this.components.buildLog = new BuildLogSection("build-log-container");
    this.components.stats = new LiveStats("live-stats-container");
    this.components.about = new AboutSection("about-container");

    // Power Features
    this.components.commandPalette = new CommandPalette();
    this.components.terminal = new TerminalModal();
    this.components.cursor = new CustomCursor();

    this.setupSmoothScroll();
    this.renderFooter();
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
          history.pushState(null, "", targetId);
        }
      });
    });
  }

  renderFooter() {
    const footerEl = document.getElementById("main-footer");
    if (!footerEl) return;

    footerEl.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border/80">
          <!-- Brand Column -->
          <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-surface-elevated border border-cyan/40 flex items-center justify-center font-mono font-black text-cyan text-sm">
                KA
              </div>
              <span class="font-mono font-bold text-sm tracking-wider text-text-primary uppercase">KHALID ABDULLAH // DIGITAL LAB</span>
            </div>
            <p class="text-xs text-text-secondary max-w-sm leading-relaxed">
              «Who I am + What I am researching + What I am building + What I have learned + What people can actually use.»
            </p>
            <div class="text-[11px] font-mono text-text-muted">
              Built with curiosity, mathematical rigor, and high-performance frontend architecture.
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="space-y-3">
            <div class="text-xs font-mono font-bold text-cyan uppercase">SYSTEM SITEMAP</div>
            <ul class="space-y-2 text-xs font-mono text-text-secondary">
              <li><a href="#hero" class="hover:text-cyan transition-colors">00 // Home</a></li>
              <li><a href="#lab" class="hover:text-cyan transition-colors">01 // The Lab 🧪</a></li>
              <li><a href="#projects" class="hover:text-cyan transition-colors">02 // Projects ⚡</a></li>
              <li><a href="#tools" class="hover:text-cyan transition-colors">03 // Tools Hub 🛠️</a></li>
              <li><a href="#knowledge" class="hover:text-cyan transition-colors">04 // Knowledge 📚</a></li>
              <li><a href="#build-log" class="hover:text-cyan transition-colors">05 // Build Log ⏱️</a></li>
              <li><a href="#about" class="hover:text-cyan transition-colors">06 // Profile 👤</a></li>
            </ul>
          </div>

          <!-- Direct Links -->
          <div class="space-y-3">
            <div class="text-xs font-mono font-bold text-cyan uppercase">EXTERNAL PRODUCTS</div>
            <ul class="space-y-2 text-xs font-mono text-text-secondary">
              <li><a href="https://first-project-plum-phi.vercel.app" target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors flex items-center gap-1"><span>AI CV Builder</span><span>↗</span></a></li>
              <li><a href="https://oops-snowy-three.vercel.app/" target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors flex items-center gap-1"><span>Oops! Game</span><span>↗</span></a></li>
              <li><a href="${CONFIG.author.github}" target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors flex items-center gap-1"><span>GitHub Repos</span><span>↗</span></a></li>
              <li><a href="${CONFIG.author.linkedin}" target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors flex items-center gap-1"><span>LinkedIn</span><span>↗</span></a></li>
            </ul>
          </div>
        </div>

        <div class="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <div>© ${new Date().getFullYear()} Khalid Abdullah. All rights reserved.</div>
          <div class="flex items-center gap-4">
            <span>v${CONFIG.system.version}</span>
            <span>•</span>
            <span class="text-emerald-400 font-bold">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Bootstrap on DOM Ready or immediately if DOM is already parsed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.__APP__ = new App();
  });
} else {
  window.__APP__ = new App();
}
