/**
 * Global Navigation System & Mobile Dock
 * Author: Khalid Abdullah
 */

import { CONFIG } from "../config.js";

export class Navigation {
  constructor() {
    this.navEl = document.getElementById("main-nav");
    this.mobileDockEl = document.getElementById("mobile-dock");
    this.sections = ["hero", "currently-building", "lab", "projects", "tools", "knowledge", "build-log", "about"];
    this.activeSection = "hero";
    
    this.init();
  }

  init() {
    this.renderHeader();
    this.renderMobileDock();
    this.bindEvents();
    this.setupIntersectionObserver();
  }

  renderHeader() {
    if (!this.navEl) return;
    this.navEl.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & System Status -->
        <a href="#hero" class="flex items-center gap-3 group">
          <div class="w-8 h-8 rounded-lg bg-surface-elevated border border-border group-hover:border-cyan flex items-center justify-center transition-all shadow-inner">
            <span class="font-mono font-black text-cyan text-sm tracking-tighter">KA</span>
          </div>
          <div>
            <div class="font-mono font-bold text-xs tracking-wider text-text-primary group-hover:text-cyan transition-colors uppercase">
              KHALID ABDULLAH
            </div>
            <div class="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DIGITAL LAB</span>
              <span class="text-border">|</span>
              <span class="text-cyan">v${CONFIG.system.version}</span>
            </div>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2">
          <a href="#hero" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all" data-section="hero">Home</a>
          <a href="#lab" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all flex items-center gap-1" data-section="lab">
            <span>🧪</span> Lab
          </a>
          <a href="#projects" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all flex items-center gap-1" data-section="projects">
            <span>⚡</span> Projects
          </a>
          <a href="#tools" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all flex items-center gap-1" data-section="tools">
            <span>🛠️</span> Tools
          </a>
          <a href="#knowledge" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all flex items-center gap-1" data-section="knowledge">
            <span>📚</span> Knowledge
          </a>
          <a href="#build-log" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all" data-section="build-log">Build Log</a>
          <a href="#about" class="nav-link px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all" data-section="about">About</a>
        </nav>

        <!-- Right Side Utility Action Icons -->
        <div class="flex items-center gap-2">
          <!-- Command Palette Trigger -->
          <button id="btn-cmd-k" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-text-secondary hover:text-cyan hover:border-cyan/50 transition-all cursor-pointer" title="Quick Search (Cmd+K)">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span class="hidden sm:inline">Search</span>
            <kbd class="hidden sm:inline px-1.5 py-0.5 text-[10px] rounded bg-surface border border-border text-text-muted">⌘K</kbd>
          </button>

          <!-- Terminal Trigger -->
          <button id="btn-open-terminal" class="p-2 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-emerald-400 hover:border-emerald-400/50 transition-all cursor-pointer" title="Open Interactive CLI Terminal (~)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </button>

          <!-- Theme Toggle -->
          <button id="btn-theme-toggle" class="p-2 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-amber-400 hover:border-amber-400/50 transition-all cursor-pointer" title="Toggle Light/Dark Theme">
            <svg id="theme-icon-sun" class="w-4 h-4 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg id="theme-icon-moon" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>

          <!-- GitHub Link -->
          <a href="${CONFIG.author.github}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:border-border/80 transition-all" title="GitHub Profile">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>

          <!-- Contact Dispatch Button -->
          <a href="#about" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-mono font-semibold transition-all">
            <span>Connect</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;
  }

  renderMobileDock() {
    if (!this.mobileDockEl) return;
    this.mobileDockEl.innerHTML = `
      <div class="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-1.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border/90 shadow-2xl flex items-center justify-around md:hidden">
        <a href="#hero" class="mobile-dock-btn p-2 rounded-xl text-text-secondary hover:text-cyan flex flex-col items-center gap-0.5" data-section="hero">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span class="text-[10px] font-mono">Home</span>
        </a>
        <a href="#lab" class="mobile-dock-btn p-2 rounded-xl text-text-secondary hover:text-cyan flex flex-col items-center gap-0.5" data-section="lab">
          <span class="text-sm">🧪</span>
          <span class="text-[10px] font-mono">Lab</span>
        </a>
        <a href="#projects" class="mobile-dock-btn p-2 rounded-xl text-text-secondary hover:text-cyan flex flex-col items-center gap-0.5" data-section="projects">
          <span class="text-sm">⚡</span>
          <span class="text-[10px] font-mono">Projects</span>
        </a>
        <a href="#tools" class="mobile-dock-btn p-2 rounded-xl text-text-secondary hover:text-cyan flex flex-col items-center gap-0.5" data-section="tools">
          <span class="text-sm">🛠️</span>
          <span class="text-[10px] font-mono">Tools</span>
        </a>
        <a href="#knowledge" class="mobile-dock-btn p-2 rounded-xl text-text-secondary hover:text-cyan flex flex-col items-center gap-0.5" data-section="knowledge">
          <span class="text-sm">📚</span>
          <span class="text-[10px] font-mono">Notes</span>
        </a>
        <button id="mobile-cmd-btn" class="p-2 rounded-xl text-cyan bg-cyan/15 flex flex-col items-center gap-0.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span class="text-[10px] font-mono">Search</span>
        </button>
      </div>
    `;
  }

  bindEvents() {
    // Scroll header background blur
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        this.navEl.classList.add("bg-surface/85", "backdrop-blur-md", "border-b", "border-border/80", "shadow-lg");
      } else {
        this.navEl.classList.remove("bg-surface/85", "backdrop-blur-md", "border-b", "border-border/80", "shadow-lg");
      }
    });

    // Theme Switcher
    const themeBtn = document.getElementById("btn-theme-toggle");
    const sunIcon = document.getElementById("theme-icon-sun");
    const moonIcon = document.getElementById("theme-icon-moon");

    themeBtn?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("theme-light");
      const currentTheme = isDark ? "light" : "dark";
      localStorage.setItem("lab-theme", currentTheme);
      if (currentTheme === "light") {
        sunIcon?.classList.remove("hidden");
        moonIcon?.classList.add("hidden");
      } else {
        sunIcon?.classList.add("hidden");
        moonIcon?.classList.remove("hidden");
      }
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem("lab-theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("theme-light");
      sunIcon?.classList.remove("hidden");
      moonIcon?.classList.add("hidden");
    }

    // Command palette trigger
    document.getElementById("btn-cmd-k")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    });
    document.getElementById("mobile-cmd-btn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    });

    // Terminal trigger
    document.getElementById("btn-open-terminal")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-terminal"));
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.setActiveLink(sectionId);
        }
      });
    }, { rootMargin: "-20% 0px -60% 0px" });

    this.sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  setActiveLink(sectionId) {
    this.activeSection = sectionId;
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.dataset.section === sectionId) {
        link.classList.add("text-cyan", "bg-surface-elevated", "font-bold");
        link.classList.remove("text-text-secondary");
      } else {
        link.classList.remove("text-cyan", "bg-surface-elevated", "font-bold");
        link.classList.add("text-text-secondary");
      }
    });

    document.querySelectorAll(".mobile-dock-btn").forEach(btn => {
      if (btn.dataset.section === sectionId) {
        btn.classList.add("text-cyan", "bg-surface-elevated");
        btn.classList.remove("text-text-secondary");
      } else {
        btn.classList.remove("text-cyan", "bg-surface-elevated");
        btn.classList.add("text-text-secondary");
      }
    });
  }
}
