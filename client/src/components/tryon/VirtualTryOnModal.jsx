import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Sparkles, Upload, RotateCw } from 'lucide-react';
import { getMediaPipeLandmarkers } from '../../tryon/mediaPipeLoader';

const VirtualTryOnModal = ({ product, onClose, allProducts = [], onSelectProduct }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const streamRef = useRef(null);

  // Sliders for Fine-Tuning
  const [scaleSlider, setScaleSlider] = useState(1.0);
  const [heightAdjust, setHeightAdjust] = useState(0);
  const [facingMode, setFacingMode] = useState('user');
  const [isDetected, setIsDetected] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Landmark smoothing filter (exponential moving average: alpha = 0.3)
  const smoothedRef = useRef({
    leftNeck: null,
    rightNeck: null,
    neckSag: null,
    shoulderWidth: null,
    rollAngle: 0
  });

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please grant camera permission in your browser or upload a photo.');
      } else {
        setCameraError('Unable to open camera. Please check your camera settings.');
      }
    }
  }, [facingMode]);

  // Main Landmark Tracking & Realistic U-Chain Canvas Renderer
  const runDetectionLoop = useCallback((poseLandmarker, faceLandmarker) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;

    const timestamp = performance.now();

    // 1. MediaPipe Inference
    let poseResults = null;
    let faceResults = null;
    try {
      poseResults = poseLandmarker.detectForVideo(video, timestamp);
      faceResults = faceLandmarker.detectForVideo(video, timestamp);
    } catch (e) {}

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Extract Landmarks: Shoulders 11 & 12, Chin 152
    let leftSh = null;
    let rightSh = null;
    let chin = null;

    if (poseResults?.landmarks?.[0]) {
      leftSh = poseResults.landmarks[0][11];
      rightSh = poseResults.landmarks[0][12];
    }
    if (faceResults?.faceLandmarks?.[0]) {
      chin = faceResults.faceLandmarks[0][152];
    }

    const detected = !!(leftSh && rightSh);
    setIsDetected(detected);

    if (detected) {
      // NOTE: Video is mirrored (scaleX(-1)), so mirror landmark X to match video accurately
      const leftShX = (1.0 - leftSh.x) * canvas.width;
      const leftShY = leftSh.y * canvas.height;
      const rightShX = (1.0 - rightSh.x) * canvas.width;
      const rightShY = rightSh.y * canvas.height;

      // Shoulder midpoint and distance
      const shoulderMidX = (leftShX + rightShX) / 2;
      const shoulderMidY = (leftShY + rightShY) / 2;
      const shoulderDist = Math.hypot(rightShX - leftShX, rightShY - leftShY);

      // Chin coordinates if detected
      let chinX = shoulderMidX;
      let chinY = shoulderMidY - shoulderDist * 0.45;
      if (chin) {
        chinX = (1.0 - chin.x) * canvas.width;
        chinY = chin.y * canvas.height;
      }

      // Base of Neck Anchor Points (left & right sides near collar)
      // Neck base points sit slightly inside shoulder line, above collarbone
      const neckWidth = shoulderDist * 0.38 * scaleSlider;
      const rollAngle = Math.atan2(rightShY - leftShY, rightShX - leftShX);

      // Endpoints of the necklace U-curve
      const rawLeftNeck = {
        x: shoulderMidX - Math.cos(rollAngle) * neckWidth,
        y: shoulderMidY - Math.sin(rollAngle) * neckWidth - shoulderDist * 0.18 + heightAdjust
      };
      const rawRightNeck = {
        x: shoulderMidX + Math.cos(rollAngle) * neckWidth,
        y: shoulderMidY + Math.sin(rollAngle) * neckWidth - shoulderDist * 0.18 + heightAdjust
      };

      // Sag depth: curve hangs DOWNWARD into chest (U-shape)
      // Sag depth = about 25% of shoulder width below the collarbone line
      const rawSagDepth = shoulderDist * 0.28 * scaleSlider;
      const rawSagPoint = {
        x: shoulderMidX,
        y: shoulderMidY + rawSagDepth + heightAdjust
      };

      // Exponential Moving Average Smoothing (alpha = 0.32)
      const alpha = 0.32;
      const sm = smoothedRef.current;
      if (!sm.leftNeck) {
        sm.leftNeck = rawLeftNeck;
        sm.rightNeck = rawRightNeck;
        sm.neckSag = rawSagPoint;
        sm.shoulderWidth = shoulderDist;
        sm.rollAngle = rollAngle;
      } else {
        sm.leftNeck.x += alpha * (rawLeftNeck.x - sm.leftNeck.x);
        sm.leftNeck.y += alpha * (rawLeftNeck.y - sm.leftNeck.y);
        sm.rightNeck.x += alpha * (rawRightNeck.x - sm.rightNeck.x);
        sm.rightNeck.y += alpha * (rawRightNeck.y - sm.rightNeck.y);
        sm.neckSag.x += alpha * (rawSagPoint.x - sm.neckSag.x);
        sm.neckSag.y += alpha * (rawSagPoint.y - sm.neckSag.y);
        sm.shoulderWidth += alpha * (shoulderDist - sm.shoulderWidth);
        sm.rollAngle += alpha * (rollAngle - sm.rollAngle);
      }

      // 3. Render Realistic Interlocked Gold Chain along Quadratic Curve
      ctx.save();

      // Soft skin shadow underneath the chain
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Quadratic Bezier: P0 = leftNeck, P1 = sagPoint (pulls downward), P2 = rightNeck
      const P0 = sm.leftNeck;
      const P1 = { x: sm.neckSag.x, y: sm.neckSag.y + rawSagDepth * 0.6 }; // Control point pulling DOWNWARD
      const P2 = sm.rightNeck;

      // Sample along curve to place 50 interlocked links
      const numLinks = 55;
      const linkBaseSize = Math.max(sm.shoulderWidth * 0.024, 7);

      for (let i = 0; i < numLinks; i++) {
        const t = i / (numLinks - 1);
        // Quadratic bezier equation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const bx = Math.pow(1 - t, 2) * P0.x + 2 * (1 - t) * t * P1.x + Math.pow(t, 2) * P2.x;
        const by = Math.pow(1 - t, 2) * P0.y + 2 * (1 - t) * t * P1.y + Math.pow(t, 2) * P2.y;

        // Tangent derivative: B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
        const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
        const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
        const tangentAngle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(tangentAngle);

        // Gold Gradient per link
        const grad = ctx.createLinearGradient(-linkBaseSize, -linkBaseSize, linkBaseSize, linkBaseSize);
        grad.addColorStop(0, '#FFE082');
        grad.addColorStop(0.35, '#D4AF37');
        grad.addColorStop(0.7, '#8C650A');
        grad.addColorStop(1, '#FFD700');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#FFE082';
        ctx.lineWidth = 1.2;

        // Alternate wide and narrow link orientation (interlocked curb/rope look)
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.ellipse(0, 0, linkBaseSize * 1.3, linkBaseSize * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, linkBaseSize * 0.8, linkBaseSize * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      // 4. Render Pendant at Lowest Point of U-Curve (B(0.5))
      const midT = 0.5;
      const pendantX = Math.pow(1 - midT, 2) * P0.x + 2 * (1 - midT) * midT * P1.x + Math.pow(midT, 2) * P2.x;
      const pendantY = Math.pow(1 - midT, 2) * P0.y + 2 * (1 - midT) * midT * P1.y + Math.pow(midT, 2) * P2.y;

      const pSize = linkBaseSize * 3.8;

      ctx.save();
      ctx.translate(pendantX, pendantY);

      // Bail Ring
      ctx.beginPath();
      ctx.arc(0, 4, linkBaseSize * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();
      ctx.stroke();

      // Pendant Gold Medallion / Mango Motif
      const pGrad = ctx.createRadialGradient(0, pSize * 0.5, 2, 0, pSize * 0.5, pSize);
      pGrad.addColorStop(0, '#FFE082');
      pGrad.addColorStop(0.5, '#D4AF37');
      pGrad.addColorStop(1, '#8C650A');

      ctx.beginPath();
      // Teardrop / Heart Pendant shape pointing DOWNWARD
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(-pSize * 0.6, pSize * 0.6, 0, pSize * 1.3);
      ctx.quadraticCurveTo(pSize * 0.6, pSize * 0.6, 0, 8);
      ctx.fillStyle = pGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fill();
      ctx.strokeStyle = '#FFF8E1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center Ruby Jewel Gemstone
      ctx.beginPath();
      ctx.arc(0, pSize * 0.7, pSize * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = '#990012';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-2, pSize * 0.65, pSize * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.restore();

      ctx.restore();
    }

    animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
  }, [scaleSlider, heightAdjust]);

  // Init models and camera
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera, runDetectionLoop]);

  // Flip Camera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Photo Capture
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Draw mirrored video if front camera
    if (facingMode === 'user') {
      ctx.translate(exportCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    // Draw canvas chain overlay (un-mirrored correctly)
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `VirtualTryOn_${product?.name || 'Gold_Chain'}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2200);
  };

  // Photo Upload fallback
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Draw U-shape chain in center chest area
          const neckX = img.width * 0.5;
          const neckY = img.height * 0.38 + heightAdjust;
          const chainW = img.width * 0.32 * scaleSlider;

          ctx.save();
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 12;
          ctx.lineCap = 'round';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 6;

          // Draw hanging U
          ctx.beginPath();
          ctx.moveTo(neckX - chainW, neckY);
          ctx.quadraticCurveTo(neckX, neckY + chainW * 0.9, neckX + chainW, neckY);
          ctx.stroke();

          // Gold Pendant at bottom
          ctx.beginPath();
          ctx.arc(neckX, neckY + chainW * 0.9 + 15, 20, 0, Math.PI * 2);
          ctx.fillStyle = '#D4AF37';
          ctx.fill();
          ctx.restore();
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[800px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              ✨
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-white text-sm sm:text-base truncate">Virtual Try-On</h3>
              <p className="text-[10px] text-amber-400/80 truncate font-mono">
                {product?.name || 'Gold Covering Chain'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleCamera}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              title="Flip Camera"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport: Mirrored Live Camera + Hanging U-Chain Canvas Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-stone-300 text-xs">{cameraError}</p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={startCamera}
                  className="bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-full text-xs"
                >
                  Retry Camera
                </button>
                <label className="inline-flex items-center justify-center gap-2 bg-stone-800 text-stone-300 font-semibold px-4 py-2 rounded-full text-xs cursor-pointer border border-stone-700">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo Instead</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <>
              {/* Mirrored Webcam Feed */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Render Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Guide Outline if not detected yet */}
              {!isDetected && !loadingModels && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center space-y-3 bg-black/40 backdrop-blur-2xs">
                  <div className="w-52 h-64 border-2 border-dashed border-amber-400/80 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-xs text-amber-200 font-bold px-4">
                      Face camera with shoulders visible
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 bg-black/60 px-4 py-1.5 rounded-full">
                    Auto-anchoring necklace to your neck curve...
                  </p>
                </div>
              )}

              {/* Loading Indicator */}
              {loadingModels && (
                <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center text-amber-400 text-xs space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Starting AI Body Landmarker...</span>
                </div>
              )}
            </>
          )}

          {/* Snapshot toast */}
          {snapshotTaken && (
            <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
              Photo Saved to Device! 📸
            </div>
          )}
        </div>

        {/* Fine-Tuning Controls */}
        <div className="bg-stone-900 px-4 py-3 border-t border-stone-800 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs text-stone-300">
            <div>
              <div className="flex justify-between mb-1">
                <span>Size Scale</span>
                <span className="text-amber-400 font-mono font-bold">{(scaleSlider * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={scaleSlider}
                onChange={(e) => setScaleSlider(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Height Adjust</span>
                <span className="text-amber-400 font-mono font-bold">{heightAdjust}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="2"
                value={heightAdjust}
                onChange={(e) => setHeightAdjust(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions & "Try Another Chain" Carousel */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleCapturePhoto}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs py-2.5 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>

            <label className="flex items-center justify-center p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer border border-stone-700">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Switch Chain Chips */}
          {allProducts.length > 0 && (
            <div>
              <p className="text-[11px] text-stone-400 font-serif font-semibold mb-2">
                Try Another Chain:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allProducts.slice(0, 10).map((p) => (
                  <button
                    key={p._id}
                    onClick={() => onSelectProduct && onSelectProduct(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all shrink-0 ${
                      p._id === product?._id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-amber-400">⚜️</span>
                    <span className="truncate max-w-[120px]">{p.name}</span>
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
