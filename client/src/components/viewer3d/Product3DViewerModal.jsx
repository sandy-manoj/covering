import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { GLTFExporter } from 'three-stdlib';
import * as THREE from 'three';
import {
  X,
  RotateCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Image,

  Sparkles,
  Download,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { buildChain, MATERIAL_PRESETS, getProductStyleInfo } from '../../3d/chainBuilder';
import { getChainTryOnImagePath } from '../tryon/VirtualTryOnModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.3;
const DRAG_SENSITIVITY = 55; // pixels dragged to advance one image in 360° mode

const mod = (n, m) => ((n % m) + m) % m;

// ---------------------------------------------------------------------------
// 3D Scene inside Canvas (preserved existing behaviour)
// Used when a product has a genuine .glb 3D model, or as a fallback.
// ---------------------------------------------------------------------------
const ChainScene = ({
  product,
  modelUrl,
  style = 'rope',
  materialPreset = 'yellowGold',
  pendant = 'none',
  initials = '',
  autoRotate = true,
}) => {
  const groupRef = useRef();

  const proceduralGroup = useMemo(() => {
    if (modelUrl) return null;
    return buildChain({ product, style, materialPreset, pendant, initials });
  }, [product, modelUrl, style, materialPreset, pendant, initials]);

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {modelUrl ? <LoadedModel url={modelUrl} /> : (
        proceduralGroup && <primitive object={proceduralGroup} />
      )}
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.65}
        scale={2.5}
        blur={1.5}
        far={1.5}
      />
    </group>
  );
};

// External GLTF loader if product has a .glb file
const LoadedModel = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
};

