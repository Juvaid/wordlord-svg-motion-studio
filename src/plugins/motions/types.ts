// src/plugins/motions/types.ts
// Decoupled Motion Plugin Interface for Extensible 2D & 3D Vector Animations
import * as THREE from 'three';
import { ThreePart, ThreeStudioConfig } from '../../types/threeStudio';

export interface Motion3DContext {
  logoGroup: THREE.Group;
  meshes: THREE.Mesh[];
  normalizedTime: number; // 0 to 1
  amplitude: number;
  gyro: { x: number; y: number };
  lights: { keyLight: THREE.DirectionalLight; rimLight: THREE.DirectionalLight };
  config: ThreeStudioConfig;
  parts: ThreePart[];
  camera?: THREE.Camera;
  controls?: any;
}

export interface MotionPlugin {
  id: string;
  name: string;
  category: 'kinetic' | 'camera' | 'optical' | 'expressive';
  description: string;
  iconName: string;
  defaultDuration: number;
  evaluate3D?: (ctx: Motion3DContext) => void;
  cssClassName?: string;
  cssKeyframes?: string;
}
