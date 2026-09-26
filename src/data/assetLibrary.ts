// src/data/assetLibrary.ts
// Curated Universal Vector Asset Library for WordLord SVG Motion Studio (2D & 3D)
import { GLYPH_PATHS } from './vectorPaths';

export interface SvgAssetPreset {
  id: string;
  name: string;
  category: 'Branded' | 'Tech Brands' | 'UI Icons' | 'Monograms' | 'Custom';
  description: string;
  viewBox: string;
  svgString: string;
  defaultColors?: {
    primary: string;
    secondary: string;
  };
}

// 1. WordLord Core Mark (12-part typographic lockup)
const WORDLORD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 26" width="500" height="520">
  <path id="Letter-W-Word" fill="#ffffff" d="${GLYPH_PATHS.wordW}" />
  <path id="Letter-O-Word" fill="#ffffff" d="${GLYPH_PATHS.wordO}" />
  <path id="Letter-R-Word" fill="#ffffff" d="${GLYPH_PATHS.wordR}" />
  <path id="Letter-L-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordL}" />
  <path id="Letter-O-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordO}" />
  <path id="Letter-R-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordR}" />
  <path id="Monolith-Ligature-D" fill="#ffffff" d="${GLYPH_PATHS.ligatureD}" />
  <path id="Letter-M-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaM}" />
  <path id="Letter-E-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaE}" />
  <path id="Letter-D-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaD}" />
  <path id="Letter-I-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaI}" />
  <path id="Letter-A-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaA}" />
</svg>`;

// 2. MEDIA Showpiece (5 individual bold characters)
const MEDIA_SHOWPIECE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 120" width="540" height="120">
  <path id="Letter-M" fill="#FF263E" d="M 15 110 L 15 10 L 42 10 L 62 72 L 82 10 L 109 10 L 109 110 L 89 110 L 89 44 L 70 96 L 54 96 L 35 44 L 35 110 Z" />
  <path id="Letter-E" fill="#FF263E" d="M 124 110 L 124 10 L 188 10 L 188 32 L 150 32 L 150 51 L 182 51 L 182 72 L 150 72 L 150 88 L 188 88 L 188 110 Z" />
  <path id="Letter-D" fill="#FF263E" d="M 204 110 L 204 10 L 246 10 C 274 10 288 28 288 60 C 288 92 274 110 246 110 Z M 228 32 L 228 88 L 244 88 C 259 88 264 78 264 60 C 264 42 259 32 244 32 Z" />
  <path id="Letter-I" fill="#FF263E" d="M 304 110 L 304 10 L 330 10 L 330 110 Z" />
  <path id="Letter-A" fill="#FF263E" d="M 346 110 L 376 10 L 404 10 L 434 110 L 408 110 L 402 88 L 378 88 L 372 110 Z M 390 38 L 382 70 L 398 70 Z" />
</svg>`;

// 3. React Atom
const REACT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <circle id="React-Core" cx="50" cy="50" r="8" fill="#61DAFB" />
  <path id="Orbit-Alpha" fill="none" stroke="#61DAFB" stroke-width="4.5" d="M 50 22 C 75 22 92 35 92 50 C 92 65 75 78 50 78 C 25 78 8 65 8 50 C 8 35 25 22 50 22 Z" />
  <path id="Orbit-Beta" fill="none" stroke="#61DAFB" stroke-width="4.5" transform="rotate(60 50 50)" d="M 50 22 C 75 22 92 35 92 50 C 92 65 75 78 50 78 C 25 78 8 65 8 50 C 8 35 25 22 50 22 Z" />
  <path id="Orbit-Gamma" fill="none" stroke="#61DAFB" stroke-width="4.5" transform="rotate(120 50 50)" d="M 50 22 C 75 22 92 35 92 50 C 92 65 75 78 50 78 C 25 78 8 65 8 50 C 8 35 25 22 50 22 Z" />
