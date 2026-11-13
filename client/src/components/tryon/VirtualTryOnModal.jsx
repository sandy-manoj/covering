import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Download, Sliders, ChevronLeft, ChevronRight, Upload, AlertCircle } from 'lucide-react';

const VirtualTryOnModal = ({ product, allProducts, isOpen, onClose, onSelectProduct }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);

  // Manual overlay controls for perfect fitting
  const [scale, setScale] = useState(1.0);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  // Fallback uploaded photo mode if camera not supported or user prefers photo
  const [userUploadedPhoto, setUserUploadedPhoto] = useState(null);

  // Start Webcam
  useEffect(() => {
    if (!isOpen) return;

    let localStream = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const constraints = {
          video: {
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError('Camera access denied or unavailable. You can upload a photo instead for virtual try-on.');
      }
    };

    if (!userUploadedPhoto) {
      startCamera();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isFrontCamera, userUploadedPhoto]);

  // Real-time canvas render loop
  useEffect(() => {
    if (!isOpen) return;

    let animationFrameId;

    const renderOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // If user is using live camera and video is active
      if (!userUploadedPhoto && video && video.readyState >= 2) {
        // Draw video feed mirrored for natural selfie feel
        ctx.save();
        if (isFrontCamera) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      } else if (userUploadedPhoto) {
        // Draw user uploaded image
        const img = new Image();
        img.src = userUploadedPhoto;
        if (img.complete) {
          ctx.drawImage(img, 0, 0, width, height);
        }
      }

      // Draw chain draped over neck/chest area
      // Default neck area anchor: ~55% height, center horizontally
      const chainImg = new Image();
      // Try tryOnImage or first product photo
      chainImg.src = product?.tryOnImage || product?.images?.[0] || '/images/products/chain_1.jpg';

      if (chainImg.complete) {
        ctx.save();
        
        const baseWidth = width * 0.45 * scale;
        const aspectRatio = chainImg.naturalHeight / (chainImg.naturalWidth || 1);
        const baseHeight = baseWidth * aspectRatio;

        const posX = (width / 2) - (baseWidth / 2) + offsetX;
        const posY = (height * 0.52) + offsetY;

        // Soft natural drop shadow for realism
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        ctx.drawImage(chainImg, posX, posY, baseWidth, baseHeight);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderOverlay);
    };

    animationFrameId = requestAnimationFrame(renderOverlay);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, product, scale, offsetY, offsetX, isFrontCamera, userUploadedPhoto]);

  // Capture Photo
  const handleCapture = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    setCapturedPhotoUrl(dataUrl);
    setIsPhotoCaptured(true);
  };

  // Download Captured Photo
  const handleDownload = () => {
    if (!capturedPhotoUrl) return;
    const link = document.createElement('a');
    link.download = `Chidambaram_TryOn_${product?.productCode || 'Chain'}.jpg`;
    link.href = capturedPhotoUrl;
    link.click();
  };

  // Switch Camera
  const handleSwitchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  // Upload user photo fallback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserUploadedPhoto(event.target.result);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-600/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-serif text-white font-bold">Virtual Neck Try-On</h3>
            <span className="hidden sm:inline text-xs text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!userUploadedPhoto && (
              <button
                onClick={handleSwitchCamera}
                className="p-2 text-stone-300 hover:text-white rounded-full bg-stone-800 hover:bg-stone-700 text-xs flex items-center gap-1"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Flip</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full bg-stone-800 hover:bg-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px]">
          
          {/* Hidden video element feeding into canvas */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play();
              }
            }}
          />

          {/* Render Canvas */}
          {!isPhotoCaptured ? (
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full max-h-[480px] object-contain"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Captured Try-on"
                className="max-h-[480px] object-contain rounded-lg"
              />
            </div>
          )}

          {/* Camera Permission / Error Fallback Notice */}
          {cameraError && !userUploadedPhoto && (
            <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center p-6 text-center text-stone-200">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
              <h4 className="text-lg font-serif font-bold text-white mb-1">Camera Permission Required</h4>
              <p className="text-xs text-stone-400 max-w-md mb-5">{cameraError}</p>

              <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                <Upload className="w-4 h-4" />
                Upload Your Photo Instead
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Floating Live Calibration Sliders */}
          <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md border border-stone-700/60 p-3 rounded-2xl shadow-xl text-xs space-y-2 text-stone-300 w-48 hidden sm:block">
            <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Adjust Fit
              </span>
              <button
                onClick={() => { setScale(1.0); setOffsetY(0); setOffsetX(0); }}
                className="text-[10px] text-stone-400 hover:text-white underline"
              >
                Reset
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Scale / Size</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.6"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Height (Up/Down)</span>
                <span>{offsetY}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="5"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Action Center Buttons over video */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
            {!isPhotoCaptured ? (
              <button
                onClick={handleCapture}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-transform active:scale-95"
              >
                <Camera className="w-5 h-5 text-stone-900" />
                <span>Snap Photo</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPhotoCaptured(false)}
                  className="bg-stone-800 hover:bg-stone-700 text-white font-medium px-4 py-2 rounded-full text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Photo
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download / Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom "Try Another Chain" Carousel */}
        {allProducts && allProducts.length > 0 && (
          <div className="px-5 py-3 bg-stone-950 border-t border-stone-800">
            <div className="text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
              Try Another Chain:
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {allProducts.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onSelectProduct(item)}
                  className={`shrink-0 flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                    item._id === product._id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-600'
                  }`}
                >
                  <img
                    src={item.images?.[0] || '/images/products/chain_1.jpg'}
                    alt={item.name}
                    className="w-9 h-9 object-cover rounded-lg bg-stone-800"
                  />
                  <div className="text-left pr-2">
                    <p className="text-[11px] font-medium text-white line-clamp-1 max-w-[120px]">{item.name}</p>
                    <p className="text-[10px] text-amber-400">₹{item.hasOffer && item.offerPrice ? item.offerPrice : item.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnModal;

