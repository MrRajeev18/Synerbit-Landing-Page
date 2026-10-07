import * as THREE from 'three';

export function createBulbScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  container.innerHTML = '';

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    48,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 13);

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

  // Lighting: Balanced daylight & subtle atmosphere rim
  const ambientLight = new THREE.AmbientLight(0x0a1628, 0.9);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
  mainLight.position.set(9, 7, 8);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
  rimLight.position.set(-8, -4, -6);
  scene.add(rimLight);

  const earthCoreLight = new THREE.PointLight(0x38bdf8, 3.5, 18);
  earthCoreLight.position.set(0, 0, 0);
  scene.add(earthCoreLight);

  // System Root Group
  const systemRoot = new THREE.Group();
  scene.add(systemRoot);

  // -------------------------------------------------------------
  // Earth Globe Group (axial tilt ~23.4 degrees)
  // -------------------------------------------------------------
  const earthAxialGroup = new THREE.Group();
  earthAxialGroup.rotation.z = -23.4 * (Math.PI / 180);
  systemRoot.add(earthAxialGroup);

  const earthSpinGroup = new THREE.Group();
  earthAxialGroup.add(earthSpinGroup);

  const earthRadius = 2.45;

  // Procedural Earth Continents & Oceans Texture Map
  function generateEarthTexture() {
    const w = 2048;
    const h = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Deep sapphire ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0.0, '#0c1b33');
    oceanGrad.addColorStop(0.2, '#08172e');
    oceanGrad.addColorStop(0.5, '#051024');
    oceanGrad.addColorStop(0.8, '#08172e');
    oceanGrad.addColorStop(1.0, '#0c1b33');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    function drawLandmass(points, color = '#15325b', strokeColor = '#38bdf8') {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const x = (points[i][0] / 360) * w;
        const y = ((180 - (points[i][1] + 90)) / 180) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // North America
    drawLandmass([
      [20, 160], [45, 165], [75, 162], [115, 140], [120, 125], [105, 115],
      [90, 105], [98, 90], [108, 95], [100, 85], [95, 75], [85, 78],
      [75, 100], [60, 115], [45, 130], [30, 145]
    ], '#1e3a5f', 'rgba(56, 189, 248, 0.45)');

    // South America
    drawLandmass([
      [95, 80], [115, 82], [130, 75], [140, 60], [135, 45], [125, 30],
      [115, 20], [108, 25], [110, 45], [100, 60], [92, 75]
    ], '#1e3a5f', 'rgba(56, 189, 248, 0.45)');

    // Eurasia
    drawLandmass([
      [170, 160], [210, 165], [260, 165], [310, 160], [335, 150], [320, 135],
      [310, 115], [290, 110], [275, 95], [250, 100], [240, 115], [225, 110],
      [215, 120], [195, 115], [180, 125], [170, 140]
    ], '#204068', 'rgba(56, 189, 248, 0.5)');

    // Africa
    drawLandmass([
      [175, 125], [210, 122], [230, 100], [225, 70], [210, 50], [198, 40],
      [190, 55], [175, 70], [165, 95], [170, 115]
    ], '#1c3656', 'rgba(56, 189, 248, 0.45)');

    // India subcontinent & SE Asia
    drawLandmass([
      [245, 115], [260, 112], [265, 98], [255, 88], [248, 98], [242, 108]
    ], '#224874', 'rgba(56, 189, 248, 0.6)');

    // Australia
    drawLandmass([
      [295, 65], [325, 62], [335, 45], [320, 30], [295, 35], [285, 50]
    ], '#1e3c62', 'rgba(56, 189, 248, 0.45)');

    // Antarctica
    drawLandmass([
      [0, 15], [60, 18], [120, 12], [180, 20], [240, 14], [300, 18], [360, 15],
      [360, 0], [0, 0]
    ], '#334e68', 'rgba(186, 230, 253, 0.5)');

    // Night city light sparkles
    ctx.fillStyle = '#fef08a';
    for (let c = 0; c < 220; c++) {
      const cx = (0.15 + Math.random() * 0.75) * w;
      const cy = (0.2 + Math.random() * 0.6) * h;
      ctx.globalAlpha = 0.35 + Math.random() * 0.55;
      ctx.fillRect(cx, cy, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // 1. Earth Core Sphere Mesh
  const earthTexture = generateEarthTexture();
  const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.45,
    metalness: 0.12,
    emissive: 0x031830,
    emissiveIntensity: 0.35
  });
  const earthSphere = new THREE.Mesh(earthGeo, earthMat);
  earthSphere.renderOrder = 4;
  earthSpinGroup.add(earthSphere);

  // 2. Geodetic Latitude & Longitude Wireframe Lines
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22
  });
  const earthWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(earthRadius * 1.002, 32, 24)),
    gridMat
  );
  earthWireframe.renderOrder = 5;
  earthSpinGroup.add(earthWireframe);

  // 3. Dynamic Atmospheric Cloud Swirl Layer
  function generateCloudTexture() {
    const cw = 1024;
    const ch = 512;
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);

    for (let b = 0; b < 45; b++) {
      const bx = Math.random() * cw;
      const by = (0.15 + Math.random() * 0.7) * ch;
      const rw = 40 + Math.random() * 120;
      const rh = 10 + Math.random() * 25;

      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, rw);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.5, 'rgba(224, 242, 254, 0.2)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(bx, by, rw, rh, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  const cloudTex = generateCloudTexture();
  const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.018, 48, 48);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  cloudMesh.renderOrder = 6;
  earthSpinGroup.add(cloudMesh);

  // 4. Luminous Atmospheric Corona Rim (Fresnel Glow)
  const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.08, 48, 48);
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * vec4(vPosition, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float intensity = pow(0.68 - dot(vNormal, viewDir), 2.2);
        gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity * 0.75;
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  const atmoGlow = new THREE.Mesh(atmoGeo, atmoMat);
  atmoGlow.renderOrder = 7;
  earthAxialGroup.add(atmoGlow);

  // Concentric Orbit Track Ring
  const orbitRingGeo = new THREE.RingGeometry(4.35, 4.4, 64);
  const orbitRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.28
  });
  const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
  orbitRing.position.set(0, 0, 0);
  orbitRing.rotation.x = Math.PI / 2.3;
  orbitRing.renderOrder = 2;
  systemRoot.add(orbitRing);

  // 2. Revolving 3D Text Badges: 5 Stages (About, Vision, Mission, Values, Goal)
  function createTextSprite(text, isActive) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 140, [70]);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 50px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    if (isActive) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
    }
    ctx.fillText(text, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 1.0, 1.0);
    sprite.renderOrder = 10;
    return { sprite, canvas, texture };
  }

  const revolvingItems = [
    { id: 0, text: 'About Synerbit', angleOffset: 0 },
    { id: 1, text: 'Vision', angleOffset: (Math.PI * 2) / 5 },
    { id: 2, text: 'Mission', angleOffset: (Math.PI * 4) / 5 },
    { id: 3, text: 'Our Values', angleOffset: (Math.PI * 6) / 5 },
    { id: 4, text: 'Goal', angleOffset: (Math.PI * 8) / 5 }
  ];

  const revolvingTextGroup = new THREE.Group();
  revolvingTextGroup.position.set(0, 0, 0);
  revolvingTextGroup.rotation.x = Math.PI / 2.3;
  systemRoot.add(revolvingTextGroup);

  const orbitRadius = 4.4;

  revolvingItems.forEach((item) => {
    const { sprite, canvas, texture } = createTextSprite(item.text, item.id === 0);
    const nodeAnchor = new THREE.Group();
    nodeAnchor.add(sprite);

    nodeAnchor.position.x = Math.cos(item.angleOffset) * orbitRadius;
    nodeAnchor.position.y = Math.sin(item.angleOffset) * orbitRadius;
    nodeAnchor.position.z = 0;

    revolvingTextGroup.add(nodeAnchor);
    item.sprite = sprite;
    item.nodeAnchor = nodeAnchor;
    item.canvas = canvas;
    item.texture = texture;
  });

  let currentActiveIndex = 0;

  function updateActiveBadge(activeIndex) {
    currentActiveIndex = activeIndex;
    revolvingItems.forEach((item) => {
      const isActive = item.id === activeIndex;
      const ctx = item.canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 160);

      ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isActive ? 6 : 4;
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 140, [70]);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 50px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      if (isActive) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText(item.text, 256, 80);

      item.texture.needsUpdate = true;
    });
  }

  // Orbital Stardust / Satellite Constellation
  const pCount = 280;
  const pPositions = new Float32Array(pCount * 3);
  const pColors = new Float32Array(pCount * 3);
  const colCyan = new THREE.Color(0x38bdf8);
  const colBlue = new THREE.Color(0x60a5fa);

  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = Math.random() * 1.8 + 2.7;

    pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPositions[i * 3 + 2] = r * Math.cos(phi);

    const c = Math.random() > 0.5 ? colCyan : colBlue;
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const orbitalSatellites = new THREE.Points(pGeo, pMat);
  orbitalSatellites.renderOrder = 8;
  earthAxialGroup.add(orbitalSatellites);

  // Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  let targetEarthRotationY = 0;
  let targetOrbitAngle = 0;

  function updateScrollProgress(progress) {
    targetEarthRotationY = progress * Math.PI * 4;
    targetOrbitAngle = -progress * Math.PI * 2;
  }

  const clock = new THREE.Clock();
  const badgeWorldPos = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Constant planetary rotation + scroll reaction
    earthSpinGroup.rotation.y = THREE.MathUtils.lerp(
      earthSpinGroup.rotation.y,
      targetEarthRotationY + (elapsed * 0.12),
      0.08
    );

    // Atmospheric cloud drift (clouds rotate slightly faster than continents)
    cloudMesh.rotation.y = elapsed * 0.04;

    // Badges orbiting Earth along tilted equatorial plane
    revolvingTextGroup.rotation.z = THREE.MathUtils.lerp(
      revolvingTextGroup.rotation.z,
      targetOrbitAngle + (elapsed * 0.05),
      0.08
    );

    // Orbital satellite constellation drift
    orbitalSatellites.rotation.y = elapsed * 0.02;

    // Dynamically calculate badge depth and manage 3D occlusion behind the Earth globe
    revolvingItems.forEach((item) => {
      item.nodeAnchor.getWorldPosition(badgeWorldPos);
      const isBehind = badgeWorldPos.z < 0;
      const isActive = item.id === currentActiveIndex;

      if (isBehind) {
        // Badges on the back half of the orbit pass behind the 3D Earth
        item.sprite.renderOrder = 1;
        const scaleX = isActive ? 3.3 : 2.7;
        const scaleY = isActive ? 1.05 : 0.85;
        item.sprite.scale.set(scaleX, scaleY, 1.0);
        item.sprite.material.opacity = isActive ? 0.6 : 0.35;
      } else {
        // Badges on the front half pass in front of Earth
        item.sprite.renderOrder = 10;
        const scaleX = isActive ? 3.6 : 3.0;
        const scaleY = isActive ? 1.15 : 0.95;
        item.sprite.scale.set(scaleX, scaleY, 1.0);
        item.sprite.material.opacity = isActive ? 1.0 : 0.85;
      }
    });

    earthCoreLight.intensity = 3.5 + Math.sin(elapsed * 2.5) * 0.8;

    renderer.render(scene, camera);
  }

  animate();

  return {
    updateScrollProgress,
    setActiveStage: (stageIndex) => {
      updateActiveBadge(stageIndex);
    }
  };
}
