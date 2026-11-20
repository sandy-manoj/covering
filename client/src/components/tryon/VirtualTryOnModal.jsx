import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Sparkles, Upload, RotateCw } from 'lucide-react';
import { getMediaPipeLandmarkers } from '../../tryon/mediaPipeLoader';

export const ALL_CHAIN_IMAGES = [
  '/tryon-chains/box.png',
  '/tryon-chains/bridal_temple_haram.png',
  '/tryon-chains/cuban_curb.png',
  '/tryon-chains/custom_initial.png',
  '/tryon-chains/figaro.png',
  '/tryon-chains/floral_mugappu.png',
  '/tryon-chains/ganga_yamuna.png',
  '/tryon-chains/guttapusalu.png',
  '/tryon-chains/kasu_mala.png',
  '/tryon-chains/mugappu.png',
  '/tryon-chains/palakka.png',
  '/tryon-chains/rope.png',
  '/tryon-chains/rudraksha_mala.png',
  '/tryon-chains/singapore.png',
  '/tryon-chains/spiga_wheat.png'
];

export const getChainTryOnImagePath = (product) => {
  if (!product) return '/tryon-chains/rope.png';

  // If explicit tryOnImage is specified and valid
  if (product.tryOnImage && typeof product.tryOnImage === 'string' && product.tryOnImage.includes('/tryon-chains/')) {
    return product.tryOnImage;
  }

  const name = String(product.name || '').toLowerCase();
  const style = String(product.specs?.style || product.style || '').toLowerCase();
  const code = String(product.productCode || '').toUpperCase();

  // 1. Both Mugappu designs handled separately by product name
  if (name.includes('floral') && (name.includes('mugappu') || name.includes('mogappu') || style.includes('mugappu') || code === 'GC-MUG-07')) {
    return '/tryon-chains/floral_mugappu.png';
  }
  if (name.includes('mayil') || name.includes('peacock') || (name.includes('double') && name.includes('mugappu')) || code === 'GC-MUG-02') {
    return '/tryon-chains/mugappu.png';
  }
  if (code === 'GC-MUG-07') return '/tryon-chains/floral_mugappu.png';
  if (code === 'GC-MUG-02') return '/tryon-chains/mugappu.png';

  // 2. Specific Traditional & Heritage Chain Designs
  if (name.includes('palakka') || code === 'GC-TRAD-03') {
    return '/tryon-chains/palakka.png';
  }
  if (name.includes('guttapusalu') || code === 'GC-TRAD-08') {
    return '/tryon-chains/guttapusalu.png';
  }
  if (name.includes('rudraksha') || code === 'GC-RUD-10') {
    return '/tryon-chains/rudraksha_mala.png';
  }
  if (name.includes('kasu') || name.includes('coin') || code === 'GC-RENT-13') {
    return '/tryon-chains/kasu_mala.png';
  }
  if (name.includes('ganga') || name.includes('yamuna') || code === 'GC-TWO-15') {
    return '/tryon-chains/ganga_yamuna.png';
  }
  if (name.includes('bridal') || name.includes('haram') || name.includes('temple') || code === 'GC-RENT-05') {
    return '/tryon-chains/bridal_temple_haram.png';
  }

  // 3. Chain style / pattern mappings
  if (name.includes('figaro') || style === 'figaro' || code === 'GC-FIG-04') {
    return '/tryon-chains/figaro.png';
  }
  if (name.includes('box') || style === 'box' || code === 'GC-BOX-09') {
    return '/tryon-chains/box.png';
  }
  if (name.includes('cuban') || name.includes('curb') || style === 'curb' || style === 'cuban' || code === 'GC-CURB-12') {
    return '/tryon-chains/cuban_curb.png';
  }
  if (name.includes('initial') || name.includes('custom') || style.includes('custom') || code === 'GC-CUST-11') {
    return '/tryon-chains/custom_initial.png';
  }
  if (name.includes('singapore') || name.includes('spiral') || style === 'singapore' || code === 'GC-SING-14') {
    return '/tryon-chains/singapore.png';
  }
  if (name.includes('spiga') || name.includes('wheat') || style.includes('wheat') || style === 'spiga wheat' || code === 'GC-SPIG-06') {
    return '/tryon-chains/spiga_wheat.png';
  }
  if (name.includes('mugappu') || name.includes('mogappu') || style.includes('mugappu')) {
    return '/tryon-chains/mugappu.png';
  }
  if (name.includes('rope') || style === 'rope' || code === 'GC-ROPE-01') {
    return '/tryon-chains/rope.png';
  }

  // 4. Traditional fallback
  if (style === 'traditional') {
    return '/tryon-chains/bridal_temple_haram.png';
  }

  // Final fallback
  return '/tryon-chains/rope.png';
};

const getProductStyle = (prod) => {
  const rawStyle = prod?.specs?.style || prod?.style || 'rope';
  return typeof rawStyle === 'string' ? rawStyle.trim().toLowerCase() : 'rope';
};

