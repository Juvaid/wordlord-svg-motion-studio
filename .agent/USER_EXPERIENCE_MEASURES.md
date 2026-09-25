# User Experience (UX) Measures & Usability Roadmap

This document outlines high-impact ergonomics, workflow optimizations, and accessibility standards for WordLord SVG Motion Studio, benchmarked against tools like Figma, Blender, DaVinci Resolve, and Spline.

---

## 1. Ergonomic Viewport Navigation (Implemented & Next Steps)

### Implemented Measures
- **Dual Tool Model**: Standardized Figma-style `V` (Select) and `H` (Hand) modes.
- **Accidental Drag Elimination**: Plain left-click on canvas never moves the logo; dragging requires Middle-click, `Space` + Drag, `Alt` + Drag, or active Hand Tool.
- **Pointer Capture**: Calls `setPointerCapture(e.pointerId)` on pointerdown to guarantee smooth continuous drag even when the cursor sweeps beyond the browser window boundary.
- **1-Click Reset (`Cmd+0` / `Alt+0`)**: Restores 100% zoom and `(0, 0)` origin coordinates instantaneously.
- **Floating Viewport Deck**: Displays tool switcher, zoom percentage, zoom stepping, reset, and live `(x, y)` pan coordinates.

### Recommended Next UX Enhancements
1. **Cursor-Centered Zoom**:
   - Current zoom scales relative to the viewport center `(0, 0)`.
   - *Enhancement*: Calculate the mouse cursor coordinate at wheel event time so scrolling zooms directly *into* the feature the user is pointing at (like Figma and Google Maps).
2. **Fit to Viewport (`Shift+1` or `F`)**:
   - Computes the bounding box of the active vector or 3D mesh and animates camera/stage scale to fill 85% of the visible viewport frame.
3. **Spacebar Visual Cursor Feedback**:
   - When the user presses `Space`, dynamically change the cursor to `grab`; when dragging, switch to `grabbing`.

---

## 2. Inspector & Parameter Usability

### Recommended Scrubby Sliders (Blender / Photoshop Convention)
- Currently, numeric inputs require typing or dragging the HTML range bar.
- *Enhancement*: Allow clicking and dragging horizontally directly on the parameter label or numeric box to scrub values up and down. Holding `Shift` scrubs with 10× precision (fine-tuning); holding `Alt` scrubs with 10× speed.

### Right-Click / Double-Click Reset
- Double-clicking or right-clicking any slider resets that individual parameter to its factory preset default value, eliminating the need to reset the entire project.

### Searchable Inspector Filter
- A persistent quick-filter input (`Cmd+F` or `Ctrl+F` inside inspector) that narrows down properties (e.g. typing "bloom", "bevel", "color", "speed" filters the section list instantly).

---

## 3. Asset & File Ergonomics

### Drag-and-Drop Canvas Import
- Users should be able to drag an `.svg` file directly from macOS Finder / Windows Explorer onto the canvas area.
- Visual drop-zone overlay appears with: `"Drop SVG to Import & Auto-Extrude"`.
- Performs instant sanitization, calculates path dimensions, centers to `(0, 0)`, and scales to standard artboard dimensions.

### Multi-Asset Preset Switcher
- In addition to the default WordLord mark, provide a built-in selector with other brand assets:
  - WordLord Monogram (Compact)
  - WordLord Full Logotype (Horizontal Lockup)
  - Geometric Icon Test Pack (Star, Shield, Ring, Polygon) for stress-testing bevels and shaders.

---

## 4. Animation & Timeline Ergonomics

### Timeline Snapping & Keyframe Ticks
- Scrubbing the playhead snaps gently to 0%, 25%, 50%, 75%, and 100% timestamps when dragging within 3% proximity.
- Holding `Shift` disables snapping for micro-frame adjustments.

### Playback Speed Selector
- 1-click speed multiplier toggle: `0.25x` (slow motion analysis), `0.5x`, `1.0x` (normal), `2.0x`.
- Crucial for motion designers evaluating sub-pixel easing curves and optical shader flashes.

### Loop Playback Modes
- **Loop** (default): Plays from 0% to 100% and repeats.
- **Ping-Pong / Bounce**: Plays 0% to 100% then reverses 100% to 0% continuously.
- **Play Once**: Stops at 100% and holds final frame.

---

## 5. Keyboard Navigation & Accessibility Matrix

| Key / Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Space` | Global | Play / Pause animation playback |
| `Space` + Drag | Viewport | Pan canvas without switching active tool |
| `V` | 2D Stage | Activate Select Tool (Pointer) |
| `H` | 2D Stage | Activate Hand Tool (Pan) |
| `Cmd + 0` / `Alt + 0` | Viewport | Reset Viewport Zoom (100%) and Pan (0, 0) |
| `F` or `Shift + 1` | Viewport | Frame All / Fit selection to visible view |
| `Cmd + Z` | Global | Undo last parameter change or action |
| `Cmd + Shift + Z` | Global | Redo last undone action |
| `Cmd + S` | Global | Save project snapshot to local disk JSON |
| `Tab` | Global | Toggle between 2D Kinetic Studio and 3D Extruded Studio |
| `?` | Global | Open Keyboard Shortcuts Cheat Sheet modal |
| `Esc` | Modals | Close active export dialog or shortcuts overlay |
| `1` / `3` / `7` | 3D Stage | Orthographic Camera views: Front (`1`), Right (`3`), Top (`7`) |
| `5` | 3D Stage | Toggle Perspective vs Isometric camera projection |
