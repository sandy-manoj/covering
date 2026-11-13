import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { GLTFExporter } from 'three-stdlib';
import * as THREE from 'three';
import { X, RotateCw, Maximize2, Minimize2, ZoomIn, Download, Sparkles, RefreshCw } from 'lucide-react';
import { buildChain, MATERIAL_PRESETS } from '../../3d/chainBuilder';

// 3D Scene Inside Canvas
const ChainScene = ({
  modelUrl,
  style = 'rope',
  materialPreset = 'yellowGold',
  pendant = 'none',
  initials = '',
  autoRotate = true
}) => {
  const groupRef = useRef();

  // Procedural chain group
  const proceduralGroup = useMemo(() => {
    if (modelUrl) return null;
    return buildChain({
      style: style.toLowerCase(),
      linkCount: style === 'cuban' || style === 'haram' ? 65 : 85,
      linkSize: 0.042,
      thickness: 0.016,
      materialPreset,
      pendant,
      initials
    });
  }, [modelUrl, style, materialPreset, pendant, initials]);

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {modelUrl ? (
        <LoadedModel url={modelUrl} />
      ) : (
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

// External GLTF Loader if product has .glb file
const LoadedModel = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
};

const Product3DViewerModal = ({ product, onClose }) => {
  const [materialPreset, setMaterialPreset] = useState(product?.materialPreset || 'yellowGold');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [customInitials, setCustomInitials] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Export generated chain as .GLB
  const handleExportGLB = () => {
    setIsExporting(true);
    const chainToExport = buildChain({
      style: (product?.style || 'rope').toLowerCase(),
      materialPreset,
      pendant: product?.pendantType || 'none',
      initials: customInitials
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      chainToExport,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'model/gltf-binary' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${product?.name || 'Gold_Chain'}_3D.glb`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-stone-950 border border-amber-600/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[750px]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900/90 border-b border-stone-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif text-sm font-bold border border-amber-500/30">
              360°
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">
                {product?.name || 'Gold Covering Chain'}
              </h3>
              <p className="text-[11px] text-amber-400/80 uppercase tracking-widest font-mono">
                Style: {product?.style || 'Rope Chain'} • Touch/Pinch to Rotate & Zoom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* 3D Viewport */}
        <div className="relative flex-1 bg-gradient-to-b from-stone-900 via-stone-950 to-black overflow-hidden">
          {!webGLSupported ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-400 space-y-3">
              <p className="text-amber-500 font-bold">WebGL is not supported or enabled on your browser.</p>
              <p className="text-xs">Please use Chrome, Safari or Edge on a compatible device.</p>
            </div>
          ) : (
            <Canvas
              camera={{ position: [0, 0, 2.3], fov: 45 }}
              dpr={[1, 2]} // High DPI support for sharp mobile rendering
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              {/* Luxury Studio Key Lighting */}
              <ambientLight intensity={0.65} />
              <directionalLight position={[4, 5, 4]} intensity={1.8} color="#fff9e6" />
              <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#ffe082" />
              <pointLight position={[0, -2, 2]} intensity={0.8} color="#d4a82c" />

              <ChainScene
                modelUrl={product?.model3dUrl}
                style={product?.style || 'rope'}
                materialPreset={materialPreset}
                pendant={product?.pendantType || 'none'}
                initials={customInitials}
                autoRotate={autoRotate}
              />

              <OrbitControls
                enablePan={false}
                minDistance={1.2}
                maxDistance={3.8}
                autoRotate={autoRotate}
                autoRotateSpeed={1.8}
                enableDamping={true}
                dampingFactor={0.06}
              />
            </Canvas>
          )}

          {/* Floating View Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            {/* Auto-rotate Toggle */}
            <div className="pointer-events-auto flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 text-xs text-stone-300">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 font-medium transition-colors ${autoRotate ? 'text-amber-400' : 'text-stone-400'}`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>Auto-spin</span>
              </button>
            </div>

            {/* Custom Initials Input for 3D Pendant */}
            <div className="pointer-events-auto flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="text"
                placeholder="Custom Initials (e.g. M)"
                maxLength={3}
                value={customInitials}
                onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                className="w-28 bg-transparent text-white placeholder-stone-500 focus:outline-hidden text-xs"
              />
            </div>

            {/* Export GLB Button */}
            <div className="pointer-events-auto">
              <button
                onClick={handleExportGLB}
                disabled={isExporting}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export GLB'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Material Selector */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Gold Preset:</span>
            <div className="flex items-center gap-1.5">
              {Object.entries(MATERIAL_PRESETS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setMaterialPreset(key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    materialPreset === key
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: val.color }}
                  />
                  <span>{val.name}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-stone-500 hidden sm:block">
            Designed for 1-Gram Guaranteed Micro Gold Covering
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewerModal;
