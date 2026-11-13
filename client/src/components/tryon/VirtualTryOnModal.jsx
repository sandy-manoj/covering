import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Sparkles, Upload, RotateCw } from 'lucide-react';
import { getMediaPipeLandmarkers } from '../../tryon/mediaPipeLoader';

const VirtualTryOnModal = ({ product, onClose, allProducts = [], onSelectProduct }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const streamRef = useRef(null);

  const [scaleSlider, setScaleSlider] = useState(1.0);
  const [heightAdjust, setHeightAdjust] = useState(0);
  const [facingMode, setFacingMode] = useState('user');
  const [isDetected, setIsDetected] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Customization in Try-On
  const [customInitials, setCustomInitials] = useState('');
  const [selectedChainStyle, setSelectedChainStyle] = useState(product?.style || 'haram');
  const [selectedGoldTone, setSelectedGoldTone] = useState('yellowGold'); // 'yellowGold', 'antiqueGold', 'roseGold'

  useEffect(() => {
    if (product?.style) {
      setSelectedChainStyle(product.style);
    }
  }, [product]);

  const smoothedRef = useRef({
    leftNeck: null, rightNeck: null, neckSag: null,
    shoulderWidth: null, rollAngle: 0
  });

  // ─── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } }, // Low res video for 60fps performance
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
        setCameraError('Camera access denied. Please grant camera permission or upload a photo.');
      else
        setCameraError('Unable to open camera. Please check your camera settings.');
    }
  }, [facingMode]);

  // ─── Realistic Distinct Chain Renderer for Each Style ───────────────────────
  const drawRealisticChain = useCallback((ctx, P0, P1, P2, linkSize, style, goldTone) => {
    const isHaram = style === 'haram' || style === 'temple';
    const isCuban = style === 'cuban' || style === 'curb';
    const isBox = style === 'box';
    const isRope = style === 'rope' || !style;
    const isMugappu = style === 'mugappu';

    // Link count & size based on style
    const numLinks = isHaram ? 45 : (isCuban ? 36 : 52);
    const linkW = isCuban ? linkSize * 1.8 : (isBox ? linkSize * 1.2 : linkSize * 1.55);
    const linkH = isCuban ? linkSize * 0.9 : (isBox ? linkSize * 1.1 : linkSize * 0.68);

    // 1. Drop shadow pass
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    ctx.quadraticCurveTo(P1.x, P1.y, P2.x, P2.y);
    ctx.lineWidth = linkH * 2.2;
    ctx.strokeStyle = 'rgba(0,0,0,0.001)';
    ctx.stroke();
    ctx.restore();

    // 2. Per-link interlocked drawing with distinct style geometry
    for (let i = 0; i < numLinks; i++) {
      const t = i / (numLinks - 1);
      const bx = (1-t)*(1-t)*P0.x + 2*(1-t)*t*P1.x + t*t*P2.x;
      const by = (1-t)*(1-t)*P0.y + 2*(1-t)*t*P1.y + t*t*P2.y;
      const dx = 2*(1-t)*(P1.x-P0.x) + 2*t*(P2.x-P1.x);
      const dy = 2*(1-t)*(P1.y-P0.y) + 2*t*(P2.y-P1.y);
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);

      // Gold tone gradient palette
      const g = ctx.createLinearGradient(-linkW, -linkH, linkW, linkH);
      if (goldTone === 'antiqueGold' || isHaram) {
        g.addColorStop(0,    '#F0D890');
        g.addColorStop(0.2,  '#D4AF37');
        g.addColorStop(0.5,  '#AA8022');
        g.addColorStop(0.8,  '#785410');
        g.addColorStop(1,    '#C49E30');
      } else if (goldTone === 'roseGold') {
        g.addColorStop(0,    '#FFD1C1');
        g.addColorStop(0.3,  '#E59A84');
        g.addColorStop(0.7,  '#B86B54');
        g.addColorStop(1,    '#FFC5B2');
      } else {
        // 24K Yellow Gold
        g.addColorStop(0,    '#FFF8C0');
        g.addColorStop(0.22, '#FFD54F');
        g.addColorStop(0.5,  '#D4AF37');
        g.addColorStop(0.8,  '#9A7010');
        g.addColorStop(1,    '#FFF0A0');
      }

      ctx.shadowColor = 'rgba(0,0,0,0)';
      ctx.shadowBlur = 0;

      if (isHaram) {
        // Traditional Temple Haram: Cast Gold Fluted Beads with side pearl accents
        ctx.beginPath();
        ctx.arc(0, 0, linkSize * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#5E410B';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tiny ruby or green center accent on every 3rd bead
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, linkSize * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = (i % 6 === 0) ? '#0F6B3A' : '#990012';
          ctx.fill();
        }
      } else if (isBox) {
        // Square Box Chain Links
        ctx.beginPath();
        const bSize = linkSize * 0.9;
        ctx.rect(-bSize * 0.5, -bSize * 0.5, bSize, bSize);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (isCuban) {
        // Flat Heavy Cuban Links
        ctx.beginPath();
        ctx.ellipse(0, 0, linkW * 0.95, linkH * 0.85, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, linkW * 0.45, linkH * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();
      } else {
        // Traditional Interlocked Rope Chain
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW * 0.9, linkH * 0.72, 0, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW * 0.5, linkH * 0.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.44)';
          ctx.fill();
        } else {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW * 0.72, linkH * 0.52, 0, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW * 0.36, linkH * 0.22, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // Mugappu Side Brooch on left chest curve if mugappu style
    if (isMugappu || style === 'mugappu') {
      const mugT = 0.35; // 35% along the curve (side of neck)
      const mx = (1-mugT)*(1-mugT)*P0.x + 2*(1-mugT)*mugT*P1.x + mugT*mugT*P2.x;
      const my = (1-mugT)*(1-mugT)*P0.y + 2*(1-mugT)*mugT*P1.y + mugT*mugT*P2.y;

      ctx.save();
      ctx.translate(mx, my);
      ctx.beginPath();
      ctx.arc(0, 0, linkSize * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fill();
      // Green enamel center
      ctx.beginPath();
      ctx.arc(0, 0, linkSize * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = '#0F6B3A';
      ctx.fill();
      // Center ruby
      ctx.beginPath();
      ctx.arc(0, 0, linkSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#990012';
      ctx.fill();
      ctx.restore();
    }
  }, []);

  // ─── Realistic Pendant Renderer (Matches 3D Model: Green Enamel Lakshmi Plaque) ───
  const drawPendant = useCallback((ctx, x, y, size, style, initials, goldTone) => {
    ctx.save();
    ctx.translate(x, y);

    const isHaram = style === 'haram' || style === 'temple' || !style;

    if (isHaram) {
      // 1. Bail connector ring
      ctx.beginPath();
      ctx.arc(0, 4, size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();

      // 2. Gold filigree frame
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, size * 0.8, size * 0.85, size * 1.05, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 8;
      ctx.fill();
      ctx.restore();

      // 3. Emerald Green Enamel Oval Plaque (exact match with 3D model!)
      ctx.beginPath();
      ctx.ellipse(0, size * 0.8, size * 0.68, size * 0.88, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0F6B3A';
      ctx.fill();

      // 4. Center Goddess Lakshmi Motif or Initials
      if (initials) {
        ctx.fillStyle = '#FFD54F';
        ctx.font = `bold ${Math.round(size * 0.55)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials.slice(0, 3).toUpperCase(), 0, size * 0.82);
      } else {
        // Gold Seated Deity Figurine Silhouette
        ctx.fillStyle = '#FFD54F';
        // Crown & Head
        ctx.beginPath();
        ctx.arc(0, size * 0.55, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        // Torso & Lotus
        ctx.beginPath();
        ctx.ellipse(0, size * 0.85, size * 0.35, size * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        // Lotus base
        ctx.beginPath();
        ctx.ellipse(0, size * 1.05, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFB300';
        ctx.fill();
      }

      // 5. Hanging Gold Jhumki Drops at Bottom
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath();
        ctx.arc(j * (size * 0.28), size * 1.75 - Math.abs(j) * (size * 0.08), size * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD54F';
        ctx.fill();
        ctx.strokeStyle = '#AA8022';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

    } else {
      // Modern / Classic Gold Teardrop Pendant
      const bailG = ctx.createLinearGradient(-size * 0.3, 0, size * 0.3, size * 0.5);
      bailG.addColorStop(0, '#FFF5C2'); bailG.addColorStop(0.5, '#D4AF37'); bailG.addColorStop(1, '#7A5010');
      ctx.beginPath();
      ctx.ellipse(0, size * 0.1, size * 0.28, size * 0.18, 0, 0, Math.PI * 2);
      ctx.fillStyle = bailG; ctx.fill();

      // Teardrop body
      const pG = ctx.createRadialGradient(-size*0.22, size*0.3, 0, 0, size*0.65, size*1.1);
      pG.addColorStop(0, '#FFFDE0'); pG.addColorStop(0.25, '#FFD54F');
      pG.addColorStop(0.55, '#D4AF37'); pG.addColorStop(0.8, '#8C6514'); pG.addColorStop(1, '#5C3E08');

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.28);
      ctx.bezierCurveTo(-size*0.65, size*0.5, -size*0.72, size*1.4, 0, size*1.75);
      ctx.bezierCurveTo(size*0.72, size*1.4, size*0.65, size*0.5, 0, size*0.28);
      ctx.fillStyle = pG; ctx.fill();
      ctx.restore();

      if (initials) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(size * 0.45)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials.slice(0, 3).toUpperCase(), 0, size * 0.95);
      } else {
        // Ruby gem
        const rSize = size * 0.35;
        const rG = ctx.createRadialGradient(-rSize*0.3, size*0.75, 0, 0, size*0.95, rSize*1.1);
        rG.addColorStop(0, '#FF6060'); rG.addColorStop(0.4, '#CC0022');
        rG.addColorStop(0.8, '#880011'); rG.addColorStop(1, '#440008');
        ctx.beginPath();
        ctx.arc(0, size * 0.95, rSize, 0, Math.PI * 2);
        ctx.fillStyle = rG; ctx.fill();
      }
    }

    ctx.restore();
  }, []);

  // ─── Main Detection + Render Loop ────────────────────────────────────────────
  const runDetectionLoop = useCallback((poseLandmarker, faceLandmarker) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ts = performance.now();

    let poseResults = null, faceResults = null;
    try { poseResults = poseLandmarker.detectForVideo(video, ts); } catch (_) {}
    try { faceResults = faceLandmarker.detectForVideo(video, ts); } catch (_) {}

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let leftSh = poseResults?.landmarks?.[0]?.[11];
    let rightSh = poseResults?.landmarks?.[0]?.[12];

    const detected = !!(leftSh && rightSh);
    setIsDetected(detected);

    if (detected) {
      // Mirror X to match the CSS scaleX(-1) on the video element
      const lX = (1.0 - leftSh.x)  * canvas.width,  lY = leftSh.y  * canvas.height;
      const rX = (1.0 - rightSh.x) * canvas.width,  rY = rightSh.y * canvas.height;
      const midX = (lX + rX) / 2,  midY = (lY + rY) / 2;
      const shDist = Math.hypot(rX - lX, rY - lY);
      const roll = Math.atan2(rY - lY, rX - lX);

      const neckW  = shDist * 0.36 * scaleSlider;
      const liftY  = shDist * 0.07;
      const rawL   = { x: midX - Math.cos(roll)*neckW, y: midY - Math.sin(roll)*neckW - liftY + heightAdjust };
      const rawR   = { x: midX + Math.cos(roll)*neckW, y: midY + Math.sin(roll)*neckW - liftY + heightAdjust };
      const sagD   = shDist * 0.33 * scaleSlider;
      const rawSag = { x: midX, y: midY + sagD + heightAdjust };

      const alpha = 0.32, sm = smoothedRef.current;
      if (!sm.leftNeck) {
        sm.leftNeck = {...rawL}; sm.rightNeck = {...rawR};
        sm.neckSag = {...rawSag}; sm.shoulderWidth = shDist; sm.rollAngle = roll;
      } else {
        sm.leftNeck.x  += alpha*(rawL.x  - sm.leftNeck.x);
        sm.leftNeck.y  += alpha*(rawL.y  - sm.leftNeck.y);
        sm.rightNeck.x += alpha*(rawR.x  - sm.rightNeck.x);
        sm.rightNeck.y += alpha*(rawR.y  - sm.rightNeck.y);
        sm.neckSag.x   += alpha*(rawSag.x - sm.neckSag.x);
        sm.neckSag.y   += alpha*(rawSag.y - sm.neckSag.y);
        sm.shoulderWidth += alpha*(shDist - sm.shoulderWidth);
        sm.rollAngle += alpha*(roll - sm.rollAngle);
      }

      const P0 = sm.leftNeck;
      const P1 = { x: sm.neckSag.x, y: sm.neckSag.y + sagD * 0.55 };
      const P2 = sm.rightNeck;
      const linkSize = Math.max(sm.shoulderWidth * 0.022, 6);

      // Draw custom selected chain
      drawRealisticChain(ctx, P0, P1, P2, linkSize, selectedChainStyle, selectedGoldTone);

      // Pendant at curve midpoint
      const mt = 0.5;
      const px = (1-mt)*(1-mt)*P0.x + 2*(1-mt)*mt*P1.x + mt*mt*P2.x;
      const py = (1-mt)*(1-mt)*P0.y + 2*(1-mt)*mt*P1.y + mt*mt*P2.y;
      drawPendant(ctx, px, py, linkSize * 2.4, selectedChainStyle, customInitials, selectedGoldTone);
    }

    animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
  }, [scaleSlider, heightAdjust, selectedChainStyle, selectedGoldTone, customInitials, drawRealisticChain, drawPendant]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingModels(true);
        const { poseLandmarker, faceLandmarker } = await getMediaPipeLandmarkers();
        if (!mounted) return;
        setLoadingModels(false);
        await startCamera();
        runDetectionLoop(poseLandmarker, faceLandmarker);
      } catch (err) {
        console.error('Failed to init MediaPipe:', err);
        setCameraError('Error loading AI landmark models. Please try photo mode.');
      }
    })();
    return () => {
      mounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera, runDetectionLoop]);

  const toggleCamera = () => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'));

  // ─── Photo Capture: mirror video then overlay chain ───────────────────────────
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const exp = document.createElement('canvas');
    exp.width = canvas.width; exp.height = canvas.height;
    const ctx = exp.getContext('2d');

    if (facingMode === 'user') {
      ctx.save();
      ctx.translate(exp.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, exp.width, exp.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, exp.width, exp.height);
    }
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `VirtualTryOn_${product?.name || 'Gold_Chain'}.png`;
    link.href = exp.toDataURL('image/png');
    link.click();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2200);
  };

  // ─── Photo Upload Fallback ────────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const neckX = img.width * 0.5;
      const neckY = img.height * 0.42 + heightAdjust;
      const chainW = img.width * 0.26 * scaleSlider;
      const sagD   = chainW * 0.75;
      const lsz    = Math.max(chainW * 0.065, 7);

      drawRealisticChain(ctx,
        { x: neckX - chainW, y: neckY },
        { x: neckX, y: neckY + sagD },
        { x: neckX + chainW, y: neckY },
        lsz, selectedChainStyle, selectedGoldTone
      );
      drawPendant(ctx, neckX, neckY + sagD - lsz, lsz * 2.4, selectedChainStyle, customInitials, selectedGoldTone);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-[820px]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-stone-900 border-b border-stone-800 z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">✨</div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-white text-sm sm:text-base truncate">Virtual Try-On</h3>
              <p className="text-[10px] text-amber-400/80 truncate font-mono">{product?.name || 'Gold Covering Chain'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleCamera} className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800" title="Flip Camera">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-stone-300 text-xs">{cameraError}</p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={startCamera} className="bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-full text-xs">Retry Camera</button>
                <label className="inline-flex items-center justify-center gap-2 bg-stone-800 text-stone-300 font-semibold px-4 py-2 rounded-full text-xs cursor-pointer border border-stone-700">
                  <Upload className="w-4 h-4" /><span>Upload Photo Instead</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              <canvas ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

              {!isDetected && !loadingModels && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center space-y-3 bg-black/40">
                  <div className="w-52 h-64 border-2 border-dashed border-amber-400/80 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-xs text-amber-200 font-bold px-4">Face camera with shoulders visible</span>
                  </div>
                  <p className="text-xs text-stone-300 bg-black/60 px-4 py-1.5 rounded-full">Auto-anchoring necklace to your neck...</p>
                </div>
              )}
              {loadingModels && (
                <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center text-amber-400 text-xs space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Starting AI Body Landmarker...</span>
                </div>
              )}
            </>
          )}
          {snapshotTaken && (
            <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
              Photo Saved to Device! 📸
            </div>
          )}
        </div>

        {/* Customization Features (Initials, Style, Tone) */}
        <div className="bg-stone-900 px-4 py-2.5 border-t border-stone-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Custom Initials */}
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                type="text"
                placeholder="Initials (M)"
                maxLength={3}
                value={customInitials}
                onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                className="w-20 bg-transparent text-white placeholder-stone-400 focus:outline-hidden text-xs font-bold"
              />
            </div>

            {/* Gold Tone Selector */}
            <div className="flex items-center gap-1">
              {[
                { id: 'yellowGold', label: '24K Gold', color: 'bg-amber-400' },
                { id: 'antiqueGold', label: 'Antique', color: 'bg-amber-700' },
                { id: 'roseGold', label: 'Rose Gold', color: 'bg-rose-400' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedGoldTone(tone.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                    selectedGoldTone === tone.id
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tone.color}`} />
                  <span>{tone.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size & Height Sliders */}
          <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-300 pt-1 border-t border-stone-800/60">
            <div>
              <div className="flex justify-between mb-0.5"><span>Size</span><span className="text-amber-400 font-mono font-bold">{(scaleSlider * 100).toFixed(0)}%</span></div>
              <input type="range" min="0.6" max="1.5" step="0.05" value={scaleSlider}
                onChange={(e) => setScaleSlider(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-0.5"><span>Height</span><span className="text-amber-400 font-mono font-bold">{heightAdjust}px</span></div>
              <input type="range" min="-80" max="80" step="2" value={heightAdjust}
                onChange={(e) => setHeightAdjust(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Bottom Actions & Switch Chain Carousel */}
        <div className="bg-stone-950 p-3 sm:p-4 border-t border-stone-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button onClick={handleCapturePhoto}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs py-2 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
              <Camera className="w-4 h-4" /><span>Take Photo</span>
            </button>
            <label className="flex items-center justify-center p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer border border-stone-700">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {allProducts.length > 0 && (
            <div>
              <p className="text-[10px] text-stone-400 font-serif font-semibold mb-1.5">Try Another Chain:</p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {allProducts.slice(0, 10).map((p) => (
                  <button key={p._id} onClick={() => {
                    if (onSelectProduct) onSelectProduct(p);
                    if (p.style) setSelectedChainStyle(p.style);
                  }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] whitespace-nowrap transition-all shrink-0 ${
                      p._id === product?._id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}>
                    <span className="text-amber-400">⚜️</span>
                    <span className="truncate max-w-[110px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
