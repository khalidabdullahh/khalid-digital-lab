/**
 * Interactive Retro-Futuristic CLI Developer Terminal
 * Author: Khalid Abdullah
 */

import { CONFIG } from "../config.js";
import { TOOLS } from "../data/tools.js";
import { EXPERIMENTS } from "../data/experiments.js";
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
              <span class="text-[11px] text-text-secondary font-bold pl-2">khalid@antigravity-lab:~ (zsh)</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-[10px] text-cyan">STATUS: READY</span>
              <button id="btn-close-terminal" class="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm">✕</button>
            </div>
          </div>

          <!-- Terminal Output Log -->
          <div id="terminal-output" class="flex-1 p-4 overflow-y-auto space-y-2 text-text-secondary leading-relaxed">
            <div class="text-cyan font-bold">ANTIGRAVITY DIGITAL LAB OS v${CONFIG.system.version} [Build ${CONFIG.system.buildDate}]</div>
            <div class="text-text-muted">Type <span class="text-emerald-400 font-bold">'help'</span> to see all available commands, or <span class="text-amber-400 font-bold">'run regime-sim'</span> to simulate market states.</div>
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
            <div><span class="text-emerald-400 font-bold">whoami / bio</span> - Print Khalid Abdullah's researcher background</div>
            <div><span class="text-emerald-400 font-bold">tools</span> - List interactive tools and production web applications</div>
            <div><span class="text-emerald-400 font-bold">lab</span> - Query ongoing research hypotheses and active experiments</div>
            <div><span class="text-emerald-400 font-bold">run [tool]</span> - Execute in-site tool (e.g. <span class="text-cyan">run regime-sim</span>, <span class="text-cyan">run ats</span>)</div>
            <div><span class="text-emerald-400 font-bold">sync / repos</span> - Auto-sync and print live GitHub repositories</div>
            <div><span class="text-emerald-400 font-bold">theme</span> - Toggle dark / light interface theme</div>
            <div><span class="text-emerald-400 font-bold">contact</span> - Display direct communications channels & email</div>
            <div><span class="text-emerald-400 font-bold">clear</span> - Clear terminal window buffer</div>
            <div><span class="text-emerald-400 font-bold">matrix</span> - Stream digital phosphor rain simulation</div>
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

      case "tools":
        this.log(`
          <div class="space-y-1.5">
            <div class="text-cyan font-bold uppercase">REGISTERED TOOLS & PRODUCTS:</div>
            ${TOOLS.map(t => `<div>• <span class="text-text-primary font-bold">${t.name}</span> [${t.category}] - ${t.tagline}</div>`).join("")}
          </div>
        `);
        break;

      case "lab":
      case "experiments":
        this.log(`
          <div class="space-y-1.5">
            <div class="text-cyan font-bold uppercase">ACTIVE LAB EXPERIMENTS:</div>
            ${EXPERIMENTS.map(e => `<div>[${e.status.toUpperCase()}] <span class="text-text-primary font-bold">${e.title}</span> (${e.progress}% complete)</div>`).join("")}
          </div>
        `);
        break;

      case "run":
        if (arg.includes("regime") || arg.includes("sim")) {
          this.log(`<span class="text-emerald-400 font-bold">✓ Initializing Market Regime Simulator...</span>`);
          this.close();
          document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth" });
        } else if (arg.includes("ats")) {
          this.log(`<span class="text-emerald-400 font-bold">✓ Initializing ATS Resume Keyword Scanner...</span>`);
          this.close();
          document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth" });
        } else {
          this.log(`<span class="text-amber-400">Specify tool: 'run regime-sim' or 'run ats'</span>`);
        }
        break;

      case "theme":
        document.getElementById("btn-theme-toggle")?.click();
        this.log(`<span class="text-emerald-400 font-bold">✓ Toggled theme mode.</span>`);
        break;

      case "contact":
        this.log(`
          <div class="space-y-1">
            <div>Email: <span class="text-cyan font-bold">${CONFIG.author.email}</span></div>
            <div>GitHub: <span class="text-text-primary">${CONFIG.author.github}</span></div>
            <div>LinkedIn: <span class="text-text-primary">${CONFIG.author.linkedin}</span></div>
          </div>
        break;

      case "sync":
      case "repos":
      case "github":
        this.log(`<span class="text-cyan">Connecting to GitHub API for @${githubService.username}...</span>`);
        githubService.sync(true).then(repos => {
          const rows = repos.map(r => `<div>• <a href="${r.htmlUrl}" target="_blank" class="text-cyan font-bold hover:underline">${r.name}</a> [${r.language}] - ★ ${r.stars} (Updated ${githubService.getTimeAgo(r.pushedAt)})</div>`).join("");
          this.log(`
            <div class="space-y-1 mt-1">
              <div class="text-emerald-400 font-bold uppercase">LIVE GITHUB REPOSITORIES (${repos.length}):</div>
              ${rows}
            </div>
          `);
        }).catch(err => {
          this.log(`<span class="text-rose-400">Failed to sync: ${err.message}</span>`);
        });
        break;

      case "clear":
        const output = document.getElementById("terminal-output");
        if (output) output.innerHTML = "";
        break;

      case "matrix":
        this.log(`<span class="text-emerald-400 font-mono font-bold animate-pulse">01000001 01001110 01010100 01001001 01000111 01010010 01000001 01010110 01001001 01010100 01011001</span><br><span class="text-cyan">"Wake up, Neo... The Matrix has you."</span>`);
        break;

      case "sudo":
        if (arg.includes("rm")) {
          this.log(`<span class="text-rose-400 font-bold">Permission Denied: Nice try! Khalid's Digital Lab is immutable. 🛡️</span>`);
        } else {
          this.log(`<span class="text-amber-400">khalid is not in the sudoers file. This incident will be reported.</span>`);
        }
        break;

      default:
        this.log(`<span class="text-rose-400">Command not found: '${cmdText}'. Type <span class="text-cyan font-bold">'help'</span> for instructions.</span>`);
    }
  }
}
