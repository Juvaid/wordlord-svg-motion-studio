import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { ThreePart, ThreeStudioConfig, ThreeMotionMode, ProceduralTextureType } from '../types/threeStudio';

/**
 * Procedural Fluted Normal Bump Map Generator
 */
export function generateFlutedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Flat normal base
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 128, 128);

  for (let y = 0; y < 128; y += 8) {
    const grad = ctx.createLinearGradient(0, y, 0, y + 8);
    grad.addColorStop(0.0, '#ff8080'); // Top slope
    grad.addColorStop(0.5, '#8080ff'); // Flat center
    grad.addColorStop(1.0, '#008080'); // Bottom slope
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 128, 8);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

/**
 * Multi-type Procedural Texture Generator (Fluted, Brushed, Carbon, Diamond, Noise)
 */
export function generateProceduralTexture(type: ProceduralTextureType): THREE.CanvasTexture | null {
  if (type === 'none') return null;
  if (type === 'fluted') return generateFlutedTexture();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'brushed') {
    // 512x512 micro-anisotropic horizontal brushed metal streaks
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      const y = Math.random() * 512;
      const len = 40 + Math.random() * 140;
      const x = Math.random() * 512;
      const alpha = 0.05 + Math.random() * 0.1;
      ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
  } else if (type === 'carbon') {
    // 512x512 diagonal cross-hatch carbon fiber weave
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, 512, 512);
    const size = 16;
    for (let x = 0; x < 512; x += size) {
      for (let y = 0; y < 512; y += size) {
        const isAlt = ((x / size) + (y / size)) % 2 === 0;
        ctx.fillStyle = isAlt ? '#252b38' : '#141822';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = isAlt ? '#3b4356' : '#0c0e14';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
      }
    }
  } else if (type === 'diamond') {
    // 512x512 diamond knurl grid
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#a0a0ff';
    ctx.lineWidth = 1.5;
    const step = 24;
    for (let i = -512; i < 1024; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 512);
      ctx.lineTo(i + 512, 0);
      ctx.stroke();
    }
  } else if (type === 'noise') {
    // Per-pixel bump noise
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = 110 + Math.floor(Math.random() * 90);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/**
 * Highlight a clicked mesh momentarily with a clean white specular flash
 */
export function flashMeshHighlight(mesh: THREE.Mesh): void {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const faceMat = materials[0] as THREE.MeshPhysicalMaterial;
  if (!faceMat) return;

  const origColor = faceMat.color.clone();
  faceMat.color.set('#ffffff');
  if (faceMat.emissive) {
    faceMat.emissive.set('#ff4e2e');
    faceMat.emissiveIntensity = 0.6;
  }

  setTimeout(() => {
    faceMat.color.copy(origColor);
    if (faceMat.emissive) {
      faceMat.emissive.set('#000000');
      faceMat.emissiveIntensity = 0;
    }
  }, 200);
}

/**
 * Parse any SVG string into independent editable parts/letters
 */
export function parseSvgIntoParts(svgString: string, faceColor: string, sideColor: string): ThreePart[] {
  const parts: ThreePart[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgRoot = doc.querySelector('svg');

  if (!svgRoot) return parts;

  let vbWidth = 500, vbHeight = 150;
  if (svgRoot.hasAttribute('viewBox')) {
    const rawVb = svgRoot.getAttribute('viewBox')?.split(/[\s,]+/).filter(Boolean) || [];
    if (rawVb.length === 4) {
      vbWidth = parseFloat(rawVb[2]);
      vbHeight = parseFloat(rawVb[3]);
    }
  }

  const elements = svgRoot.querySelectorAll('path, rect, circle, polygon, ellipse');
  let index = 0;

  elements.forEach(el => {
    const tagName = el.tagName.toLowerCase();
    let pathD = '';
    let isBgCandidate = false;

    if (tagName === 'path') {
      pathD = el.getAttribute('d') || '';
    } else if (tagName === 'rect') {
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      pathD = `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;

      if (w >= vbWidth * 0.85 && h >= vbHeight * 0.85) {
        isBgCandidate = true;
      }
    } else if (tagName === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      pathD = `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    } else if (tagName === 'polygon') {
      const rawPoints = el.getAttribute('points') || '';
      const pairs = rawPoints.trim().split(/[\s,]+/);
      if (pairs.length >= 4) {
        pathD = `M ${pairs[0]} ${pairs[1]}`;
        for (let i = 2; i < pairs.length; i += 2) {
          if (pairs[i] && pairs[i + 1]) {
            pathD += ` L ${pairs[i]} ${pairs[i + 1]}`;
          }
        }
        pathD += ' Z';
      }
    } else if (tagName === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      pathD = `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 -${rx * 2},0`;
    }

    if (!pathD.trim()) return;

    let rawName = el.getAttribute('id') || `Part #${index + 1} (${tagName})`;
    const name = rawName.replace(/[-_]/g, ' ');

    let originalColor = el.getAttribute('fill') || faceColor;
    if (originalColor === 'none') originalColor = faceColor;

    parts.push({
      id: `part_${Date.now()}_${index}`,
      name,
      pathD,
      originalColor,
      faceColor: originalColor,
      sideColor,
      depthOffset: 0,
      bevelScale: 1.0,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
      phaseDelay: index * 0.08,
      metalness: 0.45,
      roughness: 0.22,
      emissive: '#000000',
      transmission: 0.0,
      visible: !isBgCandidate,
      isolated: false,
      isBackground: isBgCandidate
    });

    index++;
  });

  return parts;
}

/**
 * Filter out full-bleed bounding background boxes from SVG string
 */
export function cleanSvgArtboardBackground(svgString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgRoot = doc.querySelector('svg');
  if (!svgRoot) return svgString;

  let vbWidth = 500, vbHeight = 150;
  if (svgRoot.hasAttribute('viewBox')) {
    const rawVb = svgRoot.getAttribute('viewBox')?.split(/[\s,]+/).filter(Boolean) || [];
    if (rawVb.length === 4) {
      vbWidth = parseFloat(rawVb[2]);
      vbHeight = parseFloat(rawVb[3]);
    }
  }

  const rects = svgRoot.querySelectorAll('rect');
  rects.forEach(rect => {
    const w = parseFloat(rect.getAttribute('width') || '0');
    const h = parseFloat(rect.getAttribute('height') || '0');
    if (w >= vbWidth * 0.85 && h >= vbHeight * 0.85) {
      rect.remove();
    }
  });

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Build Extruded Meshes from parts with exact coordinate normalization
 */
export function buildExtrudedParts(
  logoGroup: THREE.Group,
  parts: ThreePart[],
  config: ThreeStudioConfig,
  proceduralTexture: THREE.Texture | null
): THREE.Mesh[] {
  // Clear previous children cleanly
  while (logoGroup.children.length > 0) {
    const child = logoGroup.children[0] as THREE.Mesh;
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
    logoGroup.remove(child);
  }

  const meshes: THREE.Mesh[] = [];
  const activeParts = parts.filter(p => p.visible);
  if (activeParts.length === 0) return meshes;

  // Global normalization box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const parsedShapesList: { shapes: THREE.Shape[]; partRef: ThreePart; pIdx: number }[] = [];

  activeParts.forEach((part, pIdx) => {
    const loader = new SVGLoader();
    const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${part.pathD}" /></svg>`;
    const svgData = loader.parse(wrappedSvg);

    svgData.paths.forEach(path => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
        const points = shape.getPoints();
        points.forEach(pt => {
          if (pt.x < minX) minX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y > maxY) maxY = pt.y;
        });
      });
      parsedShapesList.push({ shapes, partRef: part, pIdx });
    });
  });

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    minX = -100;
    maxX = 100;
    minY = -100;
    maxY = 100;
  }

  const svgWidth = Math.max(1, maxX - minX);
  const svgHeight = Math.max(1, maxY - minY);
  const centerX = minX + svgWidth / 2;
  const centerY = minY + svgHeight / 2;

  // Scale normalization: Fit inside standard 280-unit viewing box
  const targetDesignSpan = 280;
  const maxSpan = Math.max(svgWidth, svgHeight);
  const normScale = maxSpan > 0 ? (targetDesignSpan / maxSpan) : 1.0;

  parsedShapesList.forEach(({ shapes, partRef, pIdx }) => {
    const totalDepth = Math.max(2, (config.depth + (partRef ? partRef.depthOffset : 0)));
    const bevelThickness = Math.max(0, config.bevelThickness * (partRef ? partRef.bevelScale : 1.0));
    const bevelSize = Math.max(0, config.bevelSize * (partRef ? partRef.bevelScale : 1.0));

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: totalDepth,
      bevelEnabled: bevelThickness > 0 || bevelSize > 0,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelOffset: 0,
      bevelSegments: Math.max(1, config.bevelSegments),
      curveSegments: 5,
      steps: 1
    };

    const faceColor = partRef ? partRef.faceColor : config.faceColor;
    const sideColor = partRef ? partRef.sideColor : config.sideColor;

    const hasProcedural = config.flutingEnabled || (config.proceduralTexture && config.proceduralTexture !== 'none');

    const faceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(faceColor),
      roughness: partRef ? partRef.roughness : config.roughness,
      metalness: partRef ? partRef.metalness : config.metalness,
      clearcoat: config.clearcoat,
      clearcoatRoughness: 0.15,
      transmission: partRef ? partRef.transmission : config.transmission,
      bumpMap: hasProcedural ? proceduralTexture : null,
      bumpScale: hasProcedural ? (config.fluteScale || 0.45) : 0.0,
      ior: 1.5,
      side: THREE.DoubleSide
    });

    const sideMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(sideColor),
      roughness: Math.min(1.0, (partRef ? partRef.roughness : config.roughness) + 0.1),
      metalness: Math.min(1.0, (partRef ? partRef.metalness : config.metalness) + 0.15),
      clearcoat: config.clearcoat * 0.5,
      side: THREE.DoubleSide
    });

    shapes.forEach(shape => {
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Center around origin and scale to design dimensions
      if (config.autoCenter) {
        geom.translate(-centerX, -centerY, -totalDepth / 2);
      }
      geom.scale(normScale, -normScale, 1); // SVG Y is downward, 3D Y is upward
      geom.computeVertexNormals();

      const mesh = new THREE.Mesh(geom, [faceMat, sideMat]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        index: pIdx,
        partId: partRef ? partRef.id : null,
        name: partRef ? partRef.name : `Part ${pIdx}`,
        baseX: (partRef ? partRef.offsetX : 0),
        baseY: (partRef ? partRef.offsetY : 0),
        baseZ: (partRef ? partRef.offsetZ : 0)
      };

      meshes.push(mesh);
      logoGroup.add(mesh);
    });
  });

  // Apply Blender-style Object Transforms (Position, Rotation, Scale)
  logoGroup.position.set(config.posX || 0, config.posY || 0, config.posZ || 0);
  logoGroup.rotation.set(
    ((config.rotX || 0) * Math.PI) / 180,
    ((config.rotY || 0) * Math.PI) / 180,
    ((config.rotZ || 0) * Math.PI) / 180
  );
  logoGroup.scale.set(
    (config.scaleX || 1.0) * (config.meshScale || 1.0),
    (config.scaleY || 1.0) * (config.meshScale || 1.0),
    (config.scaleZ || 1.0) * (config.meshScale || 1.0)
  );

  return meshes;
}

