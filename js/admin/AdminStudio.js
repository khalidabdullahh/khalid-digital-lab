/**
 * Git-Based Admin Studio Controller
 * Author: Khalid Abdullah
 * Commits and publishes posts directly to GitHub Repository via GitHub Contents REST API
 */

export class AdminStudio {
  constructor() {
    this.owner = "khalidabdullahh";
    this.repo = "khalid-digital-lab";
    this.token = localStorage.getItem("khalid_github_admin_token") || "";
    this.user = null;
    this.posts = [];
    this.editingSlug = null;
    this.editingSha = null;

    this.init();
  }

  async init() {
    this.bindEvents();

    // 1. Check if token returned from 1-Click OAuth Callback in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      this.token = urlToken;
      localStorage.setItem("khalid_github_admin_token", urlToken);
      // Clean query string from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (this.token) {
      await this.verifyAuth();
    } else {
      this.showAuthScreen();
    }
  }

  bindEvents() {
    // 1-Click GitHub OAuth Login Button
    document.getElementById("btn-github-oauth")?.addEventListener("click", () => {
      window.location.href = "/api/auth/login";
    });

    // Manual PAT Login Form
    document.getElementById("btn-auth-login")?.addEventListener("click", async () => {
      const input = document.getElementById("pat-input");
      const token = input?.value.trim();
      if (!token) return alert("Please enter your GitHub Personal Access Token.");
      this.token = token;
      await this.verifyAuth();
    });

    // Logout button
    document.getElementById("btn-auth-logout")?.addEventListener("click", () => {
      this.logout();
    });

    // New Post button
    document.getElementById("btn-new-post")?.addEventListener("click", () => {
      this.resetEditor();
    });

    // Publish Post Form
    document.getElementById("post-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.publishPost();
    });

    // Live Markdown Preview
    const contentTextarea = document.getElementById("post-content");
    contentTextarea?.addEventListener("input", () => {
      this.updatePreview();
    });

    const titleInput = document.getElementById("post-title");
    titleInput?.addEventListener("input", () => {
      const slugInput = document.getElementById("post-slug");
      if (!this.editingSlug && slugInput) {
        slugInput.value = this.generateSlug(titleInput.value);
      }
      this.updatePreview();
    });

    const categorySelect = document.getElementById("post-category");
    categorySelect?.addEventListener("change", () => {
      this.updatePreview();
    });
  }

  async verifyAuth() {
    const authStatus = document.getElementById("auth-status-text");
    if (authStatus) authStatus.textContent = "Verifying token with GitHub API...";

    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (!res.ok) {
        throw new Error(`Invalid token (HTTP ${res.status})`);
      }

      const userData = await res.json();
      if (userData.login.toLowerCase() !== this.owner.toLowerCase()) {
        throw new Error(`Access Denied: Logged in as @${userData.login}, but this lab belongs to @${this.owner}`);
      }

      this.user = userData;
      localStorage.setItem("khalid_github_admin_token", this.token);
      this.showDashboard();
      await this.loadPosts();
    } catch (err) {
      console.error("Auth error:", err);
      alert(`Authentication Failed: ${err.message}`);
      this.showAuthScreen();
    }
  }

  showAuthScreen() {
    document.getElementById("auth-view")?.classList.remove("hidden");
    document.getElementById("dashboard-view")?.classList.add("hidden");
    const authStatus = document.getElementById("auth-status-text");
    if (authStatus) authStatus.textContent = "";
  }

  showDashboard() {
    document.getElementById("auth-view")?.classList.add("hidden");
    document.getElementById("dashboard-view")?.classList.remove("hidden");
    
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");
    if (userAvatar) userAvatar.src = this.user.avatar_url;
    if (userName) userName.textContent = `@${this.user.login}`;
  }

  logout() {
    this.token = "";
    this.user = null;
    localStorage.removeItem("khalid_github_admin_token");
    this.showAuthScreen();
  }

  generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async loadPosts() {
    const listEl = document.getElementById("admin-posts-list");
    if (listEl) listEl.innerHTML = `<div class="p-4 text-xs font-mono text-text-muted">Loading posts from GitHub...</div>`;

    try {
      // 1. Fetch posts-index.json from GitHub
      const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/posts-index.json`, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (res.ok) {
        const fileData = await res.json();
        const contentStr = decodeURIComponent(escape(atob(fileData.content)));
        this.posts = JSON.parse(contentStr);
        this.indexSha = fileData.sha;
      } else {
        this.posts = [];
      }

      this.renderPostsList();
    } catch (e) {
      console.warn("Could not load posts from GitHub API", e);
      if (listEl) listEl.innerHTML = `<div class="p-4 text-xs font-mono text-rose-400">Failed to load posts from GitHub.</div>`;
    }
  }

  renderPostsList() {
    const listEl = document.getElementById("admin-posts-list");
    if (!listEl) return;

    if (this.posts.length === 0) {
      listEl.innerHTML = `<div class="p-6 text-center text-xs font-mono text-text-muted">No posts found. Write your first post using the editor on the right!</div>`;
      return;
    }

    listEl.innerHTML = this.posts.map(post => `
      <div class="p-3.5 rounded-xl bg-surface border border-border hover:border-cyan/40 transition-all flex items-center justify-between gap-3">
        <div class="truncate">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan/15 text-cyan border border-cyan/30">${post.category || "Post"}</span>
            <span class="text-[10px] font-mono text-text-muted">${post.date}</span>
          </div>
          <div class="text-xs font-bold text-text-primary truncate font-mono">${post.title}</div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button class="btn-edit-post px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-border border border-border text-[11px] font-mono text-cyan cursor-pointer" data-slug="${post.slug}">Edit</button>
          <button class="btn-delete-post px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-mono text-rose-400 cursor-pointer" data-slug="${post.slug}">✕</button>
        </div>
      </div>
    `).join("");

    // Bind Edit Buttons
    listEl.querySelectorAll(".btn-edit-post").forEach(btn => {
      btn.addEventListener("click", () => this.editPost(btn.dataset.slug));
    });

    // Bind Delete Buttons
    listEl.querySelectorAll(".btn-delete-post").forEach(btn => {
      btn.addEventListener("click", () => this.deletePost(btn.dataset.slug));
    });
  }

  async editPost(slug) {
    const postMeta = this.posts.find(p => p.slug === slug);
    if (!postMeta) return;

    // Fetch full post file from GitHub
    try {
      const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/${slug}.json`, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (!res.ok) throw new Error("Could not load post file");
      const fileData = await res.json();
      const contentStr = decodeURIComponent(escape(atob(fileData.content)));
      const post = JSON.parse(contentStr);

      this.editingSlug = slug;
      this.editingSha = fileData.sha;

      document.getElementById("post-title").value = post.title || "";
      document.getElementById("post-slug").value = post.slug || slug;
      document.getElementById("post-category").value = post.category || "Engineering";
      document.getElementById("post-tagline").value = post.tagline || "";
      document.getElementById("post-tags").value = Array.isArray(post.tags) ? post.tags.join(", ") : "";
      document.getElementById("post-content").value = post.content || "";

      document.getElementById("editor-mode-label").textContent = `Editing: ${post.title}`;
      document.getElementById("btn-submit-post").textContent = "Update & Commit to GitHub 🚀";

      this.updatePreview();
    } catch (e) {
      alert(`Error loading post: ${e.message}`);
    }
  }

  resetEditor() {
    this.editingSlug = null;
    this.editingSha = null;

    document.getElementById("post-form")?.reset();
    document.getElementById("editor-mode-label").textContent = "New Post";
    document.getElementById("btn-submit-post").textContent = "Publish & Commit to GitHub 🚀";
    this.updatePreview();
  }

  async publishPost() {
    const title = document.getElementById("post-title").value.trim();
    const slug = document.getElementById("post-slug").value.trim() || this.generateSlug(title);
    const category = document.getElementById("post-category").value;
    const tagline = document.getElementById("post-tagline").value.trim();
    const tagsStr = document.getElementById("post-tags").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
      return alert("Title and Content are required!");
    }

    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const today = new Date().toISOString().split("T")[0];

    const postPayload = {
      id: `post-${Date.now()}`,
      slug,
      title,
      tagline,
      category,
      categoryColor: "cyan",
      date: today,
      readTime,
      author: "Khalid Abdullah",
      tags,
      published: true,
      content
    };

    const submitBtn = document.getElementById("btn-submit-post");
    submitBtn.disabled = true;
    submitBtn.textContent = "Committing to GitHub...";

    try {
      // 1. Commit post JSON file to `posts/{slug}.json`
      const jsonStr = JSON.stringify(postPayload, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(jsonStr)));

      const filePutBody = {
        message: this.editingSha ? `docs(posts): update post '${title}'` : `feat(posts): publish new post '${title}'`,
        content: encodedContent
      };
      if (this.editingSha) {
        filePutBody.sha = this.editingSha;
      }

      const fileRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/${slug}.json`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(filePutBody)
      });

      if (!fileRes.ok) {
        const errJson = await fileRes.json();
        throw new Error(errJson.message || "Failed to commit post file");
      }

      // 2. Update `posts/posts-index.json`
      const metaIndexItem = {
        id: postPayload.id,
        slug: postPayload.slug,
        title: postPayload.title,
        tagline: postPayload.tagline,
        category: postPayload.category,
        categoryColor: "cyan",
        date: postPayload.date,
        readTime: postPayload.readTime,
        tags: postPayload.tags,
        file: `posts/${slug}.json`,
        published: true
      };

      // Filter out old version if editing, and prepend new post
      const updatedPostsList = [
        metaIndexItem,
        ...this.posts.filter(p => p.slug !== slug)
      ];

      const indexJsonStr = JSON.stringify(updatedPostsList, null, 2);
      const encodedIndex = btoa(unescape(encodeURIComponent(indexJsonStr)));

      const indexPutBody = {
        message: `docs(posts): update posts index for '${title}'`,
        content: encodedIndex
      };
      if (this.indexSha) {
        indexPutBody.sha = this.indexSha;
      }

      const indexRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/posts-index.json`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(indexPutBody)
      });

      if (!indexRes.ok) {
        console.warn("Index update warning:", await indexRes.json());
      }

      alert(`🎉 Successfully published '${title}' directly to GitHub!`);
      this.resetEditor();
      await this.loadPosts();
    } catch (e) {
      console.error(e);
      alert(`Publishing failed: ${e.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish & Commit to GitHub 🚀";
    }
  }

  async deletePost(slug) {
    if (!confirm(`Are you sure you want to delete '${slug}' from GitHub? This action cannot be undone.`)) {
      return;
    }

    try {
      // 1. Get SHA of file to delete
      const fileRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/${slug}.json`, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (fileRes.ok) {
        const fileData = await fileRes.json();
        await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/${slug}.json`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `chore(posts): delete post '${slug}'`,
            sha: fileData.sha
          })
        });
      }

      // 2. Remove from index
      const updatedList = this.posts.filter(p => p.slug !== slug);
      const indexJsonStr = JSON.stringify(updatedList, null, 2);
      const encodedIndex = btoa(unescape(encodeURIComponent(indexJsonStr)));

      await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/posts/posts-index.json`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `chore(posts): remove '${slug}' from index`,
          content: encodedIndex,
          sha: this.indexSha
        })
      });

      alert(`Deleted post '${slug}'.`);
      await this.loadPosts();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  updatePreview() {
    const title = document.getElementById("post-title")?.value || "Untitled Post";
    const category = document.getElementById("post-category")?.value || "Engineering";
    const tagline = document.getElementById("post-tagline")?.value || "";
    const content = document.getElementById("post-content")?.value || "*No content written yet...*";

    const previewEl = document.getElementById("live-markdown-preview");
    if (!previewEl) return;

    previewEl.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">${category}</span>
          <span class="text-xs font-mono text-text-muted">${new Date().toISOString().split("T")[0]}</span>
        </div>
        <h1 class="text-2xl font-extrabold text-text-primary tracking-tight">${title}</h1>
        ${tagline ? `<p class="text-xs text-text-secondary italic pb-3 border-b border-border/80">${tagline}</p>` : ""}
        <div class="markdown-body text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3">
          ${this.renderMarkdown(content)}
        </div>
      </div>
    `;
  }

  renderMarkdown(md) {
    if (!md) return "";
    let html = md;

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-text-primary mt-4 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-text-primary mt-5 mb-2 pb-1 border-b border-border">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-text-primary mt-6 mb-2">$1</h1>');
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="p-3 rounded-lg bg-surface border-l-2 border-cyan text-text-primary italic my-2">$1</blockquote>');
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (m, lang, code) => {
      return `<pre class="p-3 rounded-lg bg-[#080c14] border border-border text-cyan text-xs font-mono overflow-x-auto my-2"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-surface-elevated text-cyan font-mono text-xs">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/^---$/gim, '<hr class="my-4 border-border" />');

    const paragraphs = html.split("\n\n");
    return paragraphs.map(p => {
      if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<blockquote") || p.startsWith("<hr")) return p;
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.adminStudio = new AdminStudio();
});
