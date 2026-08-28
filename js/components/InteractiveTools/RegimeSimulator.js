/**
 * Interactive Market Regime & Volatility Simulator
 * Author: Khalid Abdullah
 */

export class RegimeSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    
    // Simulation Parameters
    this.params = {
      bars: 300,
      drift: 0.05,        // Annual drift mu
      baseVol: 0.15,      // Base volatility sigma
      shockFreq: 0.08,    // Probability of regime shock
      regimePersistence: 0.92 // Likelihood of staying in same regime
    };

    // 3 Hidden Regimes: 0 = Bull (Green), 1 = Chop/Range (Yellow), 2 = High Vol Crash (Red)
    this.regimeColors = {
      0: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.12)", label: "Regime 0: Low-Vol Bull" },
      1: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.12)", label: "Regime 1: Mean-Reverting Chop" },
      2: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.15)", label: "Regime 2: High-Vol Liquidation" }
    };

    this.simData = [];
    this.currentRegime = 0;
    this.stats = { returnPct: 0, maxDrawdown: 0, realizedVol: 0, sharpe: 0 };
    
    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderLayout();
    this.bindEvents();
    this.runSimulation();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="simulator-wrapper p-6 rounded-2xl bg-surface border border-border/80 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 class="text-lg font-bold text-text-primary tracking-tight">HMM Market Regime & Volatility Simulator</h3>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">3-State Gaussian Markov Switching Engine with real-time Monte Carlo pathing</p>
          </div>
          
          <!-- Presets -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted font-mono">PRESETS:</span>
            <button class="preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono" data-preset="bull">Steady Bull</button>
            <button class="preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono" data-preset="chop">Chop Range</button>
            <button class="preset-btn px-2.5 py-1 text-xs rounded bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-cyan transition-all font-mono" data-preset="crash">Liquidation</button>
          </div>
        </div>

        <!-- Telemetry HUD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div class="p-3 rounded-lg bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Cumulative Return</div>
            <div id="sim-stat-return" class="text-base font-mono font-bold text-emerald-400 mt-0.5">+0.0%</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Realized Vol (Ann.)</div>
            <div id="sim-stat-vol" class="text-base font-mono font-bold text-cyan mt-0.5">0.0%</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Max Drawdown</div>
            <div id="sim-stat-dd" class="text-base font-mono font-bold text-rose-400 mt-0.5">0.0%</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-elevated/60 border border-border">
            <div class="text-[11px] font-mono text-text-muted uppercase">Simulated Sharpe</div>
            <div id="sim-stat-sharpe" class="text-base font-mono font-bold text-amber-400 mt-0.5">0.00</div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div class="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-surface-elevated border border-border/70">
          <canvas id="regime-canvas" class="w-full h-full block"></canvas>
          <div id="canvas-regime-pill" class="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-border text-xs font-mono text-emerald-400 backdrop-blur-md">
            ● State 0: Low-Vol Bull Trend
          </div>
        </div>

        <!-- Interactive Parameter Sliders -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Drift (μ):</span>
              <span id="label-drift" class="text-cyan font-bold">+5.0%</span>
            </div>
            <input type="range" id="slider-drift" min="-0.20" max="0.30" step="0.01" value="0.05" class="w-full accent-cyan cursor-pointer">
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Base Volatility (σ):</span>
              <span id="label-vol" class="text-cyan font-bold">15.0%</span>
            </div>
            <input type="range" id="slider-vol" min="0.05" max="0.50" step="0.01" value="0.15" class="w-full accent-cyan cursor-pointer">
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1.5">
              <span class="text-text-secondary">Shock Frequency:</span>
              <span id="label-shock" class="text-cyan font-bold">8.0%</span>
            </div>
            <input type="range" id="slider-shock" min="0.01" max="0.30" step="0.01" value="0.08" class="w-full accent-cyan cursor-pointer">
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between mt-4 pt-3 text-xs text-text-muted font-mono">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Bull</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Chop</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400"></span> Crash</span>
          </div>
          <button id="btn-resimulate" class="px-4 py-1.5 rounded-lg bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 animate-spin-reverse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Re-Simulate Path
          </button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById("regime-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.drawChart();
    });

    const driftSlider = document.getElementById("slider-drift");
    const volSlider = document.getElementById("slider-vol");
    const shockSlider = document.getElementById("slider-shock");
    const resimBtn = document.getElementById("btn-resimulate");

    driftSlider?.addEventListener("input", (e) => {
      this.params.drift = parseFloat(e.target.value);
      document.getElementById("label-drift").textContent = `${(this.params.drift * 100).toFixed(1)}%`;
      this.runSimulation();
    });

    volSlider?.addEventListener("input", (e) => {
      this.params.baseVol = parseFloat(e.target.value);
      document.getElementById("label-vol").textContent = `${(this.params.baseVol * 100).toFixed(1)}%`;
      this.runSimulation();
    });

    shockSlider?.addEventListener("input", (e) => {
      this.params.shockFreq = parseFloat(e.target.value);
      document.getElementById("label-shock").textContent = `${(this.params.shockFreq * 100).toFixed(1)}%`;
      this.runSimulation();
    });

    resimBtn?.addEventListener("click", () => this.runSimulation());

    // Preset Buttons
    this.container.querySelectorAll(".preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const preset = btn.dataset.preset;
        if (preset === "bull") {
          this.setParams(0.18, 0.10, 0.03);
        } else if (preset === "chop") {
          this.setParams(0.00, 0.22, 0.15);
        } else if (preset === "crash") {
          this.setParams(-0.15, 0.38, 0.25);
        }
      });
    });
  }

  setParams(drift, vol, shock) {
    this.params.drift = drift;
    this.params.baseVol = vol;
    this.params.shockFreq = shock;

    const driftSlider = document.getElementById("slider-drift");
    const volSlider = document.getElementById("slider-vol");
    const shockSlider = document.getElementById("slider-shock");

    if (driftSlider) driftSlider.value = drift;
    if (volSlider) volSlider.value = vol;
    if (shockSlider) shockSlider.value = shock;

    document.getElementById("label-drift").textContent = `${(drift * 100).toFixed(1)}%`;
    document.getElementById("label-vol").textContent = `${(vol * 100).toFixed(1)}%`;
    document.getElementById("label-shock").textContent = `${(shock * 100).toFixed(1)}%`;

    this.runSimulation();
  }

  runSimulation() {
    const N = this.params.bars;
    const dt = 1 / 252;
    let price = 100.0;
    let state = 0; // 0 = Bull, 1 = Chop, 2 = Crash
    
    this.simData = [{ index: 0, price: 100, logRet: 0, state: 0 }];
    
    let peak = 100.0;
    let maxDd = 0.0;
    const logReturns = [];

    // Transition Matrix
    // [0->0, 0->1, 0->2]
    // [1->0, 1->1, 1->2]
    // [2->0, 2->1, 2->2]
    for (let t = 1; t < N; t++) {
      // Markov Transition Step
      const r = Math.random();
      if (state === 0) {
        if (r < this.params.shockFreq) state = (Math.random() < 0.7) ? 1 : 2;
      } else if (state === 1) {
        if (r < 0.12) state = (Math.random() < 0.6) ? 0 : 2;
      } else if (state === 2) {
        if (r < 0.25) state = (Math.random() < 0.7) ? 1 : 0;
      }

      // Regime-Dependent Parameters
      let mu = this.params.drift;
      let sigma = this.params.baseVol;

      if (state === 0) { // Bull
        mu = Math.max(mu, 0.12);
        sigma *= 0.75;
      } else if (state === 1) { // Chop
        mu = 0.01;
        sigma *= 1.2;
      } else if (state === 2) { // Crash
        mu = -0.45;
        sigma *= 2.8;
      }

      // Box-Muller Normal random variable
      const u1 = Math.random() || 1e-7;
      const u2 = Math.random() || 1e-7;
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      const dLogP = (mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z;
      price = price * Math.exp(dLogP);
      
      logReturns.push(dLogP);
      if (price > peak) peak = price;
      const dd = (peak - price) / peak;
      if (dd > maxDd) maxDd = dd;

      this.simData.push({ index: t, price, logRet: dLogP, state });
    }

    // Compute Metrics
    const totalReturn = (price - 100) / 100;
    const meanRet = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
    const variance = logReturns.reduce((a, b) => a + Math.pow(b - meanRet, 2), 0) / logReturns.length;
    const annVol = Math.sqrt(variance * 252);
    const annReturn = totalReturn * (252 / N);
    const sharpe = annVol > 0 ? (annReturn - 0.03) / annVol : 0;

    this.stats = {
      returnPct: totalReturn * 100,
      realizedVol: annVol * 100,
      maxDrawdown: maxDd * 100,
      sharpe: sharpe
    };

    this.updateStatsUI();
    this.drawChart();
  }

  updateStatsUI() {
    const retEl = document.getElementById("sim-stat-return");
    const volEl = document.getElementById("sim-stat-vol");
    const ddEl = document.getElementById("sim-stat-dd");
    const sharpeEl = document.getElementById("sim-stat-sharpe");
    const pillEl = document.getElementById("canvas-regime-pill");

    if (retEl) {
      retEl.textContent = `${this.stats.returnPct >= 0 ? "+" : ""}${this.stats.returnPct.toFixed(1)}%`;
      retEl.className = `text-base font-mono font-bold mt-0.5 ${this.stats.returnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`;
    }
    if (volEl) volEl.textContent = `${this.stats.realizedVol.toFixed(1)}%`;
    if (ddEl) ddEl.textContent = `-${this.stats.maxDrawdown.toFixed(1)}%`;
    if (sharpeEl) {
      sharpeEl.textContent = this.stats.sharpe.toFixed(2);
      sharpeEl.className = `text-base font-mono font-bold mt-0.5 ${this.stats.sharpe >= 1.0 ? "text-emerald-400" : this.stats.sharpe >= 0 ? "text-amber-400" : "text-rose-400"}`;
    }

    const lastState = this.simData[this.simData.length - 1].state;
    if (pillEl) {
      if (lastState === 0) {
        pillEl.textContent = "● State 0: Low-Vol Bull Trend";
        pillEl.className = "absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-border text-xs font-mono text-emerald-400 backdrop-blur-md";
      } else if (lastState === 1) {
        pillEl.textContent = "● State 1: Mean-Reverting Chop";
        pillEl.className = "absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-border text-xs font-mono text-amber-400 backdrop-blur-md";
      } else {
        pillEl.textContent = "● State 2: High-Vol Liquidation";
        pillEl.className = "absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-border text-xs font-mono text-rose-400 backdrop-blur-md";
      }
    }
  }

  drawChart() {
    if (!this.ctx || !this.simData.length) return;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const padding = { top: 25, right: 35, bottom: 30, left: 45 };

    this.ctx.clearRect(0, 0, w, h);

    // Compute min / max price bounds
    const prices = this.simData.map(d => d.price);
    const minP = Math.min(...prices) * 0.96;
    const maxP = Math.max(...prices) * 1.04;

    const getX = (idx) => padding.left + (idx / (this.simData.length - 1)) * (w - padding.left - padding.right);
    const getY = (p) => padding.top + (1 - (p - minP) / (maxP - minP)) * (h - padding.top - padding.bottom);

    // 1. Draw Grid Lines
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const priceVal = minP + (i / 4) * (maxP - minP);
      const y = getY(priceVal);
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(w - padding.right, y);
      this.ctx.stroke();

      // Axis labels
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      this.ctx.font = "10px JetBrains Mono, monospace";
      this.ctx.textAlign = "right";
      this.ctx.fillText(priceVal.toFixed(1), padding.left - 8, y + 3);
    }

    // 2. Draw Regime Background Bands
    for (let i = 0; i < this.simData.length - 1; i++) {
      const curr = this.simData[i];
      const next = this.simData[i + 1];
      const x1 = getX(curr.index);
      const x2 = getX(next.index);

      this.ctx.fillStyle = this.regimeColors[curr.state].fill;
      this.ctx.fillRect(x1, padding.top, x2 - x1 + 0.5, h - padding.top - padding.bottom);
    }

    // 3. Draw Price Path
    this.ctx.lineWidth = 2.2;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";

    for (let i = 0; i < this.simData.length - 1; i++) {
      const curr = this.simData[i];
      const next = this.simData[i + 1];
      const x1 = getX(curr.index);
      const y1 = getY(curr.price);
      const x2 = getX(next.index);
      const y2 = getY(next.price);

      this.ctx.strokeStyle = this.regimeColors[curr.state].stroke;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // 4. Draw Current Endpoint Glow Dot
    const last = this.simData[this.simData.length - 1];
    const lastX = getX(last.index);
    const lastY = getY(last.price);

    this.ctx.fillStyle = this.regimeColors[last.state].stroke;
    this.ctx.beginPath();
    this.ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.regimeColors[last.state].stroke;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
}
