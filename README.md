# WordLord Media // SVG Motion Architecture Studio & Kinetic Animation Deck

> Interactive kinetic laboratory, visual style preview dashboard, and animation specification engine built for the **WordLord Media** vector mark.

![License](https://img.shields.io/badge/license-MIT-red.svg)
![Status](https://img.shields.io/badge/status-12_Live_Animations-emerald.svg)
![UI](https://img.shields.io/badge/UI-CapCut_Visual_Cards-orange.svg)
![Glow](https://img.shields.io/badge/Glow-Unclipped_Volumetric_Aura-blue.svg)

---

## ⚡ Overview

A high-performance, zero-dependency kinetic motion studio designed specifically for the **WordLord Media** logo (`25×26` sub-pixel vector mark). The studio isolates typographic letterforms—including the monolithic tall `D` ligature connecting `WORD` and `LORD`, and the electric vermilion (`#FF4E2E`) `MEDIA` mark—allowing precise targeted CSS keyframe, SVG stroke draw, and timeline choreography.

### Features

- **Fluid Resizable Workspace**: Interactive draggable splitters between sidebars, canvas, and timeline. Instantly maximize stage with top bar view toggles.
- **CapCut-Style Visual Grid**: Sleek 2-column cards with hover-to-play overlays, active crimson borders, and zero text clutter.
- **Floating `(i)` Popover Specs**: Technical parameters (engine, cubic-bezier easing curves, durations, and selectors) appear only on hover over the discreet `(i)` icon.
- **Unclipped Volumetric Glow Engine**: Fixed SVG subregion clipping via `overflow: visible !important` and $600\%$ extended filter boundary regions (`#unclipped-media-glow`).
- **12 Curated Live Animations**: Spanning In/Reveals, Continuous Ambient Loops, and Glitch FX.
- **8 Curated Brand Styles**: Signature Core, Swiss Wireframe, Cyberpunk Neon, Obsidian Luxury, Studio Paper, Frosted Glass, Phosphor CRT, and CAD Blueprint.
- **Multi-Track Timeline**: Keyframe tracks for `WORD`, `LORD`, `TALL D`, and `MEDIA`, timecode counter, loop toggle, and variable playback speed ($0.5\times \rightarrow 2.0\times$).

---

## 🎬 The 12 Live Motion Presets

| # | Effect Name | Category | Engine | Easing & Character |
|---|---|---|---|---|
| **01** | **Typewriter Cascade** | Reveal / In | CSS Stagger | `cubic-bezier(0.16, 1, 0.3, 1)` sequential glyph snap |
| **02** | **Wireframe Draw** | Reveal / In | SVG Stroke | `ease-out-quint` vector path tracing into solid fill |
| **03** | **Ligature Clamp** | Reveal / In | Lateral Slide | Dual lateral clamp locking into the monolithic tall `D` |
| **04** | **Liquid Wave Wipe** | Reveal / In | Dynamic Polygon | Fluid top-to-bottom vertical clip-path reveal |
| **05** | **3D Depth Slam** | Reveal / In | Transform Z-Scale | High-impact slam from 3D space with overshoot bounce |
| **06** | **Origami Unfold** | Reveal / In | Perspective RotateX | $90^\circ$ architectural 3D perspective fold down |
| **07** | **Volumetric Aura** | Ambient Loop | Expanded SVG Filter | Unclipped $600\%$ volumetric respiration glow on MEDIA |
| **08** | **Zero-G Drift** | Ambient Loop | Multi-Axis Sinusoidal | Weightless organic floating with subtle layer parallax |
| **09** | **Laser Specular** | Ambient Loop | Specular Gradient | $45^\circ$ diagonal gleam beam sweeping every $2.8\text{s}$ |
| **10** | **Heartbeat Pulse** | Ambient Loop | Cardio Rhythm | Double-thump kinetic cardiovascular vibration |
| **11** | **Cyber Glitch** | Glitch / FX | Chromatic Offset | Multi-channel RGB split and scanline displacement |
| **12** | **Matrix Disperse** | Glitch / FX | Sub-pixel Scanline | Bitstream fragment scattering into phosphor trails |

---

## 💡 Glow Clipping Fix Details

In SVGs with small viewBox dimensions (e.g. `25×26`), applying CSS `filter: drop-shadow(...)` on inner `<g>` tags causes browser rasterizers to clip filters at the group or SVG bounding box.

**The Fix:**
1. Explicitly declared `overflow: visible !important;` on `#main-stage-svg`, all `<g>`, all `<path>`, and the stage wrappers.
2. Constructed a dedicated volumetric aura layer using an SVG `<filter id="unclipped-media-glow">` with `x="-250%" y="-250%" width="600%" height="600%"`, giving the Gaussian blur filters 6 times the bounding area to spread out naturally without hard rectangle edges.

---

## 🚀 Quick Start

Open `index.html` in any browser:

```bash
open index.html
```

Or view online:
- **Live Demo**: [juvaid.github.io/wordlord-svg-motion-studio](https://juvaid.github.io/wordlord-svg-motion-studio/)

---

## 📄 License

MIT © [WordLord Media](https://wordlordmedia.com)
