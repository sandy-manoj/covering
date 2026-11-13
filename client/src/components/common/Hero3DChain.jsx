import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { buildChain } from '../../3d/chainBuilder';

const RotatingChain = ({ style = 'rope' }) => {
  const meshRef = useRef();

  const chainObj = useMemo(() => {
    return buildChain({
      style: style,
      linkCount: 75,
      linkSize: 0.042,
      thickness: 0.016,
      materialPreset: 'yellowGold',
      pendant: 'heart'
    });
  }, [style]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle continuous rotation
      meshRef.current.rotation.y += delta * 0.45;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.15, 0]} scale={1.25}>
      <primitive object={chainObj} />
      <ContactShadows position={[0, -0.9, 0]} opacity={0.6} scale={2} blur={1.5} far={1.5} />
    </group>
  );
};

const Hero3DChain = ({ style = 'rope' }) => {
  return (
    <div className="w-full h-full min-h-[360px] sm:min-h-[440px] relative">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 4]} intensity={2.0} color="#fff8e7" />
        <directionalLight position={[-4, 3, -3]} intensity={1.3} color="#ffe082" />
        <pointLight position={[0, -2, 2]} intensity={0.9} color="#d4af37" />
        <RotatingChain style={style} />
      </Canvas>
    </div>
  );
};

export default Hero3DChain;
