import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const Hero3DChain = ({ style = 'curb' }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. RoomEnvironment for Metallic Gold Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv).texture;

    // 3. Studio Lights
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd54f, 1.8);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // 4. Subtle Gold Sparkle Particle Field
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 4.5;
      posArray[i + 1] = (Math.random() - 0.5) * 4.5;
      posArray[i + 2] = (Math.random() - 0.5) * 2.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xffe082,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Build Interlocked Gold Chain Geometry along CatmullRomCurve3
    const chainGroup = new THREE.Group();

    // Natural sagging U-curve for necklace
    const curvePoints = [
      new THREE.Vector3(-1.1, 0.85, -0.2),
      new THREE.Vector3(-0.95, 0.35, 0.05),
      new THREE.Vector3(-0.6, -0.35, 0.3),
      new THREE.Vector3(0, -0.85, 0.45), // lowest sagging center point
      new THREE.Vector3(0.6, -0.35, 0.3),
      new THREE.Vector3(0.95, 0.35, 0.05),
      new THREE.Vector3(1.1, 0.85, -0.2)
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal');

    // Luxury Gold PBR Material
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xD4AF37,
      metalness: 1.0,
      roughness: 0.22,
      clearcoat: 0.35,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0
    });

    // 120 interlocking links
    const linkCount = 110;
    const linkGeo = new THREE.TorusGeometry(0.042, 0.015, 14, 28);
    const instancedChain = new THREE.InstancedMesh(linkGeo, goldMaterial, linkCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();

      dummy.position.copy(pt);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

      // Interlocking: alternate links rotated 90 degrees
      if (i % 2 === 0) {
        dummy.rotateY(Math.PI / 2);
      }
      dummy.updateMatrix();
      instancedChain.setMatrixAt(i, dummy.matrix);
    }
    instancedChain.instanceMatrix.needsUpdate = true;
    chainGroup.add(instancedChain);

    // 6. Pendant at lowest point (Heart / Mango Mugappu motif)
    const lowestPt = curve.getPointAt(0.5);
    const pendantGroup = new THREE.Group();
    pendantGroup.position.copy(lowestPt);

    // Bail Ring
    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 10, 20), goldMaterial);
    bail.position.y = -0.02;
    pendantGroup.add(bail);

    // Heart / Tear Drop Solid Gold Mesh
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 0.05, -0.1, 0.12, -0.15, 0.05);
    heartShape.bezierCurveTo(-0.2, -0.02, -0.1, -0.1, 0, -0.22);
    heartShape.bezierCurveTo(0.1, -0.1, 0.2, -0.02, 0.15, 0.05);
    heartShape.bezierCurveTo(0.1, 0.12, 0, 0.05, 0, 0);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.012,
      bevelThickness: 0.012
    });
    const heartMesh = new THREE.Mesh(heartGeo, goldMaterial);
    heartMesh.position.set(0, -0.07, 0);
    pendantGroup.add(heartMesh);

    // Center ruby stone gem
    const gemGeo = new THREE.SphereGeometry(0.045, 16, 16);
    gemGeo.scale(1, 1.3, 0.6);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x990012,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(0, -0.14, 0.02);
    pendantGroup.add(gemMesh);

    chainGroup.add(pendantGroup);

    // Center and auto-fit in camera frame
    chainGroup.position.set(0, 0.1, 0);
    scene.add(chainGroup);

    // 7. OrbitControls with Auto-Rotate and Touch Pause
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.enableZoom = true;
    controls.minDistance = 2.0;
    controls.maxDistance = 4.8;
    controls.enablePan = false;

    let touchTimeout = null;
    const onPointerDown = () => {
      controls.autoRotate = false;
      if (touchTimeout) clearTimeout(touchTimeout);
    };
    const onPointerUp = () => {
      touchTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 2000);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 8. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      // Gentle floating sparkle motion
      particles.rotation.y += delta * 0.05;

      renderer.render(scene, camera);
      if (loading) setLoading(false);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      pmremGenerator.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [style]);

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[440px] relative flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-400 text-xs gap-2 z-10">
          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Rendering 3D Gold Model...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default Hero3DChain;
