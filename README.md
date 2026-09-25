# WordLord Media // SVG Motion Architecture Studio & Animation Library

> An interactive, zero-dependency kinetic laboratory, visual style preview dashboard, and animation specification engine built for the **WordLord Media** vector brand mark.

![License](https://img.shields.io/badge/license-MIT-red.svg)
![Status](https://img.shields.io/badge/status-Phase_1_Architecture_Ready-emerald.svg)
![Platform](https://img.shields.io/badge/platform-Standalone_HTML5-orange.svg)

---

## ⚡ Overview

This studio provides an engineering and design foundation for animating the official **WordLord Media** logo (`25×26` sub-pixel vector mark). It decomposes the typographic mark into distinct semantic layers—including the monolithic tall `D` ligature connecting `WORD` and `LORD`, and the electric vermilion (`#FF4E2E`) `MEDIA` accent—allowing precise targeted CSS keyframe, SVG stroke draw, and GSAP timeline choreography.

### Features at a Glance

- **Interactive Motion Viewport**: Real-time canvas with sub-pixel grid, zoom controls ($50\% \rightarrow 400\%$), drag-to-pan, and background atmosphere swatches (Void, Studio, Paper, CAD Blue, Ember).
- **Glyph Inspector Mode**: Hover over any letter to inspect live bounding boxes, dimensions, anchor coordinates, and SVG path IDs.
- **8 Curated Brand Styles**: Switch between Signature Core, Swiss Wireframe Spec, Cyberpunk Neon Pulse, Obsidian & Silver, Studio Warm Light, Frosted Glass Prism, Phosphor CRT, and CAD Blueprint.
- **Color & Glow Token Lab**: Granular control over stroke width, glow radius, and independent layer colors.
- **Animation Library Deck (Phase 1 Baseline)**: 10 structured animation specifications spanning Hero Reveals, Ambient Loops, Micro-Interactions, and Glitch FX, with live baseline test triggers.
- **Multi-Track Timeline & Scrubber**: Video-editor style playback bar with keyframe tracks for `WORD`, `LORD`, `TALL D`, and `MEDIA`, timecode counter, loop mode, and variable playback speed ($0.25\times \rightarrow 2.0\times$).
- **Zero-Dependency Exporter**: Instant copy and download of semantic SVG, modular CSS keyframes, GSAP 3 timelines, and JSON design tokens.

---

## 🧬 Vector Structure & Hierarchy

```
<svg viewBox="0 0 25 26">
├── #group-media-shadow   (Base dark extrusion layer for depth)
├── #group-word           (Line 1: Glyphs W, O, R)
├── #group-lord           (Line 2: Glyphs L, O, R)
├── #group-ligature       (Monolithic tall 'D' spanning Y: 0.1 to 15.7)
└── #group-media          (Line 3: Electric Red #FF4E2E — M, E, D, I, A)
```

The ligature `D` on the right acts as an architectural pillar unifying both rows (`WOR-D` and `LOR-D`), anchored above the high-energy `MEDIA` wordmark.

---

## 🎨 Curated Style Presets

| Preset | Aesthetic | Key Tokens |
|---|---|---|
| **Signature Core** | Brand default, obsidian dark luxury | White glyphs, `#FF4E2E` accent, matte dark `#090A0D` |
| **Swiss Wireframe** | Technical brutalism, architectural CAD | $0.3\text{px}$ vector outlines, transparent fills |
| **Cyberpunk Neon** | Kinetic glow, chromatic radiation | Multi-stop drop-shadow, high-vibrancy `#FF3366` |
| **Obsidian & Silver** | High-end luxury editorial | Platinum `#D1D5DB`, deep ruby red `#E11D48` |
| **Studio Warm Light** | Editorial print on cotton paper | Pitch black `#111215`, warm paper `#F4F4F7` |
| **Frosted Glass** | Prismatic depth & refraction | Translucent alpha fills, layered soft diffusion |
| **Phosphor CRT** | 90s broadcast oscilloscope | Emerald phosphor `#34D399` halo on `#04120F` |
| **CAD Blueprint** | Architectural engineering schematic | Cyan `#38BDF8` line art on cobalt `#091B33` |

---

## 🎬 Animation Library (Phase 1 Architecture)

### 1. Hero Reveals
- `01 // Monospace Typewriter Cascade`: High-velocity typographic stagger snapping into place. *(Base Live)*
- `02 // Neon Vector Wireframe Draw`: SVG `stroke-dashoffset` path tracing blooming into solid fills. *(Base Live)*
- `03 // Kinetic Ligature Clamp`: Opposing horizontal slides locking into the tall `D`. *(Base Live)*
- `04 // Liquid Mask Vertical Wipe`: Fluid vertical clip-path reveal. *(Phase 2 Spec)*

### 2. Ambient Loops & Idle States
- `05 // MEDIA Luminescence Breath`: Soft sinusoidal respiration loop on the red accent. *(Base Live)*
- `06 // Zero-G Weightless Drift`: Gentle floating physics with delicate multi-axis rotation. *(Base Live)*
- `07 // Specular Laser Sweep`: Diagonal $45^\circ$ specular gleam band. *(Phase 2 Spec)*
- `10 // Audio-Reactive BPM Pulse`: Equalizer bounce using the tall `D` as a VU pillar. *(Phase 2 Spec)*

### 3. Micro-Interactions & Outros
- `08 // Magnetic Cursor Spring`: Interactive pointer attraction with spring physics. *(Phase 2 Spec)*
- `09 // Cyber Glitch Dispersion`: Chromatic RGB split and matrix disruption. *(Base Live)*

---

## 🚀 Quick Start

Open `index.html` (or `wordlord-svg-animation-studio.html`) directly in any browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or serve locally with any static server:

```bash
npx serve .
# or
python3 -m http.server 3000
```

---

## 📦 Directory Structure

```
wordlord-svg-motion-studio/
├── index.html                           # Main studio entrypoint
├── wordlord-svg-animation-studio.html   # Named studio copy
├── assets/
│   ├── logo-v2.svg                      # Original raw SVG asset
│   └── wordlord-kinetic-logo.svg        # Clean SVG with semantic IDs & groups
├── README.md                            # Studio documentation
└── .gitignore                           # Git ignore rules
```

---

## 🛠️ Roadmap (Phase 2 Planning)

- [ ] **Timeline Keyframe Editor**: Interactive keyframe handles for dragging stagger points directly on the scrubber tracks.
- [ ] **SVG Morphing Engine**: Smooth vector deformation between the minimal wireframe and solid mark.
- [ ] **Web Audio Integration**: Real-time microphone/audio input driving dynamic frequency scaling on the ligature.
- [ ] **Lottie / Rive Exporter**: Direct JSON export for native iOS/Android and Flutter apps.

---

## 📄 License

MIT © [WordLord Media](https://wordlordmedia.com)
