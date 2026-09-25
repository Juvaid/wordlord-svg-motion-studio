# WordLord Studio — Design System & Layout Guardrails

This document defines the architectural guardrails, design tokens, and modular component templates for the **WordLord Motion Studio** interface.

---

## 1. Core Principles (TASTE → IMPECCABLE → EMIL)

1. **Desktop Creative Suite Aesthetic**:
   - Inspired by **Linear**, **Figma**, and **DaVinci Resolve**.
   - Dark, low-glare surface hierarchy (`#07080c` to `#161a25`).
   - High information density without visual noise.

2. **The Cardinal Rule: No Nested Cards**:
   - *Nested cards are always wrong.* Never nest a bordered card inside an accordion box inside another bordered sidebar container.
   - Panels use **clean horizontal dividers** (`border-b border-[#1f2430]`), subtle background contrast, and full-width content blocks instead of floating boxes with competing borders.

3. **Strict Zero-Emoji Policy**:
   - All visual iconography must use SVG icons from `lucide-react`.
   - Never use unicode emojis in UI chrome, tooltips, or buttons.

4. **Progressive Disclosure & Focus Modes**:
   - Category filter tabs (`All`, `Timing`, `Optics`, `3D`, `Palette`, `Code`) allow users to focus on specific domains without visual crowding.
   - Global **Expand All / Collapse All** controls enable rapid toggling.

---

## 2. Color & Surface Hierarchy

| Token / Role | Tailwind Class / Hex | Usage |
|---|---|---|
| **App Canvas / Viewport** | `#07080c` | Deepest background behind the SVG artboard |
| **Primary Surface** | `#0a0c10` | App bar headers, category tab tracks, footer timeline |
| **Panel Surface** | `#0e1117` | Sidebars (Left presets & Right inspector) |
| **Section Header (Rest)** | `#12151e/80` | Collapsible section header strip |
| **Section Header (Hover)** | `#161a25` | Section hover state feedback |
| **Section Body** | `#0d1017/50` | Content container for settings rows |
| **Interactive Control Track** | `#151822` | Segmented controls, input fields, swatches |
| **Structural Borders** | `#1f2430` | Structural dividers between panels and sections |
| **Subtle Borders** | `#222736` / `#232736` | Control borders, inputs, buttons |
| **Accent Primary** | `#ff4e2e` (WordLord Crimson) | Primary active state, keyframes, brand identity |
| **Accent Cyan** | `#00ffff` | Bézier handles, vector contour indicators |
| **Accent Sky** | `#38bdf8` | 3D perspective, spatial rotation indicators |
| **Text Primary** | `text-slate-100` / `text-white` | Active labels, titles, highlighted values |
| **Text Secondary** | `text-slate-400` | Labels, unselected options |
| **Text Muted** | `text-slate-500` / `text-slate-600` | Micro metadata, units, hints |

---

## 3. Modular Inspector Primitives (`src/components/inspector/`)

All inspector controls must use the standardized primitives to prevent layout squishing, text clipping, and styling drift.

### 3.1 `InspectorSection`
Collapsible container that avoids nested card borders and provides standard header actions.

```tsx
import { InspectorSection } from './inspector';
import { Sliders } from 'lucide-react';

<InspectorSection
  id="physics"
  title="Physics & Gravity"
  icon={<Sliders size={12} className="text-[#ff4e2e]" />}
  badge="BETA"
  isOpen={isOpen}
  onToggle={(open) => setIsOpen(open)}
  action={
    <button onClick={handleReset} className="...">Reset</button>
  }
>
  {/* Section controls go here */}
</InspectorSection>
```

### 3.2 `SliderField`
Precision scrub slider with integrated value badge, min/max limits, unit display, and tooltip.

```tsx
import { SliderField } from './inspector';

<SliderField
  label="Gravity Coefficient"
  value={gravity}
  min={0}
  max={10}
  step={0.1}
  unit="G"
  decimals={1}
  accentColor="#ff4e2e"
  tooltip="Downward gravitational acceleration"
  onChange={setGravity}
/>
```

