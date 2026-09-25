import { MotionPreset } from '../types';

export const MOTIONS: MotionPreset[] = [
  {
    id: 'typewriter',
    name: 'Typewriter Cascade',
    badge: 'Reveal',
    animClass: 'anim-typewriter',
    defaultDuration: 0.95,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 60,
    desc: 'Sequential optical typography reveal staggered across 17 vector coordinates with exponential snap deceleration.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.16, 1, 0.3, 1)',
      complexity: '17 staggered keyframe tracks',
      staggerScale: '60ms uniform decay'
    }
  },
  {
    id: 'wiredraw',
    name: 'Neon Wireframe Draw',
    badge: 'Kinetic',
    animClass: 'anim-wiredraw',
    defaultDuration: 1.4,
    defaultEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    defaultStagger: 40,
    desc: 'Laser line plotting along Bézier tangents with progressive 60px dasharray stroke reveal into solid fill.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.25, 1, 0.5, 1)',
      complexity: 'SVG stroke-dashoffset transition',
      staggerScale: 'Global stroke sync'
    }
  },
  {
    id: 'ligature-clamp',
    name: 'Ligature Monolith Lock',
    badge: 'Kinetic',
    animClass: 'anim-ligature-clamp',
    defaultDuration: 1.1,
    defaultEase: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
    defaultStagger: 50,
    desc: 'Two typographic masses slide horizontally while the monolith ligature D drops to clamp WORD and LORD into unified brand lockup.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      complexity: 'Opposing X translation + vertical clamp',
      staggerScale: 'Phase synchronized'
    }
  },
  {
    id: 'liquid-wipe',
    name: 'Liquid Plasma Wipe',
    badge: 'Optics',
    animClass: 'anim-liquid-wipe',
    defaultDuration: 1.1,
    defaultEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    defaultStagger: 30,
    desc: 'Viscous polygon clipping boundary wipe revealing the complete mark through fluid downward sheet displacement.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.25, 1, 0.5, 1)',
      complexity: 'Animated CSS polygon clip-path',
      staggerScale: 'Full-stage global'
    }
  },
  {
    id: 'depth-slam',
    name: 'Cinematic Depth Slam',
    badge: '3D',
    animClass: 'anim-depth-slam',
    defaultDuration: 0.85,
    defaultEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    defaultStagger: 40,
    desc: 'High-impact Z-axis optical slam from 2.2x scale with Gaussian lens focus pull and sub-pixel elastic rebound.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      complexity: 'Scale transform + blur filter decay',
      staggerScale: 'Global impact'
    }
  },
  {
    id: 'origami',
    name: 'Origami Dimension Fold',
    badge: '3D',
    animClass: 'anim-origami',
    defaultDuration: 1.2,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 80,
    desc: 'Geometric 90-degree 3D rotational perspective unfold with lighting illumination shift as planes catch the virtual key light.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.16, 1, 0.3, 1)',
      complexity: 'Perspective rotateX 3-phase split',
      staggerScale: 'WORD (0s), LORD (0.15s), MEDIA (0.3s)'
    }
  },
  {
    id: 'cyber-glitch',
    name: 'Cyberpunk Chroma Glitch',
    badge: 'Glitch',
    animClass: 'anim-cyber-glitch',
    defaultDuration: 0.75,
    defaultEase: 'steps(4, jump-none)',
    defaultStagger: 20,
    desc: 'Chromatic skew aberration displacements with jittering drop-shadows and quantized subline step reveal.',
    fps: 60,
    specs: {
      interpolator: 'Quantized step displacement',
      complexity: 'Multi-slice skew + dual shadow pulse',
      staggerScale: 'Rapid random jitter'
    }
  },
  {
    id: 'pulse-glow',
    name: 'Volumetric Pulse Bloom',
    badge: 'Ambient',
    animClass: 'anim-pulse-glow',
    defaultDuration: 2.2,
    defaultEase: 'cubic-bezier(0.45, 0, 0.55, 1)',
    defaultStagger: 50,
    desc: 'Breathing harmonic resonance oscillating neon drop-shadows from 4px to 28px without clipping bounding box.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.45, 0, 0.55, 1)',
      complexity: 'Harmonic sine wave breathing',
      staggerScale: 'Continuous infinite loop'
    }
  },
  {
    id: 'laser-sweep',
    name: 'Anamorphic Laser Sweep',
    badge: 'Optics',
    animClass: 'anim-laser-sweep',
    defaultDuration: 1.35,
    defaultEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    defaultStagger: 40,
    desc: 'High-intensity 45-degree diagonal specular gleam traversing the mark with additive blend lighting.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.4, 0, 0.2, 1)',
      complexity: 'Linear gradient overlay sweep',
      staggerScale: 'Diagonal pass'
    }
  },
  {
    id: 'split-converge',
    name: 'Kinetic Split & Lock',
    badge: 'Kinetic',
    animClass: 'anim-split-converge',
    defaultDuration: 1.05,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 50,
    desc: 'Orthogonal quadrant fly-in with WORD from north, LORD from south, and MEDIA rising into locked composure.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.16, 1, 0.3, 1)',
      complexity: 'Opposing Y translation + scale settle',
      staggerScale: 'Synchronous convergence'
    }
  },
  {
    id: 'matrix-rain',
    name: 'Matrix Glyph Cascade',
    badge: 'Glitch',
    animClass: 'anim-matrix-rain',
    defaultDuration: 1.3,
    defaultEase: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    defaultStagger: 45,
    desc: 'Vertical rain stream dropping each vector glyph from ceiling into final resting typographical baseline.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      complexity: 'Per-glyph vertical translation',
      staggerScale: '45ms waterfall cascade'
    }
  },
  {
    id: 'elastic-pop',
    name: 'Elastic Pop Harmonic',
    badge: 'Kinetic',
    animClass: 'anim-elastic-pop',
    defaultDuration: 0.9,
    defaultEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    defaultStagger: 35,
    desc: 'Spring physics simulation scaling each glyph from 0.4x with smooth double-bounce settle.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      complexity: 'Dual-frequency spring damping',
      staggerScale: 'Harmonic glyph sequence'
    }
  }
];
