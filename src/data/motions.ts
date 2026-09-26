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
  },
  {
    id: 'vortex-spin',
    name: 'Hypnotic Vortex Spiral',
    badge: '3D',
    animClass: 'anim-vortex-spin',
    defaultDuration: 1.25,
    defaultEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    defaultStagger: 40,
    desc: 'Angular velocity spiral collapse unwinding from 720 degrees with progressive centrifugal glyph expansion and center focus.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.25, 1, 0.5, 1)',
      complexity: 'Double 360-degree rotational collapse',
      staggerScale: 'Centrifugal cascade'
    }
  },
  {
    id: 'neon-breathe',
    name: 'Cyberpunk Neon Shimmer',
    badge: 'Optics',
    animClass: 'anim-neon-breathe',
    defaultDuration: 1.8,
    defaultEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    defaultStagger: 50,
    desc: 'Bioluminescent high-voltage phosphor resonance with chromatic frequency drift and pulsating dual-hue drop-shadow aura.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.4, 0, 0.2, 1)',
      complexity: 'Chromatic shimmer + dual aura resonance',
      staggerScale: 'Continuous harmonic loop'
    }
  },
  {
    id: 'magnetic-snap',
    name: 'Magnetic Zero-G Snap',
    badge: 'Kinetic',
    animClass: 'anim-magnetic-snap',
    defaultDuration: 0.95,
    defaultEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    defaultStagger: 35,
    desc: 'Dispersed anti-gravity floating fragments captured by high-tension electromagnetic center field with micro-elastic lock.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      complexity: 'Radial dispersion + magnetic clamp',
      staggerScale: 'Cluster synchronized'
    }
  },
  {
    id: 'slice-blind',
    name: 'Shutter Blind Venetian',
    badge: 'Reveal',
    animClass: 'anim-slice-blind',
    defaultDuration: 1.15,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 35,
    desc: 'Alternating mechanical 90-degree raster pivots turning like precision louver blinds into full frontal illumination.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.16, 1, 0.3, 1)',
      complexity: 'Perspective rotateY alternating flip',
      staggerScale: 'Alternating parity stagger'
    }
  },
  {
    id: 'wave-flow',
    name: 'Fluid Kinetic Sine Wave',
    badge: 'Kinetic',
    animClass: 'anim-wave-flow',
    defaultDuration: 1.5,
    defaultEase: 'cubic-bezier(0.45, 0, 0.55, 1)',
    defaultStagger: 60,
    desc: 'Harmonic undulating crest-and-trough wave ripple propagating across glyph baselines with phase-delayed vertical displacement.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.45, 0, 0.55, 1)',
      complexity: 'Sinusoidal phase propagation',
      staggerScale: 'Harmonic wave sequence'
    }
  },
  {
    id: 'velocity-drift',
    name: 'Supersonic Velocity Streaks',
    badge: 'Kinetic',
    animClass: 'anim-velocity-drift',
    defaultDuration: 0.85,
    defaultEase: 'cubic-bezier(0.05, 0.95, 0.2, 1)',
    defaultStagger: 25,
    desc: 'Extreme lateral speed streaks decelerating from 200px offset with motion-blur skew settling into razor-sharp typographic alignment.',
    fps: 60,
    specs: {
      interpolator: 'cubic-bezier(0.05, 0.95, 0.2, 1)',
      complexity: 'High-velocity lateral drift + skew decay',
      staggerScale: 'Supersonic tight stagger'
    }
  },
  {
    id: 'camera-orbit',
    name: 'Cinematic Orbital Drone',
    badge: '3D',
    animClass: 'anim-camera-orbit',
    defaultDuration: 2.4,
    defaultEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    defaultStagger: 0,
    desc: 'Continuous 360-degree orbital drone tracking the extruded monolith with elevation wave and specular sweep.',
    fps: 60,
    specs: {
      interpolator: 'Parametric spherical orbit',
      complexity: '360° dynamic camera arc',
      staggerScale: 'Synchronous lockup'
    }
  },
  {
    id: 'camera-dolly',
    name: 'Vertigo Dolly Zoom',
    badge: '3D',
    animClass: 'anim-camera-dolly',
    defaultDuration: 1.6,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 0,
    desc: 'High-speed camera plunge from deep space into tight telephoto framing with dynamic perspective compression.',
    fps: 60,
    specs: {
      interpolator: 'Cubic plunge + FOV counter-zoom',
      complexity: 'Z-depth dolly with telephoto compression',
      staggerScale: 'Instantaneous alignment'
    }
  },
  {
    id: 'camera-crane',
    name: 'Hero Low-Angle Crane',
    badge: '3D',
    animClass: 'anim-camera-crane',
    defaultDuration: 1.8,
    defaultEase: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
    defaultStagger: 0,
    desc: 'Low-angle ground-level swoop ascending majestically into eye-level hero perspective over specular floor reflections.',
    fps: 60,
    specs: {
      interpolator: 'Bézier vertical crane trajectory',
      complexity: 'Y-elevation swooping with pitch tilt',
      staggerScale: 'Smooth ascension'
    }
  },
  {
    id: 'camera-corkscrew',
    name: 'Spiral Corkscrew Flyby',
    badge: '3D',
    animClass: 'anim-camera-corkscrew',
    defaultDuration: 2.0,
    defaultEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    defaultStagger: 0,
    desc: 'Dynamic spiral flyby banking around the extruded vector monolith with banking camera roll and rim glints.',
    fps: 60,
    specs: {
      interpolator: 'Helical spiral with roll banking',
      complexity: 'Combined XYZ orbital spiral with Z-rotation',
      staggerScale: 'Helical tracking'
    }
  },
  {
    id: 'camera-pan',
    name: 'Cinematic Dolly Track',
    badge: '3D',
    animClass: 'anim-camera-pan',
    defaultDuration: 2.2,
    defaultEase: 'cubic-bezier(0.3, 0, 0.2, 1)',
    defaultStagger: 0,
    desc: 'Smooth lateral dolly track gliding horizontally across typography with focal distance tracking.',
    fps: 60,
    specs: {
      interpolator: 'Linear lateral camera glide',
      complexity: 'Horizontal tracking shot across X-axis',
      staggerScale: 'Continuous sweep'
    }
  },
  {
    id: 'camera-rise',
    name: 'Vertical Ascension Rise',
    badge: '3D',
    animClass: 'anim-camera-rise',
    defaultDuration: 1.9,
    defaultEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    defaultStagger: 0,
    desc: 'Vertical helicopter ascension rising from baseline into vast panoramic aerial perspective.',
    fps: 60,
    specs: {
      interpolator: 'Exponential vertical rise',
      complexity: 'Ascending Y-flight with widening horizon',
      staggerScale: 'Smooth lift'
    }
  },
  {
    id: 'camera-shake',
    name: 'Impact Trauma Decoupling',
    badge: '3D',
    animClass: 'anim-camera-shake',
    defaultDuration: 1.2,
    defaultEase: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
    defaultStagger: 0,
    desc: 'Cinematic high-frequency camera trauma jitter decaying into dead-still monolithic lockup.',
    fps: 60,
    specs: {
      interpolator: 'Damped harmonic camera oscillation',
      complexity: 'Multi-axis rotational camera trauma',
      staggerScale: 'Instantaneous impact'
    }
  }
];
