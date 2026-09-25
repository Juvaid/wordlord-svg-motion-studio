# WordLord SVG Motion Studio — Architecture & Quality Guidelines

This document outlines the architectural standards, design principles, animation rules, and technical guardrails for **WordLord SVG Motion Studio**. All contributors, automated generators, and future updates must adhere to these specifications.

---

## 1. Studio Layout & Visual Hierarchy

The application follows the industry-standard nonlinear video editing (NLE) and motion design workspace paradigm (e.g., After Effects, CapCut, Figma):

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo • Preset Selector • Zoom/Canvas Controls • Export Actions │
├───────────────┬────────────────────────────────────────┬───────────────┤
│ LEFT PANEL    │ CENTER STAGE                           │ RIGHT PANEL   │
│               │                                        │               │
│ Creative      │ Viewport Canvas (Pan, Zoom, Reset)    │ Properties &  │
│ Library       │ Full-fidelity SVG Display Area         │ Inspector Lab │
│ • Motions (12)│ Filter-bleed Safe Container            │ • Duration/FPS│
│ • Styles (8)  │ Background Mode Swatches (Dark/Grid)   │ • Easing / Glow│
│ • Glyphs (17) │ Quick Scrub / Playback Overlay         │ • CSS Manifest│
├───────────────┴────────────────────────────────────────┴───────────────┤
│ BOTTOM DOCK: Synchronized Frame Timeline • Transport Controls • Loop   │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Rules:
- **Left Panel (Creative Assets & Library)**: Dedicated exclusively to selection. Do not split options between left and right sidebars. Card titles should be concise and clean; details belong in interactive tooltips (`i`), not bloated paragraph text.
- **Center Stage**: Unobstructed vector canvas with smooth panning (`Space + Drag`), zooming (`Wheel`), and high-contrast bounding frames.
- **Right Panel (Inspector Lab)**: Real-time parameter controls for the active state (Duration, Stagger delay, Easing curves, Filter glow blur, Accent color overrides, and Live CSS export snippet).
- **Bottom Dock (Timeline)**: Frame-accurate playback, timecode scrub bar, and transport controls dynamically locked to the active motion duration.

---

## 2. Asset Integrity & Thumbnail Fidelity

- **Rule 2.1 — Full Mark Guarantee**: Every motion and style preview thumbnail card must render the **entire 17-glyph WordLord Media mark** (viewBox `0 0 25.04 25.43` or normalized aspect). Never use subset letter fragments (e.g., `W`, `D`, `M`) in preview cards, as they appear broken or corrupted.
- **Rule 2.2 — Vector Scalability**: All vector paths must preserve original Bézier precision. Do not decimate or simplify paths at the expense of typographical accuracy.
- **Rule 2.3 — Active State Indicator**: Cards must provide unambiguous visual feedback (accent border glow, check badge, and elevation change) when selected.

---

## 3. Motion Timing & Timeline Synchronization

- **Rule 3.1 — Unified Clock Source**: CSS animation duration and the bottom timeline scrubber must never drift out of sync. When switching presets:
  1. Update `--anim-dur` on the canvas SVG root.
  2. Call `syncTimelineDuration(durMs)`.
  3. Re-scale the timeline ruler tick marks and duration display dynamically.
- **Rule 3.2 — Scrubber Interactivity**: Dragging the playhead must pause auto-playback and scrub CSS animations using negative animation delays (`animation-delay: -{t}s; animation-play-state: paused;`) or Web Animations API (`animation.currentTime = t`).
- **Rule 3.3 — Easing Standards**:
  - Entrances: Exponential decelerations (`cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`).
  - Loops: Smooth continuous or symmetrical sine curves (`cubic-bezier(0.45, 0, 0.55, 1)`).
  - High Impact / Tech: Spring-like damping without excessive elastic rubber-banding.

---

## 4. SVG Filters & Glow Bleed Protection

- **Rule 4.1 — Filter Bounding Region**: SVG filters (drop shadows, neon glows, Gaussian blurs) must declare sufficient bounds to prevent edge clipping:
  ```xml
  <filter id="glow" x="-250%" y="-250%" width="600%" height="600%">
    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  ```
