import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
import fs from 'fs';

const scene = new THREE.Scene();
const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (gltf) => {
    fs.writeFileSync('test_output.glb', Buffer.from(gltf));
    console.log('SUCCESS: test_output.glb written, size:', fs.statSync('test_output.glb').size);
  },
  (err) => {
    console.error('ERROR in exporter:', err);
  },
  { binary: true }
);
