import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { X, RotateCw, ZoomIn, Maximize, AlertCircle } from 'lucide-react';
import * as THREE from 'three';

// Procedural realistic 3D Gold Chain model in case no .glb is uploaded yet
const GoldChain3DModel = ({ url }) => {
  if (url) {
    try {
      const { scene } = useGLTF(url);
      return <primitive object={scene} scale={1.5} />;
    } catch {
      // Fallback to procedural high-detail gold chain mesh
    }
  }

  // Generate procedural gold torus knots / curb chain link geometry
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow elegant rotation
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Intricate Gold Chain Curve Link */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.16, 32, 100]} />
        <meshStandardMaterial
          color="#E5C158"
          roughness={0.15}
          metalness={0.92}
        />
      </mesh>

      {/* Outer intertwined rope chain layer */}
      <mesh position={[0, 0.05, 0]} rotation={[0.4, 0, 0]}>
        <torusKnotGeometry args={[1.4, 0.1, 128, 32, 2, 5]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.12}
          metalness={0.95}
        />
      </mesh>

      {/* Center Traditional Pendant or Mogappu Motif */}
      <mesh position={[0, -1.8, 0.1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.12, 32]} />
        <meshStandardMaterial
          color="#B8860B"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Studded gem center */}
      <mesh position={[0, -1.8, 0.18]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color="#9B111E" // Kemp Ruby Stone
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

// 360 Degree Image Rotator component if user drags through multiple angle photos
const Spin360Viewer = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !images?.length) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 15) {
      if (deltaX > 0) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing bg-radial from-stone-800 to-black p-6"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={images[currentIndex]}
        alt="360 view angle"
        className="max-h-[380px] object-contain drop-shadow-2xl pointer-events-none"
      />
      <div className="absolute bottom-6 flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full text-xs text-amber-300">
        <RotateCw className="w-3.5 h-3.5 animate-spin" />
        <span>Drag left or right to rotate 360° ({currentIndex + 1}/{images.length})</span>
      </div>
    </div>
  );
};

const Product3DViewerModal = ({ product, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('3d'); // '3d' or '360'

  useEffect(() => {
    if (product?.spinImages360?.length > 0 && !product?.model3dUrl) {
      setActiveTab('360');
    } else {
      setActiveTab('3d');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-600/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-black/40">
          <div>
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">Interactive Jewellery Inspector</span>
            <h3 className="text-lg font-serif text-white font-bold">{product.name}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {product.spinImages360?.length > 0 && (
              <div className="flex bg-stone-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`px-3 py-1 rounded-md transition-colors ${activeTab === '3d' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                >
                  3D PBR Model
                </button>
                <button
                  onClick={() => setActiveTab('360')}
                  className={`px-3 py-1 rounded-md transition-colors ${activeTab === '360' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
                >
                  360° Photo Spin
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D / 360 Canvas Viewport */}
        <div className="w-full h-[450px] relative bg-gradient-to-b from-stone-900 via-stone-950 to-black">
          {activeTab === '3d' ? (
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} color="#FFF8DC" />
              <pointLight position={[-10, -5, -5]} intensity={1.5} color="#D4AF37" />
              <directionalLight position={[0, 5, 5]} intensity={1.2} />

              <Stage environment="city" intensity={0.6}>
                <GoldChain3DModel url={product.model3dUrl} />
              </Stage>

              <OrbitControls
                enablePan={false}
                minDistance={2.5}
                maxDistance={8}
                autoRotate
                autoRotateSpeed={1.2}
              />
            </Canvas>
          ) : (
            <Spin360Viewer images={product.spinImages360 || product.images} />
          )}

          {/* Controls instructions */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-amber-200/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-amber-600/20 pointer-events-none">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            <span>Drag to rotate 3D angles | Pinch/scroll to zoom</span>
          </div>

          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-stone-400 text-[11px] px-3 py-1.5 rounded-lg border border-stone-800">
            Gold Plating: {product.specs?.plating || '1 Gram Micro Gold Plating'}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Specs: {product.specs?.length} • {product.specs?.thickness} • {product.specs?.weight}</span>
          <span className="text-amber-400 font-medium">Authentic 24K Gold Sheen Simulation</span>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewerModal;