</svg>`;

// 4. Vite Lightning Shield
const VITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Shield-Left" fill="#41D1FF" d="M 10 18 L 48 94 C 49 96 51 96 52 94 L 90 18 C 91 16 90 14 88 14 L 62 14 L 50 38 L 38 14 L 12 14 C 10 14 9 16 10 18 Z" />
  <path id="Shield-Right" fill="#BD34FE" d="M 50 38 L 62 14 L 88 14 C 90 14 91 16 90 18 L 52 94 C 51 96 49 96 48 94 L 50 38 Z" />
  <path id="Lightning-Bolt" fill="#FFD026" d="M 54 22 L 32 54 L 46 54 L 40 78 L 68 44 L 54 44 L 58 22 Z" />
</svg>`;

// 5. GitHub Octocat Silhouette
const GITHUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Octocat-Body" fill="#F0F6FC" d="M 50 5 C 24.6 5 4 25.6 4 51 C 4 71.3 17.2 88.5 35.5 94.6 C 37.8 95 38.6 93.6 38.6 92.4 C 38.6 91.3 38.6 87.4 38.5 83.7 C 25.7 86.5 23 77.5 23 77.5 C 20.9 72.2 17.9 70.8 17.9 70.8 C 13.7 67.9 18.2 68 18.2 68 C 22.8 68.3 25.3 72.7 25.3 72.7 C 29.4 79.8 36.2 77.7 38.8 76.5 C 39.2 73.5 40.4 71.5 41.8 70.3 C 31.6 69.1 20.8 65.2 20.8 47.7 C 20.8 42.7 22.6 38.6 25.5 35.4 C 25 34.2 23.5 29.6 26 23.3 C 26 23.3 29.8 22.1 38.5 28 C 42.1 27 46.1 26.5 50 26.5 C 53.9 26.5 57.9 27 61.5 28 C 70.2 22.1 74 23.3 74 23.3 C 76.5 29.6 75 34.2 74.5 35.4 C 77.4 38.6 79.2 42.7 79.2 47.7 C 79.2 65.3 68.3 69.1 58.1 70.2 C 59.9 71.8 61.5 74.9 61.5 79.7 C 61.5 86.6 61.4 92.2 61.4 92.4 C 61.4 93.6 62.2 95.1 64.5 94.6 C 82.8 88.5 96 71.3 96 51 C 96 25.6 75.4 5 50 5 Z" />
</svg>`;

// 6. Vercel Monolithic Triangle
const VERCEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Vercel-Apex" fill="#FFFFFF" d="M 50 12 L 92 84 L 8 84 Z" />
</svg>`;

// 7. Apple Emblem
const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Apple-Leaf" fill="#F5F5F7" d="M 52.8 22 C 55.4 18.8 57.2 14.3 56.6 9.8 C 52.8 10 48.2 12.4 45.5 15.6 C 43.1 18.4 41 23 41.7 27.4 C 46 27.7 50.3 25.2 52.8 22 Z" />
  <path id="Apple-Body" fill="#F5F5F7" d="M 50 31 C 44.5 31 39.8 34.2 35.7 34.2 C 31.4 34.2 27.5 31.2 23.3 31.2 C 14.8 31.2 6 38.6 6 52.3 C 6 60.9 9.3 70.1 13.5 76.2 C 17.3 81.7 20.6 86.8 26.4 86.8 C 30.6 86.8 32.3 84.1 37.3 84.1 C 42.4 84.1 43.8 86.8 48.3 86.8 C 54.3 86.8 57.7 81.2 61.4 75.8 C 65.7 69.5 67.5 63.3 67.7 62.9 C 67.4 62.8 57.3 58.9 57.3 47.4 C 57.3 37.8 65.1 33.2 65.5 32.9 C 60.9 26.2 53.9 25.5 51.5 25.3 C 50.8 25.3 50.4 31 50 31 Z" />
