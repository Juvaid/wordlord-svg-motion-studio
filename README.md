# WordLord Media // SVG Motion Architecture Studio & Kinetic Animation Deck

> **Professional Desktop-Grade Motion Graphics Suite for the WordLord Media Vector Identity**  
> *Built with React 19, TypeScript, Tailwind CSS, Lucide Icons, and Vite SingleFile*

![License](https://img.shields.io/badge/license-MIT-red.svg)
![Status](https://img.shields.io/badge/status-12_Live_Animations-emerald.svg)
![UI](https://img.shields.io/badge/UI-Desktop_NLE_Studio-orange.svg)
![Video](https://img.shields.io/badge/Video-60_FPS_MP4_Export-blue.svg)
![Glow](https://img.shields.io/badge/Glow-Unclipped_Volumetric_Aura-purple.svg)

---

## ⚡ Overview

**WordLord SVG Motion Studio v5.0** is an interactive, zero-dependency kinetic laboratory and animation specification engine engineered specifically for the **WordLord Media** logo (`25 × 26` sub-pixel vector mark).

The studio isolates individual typographic letterforms—including the monolithic tall `D` ligature connecting `WORD` and `LORD`, and the electric scarlet (`#FF4E2E`) `MEDIA` mark—allowing frame-accurate CSS keyframe choreography, SVG stroke drawing, interactive Bézier curve editing, real-time volumetric glow tuning, and 60 FPS MP4 video rendering right in your browser.

---

## 🚀 Quick Start

### 1. Run the Local Development Server
To launch the live studio locally with instant Hot Module Reloading (HMR):

```bash
git clone https://github.com/Juvaid/wordlord-svg-motion-studio.git
cd wordlord-svg-motion-studio
npm install
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

### 2. Standalone Single-File Distribution (Zero Server Required)
You can also open the compiled single-file bundle directly from your local filesystem without running any server:

```bash
open dist/index.html
# or
open wordlord-svg-animation-studio.html
```

### 3. Build for Production
Compiles all 1,914 modules into a standalone 388 kB offline HTML bundle:

```bash
npm run build
```

---

## 🎛️ Studio Architecture & Key Modules

| Panel | Description | Key Features |
|---|---|---|
| **Top Navigation** | Global canvas controls & quick exports | 40%–350% Zoom, 3 Stage Modes (Dark, Radial Spotlight, Grid), Rewind to 0s (`Home`), Replay (`R`), Export MP4 (`V`), Export Code (`E`). |
| **Creative Library** (Left) | Preset selection deck (Resizable 220–420px) | **12 Motion Presets**, **8 Optical Shader Styles**, and **17 Vector Mark Glyphs** with search and category filtering. |
| **Stage Viewport** (Center) | Hardware-accelerated vector canvas | Sub-pixel `25×26` mark rendered at `320×332px`, 3D Perspective Tilt (Pitch & Yaw `-35°` to `+35°`), Unclipped Volumetric Optical Bloom. |
| **Properties Inspector** (Right)| Collapsible tuning laboratory (Resizable 260–460px)| Motion Dynamics sliders, **Interactive Bézier Graph**, Volumetric Optics, 3D Tilt angles, **2x2 Brand Color Grid**, and Live CSS Manifest. |
| **Professional NLE Timeline** (Bottom)| Multi-track keyframing (Resizable 130–380px)| **6 Discrete Lanes**, Draggable laser playhead, Click-to-seek keyframe diamonds, Add Keyframe (`K`), Jump Keyframe (`J` / `Shift+J`), Speed multiplier ($0.25\times \rightarrow 2.0\times$). |

---

## 🎬 The 12 Live Motion Presets

| # | Preset Name | Category | Duration | Easing & Choreography |
|---|---|---|---|---|
| **01** | **Typewriter Cascade** | Reveal | 0.95s | `cubic-bezier(0.16, 1, 0.3, 1)` sequential 17-glyph snap reveal. |
| **02** | **Neon Wireframe Draw** | Kinetic | 1.40s | `cubic-bezier(0.25, 1, 0.5, 1)` vector path stroke tracing into solid fill. |
| **03** | **Ligature Monolith Lock** | Kinetic | 1.10s | Opposing horizontal translation clamped by vertical tall D monolith drop. |
| **04** | **Liquid Plasma Wipe** | Optics | 1.10s | Animated SVG polygon clip-path fluid downward displacement. |
| **05** | **Cinematic Depth Slam** | 3D | 0.85s | High-impact Z-scale slam from 2.2x with Gaussian lens focus pull. |
| **06** | **Origami Dimension Fold** | 3D | 1.20s | 90° 3D rotational perspective unfold with virtual lighting shifts. |
| **07** | **Cyberpunk Chroma Glitch**| Glitch | 0.75s | Quantized multi-slice RGB chromatic skew aberration. |
| **08** | **Volumetric Pulse Bloom** | Ambient | 2.20s | Continuous harmonic sine wave respiration breathing neon drop-shadows. |
| **09** | **Anamorphic Laser Sweep** | Optics | 1.35s | 45° diagonal specular gleam beam traversing the mark with additive blend. |
| **10** | **Kinetic Split & Lock** | Kinetic | 1.05s | Quadrant fly-in: WORD from north, LORD from south, MEDIA from below. |
| **11** | **Matrix Glyph Cascade** | Glitch | 1.30s | Phosphor green waterfall cascade dropping glyphs into baseline. |
| **12** | **Elastic Pop Harmonic** | Kinetic | 0.90s | Spring physics simulation scaling glyphs from 0.35x with settle bounce. |

---

## 🎥 60 FPS Hardware-Accelerated MP4 Video Exporter

Export production-ready video files directly from the browser:
- **Formats**: Hardware-encoded **MP4 (H.264)** with WebM fallback.
- **Resolution Options**:
  - `1920 × 1080` (1080p Full HD — 16:9)
  - `1080 × 1080` (1:1 Square Lockup — Instagram / Social)
  - `1280 × 720` (720p Fast Preview)
  - `3840 × 2160` (4K Ultra HD Cinema Master)
- **Real-Time Progress**: Live frame counter and progress percentage.
- **Embedded Player**: Immediate in-modal video playback review.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause playback |
| `0` / `Home` / `Esc` | **Rewind & Reset to 0:00 (Start)** |
| `R` | **Replay** animation from beginning |
| `V` | Open **Export MP4 Video** modal |
| `E` | Open **Export Code & Specs** modal |
| `J` | Jump to **previous keyframe** |
| `Shift + J` | Jump to **next keyframe** |
| `K` | **Add keyframe marker** at current playhead |
| `←` / `→` | Step **backward / forward 1 frame** (1/60s) |
| `End` | Jump to end of composition |
| `L` | Toggle **continuous loop** mode |
| `M` | Toggle **audio haptic clicks** |
| `1`, `2`, `3` | Switch stage background (Dark / Radial Spotlight / Grid) |
| `-` / `+` | Zoom canvas out / in |

---

## 📄 Complete Feature Specification

For detailed architectural analysis, vector coordinate references, and bug fix documentation, read [`FEATURES.md`](./FEATURES.md).

---

## 📄 License

MIT © [WordLord Media](https://wordlordmedia.com)
