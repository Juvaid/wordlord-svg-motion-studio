import { GLYPH_PATHS } from '../data/vectorPaths';

export interface VideoExportOptions {
  duration: number;
  fps?: number;
  width?: number;
  height?: number;
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

/**
 * Pre-compiled Path2D instances for 100% reliable hardware fallback
 */
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

  // Initialize Offscreen Output Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not obtain 2D Canvas context for video export.');

  // Target Stage SVG
  const stage = document.getElementById('stage-wrapper');
  const svgEl = document.getElementById('main-stage-svg') as SVGElement | null;
  if (!stage || !svgEl) throw new Error('Stage SVG element not found in DOM.');

  // Detect optimal browser supported mime-type
  let mimeType = 'video/webm';
  let extension: 'mp4' | 'webm' = 'webm';

  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
      extension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
      extension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
      extension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
      extension = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
      extension = 'webm';
    }
  }

  // Set up MediaRecorder Stream
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 20000000 // 20 Mbps master quality
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

  // Draw background according to user config
  const drawBackground = () => {
    if (bgChoice === 'theme') {
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 20,
        width / 2, height / 2, Math.max(width, height) * 0.65
      );
      grad.addColorStop(0, '#181d2a');
      grad.addColorStop(0.5, '#0a0d14');
      grad.addColorStop(1, '#050608');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#07080c';
    }
    ctx.fillRect(0, 0, width, height);
  };

  // Dimensions & Coordinates
  const markAspect = 25 / 26;
  let targetHeight = height * 0.72;
  let targetWidth = targetHeight * markAspect;

  if (targetWidth > width * 0.8) {
    targetWidth = width * 0.8;
    targetHeight = targetWidth / markAspect;
  }

  const dx = (width - targetWidth) / 2;
  const dy = (height - targetHeight) / 2;

  // Render Each Frame
  for (let f = 0; f < totalFrames; f++) {
    const frameStartTime = performance.now();
    const p = f / totalFrames;

    // 1. Seek animation engine to exact frame time
    await seekFrame(p);
    // Allow paint pipeline to flush
    await new Promise(r => requestAnimationFrame(r));

    // 2. Clear canvas and draw background
    drawBackground();

    // 3. Serialize live SVG DOM with inlined computed styles
    const svgClone = svgEl.cloneNode(true) as SVGElement;
    
    // Strip complex multiline filter that can break standalone XML parsers
    const defs = svgClone.querySelector('defs');
    if (defs) {
      const glowFilter = defs.querySelector('#unclipped-media-glow');
      if (glowFilter) glowFilter.remove();
    }
    const mediaGroup = svgClone.querySelector('#group-media');
    if (mediaGroup) {
      mediaGroup.removeAttribute('filter');
    }

    // Bake computed styles from the live DOM elements onto the cloned nodes
    const origElements = Array.from(svgEl.querySelectorAll('*')) as (HTMLElement | SVGElement)[];
    const cloneElements = Array.from(svgClone.querySelectorAll('*')) as (HTMLElement | SVGElement)[];

    for (let i = 0; i < origElements.length; i++) {
      const orig = origElements[i];
      const cln = cloneElements[i];
      if (!orig || !cln || cln.nodeName === 'defs' || cln.nodeName === 'filter') continue;

      const cs = window.getComputedStyle(orig);
      if (cs.transform && cs.transform !== 'none') cln.style.transform = cs.transform;
      if (cs.transformOrigin) cln.style.transformOrigin = cs.transformOrigin;
      if (cs.opacity) cln.style.opacity = cs.opacity;
      if (cs.fill && cs.fill !== 'none') cln.style.fill = cs.fill;
      if (cs.fillOpacity) cln.style.fillOpacity = cs.fillOpacity;
      if (cs.stroke && cs.stroke !== 'none') cln.style.stroke = cs.stroke;
      if (cs.strokeWidth) cln.style.strokeWidth = cs.strokeWidth;
      if (cs.strokeDasharray && cs.strokeDasharray !== 'none') cln.style.strokeDasharray = cs.strokeDasharray;
      if (cs.strokeDashoffset) cln.style.strokeDashoffset = cs.strokeDashoffset;
      if (cs.visibility) cln.style.visibility = cs.visibility;
      if (cs.display) cln.style.display = cs.display;
      if (cs.clipPath && cs.clipPath !== 'none') cln.style.clipPath = cs.clipPath;
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
    let imageLoaded = false;

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => { imageLoaded = true; resolve(); };
        img.onerror = (err) => reject(err);
        img.src = blobUrl;
      });

      // 4. Render volumetric glow layer with Canvas 2D
      if (layerVisibility.glow && glowIntensity > 0 && glowRadius > 0) {
        ctx.save();
        ctx.shadowColor = colors.media;
        ctx.shadowBlur = Math.min(80, (glowRadius * (width / 1920) * (glowIntensity / 100)) * 1.8);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
        ctx.restore();
      }

      // 5. Draw crisp vector mark foreground
      ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
    } catch {
      // Hardware Fallback: Direct Canvas 2D Path rendering
      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(targetWidth / 25, targetHeight / 26);

      if (layerVisibility.glow && glowRadius > 0) {
        ctx.shadowColor = colors.media;
        ctx.shadowBlur = glowRadius * 0.8;
      }

      // Line 1: WORD
      if (layerVisibility.word) {
        ctx.fillStyle = colors.word;
        ctx.fill(PATH_2D_CACHE.wordW);
        ctx.fill(PATH_2D_CACHE.wordO);
        ctx.fill(PATH_2D_CACHE.wordR);
      }

      // Line 2: LORD
      if (layerVisibility.lord) {
        ctx.fillStyle = colors.lord;
        ctx.fill(PATH_2D_CACHE.lordL);
        ctx.fill(PATH_2D_CACHE.lordO);
        ctx.fill(PATH_2D_CACHE.lordR);
      }

      // Monolith Ligature D
      if (layerVisibility.ligature) {
        ctx.fillStyle = colors.ligature;
        ctx.fill(PATH_2D_CACHE.ligatureD);
      }

      // Line 3: MEDIA
      if (layerVisibility.media) {
        ctx.fillStyle = colors.media;
        ctx.fill(PATH_2D_CACHE.mediaM);
        ctx.fill(PATH_2D_CACHE.mediaE);
        ctx.fill(PATH_2D_CACHE.mediaD);
        ctx.fill(PATH_2D_CACHE.mediaI);
        ctx.fill(PATH_2D_CACHE.mediaA);
      }

      ctx.restore();
    } finally {
      URL.revokeObjectURL(blobUrl);
    }

    // 6. Maintain precise 60 FPS real-time cadence for MediaRecorder
    const elapsed = performance.now() - frameStartTime;
    const remainingWait = Math.max(0, frameIntervalMs - elapsed);
    if (remainingWait > 0) {
      await new Promise(r => setTimeout(r, remainingWait));
    }

    if (onProgress) {
      onProgress(p, f + 1, totalFrames);
    }
  }

  // Hold final frame slightly for clean playback ending
  await new Promise(r => setTimeout(r, 200));

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
