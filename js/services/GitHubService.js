/**
 * GitHub Live Sync Service
 * Author: Khalid Abdullah
 * Automatically synchronizes repositories, commits, and activity from GitHub
 */

import { CONFIG } from "../config.js";

const CACHE_KEY = "khalid_github_repos_cache_v4";
const CACHE_TIME_KEY = "khalid_github_cache_time_v4";
const EVENTS_CACHE_KEY = "khalid_github_events_cache_v4";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes auto-sync cache

export class GitHubService {
  constructor() {
    this.username = "khalidabdullahh";
    this.repos = [];
    this.events = [];
    this.latestPush = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.initDefaultRepos();
  }

  initDefaultRepos() {
    // Initial fallback data so the site immediately displays rich repo metadata
    this.defaultRepos = [
      {
        name: "khalid-digital-lab",
        fullName: "khalidabdullahh/khalid-digital-lab",
        htmlUrl: "https://github.com/khalidabdullahh/khalid-digital-lab",
        description: "Personal Digital Lab & Innovation Hub: living portfolio, research lab, interactive simulators & dynamic knowledge garden.",
        language: "JavaScript",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date().toISOString(),
        pushedAt: new Date().toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "eSports",
        fullName: "khalidabdullahh/eSports",
        htmlUrl: "https://github.com/khalidabdullahh/eSports",
        description: "ARENEX — Full-Stack Esports Tournament Platform with Next.js, Supabase, PostgreSQL RLS & anti-replay payments.",
        language: "TypeScript",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "CV-Builder",
        fullName: "khalidabdullahh/CV-Builder",
        htmlUrl: "https://github.com/khalidabdullahh/CV-Builder",
        description: "ATS-Optimized Resume Creator featuring 10 design templates, Google Gemini AI writing assistant, and 1-click vector PDF generation.",
        language: "TypeScript",
        stars: 3,
        forks: 1,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "Trading-OS",
        fullName: "khalidabdullahh/Trading-OS",
        htmlUrl: "https://github.com/khalidabdullahh/Trading-OS",
        description: "Quantitative finance strategy and volatility intelligence repository with technical indicators, Pine Script and state modeling.",
        language: "JavaScript",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "Oops",
        fullName: "khalidabdullahh/Oops",
        htmlUrl: "https://github.com/khalidabdullahh/Oops",
        description: "Deceptive 2D puzzle platformer with 150 stages, real-time gravity inversion, zero-lag state-machine physics and Web Audio chiptunes.",
        language: "Python",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "DevilsDoor",
        fullName: "khalidabdullahh/DevilsDoor",
        htmlUrl: "https://github.com/khalidabdullahh/DevilsDoor",
        description: "Atmospheric horror-action game mechanics with dynamic psychological sanity state machines and post-processing shaders.",
        language: "C#",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      },
      {
        name: "AuRex",
        fullName: "khalidabdullahh/AuRex",
        htmlUrl: "https://github.com/khalidabdullahh/AuRex",
        description: "Real-time action combat engine prototype with frame-locked input buffering and spatial hitbox resolution.",
        language: "C#",
        stars: 1,
        forks: 0,
        openIssues: 0,
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        pushedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        isPrivate: false,
        defaultBranch: "main"
      }
    ];

    this.repos = [...this.defaultRepos];
  }

  /**
   * Initialize and load cached or fresh data
   */
  async init() {
    this.loadFromCache();
    // Auto-sync in background if cache expired or on initial launch
    if (this.isCacheExpired()) {
      this.sync(false);
    }
  }

  isCacheExpired() {
    const savedTime = localStorage.getItem(CACHE_TIME_KEY);
    if (!savedTime) return true;
    return (Date.now() - parseInt(savedTime, 10)) > CACHE_TTL_MS;
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const savedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedEvents = localStorage.getItem(EVENTS_CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= this.defaultRepos.length) {
          this.repos = parsed;
        } else {
          this.repos = [...this.defaultRepos];
        }
      } else {
        this.repos = [...this.defaultRepos];
      }

      if (cachedEvents) {
        this.events = JSON.parse(cachedEvents);
        this.extractLatestPush(this.events);
      }

