import * as THREE from 'three';

/**
 * Creates an interactive 3D Neural Brain WebGL Scene
 * - Dual anatomical cerebral hemispheres (left & right) with gyri & sulci folds
 * - Cerebellar folia and brain stem structures
 * - Holographic cyber-glass cortex with Fresnel edge glow
 * - Neural lattice wireframe & glowing synaptic nodes
 * - Active electrical action potentials (synaptic thought pulses) traveling along neural pathways
 * - Hero section color palette: Electric Cyan (#38bdf8), Sapphire Blue (#3b82f6), Royal Blue (#1d4ed8)
 * - Mouse parallax tracking & scroll progress reactivity
 */
export function createIdeaScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  container.innerHTML = '';

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.4, 11.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // -------------------------------------------------------------
  // Lighting: Hero Section Electric Cyan & Deep Sapphire Blue
  // -------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0x061224, 0.9);
  scene.add(ambientLight);

  // Key light: Bright Electric Cyan (#38bdf8)
  const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
  keyLight.position.set(6, 8, 7);
  scene.add(keyLight);

  // Fill light: Deep Sapphire / Indigo Blue (#2563eb)
  const fillLight = new THREE.DirectionalLight(0x1d4ed8, 1.4);
  fillLight.position.set(-7, -4, 5);
  scene.add(fillLight);

  // Back Rim light: Pure Luminous Cyan-White for crisp edge highlights
  const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.5);
  rimLight.position.set(0, 8, -7);
  scene.add(rimLight);

  // -------------------------------------------------------------
  // Transformation Groups
  // -------------------------------------------------------------
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const brainPivot = new THREE.Group();
  rootGroup.add(brainPivot);

  // Slight initial tilt for optimal 3D perspective of both hemispheres
  brainPivot.rotation.y = THREE.MathUtils.degToRad(-18);
  brainPivot.rotation.x = THREE.MathUtils.degToRad(12);

  // -------------------------------------------------------------
  // Helper: Create Cerebral Hemisphere Mesh with Gyri & Sulci
  // -------------------------------------------------------------
  function createHemisphere(sign) {
    const geo = new THREE.SphereGeometry(1.55, 64, 64);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      const norm = v.clone().normalize();
      const phi = Math.acos(THREE.MathUtils.clamp(norm.y, -1, 1));
      const theta = Math.atan2(norm.z, norm.x);

      // Anatomical Proportions: elongated front-to-back, arched top, lateral curve
      const scaleX = 0.84;
      const scaleY = 1.08;
      const scaleZ = 1.34;

      // Medial Flattening (inner face facing the interhemispheric fissure)
      let medialFactor = 1.0;
      if (norm.x * sign < 0) {
        medialFactor = 0.72 + 0.28 * Math.pow(Math.abs(norm.y), 0.7);
      }

      // Temporal Lobe protrusion (lower lateral front/middle)
      const isTemporal = Math.exp(-Math.pow(phi - 1.95, 2) / 0.35) *
                         Math.exp(-Math.pow(theta - (sign > 0 ? 0.75 : -0.75), 2) / 0.5) * 0.22;

      // Frontal pole curve (anterior arch)
      const frontalLift = (norm.z > 0.4 && norm.y > -0.2) ? 0.08 * norm.z : 0;

      // Realistic Gyri & Sulci cortex folds
      const fold1 = Math.sin(phi * 15.0 + Math.sin(theta * 9.0) * 1.6) * 0.065;
      const fold2 = Math.cos(theta * 13.0 + Math.cos(phi * 13.0) * 1.6) * 0.055;
      const fold3 = Math.sin(phi * 8.0 + theta * 7.0) * 0.035;
      const sulci = fold1 + fold2 + fold3;

      const r = 1.55 * (1.0 + sulci + isTemporal + frontalLift);

      let x = norm.x * r * scaleX * medialFactor + (sign * 0.36);
      let y = norm.y * r * scaleY;
      let z = norm.z * r * scaleZ;

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // -------------------------------------------------------------
  // Materials: Cyber-Holographic Glass & Hero Neon Cyan
  // -------------------------------------------------------------
  const cortexMat = new THREE.MeshPhysicalMaterial({
    color: 0x082f49,           // Deep cyber navy-cyan
    emissive: 0x0284c7,        // Subtle electric blue emission
    emissiveIntensity: 0.22,
    roughness: 0.22,
    metalness: 0.15,
    transmission: 0.76,        // Frosted neural glass
    thickness: 1.2,
    ior: 1.52,
    specularIntensity: 0.8,
    specularColor: 0x7dd3fc,   // Soft cyan specular
    transparent: true,
    opacity: 0.88
  });

  const wireframeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });

  // Left & Right Hemispheres
  const leftGeo = createHemisphere(-1);
  const rightGeo = createHemisphere(1);

  const leftCortex = new THREE.Mesh(leftGeo, cortexMat);
  const rightCortex = new THREE.Mesh(rightGeo, cortexMat);
  brainPivot.add(leftCortex);
  brainPivot.add(rightCortex);

  const leftWire = new THREE.Mesh(leftGeo, wireframeMat);
  const rightWire = new THREE.Mesh(rightGeo, wireframeMat);
  leftWire.scale.set(1.008, 1.008, 1.008);
  rightWire.scale.set(1.008, 1.008, 1.008);
  brainPivot.add(leftWire);
  brainPivot.add(rightWire);

  // -------------------------------------------------------------
  // Cerebellum (Lower Posterior Lobes)
  // -------------------------------------------------------------
  function createCerebellumLobe(sign) {
    const geo = new THREE.SphereGeometry(0.72, 32, 32);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const norm = v.clone().normalize();

      // Fine horizontal folia ridges
      const folia = Math.sin(norm.y * 36.0) * 0.04;
      const r = 0.72 * (1.0 + folia);

      pos.setXYZ(
        i,
        norm.x * r * 0.9 + (sign * 0.44),
        norm.y * r * 0.75 - 0.92,
        norm.z * r * 0.95 - 0.95
      );
    }
    geo.computeVertexNormals();
    return geo;
  }

  const leftCereb = new THREE.Mesh(createCerebellumLobe(-1), cortexMat);
  const rightCereb = new THREE.Mesh(createCerebellumLobe(1), cortexMat);
  brainPivot.add(leftCereb);
  brainPivot.add(rightCereb);

  // -------------------------------------------------------------
  // Brain Stem (Tapered Central Base)
  // -------------------------------------------------------------
  const stemGeo = new THREE.CylinderGeometry(0.24, 0.16, 1.2, 24);
  stemGeo.rotateX(THREE.MathUtils.degToRad(-15));
  const stemMesh = new THREE.Mesh(stemGeo, cortexMat);
  stemMesh.position.set(0, -1.45, -0.45);
  brainPivot.add(stemMesh);

  // -------------------------------------------------------------
  // Glowing Inner Core Point Light (Pulsating Thought Activity)
  // -------------------------------------------------------------
  const innerLight = new THREE.PointLight(0x38bdf8, 4.5, 12, 1.2);
  innerLight.position.set(0, 0.1, 0);
  brainPivot.add(innerLight);

  const innerCoreGeo = new THREE.SphereGeometry(0.85, 24, 24);
  const innerCoreMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35
  });
  const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  brainPivot.add(innerCoreMesh);

  // -------------------------------------------------------------
  // Synaptic Neural Pathways & Traveling Action Potential Pulses
  // -------------------------------------------------------------
  const pathwayCount = 18;
  const pulseObjects = [];

  for (let p = 0; p < pathwayCount; p++) {
    // Generate curved fiber across hemispheres or along lobes
    const sign = (p % 2 === 0) ? 1 : -1;
    const startX = sign * (0.4 + Math.random() * 0.8);
    const startY = (Math.random() - 0.3) * 1.5;
    const startZ = 1.4 - Math.random() * 0.6; // frontal

    const midX = (sign * (0.8 + Math.random() * 0.7));
    const midY = 0.5 + Math.random() * 0.9;   // dorsal arch
    const midZ = (Math.random() - 0.5) * 1.0;

    const endX = (p % 3 === 0) ? -sign * 0.5 : sign * 0.6; // some cross over!
    const endY = -0.4 - Math.random() * 0.8; // occipital/cerebellum
    const endZ = -1.2 - Math.random() * 0.5;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(endX, endY, endZ)
    ]);

    // Faint neural pathway line
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.016, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    brainPivot.add(tubeMesh);

    // Glowing Synaptic Electrical Pulse Bead
    const beadGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const beadMat = new THREE.MeshBasicMaterial({
      color: (p % 2 === 0) ? 0xffffff : 0x38bdf8
    });
    const beadMesh = new THREE.Mesh(beadGeo, beadMat);
    brainPivot.add(beadMesh);

    pulseObjects.push({
      curve,
      bead: beadMesh,
      speed: 0.22 + Math.random() * 0.28,
      offset: Math.random()
    });
  }

  // -------------------------------------------------------------
  // Luminous Synaptic Point Nodes across Cortex
  // -------------------------------------------------------------
  const synapseCount = 180;
  const synapseGeo = new THREE.BufferGeometry();
  const synapsePos = new Float32Array(synapseCount * 3);

  // Sample points on both hemispheres
  for (let s = 0; s < synapseCount; s++) {
    const sign = (s % 2 === 0) ? 1 : -1;
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);

    const r = 1.55 * (1.0 + (Math.random() - 0.5) * 0.08);
    const x = Math.sin(phi) * Math.cos(theta) * r * 0.84 + (sign * 0.36);
    const y = Math.cos(phi) * r * 1.08;
    const z = Math.sin(phi) * Math.sin(theta) * r * 1.34;

    synapsePos[s * 3] = x;
    synapsePos[s * 3 + 1] = y;
    synapsePos[s * 3 + 2] = z;
  }
  synapseGeo.setAttribute('position', new THREE.BufferAttribute(synapsePos, 3));

  // Circular glow texture for synaptic dots
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 32;
  sCanvas.height = 32;
  const sCtx = sCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  sGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  sGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
  sGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.3)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 32, 32);

  const sTex = new THREE.CanvasTexture(sCanvas);

  const synapseMat = new THREE.PointsMaterial({
    map: sTex,
    color: 0x38bdf8,
    size: 0.28,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const synapsePoints = new THREE.Points(synapseGeo, synapseMat);
  brainPivot.add(synapsePoints);

  // -------------------------------------------------------------
  // Floating Thought Motes & Neural Sparks (Surrounding Halo)
  // -------------------------------------------------------------
  const moteCount = 120;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  const moteVelocities = [];

  for (let m = 0; m < moteCount; m++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.4 + Math.random() * 2.8;

    motePos[m * 3] = r * Math.sin(phi) * Math.cos(theta);
    motePos[m * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    motePos[m * 3 + 2] = r * Math.cos(phi);

    moteVelocities.push({
      orbitSpeed: (Math.random() - 0.5) * 0.008,
      bobSpeed: 0.8 + Math.random() * 1.5,
      bobAmp: 0.004 + Math.random() * 0.006,
      radius: r,
      angle: theta
    });
  }

  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));

  const moteMat = new THREE.PointsMaterial({
    map: sTex,
    color: 0x7dd3fc,
    size: 0.22,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const motePoints = new THREE.Points(moteGeo, moteMat);
  brainPivot.add(motePoints);

  // -------------------------------------------------------------
  // Interactive Cursor Parallax & Rotation
  // -------------------------------------------------------------
  const targetRotation = {
    x: THREE.MathUtils.degToRad(12),
    y: THREE.MathUtils.degToRad(-18)
  };

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    targetRotation.y = THREE.MathUtils.degToRad(-18) + mouseX * 0.45;
    targetRotation.x = THREE.MathUtils.degToRad(12) - mouseY * 0.35;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // -------------------------------------------------------------
  // Scroll Progress Updates
  // -------------------------------------------------------------
  let currentScrollProgress = 0;
  let targetScale = 1.0;

  function updateScrollProgress(p) {
    currentScrollProgress = THREE.MathUtils.clamp(p, 0, 1);
    const power = THREE.MathUtils.smoothstep(currentScrollProgress, 0.05, 0.5);

    targetScale = 0.92 + power * 0.18;
    rootGroup.position.y = (currentScrollProgress - 0.5) * 0.6;
  }

  // -------------------------------------------------------------
  // Animation Loop
  // -------------------------------------------------------------
  let animationFrameId;
  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Subtle breathing / idle floating motion
    const idleY = Math.sin(elapsedTime * 1.5) * 0.12;
    const idleRoll = Math.cos(elapsedTime * 0.9) * 0.04;

    // Smooth lerp rotation towards mouse position + slow continuous orbit
    const continuousSpin = elapsedTime * 0.06;
    brainPivot.rotation.x = THREE.MathUtils.lerp(brainPivot.rotation.x, targetRotation.x, 0.05);
    brainPivot.rotation.y = THREE.MathUtils.lerp(brainPivot.rotation.y, targetRotation.y + continuousSpin, 0.05);
    brainPivot.rotation.z = idleRoll;
    brainPivot.position.y = idleY;

    // Thought Pulse Wave (Core point light expansion & breathing)
    const pulseStrength = 1.0 + Math.sin(elapsedTime * 3.5) * 0.08;
    innerCoreMesh.scale.set(pulseStrength, pulseStrength, pulseStrength);
    innerLight.intensity = 4.5 + Math.sin(elapsedTime * 3.5) * 1.5;
    cortexMat.emissiveIntensity = 0.22 + Math.sin(elapsedTime * 3.5) * 0.08;

    // Move electrical pulses along neural pathways
    for (let p = 0; p < pulseObjects.length; p++) {
      const item = pulseObjects[p];
      const t = (elapsedTime * item.speed + item.offset) % 1.0;
      const pt = item.curve.getPointAt(t);
      item.bead.position.copy(pt);
      // Small pulse scale flare as it reaches midpoint
      const s = 1.0 + Math.sin(t * Math.PI) * 0.8;
      item.bead.scale.set(s, s, s);
    }

    // Ambient Thought Mote movement
    const pos = moteGeo.attributes.position.array;
    for (let m = 0; m < moteCount; m++) {
      const v = moteVelocities[m];
      v.angle += v.orbitSpeed;

      pos[m * 3] = Math.cos(v.angle) * v.radius;
      pos[m * 3 + 1] += Math.sin(elapsedTime * v.bobSpeed) * v.bobAmp;
      pos[m * 3 + 2] = Math.sin(v.angle) * v.radius;
    }
    moteGeo.attributes.position.needsUpdate = true;

    // Smooth scale adjustment
    rootGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    renderer.render(scene, camera);
  }

  animate();

  // -------------------------------------------------------------
  // Resize Handler
  // -------------------------------------------------------------
  function onResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);

  function destroy() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(animationFrameId);
    renderer.dispose();
  }

  return {
    updateScrollProgress,
    destroy
  };
}
