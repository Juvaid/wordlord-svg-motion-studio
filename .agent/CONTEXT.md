# Project Context: WordLord SVG Motion Studio

## Current Status (v5.0)
- **Active Branch**: `main`
- **Latest Major Features**:
  - Full project audit completed (`project-audit.md` in conversation artifacts).
  - 6 Standalone HTML prototypes preserved under `prototypes/`.
  - Non-destructive history engine (undo/redo up to 40 steps, Cmd+Z / Cmd+Shift+Z).
  - Project JSON import/export and debounced auto-save to localStorage.
  - Collective Asset Grouping with lock/visibility toggles, editable group name, Blender N-panel transforms (Pos, Rot, Scale, Uniform Scale).
  - Shortcuts cheat-sheet modal (`?`).
  - Prototypes gap analysis completed: raycast selection, social framing masks, deterministic video rendering, procedural textures, polar lighting.

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
