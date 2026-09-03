/**
 * Command Palette (Cmd+K / Ctrl+K)
 * Author: Khalid Abdullah
 */

import { TOOLS } from "../data/tools.js";
import { PROJECTS } from "../data/projects.js";

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
      { id: "nav-projects", title: "Projects Showcase", category: "Navigation", icon: "⚡", action: () => this.jumpTo("#projects") },
      { id: "nav-tools", title: "Tools & Products Hub", category: "Navigation", icon: "🛠️", action: () => this.jumpTo("#tools") },
      { id: "nav-build-log", title: "Activity & Build Log", category: "Navigation", icon: "⏱️", action: () => this.jumpTo("#build-log") },
      { id: "nav-about", title: "About Khalid Abdullah", category: "Navigation", icon: "👤", action: () => this.jumpTo("#about") },

      // Actions
      { id: "act-sync", title: "Sync Live GitHub Repositories", category: "Actions", icon: "🔄", action: () => document.getElementById("btn-sync-github")?.click() },
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
            <input type="text" id="cmd-search-input" placeholder="Type a command, project, tool, or repository..." class="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none" autocomplete="off" spellcheck="false" />
            <kbd class="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-text-muted">ESC</kbd>
          </div>

          <!-- Results List Container -->
          <div id="cmd-results-list" class="overflow-y-auto p-2 space-y-1 max-h-96">
            <!-- Dynamically populated -->
          </div>

          <!-- Footer Shortcut Hints -->
          <div class="px-4 py-2.5 bg-surface-elevated/80 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↑</kbd> <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↓</kbd> to navigate</span>
              <span><kbd class="px-1.5 py-0.5 rounded bg-surface border border-border">↵</kbd> to select</span>
            </div>
            <span>${this.searchItems.length} indexed items</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", paletteHtml);
  }

  bindEvents() {
    const backdrop = document.getElementById("cmd-palette-backdrop");
    const input = document.getElementById("cmd-search-input");

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    window.addEventListener("open-command-palette", () => {
      this.open();
    });

    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });

    input?.addEventListener("input", (e) => {
      this.search(e.target.value);
    });

    input?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
        this.renderResults();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderResults();
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.executeSelected();
      }
    });
  }

  open() {
    const backdrop = document.getElementById("cmd-palette-backdrop");
    const input = document.getElementById("cmd-search-input");
    this.isOpen = true;
    backdrop?.classList.remove("hidden");
    backdrop?.classList.add("flex");
    input?.focus();
    this.search("");
  }

  close() {
    const backdrop = document.getElementById("cmd-palette-backdrop");
    const input = document.getElementById("cmd-search-input");
    this.isOpen = false;
    backdrop?.classList.add("hidden");
    backdrop?.classList.remove("flex");
    if (input) input.value = "";
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  search(query) {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      this.results = this.searchItems;
    } else {
      this.results = this.searchItems.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(cleanQuery);
        const subMatch = item.subtitle ? item.subtitle.toLowerCase().includes(cleanQuery) : false;
        const catMatch = item.category.toLowerCase().includes(cleanQuery);
        return titleMatch || subMatch || catMatch;
      });
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    const list = document.getElementById("cmd-results-list");
    if (!list) return;

    if (this.results.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-xs font-mono text-text-muted">
          No matches found for your query. Try searching for "ARENEX", "CV Builder", "Trading", or "Tools".
        </div>
      `;
      return;
    }

    list.innerHTML = this.results.map((item, idx) => {
      const isSelected = idx === this.selectedIndex;
      return `
        <div class="cmd-item p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
          isSelected ? "bg-cyan/15 border border-cyan/30 text-cyan" : "hover:bg-surface-elevated text-text-primary"
        }" data-index="${idx}">
          <div class="flex items-center gap-3">
            <span class="text-base">${item.icon}</span>
            <div>
              <div class="text-xs font-mono font-bold">${item.title}</div>
              ${item.subtitle ? `<div class="text-[10px] text-text-muted mt-0.5 line-clamp-1">${item.subtitle}</div>` : ""}
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-surface-elevated border border-border text-text-muted uppercase">
            ${item.category}
          </span>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".cmd-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.dataset.index, 10);
        this.selectedIndex = idx;
        this.executeSelected();
      });
    });

    // Auto-scroll selected element into view
    const selectedEl = list.children[this.selectedIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }

  executeSelected() {
    const item = this.results[this.selectedIndex];
    if (item && item.action) {
      this.close();
      item.action();
    }
  }

  jumpTo(selector) {
    if (!selector) return;
    try {
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        history.pushState(null, "", selector);
      }
    } catch (e) {
      console.warn("Invalid selector jump:", selector);
    }
  }
}
