import * as THREE from 'three';
import { createCentralCubeTexture, createProductCubeTexture } from './cubeTextures.js';

export function createSynerbitConstellation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  container.innerHTML = '';

  // 1. Scene & Setup: Pure pitch dark void
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.015);

  const camera = new THREE.PerspectiveCamera(
    46,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  container.appendChild(renderer.domElement);

  // 2. High-Contrast Studio Lighting
  const ambientLight = new THREE.AmbientLight(0x070b14, 1.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 3.2);
  mainLight.position.set(10, 16, 14);
  scene.add(mainLight);

  const blueBackLight = new THREE.PointLight(0x38bdf8, 14, 45);
  blueBackLight.position.set(0, 0, -3);
  scene.add(blueBackLight);

  const purpleAccent = new THREE.PointLight(0xa855f7, 8, 35);
  purpleAccent.position.set(-8, 8, 6);
  scene.add(purpleAccent);

  const emeraldAccent = new THREE.PointLight(0x10b981, 6, 30);
  emeraldAccent.position.set(8, -6, 5);
  scene.add(emeraldAccent);

  // 3. Central System Root Group
  const systemRoot = new THREE.Group();
  scene.add(systemRoot);

  // 3A. Central Holographic Rounded Cube
  const centralGroup = new THREE.Group();
  systemRoot.add(centralGroup);

  const centralCanvas = createCentralCubeTexture();
  const centralTex = new THREE.CanvasTexture(centralCanvas);
  centralTex.colorSpace = THREE.SRGBColorSpace;

  const centralCubeGeo = new THREE.BoxGeometry(4.4, 4.4, 4.4, 10, 10, 10);
  const glassFaceMat = new THREE.MeshPhysicalMaterial({
    color: 0x112347,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.08,
    metalness: 0.2,
    transmission: 0.72,
    ior: 1.5,
    map: centralTex,
    transparent: true,
    opacity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const centralCube = new THREE.Mesh(centralCubeGeo, glassFaceMat);
  centralGroup.add(centralCube);

  // Internal Quantum Crystal
  const crystalGeo = new THREE.OctahedronGeometry(1.7, 1);
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.8,
    wireframe: true
  });
  const innerCrystal = new THREE.Mesh(crystalGeo, crystalMat);
  centralGroup.add(innerCrystal);

  // Inner Pulsing Core
  const innerCoreGeo = new THREE.SphereGeometry(1.1, 32, 32);
  const innerCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92
  });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  centralGroup.add(innerCore);

  // Electrical edge highlights
  const centralEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.44, 4.44, 4.44)),
    new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.95, linewidth: 2 })
  );
  centralGroup.add(centralEdges);

  // 4. Concentric Tilted Elliptical Orbital Tracks
  const ringsGroup = new THREE.Group();
  systemRoot.add(ringsGroup);
  ringsGroup.rotation.x = Math.PI / 4.2;
  ringsGroup.rotation.y = -Math.PI / 9;

  const ringRadii = [7.2, 9.4, 11.6];
  ringRadii.forEach((r, idx) => {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.72, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(140);
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: idx === 1 ? 0x60a5fa : 0x38bdf8,
      transparent: true,
      opacity: idx === 0 ? 0.45 : idx === 1 ? 0.35 : 0.2
    });
    const ringLine = new THREE.Line(ringGeo, ringMat);
    ringsGroup.add(ringLine);
  });

  // Floating metallic/glass planetary orbs
  const orbCount = 20;
  const orbSpheres = [];
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.8
  });

  for (let i = 0; i < orbCount; i++) {
    const size = Math.random() * 0.16 + 0.08;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), orbMat);
    const angle = (i / orbCount) * Math.PI * 2;
    const rad = 8.0 + (i % 3) * 1.8;
    mesh.userData = { angle, rad, speed: 0.18 + (i % 3) * 0.08 };
    ringsGroup.add(mesh);
    orbSpheres.push(mesh);
  }

  // Swirling Cosmic Stardust Particle Cloud
  const stardustCount = 800;
  const stardustPos = new Float32Array(stardustCount * 3);
  const stardustColors = new Float32Array(stardustCount * 3);
  const stardustOriginalAngles = new Float32Array(stardustCount);
  const stardustRadii = new Float32Array(stardustCount);
  const stardustSpeeds = new Float32Array(stardustCount);

  const cyanC = new THREE.Color(0x38bdf8);
  const purpleC = new THREE.Color(0xa855f7);
  const goldC = new THREE.Color(0xf59e0b);

  for (let i = 0; i < stardustCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 7.5 + 5.0;
    stardustOriginalAngles[i] = angle;
    stardustRadii[i] = r;
    stardustSpeeds[i] = (Math.random() * 0.15 + 0.05) * (Math.random() > 0.5 ? 1 : -1);

    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * (r * 0.72);
    const z = (Math.random() - 0.5) * 3.0;

    stardustPos[i * 3] = x;
    stardustPos[i * 3 + 1] = y;
    stardustPos[i * 3 + 2] = z;

    let c = cyanC;
    const rand = Math.random();
    if (rand > 0.6) c = purpleC;
    else if (rand > 0.3) c = goldC;

    stardustColors[i * 3] = c.r;
    stardustColors[i * 3 + 1] = c.g;
    stardustColors[i * 3 + 2] = c.b;
  }

  const stardustGeo = new THREE.BufferGeometry();
  stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));
  stardustGeo.setAttribute('color', new THREE.BufferAttribute(stardustColors, 3));

  const stardustMat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const stardustPoints = new THREE.Points(stardustGeo, stardustMat);
  ringsGroup.add(stardustPoints);

  // 5. The 7 SaaS Product Cubes (Revolving in calculated orbits)
  const products = [
    {
      id: 'project-management',
      title: 'Project Management',
      desc: 'Organize. Collaborate. Deliver.',
      type: 'check',
      color: '#8b5cf6',
      emissive: 0x7c3aed,
      orbitRadiusX: 6.8,
      orbitRadiusY: 5.2,
      orbitSpeed: 0.13,
      initialAngle: 2.1,
      size: 1.35,
      tiltAxis: [0.3, 0.2, 0.4]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      desc: 'Turn data into insights.',
      type: 'chart',
      color: '#2563eb',
      emissive: 0x1d4ed8,
      orbitRadiusX: 7.2,
      orbitRadiusY: 5.5,
      orbitSpeed: 0.12,
      initialAngle: 0.75,
      size: 1.3,
      tiltAxis: [-0.2, 0.3, 0.2]
    },
    {
      id: 'productivity',
      title: 'Productivity',
      desc: 'Get more done.',
      type: 'cloud',
      color: '#f97316',
      emissive: 0xea580c,
      orbitRadiusX: 6.5,
      orbitRadiusY: 4.8,
      orbitSpeed: 0.15,
      initialAngle: 3.1,
      size: 1.3,
      tiltAxis: [0.2, -0.4, 0.1]
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      desc: 'Work better together.',
      type: 'users',
      color: '#0d9488',
      emissive: 0x0f766e,
      orbitRadiusX: 8.5,
      orbitRadiusY: 6.1,
      orbitSpeed: 0.10,
      initialAngle: 0.2,
      size: 1.3,
      tiltAxis: [0.4, 0.2, -0.3]
    },
    {
      id: 'business-tools',
      title: 'Business Tools',
      desc: 'Simplify operations.',
      type: 'grid',
      color: '#3b82f6',
      emissive: 0x2563eb,
      orbitRadiusX: 8.6,
      orbitRadiusY: 6.0,
      orbitSpeed: 0.09,
      initialAngle: 5.8,
      size: 1.35,
      tiltAxis: [-0.3, -0.3, 0.4]
    },
    {
      id: 'education',
      title: 'Education',
      desc: 'Learn. Grow. Succeed.',
      type: 'education',
      color: '#e11d48',
      emissive: 0xbe123c,
      orbitRadiusX: 7.0,
      orbitRadiusY: 5.0,
      orbitSpeed: 0.14,
      initialAngle: 4.9,
      size: 1.3,
      tiltAxis: [0.2, 0.4, 0.2]
    },
    {
      id: 'and-more',
      title: 'And More',
      desc: 'New products coming soon.',
      type: 'plus',
      color: '#475569',
      emissive: 0x334155,
      orbitRadiusX: 5.8,
      orbitRadiusY: 4.2,
      orbitSpeed: 0.16,
      initialAngle: 4.0,
      size: 1.2,
      tiltAxis: [-0.2, 0.2, -0.4]
    }
  ];

  const productMeshes = [];
  const connectionRibbons = [];

  products.forEach((p) => {
    const pGroup = new THREE.Group();

    const texCanvas = createProductCubeTexture(p.type, p.color);
    const pTex = new THREE.CanvasTexture(texCanvas);
    pTex.colorSpace = THREE.SRGBColorSpace;

    const boxGeo = new THREE.BoxGeometry(p.size, p.size, p.size);
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(p.color),
      emissive: p.emissive,
      emissiveIntensity: 0.55,
      roughness: 0.1,
      metalness: 0.2,
      map: pTex,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const mesh = new THREE.Mesh(boxGeo, boxMat);
    pGroup.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    pGroup.add(edges);

    // Glowing Halo Ring
    const haloGeo = new THREE.RingGeometry(p.size * 0.75, p.size * 0.82, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(p.color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    pGroup.add(halo);

    pGroup.userData = { ...p, mesh, halo };
    ringsGroup.add(pGroup);
    productMeshes.push(pGroup);

    // Dynamic Connection Ribbon
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    );
    const ribbonGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
    const ribbonMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(p.color),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const ribbonLine = new THREE.Line(ribbonGeo, ribbonMat);
    ringsGroup.add(ribbonLine);
    connectionRibbons.push({ line: ribbonLine, pGroup, p });
  });

  // 6. Floating Label Overlays in HTML Screen Space
  const labelsContainer = document.getElementById('scene-labels-container');
  if (labelsContainer) {
    labelsContainer.innerHTML = '';
    products.forEach((p) => {
      const labelDiv = document.createElement('div');
      labelDiv.className = `cube-label label-${p.id}`;
      labelDiv.innerHTML = `
        <div class="cube-label-title">${p.title}</div>
        <div class="cube-label-desc">${p.desc}</div>
      `;
      labelsContainer.appendChild(labelDiv);
      p.labelElement = labelDiv;
    });
  }

  const tempVec = new THREE.Vector3();
  function updateLabels() {
    const widthHalf = container.clientWidth / 2;
    const heightHalf = container.clientHeight / 2;

    productMeshes.forEach((pGroup) => {
      const p = pGroup.userData;
      if (!p.labelElement) return;

      pGroup.getWorldPosition(tempVec);
      tempVec.project(camera);

      if (tempVec.z > 1) {
        p.labelElement.style.opacity = '0';
        return;
      }

      const x = (tempVec.x * widthHalf) + widthHalf;
      const y = -(tempVec.y * heightHalf) + heightHalf;

      p.labelElement.style.opacity = '1';
      p.labelElement.style.transform = `translate(${x + 36}px, ${y - 14}px)`;
    });
  }

  // Click burst on cubes
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(
      productMeshes.map(pm => pm.userData.mesh)
    );

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const parentGroup = hitMesh.parent;
      if (parentGroup && parentGroup.userData.halo) {
        parentGroup.userData.halo.scale.set(2.2, 2.2, 2.2);
        setTimeout(() => {
          parentGroup.userData.halo.scale.set(1.0, 1.0, 1.0);
        }, 400);
      }
    }
  });

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 8. Main Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Central Core rotation
    centralCube.rotation.y = Math.sin(elapsedTime * 0.4) * 0.25;
    centralCube.rotation.x = Math.cos(elapsedTime * 0.3) * 0.15;
    centralEdges.rotation.copy(centralCube.rotation);

    // Inner Quantum Crystal rapid counter-rotation
    innerCrystal.rotation.y = -elapsedTime * 0.6;
    innerCrystal.rotation.z = elapsedTime * 0.4;

    // Glowing core breathing scale
    const pulse = 1.0 + Math.sin(elapsedTime * 2.2) * 0.1;
    innerCore.scale.set(pulse, pulse, pulse);

    // Revolving Product Cubes
    productMeshes.forEach((pGroup, idx) => {
      const p = pGroup.userData;
      const angle = p.initialAngle + elapsedTime * p.orbitSpeed;
      const x = Math.cos(angle) * p.orbitRadiusX;
      const y = Math.sin(angle) * p.orbitRadiusY;
      const z = Math.sin(angle * 2.5) * 0.5;

      pGroup.position.set(x, y, z);

      pGroup.userData.mesh.rotation.y = elapsedTime * 0.8 * p.tiltAxis[0];
      pGroup.userData.mesh.rotation.x = elapsedTime * 0.6 * p.tiltAxis[1];
      pGroup.userData.mesh.rotation.z = Math.sin(elapsedTime + p.initialAngle) * 0.2;
      pGroup.userData.halo.rotation.z = elapsedTime * 1.5;

      // Update dynamic connection ribbon
      const rib = connectionRibbons[idx];
      if (rib) {
        const midX = x * 0.5;
        const midY = y * 0.5 + Math.sin(elapsedTime * 3 + idx) * 0.3;
        const midZ = z * 0.5 + Math.cos(elapsedTime * 2 + idx) * 0.3;

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(midX, midY, midZ),
          new THREE.Vector3(x, y, z)
        );
        rib.line.geometry.setFromPoints(curve.getPoints(20));
        rib.line.geometry.attributes.position.needsUpdate = true;
      }
    });

    // Swirling Stardust Particles Animation
    const posArr = stardustPoints.geometry.attributes.position.array;
    for (let i = 0; i < stardustCount; i++) {
      const angle = stardustOriginalAngles[i] + elapsedTime * stardustSpeeds[i];
      const r = stardustRadii[i];
      posArr[i * 3] = Math.cos(angle) * r;
      posArr[i * 3 + 1] = Math.sin(angle) * (r * 0.72);
      posArr[i * 3 + 2] += Math.sin(elapsedTime * 2 + i) * 0.005;
    }
    stardustPoints.geometry.attributes.position.needsUpdate = true;

    // Orbiting spheres
    orbSpheres.forEach((orb) => {
      orb.userData.angle += orb.userData.speed * 0.02;
      const x = Math.cos(orb.userData.angle) * orb.userData.rad;
      const y = Math.sin(orb.userData.angle) * (orb.userData.rad * 0.72);
      orb.position.set(x, y, 0);
    });

    // Parallax sway
    systemRoot.rotation.y = THREE.MathUtils.lerp(systemRoot.rotation.y, mouseX * 0.18, 0.04);
    systemRoot.rotation.x = THREE.MathUtils.lerp(systemRoot.rotation.x, -mouseY * 0.12, 0.04);

    // Update screen positions of labels
    updateLabels();

    renderer.render(scene, camera);
  }

  animate();
}
