# Features & Capabilities: WordLord SVG Motion Studio

WordLord SVG Motion Studio is a dual-engine (2D Kinetic Vector + 3D Extruded WebGL) motion graphics suite running directly in browser runtimes as a self-contained single-file desktop application.

---

## 1. Core Studio Modes

| Workspace | Engine | Primary Purpose | Export Formats |
| :--- | :--- | :--- | :--- |
| **2D Studio** (`activeMode === '2d'`) | SVG DOM + CSS / WAAPI + Double-buffered Canvas | Sub-pixel kinetic typography, glowing ligatures, stroke animations, easing curation | MP4 (H.264), WebM, SVG Snapshot, JSON Project |
| **3D Studio** (`activeMode === '3d'`) | Three.js r186 + WebGL + Custom Procedural Shaders | Volumetric bevel extrusion, part decomposition, PBR lighting, procedural textures | WebM (60fps), GLTF / GLB, PNG Sequences, JSON Project |

---

## 2. 2D Kinetic Vector Motion Engine

### Motion Presets (`src/data/motions.ts`)
12 choreographed kinetic presets with customizable duration (0.5s – 10.0s), looping, and reverse playback:
- **Liquid Morph**: Organic fluid morphing with elastic overshoot.
- **Cinematic Drift**: Slow anamorphic pan and subtle depth scale.
- **Pulse Rhythm**: Cardiac rhythmic scale impulses with optical glow flash.
- **Glitch Shock**: High-frequency coordinate displacements with RGB channel offsets.
- **Strobe Reveal**: High-contrast strobe flashing through path alpha.
- **Echo Wave**: Cascading clone wave with delayed phase offsets.
- **Magnetic Snap**: Sharp spring snapping into grid alignment.
- **Breathe**: Ambient meditative expansion and contraction.
- **Neon Flicker**: Authentic gas-tube startup arc with random voltage drops.
- **Vortex Spin**: Rotational vortex acceleration with centripetal decay.
- **Elastic Bounce**: Heavy mass physics drop with multi-bounce settling.
- **Letter Stagger**: Sequential glyph-by-glyph cascade animation.

### Optical Shader Styles (`src/data/styles.ts`)
8 studio visual treatments:
- **Obsidian Crimson**: Studio signature — deep void `#07080c`, hot laser crimson `#ff4e2e`, cyan accent.
- **Cyberpunk Neon**: High-contrast ultraviolet, electric cyan, hot magenta.
- **Monochrome Luxe**: Architectural titanium, matte graphite, stark white.
- **Solar Flare**: Molten gold, amber flare, solar white core.
- **Toxic Emerald**: Phosphor green, radio-luminescent accents, dark slate.
- **Deep Cosmos**: Galactic indigo, nebula violet, stellar cyan.
- **Retro Sunset**: 80s synthwave orange, hot violet, chrome gold.
- **Ghost Wireframe**: Technical blueprint, razor-thin luminous stroke, dark field.

### Vector Glyph Track Decomposition
Direct access to WordLord mark sub-components:
- `track-w-left`: Left diagonal stem of W.
- `track-w-mid`: Center vertex of W.
- `track-w-right`: Right ascending stem of W.
- `track-o-outer`: Geometric circular ring of O.
- `track-r-stem`: Vertical stem of R.
- `track-r-loop`: Upper counter-bowl of R.
- `track-d-stem`: Structural vertical stem of D.
- `track-d-bowl`: Volumetric counter-curve of D.
- `track-ligature-d`: Iconic monolithic ligature tall-D glyph.
- `track-media-word`: Micro-typography sub-brand lockup.
- `track-glow-field`: Direct volumetric optical SVG filter layer.

---

## 3. 3D Extruded Studio Engine

### SVG Path Decomposition & Tessellation (`src/utils/threeEngine.ts`)
- Automatically analyzes incoming SVG paths and separates them into logical components (`stemW`, `crestW`, `spineR`, `ringO`, `monolithicD`, `mediaSubbrand`).
- Applies `THREE.ExtrudeGeometry` with configurable:
  - `depth`: Extrusion thickness (0.1 – 5.0).
  - `bevelEnabled`: True/False toggle.
  - `bevelThickness`: Front/back bevel offset (0.01 – 0.5).
  - `bevelSize`: Lateral bevel chamfer (0.01 – 0.5).
  - `bevelSegments`: Rounding quality (1 – 8).
  - `curveSegments`: Radial path subdivision (6 – 32).

