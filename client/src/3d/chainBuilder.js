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
 * Identify exact chain style and design from product name, specs.style and productCode
 */
export function getProductStyleInfo(product) {
  const name = String(product?.name || '').toLowerCase();
  const rawStyle = String(product?.specs?.style || product?.style || 'rope').toLowerCase();
  const code = String(product?.productCode || '').toUpperCase();

  // 1. Both Mugappu designs handled separately by name
  if (name.includes('floral') && (name.includes('mugappu') || name.includes('mogappu') || rawStyle.includes('mugappu') || code === 'GC-MUG-07')) {
    return { key: 'floral_mugappu', label: 'Floral Mogappu Chain', baseStyle: 'mugappu' };
  }
  if (name.includes('mayil') || name.includes('peacock') || (name.includes('double') && name.includes('mugappu')) || code === 'GC-MUG-02') {
    return { key: 'peacock_mugappu', label: 'Royal Mayil Mugappu Chain', baseStyle: 'mugappu' };
  }

  // 2. Specific Traditional & Heritage Chain Designs
  if (name.includes('palakka') || code === 'GC-TRAD-03') {
    return { key: 'palakka', label: 'Kerala Palakka Chain', baseStyle: 'traditional' };
  }
  if (name.includes('guttapusalu') || code === 'GC-TRAD-08') {
    return { key: 'guttapusalu', label: 'Antique Guttapusalu Pearl Chain', baseStyle: 'traditional' };
  }
  if (name.includes('rudraksha') || code === 'GC-RUD-10') {
    return { key: 'rudraksha', label: 'Rudraksha Mala Chain', baseStyle: 'traditional' };
  }
  if (name.includes('kasu') || name.includes('coin') || code === 'GC-RENT-13') {
    return { key: 'kasu_mala', label: 'Bridal Kasu Mala Coin Chain', baseStyle: 'traditional' };
  }
  if (name.includes('ganga') || name.includes('yamuna') || code === 'GC-TWO-15') {
    return { key: 'ganga_yamuna', label: 'Ganga Yamuna Two-Tone Chain', baseStyle: 'traditional' };
  }
  if (name.includes('bridal') || name.includes('haram') || name.includes('temple') || code === 'GC-RENT-05') {
    return { key: 'temple_haram', label: 'Grand Temple Haram Chain', baseStyle: 'haram' };
  }

  // 3. Other styles
  if (name.includes('figaro') || rawStyle === 'figaro' || code === 'GC-FIG-04') {
    return { key: 'figaro', label: 'Figaro Chain', baseStyle: 'figaro' };
  }
  if (name.includes('box') || rawStyle === 'box' || code === 'GC-BOX-09') {
    return { key: 'box', label: 'Italian Box Chain', baseStyle: 'box' };
  }
  if (name.includes('cuban') || name.includes('curb') || rawStyle === 'curb' || rawStyle === 'cuban' || code === 'GC-CURB-12') {
    return { key: 'cuban', label: 'Heavy Cuban Curb Chain', baseStyle: 'cuban' };
  }
  if (name.includes('initial') || name.includes('custom') || rawStyle.includes('custom') || code === 'GC-CUST-11') {
    return { key: 'custom_initial', label: 'Custom Initial Name Chain', baseStyle: 'custom_initial' };
  }
  if (name.includes('singapore') || name.includes('spiral') || rawStyle === 'singapore' || code === 'GC-SING-14') {
    return { key: 'singapore', label: 'Twisted Singapore Chain', baseStyle: 'singapore' };
  }
  if (name.includes('spiga') || name.includes('wheat') || rawStyle.includes('wheat') || code === 'GC-SPIG-06') {
    return { key: 'spiga_wheat', label: 'Spiga Wheat Link Chain', baseStyle: 'wheat' };
  }
  if (name.includes('rope') || rawStyle === 'rope' || code === 'GC-ROPE-01') {
    return { key: 'rope', label: 'Micro Plated Rope Chain', baseStyle: 'rope' };
  }

  return { key: rawStyle || 'rope', label: product?.name || 'Gold Covering Chain', baseStyle: rawStyle || 'rope' };
}

/**
 * Creates a natural balanced necklace drape "U" that hangs properly centered in frame
 */
export function createNecklaceCurve(scale = 1.0) {
  const points = [
    new THREE.Vector3(-0.75 * scale, 0.65 * scale, -0.15 * scale),
    new THREE.Vector3(-0.62 * scale, 0.25 * scale, 0.05 * scale),
    new THREE.Vector3(-0.42 * scale, -0.22 * scale, 0.22 * scale),
    new THREE.Vector3(0, -0.55 * scale, 0.28 * scale), // lowest drape point centered
    new THREE.Vector3(0.42 * scale, -0.22 * scale, 0.22 * scale),
    new THREE.Vector3(0.62 * scale, 0.25 * scale, 0.05 * scale),
    new THREE.Vector3(0.75 * scale, 0.65 * scale, -0.15 * scale),
  ];
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
}

