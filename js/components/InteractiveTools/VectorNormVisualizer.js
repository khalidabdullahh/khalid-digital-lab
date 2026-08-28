/**
 * Interactive Vector Norm (Lp) & Geometric Visualizer
 * Author: Khalid Abdullah
 */

export class VectorNormVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.ctx = null;
    this.p = 1.0; // Default L1 Norm (Lasso Diamond)
    this.vector = { x: 0.7, y: 0.6 };
    this.isDragging = false;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderLayout();
    this.bindEvents();
    this.draw();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="vector-wrapper p-6 rounded-2xl bg-surface border border-border/80 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></span>
              <h3 class="text-lg font-bold text-text-primary tracking-tight">Geometric Vector Norm ($L_p$) & Unit Ball Visualizer</h3>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">Continuous $p$-norm transformation: Manhattan ($L_1$), Euclidean ($L_2$), and Chebyshev ($L_\\infty$)</p>
          </div>

          <div class="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border">
            <button class="p-btn px-2.5 py-1 text-xs rounded font-mono text-cyan bg-cyan/15 border border-cyan/40 active" data-p="1">L1 (Lasso)</button>
            <button class="p-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all" data-p="2">L2 (Ridge)</button>
            <button class="p-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all" data-p="0.5">L0.5 (Non-Convex)</button>
            <button class="p-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all" data-p="99">L∞</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <!-- Canvas Area -->
          <div class="md:col-span-2 relative h-[300px] sm:h-[340px] rounded-xl overflow-hidden bg-surface-elevated border border-border/70">
            <canvas id="vector-canvas" class="w-full h-full block cursor-crosshair"></canvas>
            <div class="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-border text-[11px] font-mono text-text-muted backdrop-blur-md">
              Drag vector point • Adjust $p$-value slider
            </div>
          </div>

          <!-- Telemetry & Norm Readings -->
          <div class="space-y-3">
            <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
              <div class="text-[11px] font-mono text-text-muted uppercase">Vector Coordinates</div>
              <div id="norm-coords" class="text-lg font-mono font-bold text-cyan mt-0.5">x: (0.70, 0.60)</div>
            </div>

            <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
              <div class="text-[11px] font-mono text-text-muted uppercase">Computed $L_p$ Norm (p = <span id="norm-p-val">1.0</span>)</div>
              <div id="norm-lp-val" class="text-xl font-mono font-black text-violet-400 mt-0.5">1.300</div>
            </div>

            <div class="p-3.5 rounded-xl bg-surface-elevated/60 border border-border">
              <div class="text-[11px] font-mono text-text-muted uppercase">Standard Norm Comparison</div>
              <div class="grid grid-cols-3 gap-2 mt-1.5 text-xs font-mono">
                <div>
                  <div class="text-text-muted text-[10px]">||x||₁</div>
                  <div id="norm-l1-read" class="text-emerald-400 font-bold">1.30</div>
                </div>
                <div>
                  <div class="text-text-muted text-[10px]">||x||₂</div>
                  <div id="norm-l2-read" class="text-cyan font-bold">0.92</div>
                </div>
                <div>
                  <div class="text-text-muted text-[10px]">||x||∞</div>
                  <div id="norm-linf-read" class="text-amber-400 font-bold">0.70</div>
                </div>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-surface-elevated/40 border border-border text-[11px] font-mono text-text-secondary leading-relaxed">
              <span class="text-cyan font-semibold">💡 Sparsity Insight:</span> For $p \\le 1$, the unit ball has sharp vertices on the coordinate axes, forcing non-informative factor weights to exact zero.
            </div>
          </div>
        </div>

        <!-- Slider -->
        <div class="pt-3 border-t border-border">
          <div class="flex justify-between text-xs font-mono mb-1.5">
            <span class="text-text-secondary">Norm Exponent (p):</span>
            <span id="label-p-slider" class="text-cyan font-bold">p = 1.00 (Manhattan / Lasso)</span>
          </div>
          <input type="range" id="slider-p" min="0.5" max="8.0" step="0.05" value="1.0" class="w-full accent-cyan cursor-pointer">
        </div>
      </div>
    `;

    this.canvas = document.getElementById("vector-canvas");
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
    this.w = rect.width;
    this.h = rect.height;
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.draw();
    });

    const pSlider = document.getElementById("slider-p");
    pSlider?.addEventListener("input", (e) => {
      this.p = parseFloat(e.target.value);
      this.updatePLabel();
      this.draw();
    });

    this.container.querySelectorAll(".p-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.container.querySelectorAll(".p-btn").forEach(b => {
          b.className = "p-btn px-2.5 py-1 text-xs rounded font-mono text-text-secondary transition-all";
        });
        btn.className = "p-btn px-2.5 py-1 text-xs rounded font-mono text-cyan bg-cyan/15 border border-cyan/40 active";
        this.p = parseFloat(btn.dataset.p);
        if (pSlider && this.p <= 8) pSlider.value = this.p;
        this.updatePLabel();
        this.draw();
      });
    });

    // Canvas Vector Dragging
    const handlePointer = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      const scale = Math.min(this.w, this.h) * 0.38;
      const cx = this.w / 2;
      const cy = this.h / 2;

      this.vector.x = (rawX - cx) / scale;
      this.vector.y = -(rawY - cy) / scale;
      this.draw();
    };

    this.canvas?.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      handlePointer(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isDragging) handlePointer(e);
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas?.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      handlePointer(e);
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (this.isDragging) handlePointer(e);
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  }

  updatePLabel() {
    const label = document.getElementById("label-p-slider");
    const pVal = document.getElementById("norm-p-val");
    let name = "";
    if (this.p === 1) name = " (Manhattan / Lasso)";
    else if (this.p === 2) name = " (Euclidean / Ridge)";
    else if (this.p < 1) name = " (Non-Convex Sparse)";
    else if (this.p > 10) name = " (Chebyshev / Max)";

    if (label) label.textContent = `p = ${this.p > 10 ? "∞" : this.p.toFixed(2)}${name}`;
    if (pVal) pVal.textContent = this.p > 10 ? "∞" : this.p.toFixed(2);
  }

  computeLp(x, y, p) {
    if (p > 10) return Math.max(Math.abs(x), Math.abs(y));
    return Math.pow(Math.pow(Math.abs(x), p) + Math.pow(Math.abs(y), p), 1 / p);
  }

  draw() {
    if (!this.ctx) return;
    const w = this.w;
    const h = this.h;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.38;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Grid & Axes
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    this.ctx.lineWidth = 1;

    // Grid circles
    for (let r = 0.5; r <= 1.5; r += 0.5) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Main Axes
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, cy);
    this.ctx.lineTo(w, cy);
    this.ctx.moveTo(cx, 0);
    this.ctx.lineTo(cx, h);
    this.ctx.stroke();

    // 2. Draw Unit Ball B_p = { (x,y) : |x|^p + |y|^p <= 1 }
    this.ctx.beginPath();
    const steps = 360;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      let r = 1.0;
      if (this.p > 10) {
        r = 1 / Math.max(Math.abs(cosT), Math.abs(sinT));
      } else {
        r = 1 / Math.pow(Math.pow(Math.abs(cosT), this.p) + Math.pow(Math.abs(sinT), this.p), 1 / this.p);
      }

      const px = cx + r * scale * cosT;
      const py = cy - r * scale * sinT;

      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();

    // Fill gradient
    this.ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
    this.ctx.fill();
    this.ctx.strokeStyle = "#8b5cf6";
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    // 3. Draw Vector Line
    const vx = cx + this.vector.x * scale;
    const vy = cy - this.vector.y * scale;

    this.ctx.strokeStyle = "#00f0ff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(vx, vy);
    this.ctx.stroke();

    // Vector Head Dot
    this.ctx.fillStyle = "#00f0ff";
    this.ctx.beginPath();
    this.ctx.arc(vx, vy, 5.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#00f0ff";
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // 4. Update Readings
    const l1 = Math.abs(this.vector.x) + Math.abs(this.vector.y);
    const l2 = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y);
    const linf = Math.max(Math.abs(this.vector.x), Math.abs(this.vector.y));
    const lp = this.computeLp(this.vector.x, this.vector.y, this.p);

    const coordsEl = document.getElementById("norm-coords");
    const lpValEl = document.getElementById("norm-lp-val");
    const l1El = document.getElementById("norm-l1-read");
    const l2El = document.getElementById("norm-l2-read");
    const linfEl = document.getElementById("norm-linf-read");

    if (coordsEl) coordsEl.textContent = `x: (${this.vector.x.toFixed(2)}, ${this.vector.y.toFixed(2)})`;
    if (lpValEl) lpValEl.textContent = lp.toFixed(3);
    if (l1El) l1El.textContent = l1.toFixed(2);
    if (l2El) l2El.textContent = l2.toFixed(2);
    if (linfEl) linfEl.textContent = linf.toFixed(2);
  }
}
