# Issue Tracker & Resolution Log — WordLord SVG Motion Studio

> **Project Version**: 5.0.0  
> **Status**: Active & Maintained  
> **Testing Suite**: `npm test` (`scripts/test-suite.js`) — 9 Suites, 0 Failures  
> **Compiler Gate**: `npx tsc --noEmit` — 0 Errors  

---

## 1. Issue Registry Table

| Issue ID | Category | Severity | Title | Status | Resolved In |
|---|---|---|---|---|---|
| **ISS-001** | 3D Playback | Critical | Stale Closure in 3D Animation Playback Loop (`ThreeStageViewport.tsx`) | **RESOLVED** | `19d3d1d` |
| **ISS-002** | 3D Timeline | High | 3D Motion Evaluation Skipped When Paused or Scrubbed | **RESOLVED** | `19d3d1d` |
| **ISS-003** | Video Export | Critical | Non-Deterministic 3D Video Export Producing Still Frames | **RESOLVED** | `5f656f9` |
| **ISS-004** | Architecture | High | Asymmetric 2D vs 3D Motion Library & Missing Bidirectional Sync | **RESOLVED** | `19d3d1d` |
| **ISS-005** | SVG Parsing | Medium | `<polygon>` and `<ellipse>` Tags Ignored by SVGLoader Decomposer | **RESOLVED** | Working Tree |
| **ISS-006** | 3D Geometry | Medium | Non-Finite Normalization Bounds Causing `NaN` Mesh Vertices | **RESOLVED** | Working Tree |
| **ISS-007** | Persistence | Medium | Project State Deserialization Missing Schema Validation & Sanitization | **RESOLVED** | Working Tree |
| **ISS-008** | Concurrency | High | Viewport RAF Loop Race Condition with MediaRecorder Stream Capture | **RESOLVED** | `5f656f9` |
| **ISS-009** | UX / Navigation | Low | Gyro Cursor Tracking Active by Default Causing Accidental Follow | **RESOLVED** | `46269ba` |
| **ISS-010** | UX / Ergonomics | Medium | High Cognitive Load in Inspector Due to Lack of Express Presets | **RESOLVED** | Working Tree |
| **ISS-011** | Asset Ecosystem | Medium | Lack of Universal Vector Asset Ingestion & Single-Logo Limitation | **RESOLVED** | Working Tree |
| **ISS-012** | Inspector & Motion | Medium | Properties Search Bar & Kinetic Motion Library Expansion | **RESOLVED** | Working Tree |
| **ISS-013** | 2D Optics / 3D Tilt | Critical | 3D Spatial Perspective Pixelation Due to Blink Non-Affine Filter Fallback | **RESOLVED** | Working Tree |
| **ISS-014** | Inspector & Optics | High | Monolithic Hardcoded Glow Target & Missing Section Focus Selection | **RESOLVED** | Working Tree |
| **ISS-015** | Undo / Redo History | High | Parameter Dragging & Color Picking Bypassing History Undo Stack | **RESOLVED** | Working Tree |
| **ISS-016** | 3D Environment | High | 3D Lighting Rig Orientation & Blender Camera Navigation Controls | **RESOLVED** | Working Tree |
| **ISS-017** | 3D Camera & Export | Critical | Camera Distance Synchronization, Spherical Framing Controls & Autonomous Trajectories | **RESOLVED** | Working Tree |
| **ISS-018** | Architecture & Assets | High | Persistent User Vector Asset Bank & Universal 2D/3D Multi-Part Dynamic Animation Engine | **RESOLVED** | Working Tree |
| **ISS-019** | 3D Viewport & Framing | Critical | Viewport Camera Distance Clamping, Stale Closure Elimination & Advanced Export Framing Controls | **RESOLVED** | Working Tree |

---

## 2. In-Depth Root Cause Analyses & Resolutions

### ISS-001: Stale Closure in 3D Animation Playback Loop
* **Location**: `src/components/ThreeStageViewport.tsx`
* **Symptom**: Clicking Play in the 3D studio did not animate the extruded typography. Time stayed frozen or reset repeatedly to `0`.
* **Root Cause**: `renderLoop` was defined inside a `useEffect` that captured `config.time` without updating its reference across frames. Since `config.time` was captured as `0`, every frame calculated `newTime = 0 + deltaSec * speed`, effectively pinning the playback playhead to frame 1.
* **Resolution**:
  - Introduced mutable React synchronization refs (`timeRef`, `isPlayingRef`, `speedRef`, `durationRef`, `workAreaRef`, `motionModeRef`, `amplitudeRef`, `onUpdateConfigRef`).
  - Playback time is accumulated directly into `timeRef.current += deltaSec * speedRef.current`.
  - Dispatched `onUpdateConfigRef.current({ time: newTime })` asynchronously without tearing down the RAF loop.

