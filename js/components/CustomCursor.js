/**
 * Custom Desktop Magnetic Morphing Cursor
 * Author: Khalid Abdullah
 */

export class CustomCursor {
  constructor() {
    this.cursor = null;
    this.dot = null;
    this.pos = { x: -100, y: -100 };
    this.mouse = { x: -100, y: -100 };
    this.speed = 0.18;
    this.isHovering = false;
    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!this.isTouch && !this.prefersReducedMotion && window.innerWidth >= 1024) {
      this.init();
    }
  }

  init() {
    this.render();
    this.bindEvents();
    this.animate();
  }

  render() {
    const existing = document.getElementById("custom-cursor-container");
    if (existing) existing.remove();

    const cursorHtml = `
      <div id="custom-cursor-container" class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
        <div id="cursor-follower" class="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-cyan/40 transition-transform duration-75 ease-out opacity-0"></div>
        <div id="cursor-dot" class="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-cyan transition-transform duration-0 opacity-0"></div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", cursorHtml);
    this.cursor = document.getElementById("cursor-follower");
    this.dot = document.getElementById("cursor-dot");
  }

  bindEvents() {
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (this.cursor && this.cursor.style.opacity === "0") {
        this.cursor.style.opacity = "1";
        this.dot.style.opacity = "1";
      }
    });

    window.addEventListener("mouseleave", () => {
      if (this.cursor) {
        this.cursor.style.opacity = "0";
        this.dot.style.opacity = "0";
      }
    });

    // Check hover on interactive items
    const updateHoverStates = () => {
      document.querySelectorAll("a, button, input, textarea, .experiment-card, .tool-card, .article-card, canvas").forEach(el => {
        el.addEventListener("mouseenter", () => {
          this.cursor?.classList.add("scale-150", "bg-cyan/15", "border-cyan");
        });
        el.addEventListener("mouseleave", () => {
          this.cursor?.classList.remove("scale-150", "bg-cyan/15", "border-cyan");
        });
      });
    };

    updateHoverStates();
    // Re-bind on dynamic mutations
    const observer = new MutationObserver(() => updateHoverStates());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  animate() {
    this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
    this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

    if (this.cursor && this.dot) {
      this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
      this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0)`;
    }

    requestAnimationFrame(() => this.animate());
  }
}