- **Rule 4.2 — SVG Overflow Rule**: The SVG element, its parents, and any `<g>` containers containing animated filters must specify `overflow: visible !important`.
- **Rule 4.3 — Performance Throttling**: Cap `stdDeviation` $\le 16$ to avoid GPU compositing pipeline bottlenecks and frame drops on lower-spec hardware.

---

## 5. Architectural Guardrails (Zero-Dependency Standalone)

- **Rule 5.1 — Self-Contained Deployment**: `index.html` must remain fully executable offline with zero required npm packages, bundlers, or local server daemons. Double-clicking the file in any browser must launch the full studio experience.
- **Rule 5.2 — Safe Extensibility**:
  - To register new motion presets, add them to `PRESET_MOTIONS` array with `id`, `name`, `desc`, `cat`, and CSS keyframes.
  - To register new style themes, add them to `PRESET_STYLES` with `id`, `name`, `fill`, `filter`, and border styles.
  - The studio generator scripts (`compile_studio_v4.py`) will automatically compile the full 17-glyph thumbnails and bundle them into production assets.
- **Rule 5.3 — Accessibility & Performance**:
  - Always support `@media (prefers-reduced-motion: reduce)`.
  - Contrast ratios for UI chrome must meet or exceed WCAG AA ($\ge 4.5:1$).
  - Never run unbounded rendering loops when the browser tab is hidden (`document.hidden`).

---

## 6. Visual Bézier Curve Graph Standards

- **Rule 6.1 — Interactive Visual Graph**: Easing curves must not be limited to raw text dropdowns. The studio must render an interactive Bézier graph viewport with:
  - Coordinate axes spanning $[0, 1]$ time and $[0, 1]$ progress (allowing overshoots $[-0.4, 1.4]$ for bounce/anticipation physics).
  - Draggable control points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ with visual tangent handle lines.
  - Live CSS variable update (`--motion-ease: cubic-bezier(...)`) applied across all active stage animations.
  - An animated velocity puck/bead running along an acceleration preview strip to physically visualize the acceleration curve.
- **Rule 6.2 — Instant Preset Matrix**: Provide at least 8 mathematical curve presets with vector SVG waveforms: Kinetic Snap, Smooth Decel, Ease-Out Quint, High-Impact Slam, Back Anticipate, Sinusoidal, Linear Matrix, and Elastic Bounce.

---

## 7. Nonlinear Multi-Track Timeline & Playhead Standards

- **Rule 7.1 — Frame-Accurate Scrubbing**: The timeline must support continuous 60fps frame-by-frame scrubbing:
  - Clicking or dragging across the time ruler OR any track lane dynamically updates the playhead position and evaluates the SVG poses via Web Animations API (`anim.currentTime = targetMs`).
  - Playhead must include a physical inverted-diamond grab head, vertical laser stem across all channels, and a live timecode tag badge (`0.42s`) during scrubbing.
- **Rule 7.2 — Multi-Channel Track Anatomy**:
  - Maintain separate track channels for: Master Stage, WORD Glyphs, LORD Glyphs, Tall D Ligature, MEDIA Sub-brand, and Volumetric Aura.
  - Each channel must feature a Layer Solo/Mute toggle (`👁`) that directly controls SVG layer visibility in real time.
  - Channels must include interactive Keyframe Diamonds (`◆`). Hovering displays frame specification tooltips; clicking snaps the playhead and stage directly to that keyframe timestamp.
- **Rule 7.3 — NLE Transport Controls**:
  - Full transport deck: Jump to Start (`|◀`), Step Backward 1 Frame (`◀`), Play/Pause (`▶ / ⏸`, toggleable via `Spacebar`), Step Forward 1 Frame (`▶`), Jump to End (`▶|`), Loop mode, and Speed multipliers (`0.25x` to `2.0x`).
  - Synthesized Web Audio API haptic feedback: subtle analog clicks on frame step and whoosh sweeps on loop resets without external audio assets.