---

### ISS-002: 3D Motion Evaluation Skipped When Paused or Scrubbed
* **Location**: `src/components/ThreeStageViewport.tsx`
* **Symptom**: Dragging the timeline playhead or stepping forward/backward in 3D mode did not update the 3D meshes in the viewport.
* **Root Cause**: The call to `evaluate3DMotion` was guarded inside `if (config.isPlaying) { ... }`. When playback was paused (or during interactive mouse scrubbing), `evaluate3DMotion` was bypassed entirely.
* **Resolution**:
  - Extracted `evaluate3DMotion` out of the `isPlaying` branch into the top level of the render frame.
  - Mesh kinematics are evaluated on **every frame** based on `normalizedTime = timeRef.current / duration`.
  - Scrubbing and stepping now immediately translate, rotate, and deform all meshes in real time at 60 FPS.

---

### ISS-003: Non-Deterministic 3D Video Export Producing Still Frames
* **Location**: `src/components/ThreeExportModal.tsx`
* **Symptom**: Downloaded MP4/WebM video from the 3D studio was 5 seconds of a static, unmoving image (`wordlord-3d-reveal-5s-1080x1920-10mbps.mp4`).
* **Root Cause**:
  1. `handleRecordVideo` started `MediaRecorder(canvas.captureStream(fps))` and simply put the JavaScript thread to sleep using `setTimeout(totalDurationMs)`.
  2. Because opening any modal paused the studio (`isPlaying: false`), `ThreeStageViewport.tsx` never advanced the timeline.
  3. No frame-stepping mechanism existed between the export modal and the WebGL renderer.
* **Resolution**:
  - Built a deterministic frame-by-frame rendering pipeline.
  - Exposed `(window as any).__THREE_RENDER_FRAME__(normalizedTime)` from the viewport.
  - `handleRecordVideo` now iterates through every discrete frame $f \in [0, \text{totalFrames} - 1]$:
    ```ts
    for (let f = 0; f < totalFrames; f++) {
      const normT = totalFrames > 1 ? f / (totalFrames - 1) : 0;
      renderThreeFrame(normT);
      if (videoTrack?.requestFrame) videoTrack.requestFrame();
      const expectedElapsedMs = (f + 1) * frameIntervalMs;
      const actualElapsedMs = performance.now() - startTime;
      const remainingWaitMs = Math.max(0, expectedElapsedMs - actualElapsedMs);
      if (remainingWaitMs > 0) await new Promise(r => setTimeout(r, remainingWaitMs));
      setRecordProgress(Math.min(100, Math.round(((f + 1) / totalFrames) * 100)));
    }
    ```
  - The MediaRecorder receives every single frame with precise timestamps and zero dropped frames.

---

### ISS-004: Asymmetric 2D vs 3D Motion Library & Missing Bidirectional Sync
* **Location**: `src/types/threeStudio.ts`, `src/utils/threeEngine.ts`, `src/components/ThreeLeftLibrary.tsx`, `src/App.tsx`
* **Symptom**: The 2D studio had 12 kinetic motion presets (Typewriter, Depth Slam, Ligature Lock, Origami, Wiredraw, Liquid Wipe, etc.), but the 3D studio only had 6 generic spatial engines. Switching between 2D and 3D disconnected the motion settings.
* **Root Cause**: `evaluate3DMotion` only had switch cases for 6 spatial modes. When a 2D motion was active in 3D, it hit `default` and did nothing.
* **Resolution**:
  - Implemented full 3D physics transforms for all 2D kinetic presets in `evaluate3DMotion` (Z-depth slams, opposing X ligature clamps with Y drops, 90° origami rotational unfolds, fluid liquid wipes, and quantized chroma glitches).
  - Streamlined `ThreeLeftLibrary.tsx` with two organized groups: "Spatial 3D Engines" and "Kinetic Vector Motions".
  - Implemented `handleSetStudioMode` in `App.tsx` for seamless bidirectional switching:
    - **2D $\rightarrow$ 3D**: Transfers active preset, duration, playhead ratio, playback state, and material colors.
    - **3D $\rightarrow$ 2D**: Maps kinetic preset back to 2D, matches duration, and scrubs playhead to exact progress timestamp.
  - Added cross-modal export buttons: "Switch to 3D Extruded Export" in 2D modal and "Switch to 2D Vector Export" in 3D modal.

