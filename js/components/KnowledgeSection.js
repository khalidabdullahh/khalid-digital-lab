/**
 * Knowledge & Learning Space Component with Interactive Knowledge Graph
 * Author: Khalid Abdullah
 */

import { KNOWLEDGE_ARTICLES } from "../data/knowledge.js";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph.js";

export class KnowledgeSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.graphCanvas = null;
    this.graphCtx = null;
    this.nodes = [];
    this.links = [];
    this.hoveredNode = null;
    this.selectedNode = null;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.initGraph();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>📚</span>
              <span>KNOWLEDGE GARDEN // CONTINUOUS LEARNING</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Research Notes & Concept Graph
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              What I am learning, deriving, and formalizing. Discover mathematical proofs, architecture lessons, and topological concept relationships.
            </p>
          </div>
        </div>

        <!-- 1. Interactive Knowledge Graph Canvas -->
        <div class="mb-14 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl relative overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></span>
                <h3 class="text-base font-bold text-text-primary font-mono uppercase tracking-wide">INTERACTIVE KNOWLEDGE GRAPH</h3>
              </div>
              <p class="text-xs text-text-secondary mt-0.5">Click or hover nodes to inspect interdisciplinary research connections</p>
            </div>

            <!-- Active Concept Telemetry Pill -->
            <div id="graph-node-telemetry" class="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-cyan">
              Hover over any node to inspect concept topology
            </div>
          </div>

          <!-- Canvas Container -->
          <div class="relative w-full h-[320px] sm:h-[380px] rounded-2xl bg-[#060810] border border-border/80 overflow-hidden cursor-crosshair">
            <canvas id="knowledge-graph-canvas" class="w-full h-full block"></canvas>
            <div class="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 border border-border text-[11px] font-mono text-text-muted">
              Nodes: ${KNOWLEDGE_GRAPH.nodes.length} • Links: ${KNOWLEDGE_GRAPH.links.length}
            </div>
          </div>
        </div>

        <!-- 2. Research Notes & Articles Grid -->
        <h3 class="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-6">
          CURATED ESSAYS & RESEARCH BRIEFS
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${KNOWLEDGE_ARTICLES.map(article => `
            <div class="article-card group relative p-6 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer" data-article-id="${article.id}">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-elevated border border-border text-cyan">
                    ${article.category}
                  </span>
                  <span class="text-xs font-mono text-text-muted">${article.readTime}</span>
                </div>

                <h4 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight leading-snug">
                  ${article.title}
                </h4>

                <p class="text-xs text-text-secondary mt-2.5 line-clamp-3 leading-relaxed">
                  ${article.summary}
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 mt-4">
                  ${article.tags.slice(0, 3).map(tag => `
                    <span class="px-2 py-0.5 rounded bg-surface-elevated border border-border/60 text-[10px] font-mono text-text-muted">
                      #${tag}
                    </span>
                  `).join("")}
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                <span class="text-xs font-mono text-text-muted">${article.date}</span>
                <span class="text-xs font-mono font-bold text-cyan group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Read Note</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Article Reading Modal Container -->
      <div id="article-modal-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div id="article-modal-content" class="relative w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-2xl">
          <!-- Injected via openArticleModal() -->
        </div>
      </div>
    `;
  }

  initGraph() {
    this.graphCanvas = document.getElementById("knowledge-graph-canvas");
    if (!this.graphCanvas) return;
    this.graphCtx = this.graphCanvas.getContext("2d");
    
    this.resizeGraph();
    this.setupGraphNodes();
    this.animateGraph();
  }

  resizeGraph() {
    const rect = this.graphCanvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.graphCanvas.width = this.width * dpr;
    this.graphCanvas.height = this.height * dpr;
    this.graphCtx.scale(dpr, dpr);
  }

  setupGraphNodes() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Distribute nodes in orbit circles with spring physics
    this.nodes = KNOWLEDGE_GRAPH.nodes.map((node, i) => {
      const isCore = node.group === "core";
      const angle = (i / KNOWLEDGE_GRAPH.nodes.length) * Math.PI * 2;
      const dist = isCore ? Math.min(this.width, this.height) * 0.22 : Math.min(this.width, this.height) * 0.38 + (Math.random() * 20 - 10);
      
      return {
        ...node,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        targetX: cx + Math.cos(angle) * dist,
        targetY: cy + Math.sin(angle) * dist,
        currentRadius: node.radius
      };
    });

    this.links = KNOWLEDGE_GRAPH.links.map(link => {
      const sourceNode = this.nodes.find(n => n.id === link.source);
      const targetNode = this.nodes.find(n => n.id === link.target);
      return { source: sourceNode, target: targetNode, strength: link.strength || 0.5 };
    }).filter(l => l.source && l.target);
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resizeGraph();
      this.setupGraphNodes();
    });

    // Graph Mouse Interactions
    const getPos = (e) => {
      const rect = this.graphCanvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    this.graphCanvas?.addEventListener("mousemove", (e) => {
      const pos = getPos(e);
      let found = null;
      for (const node of this.nodes) {
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 6) {
          found = node;
          break;
        }
      }
      this.hoveredNode = found;
      this.updateTelemetry(found);
    });

    this.graphCanvas?.addEventListener("click", () => {
      if (this.hoveredNode) {
        this.selectedNode = this.hoveredNode;
      } else {
        this.selectedNode = null;
      }
    });

    // Article Card Click Listener
    this.container.querySelectorAll(".article-card").forEach(card => {
      card.addEventListener("click", () => {
        const artId = card.dataset.articleId;
        const article = KNOWLEDGE_ARTICLES.find(a => a.id === artId);
        if (article) this.openArticleModal(article);
      });
    });

    const backdrop = document.getElementById("article-modal-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.closeArticleModal();
    });
  }

  updateTelemetry(node) {
    const el = document.getElementById("graph-node-telemetry");
    if (!el) return;
    if (node) {
      el.innerHTML = `<span class="font-bold text-text-primary font-mono">${node.label}</span> <span class="text-text-muted">(${node.group.toUpperCase()})</span>: <span class="text-text-secondary">${node.desc}</span>`;
      el.className = "px-3.5 py-1.5 rounded-xl bg-cyan/10 border border-cyan/40 text-xs font-mono text-cyan transition-all";
    } else {
      el.textContent = "Hover over any node to inspect concept topology";
      el.className = "px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-text-muted transition-all";
    }
  }

  animateGraph() {
    if (!this.graphCtx) return;
    this.graphCtx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Links
    for (const link of this.links) {
      const isConnected = this.hoveredNode && (link.source.id === this.hoveredNode.id || link.target.id === this.hoveredNode.id);
      
      this.graphCtx.strokeStyle = isConnected ? "#00f0ff" : "rgba(255, 255, 255, 0.08)";
      this.graphCtx.lineWidth = isConnected ? 2.0 : 0.8;
      this.graphCtx.beginPath();
      this.graphCtx.moveTo(link.source.x, link.source.y);
      this.graphCtx.lineTo(link.target.x, link.target.y);
      this.graphCtx.stroke();
    }

    // 2. Draw Nodes
    for (const node of this.nodes) {
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isConnected = this.hoveredNode && this.links.some(l => 
        (l.source.id === this.hoveredNode.id && l.target.id === node.id) ||
        (l.target.id === this.hoveredNode.id && l.source.id === node.id)
      );

      // Node Glow
      if (isHovered || isConnected) {
        this.graphCtx.shadowBlur = 12;
        this.graphCtx.shadowColor = node.color;
      }

      // Circle
      this.graphCtx.fillStyle = node.color;
      this.graphCtx.beginPath();
      this.graphCtx.arc(node.x, node.y, isHovered ? node.radius + 3 : node.radius, 0, Math.PI * 2);
      this.graphCtx.fill();
      this.graphCtx.shadowBlur = 0;

      // Label Text
      this.graphCtx.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
      this.graphCtx.font = isHovered ? "bold 11px JetBrains Mono, monospace" : "10px JetBrains Mono, monospace";
      this.graphCtx.textAlign = "center";
      this.graphCtx.fillText(node.label, node.x, node.y + node.radius + 13);

      // Slight floating motion
      node.x += Math.sin(Date.now() * 0.001 + node.radius) * 0.15;
      node.y += Math.cos(Date.now() * 0.001 + node.radius) * 0.15;
    }

    requestAnimationFrame(() => this.animateGraph());
  }

  openArticleModal(article) {
    const backdrop = document.getElementById("article-modal-backdrop");
    const modalContent = document.getElementById("article-modal-content");
    if (!backdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="flex items-start justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono bg-surface-elevated border border-border text-cyan">
              ${article.category}
            </span>
            <span class="text-xs font-mono text-text-muted">${article.readTime} • ${article.date}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            ${article.title}
          </h2>
        </div>

        <button id="btn-close-article" class="p-2 rounded-xl bg-surface-elevated hover:bg-border text-text-muted hover:text-text-primary transition-all cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Article Formatted Markdown Content -->
      <div class="prose prose-invert max-w-none py-6 text-sm text-text-secondary leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div class="p-4 rounded-xl bg-cyan/10 border border-cyan/30 text-text-primary font-medium text-xs sm:text-sm">
          ${article.summary}
        </div>

        <div class="article-body-markdown space-y-4">
          ${article.content.replace(/### (.*?)\n/g, '<h3 class="text-base font-bold text-text-primary mt-6 mb-2 font-mono tracking-tight">$1</h3>')
            .replace(/```python([\s\S]*?)```/g, '<pre class="p-4 rounded-xl bg-[#050810] border border-border text-xs font-mono text-emerald-400 overflow-x-auto my-3"><code>$1</code></pre>')
            .replace(/```typescript([\s\S]*?)```/g, '<pre class="p-4 rounded-xl bg-[#050810] border border-border text-xs font-mono text-cyan overflow-x-auto my-3"><code>$1</code></pre>')
            .replace(/```javascript([\s\S]*?)```/g, '<pre class="p-4 rounded-xl bg-[#050810] border border-border text-xs font-mono text-amber-400 overflow-x-auto my-3"><code>$1</code></pre>')
          }
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-6 border-t border-border">
        <div class="flex flex-wrap gap-1.5">
          ${article.tags.map(t => `<span class="px-2 py-0.5 rounded bg-surface-elevated text-xs font-mono text-text-muted">#${t}</span>`).join("")}
        </div>

        <button id="btn-close-article-footer" class="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-border text-text-secondary text-xs font-mono transition-all">
          Close Note
        </button>
      </div>
    `;

    document.getElementById("btn-close-article")?.addEventListener("click", () => this.closeArticleModal());
    document.getElementById("btn-close-article-footer")?.addEventListener("click", () => this.closeArticleModal());

    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  closeArticleModal() {
    const backdrop = document.getElementById("article-modal-backdrop");
    if (!backdrop) return;
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}