/**
 * Procedural 3D chain builder supporting all 15 authentic styles & designs
 */
export function buildChain({
  product = null,
  style = 'rope',
  linkCount = 90,
  linkSize = 0.042,
  thickness = 0.016,
  curveShape = null,
  materialPreset = 'yellowGold',
  pendant = 'none',
  initials = ''
} = {}) {
  const styleInfo = getProductStyleInfo(product || { specs: { style } });
  const activeKey = styleInfo.key;

  const group = new THREE.Group();
  group.name = `Chain_${activeKey}`;

  // 1. Materials
  const matConfig = MATERIAL_PRESETS[materialPreset] || MATERIAL_PRESETS.yellowGold;
  const chainMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(matConfig.color),
    metalness: matConfig.metalness,
    roughness: matConfig.roughness,
    clearcoat: matConfig.clearcoat,
    clearcoatRoughness: matConfig.clearcoatRoughness,
    envMapIntensity: 1.5
  });

  const silverMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#e5e7eb'),
    metalness: 0.98,
    roughness: 0.18,
    clearcoat: 0.4
  });

  const rudrakshaMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5c2915'),
    roughness: 0.72,
    metalness: 0.08
  });

  const pearlMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fcfbf7'),
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1
  });

  const emeraldMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0f6b3a'),
    roughness: 0.2,
    metalness: 0.25,
    clearcoat: 0.6
  });

  const rubyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#990012'),
    roughness: 0.2,
    metalness: 0.25,
    clearcoat: 0.6
  });

  // 2. Base Curve
  const curve = curveShape || createNecklaceCurve(1.0);

  // 3. Link Geometry per style
  let linkGeo;
  let count = linkCount;

  switch (activeKey) {
    case 'box':
      linkGeo = new THREE.BoxGeometry(linkSize * 1.15, linkSize * 0.72, linkSize * 0.72);
      count = 80;
      break;

    case 'cuban':
      linkGeo = new THREE.TorusGeometry(linkSize * 1.35, thickness * 1.15, 14, 28);
      count = 56;
      break;

    case 'figaro':
      linkGeo = new THREE.TorusGeometry(linkSize * 1.05, thickness * 0.95, 14, 28);
      count = 72;
      break;

    case 'spiga_wheat':
      linkGeo = new THREE.CylinderGeometry(thickness * 0.9, thickness * 1.25, linkSize * 1.35, 10);
      count = 84;
      break;

    case 'singapore':
      linkGeo = new THREE.TorusGeometry(linkSize * 0.95, thickness * 0.82, 12, 24);
      count = 92;
      break;

    case 'temple_haram':
      // Fluted spherical gold beads
      linkGeo = new THREE.SphereGeometry(linkSize * 0.9, 16, 16);
      count = 46;
      break;

    case 'kasu_mala':
      // Overlapping Lakshmi coin medallions
      linkGeo = new THREE.CylinderGeometry(linkSize * 1.6, linkSize * 1.6, thickness * 0.65, 24);
      linkGeo.rotateX(Math.PI / 2);
      count = 48;
      break;

    case 'rudraksha':
      linkGeo = new THREE.SphereGeometry(linkSize * 1.1, 14, 14);
      count = 44;
      break;

    case 'guttapusalu':
      linkGeo = new THREE.TorusGeometry(linkSize * 0.9, thickness * 0.85, 12, 24);
      count = 60;
      break;

    case 'ganga_yamuna':
      linkGeo = new THREE.TorusGeometry(linkSize * 1.0, thickness * 0.9, 14, 24);
      count = 80;
      break;

    case 'palakka':
      linkGeo = new THREE.BoxGeometry(linkSize * 1.2, linkSize * 0.8, thickness * 1.2);
      count = 52;
      break;

    case 'peacock_mugappu':
    case 'floral_mugappu':
      linkGeo = new THREE.TorusGeometry(linkSize * 0.98, thickness * 0.92, 14, 24);
      count = 80;
      break;

    case 'custom_initial':
      linkGeo = new THREE.TorusGeometry(linkSize * 0.92, thickness * 0.85, 12, 24);
      count = 85;
      break;

    case 'rope':
    default:
      linkGeo = new THREE.TorusGeometry(linkSize * 0.95, thickness * 0.9, 14, 24);
      count = 85;
      break;
  }

  // 4. InstancedMesh Placement along Curve
  const activeMat = activeKey === 'rudraksha' ? rudrakshaMaterial : chainMaterial;
  const instMesh = new THREE.InstancedMesh(linkGeo, activeMat, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    dummy.position.copy(point);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

    // Style-specific rotation patterns
    if (activeKey === 'cuban') {
      dummy.scale.set(1.15, 0.75, 1.0);
      if (i % 2 === 0) dummy.rotateY(Math.PI / 2);
    } else if (activeKey === 'figaro') {
      if (i % 4 === 0) {
        dummy.scale.set(1.55, 1.75, 1.55); // 1 long link
      } else {
        dummy.scale.set(0.9, 0.9, 0.9); // 3 short links
        dummy.rotateY((i % 2) * (Math.PI / 2));
      }
    } else if (activeKey === 'box') {
      dummy.rotateY(Math.PI / 4 + (i % 2) * (Math.PI / 2));
    } else if (activeKey === 'singapore') {
      dummy.rotateZ(i * 0.45);
      dummy.rotateY(i % 2 === 0 ? 0.3 : -0.3);
    } else if (activeKey === 'spiga_wheat') {
      dummy.rotateZ(Math.PI / 2);
      dummy.rotateY((i % 2 === 0 ? 1 : -1) * 0.4);
    } else if (activeKey === 'kasu_mala') {
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.rotateY(0.15);
    } else if (activeKey === 'rope') {
      dummy.rotateZ(i * 0.42);
      dummy.rotateY(i % 2 === 0 ? 0.25 : -0.25);
    }

    dummy.updateMatrix();
    instMesh.setMatrixAt(i, dummy.matrix);

    // Ganga Yamuna two-tone link coloring
    if (activeKey === 'ganga_yamuna') {
      const color = (i % 2 === 0) ? new THREE.Color(matConfig.color) : new THREE.Color('#e5e7eb');
      instMesh.setColorAt(i, color);
    }
  }

  instMesh.instanceMatrix.needsUpdate = true;
  if (activeKey === 'ganga_yamuna' && instMesh.instanceColor) {
    instMesh.instanceColor.needsUpdate = true;
  }
  group.add(instMesh);

  // 5. Guttapusalu Pearl Clusters along the lower curve
  if (activeKey === 'guttapusalu') {
    const pearlGroup = new THREE.Group();
    const pearlGeo = new THREE.SphereGeometry(linkSize * 0.4, 12, 12);
    for (let j = 12; j < count - 12; j += 2) {
      const t = j / (count - 1);
      const pt = curve.getPointAt(t);
      for (let k = 0; k < 2; k++) {
        const pMesh = new THREE.Mesh(pearlGeo, pearlMaterial);
        pMesh.position.set(
          pt.x + (Math.random() - 0.5) * 0.03,
          pt.y - (linkSize * 0.9 + k * 0.02),
          pt.z + (Math.random() - 0.5) * 0.03
        );
        pearlGroup.add(pMesh);
      }
    }
    group.add(pearlGroup);
  }

  // 6. Signature Mugappu Side Brooch Medallion on left curve
  if (activeKey === 'peacock_mugappu' || activeKey === 'floral_mugappu') {
    const mugPt = curve.getPointAt(0.32);
    const mugTan = curve.getTangentAt(0.32).normalize();
    const broochGroup = new THREE.Group();
    broochGroup.position.copy(mugPt);
    broochGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mugTan);

    // Gold Bezel Frame
    const frameGeo = new THREE.CylinderGeometry(linkSize * 1.8, linkSize * 1.8, thickness * 1.2, 24);
    frameGeo.rotateX(Math.PI / 2);
    const frameMesh = new THREE.Mesh(frameGeo, chainMaterial);
    broochGroup.add(frameMesh);

    if (activeKey === 'peacock_mugappu') {
      // Emerald Green Cabochon center
      const emGeo = new THREE.CylinderGeometry(linkSize * 1.2, linkSize * 1.2, thickness * 1.4, 20);
      emGeo.rotateX(Math.PI / 2);
      const emMesh = new THREE.Mesh(emGeo, emeraldMaterial);
      emMesh.position.z = 0.01;
      broochGroup.add(emMesh);

      // Micro Ruby Accent
      const rGeo = new THREE.SphereGeometry(linkSize * 0.45, 12, 12);
      const rMesh = new THREE.Mesh(rGeo, rubyMaterial);
      rMesh.position.z = 0.025;
      broochGroup.add(rMesh);
    } else {
      // Floral Petals
      const petalGeo = new THREE.SphereGeometry(linkSize * 0.45, 10, 10);
      petalGeo.scale(1.2, 0.5, 0.4);
      for (let a = 0; a < 6; a++) {
        const angle = (a / 6) * Math.PI * 2;
        const pMesh = new THREE.Mesh(petalGeo, chainMaterial);
        pMesh.position.set(Math.cos(angle) * linkSize * 1.0, Math.sin(angle) * linkSize * 1.0, 0.015);
        pMesh.rotation.z = angle;
        broochGroup.add(pMesh);
      }
      // Ruby center
      const cGeo = new THREE.SphereGeometry(linkSize * 0.4, 12, 12);
      const cMesh = new THREE.Mesh(cGeo, rubyMaterial);
      cMesh.position.z = 0.025;
      broochGroup.add(cMesh);
    }

    group.add(broochGroup);
  }

  // 7. End Clasps
  const claspGeo = new THREE.TorusGeometry(linkSize * 0.75, thickness * 0.95, 10, 20);
  const leftClasp = new THREE.Mesh(claspGeo, chainMaterial);
  leftClasp.position.copy(curve.getPointAt(0));
  const rightClasp = new THREE.Mesh(claspGeo, chainMaterial);
  rightClasp.position.copy(curve.getPointAt(1));
  group.add(leftClasp, rightClasp);

  // 8. Center Pendant (Bottom Center)
  const centerPoint = curve.getPointAt(0.5);
  const showPendant =
    activeKey === 'temple_haram' ||
    activeKey === 'custom_initial' ||
    initials ||
    pendant !== 'none';

  if (showPendant) {
    const pendantGroup = new THREE.Group();
    pendantGroup.position.copy(centerPoint);

    // Bail Ring
    const bailGeo = new THREE.TorusGeometry(linkSize * 0.65, thickness * 0.8, 12, 24);
    const bailMesh = new THREE.Mesh(bailGeo, chainMaterial);
    bailMesh.position.y = -linkSize * 0.45;
    pendantGroup.add(bailMesh);

    // Temple Haram Lakshmi Plaque with Jhumkas
    if (activeKey === 'temple_haram') {
      const plaqueGeo = new THREE.BoxGeometry(linkSize * 2.8, linkSize * 3.4, thickness * 1.2);
      const plaqueMesh = new THREE.Mesh(plaqueGeo, chainMaterial);
      plaqueMesh.position.set(0, -linkSize * 2.2, 0);
      pendantGroup.add(plaqueMesh);

      const enamelGeo = new THREE.BoxGeometry(linkSize * 2.3, linkSize * 2.9, thickness * 1.3);
      const enamelMesh = new THREE.Mesh(enamelGeo, emeraldMaterial);
      enamelMesh.position.set(0, -linkSize * 2.2, 0.005);
      pendantGroup.add(enamelMesh);

      // Hanging gold jhumki drops
      const dropGeo = new THREE.SphereGeometry(linkSize * 0.35, 12, 12);
      for (let d = -2; d <= 2; d++) {
        const dropMesh = new THREE.Mesh(dropGeo, chainMaterial);
        dropMesh.position.set(d * (linkSize * 0.6), -linkSize * 4.2 - Math.abs(d) * 0.015, 0);
        pendantGroup.add(dropMesh);
      }
    } else {
      // Classic Teardrop or Custom Monogram Initial Plate
      const tearShape = new THREE.Shape();
      tearShape.moveTo(0, 0);
      tearShape.quadraticCurveTo(-0.14, -0.18, 0, -0.32);
      tearShape.quadraticCurveTo(0.14, -0.18, 0, 0);
      const tearGeo = new THREE.ExtrudeGeometry(tearShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008 });
      const tearMesh = new THREE.Mesh(tearGeo, chainMaterial);
      tearMesh.position.set(0, -linkSize * 1.4, 0);
      pendantGroup.add(tearMesh);

      // Center Ruby Gem
      const gemGeo = new THREE.SphereGeometry(linkSize * 0.55, 16, 16);
      const gemMesh = new THREE.Mesh(gemGeo, rubyMaterial);
      gemMesh.position.set(0, -linkSize * 2.6, 0.02);
      pendantGroup.add(gemMesh);
    }

    // Monogram Initial Engraved Plaque
    if (initials && initials.trim()) {
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 256;
      const ctx = textCanvas.getContext('2d');
      ctx.fillStyle = '#b08b32';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#ffe082';
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 236, 236);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px "Cinzel Decorative", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials.slice(0, 3).toUpperCase(), 128, 128);

      const texture = new THREE.CanvasTexture(textCanvas);
      const plateGeo = new THREE.BoxGeometry(linkSize * 2.5, linkSize * 2.5, thickness * 1.1);
      const plateMat = new THREE.MeshPhysicalMaterial({
        map: texture,
        metalness: 0.85,
        roughness: 0.28,
        color: new THREE.Color(matConfig.color)
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(0, -linkSize * 2.5, 0.025);
      pendantGroup.add(plateMesh);
    }

    group.add(pendantGroup);
  }

  return group;
}
