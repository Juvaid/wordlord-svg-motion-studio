// scripts/test-suite.js
// Automated Verification Test Suite for WordLord SVG Motion Studio using Vite SSR loader
import assert from 'node:assert';
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

const { MOTIONS } = await vite.ssrLoadModule('/src/data/motions.ts');
const { STYLES } = await vite.ssrLoadModule('/src/data/styles.ts');
const { THREE_ASSET_PRESETS, PBR_PRESETS, LIGHTING_RIGS } = await vite.ssrLoadModule('/src/data/threePresets.ts');
const { validateProjectSnapshot } = await vite.ssrLoadModule('/src/utils/projectState.ts');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('  WordLord SVG Motion Studio — Automated Test Suite   ');
console.log('======================================================\n');

// 1. Motion Presets Integrity
console.log('--- Suite 1: 2D Kinetic Motion Presets ---');
test('All 12 motion presets exist and have valid IDs', () => {
  assert.ok(MOTIONS.length >= 12, `Expected >= 12 motions, got ${MOTIONS.length}`);
  const ids = new Set();
  for (const m of MOTIONS) {
    assert.ok(m.id && typeof m.id === 'string', 'Motion id must be string');
    assert.ok(m.name && typeof m.name === 'string', `Motion ${m.id} missing name`);
    assert.ok(m.defaultDuration > 0, `Motion ${m.id} defaultDuration must be > 0`);
    assert.ok(m.animClass.startsWith('anim-'), `Motion ${m.id} animClass must start with anim-`);
    assert.ok(!ids.has(m.id), `Duplicate motion id: ${m.id}`);
    ids.add(m.id);
  }
});

// 2. Optical Style Presets Integrity
console.log('\n--- Suite 2: Optical Style Presets ---');
test('All 8 style presets have valid hex color tokens', () => {
  assert.ok(STYLES.length >= 8, `Expected >= 8 styles, got ${STYLES.length}`);
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  for (const s of STYLES) {
    assert.ok(s.id && s.name, 'Style must have id and name');
    assert.ok(hexRegex.test(s.fillWord), `Style ${s.id} invalid fillWord: ${s.fillWord}`);
    assert.ok(hexRegex.test(s.fillLord), `Style ${s.id} invalid fillLord: ${s.fillLord}`);
    assert.ok(hexRegex.test(s.fillLigature), `Style ${s.id} invalid fillLigature: ${s.fillLigature}`);
    assert.ok(hexRegex.test(s.fillMedia), `Style ${s.id} invalid fillMedia: ${s.fillMedia}`);
    assert.ok(s.glowRadius >= 0, `Style ${s.id} glowRadius must be >= 0`);
  }
});

// 3. 3D PBR Material Presets
console.log('\n--- Suite 3: 3D PBR Material Presets ---');
test('All PBR presets have physical attributes in [0, 1]', () => {
  assert.ok(PBR_PRESETS.length >= 6, `Expected >= 6 PBR presets, got ${PBR_PRESETS.length}`);
  for (const p of PBR_PRESETS) {
    assert.ok(p.roughness >= 0 && p.roughness <= 1, `PBR ${p.id} roughness out of bounds: ${p.roughness}`);
    assert.ok(p.metalness >= 0 && p.metalness <= 1, `PBR ${p.id} metalness out of bounds: ${p.metalness}`);
    assert.ok(p.faceColor.startsWith('#'), `PBR ${p.id} invalid faceColor`);
    assert.ok(p.sideColor.startsWith('#'), `PBR ${p.id} invalid sideColor`);
  }
});

// 4. Studio Lighting Rigs
console.log('\n--- Suite 4: Studio Lighting Rigs ---');
test('All Lighting Rigs have positive intensities and valid colors', () => {
  assert.ok(LIGHTING_RIGS.length >= 4, `Expected >= 4 rigs, got ${LIGHTING_RIGS.length}`);
  for (const r of LIGHTING_RIGS) {
    assert.ok(r.keyIntensity > 0, `Rig ${r.id} keyIntensity must be > 0`);
    assert.ok(r.rimIntensity >= 0, `Rig ${r.id} rimIntensity must be >= 0`);
    assert.ok(r.fillIntensity >= 0, `Rig ${r.id} fillIntensity must be >= 0`);
    assert.ok(r.keyColor.startsWith('#'), `Rig ${r.id} invalid keyColor`);
    assert.ok(r.rimColor.startsWith('#'), `Rig ${r.id} invalid rimColor`);
  }
});

// 5. 3D Asset Presets & SVG Strings
console.log('\n--- Suite 5: 3D Asset Presets ---');
test('All 3D asset presets have valid SVG XML strings with viewBox', () => {
  assert.ok(THREE_ASSET_PRESETS.length >= 5, `Expected >= 5 asset presets, got ${THREE_ASSET_PRESETS.length}`);
  for (const a of THREE_ASSET_PRESETS) {
    assert.ok(a.id && a.name, 'Asset must have id and name');
    assert.ok(a.svgString.includes('<svg') && a.svgString.includes('</svg>'), `Asset ${a.id} missing svg tags`);
    assert.ok(a.viewBox && typeof a.viewBox === 'string', `Asset ${a.id} missing viewBox`);
  }
});

// 6. Project State Validation & Deserialization
console.log('\n--- Suite 6: Project State Serialization & Sanitization ---');
test('validateProjectSnapshot supplies safe defaults for empty object', () => {
  const result = validateProjectSnapshot({});
  assert.strictEqual(result.version, '5.0.0');
  assert.strictEqual(result.studioMode, '2d');
  assert.strictEqual(result.activeMotionId, 'typewriter');
  assert.strictEqual(result.activeStyleId, 'signature');
  assert.strictEqual(result.duration, 1.0);
  assert.strictEqual(result.geometryMode, 'fill');
  assert.strictEqual(result.colors.word, '#ffffff');
  assert.strictEqual(result.colors.media, '#ff4e2e');
  assert.ok(Array.isArray(result.threeParts));
});

