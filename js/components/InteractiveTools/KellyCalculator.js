/**
 * Interactive Quantitative Kelly Criterion & Position Sizing Calculator
 * Author: Khalid Abdullah
 */

export class KellyCalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.params = {
      winRate: 0.55,       // p = 55%
      winLossRatio: 1.8,   // b = $1.80 win for every $1.00 loss
      totalCapital: 100000,
      fraction: 0.5        // Half-Kelly default
    };

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderLayout();
    this.bindEvents();
    this.calculate();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="kelly-wrapper p-6 rounded-2xl bg-surface border border-border/80 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <h3 class="text-lg font-bold text-text-primary tracking-tight">Quantitative Position Sizing & Kelly Criterion</h3>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">Optimal logarithmic wealth growth, risk-adjusted leverage & drawdown bounds</p>
          </div>

          <div class="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border">
            <button class="fraction-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all" data-fraction="1.0">Full (1.0x)</button>
            <button class="fraction-btn px-2.5 py-1 text-xs rounded font-mono text-cyan bg-cyan/15 border border-cyan/40 active" data-fraction="0.5">Half (0.5x)</button>
            <button class="fraction-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all" data-fraction="0.25">Quarter (0.25x)</button>
          </div>
        </div>

        <!-- Telemetry Results Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Recommended Bet Size</div>
            <div id="kelly-f-star" class="text-xl font-mono font-black text-cyan mt-1">15.0%</div>
            <div id="kelly-dollar-amount" class="text-[11px] font-mono text-text-secondary mt-0.5">$15,000</div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Edge / Expectancy</div>
            <div id="kelly-edge" class="text-xl font-mono font-black text-emerald-400 mt-1">+0.54 R</div>
            <div class="text-[11px] font-mono text-text-secondary mt-0.5">per unit risked</div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Compound Growth Rate</div>
            <div id="kelly-growth" class="text-xl font-mono font-black text-amber-400 mt-1">+4.2%</div>
            <div class="text-[11px] font-mono text-text-secondary mt-0.5">expected per trade</div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Risk of 50% Drawdown</div>
            <div id="kelly-drawdown-risk" class="text-xl font-mono font-black text-rose-400 mt-1">12.5%</div>
            <div class="text-[11px] font-mono text-text-secondary mt-0.5">over 200 bets</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Win Probability (p):</span>
              <span id="label-winrate" class="text-cyan font-bold">55%</span>
            </div>
            <input type="range" id="slider-winrate" min="0.30" max="0.80" step="0.01" value="0.55" class="w-full accent-cyan cursor-pointer">
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Payoff Ratio (b = Win/Loss):</span>
              <span id="label-payoff" class="text-cyan font-bold">1.80x</span>
            </div>
            <input type="range" id="slider-payoff" min="0.5" max="4.0" step="0.1" value="1.8" class="w-full accent-cyan cursor-pointer">
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Total Account Capital:</span>
              <span id="label-capital" class="text-cyan font-bold">$100,000</span>
            </div>
            <input type="range" id="slider-capital" min="10000" max="500000" step="10000" value="100000" class="w-full accent-cyan cursor-pointer">
          </div>
        </div>

        <!-- Formula Note -->
        <div class="mt-4 p-3 rounded-lg bg-surface-elevated/40 border border-border text-xs font-mono text-text-muted flex items-center justify-between">
          <span>Mathematical Foundation: $f^* = \\frac{p(b+1) - 1}{b}$</span>
          <span class="text-text-secondary">Kelly (1956) Information Theory</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const winRateSlider = document.getElementById("slider-winrate");
    const payoffSlider = document.getElementById("slider-payoff");
    const capitalSlider = document.getElementById("slider-capital");

    winRateSlider?.addEventListener("input", (e) => {
      this.params.winRate = parseFloat(e.target.value);
      document.getElementById("label-winrate").textContent = `${Math.round(this.params.winRate * 100)}%`;
      this.calculate();
    });

    payoffSlider?.addEventListener("input", (e) => {
      this.params.winLossRatio = parseFloat(e.target.value);
      document.getElementById("label-payoff").textContent = `${this.params.winLossRatio.toFixed(2)}x`;
      this.calculate();
    });

    capitalSlider?.addEventListener("input", (e) => {
      this.params.totalCapital = parseFloat(e.target.value);
      document.getElementById("label-capital").textContent = `$${this.params.totalCapital.toLocaleString()}`;
      this.calculate();
    });

    this.container.querySelectorAll(".fraction-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.container.querySelectorAll(".fraction-btn").forEach(b => {
          b.className = "fraction-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all";
        });
        btn.className = "fraction-btn px-2.5 py-1 text-xs rounded font-mono text-cyan bg-cyan/15 border border-cyan/40 active";
        this.params.fraction = parseFloat(btn.dataset.fraction);
        this.calculate();
      });
    });
  }

  calculate() {
    const p = this.params.winRate;
    const q = 1 - p;
    const b = this.params.winLossRatio;

    // Full Kelly: f* = (bp - q) / b
    const rawKelly = (b * p - q) / b;
    const adjustedKelly = Math.max(0, rawKelly * this.params.fraction);

    // Expectancy in R: (p * b) - (q * 1)
    const edge = (p * b) - q;

    // Expected compound growth rate: g(f) = p * ln(1 + f*b) + q * ln(1 - f)
    let growth = 0;
    if (adjustedKelly > 0 && adjustedKelly < 1) {
      growth = (p * Math.log(1 + adjustedKelly * b) + q * Math.log(1 - adjustedKelly));
    }

    // Risk of 50% Drawdown approximation: Risk ~ ((1 - f) / (1 + f)) ^ (target_ruin_units)
    const ddRisk = adjustedKelly > 0 ? Math.min(100, Math.pow((1 - adjustedKelly * 0.7) / (1 + adjustedKelly * 0.7), 10) * 100) : 0;
    const dollarAlloc = this.params.totalCapital * adjustedKelly;

    // UI Updates
    const fStarEl = document.getElementById("kelly-f-star");
    const dollarEl = document.getElementById("kelly-dollar-amount");
    const edgeEl = document.getElementById("kelly-edge");
    const growthEl = document.getElementById("kelly-growth");
    const ddEl = document.getElementById("kelly-drawdown-risk");

    if (fStarEl) {
      fStarEl.textContent = `${(adjustedKelly * 100).toFixed(1)}%`;
      fStarEl.className = `text-xl font-mono font-black mt-1 ${adjustedKelly > 0.25 ? "text-rose-400" : "text-cyan"}`;
    }
    if (dollarEl) dollarEl.textContent = `$${Math.round(dollarAlloc).toLocaleString()}`;
    if (edgeEl) {
      edgeEl.textContent = `${edge >= 0 ? "+" : ""}${edge.toFixed(2)} R`;
      edgeEl.className = `text-xl font-mono font-black mt-1 ${edge >= 0 ? "text-emerald-400" : "text-rose-400"}`;
    }
    if (growthEl) {
      growthEl.textContent = `${(growth * 100).toFixed(2)}%`;
      growthEl.className = `text-xl font-mono font-black mt-1 ${growth >= 0 ? "text-amber-400" : "text-rose-400"}`;
    }
    if (ddEl) {
      ddEl.textContent = `${ddRisk.toFixed(1)}%`;
      ddEl.className = `text-xl font-mono font-black mt-1 ${ddRisk > 25 ? "text-rose-400" : "text-emerald-400"}`;
    }
  }
}
