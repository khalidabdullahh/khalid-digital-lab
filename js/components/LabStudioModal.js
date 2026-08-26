/**
 * Lab Studio - In-Browser Research Notebook & Content Creator
 * Author: Khalid Abdullah
 */

import { KNOWLEDGE_ARTICLES } from "../data/knowledge.js";
import { EXPERIMENTS } from "../data/experiments.js";
import { BUILD_LOG } from "../data/buildLog.js";

export class LabStudioModal {
  constructor() {
    this.isOpen = false;
    this.activeType = "note"; // note, experiment, log
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.loadCustomSavedEntries();
  }

  render() {
    const existing = document.getElementById("studio-modal-backdrop");
    if (existing) existing.remove();

    const modalHtml = `
      <div id="studio-modal-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="relative w-full max-w-4xl my-6 rounded-3xl bg-surface border border-cyan/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-8 border-b border-border bg-surface-elevated/60">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-cyan/15 border border-cyan/30 text-cyan text-base">
                ✍️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold tracking-wider text-cyan uppercase">LAB STUDIO</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">● Auto-Save Drafts</span>
                </div>
                <h3 class="text-lg font-bold text-text-primary">Research Notebook & Note Creator</h3>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Type Switcher -->
              <div class="flex p-1 rounded-xl bg-surface border border-border text-xs font-mono">
                <button class="studio-type-btn px-3 py-1 rounded-lg text-cyan bg-cyan/15 border border-cyan/30 font-bold active" data-type="note">📚 Note</button>
                <button class="studio-type-btn px-3 py-1 rounded-lg text-text-secondary hover:text-text-primary" data-type="experiment">🧪 Experiment</button>
                <button class="studio-type-btn px-3 py-1 rounded-lg text-text-secondary hover:text-text-primary" data-type="log">⏱️ Log</button>
              </div>

              <button id="btn-close-studio" class="p-2 rounded-xl bg-surface hover:bg-border text-text-muted hover:text-text-primary transition-all cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Body Form Area -->
          <div class="flex-1 p-5 sm:p-8 overflow-y-auto space-y-5 text-xs font-mono">
            <!-- 1. Title & Category Row -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div class="sm:col-span-8">
                <label class="block text-[11px] font-bold text-text-muted uppercase mb-1.5">Title / Subject</label>
                <input type="text" id="studio-title" placeholder="e.g. Understanding Eigenvalues in Factor Risk Models" class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-border focus:border-cyan focus:outline-none text-text-primary text-sm font-sans" />
              </div>

              <div class="sm:col-span-4">
                <label class="block text-[11px] font-bold text-text-muted uppercase mb-1.5">Category</label>
                <select id="studio-category" class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-border focus:border-cyan focus:outline-none text-text-primary text-xs">
                  <option value="Quantitative Finance">Quantitative Finance</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Market Microstructure">Market Microstructure</option>
                </select>
              </div>
            </div>

            <!-- 2. Tags & Research Question (Conditional) -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div class="sm:col-span-6">
                <label class="block text-[11px] font-bold text-text-muted uppercase mb-1.5">Tags (Comma-separated)</label>
                <input type="text" id="studio-tags" placeholder="e.g. Linear Algebra, PCA, NumPy, Python" class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-border focus:border-cyan focus:outline-none text-text-primary" />
              </div>

              <div class="sm:col-span-6" id="studio-question-container" style="display: none;">
                <label class="block text-[11px] font-bold text-cyan uppercase mb-1.5">Core Research Question</label>
                <input type="text" id="studio-question" placeholder="e.g. Can HMM models detect regime transitions early?" class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-cyan/40 focus:border-cyan focus:outline-none text-text-primary" />
              </div>

              <div class="sm:col-span-6" id="studio-readtime-container">
                <label class="block text-[11px] font-bold text-text-muted uppercase mb-1.5">Read Time</label>
                <input type="text" id="studio-readtime" value="5 min read" class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-border focus:border-cyan focus:outline-none text-text-primary" />
              </div>
            </div>

            <!-- 3. Summary / One-liner Abstract -->
            <div>
              <label class="block text-[11px] font-bold text-text-muted uppercase mb-1.5">Brief Summary / Abstract</label>
              <textarea id="studio-summary" rows="2" placeholder="Write a crisp 1-2 sentence overview of your discoveries or learnings..." class="w-full p-3 rounded-xl bg-surface-elevated/80 border border-border focus:border-cyan focus:outline-none text-text-primary resize-none font-sans text-xs leading-relaxed"></textarea>
            </div>

            <!-- 4. Markdown Content Editor & Live Preview Tabs -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-bold text-text-muted uppercase">Full Markdown & Math Body ($$...$$ supported)</span>
                <span id="studio-word-count" class="text-text-muted text-[10px]">0 words</span>
              </div>
              <textarea id="studio-content" rows="8" placeholder="Write your full research notes, proofs, code blocks, or thoughts in Markdown here...

### 1. Key Finding
Explain your discovery.

$$f(x) = \sigma(Wx + b)$$

```python
# Experimental code
import numpy as np
```" class="w-full p-4 rounded-xl bg-[#050810] border border-border focus:border-cyan focus:outline-none text-text-secondary text-xs font-mono leading-relaxed resize-y"></textarea>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-5 sm:px-8 border-t border-border bg-surface-elevated/60 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Save to Live Site -->
              <button id="btn-studio-save-live" class="px-5 py-2.5 rounded-xl bg-cyan hover:bg-cyan-glow text-black font-mono font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer">
                <span>💾 Save & Publish to Live Site</span>
              </button>

              <!-- Copy JSON Code for js/data/ -->
              <button id="btn-studio-copy-code" class="px-4 py-2.5 rounded-xl bg-surface hover:bg-border border border-border text-text-secondary hover:text-cyan font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                <span>📋 Copy for js/data/</span>
              </button>

              <!-- Download .md file -->
              <button id="btn-studio-download-md" class="px-4 py-2.5 rounded-xl bg-surface hover:bg-border border border-border text-text-secondary hover:text-text-primary font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                <span>📥 Export .md</span>
              </button>
            </div>

            <div id="studio-feedback-msg" class="text-xs font-mono text-emerald-400 font-bold"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  bindEvents() {
    window.addEventListener("open-lab-studio", (e) => {
      const type = e.detail?.type || "note";
      this.setType(type);
      this.open();
    });

    document.getElementById("btn-close-studio")?.addEventListener("click", () => this.close());
    
    const backdrop = document.getElementById("studio-modal-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });

    // Switch types
    document.querySelectorAll(".studio-type-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        this.setType(type);
      });
    });

    // Content live word count
    const contentEl = document.getElementById("studio-content");
    contentEl?.addEventListener("input", () => {
      const words = contentEl.value.trim() ? contentEl.value.trim().split(/\s+/).length : 0;
      document.getElementById("studio-word-count").textContent = `${words} words`;
      // Estimate read time
      const mins = Math.max(1, Math.ceil(words / 180));
      const readTimeEl = document.getElementById("studio-readtime");
      if (readTimeEl) readTimeEl.value = `${mins} min read`;
    });

    // Actions
    document.getElementById("btn-studio-save-live")?.addEventListener("click", () => this.saveToLiveSite());
    document.getElementById("btn-studio-copy-code")?.addEventListener("click", () => this.copyDataCode());
    document.getElementById("btn-studio-download-md")?.addEventListener("click", () => this.downloadMarkdown());
  }

  setType(type) {
    this.activeType = type;
    document.querySelectorAll(".studio-type-btn").forEach(b => {
      if (b.dataset.type === type) {
        b.className = "studio-type-btn px-3 py-1 rounded-lg text-cyan bg-cyan/15 border border-cyan/30 font-bold active";
      } else {
        b.className = "studio-type-btn px-3 py-1 rounded-lg text-text-secondary hover:text-text-primary";
      }
    });

    const questionContainer = document.getElementById("studio-question-container");
    const readtimeContainer = document.getElementById("studio-readtime-container");

    if (type === "experiment") {
      if (questionContainer) questionContainer.style.display = "block";
      if (readtimeContainer) readtimeContainer.style.display = "none";
    } else {
      if (questionContainer) questionContainer.style.display = "none";
      if (readtimeContainer) readtimeContainer.style.display = "block";
    }
  }

  open() {
    this.isOpen = true;
    const backdrop = document.getElementById("studio-modal-backdrop");
    if (backdrop) {
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      document.body.style.overflow = "hidden";
      setTimeout(() => document.getElementById("studio-title")?.focus(), 50);
    }
  }

  close() {
    this.isOpen = false;
    const backdrop = document.getElementById("studio-modal-backdrop");
    if (backdrop) {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
      document.body.style.overflow = "auto";
    }
  }

  getFormData() {
    const title = document.getElementById("studio-title")?.value.trim() || "Untitled Entry";
    const category = document.getElementById("studio-category")?.value || "Computer Science";
    const tags = (document.getElementById("studio-tags")?.value || "").split(",").map(t => t.trim()).filter(Boolean);
    const readTime = document.getElementById("studio-readtime")?.value || "3 min read";
    const question = document.getElementById("studio-question")?.value.trim() || "";
    const summary = document.getElementById("studio-summary")?.value.trim() || "";
    const content = document.getElementById("studio-content")?.value.trim() || "";
    const id = `custom-${Date.now()}`;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return { id, title, category, tags, readTime, question, summary, content, date, type: this.activeType };
  }

  saveToLiveSite() {
    const data = this.getFormData();
    const storageKey = `custom-lab-${this.activeType}s`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existing.unshift(data);
    localStorage.setItem(storageKey, JSON.stringify(existing));

    this.showFeedback("✓ Published to live site memory! Check section below.");

    // Inject directly into active in-memory datasets
    if (this.activeType === "note") {
      KNOWLEDGE_ARTICLES.unshift({
        id: data.id,
        title: data.title,
        category: data.category,
        readTime: data.readTime,
        date: data.date,
        tags: data.tags.length ? data.tags : ["Research", "Personal Lab"],
        summary: data.summary || "Custom note created in Lab Studio.",
        content: data.content || "No extended content."
      });
      window.__APP__?.components?.knowledge?.render();
    } else if (this.activeType === "experiment") {
      EXPERIMENTS.unshift({
        id: data.id,
        title: data.title,
        category: data.category,
        status: "experimenting",
        statusLabel: "Experimenting",
        statusColor: "amber",
        progress: 10,
        lastUpdated: data.date,
        technologies: data.tags.length ? data.tags : ["Python", "Research"],
        researchQuestion: data.question || data.summary || "Open experimental inquiry.",
        hypothesis: data.summary || "Working hypothesis under test.",
        methodology: ["Initiated in Lab Studio.", "Formulating baseline dataset."],
        mathFormula: "",
        codeSnippet: "",
        results: ["Experiment initialized."],
        learnings: ["Documenting initial parameters."]
      });
      window.__APP__?.components?.lab?.render();
    } else if (this.activeType === "log") {
      BUILD_LOG.unshift({
        id: data.id,
        date: data.date.toUpperCase(),
        title: data.title,
        type: "learning",
        typeLabel: "Learning",
        icon: "book-open",
        color: "cyan",
        commit: data.id.slice(-6),
        description: data.summary || data.content.slice(0, 120),
        metrics: "Custom Milestone",
        tags: data.tags
      });
      window.__APP__?.components?.buildLog?.render();
    }

    setTimeout(() => this.close(), 1200);
  }

  loadCustomSavedEntries() {
    try {
      const customNotes = JSON.parse(localStorage.getItem("custom-lab-notes") || "[]");
      customNotes.forEach(data => {
        if (!KNOWLEDGE_ARTICLES.some(a => a.id === data.id)) {
          KNOWLEDGE_ARTICLES.unshift({
            id: data.id,
            title: data.title,
            category: data.category,
            readTime: data.readTime,
            date: data.date,
            tags: data.tags,
            summary: data.summary,
            content: data.content
          });
        }
      });
    } catch (e) {
      console.warn("Could not load custom entries from localStorage", e);
    }
  }

  copyDataCode() {
    const data = this.getFormData();
    let snippet = "";
    if (this.activeType === "note") {
      snippet = `  {
    id: "${data.id}",
    title: "${data.title}",
    category: "${data.category}",
    readTime: "${data.readTime}",
    date: "${data.date}",
    tags: ${JSON.stringify(data.tags)},
    summary: "${data.summary.replace(/"/g, '\\"')}",
    content: \`\n${data.content.replace(/`/g, '\\`')}\n    \`
  },`;
    } else if (this.activeType === "experiment") {
      snippet = `  {
    id: "${data.id}",
    title: "${data.title}",
    category: "${data.category}",
    status: "experimenting",
    statusLabel: "Experimenting",
    statusColor: "amber",
    progress: 25,
    lastUpdated: "${data.date}",
    technologies: ${JSON.stringify(data.tags)},
    researchQuestion: "${data.question.replace(/"/g, '\\"')}",
    hypothesis: "${data.summary.replace(/"/g, '\\"')}",
    methodology: [
      "1. Data collection and preprocessing.",
      "2. Model architecture formulation."
    ],
    mathFormula: "",
    codeSnippet: "",
    results: ["Initial baseline established."],
    learnings: ["Documenting early results."]
  },`;
    }

    navigator.clipboard.writeText(snippet);
    this.showFeedback("✓ JS Object copied to clipboard! Paste in js/data/");
  }

  downloadMarkdown() {
    const data = this.getFormData();
    const mdContent = `# ${data.title}

> **Category:** ${data.category}  
> **Date:** ${data.date}  
> **Tags:** ${data.tags.join(", ")}  
> **Read Time:** ${data.readTime}  

---

## Abstract
${data.summary}

---

## Notes & Documentation
${data.content}
`;

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showFeedback("✓ Markdown file (.md) downloaded!");
  }

  showFeedback(msg) {
    const feedbackEl = document.getElementById("studio-feedback-msg");
    if (feedbackEl) {
      feedbackEl.textContent = msg;
      setTimeout(() => feedbackEl.textContent = "", 3000);
    }
  }
}
