import { GLYPH_PATHS } from '../data/vectorPaths';

export interface VideoExportOptions {
  duration: number;
  fps?: number;
  width?: number;
  height?: number;
  bitrate?: number; // Video bitrate in bps (e.g. 50_000_000 for 50 Mbps)
  format?: 'auto' | 'mp4' | 'webm';
  markScale?: number; // Scaling ratio of logo inside canvas (0.7 to 0.98)
  presetName?: string;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
  glowRadius?: number;
  glowIntensity?: number;
  geometryMode?: 'fill' | 'stroke' | 'hybrid';
  strokeWidth?: number;
  tiltX?: number;
  tiltY?: number;
  bgChoice?: 'theme' | 'black';
  bgGradient?: string;
  layerVisibility?: {
    master: boolean;
    word: boolean;
    lord: boolean;
    ligature: boolean;
    media: boolean;
    glow: boolean;
  };
  onProgress?: (progress: number, frame: number, totalFrames: number) => void;
  seekFrame: (p: number) => Promise<void> | void;
}

export interface VideoExportResult {
  blob: Blob;
  mimeType: string;
  extension: 'mp4' | 'webm';
  filename: string;
}

// Pre-compiled Path2D instances for fail-safe hardware fallback
const PATH_2D_CACHE = {
  wordW: new Path2D(GLYPH_PATHS.wordW),
  wordO: new Path2D(GLYPH_PATHS.wordO),
  wordR: new Path2D(GLYPH_PATHS.wordR),
  lordL: new Path2D(GLYPH_PATHS.lordL),
  lordO: new Path2D(GLYPH_PATHS.lordO),
  lordR: new Path2D(GLYPH_PATHS.lordR),
  ligatureD: new Path2D(GLYPH_PATHS.ligatureD),
  mediaM: new Path2D(GLYPH_PATHS.mediaM),
  mediaE: new Path2D(GLYPH_PATHS.mediaE),
  mediaD: new Path2D(GLYPH_PATHS.mediaD),
  mediaI: new Path2D(GLYPH_PATHS.mediaI),
  mediaA: new Path2D(GLYPH_PATHS.mediaA)
};

