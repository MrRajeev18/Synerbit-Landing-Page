import * as THREE from 'three';

export function createProductMobileScene(containerId) {
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
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(8, 12, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -9;
  keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  rimLight.position.set(-10, -6, -8);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0x818cf8, 1.4, 20);
  fillLight.position.set(0, -4, 6);
  scene.add(fillLight);

  // Root Phone Pivot Group
  const phoneRoot = new THREE.Group();
  scene.add(phoneRoot);

  const phoneBodyGroup = new THREE.Group();
  phoneRoot.add(phoneBodyGroup);

  // 1. Phone Dimensions
  const phoneW = 3.5;
  const phoneH = 7.1;
  const phoneD = 0.38;
  const cornerR = 0.52;

  // Helper: Rounded Rectangle Shape
  function createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  // Helper: Rounded Shape Geometry with normalized UV coordinates [0..1]
  function createRoundedShapeGeometry(w, h, r, curveSegments = 24) {
    const shape = createRoundedRectShape(w, h, r);
    const geo = new THREE.ShapeGeometry(shape, curveSegments);
    const pos = geo.attributes.position;
    const uvs = [];
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + w / 2) / w;
      const v = (pos.getY(i) + h / 2) / h;
      uvs.push(u, v);
    }
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
  }

  // 2. Titanium Frame / Chassis
  const chassisShape = createRoundedRectShape(phoneW, phoneH, cornerR);
  const extrudeSettings = {
    depth: phoneD,
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04
  };
  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
  chassisGeo.center();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.92,
    roughness: 0.22
  });
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  phoneBodyGroup.add(chassisMesh);

  // 3. Side Buttons (Power, Volume)
  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.2
  });
  // Power Button (Right)
  const powerGeo = new THREE.BoxGeometry(0.06, 0.9, 0.12);
  const powerBtn = new THREE.Mesh(powerGeo, buttonMat);
  powerBtn.position.set(phoneW / 2 + 0.05, 0.8, 0);
  phoneBodyGroup.add(powerBtn);

  // Volume Buttons (Left)
  const volUpGeo = new THREE.BoxGeometry(0.06, 0.65, 0.12);
  const volUpBtn = new THREE.Mesh(volUpGeo, buttonMat);
  volUpBtn.position.set(-phoneW / 2 - 0.05, 1.2, 0);
  phoneBodyGroup.add(volUpBtn);

  const volDownGeo = new THREE.BoxGeometry(0.06, 0.65, 0.12);
  const volDownBtn = new THREE.Mesh(volDownGeo, buttonMat);
  volDownBtn.position.set(-phoneW / 2 - 0.05, 0.35, 0);
  phoneBodyGroup.add(volDownBtn);

  // 4. Back Panel & Camera Bump
  const backPanelMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.35,
    metalness: 0.25,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15
  });
  const backGeo = createRoundedShapeGeometry(phoneW - 0.08, phoneH - 0.08, cornerR - 0.03);
  const backPanel = new THREE.Mesh(backGeo, backPanelMat);
  backPanel.position.set(0, 0, -phoneD / 2 - 0.042);
  backPanel.rotation.y = Math.PI;
  phoneBodyGroup.add(backPanel);

  // Camera Bump Island (Rounded Plateau at Top-Left of Back)
  const bumpShape = createRoundedRectShape(1.45, 1.55, 0.25);
  const bumpGeo = new THREE.ExtrudeGeometry(bumpShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.02,
    bevelThickness: 0.02
  });
  bumpGeo.center();
  const bumpMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.8
  });
  const cameraBump = new THREE.Mesh(bumpGeo, bumpMat);
  cameraBump.position.set(-0.75, 2.05, -phoneD / 2 - 0.1);
  phoneBodyGroup.add(cameraBump);

  // 3 Camera Lenses with Metallic Outer Rings
  const lensRingMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.15
  });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x030712,
    metalness: 0.9,
    roughness: 0.05,
    transmission: 0.6,
    ior: 1.6
  });

  const lensPositions = [
    [-1.08, 2.45],
    [-1.08, 1.65],
    [-0.42, 2.05]
  ];

  lensPositions.forEach(([lx, ly]) => {
    const ringGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.07, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, lensRingMat);
    ring.position.set(lx, ly, -phoneD / 2 - 0.17);
    phoneBodyGroup.add(ring);

    const glassGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 32);
    glassGeo.rotateX(Math.PI / 2);
    const glass = new THREE.Mesh(glassGeo, lensGlassMat);
    glass.position.set(lx, ly, -phoneD / 2 - 0.175);
    phoneBodyGroup.add(glass);
  });

  // Flash & LiDAR on back
  const flashGeo = new THREE.CircleGeometry(0.1, 24);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.set(-0.42, 2.52, -phoneD / 2 - 0.165);
  flash.rotation.y = Math.PI;
  phoneBodyGroup.add(flash);

  const lidarGeo = new THREE.CircleGeometry(0.07, 24);
  const lidarMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const lidar = new THREE.Mesh(lidarGeo, lidarMat);
  lidar.position.set(-0.42, 1.58, -phoneD / 2 - 0.165);
  lidar.rotation.y = Math.PI;
  phoneBodyGroup.add(lidar);

  // Subtle Laser-Etched Synerbit Logo on Back Center
  const backLogoCanvas = document.createElement('canvas');
  backLogoCanvas.width = 256;
  backLogoCanvas.height = 256;
  const bCtx = backLogoCanvas.getContext('2d');
  bCtx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  bCtx.beginPath();
  bCtx.arc(128, 128, 48, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.font = 'bold 28px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  bCtx.fillText('S', 128, 128);

  const backLogoTexture = new THREE.CanvasTexture(backLogoCanvas);
  const backLogoMat = new THREE.MeshBasicMaterial({
    map: backLogoTexture,
    transparent: true,
    opacity: 0.65
  });
  const backLogoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), backLogoMat);
  backLogoMesh.position.set(0, 0, -phoneD / 2 - 0.045);
  backLogoMesh.rotation.y = Math.PI;
  phoneBodyGroup.add(backLogoMesh);

  // 5. Dynamic Screen Canvas (1024 x 2048)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 2048;
  const sCtx = screenCanvas.getContext('2d');
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
    transparent: true
  });
  const screenW = phoneW - 0.22;
  const screenH = phoneH - 0.22;
  const screenR = cornerR - 0.06;
  const screenGeo = createRoundedShapeGeometry(screenW, screenH, screenR);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0, phoneD / 2 + 0.042);
  phoneBodyGroup.add(screenMesh);

  // Front Glass Glare Overlay
  const frontGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });
  const frontGlassMesh = new THREE.Mesh(screenGeo, frontGlassMat);
  frontGlassMesh.position.set(0, 0, phoneD / 2 + 0.045);
  phoneBodyGroup.add(frontGlassMesh);

  // Enable shadow casting on all solid phone body meshes
  phoneBodyGroup.traverse((child) => {
    if (child.isMesh && child !== frontGlassMesh) {
      child.castShadow = true;
    }
  });

  // ----------------------------------------------------
  // Dynamic 3D Floor Shadows (Directional + Contact AO + Color Aura)
  // ----------------------------------------------------
  function createRadialShadowTexture(stops) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    stops.forEach(([pos, color]) => grad.addColorStop(pos, color));

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // 1. Directional Shadow Receiver Plane
  const shadowGroundGeo = new THREE.PlaneGeometry(36, 20);
  const shadowGroundMat = new THREE.ShadowMaterial({ opacity: 0.42 });
  const shadowGroundMesh = new THREE.Mesh(shadowGroundGeo, shadowGroundMat);
  shadowGroundMesh.rotation.x = -Math.PI / 2;
  shadowGroundMesh.position.set(0, -4.14, 0);
  shadowGroundMesh.receiveShadow = true;
  scene.add(shadowGroundMesh);

  // 2. Mobile Floor Shadow Tracking Group (moves along X smoothly with phone)
  const shadowGroup = new THREE.Group();
  shadowGroup.position.set(3.6, -4.12, 0);
  scene.add(shadowGroup);

  // A. Core Contact Shadow (dense grounding beneath phone base)
  const coreShadowTex = createRadialShadowTexture([
    [0, 'rgba(0, 0, 0, 0.96)'],
    [0.22, 'rgba(0, 0, 0, 0.88)'],
    [0.52, 'rgba(0, 0, 0, 0.48)'],
    [0.80, 'rgba(0, 0, 0, 0.12)'],
    [1, 'rgba(0, 0, 0, 0)']
  ]);
  const coreMat = new THREE.MeshBasicMaterial({
    map: coreShadowTex,
    transparent: true,
    opacity: 0.80,
    depthWrite: false
  });
  const coreMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), coreMat);
  coreMesh.rotation.x = -Math.PI / 2;
  coreMesh.position.y = 0.02;
  shadowGroup.add(coreMesh);

  // B. Soft Ambient Drop Shadow (feathers smoothly outward)
  const softShadowTex = createRadialShadowTexture([
    [0, 'rgba(0, 0, 0, 0.72)'],
    [0.30, 'rgba(0, 0, 0, 0.44)'],
    [0.60, 'rgba(0, 0, 0, 0.18)'],
    [0.86, 'rgba(0, 0, 0, 0.04)'],
    [1, 'rgba(0, 0, 0, 0)']
  ]);
  const softMat = new THREE.MeshBasicMaterial({
    map: softShadowTex,
    transparent: true,
    opacity: 0.64,
    depthWrite: false
  });
  const softMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.8), softMat);
  softMesh.rotation.x = -Math.PI / 2;
  softMesh.position.y = 0.01;
  shadowGroup.add(softMesh);

  // C. Ambient Floor Color Bounce (product theme glow reflection)
  const auraTex = createRadialShadowTexture([
    [0, 'rgba(255, 255, 255, 0.88)'],
    [0.22, 'rgba(255, 255, 255, 0.50)'],
    [0.55, 'rgba(255, 255, 255, 0.18)'],
    [0.80, 'rgba(255, 255, 255, 0.03)'],
    [1, 'rgba(255, 255, 255, 0)']
  ]);
  const auraMat = new THREE.MeshBasicMaterial({
    map: auraTex,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const auraMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3.4), auraMat);
  auraMesh.rotation.x = -Math.PI / 2;
  auraMesh.position.y = 0.005;
  shadowGroup.add(auraMesh);

  // Screen Rendering Logic for each Product
  function renderScreenUI(productIndex) {
    if (auraMat) {
      const auraColors = [0x38bdf8, 0x10b981, 0xf59e0b];
      auraMat.color.setHex(auraColors[productIndex] || 0x38bdf8);
    }

    sCtx.clearRect(0, 0, 1024, 2048);
    sCtx.save();

    // Clip to matching rounded screen radius in 2D canvas
    const r = 140;
    sCtx.beginPath();
    sCtx.moveTo(r, 0);
    sCtx.lineTo(1024 - r, 0);
    sCtx.quadraticCurveTo(1024, 0, 1024, r);
    sCtx.lineTo(1024, 2048 - r);
    sCtx.quadraticCurveTo(1024, 2048, 1024 - r, 2048);
    sCtx.lineTo(r, 2048);
    sCtx.quadraticCurveTo(0, 2048, 0, 2048 - r);
    sCtx.lineTo(0, r);
    sCtx.quadraticCurveTo(0, 0, r, 0);
    sCtx.closePath();
    sCtx.clip();

    if (productIndex === 0) {
      // PULSEPM (Electric Cyan / Royal Blue Theme)
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 2048);
      bgGrad.addColorStop(0, '#070d19');
      bgGrad.addColorStop(0.5, '#0b1528');
      bgGrad.addColorStop(1, '#050912');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 2048);

      const glow1 = sCtx.createRadialGradient(250, 450, 10, 250, 450, 380);
      glow1.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      glow1.addColorStop(1, 'transparent');
      sCtx.fillStyle = glow1;
      sCtx.fillRect(0, 0, 1024, 1000);

      renderStatusBar(sCtx);
      renderDynamicIsland(sCtx, 'PulsePM • Sprint #4');

      sCtx.fillStyle = '#94a3b8';
      sCtx.font = '600 32px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'left';
      sCtx.fillText('PROJECT WORKSPACE', 80, 260);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 74px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('PulsePM', 80, 345);

      drawRoundedRect(sCtx, 80, 410, 864, 380, 36, 'rgba(15, 23, 42, 0.85)', 'rgba(56, 189, 248, 0.3)', 3);

      sCtx.fillStyle = '#38bdf8';
      sCtx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('CORE ECOSYSTEM', 120, 475);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 50px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Synerbit SaaS Suite v2.0', 120, 545);

      sCtx.fillStyle = '#94a3b8';
      sCtx.font = '500 32px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('28 of 34 Tasks Completed', 120, 605);

      drawRoundedRect(sCtx, 120, 645, 784, 22, 11, 'rgba(255, 255, 255, 0.1)');
      const pGrad = sCtx.createLinearGradient(120, 0, 904, 0);
      pGrad.addColorStop(0, '#38bdf8');
      pGrad.addColorStop(1, '#6366f1');
      drawRoundedRect(sCtx, 120, 645, 640, 22, 11, pGrad);

      sCtx.fillStyle = '#38bdf8';
      sCtx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'right';
      sCtx.fillText('82%', 904, 715);
      sCtx.textAlign = 'left';

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 44px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Sprint Backlog', 80, 860);

      const tasks = [
        { title: 'Three.js 3D Viewport Optimization', tag: 'IN PROGRESS', color: '#38bdf8', team: 'Design & Core' },
        { title: 'Global SaaS State Architecture', tag: 'REVIEW', color: '#a855f7', team: 'Backend' },
        { title: 'Real-time WebSocket Sync Engine', tag: 'DONE', color: '#10b981', team: 'Engine' },
        { title: 'Cross-platform Mobile Interface', tag: 'QUEUED', color: '#f59e0b', team: 'Mobile' }
      ];

      tasks.forEach((t, i) => {
        const ty = 910 + i * 190;
        drawRoundedRect(sCtx, 80, ty, 864, 160, 28, 'rgba(15, 23, 42, 0.7)', 'rgba(255, 255, 255, 0.1)', 2);

        sCtx.strokeStyle = t.color;
        sCtx.lineWidth = 4;
        sCtx.strokeRect(120, ty + 50, 40, 40);

        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 36px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(t.title, 190, ty + 78);

        sCtx.fillStyle = '#64748b';
        sCtx.font = '500 28px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(t.team, 190, ty + 124);

        drawRoundedRect(sCtx, 730, ty + 46, 175, 48, 24, `${t.color}25`, t.color, 2);
        sCtx.fillStyle = t.color;
        sCtx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText(t.tag, 817, ty + 78);
        sCtx.textAlign = 'left';
      });

      renderBottomNav(sCtx, 0, '#38bdf8');

    } else if (productIndex === 1) {
      // GOALSYNC (Emerald & Neon Mint Theme)
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 2048);
      bgGrad.addColorStop(0, '#04150d');
      bgGrad.addColorStop(0.5, '#071f14');
      bgGrad.addColorStop(1, '#020d08');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 2048);

      const glow1 = sCtx.createRadialGradient(250, 450, 10, 250, 450, 380);
      glow1.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      glow1.addColorStop(1, 'transparent');
      sCtx.fillStyle = glow1;
      sCtx.fillRect(0, 0, 1024, 1000);

      renderStatusBar(sCtx);
      renderDynamicIsland(sCtx, 'GoalSync • Streak 🔥 14d');

      sCtx.fillStyle = '#6ee7b7';
      sCtx.font = '600 32px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'left';
      sCtx.fillText('SHARED ACCOUNTABILITY', 80, 260);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 74px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('GoalSync', 80, 345);

      drawRoundedRect(sCtx, 80, 410, 864, 400, 36, 'rgba(6, 30, 20, 0.85)', 'rgba(16, 185, 129, 0.35)', 3);

      const cx = 250;
      const cy = 610;
      const rad = 110;
      sCtx.beginPath();
      sCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      sCtx.lineWidth = 20;
      sCtx.stroke();

      sCtx.beginPath();
      sCtx.arc(cx, cy, rad, -Math.PI / 2, Math.PI * 0.95);
      sCtx.strokeStyle = '#10b981';
      sCtx.lineWidth = 20;
      sCtx.lineCap = 'round';
      sCtx.stroke();

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 52px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'center';
      sCtx.fillText('78%', cx, cy + 18);

      sCtx.textAlign = 'left';
      sCtx.fillStyle = '#10b981';
      sCtx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('COMMUNITY CHALLENGE', 420, 520);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 44px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Morning 5K Sprint', 420, 580);

      sCtx.fillStyle = '#a7f3d0';
      sCtx.font = '500 30px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('4 of 5 friends synced', 420, 640);

      sCtx.fillStyle = '#34d399';
      sCtx.font = '600 28px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('🔥 14-day team streak active', 420, 710);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 44px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Friends Leaderboard', 80, 880);

      const friends = [
        { rank: '1', name: 'Alex Rivera', stat: '42.5 km', badge: '🥇 Leader', color: '#fbbf24' },
        { rank: '2', name: 'You (Sarah)', stat: '39.0 km', badge: '🥈 +4.2%', color: '#34d399' },
        { rank: '3', name: 'David Kim', stat: '35.8 km', badge: '🥉 Consistent', color: '#94a3b8' },
        { rank: '4', name: 'Elena Rostov', stat: '31.2 km', badge: '🔥 Streak', color: '#f87171' }
      ];

      friends.forEach((f, i) => {
        const fy = 930 + i * 180;
        drawRoundedRect(sCtx, 80, fy, 864, 150, 26, 'rgba(6, 30, 20, 0.7)', 'rgba(255, 255, 255, 0.08)', 2);

        sCtx.fillStyle = f.color;
        sCtx.font = 'bold 40px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(f.rank, 125, fy + 88);

        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 36px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(f.name, 190, fy + 72);

        sCtx.fillStyle = '#6ee7b7';
        sCtx.font = '500 28px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(f.stat, 190, fy + 118);

        drawRoundedRect(sCtx, 700, fy + 48, 205, 48, 24, `${f.color}22`, f.color, 2);
        sCtx.fillStyle = f.color;
        sCtx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText(f.badge, 802, fy + 80);
        sCtx.textAlign = 'left';
      });

      renderBottomNav(sCtx, 1, '#10b981');

    } else {
      // BUSLY (Amber & Solar Gold Theme)
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 2048);
      bgGrad.addColorStop(0, '#1a1005');
      bgGrad.addColorStop(0.5, '#221508');
      bgGrad.addColorStop(1, '#0e0802');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 2048);

      const glow1 = sCtx.createRadialGradient(250, 450, 10, 250, 450, 380);
      glow1.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
      glow1.addColorStop(1, 'transparent');
      sCtx.fillStyle = glow1;
      sCtx.fillRect(0, 0, 1024, 1000);

      renderStatusBar(sCtx);
      renderDynamicIsland(sCtx, 'Busly • Live Route #12');

      sCtx.fillStyle = '#fde68a';
      sCtx.font = '600 32px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'left';
      sCtx.fillText('SMART SCHOOL TRANSPORT', 80, 260);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 74px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Busly', 80, 345);

      drawRoundedRect(sCtx, 80, 410, 864, 420, 36, 'rgba(34, 21, 8, 0.85)', 'rgba(245, 158, 11, 0.35)', 3);

      sCtx.fillStyle = '#f59e0b';
      sCtx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('LIVE TRANSIT TRACKER', 120, 475);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 50px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('School Bus #12 (North Campus)', 120, 545);

      sCtx.fillStyle = '#fef08a';
      sCtx.font = '500 32px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Driver: Michael Chang • On Time', 120, 605);

      drawRoundedRect(sCtx, 120, 665, 784, 16, 8, 'rgba(255, 255, 255, 0.15)');
      drawRoundedRect(sCtx, 120, 665, 540, 16, 8, '#f59e0b');

      sCtx.beginPath();
      sCtx.arc(660, 673, 24, 0, Math.PI * 2);
      sCtx.fillStyle = '#f59e0b';
      sCtx.fill();
      sCtx.strokeStyle = '#ffffff';
      sCtx.lineWidth = 4;
      sCtx.stroke();

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 36px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('ETA: 7:42 AM', 120, 760);

      sCtx.fillStyle = '#f59e0b';
      sCtx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
      sCtx.textAlign = 'right';
      sCtx.fillText('4 Stops Remaining', 904, 760);
      sCtx.textAlign = 'left';

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 44px Plus Jakarta Sans, sans-serif';
      sCtx.fillText('Today’s Scheduled Stops', 80, 900);

      const stops = [
        { time: '7:20 AM', stop: 'Pinecrest Valley Gate', status: 'DEPARTED', col: '#10b981' },
        { time: '7:32 AM', stop: 'Oakwood Square & 5th', status: 'DEPARTED', col: '#10b981' },
        { time: '7:42 AM', stop: 'Your Child: Maple Heights', status: 'APPROACHING', col: '#f59e0b' },
        { time: '8:05 AM', stop: 'St. Jude Academy Main Entrance', status: 'DESTINATION', col: '#38bdf8' }
      ];

      stops.forEach((st, i) => {
        const sy = 950 + i * 175;
        drawRoundedRect(sCtx, 80, sy, 864, 145, 26, 'rgba(34, 21, 8, 0.7)', 'rgba(255, 255, 255, 0.08)', 2);

        sCtx.fillStyle = '#fde68a';
        sCtx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(st.time, 120, sy + 65);

        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 34px Plus Jakarta Sans, sans-serif';
        sCtx.fillText(st.stop, 120, sy + 112);

        drawRoundedRect(sCtx, 680, sy + 44, 225, 48, 24, `${st.col}25`, st.col, 2);
        sCtx.fillStyle = st.col;
        sCtx.font = 'bold 20px Plus Jakarta Sans, sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText(st.status, 792, sy + 76);
        sCtx.textAlign = 'left';
      });

      renderBottomNav(sCtx, 2, '#f59e0b');
    }

    sCtx.restore();
    screenTexture.needsUpdate = true;
  }

  function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke = null, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function renderStatusBar(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', 100, 85);

    ctx.textAlign = 'right';
    ctx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
    ctx.fillText('5G  100%', 920, 85);
    ctx.textAlign = 'left';
  }

  function renderDynamicIsland(ctx, label) {
    drawRoundedRect(ctx, 332, 45, 360, 68, 34, '#000000', 'rgba(255, 255, 255, 0.15)', 2);
    ctx.beginPath();
    ctx.arc(370, 79, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(660, 79, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 515, 87);
    ctx.textAlign = 'left';
  }

  function renderBottomNav(ctx, activeTab, accentColor) {
    drawRoundedRect(ctx, 60, 1880, 904, 110, 55, 'rgba(15, 23, 42, 0.92)', 'rgba(255, 255, 255, 0.15)', 2);
    const tabs = ['Home', 'Activity', 'Analytics', 'Settings'];
    tabs.forEach((tab, i) => {
      const tx = 175 + i * 225;
      const isActive = i === 0;
      ctx.fillStyle = isActive ? accentColor : 'rgba(255, 255, 255, 0.4)';
      ctx.font = isActive ? 'bold 30px Plus Jakarta Sans, sans-serif' : '500 28px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tab, tx, 1946);
    });
    ctx.textAlign = 'left';
  }

  let currentProductIndex = 0;
  renderScreenUI(0);

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  let targetPosX = 3.6;
  let targetRotY = -0.22;
  let targetRotX = 0.05;
  let targetRotZ = -0.02;

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function updateScrollProgress(progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (clampedProgress < 0.28) {
      // Stage 1: PulsePM (Stationed on the Right side)
      targetPosX = 3.6;
      targetRotY = -0.22;
      targetRotX = 0.06;
      targetRotZ = -0.02;
      if (currentProductIndex !== 0) {
        currentProductIndex = 0;
        renderScreenUI(0);
      }
    } else if (clampedProgress < 0.52) {
      // Transition Stage 1 -> 2: Moves Right to Left & Flips 360° (front-back-front)
      const t = (clampedProgress - 0.28) / 0.24;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      targetPosX = 3.6 - 7.2 * ease;
      targetRotY = -0.22 + (Math.PI * 2 + 0.44) * ease;
      targetRotX = 0.06 + Math.sin(t * Math.PI) * 0.18;
      targetRotZ = -0.02 + 0.04 * ease + Math.sin(t * Math.PI) * 0.08;

      // Switch screen UI mid-spin when back is turned toward camera
      const targetScreen = t >= 0.5 ? 1 : 0;
      if (currentProductIndex !== targetScreen) {
        currentProductIndex = targetScreen;
        renderScreenUI(currentProductIndex);
      }
    } else if (clampedProgress < 0.72) {
      // Stage 2: GoalSync (Stationed on the Left side)
      targetPosX = -3.6;
      targetRotY = Math.PI * 2 + 0.22; // Continues smoothly from end of transition
      targetRotX = 0.06;
      targetRotZ = 0.02;
      if (currentProductIndex !== 1) {
        currentProductIndex = 1;
        renderScreenUI(1);
      }
    } else if (clampedProgress < 0.96) {
      // Transition Stage 2 -> 3: Moves Left to Right & Flips 360° (front-back-front)
      const t = (clampedProgress - 0.72) / 0.24;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      targetPosX = -3.6 + 7.2 * ease;
      targetRotY = (Math.PI * 2 + 0.22) - (Math.PI * 2 + 0.44) * ease;
      targetRotX = 0.06 + Math.sin(t * Math.PI) * 0.18;
      targetRotZ = 0.02 - 0.04 * ease - Math.sin(t * Math.PI) * 0.08;

      // Switch screen UI mid-spin when back is turned toward camera
      const targetScreen = t >= 0.5 ? 2 : 1;
      if (currentProductIndex !== targetScreen) {
        currentProductIndex = targetScreen;
        renderScreenUI(currentProductIndex);
      }
    } else {
      // Stage 3: Busly (Stationed on the Right side)
      targetPosX = 3.6;
      targetRotY = -0.22;
      targetRotX = 0.06;
      targetRotZ = -0.02;
      if (currentProductIndex !== 2) {
        currentProductIndex = 2;
        renderScreenUI(2);
      }
    }
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const floatY = Math.sin(elapsed * 1.8) * 0.12;
    const floatRotZ = Math.sin(elapsed * 1.4) * 0.02;

    phoneRoot.position.x = THREE.MathUtils.lerp(phoneRoot.position.x, targetPosX, 0.16);
    phoneRoot.position.y = THREE.MathUtils.lerp(phoneRoot.position.y, floatY, 0.16);

    const mouseTiltX = mouseY * 0.12;
    const mouseTiltY = mouseX * 0.20;

    phoneBodyGroup.rotation.x = THREE.MathUtils.lerp(phoneBodyGroup.rotation.x, targetRotX + mouseTiltX, 0.16);
    phoneBodyGroup.rotation.y = THREE.MathUtils.lerp(phoneBodyGroup.rotation.y, targetRotY + mouseTiltY, 0.16);
    phoneBodyGroup.rotation.z = THREE.MathUtils.lerp(phoneBodyGroup.rotation.z, targetRotZ + floatRotZ, 0.16);

    // Dynamic Shadow Synchronization on Ground Floor
    if (shadowGroup) {
      shadowGroup.position.x = phoneRoot.position.x;

      // Adapt shadow footprint width as phone rotates in 3D
      const cosY = Math.abs(Math.cos(phoneBodyGroup.rotation.y));
      const sinY = Math.abs(Math.sin(phoneBodyGroup.rotation.y));
      const rotFootprintX = 0.55 + cosY * 0.45 + sinY * 0.18;

      // Breathing shadow scaling as phone floats up and down
      const elevOffset = (phoneRoot.position.y + 0.12);
      const expScale = 1.0 + elevOffset * 0.35;

      shadowGroup.scale.x = rotFootprintX * expScale;
      shadowGroup.scale.z = expScale;

      coreMat.opacity = Math.max(0.45, Math.min(0.85, 0.80 - elevOffset * 0.4));
      softMat.opacity = Math.max(0.35, Math.min(0.70, 0.64 - elevOffset * 0.35));
    }

    renderer.render(scene, camera);
  }

  animate();

  return {
    updateScrollProgress,
    setProductIndex: (index) => {
      currentProductIndex = index;
      renderScreenUI(index);
      if (index === 0) {
        targetPosX = 3.6;
        targetRotY = -0.22;
      } else if (index === 1) {
        targetPosX = -3.6;
        targetRotY = Math.PI * 2 + 0.22;
      } else {
        targetPosX = 3.6;
        targetRotY = -0.22;
      }
    }
  };
}