      if (savedTime) {
        this.lastSyncTime = new Date(parseInt(savedTime, 10));
      }
    } catch (e) {
      console.warn("Could not read GitHub cache", e);
      this.repos = [...this.defaultRepos];
    }
  }

  saveToCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.repos));
      localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(this.events));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      this.lastSyncTime = new Date();
    } catch (e) {
      console.warn("Could not save GitHub cache", e);
    }
  }

  /**
   * Fetch repositories & public events from GitHub REST API
   */
  async sync(force = true) {
    if (this.isSyncing) return this.repos;
    this.isSyncing = true;
    window.dispatchEvent(new CustomEvent("github-sync-start"));

    try {
      const customToken = localStorage.getItem("github_pat_token");
      const headers = {
        "Accept": "application/vnd.github.v3+json"
      };
      if (customToken) {
        headers["Authorization"] = `Bearer ${customToken}`;
      }

      // 1. Fetch Repositories
      const [reposRes, eventsRes] = await Promise.allSettled([
        fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=30`, { headers }),
        fetch(`https://api.github.com/users/${this.username}/events/public?per_page=15`, { headers })
      ]);

      if (reposRes.status === "fulfilled" && reposRes.value.ok) {
        const data = await reposRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          this.repos = data.map(repo => ({
            name: repo.name,
            fullName: repo.full_name,
            htmlUrl: repo.html_url,
            description: repo.description || "No description provided.",
            language: repo.language || "Code",
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            openIssues: repo.open_issues_count,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            createdAt: repo.created_at,
            isPrivate: repo.private,
            isArchived: repo.archived,
            defaultBranch: repo.default_branch
          }));
        }
      }

      // 2. Fetch Public Events (Push, Create, Release)
      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const eventsData = await eventsRes.value.json();
        if (Array.isArray(eventsData)) {
          this.events = eventsData;
          this.extractLatestPush(eventsData);
        }
      }

      this.saveToCache();

      window.dispatchEvent(new CustomEvent("github-sync-complete", { 
        detail: { 
          repos: this.repos, 
          events: this.events,
          latestPush: this.latestPush,
          totalStars: this.getTotalStars(),
          repoCount: this.repos.length,
          lastSyncTime: this.lastSyncTime 
        } 
      }));
    } catch (error) {
      console.warn("GitHub live sync notice (using cached/fallback repos):", error.message);
      window.dispatchEvent(new CustomEvent("github-sync-error", { detail: { error: error.message } }));
    } finally {
      this.isSyncing = false;
    }

    return this.repos;
  }

  extractLatestPush(events) {
    if (!Array.isArray(events) || events.length === 0) return;
    const pushEvent = events.find(e => e.type === "PushEvent" || e.type === "CreateEvent");
    if (pushEvent) {
      const repoName = pushEvent.repo?.name || "khalidabdullahh/khalid-digital-lab";
      const shortName = repoName.split("/")[1] || repoName;
      const ref = pushEvent.payload?.ref ? pushEvent.payload.ref.replace("refs/heads/", "") : "main";
      const commitCount = pushEvent.payload?.commits?.length || 1;
      const headCommit = pushEvent.payload?.commits?.[0]?.message || "Updated repository";

      this.latestPush = {
        repoName,
        shortName,
        branch: ref,
        commitMessage: headCommit.split("\n")[0],
        commitCount,
        timeAgo: this.getTimeAgo(pushEvent.created_at),
        createdAt: pushEvent.created_at,
        url: `https://github.com/${repoName}`
      };
    }
  }

  /**
   * Total stars across all public repositories
   */
  getTotalStars() {
    return this.repos.reduce((sum, r) => sum + (r.stars || 0), 0);
  }

  /**
   * Total public repository count
   */
  getRepoCount() {
    return this.repos.length;
  }

  /**
   * Format "Updated X time ago"
   */
  getTimeAgo(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  /**
   * Find matching repository by URL or project name
   */
  findRepoForUrl(url) {
    if (!url || !this.repos.length) return null;
    const cleanUrl = url.toLowerCase().replace(/\/$/, "");
    return this.repos.find(r => r.htmlUrl.toLowerCase() === cleanUrl || cleanUrl.endsWith(`/${r.name.toLowerCase()}`));
  }

  /**
   * Find matching repository by name
   */
  findRepoByName(name) {
    if (!name || !this.repos.length) return null;
    const search = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return this.repos.find(r => r.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(search));
  }

  /**
   * Return language color token
   */
  getLanguageColor(lang) {
    const map = {
      "JavaScript": "#f1e05a",
      "TypeScript": "#3178c6",
      "Python": "#3572A5",
      "HTML": "#e34c26",
      "CSS": "#563d7c",
      "C++": "#f34b7d",
      "C#": "#178600",
      "C": "#555555",
      "Rust": "#dea584",
      "Go": "#00ADD8"
    };
    return map[lang] || "#00f0ff";
  }
}

export const githubService = new GitHubService();
