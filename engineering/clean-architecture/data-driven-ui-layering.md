# 🏛️ Data-Driven UI Architecture & Component Decoupling

**Topic:** High-Performance Single Page Architecture, Data Separation & Zero-GC Event Coordination  
**Reference Implementations:** Khalid Abdullah Digital Lab & Innovation Hub  
**Author:** Khalid Abdullah  

---

## 📌 Architectural Triad

To maintain long-term maintainability without complex build bundler lock-in, the digital lab architecture enforces a strict tripartite separation:

```mermaid
graph TD
    Data["1. Data Layer (`js/data/*.js`)<br/>Static Data Stores, LaTeX Proofs, Research Findings"]
    UI["2. UI Component Layer (`js/components/*.js`)<br/>Reactive DOM Lifecycle, Modals, Themes"]
    Sim["3. Hardware Canvas Engines (`js/components/InteractiveTools/*.js`)<br/>Zero-GC Particle Attractors, HMM Classifiers, Lp Balls"]

    Data --> UI
    UI --> Sim
    Sim -.->|Custom DOM Events| UI
```

---

## ⚡ 1. Decoupled Data Layer Principle
- UI templates never hardcode project metrics or experiment text.
- Adding a new research experiment, project, tool, or knowledge note is as simple as appending a typed object into `js/data/`.
- The UI layer reads directly from immutable data exports, ensuring zero runtime data mutability bugs.