---

### ISS-005: `<polygon>` and `<ellipse>` Tags Ignored by SVGLoader Decomposer
* **Location**: `src/utils/threeEngine.ts` (`parseSvgIntoParts`)
* **Symptom**: Importing custom SVGs containing `<polygon>` (geometric monograms, stars, badges) or `<ellipse>` elements omitted those parts from extrusion.
* **Root Cause**: `querySelectorAll('path, rect, circle, polygon, ellipse')` selected them, but the switch statement only checked `path`, `rect`, and `circle`.
* **Resolution**:
  - Added polygon point parser converting `points="x1,y1 x2,y2..."` into standard SVG path `M x1 y1 L x2 y2 ... Z`.
  - Added ellipse parser converting `cx, cy, rx, ry` into dual continuous Bézier/arc commands `M cx-rx,cy a rx,ry 0 1,0 2rx,0 a rx,ry 0 1,0 -2rx,0`.

---

### ISS-006: Non-Finite Normalization Bounds Causing `NaN` Mesh Vertices
* **Location**: `src/utils/threeEngine.ts` (`buildExtrudedParts`)
* **Symptom**: Empty SVG paths or non-standard SVG coordinate data caused `minX`/`maxX` to stay at $\pm\infty$, leading to `NaN` scales and rendering blank screens.
* **Root Cause**: `minX` started at `Infinity` and `maxX` at `-Infinity`. If no points were sampled, `Math.max(1, maxX - minX)` evaluated to `NaN`.
* **Resolution**:
  - Added finite safety guard:
    ```ts
    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
      minX = -100; maxX = 100; minY = -100; maxY = 100;
    }
    ```

---

### ISS-007: Project State Deserialization Missing Schema Validation
* **Location**: `src/utils/projectState.ts`
* **Symptom**: Loading an older v4 project JSON file or corrupted `localStorage` state caused runtime errors due to missing fields.
* **Root Cause**: `JSON.parse` output was type-cast directly as `ProjectStateSnapshot` without field validation or fallback assignment.
* **Resolution**:
  - Created `validateProjectSnapshot(data: any): ProjectStateSnapshot`.
  - Enforces safe defaults for all fields (`studioMode`, `activeMotionId`, `duration`, `colors`, `geometryMode`, `threeConfig`, `threeParts`).
  - Wrapped `loadProjectFromStorage()` and `importProjectFromFile()` with automatic sanitization.

---

### ISS-008: Viewport RAF Loop Race Condition with MediaRecorder
* **Location**: `src/components/ThreeStageViewport.tsx`
* **Symptom**: While recording a 4K or 1080p 3D video, the viewport's regular RAF loop continued running in the background, racing against the recording render loop and occasionally causing double-render jitter.
* **Root Cause**: `renderLoop` had no knowledge that an export capture session was active.
* **Resolution**:
  - Added `(window as any).__THREE_IS_RECORDING__` global synchronization flag.
  - `renderLoop` immediately returns early while recording is active, giving the deterministic exporter exclusive control of the WebGL canvas.

---

### ISS-010: Complex Inspector Density Overwhelming New Users (Two-Tier UI Workflow)
* **Location**: `src/components/TopNavbar.tsx`, `src/components/RightInspector.tsx`, `src/components/ThreeRightInspector.tsx`, `src/App.tsx`
* **Symptom**: New users were intimidated by 20+ sliders for Bézier handles, micro-stagger milliseconds, and physical optics matrices when all they wanted was to pick a style, preview an asset, and export.
* **Root Cause**: Flat, unstratified UI architecture exposing all granular engineering knobs at the same priority level.
* **Resolution**:
  - Implemented a two-tier studio workflow toggle: **Quick Presets / Express** mode vs. **Advanced Studio / Pro Inspector** mode.
  - Added Quick Presets segmented toggle in `TopNavbar`.
  - Built dedicated Express inspectors for both 2D and 3D featuring 1-click aesthetic chips, speed multiplier pills (`0.5x`, `1.0x`, `1.5x`, `2.0x`), active asset switcher, and 1-click video and code exports.
  - Preserved the full granular multi-section inspector in Pro Studio mode.