</svg>`;

// 8. Google G Monogram (4 distinct colored quadrant curves)
const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Quadrant-Blue" fill="#4285F4" d="M 94 51 C 94 48 93.6 44.8 93 42 L 50 42 L 50 58.5 L 75 58.5 C 73.8 64.6 70.3 69.8 65 73.3 L 77.2 82.8 C 84.4 76.2 94 64.5 94 51 Z" />
  <path id="Quadrant-Green" fill="#34A853" d="M 50 96 C 62.4 96 72.8 91.9 80.3 85 L 68.1 75.5 C 64.7 77.8 60.3 79.2 55 79.2 C 43 79.2 32.8 71.1 29.2 60.2 L 16.6 70 C 24.3 85.3 40.2 96 50 96 Z" />
  <path id="Quadrant-Yellow" fill="#FBBC05" d="M 29.2 60.2 C 28.3 57.5 27.7 54.6 27.7 51.5 C 27.7 48.4 28.3 45.5 29.2 42.8 L 16.6 33 C 13.5 39.2 11.7 46.1 11.7 51.5 C 11.7 56.9 13.5 63.8 16.6 70 L 29.2 60.2 Z" />
  <path id="Quadrant-Red" fill="#EA4335" d="M 50 20.8 C 56.8 20.8 62.8 23.2 67.6 27.7 L 79.8 15.5 C 72.4 8.6 62.1 4 50 4 C 40.2 4 24.3 14.7 16.6 30 L 29.2 39.8 C 32.8 28.9 43 20.8 50 20.8 Z" />
</svg>`;

// 9. TypeScript Badge
const TYPESCRIPT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Badge-Base" fill="#3178C6" d="M 12 12 L 88 12 C 92 12 96 16 96 20 L 96 80 C 96 84 92 88 88 88 L 12 88 C 8 88 4 84 4 80 L 4 20 C 4 16 8 12 12 12 Z" />
  <path id="Glyph-T" fill="#FFFFFF" d="M 24 38 L 48 38 L 48 45 L 39 45 L 39 74 L 33 74 L 33 45 L 24 45 Z" />
  <path id="Glyph-S" fill="#FFFFFF" d="M 70 47 C 68 45 65 44 61 44 C 57 44 54 45 52 47 C 50 49 49 51 49 54 C 49 57 51 59 53 61 C 55 62 58 63 62 64 C 67 66 70 68 72 70 C 74 72 75 75 75 79 C 75 83 73 86 70 88 C 67 90 63 91 58 91 C 54 91 50 90 46 88 L 48 82 C 51 84 55 85 58 85 C 62 85 65 84 67 83 C 68 81 69 79 69 77 C 69 74 68 72 66 71 C 64 69 61 68 57 67 C 52 65 49 63 47 61 C 45 59 44 56 44 52 C 44 48 46 45 49 43 C 52 40 56 39 61 39 C 65 39 69 40 72 42 Z" />
</svg>`;

// 10. Linear Monogram Orbit
const LINEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Linear-Outer-Arc" fill="none" stroke="#5E6AD2" stroke-width="7" stroke-linecap="round" d="M 20 80 C 10 70 8 50 18 36 C 28 22 46 14 64 16 C 80 18 92 32 90 50 C 88 68 74 82 56 84" />
  <path id="Linear-Diagonal-Spur" fill="#5E6AD2" d="M 22 78 L 78 22 L 84 28 L 28 84 Z" />
</svg>`;

// 11. Kinetic Verified Checkmark
const CHECKMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <circle id="Checkmark-Circle" cx="50" cy="50" r="42" fill="#10B981" />
  <path id="Checkmark-Tick" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M 30 52 L 44 66 L 72 36" />
</svg>`;

// 12. Notification Bell
const BELL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Bell-Dome" fill="#F59E0B" d="M 50 14 C 47 14 45 16 45 19 C 45 20 44 21 43 22 C 34 26 28 35 28 46 L 28 64 L 20 72 L 20 76 L 80 76 L 80 72 L 72 64 L 72 46 C 72 35 66 26 57 22 C 56 21 55 20 55 19 C 55 16 53 14 50 14 Z" />
  <circle id="Bell-Clapper" cx="50" cy="84" r="6" fill="#F59E0B" />
</svg>`;

// 13. Dynamic Heart / Like
const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Heart-Left-Lobe" fill="#EC4899" d="M 50 86 C 47 84 14 58 14 36 C 14 22 25 12 38 12 C 44 12 48 15 50 18 C 52 15 56 12 62 12 C 75 12 86 22 86 36 C 86 58 53 84 50 86 Z" />
</svg>`;

// 14. 5-Point Rating Star
const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Star-Body" fill="#EAB308" d="M 50 10 L 62.5 35.5 L 90 39.5 L 70 59 L 75 86.5 L 50 73.5 L 25 86.5 L 30 59 L 10 39.5 L 37.5 35.5 Z" />
</svg>`;

