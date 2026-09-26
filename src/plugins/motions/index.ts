// src/plugins/motions/index.ts
// Central Motion Plugin Registry for WordLord SVG Motion Studio
import { MotionPlugin } from './types';
import { MOTIONS } from '../../data/motions';

export * from './types';

// In-memory motion plugin registry
const motionRegistry = new Map<string, MotionPlugin>();

// Initialize default motions from metadata catalog
MOTIONS.forEach(m => {
  const plugin: MotionPlugin = {
    id: m.id,
    name: m.name,
    category: m.id.startsWith('camera') 
      ? 'camera' 
      : ['pulse-glow', 'laser-sweep', 'neon-flicker'].includes(m.id) 
      ? 'optical' 
      : 'kinetic',
    description: m.desc,
    iconName: m.id,
    defaultDuration: m.defaultDuration || 0.95,
    cssClassName: m.animClass
  };
  motionRegistry.set(plugin.id, plugin);
});

/**
 * Register a new custom or agent-generated motion plugin into the studio
 */
export function registerMotionPlugin(plugin: MotionPlugin): void {
  motionRegistry.set(plugin.id, plugin);
}

/**
 * Retrieve a specific motion plugin by its unique ID
 */
export function getMotionPlugin(id: string): MotionPlugin | undefined {
  return motionRegistry.get(id);
}

/**
 * Get all registered motion plugins as an array
 */
export function getAllMotionPlugins(): MotionPlugin[] {
  return Array.from(motionRegistry.values());
}