export async function renderAnimationToVideo(options: VideoExportOptions): Promise<VideoExportResult> {
  const {
    duration,
    fps = 60,
    width = 1920,
    height = 1080,
    bitrate = 45000000, // 45 Mbps ultra cinema default
    format = 'auto',
    markScale = 0.88, // Default 88% screen occupancy for bold, cinematic presence
    presetName = 'motion',
    colors,
    glowRadius = 20,
    glowIntensity = 100,
    geometryMode = 'fill',
    strokeWidth = 1.0,
    tiltX = 0,
    tiltY = 0,
    bgChoice = 'theme',
    bgGradient,
    layerVisibility = { master: true, word: true, lord: true, ligature: true, media: true, glow: true },
    onProgress,
    seekFrame
  } = options;

  const totalFrames = Math.max(1, Math.round(duration * fps));
  const frameIntervalMs = 1000 / fps;

  // Initialize Offscreen Output Canvas with High Smoothing
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not obtain 2D Canvas context for video export.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Double-buffering: Offscreen scratch canvas for complete, flicker-free atomic frame blitting
  const bufferCanvas = document.createElement('canvas');
  bufferCanvas.width = width;
  bufferCanvas.height = height;
  const bCtx = bufferCanvas.getContext('2d');
  if (!bCtx) throw new Error('Could not obtain scratch canvas buffer context.');
  bCtx.imageSmoothingEnabled = true;
  bCtx.imageSmoothingQuality = 'high';

  // Target Stage SVG
  const stage = document.getElementById('stage-wrapper');
  const svgEl = document.getElementById('main-stage-svg') as SVGElement | null;
  if (!stage || !svgEl) throw new Error('Stage SVG element not found in DOM.');

  // Codec candidates prioritized by quality profile
  const mp4Codecs = [
    'video/mp4;codecs=avc1.64002A', // H.264 High Profile Level 4.2
    'video/mp4;codecs=avc1.640028', // H.264 High Profile Level 4.0
    'video/mp4;codecs=avc1.4d4020', // H.264 Main Profile Level 3.2
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4'
  ];

  const webmCodecs = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  let mimeType = 'video/webm';
  let extension: 'mp4' | 'webm' = 'webm';

  if (typeof MediaRecorder !== 'undefined') {
    if (format === 'mp4') {
      const match = mp4Codecs.find(c => MediaRecorder.isTypeSupported(c));
      if (match) {
        mimeType = match;
        extension = 'mp4';
      } else {
        const webmMatch = webmCodecs.find(c => MediaRecorder.isTypeSupported(c));
        if (webmMatch) {
          mimeType = webmMatch;
          extension = 'webm';
        }
      }
    } else if (format === 'webm') {
      const match = webmCodecs.find(c => MediaRecorder.isTypeSupported(c));
      if (match) {
        mimeType = match;
        extension = 'webm';
      }
    } else {
      // Auto mode: test MP4 High Profile, then VP9
      const mp4Match = mp4Codecs.find(c => MediaRecorder.isTypeSupported(c));
      const webmMatch = webmCodecs.find(c => MediaRecorder.isTypeSupported(c));
      if (mp4Match) {
        mimeType = mp4Match;
        extension = 'mp4';
      } else if (webmMatch) {
        mimeType = webmMatch;
        extension = 'webm';
      }
    }
  }

  // Set up MediaRecorder Stream with high bitrate (up to 100 Mbps)
  const stream = canvas.captureStream(fps);
  const videoTrack = stream.getVideoTracks()[0] as any;

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: bitrate
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start();

  // Draw background onto the scratch buffer
  const drawBackgroundToBuffer = () => {
    if (bgChoice === 'theme') {
      const grad = bCtx.createRadialGradient(
        width / 2, height / 2, 20,
        width / 2, height / 2, Math.max(width, height) * 0.65
      );
      grad.addColorStop(0, '#1c2232');
      grad.addColorStop(0.45, '#0b0e16');
      grad.addColorStop(1, '#050608');
      bCtx.fillStyle = grad;
    } else {
      bCtx.fillStyle = '#07080c';
    }
    bCtx.fillRect(0, 0, width, height);
  };

  // Dimensions & Coordinates calculation with user-selected markScale (88% default)
  const markAspect = 25 / 26;
  let targetHeight = height * markScale;
  let targetWidth = targetHeight * markAspect;

  if (targetWidth > width * markScale) {
    targetWidth = width * markScale;
    targetHeight = targetWidth / markAspect;
  }

  const dx = (width - targetWidth) / 2;
  const dy = (height - targetHeight) / 2;

  // The 12 Vector Glyphs & 4 Group Container IDs
  const animatedGlyphIds = [
    'glyph-word-w', 'glyph-word-o', 'glyph-word-r',
    'glyph-lord-l', 'glyph-lord-o', 'glyph-lord-r',
    'glyph-ligature-d',
    'glyph-media-m', 'glyph-media-e', 'glyph-media-d', 'glyph-media-i', 'glyph-media-a'
  ];

  const animatedGroupIds = [
    'group-word', 'group-lord', 'group-ligature', 'group-media'
  ];

  const startTime = performance.now();

  // Render Each Frame at 60 FPS
  for (let f = 0; f < totalFrames; f++) {
    const p = totalFrames > 1 ? f / (totalFrames - 1) : 1;

    // 1. Seek live DOM animation engine to exact frame progress
    await seekFrame(p);
    // Allow browser rendering engine to evaluate CSS animation keyframes
    await new Promise(r => requestAnimationFrame(r));

    // 2. Draw background to offscreen buffer ONLY (keeps recorder canvas intact)
    drawBackgroundToBuffer();

    // 3. Clone SVG and strip problematic elements
    const svgClone = svgEl.cloneNode(true) as SVGElement;
    
    // Crucial: remove complex multiline filter from defs that triggers XML parser errors
    const defs = svgClone.querySelector('defs');
    if (defs) {
      const glowFilter = defs.querySelector('#unclipped-media-glow');
      if (glowFilter) glowFilter.remove();
    }
    const mediaGroup = svgClone.querySelector('#group-media');
    if (mediaGroup) {
      mediaGroup.removeAttribute('filter');
    }

    // Crucial: Fix the white square bug! Remove #laser-sweep-rect unless this is the laser preset
    const isLaserPreset = presetName.toLowerCase().includes('laser');
    const laserRect = svgClone.querySelector('#laser-sweep-rect') as SVGElement | null;
    if (laserRect) {
      if (!isLaserPreset) {
        laserRect.remove();
      } else {
        laserRect.removeAttribute('class');
        laserRect.style.display = 'block';
      }
    }

    // 4. Bake live computed styles directly onto cloned nodes by EXACT ID (no index shift!)
    for (const gid of animatedGroupIds) {
      const origG = svgEl.querySelector(`#${gid}`) as HTMLElement | SVGElement | null;
      const clnG = svgClone.querySelector(`#${gid}`) as HTMLElement | SVGElement | null;
      if (!origG || !clnG) continue;

      const cs = window.getComputedStyle(origG);
      if (cs.transform && cs.transform !== 'none') {
        clnG.style.transform = cs.transform;
        clnG.style.transformOrigin = cs.transformOrigin || 'center';
      }
      if (cs.opacity) clnG.style.opacity = cs.opacity;
      if (cs.visibility) clnG.style.visibility = cs.visibility;
    }

    for (const pid of animatedGlyphIds) {
      const origP = svgEl.querySelector(`#${pid}`) as HTMLElement | SVGElement | null;
      const clnP = svgClone.querySelector(`#${pid}`) as HTMLElement | SVGElement | null;
      if (!origP || !clnP) continue;

      const cs = window.getComputedStyle(origP);
      if (cs.transform && cs.transform !== 'none') {
        clnP.style.transform = cs.transform;
        clnP.style.transformOrigin = cs.transformOrigin || 'center';
      }
      if (cs.opacity) clnP.style.opacity = cs.opacity;
      if (cs.fill && cs.fill !== 'none') clnP.style.fill = cs.fill;
      if (cs.fillOpacity) clnP.style.fillOpacity = cs.fillOpacity;
      if (cs.stroke && cs.stroke !== 'none') clnP.style.stroke = cs.stroke;
      if (cs.strokeWidth) clnP.style.strokeWidth = cs.strokeWidth;
      if (cs.strokeDasharray && cs.strokeDasharray !== 'none') clnP.style.strokeDasharray = cs.strokeDasharray;
      if (cs.strokeDashoffset) clnP.style.strokeDashoffset = cs.strokeDashoffset;
      if (cs.visibility) clnP.style.visibility = cs.visibility;
      if (cs.clipPath && cs.clipPath !== 'none') clnP.style.clipPath = cs.clipPath;
    }

    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('viewBox', '0 0 25 26');
    svgClone.setAttribute('width', `${targetWidth}`);
    svgClone.setAttribute('height', `${targetHeight}`);
    svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgClone.style.overflow = 'visible';

    // Apply 3D perspective to clone if tilted
    if (tiltX !== 0 || tiltY !== 0) {
      svgClone.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    const svgXml = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const img = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = blobUrl;
      });

      // 5. Render volumetric glow layer with scratch buffer
      if (layerVisibility.glow && glowIntensity > 0 && glowRadius > 0) {
        bCtx.save();
        bCtx.shadowColor = colors.media;
        bCtx.shadowBlur = Math.min(100, (glowRadius * (width / 1920) * (glowIntensity / 100)) * 2.2);
        bCtx.shadowOffsetX = 0;
        bCtx.shadowOffsetY = 0;
        bCtx.drawImage(img, dx, dy, targetWidth, targetHeight);
        bCtx.restore();
      }

      // 6. Draw crisp vector mark foreground to scratch buffer
      bCtx.drawImage(img, dx, dy, targetWidth, targetHeight);
    } catch {
      // Hardware Fallback: Direct Canvas 2D Path rendering to scratch buffer
      bCtx.save();
      bCtx.translate(dx, dy);
      bCtx.scale(targetWidth / 25, targetHeight / 26);

      if (layerVisibility.glow && glowRadius > 0) {
        bCtx.shadowColor = colors.media;
        bCtx.shadowBlur = glowRadius * (targetWidth / 25) * 0.05;
      }

      // Line 1: WORD
      if (layerVisibility.word) {
        bCtx.fillStyle = colors.word;
        bCtx.fill(PATH_2D_CACHE.wordW);
        bCtx.fill(PATH_2D_CACHE.wordO);
        bCtx.fill(PATH_2D_CACHE.wordR);
      }

      // Line 2: LORD
      if (layerVisibility.lord) {
        bCtx.fillStyle = colors.lord;
        bCtx.fill(PATH_2D_CACHE.lordL);
        bCtx.fill(PATH_2D_CACHE.lordO);
        bCtx.fill(PATH_2D_CACHE.lordR);
      }

      // Monolith Ligature D
      if (layerVisibility.ligature) {
        bCtx.fillStyle = colors.ligature;
        bCtx.fill(PATH_2D_CACHE.ligatureD);
      }

      // Line 3: MEDIA
      if (layerVisibility.media) {
        bCtx.fillStyle = colors.media;
        bCtx.fill(PATH_2D_CACHE.mediaM);
        bCtx.fill(PATH_2D_CACHE.mediaE);
        bCtx.fill(PATH_2D_CACHE.mediaD);
        bCtx.fill(PATH_2D_CACHE.mediaI);
        bCtx.fill(PATH_2D_CACHE.mediaA);
      }

      bCtx.restore();
    } finally {
      URL.revokeObjectURL(blobUrl);
    }

    // 7. Atomic Blit: Single instantaneous paint from buffer to recording canvas
    ctx.drawImage(bufferCanvas, 0, 0);

    // Request frame on video track if browser supports it
    if (videoTrack && typeof videoTrack.requestFrame === 'function') {
      videoTrack.requestFrame();
    }

    // 7. Enforce cumulative real-time clock synchronization for MediaRecorder
    const expectedElapsedMs = (f + 1) * frameIntervalMs;
    const actualElapsedMs = performance.now() - startTime;
    const remainingWaitMs = Math.max(0, expectedElapsedMs - actualElapsedMs);
    if (remainingWaitMs > 0) {
      await new Promise(r => setTimeout(r, remainingWaitMs));
    }

    if (onProgress) {
      onProgress(p, f + 1, totalFrames);
    }
  }

  // Hold final frame slightly for clean playback ending
  await new Promise(r => setTimeout(r, 180));

  recorder.stop();
  const videoBlob = await recordPromise;

  const cleanName = presetName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `wordlord-${cleanName}-${width}x${height}.${extension}`;

  return {
    blob: videoBlob,
    mimeType,
    extension,
    filename
  };
}
