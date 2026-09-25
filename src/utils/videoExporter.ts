export interface VideoExportOptions {
  duration: number;
  fps?: number;
  width?: number;
  height?: number;
  bgColor?: string;
  bgGradient?: string;
  presetName?: string;
  onProgress?: (progress: number, frame: number, totalFrames: number) => void;
  seekFrame: (p: number) => Promise<void> | void;
}

export interface VideoExportResult {
  blob: Blob;
  mimeType: string;
  extension: 'mp4' | 'webm';
  filename: string;
}

export async function renderAnimationToVideo(options: VideoExportOptions): Promise<VideoExportResult> {
  const {
    duration,
    fps = 60,
    width = 1920,
    height = 1080,
    bgColor = '#07080c',
    bgGradient,
    presetName = 'motion',
    onProgress,
    seekFrame
  } = options;

  const totalFrames = Math.max(1, Math.round(duration * fps));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not obtain 2D Canvas context.');

  // Detect supported video mime types
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

  // Create stream from offscreen canvas
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16000000 // 16 Mbps high quality
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

  // Helper to draw background
  const drawBackground = () => {
    if (bgGradient && bgGradient.includes('radial-gradient')) {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.65);
      grad.addColorStop(0, '#1a1f2e');
      grad.addColorStop(1, '#050608');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, width, height);
  };

  // Target stage element
  const stage = document.getElementById('stage-wrapper');
  const svgEl = document.getElementById('main-stage-svg') as SVGElement | null;
  if (!stage || !svgEl) throw new Error('Stage SVG element not found in DOM.');

  const frameIntervalMs = 1000 / fps;

  // Render each frame sequentially
  for (let f = 0; f < totalFrames; f++) {
    const p = f / totalFrames;

    // 1. Position animation engine at frame progress
    await seekFrame(p);
    // Allow browser layout paint cycle to flush styles
    await new Promise(r => setTimeout(r, Math.min(25, frameIntervalMs / 2)));

    // 2. Clear & draw background
    drawBackground();

    // 3. Serialize live SVG DOM to SVG Data URL
    const svgClone = svgEl.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('width', `${width}`);
    svgClone.setAttribute('height', `${height}`);

    const svgXml = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.src = blobUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load rasterized SVG frame.'));
      });

      // Calculate crisp center fit
      const markAspect = 25 / 26;
      let targetHeight = height * 0.72;
      let targetWidth = targetHeight * markAspect;

      if (targetWidth > width * 0.8) {
        targetWidth = width * 0.8;
        targetHeight = targetWidth / markAspect;
      }

      const dx = (width - targetWidth) / 2;
      const dy = (height - targetHeight) / 2;

      ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
    } catch {
      // Continue if frame rasterization had micro-glitch
    } finally {
      URL.revokeObjectURL(blobUrl);
    }

    if (onProgress) {
      onProgress(p, f + 1, totalFrames);
    }
  }

  // Hold last frame slightly for clean ending
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
