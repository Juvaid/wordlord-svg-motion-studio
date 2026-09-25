# Design System & UI Guardrails: WordLord Studio

This document defines the strict visual language, styling tokens, component hierarchy, and design rules enforced across WordLord SVG Motion Studio.

---

## 1. Visual Identity & Brand Philosophy

- **Domain**: High-end Creative Desktop Suite (comparable to DaVinci Resolve, Blender, Figma, Linear).
- **Core Mood**: Obsidian technical dark mode, precision geometry, sub-pixel vector alignment, zero decorative clutter.
- **Zero-Emoji Policy (Hard Rule)**:
  - Unicode emojis (`🚀`, `✨`, `🎨`, `💡`, `📁`, etc.) are **strictly forbidden** in all user-facing UI elements, tooltips, dialogs, button labels, and inspector headers.
  - Every icon must be an authentic, crisp vector SVG imported from `lucide-react`.

---

## 2. Color Palette & Semantic Tokens

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-void` | `#07080c` | Deep canvas background, window frame, modal backdrops |
| `--bg-surface-0` | `#0b0d14` | Primary viewport backdrop, stage canvas background |
| `--bg-surface-1` | `#0f121a` | Sidebar background, navbar base, inspector root |
| `--bg-surface-2` | `#161a25` | Panel header bars, input fields, dropdown containers |
| `--bg-surface-3` | `#1e2433` | Hover highlights, active tab backgrounds, card borders |
| `--border-subtle` | `#1a2030` | Default panel and component dividers |
| `--border-focus` | `#2d3748` | Input focus rings and active panel indicators |
| `--text-primary` | `#f1f5f9` (`slate-100`) | Main headings, active values, button labels |
| `--text-secondary` | `#94a3b8` (`slate-400`) | Property labels, status badges, secondary metadata |
| `--text-muted` | `#64748b` (`slate-500`) | Inactive icons, unit labels (e.g. `px`, `deg`, `%`) |
| `--accent-brand` | `#ff4e2e` | WordLord Crimson — primary action buttons, active toggles, brand highlights |
| `--accent-glow` | `rgba(255, 78, 46, 0.25)` | Laser glow halo on active interactive controls |
| `--accent-cyan` | `#38bdf8` | Coordinate indicators, 3D raycast selection, keyframe markers |

---

## 3. Typography & Hierarchy

- **Font Family**:
  - UI Sans: `Inter`, system `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
  - Numeric & Code: JetBrains Mono, SF Mono, Menlo, monospace (enforced on all sliders, numeric inputs, coordinates, and timecodes).
- **Type Scale**:
  - `text-[9px]`: Micro-labels, unit badges, navigation shortcuts hint.
  - `text-[10px]`: Standard property label, slider numeric readout, tab buttons.
  - `text-[11px]`: Section headers, modal button text, dropdown item titles.
  - `text-[12px]`: Panel main headers, preset titles, mode switch triggers.
  - `text-[14px]`: Modal dialog titles, export resolution badges.
- **Rule on Line Length & Text Wrap**:
  - Headings use `text-wrap: balance`.
  - Prose descriptions use `text-wrap: pretty` and max width `65ch`.

---

## 4. Reusable Inspector Primitives (`src/components/inspector/`)

All inspector panels (both 2D and 3D) must be constructed using the standardized primitive set:

### 1. `InspectorSection`
Collapsible container with title, icon, optional active badge, and toggle expand state.
```tsx
<InspectorSection 
  title="Surface Material" 
  icon={<Layers size={12} />} 
  defaultExpanded={true}
>
  {/* Content */}
</InspectorSection>
```

### 2. `SliderField`
Label, current value readout, range track, and min/max clamps. Supports optional precision step and unit suffix.
```tsx
<SliderField
  label="Extrusion Depth"
  value={config.extrusionDepth}
  min={0.1}
  max={5.0}
  step={0.05}
  unit="mm"
  onChange={(val) => onUpdate('extrusionDepth', val)}
/>
```

### 3. `SegmentedField`
Horizontal pill segmented control with smooth active indicator.
```tsx
<SegmentedField
  label="Texture Pattern"
  value={config.textureType}
  options={[
    { id: 'none', label: 'Matte' },
    { id: 'fluted', label: 'Fluted' },
    { id: 'brushed', label: 'Brushed' },
    { id: 'carbon', label: 'Carbon' }
  ]}
  onChange={(val) => onUpdate('textureType', val)}
/>
```

### 4. `ColorSwatchField`
Compact color preview pill that opens native color picker with manual hex text input.
```tsx
<ColorSwatchField
  label="Emissive Core"
  color={config.emissiveColor}
  onChange={(hex) => onUpdate('emissiveColor', hex)}
/>
```

### 5. `SettingRow`
Horizontal flex row ensuring aligned left-label and right-control layout across all property fields.

---

## 5. Anti-Patterns & Prohibitions

1. **No Competing Card Borders**: Do NOT nest bordered cards inside bordered panels. Use subtle background contrast (`bg-white/[0.02]` vs `bg-black/20`) and horizontal dividers (`border-b border-white/5`).
2. **No Arbitrary Hex Outliers**: Do NOT use random colors like `#ff0000`, `#00ff00`, `#3b82f6` or AI-purple gradients. Always adhere to the obsidian/crimson/cyan palette.
3. **No Unbounded Modals**: Modals must be centered, have `max-h-[85vh]`, backdrop blur, and escape key listeners.
4. **No Raw Emojis**: Replace any discovered unicode emoji with the equivalent `lucide-react` icon.