---

### ISS-011: Lack of Universal Vector Asset Ingestion & Single-Logo Limitation
* **Location**: `src/data/assetLibrary.ts`, `src/components/StageViewport.tsx`, `src/components/ThreeStageViewport.tsx`, `src/components/LeftLibrary.tsx`, `src/components/ThreeLeftLibrary.tsx`
* **Symptom**: Users could only animate the hardcoded WordLord logo unless they knew how to modify source code; drag-and-dropping an `.svg` file onto the stage was unsupported.
* **Root Cause**: Hardcoded vector paths and fixed viewBox without a unified vector asset ingestion pipeline or asset catalog.
* **Resolution**:
  - Created `src/data/assetLibrary.ts` with 27 curated production vector assets across Tech Brands (Apple, Google, React, Vite, Linear, GitHub, Vercel, TypeScript), UI Micro-Interactions (Checkmark, Bell, Heart, Rocket, Shield, Flame, Lightning, Compass, Gem, Globe), and Geometric Monograms.
  - Implemented drag-and-drop `.svg` ingestion on both 2D and 3D viewports with visual glowing dropzones.
  - Implemented dynamic viewBox calculation and responsive sizing so custom SVGs render without clipping or distortion.
  - Added 4th `Assets (27)` tab in Left Library with real-time search, category filters, and 1-click Hero Combos.

---

### ISS-012: Properties Inspector Category Tabs Redundancy & Kinetic Motion Expansion
* **Location**: `src/components/RightInspector.tsx`, `src/components/ThreeRightInspector.tsx`, `src/data/motions.ts`, `src/index.css`, `src/utils/threeEngine.ts`
* **Symptom**:
  1. Horizontal category tabs (`[All] [Timing] [Optics] [3D] [Palette] [Code]`) consumed unnecessary vertical height, hid relevant controls in other sections, and forced users to click tabs repeatedly to find specific sliders (glow, duration, tilt, colors).
  2. The motion graphics library was limited to 12 presets, leaving advanced animations (vortices, neon breathing, magnetic snapping, Venetian louvers, sine waves, velocity streaks) unavailable.
* **Root Cause**:
  1. Tabs enforced mutually exclusive visibility instead of enabling quick keyword search and auto-expansion across sections.
  2. Lack of procedural 2D CSS keyframes and matching 3D kinematics for high-energy motion design.
* **Resolution**:
  - Replaced the category tabs in `RightInspector.tsx` with a responsive real-time property search bar (`Search`, `X` clear button, `Esc` keyboard shortcut, and match count badge).
  - Implemented semantic keyword matching (`SECTION_METADATA` and `THREE_SECTION_KEYWORDS`) so queries like "glow", "bloom", "tilt", "depth", "roughness", "delay", or "stagger" filter and auto-expand matching accordion sections.
  - Added identical property search and 1-click JSON clipboard rig transfer (`handleCopy3DConfig` / `handlePaste3DConfig`) to `ThreeRightInspector.tsx`.
  - Added 6 new production-grade kinetic motion presets (expanding the library from 12 to 18 presets):
    1. `vortex-spin`: Hypnotic Vortex Spiral ($720^\circ$ angular velocity spiral collapse).
    2. `neon-breathe`: Cyberpunk Neon Shimmer (bioluminescent dual-hue phosphor resonance).
    3. `magnetic-snap`: Magnetic Zero-G Snap (anti-gravity dispersion with high-tension electromagnetic snap).
    4. `slice-blind`: Shutter Blind Venetian (mechanical $90^\circ$ alternating raster louver blinds).
    5. `wave-flow`: Fluid Kinetic Sine Wave (sinusoidal undulating crest-and-trough wave ripple).
    6. `velocity-drift`: Supersonic Velocity Streaks (extreme lateral speed blur lines settling with skew decay).
  - Implemented 60 FPS CSS keyframes with `.custom-part-glyph` fallback for custom SVG uploads.
  - Implemented WebGL evaluation branches in `evaluate3DMotion` for all 6 new presets.

---