// 15. Rocket Launch
const ROCKET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Rocket-Fuselage" fill="#E2E8F0" d="M 50 10 C 62 20 72 42 68 64 L 32 64 C 28 42 38 20 50 10 Z" />
  <circle id="Porthole-Ring" cx="50" cy="38" r="8" fill="#0EA5E9" />
  <path id="Left-Fin" fill="#EF4444" d="M 32 54 L 14 68 L 22 78 L 34 70 Z" />
  <path id="Right-Fin" fill="#EF4444" d="M 68 54 L 86 68 L 78 78 L 66 70 Z" />
  <path id="Exhaust-Fire" fill="#F97316" d="M 42 66 L 50 92 L 58 66 Z" />
</svg>`;

// 16. Armored Security Shield
const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Shield-Crest" fill="#6366F1" d="M 50 12 L 86 26 L 86 52 C 86 72 70 86 50 92 C 30 86 14 72 14 52 L 14 26 Z" />
  <path id="Shield-Core-Gleam" fill="#A5B4FC" d="M 50 20 L 78 32 L 78 52 C 78 68 66 79 50 84 Z" />
</svg>`;

// 17. Hot Flame Tongue
const FLAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Outer-Fire" fill="#FF4E2E" d="M 50 10 C 50 10 65 30 65 48 C 65 52 63 56 61 59 C 65 55 69 49 71 43 C 80 54 85 68 78 80 C 72 90 60 94 48 94 C 32 94 20 82 20 66 C 20 46 36 34 40 20 C 44 26 48 34 44 42 C 48 36 50 26 50 10 Z" />
  <path id="Inner-Plasma" fill="#FFD026" d="M 48 55 C 54 55 58 60 58 68 C 58 76 52 82 46 82 C 40 82 36 78 36 72 C 36 62 44 58 48 55 Z" />
</svg>`;

// 18. Turbo Lightning Bolt
const LIGHTNING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Bolt-Main" fill="#FACC15" d="M 56 6 L 20 54 L 46 54 L 38 94 L 80 44 L 54 44 Z" />
</svg>`;

// 19. Precision Compass
const COMPASS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <circle id="Compass-Bezel" cx="50" cy="50" r="42" fill="none" stroke="#38BDF8" stroke-width="5" />
  <path id="Needle-North" fill="#EF4444" d="M 50 16 L 60 50 L 50 46 L 40 50 Z" />
  <path id="Needle-South" fill="#E2E8F0" d="M 50 84 L 60 50 L 50 54 L 40 50 Z" />
  <circle id="Needle-Pivot" cx="50" cy="50" r="4" fill="#0F172A" />
</svg>`;

// 20. Diamond Gem Facet
const GEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Gem-Table" fill="#38BDF8" d="M 32 20 L 68 20 L 88 42 L 12 42 Z" />
  <path id="Gem-Pavilion" fill="#0284C7" d="M 12 42 L 88 42 L 50 86 Z" />
  <path id="Gem-Facet-Left" fill="#7DD3FC" d="M 32 20 L 50 42 L 12 42 Z" />
  <path id="Gem-Facet-Right" fill="#0369A1" d="M 68 20 L 88 42 L 50 42 Z" />
</svg>`;

// 21. Global Network Sphere
const GLOBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <circle id="Globe-Perimeter" cx="50" cy="50" r="40" fill="none" stroke="#22D3EE" stroke-width="4.5" />
  <path id="Globe-Equator" fill="none" stroke="#22D3EE" stroke-width="3" d="M 10 50 L 90 50" />
  <path id="Globe-Meridian-Alpha" fill="none" stroke="#22D3EE" stroke-width="3" d="M 50 10 L 50 90" />
  <ellipse id="Globe-Meridian-Beta" cx="50" cy="50" rx="24" ry="40" fill="none" stroke="#22D3EE" stroke-width="3" />
</svg>`;

// 22. Media Play Squircle
const PLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <rect id="Play-Squircle" x="10" y="10" width="80" height="80" rx="24" fill="#FF4E2E" />
  <path id="Play-Triangle" fill="#FFFFFF" d="M 40 32 L 70 50 L 40 68 Z" />
</svg>`;

