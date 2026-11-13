import * as THREE from 'three';

// 4 Material presets for 3D gold chain
export const MATERIAL_PRESETS = {
  yellowGold: {
    name: 'Yellow Gold',
    color: '#d4a82c',
    metalness: 1.0,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1
  },
  roseGold: {
    name: 'Rose Gold',
    color: '#e0a088',
    metalness: 1.0,
    roughness: 0.24,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1
  },
  antiqueGold: {
    name: 'Antique Gold',
    color: '#b08b32',
    metalness: 0.95,
    roughness: 0.42,
    clearcoat: 0.15,
    clearcoatRoughness: 0.2
  },
  silver: {
    name: 'Silver',
    color: '#e5e7eb',
    metalness: 0.98,
    roughness: 0.18,
    clearcoat: 0.4,
    clearcoatRoughness: 0.08
  }
};

/**
 * Creates a CatmullRomCurve3 matching a classic necklace drape "U"
 */
export function createNecklaceCurve(scale = 1.0) {
  const points = [
    new THREE.Vector3(-0.9 * scale, 0.7 * scale, -0.2 * scale),
    new THREE.Vector3(-0.75 * scale, 0.2 * scale, 0.05 * scale),
    new THREE.Vector3(-0.45 * scale, -0.4 * scale, 0.3 * scale),
    new THREE.Vector3(0, -0.65 * scale, 0.38 * scale), // lowest drape point
    new THREE.Vector3(0.45 * scale, -0.4 * scale, 0.3 * scale),
    new THREE.Vector3(0.75 * scale, 0.2 * scale, 0.05 * scale),
    new THREE.Vector3(0.9 * scale, 0.7 * scale, -0.2 * scale),
  ];
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
}

/**
 * Procedural chain builder for all 10 styles
 */
