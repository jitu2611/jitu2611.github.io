import * as THREE from 'three';

const canvas = document.querySelector('#orb');
const wrap = document.querySelector('.orb-wrap');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  document.documentElement.dataset.orbReady = 'true';
} catch (error) {
  document.documentElement.classList.add('no-webgl');
  throw error;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
camera.position.z = 6;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const group = new THREE.Group();
scene.add(group);
scene.add(new THREE.AmbientLight(0xffffff, 1.7));
const key = new THREE.PointLight(0xffffff, 20, 14);
key.position.set(3, 4, 5);
scene.add(key);

const color = new THREE.Color('#516b3a');
const shellMaterial = new THREE.MeshPhysicalMaterial({
  color: '#a8b89a',
  roughness: .36,
  metalness: .05,
  transmission: .08,
  clearcoat: .7,
  clearcoatRoughness: .2,
  transparent: true,
  opacity: .9
});
const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 3), shellMaterial);
group.add(shell);

const wireMaterial = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: .33 });
const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.48, 2), wireMaterial);
group.add(wire);

const pointsGeometry = new THREE.BufferGeometry();
const points = [];
for (let index = 0; index < 150; index++) {
  const phi = Math.acos(1 - 2 * (index + .5) / 150);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const radius = 1.75 + Math.sin(index * 2.4) * .08;
  points.push(Math.cos(theta) * Math.sin(phi) * radius, Math.cos(phi) * radius, Math.sin(theta) * Math.sin(phi) * radius);
}
pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
const pointMaterial = new THREE.PointsMaterial({ color, size: .024, transparent: true, opacity: .65 });
group.add(new THREE.Points(pointsGeometry, pointMaterial));

const ringMaterials = [];
[1.85, 2.12].forEach((radius, index) => {
  const material = new THREE.MeshBasicMaterial({ color: index ? '#9c9f96' : color, transparent: true, opacity: index ? .2 : .45 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .008, 5, 150), material);
  ring.rotation.set(.75 + index * .65, .25 + index * .4, index * .6);
  ring.userData.speed = index ? -.0008 : .0011;
  ringMaterials.push(material);
  group.add(ring);
});

const satellites = [];
for (let index = 0; index < 4; index++) {
  const satellite = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 10), new THREE.MeshBasicMaterial({ color }));
  satellite.userData.offset = index / 4 * Math.PI * 2;
  satellites.push(satellite);
  group.add(satellite);
}

const pointer = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
wrap.addEventListener('pointermove', event => {
  const bounds = wrap.getBoundingClientRect();
  target.x = ((event.clientX - bounds.left) / bounds.width - .5) * .65;
  target.y = ((event.clientY - bounds.top) / bounds.height - .5) * .65;
});
wrap.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

window.addEventListener('orb-accent', event => {
  const next = new THREE.Color(event.detail);
  color.copy(next);
  wireMaterial.color.copy(next);
  pointMaterial.color.copy(next);
  ringMaterials[0].color.copy(next);
  satellites.forEach(satellite => satellite.material.color.copy(next));
  shellMaterial.color.copy(next).lerp(new THREE.Color('#f2f2eb'), .48);
});

function resize() {
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(wrap);

let frame = 0;
let visible = true;
const clock = new THREE.Clock();
function render() {
  const elapsed = clock.getElapsedTime();
  pointer.x += (target.x - pointer.x) * .045;
  pointer.y += (target.y - pointer.y) * .045;
  group.rotation.y = elapsed * .055 + pointer.x;
  group.rotation.x = -.12 + pointer.y;
  group.children.forEach(child => {
    if (child.userData.speed) child.rotation.z += child.userData.speed;
  });
  satellites.forEach((satellite, index) => {
    const angle = elapsed * (.18 + index * .018) + satellite.userData.offset;
    satellite.position.set(Math.cos(angle) * 1.95, Math.sin(angle) * 1.25, Math.sin(angle * .7) * .85);
  });
  renderer.render(scene, camera);
  if (visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(render);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  clock.getDelta();
  render();
}
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(wrap);
reduced.addEventListener('change', sync);
document.addEventListener('visibilitychange', sync);
resize();
sync();
