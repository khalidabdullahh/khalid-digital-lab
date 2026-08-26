/**
 * Command Palette (Cmd+K / Ctrl+K)
 * Author: Khalid Abdullah
 */

import { TOOLS } from "../data/tools.js";
import { PROJECTS } from "../data/projects.js";
import { EXPERIMENTS } from "../data/experiments.js";
import { KNOWLEDGE_ARTICLES } from "../data/knowledge.js";

export class CommandPalette {
  constructor() {
    this.isOpen = false;
    this.selectedIndex = 0;
    this.results = [];
    this.searchItems = [];

    this.init();
  }

  init() {
    this.buildSearchIndex();
    this.render();
    this.bindEvents();
  }

  buildSearchIndex() {
    this.searchItems = [
      // Navigation Actions
      { id: "nav-hero", title: "Home / Overview", category: "Navigation", icon: "🏠", action: () => this.jumpTo("#hero") },
      { id: "nav-lab", title: "The Lab (Experiments)", category: "Navigation", icon: "🧪", action: () => this.jumpTo("#lab") },
      { id: "nav-projects", title: "Projects Showcase", category: "Navigation", icon: "⚡", action: () => this.jumpTo("#projects") },
      { id: "nav-tools", title: "Tools & Products Hub", category: "Navigation", icon: "🛠️", action: () => this.jumpTo("#tools") },
      { id: "nav-knowledge", title: "Knowledge Garden & Graph", category: "Navigation", icon: "📚", action: () => this.jumpTo("#knowledge") },
      { id: "nav-build-log", title: "Activity & Build Log", category: "Navigation", icon: "⏱️", action: () => this.jumpTo("#build-log") },
      { id: "nav-about", title: "About Khalid Abdullah", category: "Navigation", icon: "👤", action: () => this.jumpTo("#about") },

      // Theme & Terminal Actions
      { id: "act-terminal", title: "Open CLI Developer Terminal", category: "Actions", icon: "💻", action: () => window.dispatchEvent(new CustomEvent("open-terminal")) },
      { id: "act-theme", title: "Toggle Dark / Light Theme", category: "Actions", icon: "🌓", action: () => document.getElementById("btn-theme-toggle")?.click() },

      // Tools
      ...TOOLS.map(t => ({
        id: t.id,
        title: t.name,
        subtitle: t.tagline,
        category: "Tools & Products",
        icon: "🛠️",
        action: () => {
          if (t.isInteractiveInSite) {
            this.jumpTo("#tools");
          } else {
            window.open(t.externalUrl, "_blank");
          }
        }
      })),

      // Experiments
      ...EXPERIMENTS.map(e => ({
        id: e.id,
        title: e.title,
        subtitle: e.category,
        category: "Lab Experiments",
        icon: "🧪",
        action: () => this.jumpTo("#lab")
      })),

      // Projects
      ...PROJECTS.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: p.category,
        category: "Projects",
        icon: "⚡",
        action: () => {
          if (p.liveUrl.startsWith("http")) window.open(p.liveUrl, "_blank");
          else this.jumpTo(p.liveUrl);
        }
      })),

      // Knowledge
      ...KNOWLEDGE_ARTICLES.map(a => ({
        id: a.id,
        title: a.title,
        subtitle: a.category,
        category: "Knowledge Notes",
        icon: "📖",
        action: () => this.jumpTo("#knowledge")
      }))
    ];
  }

  render() {
    const existing = document.getElementById("cmd-palette-backdrop");
    if (existing) existing.remove();

    const paletteHtml = `
      <div id="cmd-palette-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
        <div class="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <!-- Input Header -->
          <div class="flex items-center px-4 py-3.5 border-b border-border gap-3">
            <svg class="w-4 h-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="cmd-search-input" placeholder="Type a command, project, tool, or research topic..." class="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none" autocomplete="off" spellcheck="false" />
            <kbd class="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-text-muted">ESC</kbd>
          </div>

          <!-- Results List Container -->
          <div id="cmd-results-list" class="overflow-y-auto p-2 space-y-1 max-h-96">
            <!-- Dynamically populated -->
          </div>

          <!-- Footer Shortcut Hints -->
          <div class="px-4 py-2.5 bg-surface-elevated/40 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↑</kbd> <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↓</kbd> Navigate</span>
              <span><kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↵</kbd> Select</span>
            </div>
            <span>Antigravity Palette</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", paletteHtml);
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      } else if (e.key === "Escape" && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });

    window.addEventListener("open-command-palette", () => this.open());

    const backdrop = document.getElementById("cmd-palette-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });

    const input = document.getElementById("cmd-search-input");
    input?.addEventListener("input", (e) => {
      this.filterResults(e.target.value);
    });
  }

  open() {
    this.isOpen = true;
    const backdrop = document.getElementById("cmd-palette-backdrop");
    const input = document.getElementById("cmd-search-input");
    if (backdrop && input) {
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      input.value = "";
      this.filterResults("");
      setTimeout(() => input.focus(), 50);
    }
  }

  close() {
    this.isOpen = false;
    const backdrop = document.getElementById("cmd-palette-backdrop");
    if (backdrop) {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  filterResults(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.results = this.searchItems.slice(0, 8);
    } else {
      this.results = this.searchItems.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      ).slice(0, 10);
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    const listEl = document.getElementById("cmd-results-list");
    if (!listEl) return;

    if (this.results.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-xs font-mono text-text-muted">
          No matches found for this query.
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.results.map((item, idx) => `
      <div class="cmd-item p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
        idx === this.selectedIndex ? "bg-cyan/15 border border-cyan/40 text-cyan" : "hover:bg-surface-elevated text-text-secondary"
      }" data-idx="${idx}">
        <div class="flex items-center gap-3">
          <span class="text-base">${item.icon}</span>
          <div>
            <div class="text-xs font-mono font-bold text-text-primary ${idx === this.selectedIndex ? "text-cyan" : ""}">${item.title}</div>
            ${item.subtitle ? `<div class="text-[10px] font-mono text-text-muted line-clamp-1">${item.subtitle}</div>` : ""}
          </div>
        </div>

        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-text-muted">
          ${item.category}
        </span>
      </div>
    `).join("");

    listEl.querySelectorAll(".cmd-item").forEach(itemEl => {
      itemEl.addEventListener("click", () => {
        const idx = parseInt(itemEl.dataset.idx, 10);
        this.selectedIndex = idx;
        this.executeSelected();
      });
    });
  }

  moveSelection(delta) {
    if (this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + delta + this.results.length) % this.results.length;
    this.renderResults();

    const activeEl = document.querySelector(`.cmd-item[data-idx="${this.selectedIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }

  executeSelected() {
    const selected = this.results[this.selectedIndex];
    if (selected && selected.action) {
      this.close();
      selected.action();
    }
  }

  jumpTo(hash) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
}
