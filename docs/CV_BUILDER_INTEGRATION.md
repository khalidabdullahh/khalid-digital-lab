# AI CV Builder — Product Ecosystem Integration

## 1. Product Summary

**Product Name:** AI CV Builder v2.0  
**Author:** Khalid Abdullah  
**Live Production URL:** [https://first-project-plum-phi.vercel.app](https://first-project-plum-phi.vercel.app)  
**Source Repository:** [https://github.com/khalidabdullahh/CV-Builder](https://github.com/khalidabdullahh/CV-Builder)  
**Local Codebase Location:** `/Users/khalidabdullah/AntiGravity/CV Builder`

---

## 2. Core Features & Capabilities

- **10 Professional ATS-Proof Templates:**
  1. *Model 1: Classic Academic / ATS* — Minimal single-column formal text layout.
  2. *Model 2: Modern Dark Sidebar* — Visual 2-column layout with photo frame and skill bars.
  3. *Model 3: Executive Minimalist* — Teal accent styling with timeline dots.
  4. *Model 4: Creative Developer* — Dark terminal monospace theme for AI & software engineers.
  5. *Model 5: Clean Split Banner* — Full-width photo header banner and split columns.
  6. *Model 6: Swiss Grid (ATS Master)* — International high-contrast black & white grid.
  7. *Model 7: Modern Infographic* — Visual gradient header with metric highlight cards.
  8. *Model 8: Minimalist Monochrome* — Sleek slate sidebar with photo frame.
  9. *Model 9: Gradient Timeline* — Vibrant cyan gradient header with timeline connection nodes.
  10. *Model 10: Executive Gold & Navy* — Premium corporate serif styling.
- **Built-in Google Gemini AI Assistant:** Instant summary polishing and XYZ accomplishment bullet formulation.
- **Client-Side Photo Compression:** Automatic image resizing before document insertion.
- **1-Click Clean HD PDF Download:** Pure vector character rendering with zero watermarks.
- **Monetization Architecture:** Integrated payment modal (bKash & Stripe ready) for premium templates.

---

## 3. Integration with Personal Digital Lab

The AI CV Builder is integrated across three major layers of the Personal Digital Lab website:

1. **🛠️ Tools & Products Hub (`js/data/tools.js`):**
   - Featured as the flagship product (`tool-cv-builder`).
   - Links directly to the production application.
2. **⚡ Projects Showcase (`js/data/projects.js`):**
   - Featured project showcase (`proj-cv-builder`) with problem/solution breakdown and technical highlights.
3. **🧪 The Lab Research Dashboard (`js/data/experiments.js`):**
   - Featured as **Experiment E-03: Embedding Distance & Prompt Distillation for ATS Optimization**, documenting the two-pass prompt engineering methodology behind the product.
4. **Interactive ATS Keyword Analyzer (`js/components/InteractiveTools/ATSAnalyzer.js`):**
   - Embedded utility directly on the lab website allowing visitors to audit their resumes against job descriptions before launching the full CV Builder tool.

---

## 4. Preservation & Deployment Guidelines

> [!IMPORTANT]
> The CV Builder codebase in `/Users/khalidabdullah/AntiGravity/CV Builder` is an independent Next.js project.
> When making updates to the Personal Digital Lab, do not modify the CV Builder repository directly unless requested.
> All references in the Digital Lab are decoupled via standard HTTPS links and shared data schemas.