### ISS-013: 3D Spatial Perspective Pixelation Due to Blink Non-Affine Filter Fallback
* **Location**: `src/components/StageViewport.tsx`
* **Symptom**: In the 2D Vector Mark Studio, adding even 1 degree of 3D spatial perspective (`tiltX`, `tiltY`) caused the logo "MEDIA" sub-brand to pixelate into giant rectangular pixel blocks (resembling an 8-bit mosaic).
* **Root Cause**:
  1. The SVG root had a viewBox of `0 0 25 26`.
  2. When CSS 3D transforms (`perspective(800px) rotateX(...) rotateY(...)`) were applied directly to the `<svg id="main-stage-svg">` element, Chromium/Blink's SVG rendering pipeline (`RenderSVGResourceFilter`) encountered a non-affine transformation matrix.
  3. Blink cannot compute a 2D affine scale from a 3D projection matrix. Consequently, it logs a non-affine transform fallback warning and allocates a tiny off-screen rasterization buffer in unscaled user units ($25 \times 26$ pixels).
  4. The SVG `<feGaussianBlur>` filter inside `<filter id="unclipped-media-glow">` rasterized the MEDIA glyphs at $25 \times 26$ resolution. The browser then GPU-upscaled that 25-pixel buffer $13\times$ to fit the 320px viewport, producing coarse, giant pixel blocks.
* **Resolution**:
  - Decoupled 3D perspective from the SVG DOM element: created an outer `#stage-3d-perspective-rig` (`perspective: 1200px`) and `#stage-3d-gimbal` (`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`), allowing `<svg>` to retain pure vector geometry (`shapeRendering: geometricPrecision`).
  - Replaced the user-space SVG filter with a multi-tier hardware-accelerated CSS `drop-shadow` aura (`getGlowFilter`). CSS `drop-shadow` is computed in device/screen pixels and maintains sharp vector fidelity under arbitrary 3D angles without buffer downsampling.

---

### ISS-014: Monolithic Hardcoded Glow Target & Missing Section Focus Selection
* **Location**: `src/components/RightInspector.tsx`, `src/components/StageViewport.tsx`, `src/types.ts`, `src/utils/videoExporter.ts`
* **Symptom**: The optical aura bloom was hardcoded exclusively to the MEDIA glyphs. Users could not apply glow to WORD, LORD, TALL D, or custom SVG parts, and there was no way to select individual sections interactively.
* **Root Cause**:
  1. `StageViewport.tsx` only applied the glow filter to `<g id="group-media">`.
  2. No state variable existed for targeting individual glyph groups or user selections.
  3. No click event handlers were attached to glyph groups on the 2D stage.
* **Resolution**:
  - Added `GlowTarget = 'all' | 'media' | 'word' | 'lord' | 'ligature' | 'selected'` to `StudioState` and project snapshots.
  - Implemented interactive canvas selection: clicking any vector group on the 2D stage highlights that section with a dashed focus indicator and updates `selectedSection`.
  - Added a segmented `Glow Target Mark` selector in Section 3 ("Optics") and interactive section focus chips (`[ WORD ] [ LORD ] [ TALL D ] [ MEDIA ]`) with active swatch rings in Section 5 ("Brand Palette").
  - Updated both double-buffered 2D canvas video export and live SVG preview to faithfully render glow on the configured target layer.

---

### ISS-015: Parameter Dragging & Color Picking Bypassing History Undo Stack
* **Location**: `src/App.tsx`
* **Symptom**: Tweaking colors via color pickers or scrubbing sliders in the Right Inspector did not record history states, making it impossible to undo (`Cmd+Z`) color changes or slider adjustments.
* **Root Cause**:
  1. Calling `pushUndoSnapshot` on every `onChange` event during slider dragging flooded the 60-step undo stack with hundreds of tiny intermediate values.
  2. To avoid flooding, slider and color callbacks bypassed the undo stack entirely, leaving them untracked.
* **Resolution**:
  - Implemented `recordContinuousTweak(actionName)` with an intelligent pre-edit debounced session lock (600ms):
    - On the very first touch/scrub of a slider or color picker, it immediately captures the pre-edit snapshot before any modification occurs.
    - Live slider drags and color updates fire smoothly at 60 FPS without pushing redundant frames.
    - 600ms after the user releases the slider or picker, the session lock resets.
    - A single press of `Cmd+Z` instantly reverts the entire scrub or color adjustment to its original value.
  - Wired `recordContinuousTweak` into all 2D and 3D parameter handlers (`duration`, `stagger`, `strokeWidth`, `tiltX`, `tiltY`, `glowRadius`, `glowIntensity`, `palette colors`, and `handleUpdateThreeConfig`).

