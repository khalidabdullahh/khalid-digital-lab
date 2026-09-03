/**
 * Interactive Retro-Futuristic CLI Developer Terminal
 * Author: Khalid Abdullah
 */

import { CONFIG } from "../config.js";
import { TOOLS } from "../data/tools.js";
import { PROJECTS } from "../data/projects.js";
import { postService } from "../services/PostService.js";
import { githubService } from "../services/GitHubService.js";

export class TerminalModal {
  constructor() {
    this.isOpen = false;
    this.history = [];
    this.historyIndex = -1;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const existing = document.getElementById("terminal-modal-backdrop");
    if (existing) existing.remove();

    const terminalHtml = `
      <div id="terminal-modal-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 sm:p-6">
        <div class="relative w-full max-w-3xl h-[520px] rounded-2xl bg-[#04060a] border border-cyan/40 shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
          <!-- Terminal Header Bar -->
          <div class="flex items-center justify-between px-4 py-2.5 bg-[#090d15] border-b border-border text-text-muted select-none">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span class="text-[11px] text-text-secondary font-bold pl-2">khalid@digital-lab:~ (zsh)</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-[10px] text-cyan">STATUS: READY</span>
              <button id="btn-close-terminal" class="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm">✕</button>
            </div>
          </div>

          <!-- Terminal Output Log -->
          <div id="terminal-output" class="flex-1 p-4 overflow-y-auto space-y-2 text-text-secondary leading-relaxed">
            <div class="text-cyan font-bold">DIGITAL LAB CLI v${CONFIG.system.version} [Build ${CONFIG.system.buildDate}]</div>
            <div class="text-text-muted">Type <span class="text-emerald-400 font-bold">'help'</span> to see all available commands, or <span class="text-amber-400 font-bold">'posts'</span> to read engineering briefs.</div>
            <div class="h-1"></div>
          </div>

          <!-- Terminal Prompt Input Line -->
          <div class="flex items-center px-4 py-3 bg-[#070b12] border-t border-border/80 gap-2">
            <span class="text-emerald-400 font-bold">khalid@lab:~$</span>
            <input type="text" id="terminal-input" class="flex-1 bg-transparent text-text-primary font-mono focus:outline-none placeholder:text-text-muted/40" placeholder="enter command..." autocomplete="off" spellcheck="false" />
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", terminalHtml);
  }

  bindEvents() {
    window.addEventListener("open-terminal", () => this.open());

    window.addEventListener("keydown", (e) => {
      if (e.key === "`" || e.key === "~") {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          this.toggle();
        }
      } else if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    document.getElementById("btn-close-terminal")?.addEventListener("click", () => this.close());
    
    const backdrop = document.getElementById("terminal-modal-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });

    const input = document.getElementById("terminal-input");
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.execute(cmd);
          input.value = "";
        }
      } else if (e.key === "ArrowUp") {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.historyIndex] || "";
        }
      } else if (e.key === "ArrowDown") {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          input.value = this.history[this.historyIndex] || "";
        } else {
          this.historyIndex = this.history.length;
          input.value = "";
        }
      }
    });
  }

  open() {
    this.isOpen = true;
    const backdrop = document.getElementById("terminal-modal-backdrop");
    const input = document.getElementById("terminal-input");
    if (backdrop && input) {
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      setTimeout(() => input.focus(), 50);
    }
  }

  close() {
    this.isOpen = false;
    const backdrop = document.getElementById("terminal-modal-backdrop");
    if (backdrop) {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  log(html, isCommand = false) {
    const output = document.getElementById("terminal-output");
    if (!output) return;

    const div = document.createElement("div");
    if (isCommand) {
      div.className = "flex items-center gap-2 text-text-primary pt-1";
      div.innerHTML = `<span class="text-emerald-400 font-bold">khalid@lab:~$</span> <span class="text-cyan font-bold">${html}</span>`;
    } else {
      div.className = "text-text-secondary pl-4 leading-relaxed";
      div.innerHTML = html;
    }

    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  execute(cmdText) {
    this.log(cmdText, true);
    const parts = cmdText.toLowerCase().split(" ");
    const cmd = parts[0];
    const arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "help":
        this.log(`
          <div class="space-y-1 text-xs">
            <div><span class="text-emerald-400 font-bold">help</span> - Display list of available system commands</div>
            <div><span class="text-emerald-400 font-bold">whoami / bio</span> - Print Khalid Abdullah's developer background</div>
            <div><span class="text-emerald-400 font-bold">projects</span> - List engineered software case studies</div>
            <div><span class="text-emerald-400 font-bold">posts / blog</span> - List published engineering posts & articles</div>
            <div><span class="text-emerald-400 font-bold">admin / cms</span> - Launch the Git-Based Admin Studio</div>
            <div><span class="text-emerald-400 font-bold">tools</span> - List interactive tools and production web applications</div>
            <div><span class="text-emerald-400 font-bold">run [tool]</span> - Execute in-site tool (<span class="text-cyan">run ats</span>, <span class="text-cyan">run regime-sim</span>)</div>
            <div><span class="text-emerald-400 font-bold">sync / repos</span> - Auto-sync and print live GitHub repositories</div>
            <div><span class="text-emerald-400 font-bold">theme</span> - Toggle dark / light interface theme</div>
            <div><span class="text-emerald-400 font-bold">contact</span> - Display direct email & socials</div>
            <div><span class="text-emerald-400 font-bold">clear</span> - Clear terminal window buffer</div>
          </div>
        `);
        break;

      case "whoami":
      case "bio":
      case "cat":
        this.log(`
          <div class="space-y-1">
            <div class="text-cyan font-bold">${CONFIG.author.name}</div>
            <div class="text-text-muted">${CONFIG.author.tagline}</div>
            <div class="mt-1">${CONFIG.author.bio}</div>
            <div class="text-emerald-400 mt-1">Focus: ${CONFIG.author.focus}</div>
          </div>
        `);
        break;

      case "projects":
        this.log(`
          <div class="space-y-1.5">
            <div class="text-cyan font-bold uppercase">FEATURED PROJECTS & SYSTEMS:</div>
            ${PROJECTS.map(p => `<div>• <span class="text-text-primary font-bold">${p.title}</span> - ${p.tagline}</div>`).join("")}
          </div>
        `);
        break;

      case "posts":
      case "blog":
      case "articles":
        const posts = postService.posts || [];
        this.log(`
          <div class="space-y-1.5">
            <div class="text-cyan font-bold uppercase">PUBLISHED ENGINEERING POSTS (${posts.length}):</div>
            ${posts.map(p => `<div>• <span class="text-text-primary font-bold">${p.title}</span> [${p.category}] - ${p.date} (${p.readTime})</div>`).join("")}
            <div class="text-[11px] text-text-muted mt-2">Type <span class="text-cyan font-bold">'admin'</span> to create or edit posts.</div>
          </div>
        `);
        break;

      case "admin":
      case "cms":
        this.log(`<div class="text-cyan">Launching Admin Studio (/admin.html)...</div>`);
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 500);
        break;

      case "tools":
        this.log(`
          <div class="space-y-1.5">
            <div class="text-cyan font-bold uppercase">REGISTERED TOOLS & PRODUCTS:</div>
            ${TOOLS.map(t => `<div>• <span class="text-text-primary font-bold">${t.name}</span> [${t.category}] - ${t.tagline}</div>`).join("")}
          </div>
        `);
        break;

      case "run":
        if (arg === "ats" || arg === "resume") {
          this.log(`<div class="text-cyan">Launching ATS Resume Keyword Scanner workbench...</div>`);
          this.close();
          const target = document.querySelector("#tools");
          target?.scrollIntoView({ behavior: "smooth" });
          document.querySelector('button[data-tool="ats"]')?.click();
        } else if (arg === "regime-sim" || arg === "regime" || arg === "hmm") {
          this.log(`<div class="text-cyan">Launching Market Regime & Volatility Simulator...</div>`);
          this.close();
          const target = document.querySelector("#tools");
          target?.scrollIntoView({ behavior: "smooth" });
          document.querySelector('button[data-tool="regime"]')?.click();
        } else {
          this.log(`<div class="text-rose-400">Unknown tool '${arg}'. Available tools to run: <span class="text-cyan font-bold">run ats</span>, <span class="text-cyan font-bold">run regime-sim</span></div>`);
        }
        break;

      case "sync":
      case "repos":
      case "git":
        this.log(`<div class="text-cyan">Fetching real-time repository telemetry from GitHub API (@${githubService.username})...</div>`);
        githubService.sync(true).then(repos => {
          const repoList = repos.map(r => `<div>• <span class="text-text-primary font-bold">${r.name}</span> (${r.language}) - ★ ${r.stars} | ${githubService.getTimeAgo(r.pushedAt)}</div>`).join("");
          this.log(`
            <div class="space-y-1 mt-1">
              <div class="text-emerald-400 font-bold">✓ Successfully synced ${repos.length} public repositories:</div>
              ${repoList}
            </div>
          `);
        });
        break;

      case "theme":
        document.getElementById("btn-theme-toggle")?.click();
        this.log(`<div class="text-cyan">Interface theme toggled successfully.</div>`);
        break;

      case "contact":
      case "email":
        this.log(`
          <div class="space-y-1">
            <div class="text-cyan font-bold">Direct Channels:</div>
            <div>• Email: <a href="mailto:${CONFIG.author.email}" class="text-emerald-400 underline">${CONFIG.author.email}</a></div>
            <div>• GitHub: <a href="${CONFIG.author.github}" target="_blank" class="text-emerald-400 underline">${CONFIG.author.github}</a></div>
            <div>• LinkedIn: <a href="${CONFIG.author.linkedin}" target="_blank" class="text-emerald-400 underline">${CONFIG.author.linkedin}</a></div>
          </div>
        `);
        break;

      case "clear":
      case "cls":
        const output = document.getElementById("terminal-output");
        if (output) output.innerHTML = "";
        break;

      default:
        this.log(`<div class="text-rose-400">Command not found: '${cmd}'. Type <span class="text-emerald-400 font-bold">'help'</span> to see available commands.</div>`);
        break;
    }
  }
}