// ---------------------------------------------------------------------------
// Image-based viewer
// ---------------------------------------------------------------------------
// Mode 1 (2+ genuine images): image-sequence 360° rotation using ONLY the
// product's own uploaded images — dragging left/right cycles through them.
// Mode 2 (1 image): single image with zoom/pan, plus a clear note that more
// angle images or a .glb model are required for a true 360° experience.
// Works with mouse drag and finger touch (pointer events + touch-action: none).
// ---------------------------------------------------------------------------
const ProductImageViewer = ({ product, allProducts = [], onSelectProduct }) => {
  const images = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];
  const name = product?.name || 'Chain';
  const multi = images.length > 1;
  const single = images.length === 1;

  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);

  const containerRef = useRef(null);

  // Reset view whenever the product / its images change
  useEffect(() => {
    setIndex(0);
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, [product]);

  const setImageScale = useCallback(
    (next) => {
      const v = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      setScale(v);
      if (v === 1) {
        setPanX(0);
        setPanY(0);
      }
    },
    []
  );

  const zoomIn = useCallback(() => setImageScale((s) => s + ZOOM_STEP), [setImageScale]);
  const zoomOut = useCallback(() => setImageScale((s) => s - ZOOM_STEP), [setImageScale]);
  const resetView = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    if (multi) setIndex(0);
  }, [multi]);

  const goTo = useCallback(
    (i) => setIndex(mod(i, images.length)),
    [images.length]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.clientX);
      setStartY(e.clientY);
      setStartIndex(index);
      setStartPanX(panX);
      setStartPanY(panY);
    },
    [index, panX, panY]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (scale === 1 && multi) {
        // Rotate through the product's genuine angle images
        const step = Math.round(dx / DRAG_SENSITIVITY);
        setIndex(mod(startIndex + step, images.length));
      } else {
        // Pan the zoomed image
        setPanX(startPanX + dx);
        setPanY(startPanY + dy);
      }
    },
    [isDragging, startX, startY, startIndex, startPanX, startPanY, scale, multi, images.length]
  );

  const onPointerUp = useCallback(() => setIsDragging(false), []);
  const onPointerLeave = useCallback(() => setIsDragging(false), []);

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      setImageScale((s) => (e.deltaY < 0 ? s + ZOOM_STEP : s - ZOOM_STEP));
    },
    [setImageScale]
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const currentIndex = mod(index, images.length);
  const currentImage = images.length ? images[currentIndex] : null;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
      style={{ touchAction: 'none' }}
      className="flex flex-col items-center justify-center bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden relative h-full w-full p-1 sm:p-2"
    >
      {/* Top control strip (zoom / fullscreen) */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 z-20 pointer-events-auto bg-stone-900/80 backdrop-blur-md rounded-xl p-2 border border-stone-700">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-300 font-mono">
          {images.length ? (
            <>
              <Image className="w-3 h-3" />
              <span>{currentIndex + 1} / {images.length}</span>
            </>
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= ZOOM_MIN}
            title="Zoom out"
            className={`p-1.5 rounded transition-colors ${
              scale <= ZOOM_MIN
                ? 'text-stone-600 hover:bg-stone-800'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            title="Reset view"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= ZOOM_MAX}
            title="Zoom in"
            className={`p-1.5 rounded transition-colors ${
              scale >= ZOOM_MAX
                ? 'text-stone-600 hover:bg-stone-800'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative min-w-0 min-h-0 bg-black/40">
        {images.length === 0 ? (
          <div className="text-center text-stone-500">
            <AlertTriangle className="w-7 h-7 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium">No product image uploaded</p>
            <p className="text-xs mt-1 text-stone-600">
              Add product images in Admin → Edit Product.
            </p>
          </div>
        ) : (
          <>
            <img
              src={currentImage}
              alt={name}
              draggable={false}
              className="w-full h-full max-w-[760px] max-h-[660px] object-contain block"
              style={{
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
                cursor: scale === 1 ? (multi ? 'grab' : 'default') : 'grabbing',
                transition: scale === 1 ? 'none' : 'transform 0.15s ease-out',
              }}
            />

            {multi && scale === 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
                <span className="bg-black/60 px-3 py-1.5 rounded-full text-[11px] text-stone-200 font-mono border border-white/10 backdrop-blur-sm shadow-lg">
                  Drag left / right to rotate 360° — {name}
                </span>
              </div>
            )}

            {single && scale === 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
                <span className="bg-amber-900/90 px-3 py-1.5 rounded-full text-[11px] text-amber-200 font-mono border border-amber-500/40 backdrop-blur-sm shadow-lg">
                  Single image — zoom to inspect. Upload 2+ angle images or a .glb model in Admin for true 360°.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


// ---------------------------------------------------------------------------
// Reusable product viewer modal
// ---------------------------------------------------------------------------
// One component used by ProductDetailPage and ShopPage for EVERY chain product.
// Priority of display:
//   1. model3dUrl      -> genuine .glb 3D model (Three.js)
//   2. images.length >= 2 -> image-sequence 360° from the product's own images
//   3. images.length === 1 -> single product image with zoom (no fake 360°)
//   4. otherwise       -> procedural 3D chain preview (preserved fallback)
// ---------------------------------------------------------------------------
const Product3DViewerModal = ({
  product,
  onClose,
  allProducts = [],
  onSelectProduct,
}) => {
  const [currentProduct, setCurrentProduct] = useState(product);
  const [materialPreset, setMaterialPreset] = useState('yellowGold');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [customInitials, setCustomInitials] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (product) setCurrentProduct(product);
  }, [product]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  const activeProd = currentProduct || product;
  const hasModel = !!activeProd?.model3dUrl;

  // The user requested: remove images in 360 degree, instead use the authentic try-on chain / 3D model
  const mode = useMemo(() => {
    if (hasModel) return 'model3d';
    return 'procedural3d';
  }, [hasModel]);

  const is3D = true;
  const styleInfo = useMemo(() => getProductStyleInfo(activeProd || product), [
    activeProd,
    product,
  ]);

  const modeLabels = {
    model3d: '3D Model (.glb)',
    procedural3d: '360° 3D Chain View',
  };

  const viewHints = {
    model3d: 'Drag to rotate 360° • Scroll to zoom',
    procedural3d: 'Drag to rotate 360° • Scroll to zoom',
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleProductSelect = (newProduct) => {
    setCurrentProduct(newProduct);
    if (onSelectProduct) onSelectProduct(newProduct);
  };

  // Export generated procedural chain as .GLB (3D modes only)
  const handleExportGLB = () => {
    if (!is3D) return;
    setIsExporting(true);
    const chainToExport = buildChain({
      product: activeProd,
      style: styleInfo.key,
      materialPreset,
      pendant: activeProd?.pendantType || 'none',
      initials: customInitials,
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      chainToExport,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'model/gltf-binary' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeName = (activeProd?.name || 'Gold_Chain').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
        link.download = `${safeName}_3D.glb`;
        link.click();
        setIsExporting(false);
      },
      (error) => {
        console.error('Export GLB error:', error);
        setIsExporting(false);
      },
      { binary: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[88vh] max-h-[820px]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold border shrink-0 ${
                is3D
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              {is3D ? <RotateCcw className="w-5 h-5" /> : <Image className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-white text-sm sm:text-base truncate">
                {activeProd?.name || 'Gold Covering Chain'}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-mono truncate">
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider font-semibold text-[9px] border border-amber-500/30">
                  {styleInfo.label}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 uppercase tracking-wider font-semibold text-[9px] border border-stone-700/60">
                  {modeLabels[mode]}
                </span>
                <span className="opacity-70 hidden sm:inline">• {viewHints[mode]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 bg-gradient-to-b from-stone-900 via-stone-950 to-black overflow-hidden">
          {!webGLSupported ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-medium">WebGL not supported</p>
              <p className="text-xs">3D model view requires Chrome, Safari or Edge.</p>
            </div>
          ) : (
            <Canvas
              camera={{ position: [0, 0, 2.3], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 5, 4]} intensity={1.8} color="#fff9e6" />
              <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#ffe082" />
              <pointLight position={[0, -2, 2]} intensity={0.8} color="#d4a82c" />

              <ChainScene
                product={activeProd}
                modelUrl={activeProd?.model3dUrl}
                style={styleInfo.key}
                materialPreset={materialPreset}
                pendant={activeProd?.pendantType || 'none'}
                initials={customInitials}
                autoRotate={autoRotate}
              />

              <OrbitControls
                enablePan={false}
                minDistance={1.1}
                maxDistance={3.8}
                autoRotate={autoRotate}
                autoRotateSpeed={1.8}
                enableDamping={true}
                dampingFactor={0.06}
              />
            </Canvas>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-900 border-t border-stone-800 shrink-0">
          {/* Mode-specific hint / asset requirement note */}
          <div className="flex items-center justify-between gap-3 mb-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {hasModel
                  ? `Genuine .glb 3D model used for ${activeProd?.name || 'Chain'}.`
                  : `360° 3D chain model (${styleInfo.label}) matching Try-On mode.`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {is3D && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 font-medium text-[10px]">Gold Preset:</span>
                    <div className="flex items-center gap-1">
                      {Object.entries(MATERIAL_PRESETS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setMaterialPreset(key)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                            materialPreset === key
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full border border-black/40" style={{ backgroundColor: val.color }} />
                          <span>{val.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 text-xs text-stone-300">
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className="flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                      <span>{autoRotate ? 'Auto-spin ON' : 'Auto-spin OFF'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <input
                      type="text"
                      placeholder="Initial (M)"
                      maxLength={3}
                      value={customInitials}
                      onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                      className="w-20 bg-transparent text-white placeholder-stone-500 focus:outline-hidden text-xs font-bold"
                    />
                  </div>
                  <div className="pointer-events-auto">
                    <button
                      onClick={handleExportGLB}
                      disabled={isExporting}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      <span>{isExporting ? 'Exporting...' : 'Export 3D'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {allProducts.length > 0 && (
              <div className="pt-2 border-t border-stone-800/60 w-full">
                <p className="text-[10px] text-stone-400 font-serif font-semibold mb-1.5">
                  Inspect Another Chain ({allProducts.length}):
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {allProducts.map((p) => {
                    const pImages = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
                    const pStyle = p?.specs?.style || p?.style || 'rope';
                    const isSelected = p._id === activeProd?._id;
                    const imgPath = pImages[0] || getChainTryOnImagePath(p);
                    return (
                      <button
                        key={p._id}
                        onClick={() => handleProductSelect(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] whitespace-nowrap transition-all shrink-0 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-xs'
                            : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <img src={imgPath} alt="" className="w-4 h-4 object-contain shrink-0" />
                        <span className="truncate max-w-[110px]">{p.name}</span>
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
    </div>
  );
};

export default Product3DViewerModal;