test('validateProjectSnapshot throws on null or non-object', () => {
  assert.throws(() => validateProjectSnapshot(null), /valid JSON object/);
  assert.throws(() => validateProjectSnapshot("string"), /valid JSON object/);
});

test('validateProjectSnapshot preserves valid custom snapshot', () => {
  const custom = {
    version: '5.1.0',
    timestamp: 1700000000000,
    actionName: 'Custom Export Test',
    studioMode: '3d',
    activeMotionId: 'depth-slam',
    activeStyleId: 'electric-amber',
    duration: 3.5,
    stagger: 45,
    glowRadius: 28,
    glowIntensity: 90,
    geometryMode: 'stroke',
    strokeWidth: 2.5,
    tiltX: 12,
    tiltY: -8,
    colors: {
      word: '#ffcc00',
      lord: '#ff9900',
      ligature: '#ffffff',
      media: '#00ccff'
    },
    threeConfig: { depth: 40 },
    threeParts: []
  };
  const result = validateProjectSnapshot(custom);
  assert.strictEqual(result.version, '5.1.0');
  assert.strictEqual(result.studioMode, '3d');
  assert.strictEqual(result.activeMotionId, 'depth-slam');
  assert.strictEqual(result.duration, 3.5);
  assert.strictEqual(result.geometryMode, 'stroke');
  assert.strictEqual(result.colors.word, '#ffcc00');
  assert.strictEqual(result.colors.media, '#00ccff');
});

// 7. 3D Motion Physics & Kinematics Evaluation
console.log('\n--- Suite 7: 3D Motion Engines Kinematics ---');
await test('evaluate3DMotion computes valid finite transforms for all 17 presets at all keyframe intervals', async () => {
  const THREE = await vite.ssrLoadModule('three');
  const { evaluate3DMotion } = await vite.ssrLoadModule('/src/utils/threeEngine.ts');

  const logoGroup = new THREE.Group();
  const meshes = [
    new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10)),
    new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10)),
    new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10))
  ];
  meshes.forEach((m, idx) => {
    m.userData = { index: idx, name: idx === 1 ? 'D' : 'W', baseX: idx * 20, baseY: 0, baseZ: 0 };
    logoGroup.add(m);
  });

  const lights = {
    keyLight: new THREE.DirectionalLight(0xffffff, 1.2),
    rimLight: new THREE.DirectionalLight(0x38bdf8, 1.0)
  };

  const dummyConfig = {
    time: 0,
    duration: 4,
    speed: 1,
    amplitude: 1.0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    keyIntensity: 1.2,
    rimIntensity: 1.0,
    gyroEnabled: false,
    stackedEffects: { hoverFloat: false, turntableSpin: false, harmonicWave: false, lightSweep: false, gyroTilt: false, sync2dMotion: false }
  };

  const parts = [
    { id: 'p1', name: 'W', visible: true, phaseDelay: 0.05 },
    { id: 'p2', name: 'D', visible: true, phaseDelay: 0.15 },
    { id: 'p3', name: 'M', visible: true, phaseDelay: 0.25 }
  ];

  const allModes = [
    'typewriter', 'reveal', 'depth-slam', 'ligature-clamp', 'origami', 
    'wiredraw', 'liquid-wipe', 'laser-sweep', 'sweep', 'cyber-glitch', 
    'pulse-glow', 'split-converge', 'matrix-rain', 'elastic-pop', 
    'turntable', 'wave', 'explode', 'camera', 'sync2d'
  ];

  const testTimestamps = [0.0, 0.25, 0.5, 0.75, 1.0];

  for (const mode of allModes) {
    for (const t of testTimestamps) {
      evaluate3DMotion(
        logoGroup,
        meshes,
        mode,
        t,
        1.0,
        { x: 0, y: 0 },
        lights,
        dummyConfig,
        parts
      );

      assert.ok(Number.isFinite(logoGroup.position.x), `${mode}@${t}: logoGroup.position.x is not finite`);
      assert.ok(Number.isFinite(logoGroup.position.y), `${mode}@${t}: logoGroup.position.y is not finite`);
      assert.ok(Number.isFinite(logoGroup.position.z), `${mode}@${t}: logoGroup.position.z is not finite`);
      assert.ok(Number.isFinite(logoGroup.rotation.x), `${mode}@${t}: logoGroup.rotation.x is not finite`);
      assert.ok(Number.isFinite(logoGroup.rotation.y), `${mode}@${t}: logoGroup.rotation.y is not finite`);
      assert.ok(Number.isFinite(logoGroup.rotation.z), `${mode}@${t}: logoGroup.rotation.z is not finite`);

      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        assert.ok(Number.isFinite(m.position.x), `${mode}@${t}: mesh[${i}].position.x is not finite`);
        assert.ok(Number.isFinite(m.position.y), `${mode}@${t}: mesh[${i}].position.y is not finite`);
        assert.ok(Number.isFinite(m.position.z), `${mode}@${t}: mesh[${i}].position.z is not finite`);
        assert.ok(Number.isFinite(m.scale.x), `${mode}@${t}: mesh[${i}].scale.x is not finite`);
      }
    }
  }
});

// Close Vite Server
await vite.close();

// Summary
console.log('\n======================================================');
console.log(`  Tests Passed: ${passed} | Failed: ${failed}            `);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