### 3.3 `SegmentedField`
Compact segmented button group for switching mutually exclusive modes.

```tsx
import { SegmentedField } from './inspector';
import { Play, Pause, FastForward } from 'lucide-react';

<SegmentedField
  label="Playback Engine"
  tooltip="Choose rendering engine"
  value={engine}
  onChange={setEngine}
  options={[
    { value: 'raf', label: 'RAF', icon: <Play size={10} />, tooltip: 'requestAnimationFrame' },
    { value: 'css', label: 'CSS', icon: <FastForward size={10} />, tooltip: 'CSS Animations' }
  ]}
/>
```

### 3.4 `ColorSwatchField`
Compact color swatch with color preview chip, hex code display, and 1-click native system color picker.

```tsx
import { ColorSwatchField } from './inspector';

<ColorSwatchField
  label="Aura Primary"
  sublabel="#FF4E2E"
  value={colorHex}
  tooltip="Change aura color"
  onChange={setColorHex}
/>
```

### 3.5 `SettingRow`
Universal container for custom controls (checkboxes, select dropdowns, custom graphs).

```tsx
import { SettingRow } from './inspector';

<SettingRow
  label="Audio Feedback"
  tooltip="Play mechanical click sounds on timeline scrub"
  layout="horizontal"
>
  <Toggle checked={audioEnabled} onChange={setAudioEnabled} />
</SettingRow>
```

---

## 4. Plug-and-Play Template: Adding a Future Configuration Section

To add a new configuration block (e.g. `Audio Dynamics`, `Particle Density`, or `Typography Hierarchy`):

1. **Define the State in Parent Component (`RightInspector.tsx` or Store)**:
   ```tsx
   const [particles, setParticles] = useState(25);
   ```

2. **Add the Section to `openSections` and Category Filter (Optional)**:
   ```tsx
   const [openSections, setOpenSections] = useState({
     ...
     particles: true
   });
   ```

3. **Render using Design Primitives inside the Scrollable Area**:
   ```tsx
   {shouldShow('particles') && (
     <InspectorSection
       id="particles"
       title="Particle Simulation"
       icon={<Sparkles size={12} className="text-[#a855f7]" />}
       isOpen={openSections.particles}
       onToggle={(open) => toggleSection('particles', open)}
     >
       <SliderField
         label="Particle Count"
         value={particles}
         min={0}
         max={100}
         step={5}
         unit="pts"
         accentColor="#a855f7"
         tooltip="Number of floating luminous embers"
         onChange={setParticles}
       />

       <SegmentedField
         label="Drift Direction"
         value={driftDir}
         onChange={setDriftDir}
         options={[
           { value: 'up', label: 'Ascend' },
           { value: 'down', label: 'Descend' },
           { value: 'radial', label: 'Radial' }
         ]}
       />
     </InspectorSection>
   )}
   ```

---

## 5. Layout Guardrails & Quality Checklist

Before committing any UI changes, verify against this checklist:

- [ ] **No nested cards**: No `border rounded-lg bg-[#12151e]` inside an accordion body.
- [ ] **Zero emojis**: Check all buttons, labels, and tooltips for unicode emojis.
- [ ] **No truncated text**: Labels have `truncate` with `min-w-0` on flex containers.
- [ ] **Unclipped slider thumbs**: Range slider containers have sufficient vertical padding (`py-0.5`).
- [ ] **Accessibility & Tooltips**: Every interactive button and slider has an informative `<Tooltip>`.
- [ ] **Keyboard navigation**: All interactive elements support standard keyboard events (`Tab`, `Enter`, `Space`).
- [ ] **Build validation**: Runs `npm run build` cleanly with zero TypeScript errors.
- [ ] **Singlefile sync**: Verified that `dist/index.html` is synchronized with `wordlord-svg-animation-studio.html`.