const VirtualTryOnModal = ({ product, onClose, allProducts = [], onSelectProduct }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const streamRef = useRef(null);

  const [currentProduct, setCurrentProduct] = useState(product);
  const [scaleSlider, setScaleSlider] = useState(1.0);
  const [heightAdjust, setHeightAdjust] = useState(0);
  const [facingMode, setFacingMode] = useState('user');
  const [isDetected, setIsDetected] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Customization in Try-On
  const [customInitials, setCustomInitials] = useState('');
  const [selectedChainStyle, setSelectedChainStyle] = useState(() => getProductStyle(product));
  const [selectedGoldTone, setSelectedGoldTone] = useState('yellowGold'); // 'yellowGold', 'antiqueGold', 'roseGold'

  // Refs for current settings so detection loop reads latest values smoothly without re-initializing camera
  const scaleSliderRef = useRef(scaleSlider);
  scaleSliderRef.current = scaleSlider;
  const heightAdjustRef = useRef(heightAdjust);
  heightAdjustRef.current = heightAdjust;
  const currentProductRef = useRef(currentProduct);
  currentProductRef.current = currentProduct;
  const selectedGoldToneRef = useRef(selectedGoldTone);
  selectedGoldToneRef.current = selectedGoldTone;
  const customInitialsRef = useRef(customInitials);
  customInitialsRef.current = customInitials;

  // Preloaded chain images cache & photo upload reference
  const chainImagesRef = useRef({});
  const uploadedImageRef = useRef(null);
  const [, setImagesLoadedTick] = useState(0);

  // Preload all 15 authentic chain PNG images for zero-lag instant rendering
  useEffect(() => {
    ALL_CHAIN_IMAGES.forEach((src) => {
      if (!chainImagesRef.current[src]) {
        const img = new Image();
        img.src = src;
        img.onload = () => setImagesLoadedTick((t) => t + 1);
        chainImagesRef.current[src] = img;
      }
    });
  }, []);

  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
      setSelectedChainStyle(getProductStyle(product));
    }
  }, [product]);

  const handleProductSelect = useCallback((newProduct) => {
    setCurrentProduct(newProduct);
    const style = getProductStyle(newProduct);
    setSelectedChainStyle(style);
    if (onSelectProduct) {
      onSelectProduct(newProduct);
    }
  }, [onSelectProduct]);

  const smoothedRef = useRef({
    leftNeck: null, rightNeck: null, neckSag: null,
    shoulderWidth: null, rollAngle: 0
  });

  // ─── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 480 },
          height: { ideal: 360 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
        setCameraError('Camera access denied. Please grant camera permission or upload a photo.');
      else
        setCameraError('Unable to open camera. Please check your camera settings.');
    }
  }, [facingMode]);

  // ─── Authentic Transparent Chain PNG Renderer ──────────────────────────────
  const drawChainImage = useCallback((ctx, anchorX, anchorY, baseWidth, angle = 0) => {
    const activeProd = currentProductRef.current || product;
    const tone = selectedGoldToneRef.current;
    const initials = customInitialsRef.current;
    const scaleVal = scaleSliderRef.current;
    const heightVal = heightAdjustRef.current;

    const imagePath = getChainTryOnImagePath(activeProd);
    let img = chainImagesRef.current[imagePath];
    if (!img) {
      img = new Image();
      img.src = imagePath;
      chainImagesRef.current[imagePath] = img;
    }

    if (!img.complete || img.naturalWidth === 0) {
      return;
    }

    const aspect = img.naturalHeight / img.naturalWidth;
    const baseScale = activeProd?.tryOnCalibration?.scale || 1.0;
    const targetW = baseWidth * scaleVal * baseScale;
    const targetH = targetW * aspect;

    ctx.save();
    ctx.translate(anchorX, anchorY + heightVal);
    if (angle) {
      ctx.rotate(angle);
    }

    // Gold Tone tinting
    if (tone === 'antiqueGold') {
      ctx.filter = 'sepia(0.35) contrast(1.1) brightness(0.92)';
    } else if (tone === 'roseGold') {
      ctx.filter = 'hue-rotate(-18deg) saturate(1.25) brightness(1.02)';
    } else {
      ctx.filter = 'none';
    }

    // Subtle drop shadow for realistic depth against clothing/skin
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Draw transparent chain PNG:
    // Centered horizontally around anchorX (dx = -targetW / 2).
    // The upper neck opening curve sits directly at anchorY (collarbones).
    ctx.drawImage(img, -targetW / 2, -targetH * 0.10, targetW, targetH);

    // If custom initials are provided (for personalized name chains)
    if (initials && initials.trim()) {
      ctx.filter = 'none';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#FFF8C0';
      ctx.font = `bold ${Math.round(targetW * 0.08)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials.slice(0, 3).toUpperCase(), 0, targetH * 0.72);
    }

    ctx.restore();
  }, [product]);

  // ─── Main Detection + Render Loop ────────────────────────────────────────────
  const lastInferenceTime = useRef(0);

  const runDetectionLoop = useCallback((poseLandmarker, faceLandmarker) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 480;
    canvas.height = video.videoHeight || 360;
    const ts = performance.now();

    // Throttle MediaPipe landmark AI inference to max 24 FPS (every ~42ms)
    // This stops browser CPU/GPU overheating and frees the main thread so Cancel/Close is instant
    if (ts - lastInferenceTime.current > 42) {
      lastInferenceTime.current = ts;
      try {
        if (poseLandmarker) {
          const poseResults = poseLandmarker.detectForVideo(video, ts);
          if (poseResults?.landmarks?.[0]) {
            smoothedRef.current.cachedLeftSh = poseResults.landmarks[0][11];
            smoothedRef.current.cachedRightSh = poseResults.landmarks[0][12];
          }
        }
      } catch (_) {}
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let leftSh = smoothedRef.current.cachedLeftSh;
    let rightSh = smoothedRef.current.cachedRightSh;

    const detected = !!(leftSh && rightSh);
    setIsDetected(detected);

    if (detected) {
      // Mirror X to match the CSS scaleX(-1) on the video element
      const lX = (1.0 - leftSh.x)  * canvas.width,  lY = leftSh.y  * canvas.height;
      const rX = (1.0 - rightSh.x) * canvas.width,  rY = rightSh.y * canvas.height;
      const midX = (lX + rX) / 2,  midY = (lY + rY) / 2;
      const shDist = Math.hypot(rX - lX, rY - lY);
      const roll = Math.atan2(rY - lY, rX - lX);

      const alpha = 0.32, sm = smoothedRef.current;
      if (sm.midX == null) {
        sm.midX = midX;
        sm.midY = midY;
        sm.shoulderWidth = shDist;
        sm.rollAngle = roll;
      } else {
        sm.midX += alpha * (midX - sm.midX);
        sm.midY += alpha * (midY - sm.midY);
        sm.shoulderWidth += alpha * (shDist - sm.shoulderWidth);
        sm.rollAngle += alpha * (roll - sm.rollAngle);
      }

      const activeProd = currentProductRef.current || product;
      const baseOffsetX = activeProd?.tryOnCalibration?.offsetX || 0;
      const baseOffsetY = activeProd?.tryOnCalibration?.offsetY || 0;

      // Base neck/collarbone anchor: slightly above shoulder midpoint
      const anchorX = sm.midX + baseOffsetX;
      const anchorY = sm.midY - sm.shoulderWidth * 0.08 + baseOffsetY;
      const baseWidth = sm.shoulderWidth * 0.78;

      drawChainImage(ctx, anchorX, anchorY, baseWidth, sm.rollAngle);
    }

    animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
  }, [drawChainImage, product]);

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
    const safeName = (currentProduct?.name || product?.name || 'Gold_Chain').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    link.download = `VirtualTryOn_${safeName}.png`;
    link.href = exp.toDataURL('image/png');
    link.click();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2200);
  };

  // ─── Photo Upload Fallback ────────────────────────────────────────────────────
  const renderUploadedPhoto = useCallback(() => {
    const img = uploadedImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const neckX = img.width * 0.5;
    const neckY = img.height * 0.40;
    const baseWidth = img.width * 0.45;

    drawChainImage(ctx, neckX, neckY, baseWidth, 0, selectedGoldTone, customInitials);
  }, [drawChainImage, selectedGoldTone, customInitials]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      uploadedImageRef.current = img;
      renderUploadedPhoto();
    };
  };

  useEffect(() => {
    if (uploadedImageRef.current) {
      renderUploadedPhoto();
    }
  }, [renderUploadedPhoto, scaleSlider, heightAdjust, selectedGoldTone, currentProduct, customInitials]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-[820px]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-stone-900 border-b border-stone-800 z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">✨</div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-white text-sm sm:text-base truncate">Virtual Try-On</h3>
              <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-mono truncate">
                <span className="truncate">{currentProduct?.name || product?.name || 'Gold Covering Chain'}</span>
                {selectedChainStyle && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider font-semibold text-[9px] border border-amber-500/30">
                    {selectedChainStyle}
                  </span>
                )}
              </div>
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
              <p className="text-[10px] text-stone-400 font-serif font-semibold mb-1.5">Try Another Chain ({allProducts.length}):</p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {allProducts.map((p) => {
                  const pStyle = getProductStyle(p);
                  const isSelected = p._id === (currentProduct?._id || product?._id);
                  const imgPath = getChainTryOnImagePath(p);
                  return (
                    <button
                      key={p._id}
                      onClick={() => handleProductSelect(p)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] whitespace-nowrap transition-all shrink-0 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-xs'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <img src={imgPath} alt="" className="w-5 h-5 object-contain shrink-0" />
                      <span className="truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[9px] opacity-60 uppercase font-mono">({pStyle})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