---

### ISS-016: 3D Studio Lighting Rig Orientation & Blender Camera Navigation Controls
* **Location**: `src/components/ThreeStageViewport.tsx`, `src/components/ThreeRightInspector.tsx`, `src/types/threeStudio.ts`
* **Symptom**: In the 3D studio, lighting was statically locked relative to the world origin with no control over rig azimuth or pitch. There was no toggle between fixed camera framing and free exploration, and no camera position readouts.
* **Root Cause**:
  1. Key, Fill, and Rim lights had hardcoded Cartesian coordinates in `threeEngine.ts`.
  2. Camera mode was implicitly free orbit with no camera view lock or Blender-standard numpad shortcuts.
* **Resolution**:
  - Added spherical azimuth ($0^\circ$–$360^\circ$) and pitch elevation ($10^\circ$–$80^\circ$) rotation controls for the 3-point studio lighting rig (`computeLightPositions`).
  - Added quick-direction chips in Section 8: `Front 0°` (direct front-face illumination), `Right 45°`, `Side 90°`, and `Back 180°`.
  - Added environment HDR map azimuth rotation slider ($0^\circ$–$360^\circ$).
  - Added camera view mode switcher (`camera` vs `free`) and exact Cartesian coordinates (`cameraPosX`, `cameraPosY`, `cameraPosZ`) in Section 5.
  - Implemented Blender-standard keyboard shortcuts in the 3D viewport:
    - `0` / `Numpad 0`: Toggle Camera View vs Free Orbit
    - `1` / `Numpad 1`: Front Ortho/Perspective View
    - `3` / `Numpad 3`: Right Profile View
    - `7` / `Numpad 7`: Top Down Aerial View
    - `[` / `]`: Rotate lighting rig azimuth in $15^\circ$ increments
  - Added floating HUD controls for Camera/Free toggle and live sun azimuth angle on the 3D stage.

---

### ISS-017: Camera Distance Synchronization, Spherical Framing Controls & Autonomous Trajectories
* **Location**: `src/components/ThreeStageViewport.tsx`, `src/components/ThreeRightInspector.tsx`, `src/components/ThreeExportModal.tsx`, `src/utils/threeEngine.ts`.
* **Symptom**: Camera framing in newly added camera animations was uncomfortably close and clipped wide typography marks; adjusting the `cameraDistance` slider in the inspector failed to update the camera if the user had touched the viewport; no granular controls existed for camera elevation (pitch tilt), azimuth (orbit), vertical height (up/down), or pre-export framing adjustments.
* **Root Cause**:
  1. `config.cameraDistance` was missing from the dependency array of the camera synchronization `useEffect` in `ThreeStageViewport.tsx`, preventing updates when dragging the distance slider.
  2. The position update in `ThreeStageViewport.tsx` was strictly guarded by `if (config.cameraViewMode === 'camera')`. When the user clicked or dragged inside the canvas, `OrbitControls.start` dispatched a switch to `'free'` mode, which permanently ignored slider inputs.
  3. In free orbit mode, `OrbitControls.update()` computes camera coordinates from its internal spherical angles, ignoring direct Cartesian sets unless the camera-to-target offset vector length is scaled explicitly:
     ```ts
     const offset = camera.position.clone().sub(controls.target);
     offset.setLength(targetDist);
     camera.position.copy(controls.target).add(offset);
     controls.update();
     ```
  4. Base camera distances in `threeEngine.ts` were hardcoded to 380–420px, causing multi-letter marks with bevels to clip at the frame edges on 16:9, 1:1, and 9:16 aspect ratios.
