import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Hero3DChain - Mobile-First High-Performance Three.js Antique Gold Necklace Set Viewer
 * Accurately models the reference photo:
 *  - 2-layer flat woven box-link necklaces (choker + long haram)
 *  - Symmetric ruby square connector plates with bezel rings
 *  - Scalloped teardrop pendants with ruby center, white CZ stone halo, top emerald & hanging pearl
 *  - Swaying South Indian Jhumka earrings with ruby stud, bell dome & pearl drops
 *  - Full GLB loader (DRACO enabled) with robust fallback
 *  - Mobile-optimized: clamped DPR, visibilitychange pause, touch-action: none, proper resource disposal
 */
const Hero3DChain = ({ style = 'haram', onModelReady }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [modelType, setModelType] = useState('loading'); // 'glb' | 'procedural'
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvasTest = document.createElement('canvas');
    const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setWebGLError(true);
      setLoading(false);
      return;
    }

    const isMobile = window.innerWidth < 768;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, -0.05, 3.2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile, // Turn off antialias on low-end mobile for 60fps
        alpha: true,
        powerPreference: 'high-performance',
        precision: isMobile ? 'mediump' : 'highp'
      });
    } catch (err) {
      console.warn('[Hero3D] WebGL creation failed:', err);
      setWebGLError(true);
      setLoading(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = 'none'; // Essential for smooth touch gestures
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Realistic PBR Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv).texture;

    // 3. Studio Warm Lighting: Key, Fill, Rim
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4a017, 1.8);
    rimLight.position.set(-3, -2, -2.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xfff0c0, 1.0, 10);
    fillLight.position.set(0, -1, 2);
    scene.add(fillLight);

    // 4. Subtle Gold Dust Particles
    const particleCount = isMobile ? 20 : 38;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 3.8;
      posArray[i + 1] = (Math.random() - 0.5) * 4.2;
      posArray[i + 2] = (Math.random() - 0.5) * 2.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.024 : 0.03,
      color: 0xffd54f,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Authentic Antique Jewellery Materials
    // Matte rich antique 22K/24K Gold (#D4A017)
    const antiqueGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xD4A017,
      metalness: 1.0,
      roughness: 0.32,
      clearcoat: 0.25,
      clearcoatRoughness: 0.15
    });

    // Brilliant Ruby Gemstone (deep blood-red #9B111E with refractive transmission)
    const rubyMat = new THREE.MeshPhysicalMaterial({
      color: 0x9B111E,
      metalness: 0.1,
      roughness: 0.06,
      transmission: 0.35,
      ior: 1.76,
      clearcoat: 1.0
    });

    // Emerald Green Accent Stone (#0B6E4F)
    const emeraldMat = new THREE.MeshPhysicalMaterial({
      color: 0x0B6E4F,
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.3,
      ior: 1.58,
      clearcoat: 1.0
    });

    // White CZ Halo Diamonds
    const czMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.04,
      transmission: 0.45,
      ior: 2.15,
      clearcoat: 1.0
    });

    // Lustrous Pearl Drop (#F5EFE6)
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xF5EFE6,
      metalness: 0.05,
      roughness: 0.16,
      clearcoat: 1.0,
      sheen: 1.0,
      sheenColor: 0xffeedd
    });

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Expose rootGroup for try-on anchor scaling
    if (onModelReady) {
      onModelReady(rootGroup);
    }

    // 6. Build the Accurate Two-Layer Antique Necklace Set Procedurally (Immediate Fallback)
    const proceduralNecklaceGroup = buildAntiqueTwoLayerNecklaceSet();
    rootGroup.add(proceduralNecklaceGroup);
    setLoading(false);
    setModelType('procedural');

    // 7. GLTF / GLB Loader Check (DRACO Enabled)
    const rawBaseUrl = import.meta.env.BASE_URL || '/';
    const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
    const glbCandidates = [
      `${normalizedBaseUrl}models/necklace-set.glb`,
      `${normalizedBaseUrl}assets/models/haram.glb`
    ];

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Try loading custom GLB if available
    function tryLoadGLB(index = 0) {
      if (index >= glbCandidates.length) return;
      const url = glbCandidates[index];
      fetch(url, { method: 'HEAD' })
        .then((res) => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && !contentType.includes('text/html')) {
            gltfLoader.load(
              url,
              (gltf) => {
                try {
                  if (!gltf?.scene) return;
                  const model = gltf.scene;
                  const box = new THREE.Box3().setFromObject(model);
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  model.position.sub(center);

                  const maxDim = Math.max(size.x, size.y, size.z) || 1;
                  const scaleFactor = 2.4 / maxDim;
                  model.scale.setScalar(scaleFactor);

                  model.traverse((child) => {
                    if (child.isMesh && child.material) {
                      child.material.roughness = 0.35;
                      child.material.metalness = 1.0;
                      child.castShadow = true;
                    }
                  });

                  while (rootGroup.children.length > 0) {
                    rootGroup.remove(rootGroup.children[0]);
                  }
                  rootGroup.add(model);
                  setModelType('glb');
                } catch (err) {
                  console.warn('[Hero3D] Error parsing GLB scene:', err);
                }
              },
              undefined,
              () => tryLoadGLB(index + 1)
            );
          } else {
            tryLoadGLB(index + 1);
          }
        })
        .catch(() => tryLoadGLB(index + 1));
    }
    tryLoadGLB(0);

    // ─── PROCEDURAL JEWELLERY BUILDER (Accurate to Reference Photo) ───────────
    function buildAntiqueTwoLayerNecklaceSet() {
      const setGroup = new THREE.Group();

      // Shared Box-Link Geometry (Flat woven link ~ 9mm x 3mm scaled to Three.js units)
      const linkGeo = new THREE.BoxGeometry(0.042, 0.022, 0.016);

      // --- Layer 1: Short Choker / Collar Necklace ---
      const shortCurvePoints = [
        new THREE.Vector3(-0.55, 0.65, -0.15),
        new THREE.Vector3(-0.46, 0.32, 0.05),
        new THREE.Vector3(-0.30, 0.02, 0.22),
        new THREE.Vector3(0, -0.15, 0.30), // Lowest point of choker
        new THREE.Vector3(0.30, 0.02, 0.22),
        new THREE.Vector3(0.46, 0.32, 0.05),
        new THREE.Vector3(0.55, 0.65, -0.15)
      ];
      const shortCurve = new THREE.CatmullRomCurve3(shortCurvePoints, false, 'centripetal');
      const shortNecklaceGroup = buildSingleLayerNecklace(shortCurve, 55, 0.85);
      setGroup.add(shortNecklaceGroup);

      // --- Layer 2: Long Haram Necklace ---
      const longCurvePoints = [
        new THREE.Vector3(-0.75, 0.82, -0.22),
        new THREE.Vector3(-0.64, 0.36, 0.06),
        new THREE.Vector3(-0.45, -0.25, 0.28),
        new THREE.Vector3(0, -0.72, 0.42), // Lowest point of long haram
        new THREE.Vector3(0.45, -0.25, 0.28),
        new THREE.Vector3(0.64, 0.36, 0.06),
        new THREE.Vector3(0.75, 0.82, -0.22)
      ];
      const longCurve = new THREE.CatmullRomCurve3(longCurvePoints, false, 'centripetal');
      const longNecklaceGroup = buildSingleLayerNecklace(longCurve, 78, 1.25);
      setGroup.add(longNecklaceGroup);

      // --- Layer 3: Swaying South Indian Jhumka Earrings ---
      const leftJhumka = buildJhumkaEarring();
      leftJhumka.position.set(-0.85, -0.55, 0.15);
      const rightJhumka = buildJhumkaEarring();
      rightJhumka.position.set(0.85, -0.55, 0.15);
      setGroup.add(leftJhumka, rightJhumka);

      // Center the whole set vertically in frame
      setGroup.position.set(0, 0.18, 0);
      return setGroup;

      // Helper: Single Woven Band with Ruby Side Plates & Center Scalloped Pendant
      function buildSingleLayerNecklace(curve, linkCount, pendantScale) {
        const neckGroup = new THREE.Group();

        // 1. Woven Box-Link Band using InstancedMesh
        const count = isMobile ? Math.round(linkCount * 0.75) : linkCount;
        const instMesh = new THREE.InstancedMesh(linkGeo, antiqueGoldMat, count);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          const pt = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t).normalize();

          dummy.position.copy(pt);
          dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          // Alternate slight rotation tilt for realistic woven box texture
          dummy.rotateZ((i % 2 === 0 ? 0.12 : -0.12));
          dummy.updateMatrix();
          instMesh.setMatrixAt(i, dummy.matrix);
        }
        instMesh.instanceMatrix.needsUpdate = true;
        neckGroup.add(instMesh);

        // 2. Symmetric Square Connector Plates with Bezel-Set Ruby Stones
        const platePositions = [0.22, 0.78];
        platePositions.forEach((t) => {
          const pt = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t).normalize();
          const plateGroup = new THREE.Group();
          plateGroup.position.copy(pt);
          plateGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

          // Square Gold Plate
          const plateMesh = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.024), antiqueGoldMat);
          // Gold Bezel Ring
          const bezelMesh = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 16), antiqueGoldMat);
          bezelMesh.position.z = 0.014;
          // Center Round Ruby Stone
          const stoneMesh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), rubyMat);
          stoneMesh.position.z = 0.014;

          plateGroup.add(plateMesh, bezelMesh, stoneMesh);
          neckGroup.add(plateGroup);
        });

        // 3. Center Scalloped Teardrop Pendant
        const centerPt = curve.getPointAt(0.5);
        const pendantGroup = buildScallopedPendant(pendantScale);
        pendantGroup.position.copy(centerPt);
        neckGroup.add(pendantGroup);

        return neckGroup;
      }

      // Helper: Detailed Scalloped Teardrop Pendant matching reference photo
      function buildScallopedPendant(scaleFactor = 1.0) {
        const pGroup = new THREE.Group();

        // A. Top Emerald Connector Stone & Gold Bail Loop
        const bail = new THREE.Mesh(new THREE.TorusGeometry(0.022 * scaleFactor, 0.007 * scaleFactor, 8, 16), antiqueGoldMat);
        bail.position.y = 0.02 * scaleFactor;
        const emeraldBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.024 * scaleFactor, 0.024 * scaleFactor, 0.014 * scaleFactor, 16), antiqueGoldMat);
        emeraldBezel.rotation.x = Math.PI / 2;
        const emeraldStone = new THREE.Mesh(new THREE.SphereGeometry(0.02 * scaleFactor, 12, 12), emeraldMat);
        emeraldStone.position.z = 0.008 * scaleFactor;
        pGroup.add(bail, emeraldBezel, emeraldStone);

        // B. Scalloped Teardrop Main Frame (Extruded Shape with Bevel)
        const s = scaleFactor * 0.18;
        const tearShape = new THREE.Shape();
        tearShape.moveTo(0, 0);
        tearShape.bezierCurveTo(-s * 0.9, -s * 0.4, -s * 1.1, -s * 1.6, 0, -s * 2.2);
        tearShape.bezierCurveTo(s * 1.1, -s * 1.6, s * 0.9, -s * 0.4, 0, 0);

        const tearGeo = new THREE.ExtrudeGeometry(tearShape, {
          depth: 0.025 * scaleFactor,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: 0.012 * scaleFactor,
          bevelThickness: 0.012 * scaleFactor
        });
        const mainFrame = new THREE.Mesh(tearGeo, antiqueGoldMat);
        mainFrame.position.y = -0.01 * scaleFactor;
        pGroup.add(mainFrame);

        // C. Scalloped Outer Gold Petal Beads along perimeter
        const petalCount = 16;
        for (let p = 0; p < petalCount; p++) {
          const ang = (p / petalCount) * Math.PI * 2;
          const px = Math.cos(ang) * (s * 0.95);
          const py = -s * 1.1 + Math.sin(ang) * (s * 0.95);
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.012 * scaleFactor, 8, 8), antiqueGoldMat);
          petal.position.set(px, py, 0.015 * scaleFactor);
          pGroup.add(petal);
        }

        // D. White CZ Stone Halo Ring
        const czCount = 12;
        for (let c = 0; c < czCount; c++) {
          const ang = (c / czCount) * Math.PI * 2;
          const cx = Math.cos(ang) * (s * 0.45);
          const cy = -s * 1.15 + Math.sin(ang) * (s * 0.55);
          const cz = new THREE.Mesh(new THREE.SphereGeometry(0.009 * scaleFactor, 8, 8), czMat);
          cz.position.set(cx, cy, 0.03 * scaleFactor);
          pGroup.add(cz);
        }

        // E. Center Teardrop Ruby Gemstone
        const rubyGeo = new THREE.SphereGeometry(s * 0.28, 12, 12);
        rubyGeo.scale(1.0, 1.4, 0.7); // BufferGeometry uses .scale(x, y, z)
        const rubyMesh = new THREE.Mesh(rubyGeo, rubyMat);
        rubyMesh.position.set(0, -s * 1.15, 0.035 * scaleFactor);
        pGroup.add(rubyMesh);

        // F. Hanging Pearl Drop at the Bottom Tip
        const pearlDrop = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scaleFactor, 16, 16), pearlMat);
        pearlDrop.position.set(0, -s * 2.5, 0.01 * scaleFactor);
        const pearlCap = new THREE.Mesh(new THREE.ConeGeometry(0.016 * scaleFactor, 0.018 * scaleFactor, 12), antiqueGoldMat);
        pearlCap.position.set(0, -s * 2.32, 0.01 * scaleFactor);
        pGroup.add(pearlDrop, pearlCap);

        return pGroup;
      }

      // Helper: Swaying South Indian Jhumka Earring
      function buildJhumkaEarring() {
        const jGroup = new THREE.Group();

        // 1. Top Ornate Stud with Ruby
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16), antiqueGoldMat);
        stud.rotation.x = Math.PI / 2;
        const rubyStud = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), rubyMat);
        rubyStud.position.z = 0.014;
        jGroup.add(stud, rubyStud);

        // 2. Connecting Loop
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 8, 14), antiqueGoldMat);
        loop.position.y = -0.055;
        jGroup.add(loop);

        // 3. Bell Dome (Koodai) using LatheGeometry for true antique flare
        const bellPoints = [
          new THREE.Vector2(0.015, 0),
          new THREE.Vector2(0.045, -0.04),
          new THREE.Vector2(0.075, -0.09),
          new THREE.Vector2(0.082, -0.11),
          new THREE.Vector2(0.080, -0.12)
        ];
        const bellGeo = new THREE.LatheGeometry(bellPoints, 18);
        const bellMesh = new THREE.Mesh(bellGeo, antiqueGoldMat);
        bellMesh.position.y = -0.07;
        jGroup.add(bellMesh);

        // 4. Hanging Pearl Drop
        const dropPearl = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 14), pearlMat);
        dropPearl.position.y = -0.22;
        jGroup.add(dropPearl);

        jGroup.scale.set(0.85, 0.85, 0.85); // Safe Vector3 scale
        return jGroup;
      }
    }

    // 8. OrbitControls with Touch Support
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    controls.enableZoom = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 4.8;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.75;
    controls.enablePan = false;

    let touchTimeout = null;
    const onPointerDown = () => {
      controls.autoRotate = false;
      if (touchTimeout) clearTimeout(touchTimeout);
    };
    const onPointerUp = () => {
      touchTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 2500);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // 9. Resize & Orientation Observer
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

    // 10. Pause rendering when tab is hidden to save mobile battery
    let isTabVisible = true;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 11. Animation Loop with THREE.Timer / Clock
    let animId;
    const timer = typeof THREE.Timer === 'function' ? new THREE.Timer() : null;
    const clock = !timer && typeof THREE.Clock === 'function' ? new THREE.Clock() : null;

    const animate = (timestamp) => {
      animId = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      let delta = 0.016;
      if (timer) {
        timer.update(timestamp);
        delta = timer.getDelta();
      } else if (clock) {
        delta = clock.getDelta();
      }

      controls.update();
      particles.rotation.y += delta * 0.03;

      renderer.render(scene, camera);
    };
    animate(performance.now());

    // 12. Cleanup & Full Resource Disposal on Unmount
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();

      // Traverse & dispose geometries/materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      dracoLoader.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [style, onModelReady]);

  // Static Fallback Image if WebGL is unavailable on device
  if (webGLError) {
    return (
      <div className="w-full h-full min-h-[360px] sm:min-h-[460px] relative flex flex-col items-center justify-center p-4 text-center">
        <img
          src="/models/necklace-set.jpg"
          alt="Singapore Fancy 1-Gram Antique Gold Necklace Set"
          className="max-h-[380px] w-auto object-contain rounded-2xl shadow-xl border border-amber-600/40"
        />
        <p className="text-[11px] text-amber-300 mt-2 font-mono">
          Interactive 3D Preview (Photo Display Mode)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] relative flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-400 text-xs gap-2 z-10 bg-stone-950/80">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Temple Haram 3D Model...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
    </div>
  );
};

export default Hero3DChain;
