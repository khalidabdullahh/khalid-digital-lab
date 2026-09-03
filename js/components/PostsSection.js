/**
 * Public Live Posts Section Component
 * Author: Khalid Abdullah
 */

import { postService } from "../services/PostService.js";

export class PostsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.posts = [];
    this.activePost = null;

    this.init();
  }

  async init() {
    if (!this.container) return;
    await postService.init();
    this.posts = postService.posts;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>📝</span>
              <span>ENGINEERING POSTS & UPDATES // LIVE CMS</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Posts & Architectural Case Briefs
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              Published directly via the Git-Based Admin Studio. Articles, engineering insights, and release updates stored in GitHub.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="admin.html" class="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-border border border-cyan/40 text-cyan hover:text-white text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-2">
              <span>⚙️ Admin Studio</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <!-- Posts Grid -->
        ${this.posts.length === 0 ? `
          <div class="p-12 text-center rounded-3xl bg-surface border border-border">
            <p class="text-sm font-mono text-text-muted">No posts published yet. Launch the Admin Studio to create your first post!</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${this.posts.map(post => `
              <div class="group relative p-6 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer post-card" data-slug="${post.slug}">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan/15 border border-cyan/30 text-cyan">
                      ${post.category || "Engineering"}
                    </span>
                    <span class="text-[11px] font-mono text-text-muted">
                      ${post.readTime || "3 min read"}
                    </span>
                  </div>

                  <h3 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight line-clamp-2">
                    ${post.title}
                  </h3>

                  <p class="text-xs text-text-secondary mt-2.5 line-clamp-3 leading-relaxed">
                    ${post.tagline || ""}
                  </p>

                  <!-- Tags -->
                  ${Array.isArray(post.tags) && post.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/60">
                      ${post.tags.slice(0, 3).map(tag => `
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-muted border border-border">
                          #${tag}
                        </span>
                      `).join("")}
                    </div>
                  ` : ""}
                </div>

                <!-- Footer -->
                <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono">
                  <span class="text-text-muted text-[11px]">${post.date}</span>
                  <span class="text-cyan font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <!-- Post Reader Modal Container -->
      <div id="post-reader-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 sm:p-6">
        <div class="relative w-full max-w-3xl max-h-[88vh] rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated">
            <div class="flex items-center gap-2">
              <span id="modal-post-category" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan/15 border border-cyan/30 text-cyan"></span>
              <span id="modal-post-date" class="text-xs font-mono text-text-muted"></span>
            </div>
            <button id="btn-close-post-modal" class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer text-base">✕</button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div id="modal-post-body" class="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-text-primary leading-relaxed">
            <!-- Dynamically injected -->
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3.5 border-t border-border bg-surface-elevated/60 flex items-center justify-between text-xs font-mono text-text-muted">
            <span id="modal-post-author">By Khalid Abdullah</span>
            <button id="btn-copy-post-link" class="text-cyan hover:underline cursor-pointer">Copy Link 🔗</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    window.addEventListener("posts-updated", (e) => {
      this.posts = e.detail?.posts || [];
      this.render();
      this.bindEvents();
    });

    // Post Card Click
    this.container.querySelectorAll(".post-card").forEach(card => {
      card.addEventListener("click", async () => {
        const slug = card.dataset.slug;
        await this.openPostModal(slug);
      });
    });

    // Close Modal Button
    document.getElementById("btn-close-post-modal")?.addEventListener("click", () => {
      this.closeModal();
    });

    // Close on Backdrop Click
    const modal = document.getElementById("post-reader-modal");
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Close on Escape Key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeModal();
    });

    // Copy Link Button
    document.getElementById("btn-copy-post-link")?.addEventListener("click", () => {
      if (this.activePost) {
        navigator.clipboard.writeText(`${window.location.origin}/#post-${this.activePost.slug}`);
        const btn = document.getElementById("btn-copy-post-link");
        if (btn) btn.textContent = "Copied! ✓";
        setTimeout(() => {
          if (btn) btn.textContent = "Copy Link 🔗";
        }, 2000);
      }
    });
  }

  async openPostModal(slug) {
    const post = await postService.getPost(slug);
    if (!post) return;
    this.activePost = post;

    const modal = document.getElementById("post-reader-modal");
    const catEl = document.getElementById("modal-post-category");
    const dateEl = document.getElementById("modal-post-date");
    const authorEl = document.getElementById("modal-post-author");
    const bodyEl = document.getElementById("modal-post-body");

    if (catEl) catEl.textContent = post.category || "Engineering";
    if (dateEl) dateEl.textContent = `${post.date} • ${post.readTime || "3 min read"}`;
    if (authorEl) authorEl.textContent = `By ${post.author || "Khalid Abdullah"}`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="space-y-4">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
            ${post.title}
          </h1>
          ${post.tagline ? `<p class="text-sm sm:text-base text-text-secondary leading-relaxed font-medium pb-4 border-b border-border/80">${post.tagline}</p>` : ""}
          <div class="markdown-article pt-2 space-y-4 text-sm sm:text-base leading-relaxed text-text-secondary">
            ${this.renderMarkdown(post.content || post.tagline || "")}
          </div>
        </div>
      `;
    }

    modal?.classList.remove("hidden");
    modal?.classList.add("flex");
  }

  closeModal() {
    const modal = document.getElementById("post-reader-modal");
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
    this.activePost = null;
  }

  renderMarkdown(md) {
    if (!md) return "";
    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-text-primary mt-6 mb-2 tracking-tight">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-text-primary mt-8 mb-3 tracking-tight border-b border-border pb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-text-primary mt-8 mb-4 tracking-tight">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="p-4 rounded-xl bg-surface-elevated border-l-4 border-cyan text-text-primary italic font-medium my-4">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
      const safeCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
      return `<pre class="p-4 rounded-xl bg-[#080c14] border border-border text-cyan text-xs font-mono overflow-x-auto my-4 shadow-inner"><code>${safeCode}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-cyan text-xs font-mono">$1</code>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-text-secondary my-1">$1</li>');
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-text-secondary my-1">$1</li>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');

    // Paragraphs
    const lines = html.split("\n\n");
    return lines.map(line => {
      if (line.startsWith("<h") || line.startsWith("<pre") || line.startsWith("<blockquote") || line.startsWith("<li") || line.startsWith("<hr")) {
        return line;
      }
      return `<p class="leading-relaxed text-text-secondary">${line.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }
}