* **Resolution**:
  - Implemented unified spherical coordinate positioning `(dist, azimuth, elevation, posX, posY, posZ)` in `ThreeStageViewport.tsx` and tracked all camera properties in the `useEffect` dependency array.
  - Implemented seamless distance scaling in Free Orbit mode (`offset.setLength(targetDist)`), ensuring the distance slider functions reliably across both Camera Mode and Free Orbit mode.
  - Increased base camera distance from cramped 420px to **560px**, scaling all 7 camera trajectories directly with `config.cameraDistance`.
  - Expanded Section 5 ("Camera Optics & Framing") in `ThreeRightInspector.tsx`:
    - **Camera Distance** slider ($180$–$1200\text{px}$) with quick chips: `Tight 380px`, `Hero 560px`, `Wide 740px`, `Cinema 960px`.
    - **Camera Pitch Tilt (Elevation)** slider ($-45^\circ$ to $+75^\circ$) with quick chips: `Low -15°`, `Level 0°`, `High +25°`, `Top +60°`.
    - **Camera Orbit Rotation (Azimuth)** slider ($-180^\circ$ to $+180^\circ$) with quick chips: `Front 0°`, `3/4 R +45°`, `Side +90°`, `3/4 L -45°`.
    - **Camera Height (Up / Down)** slider ($-250\text{px}$ to $+250\text{px}$) with quick chips: `Floor -80px`, `Center 0px`, `Sky +80px`.
    - **Dutch Angle (Roll)** slider ($-30^\circ$ to $+30^\circ$) and **Lens FOV** slider ($20^\circ$ to $85^\circ$).
    - **Autonomous Camera Flight Trajectory** 8-option grid with Lucide icons: `Static`, `Orbit`, `Dolly`, `Crane`, `Spiral`, `Pan`, `Rise`, `Shake`.
  - Added live **Camera & Framing Controls** cards to `ThreeExportModal.tsx` in both the 60 FPS Video Export and 4K PNG Snapshot tabs, with direct `onUpdateConfig` synchronization and framing reset.
  - Locked static camera framing inside `evaluate3DMotion` so that frame-by-frame video rendering accurately captures the exact user-configured distance, tilt, and height.

---

### ISS-018: Persistent User Vector Asset Bank & Universal 2D/3D Multi-Part Dynamic Animation Engine
* **Location**: `src/utils/userAssetStore.ts`, `src/hooks/useUserAssetBank.ts`, `src/hooks/useStudioHistory.ts`, `src/components/CustomSvgModal.tsx`, `src/components/ThreeLeftLibrary.tsx`, `src/index.css`, `src/App.tsx`
* **Symptom**: 
  1. Imported custom SVGs were stored only in a single ephemeral `useState` variable in `App.tsx`. Reloading the page or switching presets erased custom marks.
  2. In 2D mode, custom SVGs only rendered static glyphs because 2D CSS keyframe selectors exclusively targeted `#group-word` and `#group-lord`.
  3. `App.tsx` had grown into an oversized file with 200+ lines of inline undo/redo history logic.
* **Root Cause**:
  - Lack of persistent, typed vector asset storage in `localStorage`.
  - CSS keyframes for 2D presets lacked universal multi-part selectors (`.custom-part-glyph`) with nth-child stagger.
* **Resolution**:
  - Implemented typed persistent store `src/utils/userAssetStore.ts` under key `WORDLORD_USER_ASSET_BANK_V1` with methods `getUserAssets`, `saveUserAsset`, `deleteUserAsset`, `getCombinedAssets`, `exportUserAssetsJson`, and `importUserAssetsJson`.
  - Upgraded `CustomSvgModal.tsx` into a 2-tab modal: "Import / Paste SVG" and "My Asset Bank ({count})" with real-time vector previews, categorization (`Custom`, `Branded`, `Tech Brands`, `UI Icons`, `Monograms`), instant workspace loading, deletion, and one-click JSON bank backup and restore.
  - Connected `ThreeLeftLibrary.tsx` drawer with `getCombinedAssets`, adding a dedicated `'My Bank'` category pill and hover delete actions.
  - Upgraded `src/index.css` with universal `.custom-part-glyph` multi-part selectors for all kinetic presets (`origami`, `ligature-clamp`, `split-converge`, `minimal-fade`, `magnetic-snap`, `smoke-dissolve`, `audio-reactive`), allowing arbitrary custom vector marks to animate with rich staggered multi-part motion in 2D mode.
  - Extracted `useStudioHistory.ts` domain hook from `App.tsx`, consolidating 60-step visual time-travel undo/redo, continuous tweak debouncing, step jumping, and stack clearing.
  - Built Decoupled Motion Plugin Registry (`src/plugins/motions/`) for modular extension.

---

