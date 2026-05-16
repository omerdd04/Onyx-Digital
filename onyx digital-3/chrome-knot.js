/**
 * Onyx Digital — Scroll-Driven Chrome Torus Knot
 * --------------------------------------------------------------
 * Premium ESM Three.js scene. Loaded via importmap.
 *
 *  • Geometry : TorusKnotGeometry — elegant, high-poly
 *  • Material : Chrome (MeshPhysicalMaterial, full clearcoat)
 *  • Lighting : RoomEnvironment (PMREM) + Key/Rim/Fill lights
 *  • Tone map : ACESFilmic, exposure 1.15
 *  • Motion   : Scroll-driven keyframe matrix, LERP-smoothed
 *  • Perf     : DPR cap 2, off-tab pause, reduced-motion fallback
 * --------------------------------------------------------------
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('chromeCanvas');
if (canvas) init();

function init() {
  // ── Reduced-motion fallback ───────────────────────────────────
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.classList.add('static');
    return;
  }

  // ── Renderer ──────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // ── Scene & camera ────────────────────────────────────────────
  const scene = new THREE.Scene();
  // No background — alpha canvas reveals the page bg
  const camera = new THREE.PerspectiveCamera(
    35, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.set(0, 0, 8);

  // ── RoomEnvironment for chrome reflections (PMREM) ────────────
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
  roomEnv.dispose(); // free room geometry — keep only the PMREM texture
  pmrem.dispose();

  // ── Chrome / Liquid-Metal material ────────────────────────────
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0,
    envMapIntensity: 1.1
  });

  // ── Geometry — elegant proportions ────────────────────────────
  const geo = new THREE.TorusKnotGeometry(
    /* radius      */ 1.0,
    /* tube        */ 0.32,
    /* tubularSegs */ 220,
    /* radialSegs  */ 32,
    /* p           */ 2,
    /* q           */ 3
  );
  const knot = new THREE.Mesh(geo, chrome);
  scene.add(knot);

  // ── Studio lights ─────────────────────────────────────────────
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(4, 6, 5); // top-front-right
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffeed4, 0.6);
  rimLight.position.set(-5, 2, -4); // back-left, warm
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xd8e6ff, 0.4);
  fillLight.position.set(-2, -3, 4); // soft cool fill from below-left
  scene.add(fillLight);

  // ── Keyframe matrix (scroll progress 0..1) ────────────────────
  // Each entry: { p, x, y, z, scale, spin }
  //   x, y, z : world position (x is multiplied by responsive SIDE)
  //   scale   : uniform scale
  //   spin    : base rotation speed multiplier
  // Sign convention for x: -1 = right (RTL: away from headline start),
  //                        +1 = left
  const KEYS = [
    { p: 0.00, x: -1.0, y: -0.3, z:  0.0, scale: 0.85, spin: 1.0 },  // hero — left-low
    { p: 0.14, x:  1.0, y:  0.4, z: -0.5, scale: 1.00, spin: 1.2 },  // stats — right-high
    { p: 0.30, x: -1.0, y:  0.0, z:  0.5, scale: 1.10, spin: 0.9 },  // services — left
    { p: 0.45, x:  1.0, y: -0.4, z: -0.3, scale: 1.05, spin: 1.4 },  // testimonials — right-low
    { p: 0.60, x: -1.0, y:  0.5, z:  0.0, scale: 1.15, spin: 1.1 },  // brand-deep — left-high
    { p: 0.78, x:  1.0, y:  0.0, z:  0.3, scale: 1.20, spin: 1.5 },  // pricing — right
    { p: 0.92, x: -1.0, y: -0.3, z: -0.2, scale: 1.35, spin: 1.8 },  // FAQ — left
    { p: 1.00, x:  0.0, y:  0.0, z:  1.0, scale: 1.85, spin: 2.6 }   // final-CTA — center, big, fast
  ];

  // Cubic ease-in-out — used inside each keyframe segment
  const easeInOutCubic = t =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Interpolate the matrix at scroll progress p ∈ [0..1]
  function sampleKeys(p) {
    p = Math.max(0, Math.min(1, p));
    // Find segment
    let a = KEYS[0], b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (p >= KEYS[i].p && p <= KEYS[i + 1].p) {
        a = KEYS[i]; b = KEYS[i + 1]; break;
      }
    }
    const span = b.p - a.p || 1;
    const t = easeInOutCubic((p - a.p) / span);
    return {
      x:     a.x     + (b.x     - a.x    ) * t,
      y:     a.y     + (b.y     - a.y    ) * t,
      z:     a.z     + (b.z     - a.z    ) * t,
      scale: a.scale + (b.scale - a.scale) * t,
      spin:  a.spin  + (b.spin  - a.spin ) * t
    };
  }

  // ── Responsive SIDE multiplier ────────────────────────────────
  // Pushes the knot further out on wide screens; tighter on mobile
  function getSide() {
    const w = window.innerWidth;
    if (w < 720)  return 1.4;  // mobile — close to viewport edge
    if (w < 1200) return 2.4;
    return 3.2;                 // wide desktop
  }
  let SIDE = getSide();

  // ── Scroll tracking & LERP smoothing ──────────────────────────
  let scrollTarget = 0;   // raw scroll (0..1)
  let scrollSmooth = 0;   // lerped scroll
  const SCROLL_LERP = 0.08;
  const TRANSFORM_LERP = 0.12;

  // Smoothed object state (chases sampled keyframe values)
  const cur = { x: 0, y: 0, z: 0, scale: 1, spin: 1 };

  function readScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollTarget = window.scrollY / max;
  }
  readScroll();
  window.addEventListener('scroll', readScroll, { passive: true });

  // ── Resize ────────────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    SIDE = getSide();
    readScroll();
  }
  window.addEventListener('resize', onResize);

  // ── Visibility pause ──────────────────────────────────────────
  let running = true;
  let rafId = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!running) {
      running = true;
      lastT = performance.now();
      loop();
    }
  });

  // ── Render loop ───────────────────────────────────────────────
  let lastT = performance.now();
  function loop() {
    if (!running) return;
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    lastT = now;

    // Honey-smooth scroll
    scrollSmooth += (scrollTarget - scrollSmooth) * SCROLL_LERP;

    // Sample keyframe matrix
    const k = sampleKeys(scrollSmooth);

    // Smooth chase
    cur.x     += (k.x     * SIDE - cur.x    ) * TRANSFORM_LERP;
    cur.y     += (k.y     - cur.y           ) * TRANSFORM_LERP;
    cur.z     += (k.z     - cur.z           ) * TRANSFORM_LERP;
    cur.scale += (k.scale - cur.scale       ) * TRANSFORM_LERP;
    cur.spin  += (k.spin  - cur.spin        ) * TRANSFORM_LERP;

    knot.position.set(cur.x, cur.y, cur.z);
    knot.scale.setScalar(cur.scale);

    // Constant rotation, modulated by spin multiplier
    knot.rotation.x += dt * 0.35 * cur.spin;
    knot.rotation.y += dt * 0.45 * cur.spin;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  }

  // ── Fade-in & start ───────────────────────────────────────────
  requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    loop();
  });
}
