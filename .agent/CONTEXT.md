# Project Context: WordLord SVG Motion Studio

## Current Status (v5.0)
- **Active Branch**: `main`
- **Latest Completed Milestones**:
  - Full project audit completed ([`project-audit.md`](file:///Users/wordlord/.gemini/antigravity/brain/1c5285d8-5f0b-48cd-a1ac-d2111b43fb0d/project-audit.md)).
  - Viewport navigation stabilization: Figma/Blender-style `V` (Select) and `H` (Hand) modes, pointer capture, and 1-click Reset (`Cmd+0`).
  - Gyro cursor tracking disabled by default in 3D studio, eliminating accidental cursor follow.
  - 6 Standalone HTML prototypes preserved under `prototypes/`.
  - Non-destructive history engine (undo/redo up to 40 steps, `Cmd+Z` / `Cmd+Shift+Z`).
  - Project JSON import/export and debounced auto-save to `localStorage`.
  - Collective Asset Grouping with lock/visibility toggles, editable group name, Blender N-panel transforms (`Pos`, `Rot`, `Scale`, `Uniform Scale`).
  - Raycast 3D part selection with white flash feedback.
  - Social framing masks (16:9, 9:16, 1:1, 21:9).
  - Procedural surface textures (`fluted`, `brushed`, `carbon`, `knurl`, `noise`).

## Core Agent Documentation
- [`.agent/FEATURES.md`](FEATURES.md): Comprehensive feature inventory (2D motions, 3D PBR materials, lighting, export pipelines).
- [`.agent/ARCHITECTURE.md`](ARCHITECTURE.md): Technical deep-dive on SVG decomposition, Three.js extrusion, canvas exporters, state flow.
- [`.agent/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md): Strict visual tokens, Obsidian palette, zero-emoji policy, and inspector primitives.
- [`.agent/USER_EXPERIENCE_MEASURES.md`](USER_EXPERIENCE_MEASURES.md): UX ergonomics roadmap, shortcuts matrix, and interaction design.

## Directory Structure
- `src/App.tsx`: Main application shell, state management, workspace router (2D vs 3D).
- `src/components/`:
  - `TopNavbar.tsx`: Global navigation, undo/redo, save/load, shortcuts trigger, mode switch.
  - `StageViewport.tsx` & `ThreeStageViewport.tsx`: 2D SVG canvas and 3D WebGL viewport.
  - `LeftLibrary.tsx` & `ThreeLeftLibrary.tsx`: Creative presets and asset libraries.
  - `RightInspector.tsx` & `ThreeRightInspector.tsx`: Parameter inspectors and PBR properties.
  - `TimelineFooter.tsx` & `ThreeTimelineFooter.tsx`: Sequencer timelines and transport decks.
  - `VideoExportModal.tsx` & `ThreeExportModal.tsx`: Render modals for MP4/WebM/GLTF.
  - `inspector/`: Standardized design primitives (`InspectorSection`, `SliderField`, `SegmentedField`, `ColorSwatchField`, `SettingRow`).
- `src/utils/`:
  - `threeEngine.ts`: SVG parsing into parts, mesh extrusion, fluted textures, animation loop, GLTF export.
  - `videoExporter.ts`: Double-buffered canvas recording engine for 2D.
  - `projectState.ts`: Persistence engine (localStorage + JSON import/export).
- `prototypes/`: 6 Standalone HTML reference tools from Downloads.