export function buildChain({
  style = 'rope',
  linkCount = 90,
  linkSize = 0.04,
  thickness = 0.015,
  curveShape = null,
  materialPreset = 'yellowGold',
  pendant = 'none',
  initials = ''
} = {}) {
  const group = new THREE.Group();
  group.name = `Chain_${style}`;

  // 1. Material
  const matConfig = MATERIAL_PRESETS[materialPreset] || MATERIAL_PRESETS.yellowGold;
  const chainMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(matConfig.color),
    metalness: matConfig.metalness,
    roughness: matConfig.roughness,
    clearcoat: matConfig.clearcoat,
    clearcoatRoughness: matConfig.clearcoatRoughness,
    envMapIntensity: 1.5
  });

  // 2. Base Curve
  const curve = curveShape || createNecklaceCurve(1.0);

  // 3. Link Geometry per style
  let linkGeo;
  switch (style) {
    case 'box':
      linkGeo = new THREE.BoxGeometry(linkSize * 1.2, linkSize * 0.8, linkSize * 0.8);
      break;
    case 'curb':
      linkGeo = new THREE.TorusGeometry(linkSize, thickness * 0.8, 12, 24);
      break;
    case 'cuban':
      linkGeo = new THREE.TorusGeometry(linkSize * 1.3, thickness * 1.2, 14, 28);
      break;
    case 'figaro':
      linkGeo = new THREE.TorusGeometry(linkSize, thickness, 12, 24);
      break;
    case 'snake':
      // Snake uses a smooth continuous ribbed tube
      const tubeGeo = new THREE.TubeGeometry(curve, 128, thickness * 1.1, 16, false);
      const snakeMesh = new THREE.Mesh(tubeGeo, chainMaterial);
      group.add(snakeMesh);
      break;
    case 'mariner':
      // Torus with center bar
      const torus = new THREE.TorusGeometry(linkSize * 1.1, thickness * 0.9, 12, 24);
      const bar = new THREE.CylinderGeometry(thickness * 0.7, thickness * 0.7, linkSize * 1.8, 8);
      bar.rotateZ(Math.PI / 2);
      // Combine torus and bar in geometry or two meshes
      linkGeo = torus;
      break;
    case 'wheat':
      linkGeo = new THREE.CylinderGeometry(thickness, thickness * 1.2, linkSize * 1.5, 8);
      break;
    case 'byzantine':
      linkGeo = new THREE.TorusGeometry(linkSize * 0.9, thickness * 0.85, 10, 20);
      break;
    case 'haram':
      linkGeo = new THREE.TorusGeometry(linkSize * 1.2, thickness * 1.1, 12, 24);
      break;
    case 'rope':
    default:
      linkGeo = new THREE.CapsuleGeometry(thickness * 1.1, linkSize * 0.8, 8, 16);
      break;
  }

  // 4. InstancedMesh Placement along Curve (except continuous snake)
  if (style !== 'snake') {
    const count = style === 'cuban' || style === 'haram' ? 65 : linkCount;
    const instMesh = new THREE.InstancedMesh(linkGeo, chainMaterial, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();

      dummy.position.copy(point);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

      // Rotation patterns for specific chain styles
      if (style === 'curb' || style === 'cuban') {
        if (i % 2 === 0) {
          dummy.rotateY(Math.PI / 2);
        }
      } else if (style === 'rope') {
        dummy.rotateZ(i * 0.45);
      } else if (style === 'box') {
        dummy.rotateY(Math.PI / 4 + (i % 2) * (Math.PI / 2));
      } else if (style === 'figaro') {
        if (i % 4 === 0) {
          dummy.scale.set(1.6, 1.8, 1.6); // Long link
        } else {
          dummy.scale.set(1.0, 1.0, 1.0); // 3 Short links
          dummy.rotateY((i % 2) * (Math.PI / 2));
        }
      }

      dummy.updateMatrix();
      instMesh.setMatrixAt(i, dummy.matrix);
    }
    instMesh.instanceMatrix.needsUpdate = true;
    group.add(instMesh);
  }

  // 5. End Clasps (Lobster Clasp + Ring on both ends)
  const claspGeo = new THREE.TorusGeometry(linkSize * 0.8, thickness, 10, 20);
  const leftClasp = new THREE.Mesh(claspGeo, chainMaterial);
  leftClasp.position.copy(curve.getPointAt(0));
  const rightClasp = new THREE.Mesh(claspGeo, chainMaterial);
  rightClasp.position.copy(curve.getPointAt(1));
  group.add(leftClasp, rightClasp);

  // 6. Pendant Attachment at bottom center
  const centerPoint = curve.getPointAt(0.5);
  const activePendant = pendant || (style === 'haram' ? 'teardrop' : (style === 'rope' ? 'heart' : 'none'));

  if (activePendant !== 'none' || initials) {
    const pendantGroup = new THREE.Group();
    pendantGroup.position.copy(centerPoint);

    // Bail Ring
    const bailGeo = new THREE.TorusGeometry(linkSize * 0.7, thickness * 0.8, 12, 24);
    const bailMesh = new THREE.Mesh(bailGeo, chainMaterial);
    bailMesh.position.y = -linkSize * 0.5;
    pendantGroup.add(bailMesh);

    // Main Pendant Shape
    let pendantMesh = null;
    if (activePendant === 'heart') {
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, 0.05, -0.1, 0.12, -0.15, 0.05);
      heartShape.bezierCurveTo(-0.2, -0.02, -0.1, -0.1, 0, -0.2);
      heartShape.bezierCurveTo(0.1, -0.1, 0.2, -0.02, 0.15, 0.05);
      heartShape.bezierCurveTo(0.1, 0.12, 0, 0.05, 0, 0);

      const extrudeSettings = { depth: 0.03, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
      const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      pendantMesh = new THREE.Mesh(heartGeo, chainMaterial);
      pendantMesh.position.set(0, -linkSize * 1.5, 0);
    } else if (activePendant === 'coin') {
      const coinGeo = new THREE.CylinderGeometry(linkSize * 2.2, linkSize * 2.2, thickness * 1.5, 32);
      coinGeo.rotateX(Math.PI / 2);
      pendantMesh = new THREE.Mesh(coinGeo, chainMaterial);
      pendantMesh.position.set(0, -linkSize * 2.5, 0);
    } else if (activePendant === 'teardrop' || style === 'haram') {
      const tearShape = new THREE.Shape();
      tearShape.moveTo(0, 0);
      tearShape.quadraticCurveTo(-0.15, -0.2, 0, -0.35);
      tearShape.quadraticCurveTo(0.15, -0.2, 0, 0);
      const tearGeo = new THREE.ExtrudeGeometry(tearShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
      pendantMesh = new THREE.Mesh(tearGeo, chainMaterial);
      pendantMesh.position.set(0, -linkSize * 1.5, 0);
    }

    if (pendantMesh) pendantGroup.add(pendantMesh);

    // Initial-Letter Plate / Initials Text if provided
    if (initials) {
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 256;
      const ctx = textCanvas.getContext('2d');
      ctx.fillStyle = '#b08b32';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#ffe082';
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 236, 236);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 110px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials.slice(0, 3).toUpperCase(), 128, 128);

      const texture = new THREE.CanvasTexture(textCanvas);
      const plateGeo = new THREE.BoxGeometry(linkSize * 2.4, linkSize * 2.4, thickness);
      const plateMat = new THREE.MeshPhysicalMaterial({
        map: texture,
        metalness: 0.85,
        roughness: 0.3,
        color: new THREE.Color(matConfig.color)
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(0, -linkSize * 2.6, 0.02);
      pendantGroup.add(plateMesh);
    }

    group.add(pendantGroup);
  }

  return group;
}