### ISS-019: Viewport Camera Distance Clamping, Stale Closure Elimination & Advanced Export Framing Controls
* **Location**: `src/components/ThreeStageViewport.tsx`, `src/utils/threeEngine.ts`, `src/components/ThreeExportModal.tsx`
* **Symptom**:
  1. Adjusting camera distance in the inspector or export modal appeared to have no effect or was clamped unnaturally close.
  2. Certain 3D animations (`depth-slam`) moved forward so aggressively that they clipped directly into the camera lens.
  3. Export modal was missing crucial framing controls (lateral pan, Dutch roll tilt, and orbit rotation in snapshots).
* **Root Cause**:
  - In `ThreeStageViewport.tsx`, `renderLoop` was defined in a `useEffect` that captured the initial `config` closure rather than reading `configRef.current`. As a result, the 60 FPS loop repeatedly passed stale `config` to `evaluate3DMotion`, overriding user adjustments.
  - In `threeEngine.ts`, camera distance across all camera motion modes and stacked camera motion was hardcoded with `Math.max(340, ...)` instead of allowing the full slider range (180px–1200px).
  - In `depth-slam`, `zOffset` was set to `(1 - slam) * 240 * amp` and `scaleVal` was `1 + (1 - slam) * 1.4 * amp`, causing the mesh to surge 240px forward and 2.4x larger towards the camera.
* **Resolution**:
  - In `ThreeStageViewport.tsx`, updated `renderLoop` and `handlePointerMove` to strictly read `configRef.current` and `partsRef.current` on every frame, eliminating stale closure overrides.
  - In `threeEngine.ts`, changed all camera distance calculations to `Math.max(120, config.cameraDistance ?? ...)` across `camera-orbit`, `camera-dolly`, `camera-crane`, `camera-corkscrew`, `camera-pan`, `camera-rise`, `camera-shake`, stacked camera motion, and static camera positioning.
  - Moderated `depth-slam` to `zOffset = (1 - slam) * 110 * amp` and `scaleVal = 1 + (1 - slam) * 0.45 * amp` for immense cinematic impact without clipping.
  - Implemented 3D physics evaluations for `audio-reactive`, `minimal-fade`, `smoke-dissolve`, `solar-flare`, `quantum-pulse`, and `isometric-cube`.
  - Upgraded `ThreeExportModal.tsx` across both Video and Snapshot tabs with comprehensive framing controls: Camera Distance, Pitch Tilt (Elevation), Orbit Angle (Azimuth), Height (Up/Down: `cameraPosY`), Lateral Pan (Left/Right: `cameraPosX`), Dutch Roll (`cameraRoll`), and 1-click View Angle presets (`Front`, `Hero 3/4`, `Top-Down`, `Low-Angle`).

---

## 3. Automated Testing Suite

The project includes a native test harness (`scripts/test-suite.js`) powered by Vite's SSR runtime. It runs directly against source TypeScript files without compiling to intermediate JS or requiring heavy external runners:

```bash
# Run automated verification suite
npm test
```

### Test Coverage Summary:
- **Suite 1**: 2D Kinetic Motion Presets integrity (18 presets, durations $> 0$, animation classes)
- **Suite 2**: Optical Style Presets (8 styles, valid hex codes, positive glow radii)
- **Suite 3**: 3D PBR Materials (6 presets, roughness & metalness bounded in $[0, 1]$)
- **Suite 4**: Studio Lighting Rigs (4 rigs, positive key/rim/fill intensities, valid hex colors)
- **Suite 5**: Universal Vector Asset Library (27+ curated presets across Brands, UI, and Monograms with valid SVG XML and viewBoxes)
- **Suite 6**: Project State Serialization (empty object handling, invalid input rejection, `uiComplexity` and `activeAssetId` preservation)
- **Suite 7**: 3D Motion Kinematics (all 25 presets evaluated across 5 keyframe intervals, verifying finite transform matrices)

---

## 4. Code Review & QA Checklist for Future Features

Before marking any future issue as resolved or committing to `main`:
1. [ ] Run `npx tsc --noEmit` — must pass with **0 errors**.
2. [ ] Run `npm test` — all test suites must pass.
3. [ ] Run `npm run build` — bundle must build under `dist/index.html` and sync to all 3 distribution files.
4. [ ] Verify that UI changes strictly adhere to the Obsidian design tokens and the **zero-emoji** rule.
5. [ ] Update this document (`.agent/ISSUES.md`) with the new issue ID, root cause, resolution, and verification test.