### Materials & Procedural Surface Textures
Supports standard PBR parameters: `metalness` (0–1), `roughness` (0–1), `clearcoat` (0–1), `clearcoatRoughness`, `transmission` (glass), `ior` (index of refraction 1.0–2.33), `reflectivity`.
Procedural bump/roughness maps generated on-the-fly:
- **Fluted / Ribbed Glass**: Vertical micro-groove refraction.
- **Brushed Titanium**: Anisotropic fine horizontal grain.
- **Carbon Fibre**: Orthogonal woven composite matrix.
- **Diamond Knurl**: Industrial cross-hatch grip knurling.
- **Subtle Surface Noise**: Micro-organic particulate scattering.

### Studio Lighting Rig
- **Key Light**: High-intensity directional source with polar coordinates (`azimuth`, `elevation`, `intensity`, `color`).
- **Fill Light**: Soft counter-balancing fill to lift shadow detail.
- **Rim / Backlight**: Sharp grazing edge highlight for cinematic contour separation.
- **Ambient Light**: Minimum floor illumination with HDRI-like tone mapping.

### Post-Processing & Optics
- **UnrealBloomPass**: Luminance threshold, bloom strength, and kernel radius for organic light spills.
- **Film Grain & Vignette**: Studio analog emulation with dark border falloff.
- **Tone Mapping**: ACESFilmic, Reinhard, Cineon, or Linear curves with exposure bias.

### Collective Asset Grouping & Blender N-Panel
- **Group Lock & Visibility**: Isolate or safeguard imported assets.
- **Euler Transforms**: Numeric Position `(X, Y, Z)`, Rotation `(X, Y, Z)` in degrees, Scale `(X, Y, Z)`.
- **Uniform Scale Lock**: Linked aspect-ratio scaling across all axes.
- **Per-Part Inspector**: Click-to-select individual 3D parts via raycasting with specular white pick confirmation.

---

## 4. Navigation & Viewport Controls

### 2D Viewport
- **Tool Switcher**:
  - `V`: **Select Tool** (default) — stage is anchor-locked, zero accidental canvas movement.
  - `H`: **Hand Tool** — click and drag moves canvas freely.
- **Pan Triggers**: Middle-click drag, `Space` + Left-click drag, `Alt` + Left-click drag, Hand tool drag.
- **Zoom Triggers**: Mouse wheel / trackpad pinch, floating Zoom In/Out buttons, percentage readout (40% – 350%).
- **Viewport Reset**: 1-click **Center (`Cmd+0` / `Alt+0`)** restores zoom to 100% and pan to `(0, 0)`.
- **Pointer Capture**: Native browser `setPointerCapture` prevents cursor drag sticking outside the viewport.

### 3D Viewport
- **OrbitControls**: Left-drag to rotate orbit, Right-drag to pan camera, Scroll to dolly zoom.
- **Cursor Gyro Tracking**: Disabled by default; user can explicitly toggle in Effect Stacking for interactive presentation demos.
- **Camera Presets**: Front (`1`), Top (`7`), Right (`3`), Isometric (`5`), Reset View (`Home`).
- **Social Framing Overlays**: 16:9 Landscape, 9:16 Vertical Story/Reels, 1:1 Square Post, 21:9 Ultra-wide.

---

## 5. Animation, Timeline & Keyframing

- **Double-Buffered Sequencer**: High-precision RAF playback synchronized across 2D CSS/DOM and 3D WebGL meshes.
- **Transport Controls**: Play/Pause (`Space`), Rewind (`Home`), Step Forward/Backward (`←`/`→`), Loop Toggle (`L`).
- **Interactive Bézier Curve Editor**: Visual cubic-bezier control point handles (`P1`, `P2`) with instant preset saving.
- **Effect Stacking**: Combine multiple kinetic effects (Turntable Spin, Harmonic Wave, Light Sweep, Gyro Tilt).

---

## 6. Rendering & Export Engine

| Format | Resolution | Frame Rate | Engine Pipeline |
| :--- | :--- | :--- | :--- |
| **MP4 (H.264)** | 1080p / 4K / Custom | 30 / 60 FPS | Double-buffered offscreen Canvas rendering + WebCodecs / MediaRecorder |
| **WebM (VP9)** | 1080p / 4K / Custom | 30 / 60 FPS | Direct WebGL canvas stream capture |
| **GLTF / GLB** | 3D Asset | Static / Rigged | `THREE.GLTFExporter` with materials, textures, and embedded lights |
| **SVG Vector** | Infinite Vector | Static Snapshot | DOM serialization with clean styling attributes |
| **Project JSON** | Configuration | Instant | Full state serialization including undo stacks and custom settings |