// 23. CYB Monogram
const CYBER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 120" width="380" height="120">
  <path id="Letter-C" fill="#06B6D4" d="M 90 20 L 30 20 L 30 100 L 90 100 L 90 80 L 52 80 L 52 40 L 90 40 Z" />
  <path id="Letter-Y" fill="#06B6D4" d="M 105 20 L 122 62 L 139 20 L 160 20 L 132 80 L 132 100 L 112 100 L 112 80 L 85 20 Z" />
  <path id="Letter-B" fill="#06B6D4" d="M 175 100 L 175 20 L 215 20 C 230 20 240 28 240 45 C 240 54 234 60 225 63 C 238 67 245 76 245 88 C 245 96 235 100 215 100 Z M 197 38 L 197 52 L 212 52 C 218 52 222 48 222 45 C 222 42 218 38 212 38 Z M 197 68 L 197 82 L 214 82 C 220 82 224 78 224 75 C 224 72 220 68 214 68 Z" />
</svg>`;

// 24. Apex Vanguard Shield
const APEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <path id="Shield-Outer" fill="#F59E0B" d="M 150 25 L 260 85 L 260 190 L 150 275 L 40 190 L 40 85 Z" />
  <path id="Shield-Inner" fill="#EF4444" d="M 150 65 L 230 110 L 230 180 L 150 240 L 70 180 L 70 110 Z" />
  <path id="Core-Star" fill="#FFFFFF" d="M 150 100 L 165 135 L 200 150 L 165 165 L 150 200 L 135 165 L 100 150 L 135 135 Z" />
</svg>`;

// 25. Vortex Harmonic Pinwheel
const VORTEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <path id="Spiral-Arm-Alpha" fill="#8B5CF6" d="M 150 30 C 220 30 270 80 270 150 C 270 180 250 210 220 230 L 200 200 C 220 185 235 165 235 150 C 235 105 200 65 150 65 Z" />
  <path id="Spiral-Arm-Beta" fill="#EC4899" d="M 270 150 C 270 220 220 270 150 270 C 120 270 90 250 70 220 L 100 200 C 115 220 135 235 150 235 C 195 235 235 200 235 150 Z" />
  <path id="Spiral-Arm-Gamma" fill="#06B6D4" d="M 150 270 C 80 270 30 220 30 150 C 30 120 50 90 80 70 L 100 100 C 85 115 65 135 65 150 C 65 195 105 235 150 235 Z" />
  <path id="Spiral-Arm-Delta" fill="#10B981" d="M 30 150 C 30 80 80 30 150 30 C 180 30 210 50 230 80 L 200 100 C 185 85 165 65 150 65 C 105 65 65 105 65 150 Z" />
</svg>`;

// 26. Isometric 3D Cube
const CUBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Cube-Top" fill="#60A5FA" d="M 50 14 L 84 32 L 50 50 L 16 32 Z" />
  <path id="Cube-Left" fill="#2563EB" d="M 16 32 L 50 50 L 50 86 L 16 68 Z" />
  <path id="Cube-Right" fill="#1D4ED8" d="M 50 50 L 84 32 L 84 68 L 50 86 Z" />
</svg>`;