/**
 * Reset all meshes back to their base origins
 */
export function resetMeshesToOrigin(meshes: THREE.Mesh[]): void {
  meshes.forEach(m => {
    m.position.set(m.userData.baseX || 0, m.userData.baseY || 0, m.userData.baseZ || 0);
    m.rotation.set(0, 0, 0);
    m.scale.set(1, 1, 1);
  });
}

/**
 * Evaluate 3D Animation Motion Frame with Effect Stacking & 2D Keyframe Sync
 */
export function evaluate3DMotion(
  logoGroup: THREE.Group,
  meshes: THREE.Mesh[],
  mode: ThreeMotionMode,
  normalizedTime: number,
  amplitude: number,
  mouseGyro: { x: number; y: number },
  lights: { keyLight: THREE.DirectionalLight; rimLight: THREE.DirectionalLight },
  config: ThreeStudioConfig,
  parts: ThreePart[]
): void {
  if (!logoGroup) return;

  const t = normalizedTime;
  const amp = amplitude;

  // Base Blender-style object transform angles
  const baseRotX = ((config.rotX || 0) * Math.PI) / 180;
  const baseRotY = ((config.rotY || 0) * Math.PI) / 180;
  const baseRotZ = ((config.rotZ || 0) * Math.PI) / 180;
  const basePosX = config.posX || 0;
  const basePosY = config.posY || 0;
  const basePosZ = config.posZ || 0;

  // Cursor Gyro reaction
  const hasGyro = config.gyroEnabled || (config.stackedEffects && config.stackedEffects.gyroTilt);
  const gyroX = hasGyro ? mouseGyro.x * 0.45 * amp : 0;
  const gyroY = hasGyro ? -mouseGyro.y * 0.3 * amp : 0;

  // Stacked Modifiers
  const stack = config.stackedEffects || {
    hoverFloat: false,
    turntableSpin: false,
    harmonicWave: false,
    lightSweep: false,
    gyroTilt: false,
    sync2dMotion: false
  };

  const activeParts = parts.filter(p => p.visible);

  // Initialize group transforms
  logoGroup.position.set(basePosX, basePosY, basePosZ);
  logoGroup.rotation.set(baseRotX + gyroY, baseRotY + gyroX, baseRotZ);

  // 1. Evaluate Primary Motion Engine
  resetMeshesToOrigin(meshes);

  switch (mode) {
    case 'typewriter':
    case 'reveal': {
      meshes.forEach((mesh, idx) => {
        const partRef = activeParts[mesh.userData.index];
        const delay = partRef ? partRef.phaseDelay : (idx * 0.08);
        const partT = Math.max(0, Math.min(1, (t - delay) / 0.5));

        // Spring overshoot curve
        const bounce = 1 - Math.pow(Math.E, -6 * partT) * Math.cos(partT * Math.PI * 4);
        const dropY = (1 - bounce) * 120 * amp;
        const dropZ = (1 - bounce) * -100 * amp;
        const spinX = (1 - bounce) * Math.PI * 0.5 * amp;

        mesh.position.y = (mesh.userData.baseY || 0) + dropY;
        mesh.position.z = (mesh.userData.baseZ || 0) + dropZ;
        mesh.rotation.x = spinX;
        mesh.scale.setScalar(Math.max(0.001, Math.min(1, bounce)));
      });
      break;
    }

    case 'depth-slam': {
      const p = Math.max(0, Math.min(1, t / 0.7));
      const slam = p === 1 ? 1 : 1 - Math.pow(2, -10 * p) * Math.cos((p * 10 - 0.75) * ((2 * Math.PI) / 3));
      const zOffset = (1 - slam) * 240 * amp;
      const scaleVal = 1 + (1 - slam) * 1.4 * amp;
      meshes.forEach(m => {
        m.position.z = (m.userData.baseZ || 0) + zOffset;
        m.scale.set(scaleVal, scaleVal, 1 + (1 - slam) * 0.5);
      });
      logoGroup.rotation.x = baseRotX + (1 - slam) * 0.25 * amp + gyroY;
      break;
    }

    case 'ligature-clamp': {
      const p = Math.max(0, Math.min(1, t / 0.8));
      const clampEase = 1 - Math.pow(1 - p, 4);
      meshes.forEach((mesh, idx) => {
        const name = (mesh.userData.name || '').toUpperCase();
        const isD = name.includes('D') || name.includes('LIGATURE');
        const isLeft = idx < meshes.length / 2;
        if (isD) {
          const drop = (1 - clampEase) * 140 * amp;
          mesh.position.y = (mesh.userData.baseY || 0) + drop;
          mesh.position.z = (mesh.userData.baseZ || 0) + (1 - clampEase) * 50 * amp;
        } else if (isLeft) {
          const slideX = (1 - clampEase) * -120 * amp;
          mesh.position.x = (mesh.userData.baseX || 0) + slideX;
        } else {
          const slideX = (1 - clampEase) * 120 * amp;
          mesh.position.x = (mesh.userData.baseX || 0) + slideX;
        }
      });
      break;
    }

    case 'origami': {
      meshes.forEach((mesh, idx) => {
        const delay = idx * (0.35 / Math.max(1, meshes.length));
        const partT = Math.max(0, Math.min(1, (t - delay) / 0.5));
        const ease = 1 - Math.pow(1 - partT, 3);
        const foldAngle = (1 - ease) * (idx % 2 === 0 ? Math.PI * 0.5 : -Math.PI * 0.5) * amp;
        mesh.rotation.x = foldAngle;
        mesh.position.z = (mesh.userData.baseZ || 0) + (1 - ease) * -50 * amp;
        mesh.scale.set(Math.max(0.001, ease), Math.max(0.001, ease), Math.max(0.001, ease));
      });
      break;
    }

    case 'wiredraw': {
      const p = Math.max(0, Math.min(1, t / 0.85));
      meshes.forEach((mesh, idx) => {
        const stagger = idx * (0.3 / Math.max(1, meshes.length));
        const partT = Math.max(0, Math.min(1, (t - stagger) / 0.55));
        mesh.scale.z = Math.max(0.01, partT);
        mesh.position.z = (mesh.userData.baseZ || 0) - (1 - partT) * 35 * amp;
      });
      const angle = t * Math.PI * 2;
      lights.rimLight.position.x = Math.sin(angle) * 320;
      break;
    }

    case 'liquid-wipe': {
      meshes.forEach((mesh, idx) => {
        const stagger = idx * (0.25 / Math.max(1, meshes.length));
        const partT = Math.max(0, Math.min(1, (t - stagger) / 0.5));
        const ripple = Math.sin(partT * Math.PI * 3) * (1 - partT) * 15 * amp;
        mesh.position.y = (mesh.userData.baseY || 0) - (1 - partT) * 90 * amp + ripple;
        mesh.position.z = (mesh.userData.baseZ || 0) + ripple;
        mesh.scale.y = Math.max(0.001, partT);
      });
      break;
    }

    case 'laser-sweep':
    case 'sweep': {
      logoGroup.rotation.y = baseRotY + (Math.sin(t * Math.PI * 2) * 0.15) + gyroX;
      const angle = t * Math.PI * 2;
      lights.rimLight.position.x = Math.cos(angle) * 360;
      lights.rimLight.position.z = Math.sin(angle) * 360;
      lights.keyLight.intensity = config.keyIntensity * (1 + Math.sin(angle * 2) * 0.45);
      break;
    }

    case 'cyber-glitch': {
      const glitchPhase = Math.sin(t * 35);
      const isGlitching = Math.abs(glitchPhase) > 0.6;
      meshes.forEach((mesh, idx) => {
        if (isGlitching && (idx + Math.floor(t * 12)) % 2 === 0) {
          mesh.position.x = (mesh.userData.baseX || 0) + (Math.sin(t * 100 + idx) * 10 * amp);
          mesh.position.z = (mesh.userData.baseZ || 0) + (Math.cos(t * 70 + idx) * 15 * amp);
        }
      });
      break;
    }

    case 'pulse-glow': {
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
      const scaleB = 1 + breath * 0.08 * amp;
      meshes.forEach(m => {
        m.scale.set(scaleB, scaleB, 1 + breath * 0.3 * amp);
        m.position.z = (m.userData.baseZ || 0) + breath * 16 * amp;
      });
      lights.rimLight.intensity = config.rimIntensity * (0.7 + breath * 0.9);
      break;
    }

    case 'split-converge': {
      const p = Math.max(0, Math.min(1, t / 0.75));
      const ease = 1 - Math.pow(1 - p, 3);
      meshes.forEach((mesh, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        mesh.position.y = (mesh.userData.baseY || 0) + dir * (1 - ease) * 120 * amp;
        mesh.position.z = (mesh.userData.baseZ || 0) + (1 - ease) * -60 * amp;
        mesh.rotation.x = dir * (1 - ease) * 0.45 * amp;
      });
      break;
    }

    case 'matrix-rain': {
      meshes.forEach((mesh, idx) => {
        const delay = idx * (0.45 / Math.max(1, meshes.length));
        const partT = Math.max(0, Math.min(1, (t - delay) / 0.4));
        const fall = Math.pow(1 - partT, 2) * 200 * amp;
        mesh.position.y = (mesh.userData.baseY || 0) + fall;
        mesh.scale.setScalar(Math.max(0.001, partT));
      });
      break;
    }

    case 'elastic-pop': {
      meshes.forEach((mesh, idx) => {
        const delay = idx * (0.35 / Math.max(1, meshes.length));
        const partT = Math.max(0, Math.min(1, (t - delay) / 0.45));
        const s = partT === 1 ? 1 : Math.sin(partT * Math.PI * 2.5) * Math.pow(1 - partT, 2) * 0.45 + partT;
        mesh.scale.setScalar(Math.max(0.001, s));
        mesh.position.z = (mesh.userData.baseZ || 0) + (1 - partT) * -45 * amp;
      });
      break;
    }

    case 'turntable': {
      logoGroup.rotation.y = baseRotY + (t * Math.PI * 2) + gyroX;
      logoGroup.rotation.x = baseRotX + (Math.sin(t * Math.PI * 4) * 0.08 * amp) + gyroY;
      logoGroup.position.y = basePosY + Math.sin(t * Math.PI * 2) * 8 * amp;
      break;
    }

    case 'wave': {
      logoGroup.rotation.y = baseRotY + (Math.sin(t * Math.PI * 2) * 0.2) + gyroX;
      logoGroup.rotation.x = baseRotX + gyroY;

      meshes.forEach((mesh, idx) => {
        const partRef = activeParts[mesh.userData.index];
        const phase = partRef ? (partRef.phaseDelay * 10) : (idx * 0.6);
        const wave = Math.sin(t * Math.PI * 4 - phase);

        mesh.position.z = (mesh.userData.baseZ || 0) + wave * 22 * amp;
        mesh.position.y = (mesh.userData.baseY || 0) + Math.cos(t * Math.PI * 4 - phase) * 6 * amp;
        mesh.rotation.x = wave * 0.18 * amp;
      });
      break;
    }

    case 'explode': {
      const explodePhase = Math.sin(t * Math.PI) * amp;
      meshes.forEach((mesh, idx) => {
        const angle = (idx / Math.max(1, meshes.length)) * Math.PI * 2;
        const blastDist = 90 * explodePhase;
        mesh.position.x = (mesh.userData.baseX || 0) + Math.cos(angle) * blastDist;
        mesh.position.y = (mesh.userData.baseY || 0) + Math.sin(angle) * blastDist * 0.5;
        mesh.position.z = (mesh.userData.baseZ || 0) + Math.sin(angle * 2) * 45 * explodePhase;
        mesh.rotation.y = angle * explodePhase;
      });
      break;
    }

    case 'camera': {
      logoGroup.rotation.y = baseRotY + Math.sin(t * Math.PI * 2) * 0.3 + gyroX;
      logoGroup.rotation.x = baseRotX + Math.cos(t * Math.PI * 2) * 0.15 + gyroY;
      break;
    }

    case 'sync2d':
    default: {
      // Direct 2D Motion Keyframe Synchronizer into 3D Space
      meshes.forEach((mesh, idx) => {
        const staggerDelay = idx * 0.055;
        const partT = Math.max(0, Math.min(1, (t - staggerDelay) / 0.45));

        // Smooth cubic ease out
        const ease = 1 - Math.pow(1 - partT, 3);
        const dropY = (1 - ease) * 90 * amp;
        const dropZ = (1 - ease) * -70 * amp;
        const rotY = (1 - ease) * Math.PI * 0.4 * amp;

        mesh.position.y = (mesh.userData.baseY || 0) + dropY;
        mesh.position.z = (mesh.userData.baseZ || 0) + dropZ;
        mesh.rotation.y = rotY;
      });
      break;
    }
  }

  // 2. Layer on Stacked Modifiers (if enabled simultaneously)
  if (stack.hoverFloat && mode !== 'turntable') {
    logoGroup.position.y += Math.sin(t * Math.PI * 2) * 14 * amp;
  }

  if (stack.turntableSpin && mode !== 'turntable') {
    logoGroup.rotation.y += (t * Math.PI * 2);
  }

  if (stack.harmonicWave && mode !== 'wave') {
    meshes.forEach((mesh, idx) => {
      mesh.position.z += Math.sin(t * Math.PI * 4 - idx * 0.5) * 12 * amp;
    });
  }

  if (stack.lightSweep && mode !== 'sweep') {
    const angle = t * Math.PI * 2;
    lights.rimLight.position.x = Math.cos(angle) * 360;
    lights.rimLight.position.z = Math.sin(angle) * 360;
  }
}

/**
 * Export 3D GLTF / GLB Binary Model
 */
export function exportThreeGLTF(scene: THREE.Scene, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.glb`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

/**
 * Export Transparent PNG Snapshot
 */
export function exportThreeSnapshot(
  renderer: THREE.WebGLRenderer,
  filename: string
): void {
  const dataUrl = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}-3d-snapshot.png`;
  a.click();
}
