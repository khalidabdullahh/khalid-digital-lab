/**
 * Public Post Service
 * Author: Khalid Abdullah
 * Fetches and caches published posts from GitHub & local storage
 */

const POSTS_CACHE_KEY = "khalid_posts_index_cache_v1";
const POSTS_CACHE_TIME_KEY = "khalid_posts_index_time_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export class PostService {
  constructor() {
    this.posts = [];
    this.loadedPosts = new Map();
    this.isLoading = false;
    this.initDefaultPosts();
  }

  initDefaultPosts() {
    this.posts = [
      {
        id: "post-welcome-digital-lab",
        slug: "welcome-to-digital-lab",
        title: "Welcome to My Digital Lab & Engineering Space",
        tagline: "Why I built a living personal laboratory instead of a traditional portfolio.",
        category: "Announcement",
        categoryColor: "cyan",
        date: "2026-09-03",
        readTime: "3 min read",
        tags: ["Digital Lab", "Engineering", "Architecture", "Open Source"],
        file: "posts/welcome-to-digital-lab.json",
        published: true
      }
    ];
  }

  async init() {
    this.loadFromCache();
    await this.fetchPostsIndex(false);
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem(POSTS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.posts = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read posts cache", e);
    }
  }

  saveToCache() {
    try {
      localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(this.posts));
      localStorage.setItem(POSTS_CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn("Could not save posts cache", e);
    }
  }

  async fetchPostsIndex(force = true) {
    if (this.isLoading) return this.posts;
    this.isLoading = true;

    try {
      // Try local path first (works locally and on Vercel)
      const res = await fetch(`posts/posts-index.json?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.posts = data;
          this.saveToCache();
        }
      }
    } catch (err) {
      console.warn("PostService: Failed to fetch index locally, falling back to cache", err);
    } finally {
      this.isLoading = false;
      window.dispatchEvent(new CustomEvent("posts-updated", { detail: { posts: this.posts } }));
    }

    return this.posts;
  }

  async getPost(slug) {
    if (this.loadedPosts.has(slug)) {
      return this.loadedPosts.get(slug);
    }

    try {
      const res = await fetch(`posts/${slug}.json?_t=${Date.now()}`);
      if (res.ok) {
        const postData = await res.json();
        this.loadedPosts.set(slug, postData);
        return postData;
      }
    } catch (e) {
      console.warn(`Could not load post '${slug}'`, e);
    }

    // Fallback: match from local index
    const meta = this.posts.find(p => p.slug === slug);
    return meta || null;
  }
}

export const postService = new PostService();
