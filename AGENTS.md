# AGENTS.md — WordLord SVG Motion Studio

## Project Identity & Architecture
- **Repository**: WordLord SVG Motion Studio v5.0
- **Location**: `/Volumes/disk 2/wordlord-svg-motion-studio`
- **Primary Stack**: React 19, TypeScript 5.7, Tailwind CSS 3.4, Three.js r186, Lucide React, Vite 6 + `vite-plugin-singlefile`.
- **Target Runtime**: Standalone zero-dependency single-file HTML executable directly from disk (`dist/index.html` synced to `wordlord-svg-animation-studio.html`).
- **Core Aesthetic**: Desktop creative suite (Linear / DaVinci Resolve / Blender / Figma). Obsidian dark surfaces (`#07080c` to `#161a25`), WordLord crimson accent (`#ff4e2e`), strict **zero-emoji** policy across all UI chrome.

## Key Workspaces
1. **2D Vector Mark Studio**: 12 choreographed motion presets, 8 optical shader styles, 17 vector glyph tracks, interactive Bézier curve editor, multi-track timeline, 60 FPS MP4/WebM video exporter.
2. **3D Extruded Studio**: Hardware WebGL 3D engine, custom SVG part decomposition, collective asset transforms (Blender N-panel style: Pos, Rot, Scale, Uniform Scale), PBR materials, fluted/ribbed bump maps, 3-point studio lighting, UnrealBloom post-processing, GLTF/GLB/PNG/WebM export.
3. **Motion Graphics Studio**: SaaS Notion Bento Card UI Graphic Studio, dynamic vector typography showcase, 3D perspective matrix lift, customizable telemetry grids, and 5 curated aesthetic themes.

## Development & Build Commands
- `npm run dev`: Starts Vite dev server (runs as background daemon).
- `npm run build`: `tsc && vite build && node scripts/copy-build.js` — compiles singlefile and copies to target paths.

## Durable Architectural Rules
1. **Zero Emojis**: Always use `lucide-react` vector SVG icons. Never insert unicode emojis in UI, headers, tooltips, or buttons.
2. **No Nested Cards**: Panels use clean horizontal dividers (`border-b border-[#1f2430]`), subtle background contrast, and full-width content blocks instead of floating boxes with competing borders.
3. **Non-Destructive State**: All destructive actions (preset changes, resets, imports) push snapshots to `undoStackRef`. Keyboard shortcuts `Cmd+Z`, `Cmd+Shift+Z`, `Cmd+S`, `Tab` are supported.
4. **Clean Builds**: `npx tsc --noEmit` must pass with 0 errors before finishing.

## Context Pointers (Progressive Disclosure)
- Read [`.agent/FEATURES.md`](.agent/FEATURES.md) when looking up motion presets, shaders, PBR properties, camera modes, or export capabilities.
- Read [`.agent/ARCHITECTURE.md`](.agent/ARCHITECTURE.md) when modifying state flow, Three.js extrusion, canvas exporters, or procedural textures.
- Read [`.agent/DESIGN_SYSTEM.md`](.agent/DESIGN_SYSTEM.md) when building new UI panels, inspector components, color swatches, or modal dialogs.
- Read [`.agent/USER_EXPERIENCE_MEASURES.md`](.agent/USER_EXPERIENCE_MEASURES.md) when refining viewport ergonomics, shortcuts, scrub controls, or accessibility.
