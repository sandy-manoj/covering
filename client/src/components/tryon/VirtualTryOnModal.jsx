import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, Sliders, AlertCircle, Sparkles, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { getMediaPipeLandmarkers, cleanupMediaPipe } from '../../tryon/mediaPipeLoader';
import { PoseSmoother } from '../../tryon/OneEuroFilter';

const VirtualTryOnModal = ({ product, onClose, allProducts = [], onSelectProduct }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const streamRef = useRef(null);

  // Calibration Controls
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [facingMode, setFacingMode] = useState('user'); // front / back camera
  const [isDetected, setIsDetected] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Tracking state & Smoothing filter
  const smootherRef = useRef(new PoseSmoother());
  const lastPoseTimeRef = useRef(0);
  const lastPoseDataRef = useRef(null);

  // Image Element cache for transparent chain overlay
  const chainImgRef = useRef(new Image());
  const [chainLoaded, setChainLoaded] = useState(false);

  // Determine active chain image (from tryOnImage or fallback SVG)
  const activeChainUrl = product?.tryOnImage || `/chains/chain_${(product?.style || 'rope').toLowerCase()}.svg`;

  useEffect(() => {
    const img = chainImgRef.current;
    img.crossOrigin = 'anonymous';
    img.src = activeChainUrl;
    img.onload = () => setChainLoaded(true);
  }, [activeChainUrl]);

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
        setCameraError('Camera permission denied. Please allow camera access in your browser or upload a photo.');
      } else {
        setCameraError('Unable to open camera. Please check your camera settings.');
      }
    }
  }, [facingMode]);

  // Main Detection Loop
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

    // Run inference
    let poseResults = null;
    let faceResults = null;
    try {
      poseResults = poseLandmarker.detectForVideo(video, timestamp);
      faceResults = faceLandmarker.detectForVideo(video, timestamp);
    } catch (e) {
      // Frame skipped
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract key landmarks: Chin (152), Shoulders (11 & 12)
    let chin = null;
    let leftShoulder = null;
    let rightShoulder = null;

    if (faceResults?.faceLandmarks?.[0]) {
      chin = faceResults.faceLandmarks[0][152];
    }
    if (poseResults?.landmarks?.[0]) {
      leftShoulder = poseResults.landmarks[0][11];
      rightShoulder = poseResults.landmarks[0][12];
    }

    const detected = !!(chin && leftShoulder && rightShoulder);
    setIsDetected(detected);

    if (detected) {
      // Normalized to pixel coordinates
      const chinPx = { x: chin.x * canvas.width, y: chin.y * canvas.height };
      const leftShPx = { x: leftShoulder.x * canvas.width, y: leftShoulder.y * canvas.height };
      const rightShPx = { x: rightShoulder.x * canvas.width, y: rightShoulder.y * canvas.height };

      // Neck center weighted: 40% chin / 60% shoulder midpoint
      const shoulderMid = {
        x: (leftShPx.x + rightShPx.x) / 2,
        y: (leftShPx.y + rightShPx.y) / 2
      };

      const neckCenter = {
        x: 0.4 * chinPx.x + 0.6 * shoulderMid.x + offsetX,
        y: 0.4 * chinPx.y + 0.6 * shoulderMid.y + offsetY
      };

      // Shoulder distance for scaling
      const shoulderDist = Math.hypot(leftShPx.x - rightShPx.x, leftShPx.y - rightShPx.y);
      const chainWidth = shoulderDist * 0.72 * scaleFactor * (product?.tryOn?.scale || 1.0);

      // Roll angle from shoulders
      const rollAngle = Math.atan2(rightShPx.y - leftShPx.y, rightShPx.x - leftShPx.x);

      // Apply One Euro Filter smoothing
      const smoothed = smootherRef.current.smooth({
        x: neckCenter.x,
        y: neckCenter.y,
        width: chainWidth,
        rotation: rollAngle
      }, timestamp);

      lastPoseDataRef.current = smoothed;
      lastPoseTimeRef.current = timestamp;
    }

    // Render Chain with 300ms persistence fade-out
    const activePose = lastPoseDataRef.current;
    const timeSinceLast = timestamp - lastPoseTimeRef.current;

    if (activePose && timeSinceLast < 400 && chainImgRef.current && chainLoaded) {
      const opacity = timeSinceLast > 200 ? 1.0 - (timeSinceLast - 200) / 200 : 1.0;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(activePose.x, activePose.y);
      ctx.rotate(activePose.rotation);

      const drawWidth = activePose.width;
      const drawHeight = activePose.width * (chainImgRef.current.height / (chainImgRef.current.width || 1));

      // Draw chain draped below neck center
      ctx.drawImage(
        chainImgRef.current,
        -drawWidth / 2,
        -drawHeight * 0.15, // Drapes downward from collarbone
        drawWidth,
        drawHeight
      );

      ctx.restore();
    }

    animFrameId.current = requestAnimationFrame(() => runDetectionLoop(poseLandmarker, faceLandmarker));
  }, [offsetX, offsetY, scaleFactor, product, chainLoaded]);

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

    // Draw video then overlay
    if (facingMode === 'user') {
      ctx.translate(exportCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `VirtualTryOn_${product?.name || 'Chain'}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  // Photo Upload fallback
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        // Draw user uploaded image onto video dummy canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          // Place chain automatically in chest area
          const chain = chainImgRef.current;
          const w = img.width * 0.45 * scaleFactor;
          const h = w * (chain.height / (chain.width || 1));
          ctx.drawImage(chain, (img.width - w) / 2 + offsetX, img.height * 0.42 + offsetY, w, h);
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[800px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900/95 border-b border-stone-800 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              ✨
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-sm sm:text-base">Virtual Try-On</h3>
              <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                {product?.name || 'Gold Chain'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" />
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

        {/* Viewport: Live Video & Chain Canvas Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-stone-300 text-xs">{cameraError}</p>
              <label className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-full text-xs cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Selfie Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <>
              {/* Webcam Video (Mirrored for selfie) */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Render Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Guide Outline until face detected */}
              {!isDetected && !loadingModels && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center space-y-3 bg-black/30 backdrop-blur-2xs">
                  <div className="w-48 h-64 border-2 border-dashed border-amber-400/80 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-[11px] text-amber-200 font-bold px-4">
                      Keep face & shoulders inside
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-medium bg-black/60 px-4 py-1.5 rounded-full">
                    Face the camera with good lighting
                  </p>
                </div>
              )}

              {/* Loading Indicator */}
              {loadingModels && (
                <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center text-amber-400 text-xs space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Loading on-device AI tracking...</span>
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

        {/* Adjust Controls: Size & Position Slider */}
        <div className="bg-stone-900/90 px-4 py-3 border-t border-stone-800 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs text-stone-300">
            <div>
              <div className="flex justify-between mb-1">
                <span>Size Scale</span>
                <span className="text-amber-400 font-mono font-bold">{(scaleFactor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Height Adjust</span>
                <span className="text-amber-400 font-mono font-bold">{offsetY}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="2"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action & "Try Another Chain" Carousel */}
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

          {/* Switch Chain Carousel */}
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all shrink-0 ${
                      p._id === product?._id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
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