// 27. Mobius Infinity Loop
const INFINITY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <path id="Infinity-Loop" fill="none" stroke="#A855F7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M 32 36 C 20 36 12 44 12 52 C 12 60 20 68 32 68 C 44 68 56 46 68 46 C 80 46 88 54 88 62 C 88 70 80 78 68 78 C 56 78 44 36 32 36 Z" />
</svg>`;

// Complete Exported Library of 27 Production Vector Assets
export const ALL_ASSETS: SvgAssetPreset[] = [
  // Branded WordLord
  {
    id: 'wordlord',
    name: 'WordLord Media',
    category: 'Branded',
    description: '12-part typography lockup with ligature D & neon media baseline',
    viewBox: '0 0 25 26',
    svgString: WORDLORD_SVG,
    defaultColors: { primary: '#ffffff', secondary: '#ff4e2e' }
  },
  {
    id: 'media',
    name: 'MEDIA Showpiece',
    category: 'Branded',
    description: 'Extruded high-impact brand mark with individual letters M-E-D-I-A',
    viewBox: '0 0 540 120',
    svgString: MEDIA_SHOWPIECE_SVG,
    defaultColors: { primary: '#ff263e', secondary: '#4a070e' }
  },

  // Tech & Developer Brands
  {
    id: 'react',
    name: 'React Atom',
    category: 'Tech Brands',
    description: 'Decoupled nucleus with 3 rotating harmonic orbital rings',
    viewBox: '0 0 100 100',
    svgString: REACT_SVG,
    defaultColors: { primary: '#61dafb', secondary: '#1e3a5f' }
  },
  {
    id: 'vite',
    name: 'Vite Lightning',
    category: 'Tech Brands',
    description: 'Dual-tone gradient shield with high-voltage central lightning bolt',
    viewBox: '0 0 100 100',
    svgString: VITE_SVG,
    defaultColors: { primary: '#ffd026', secondary: '#bd34fe' }
  },
  {
    id: 'github',
    name: 'GitHub Octocat',
    category: 'Tech Brands',
    description: 'Iconic open-source mascot silhouette with precision Bézier curves',
    viewBox: '0 0 100 100',
    svgString: GITHUB_SVG,
    defaultColors: { primary: '#f0f6fc', secondary: '#21262d' }
  },
  {
    id: 'vercel',
    name: 'Vercel Monolith',
    category: 'Tech Brands',
    description: 'Pure geometric pyramid monolith representing serverless architecture',
    viewBox: '0 0 100 100',
    svgString: VERCEL_SVG,
    defaultColors: { primary: '#ffffff', secondary: '#171717' }
  },
  {
    id: 'apple',
    name: 'Apple Emblem',
    category: 'Tech Brands',
    description: 'Timeless fruit silhouette with floating leaf coordinate',
    viewBox: '0 0 100 100',
    svgString: APPLE_SVG,
    defaultColors: { primary: '#f5f5f7', secondary: '#333336' }
  },
  {
    id: 'google',
    name: 'Google G Monogram',
    category: 'Tech Brands',
    description: '4-quadrant chromatic curvature in official spectral primary hues',
    viewBox: '0 0 100 100',
    svgString: GOOGLE_SVG,
    defaultColors: { primary: '#4285f4', secondary: '#ea4335' }
  },
  {
    id: 'typescript',
    name: 'TypeScript Badge',
    category: 'Tech Brands',
    description: 'Precision typography badge with extruded T and S glyphs',
    viewBox: '0 0 100 100',
    svgString: TYPESCRIPT_SVG,
    defaultColors: { primary: '#3178c6', secondary: '#ffffff' }
  },
  {
    id: 'linear',
    name: 'Linear Orbit',
    category: 'Tech Brands',
    description: 'High-velocity project management arc with 45-degree diagonal spur',
    viewBox: '0 0 100 100',
    svgString: LINEAR_SVG,
    defaultColors: { primary: '#5e6ad2', secondary: '#242b58' }
  },

  // UI & Micro-Interaction Icons
  {
    id: 'checkmark',
    name: 'Verified Checkmark',
    category: 'UI Icons',
    description: 'High-contrast verification badge with dynamic snap-in checkmark',
    viewBox: '0 0 100 100',
    svgString: CHECKMARK_SVG,
    defaultColors: { primary: '#10b981', secondary: '#ffffff' }
  },
  {
    id: 'bell',
    name: 'Alert Bell',
    category: 'UI Icons',
    description: 'Notification chime bell with vibrating clapper and acoustic rim',
    viewBox: '0 0 100 100',
    svgString: BELL_SVG,
    defaultColors: { primary: '#f59e0b', secondary: '#451a03' }
  },
  {
    id: 'heart',
    name: 'Pulse Heart',
    category: 'UI Icons',
    description: 'Curved organic heart mark for interactions and social telemetry',
    viewBox: '0 0 100 100',
    svgString: HEART_SVG,
    defaultColors: { primary: '#ec4899', secondary: '#831843' }
  },
  {
    id: 'star',
    name: 'Vanguard Star',
    category: 'UI Icons',
    description: 'Golden 5-point star emblem with faceted optical edges',
    viewBox: '0 0 100 100',
    svgString: STAR_SVG,
    defaultColors: { primary: '#eab308', secondary: '#713f12' }
  },
  {
    id: 'rocket',
    name: 'Launch Rocket',
    category: 'UI Icons',
    description: 'Multi-part aerospace rocket with stabilizer fins and flame exhaust',
    viewBox: '0 0 100 100',
    svgString: ROCKET_SVG,
    defaultColors: { primary: '#ef4444', secondary: '#38bdf8' }
  },
  {
    id: 'shield',
    name: 'Cyber Shield',
    category: 'UI Icons',
    description: 'Armored heraldic defensive crest with specular highlight bevel',
    viewBox: '0 0 100 100',
    svgString: SHIELD_SVG,
    defaultColors: { primary: '#6366f1', secondary: '#312e81' }
  },
  {
    id: 'flame',
    name: 'Hot Streak Flame',
    category: 'UI Icons',
    description: 'Organic dual-layer plasma flame for trending telemetry',
    viewBox: '0 0 100 100',
    svgString: FLAME_SVG,
    defaultColors: { primary: '#ff4e2e', secondary: '#ffd026' }
  },
  {
    id: 'lightning',
    name: 'Kinetic Lightning',
    category: 'UI Icons',
    description: 'High-torque electrical discharge zig-zag polygon',
    viewBox: '0 0 100 100',
    svgString: LIGHTNING_SVG,
    defaultColors: { primary: '#facc15', secondary: '#78350f' }
  },
  {
    id: 'compass',
    name: 'Studio Compass',
    category: 'UI Icons',
    description: 'Navigational azimuth bezel with dual magnetic orientation needle',
    viewBox: '0 0 100 100',
    svgString: COMPASS_SVG,
    defaultColors: { primary: '#38bdf8', secondary: '#ef4444' }
  },
  {
    id: 'gem',
    name: 'Diamond Facet',
    category: 'UI Icons',
    description: 'Brilliant-cut gemstone with reflective table and pavilion facets',
    viewBox: '0 0 100 100',
    svgString: GEM_SVG,
    defaultColors: { primary: '#38bdf8', secondary: '#0369a1' }
  },
  {
    id: 'globe',
    name: 'Global Mesh',
    category: 'UI Icons',
    description: 'Planetary sphere with axial meridians and equatorial coordinates',
    viewBox: '0 0 100 100',
    svgString: GLOBE_SVG,
    defaultColors: { primary: '#22d3ee', secondary: '#083344' }
  },
  {
    id: 'play',
    name: 'Motion Play Squircle',
    category: 'UI Icons',
    description: 'Fluid squircle container housing an extruded directional play glyph',
    viewBox: '0 0 100 100',
    svgString: PLAY_SVG,
    defaultColors: { primary: '#ff4e2e', secondary: '#ffffff' }
  },

  // Geometric Monograms & 3D Marks
  {
    id: 'cyber',
    name: 'CYB Monogram',
    category: 'Monograms',
    description: 'Futuristic sci-fi cyber monogram with neon cyan edges',
    viewBox: '0 0 380 120',
    svgString: CYBER_SVG,
    defaultColors: { primary: '#06b6d4', secondary: '#0e3a47' }
  },
  {
    id: 'apex',
    name: 'Apex Vanguard',
    category: 'Monograms',
    description: 'Nested heraldic shield badge with central star core',
    viewBox: '0 0 300 300',
    svgString: APEX_SVG,
    defaultColors: { primary: '#f59e0b', secondary: '#ef4444' }
  },
  {
    id: 'vortex',
    name: 'Vortex Pinwheel',
    category: 'Monograms',
    description: '4-arm harmonic spiral with organic curved fins',
    viewBox: '0 0 300 300',
    svgString: VORTEX_SVG,
    defaultColors: { primary: '#8b5cf6', secondary: '#ec4899' }
  },
  {
    id: 'cube',
    name: 'Isometric Cube',
    category: 'Monograms',
    description: '3-faceted spatial isometric block with volumetric light falloff',
    viewBox: '0 0 100 100',
    svgString: CUBE_SVG,
    defaultColors: { primary: '#3b82f6', secondary: '#1e3a8a' }
  },
  {
    id: 'infinity',
    name: 'Mobius Infinity',
    category: 'Monograms',
    description: 'Continuous non-orientable topological ribbon knot',
    viewBox: '0 0 100 100',
    svgString: INFINITY_SVG,
    defaultColors: { primary: '#a855f7', secondary: '#581c87' }
  }
];
