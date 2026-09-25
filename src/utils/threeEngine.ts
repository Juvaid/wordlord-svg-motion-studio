import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { ThreePart, ThreeStudioConfig, ThreeMotionMode } from '../types/threeStudio';

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
      visible: true,
      isolated: false,
      isBackground: isBgCandidate
    });

    index++;
  });

  return parts;
}

/**
 * Build Extruded Three.js Meshes from parts with dual materials
 */
export function buildExtrudedParts(
  logoGroup: THREE.Group,
  parts: ThreePart[],
  config: ThreeStudioConfig,
  flutedTexture: THREE.Texture | null
): THREE.Mesh[] {
  // Clear old meshes
  while (logoGroup.children.length > 0) {
    const obj = logoGroup.children[0] as THREE.Mesh;
    if (obj.geometry) obj.geometry.dispose();
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => m.dispose());
    } else if (obj.material) {
      obj.material.dispose();
    }
    logoGroup.remove(obj);
  }

  const meshes: THREE.Mesh[] = [];
  const activeParts = parts.filter(p => p.visible);
  if (activeParts.length === 0) return meshes;

  // Build composite SVG markup so Three.js SVGLoader can compute outer perimeters and inner counter holes
  let combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">`;
  activeParts.forEach(p => {
    combinedSvg += `<path d="${p.pathD}" fill="${p.faceColor}" />`;
  });
  combinedSvg += `</svg>`;

  const loader = new SVGLoader();
  const svgData = loader.parse(combinedSvg);
  const tempGroup = new THREE.Group();

  svgData.paths.forEach((path, pIdx) => {
    const partRef = activeParts[pIdx];
    const totalDepth = Math.max(2, config.depth + (partRef ? partRef.depthOffset : 0));

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: totalDepth,
      bevelEnabled: config.bevelThickness > 0 || config.bevelSize > 0,
      bevelThickness: config.bevelThickness * (partRef ? partRef.bevelScale : 1.0),
      bevelSize: config.bevelSize * (partRef ? partRef.bevelScale : 1.0),
      bevelSegments: config.bevelSegments,
      curveSegments: 16
    };

    const shapes = SVGLoader.createShapes(path);
    const faceColor = partRef ? partRef.faceColor : config.faceColor;
    const sideColor = partRef ? partRef.sideColor : config.sideColor;

    const faceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(faceColor),
      roughness: partRef ? partRef.roughness : config.roughness,
      metalness: partRef ? partRef.metalness : config.metalness,
      clearcoat: config.clearcoat,
      clearcoatRoughness: 0.15,
      transmission: partRef ? partRef.transmission : config.transmission,
      bumpMap: config.flutingEnabled ? flutedTexture : null,
      bumpScale: config.flutingEnabled ? config.fluteScale : 0.0,
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
      geom.scale(1, -1, 1); // SVG Y is inverted relative to WebGL
      geom.computeVertexNormals();

      const mesh = new THREE.Mesh(geom, [faceMat, sideMat]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        index: pIdx,
        partId: partRef ? partRef.id : null,
        name: partRef ? partRef.name : `Part ${pIdx}`,
        baseX: partRef ? partRef.offsetX : 0,
        baseY: partRef ? partRef.offsetY : 0,
        baseZ: partRef ? partRef.offsetZ : 0
      };

      meshes.push(mesh);
      tempGroup.add(mesh);
    });
  });

  // Auto-Center compound geometry
  if (config.autoCenter) {
    const box = new THREE.Box3().setFromObject(tempGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);

    tempGroup.children.forEach((child) => {
      child.position.sub(center);
      child.userData.baseX = child.position.x;
      child.userData.baseY = child.position.y;
      child.userData.baseZ = child.position.z;
    });

    // Auto-scale into comfortable studio camera frame
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const desiredDim = 280;
    const computedScale = maxDim > 0 ? (desiredDim / maxDim) * config.meshScale : 1.0;
    logoGroup.scale.set(computedScale, computedScale, computedScale);
  } else {
    logoGroup.scale.set(config.meshScale, config.meshScale, config.meshScale);
  }

  // Transfer meshes to logoGroup
  while (tempGroup.children.length > 0) {
    logoGroup.add(tempGroup.children[0]);
  }

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
 * Evaluate 3D Animation Motion Frame
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

  const gyroX = config.gyroEnabled ? mouseGyro.x * 0.45 * amp : 0;
  const gyroY = config.gyroEnabled ? -mouseGyro.y * 0.3 * amp : 0;

  const activeParts = parts.filter(p => p.visible);

  switch (mode) {
    case 'reveal': {
      logoGroup.rotation.y = gyroX;
      logoGroup.rotation.x = gyroY;
      logoGroup.position.set(0, 0, 0);

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
      });
      break;
    }

    case 'turntable': {
      resetMeshesToOrigin(meshes);
      logoGroup.rotation.y = (t * Math.PI * 2) + gyroX;
      logoGroup.rotation.x = (Math.sin(t * Math.PI * 4) * 0.08 * amp) + gyroY;
      logoGroup.position.y = Math.sin(t * Math.PI * 2) * 8 * amp;
      break;
    }

    case 'wave': {
      logoGroup.rotation.y = (Math.sin(t * Math.PI * 2) * 0.2) + gyroX;
      logoGroup.rotation.x = gyroY;
      logoGroup.position.set(0, 0, 0);

      meshes.forEach((mesh, idx) => {
        const partRef = activeParts[mesh.userData.index];
        const phase = partRef ? (partRef.phaseDelay * 10) : (idx * 0.6);
        const wave = Math.sin(t * Math.PI * 4 - phase);

        mesh.position.z = (mesh.userData.baseZ || 0) + wave * 22 * amp;
        mesh.position.y = (mesh.userData.baseY || 0) + Math.cos(t * Math.PI * 4 - phase) * 6 * amp;
        mesh.rotation.x = wave * 0.18 * amp;
        mesh.rotation.y = 0;
      });
      break;
    }

    case 'sweep': {
      resetMeshesToOrigin(meshes);
      logoGroup.rotation.y = (Math.sin(t * Math.PI * 2) * 0.15) + gyroX;
      logoGroup.rotation.x = gyroY;

      const angle = t * Math.PI * 2;
      lights.rimLight.position.x = Math.cos(angle) * 360;
      lights.rimLight.position.z = Math.sin(angle) * 360;
      lights.keyLight.intensity = config.keyIntensity * (1 + Math.sin(angle * 2) * 0.35);
      break;
    }

    case 'explode': {
      logoGroup.rotation.y = gyroX;
      logoGroup.rotation.x = gyroY;

      const explodePhase = Math.sin(t * Math.PI) * amp;

      meshes.forEach((mesh, idx) => {
        const angle = (idx / Math.max(1, meshes.length)) * Math.PI * 2;
        const blastDistance = 80 * explodePhase;

        mesh.position.x = (mesh.userData.baseX || 0) + Math.cos(angle) * blastDistance;
        mesh.position.y = (mesh.userData.baseY || 0) + Math.sin(angle) * blastDistance * 0.5;
        mesh.position.z = (mesh.userData.baseZ || 0) + Math.sin(angle * 2) * 40 * explodePhase;
        mesh.rotation.y = angle * explodePhase;
      });
      break;
    }

    case 'camera': {
      resetMeshesToOrigin(meshes);
      logoGroup.rotation.y = Math.sin(t * Math.PI * 2) * 0.3 + gyroX;
      logoGroup.rotation.x = Math.cos(t * Math.PI * 2) * 0.15 + gyroY;
      break;
    }
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
