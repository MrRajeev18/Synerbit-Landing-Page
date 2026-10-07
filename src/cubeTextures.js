// Procedural textures for the central cube and satellite product cubes

export function createCentralCubeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background: Deep dark translucent glass base
  ctx.fillStyle = '#060b19';
  ctx.fillRect(0, 0, 1024, 1024);

  // Radial electric glow
  const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 500);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
  grad.addColorStop(0.35, 'rgba(37, 99, 235, 0.6)');
  grad.addColorStop(0.7, 'rgba(14, 16, 32, 0.2)');
  grad.addColorStop(1, 'rgba(5, 7, 15, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw Synerbit "S" icon mark
  ctx.save();
  ctx.translate(512, 512);

  // Soft Outer Glow for S
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 60;

  // Draw modern smooth geometric 'S'
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  
  // Custom high-tech Synerbit "S" ribbon
  const w = 180;
  const h = 260;
  const r = 50;

  // Upper loop
  ctx.roundRect(-w/2, -h/2, w, 70, [r, r, 0, 0]);
  ctx.roundRect(-w/2, -h/2, 70, h/2, [r, 0, 0, 0]);
  ctx.roundRect(-w/2, -20, w, 70, [r, r, r, r]);
  // Lower loop
  ctx.roundRect(w/2 - 70, 0, 70, h/2, [0, 0, r, 0]);
  ctx.roundRect(-w/2, h/2 - 70, w, 70, [0, 0, r, r]);
  ctx.fill();

  ctx.restore();

  // Subtle digital circuit lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
}

export function createProductCubeTexture(type, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Vibrant colored glass background with gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
  bgGrad.addColorStop(0, colorHex);
  bgGrad.addColorStop(1, '#080c14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Radial core glow
  const glow = ctx.createRadialGradient(256, 256, 30, 256, 256, 240);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  glow.addColorStop(0.3, colorHex);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 480);

  // Draw Icon in center
  ctx.save();
  ctx.translate(256, 256);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 24;

  if (type === 'check') {
    // Project Management (Checkmark)
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(-15, 45);
    ctx.lineTo(60, -45);
    ctx.stroke();
  } else if (type === 'chart') {
    // Analytics (Bar Chart)
    ctx.fillRect(-65, 10, 24, 60);
    ctx.fillRect(-15, -25, 24, 95);
    ctx.fillRect(35, -60, 24, 130);
  } else if (type === 'cloud') {
    // Productivity (Cloud)
    ctx.beginPath();
    ctx.arc(-20, 10, 36, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.arc(10, -15, 44, 1.0 * Math.PI, 1.9 * Math.PI);
    ctx.arc(45, 10, 32, 1.5 * Math.PI, 0.4 * Math.PI);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'users') {
    // Team Collaboration (Users)
    // Left User
    ctx.beginPath();
    ctx.arc(-35, -20, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-35, 45, 38, Math.PI, Math.PI * 2);
    ctx.fill();
    // Right User
    ctx.beginPath();
    ctx.arc(35, -20, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(35, 45, 38, Math.PI, Math.PI * 2);
    ctx.fill();
  } else if (type === 'education') {
    // Education (Graduation Cap)
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(75, -15);
    ctx.lineTo(0, 15);
    ctx.lineTo(-75, -15);
    ctx.closePath();
    ctx.fill();
    // Cap base
    ctx.beginPath();
    ctx.arc(0, 5, 40, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // Tassel
    ctx.beginPath();
    ctx.moveTo(70, -15);
    ctx.lineTo(70, 25);
    ctx.stroke();
  } else if (type === 'grid') {
    // Business Tools (4 square grid)
    const s = 42;
    const g = 14;
    ctx.fillRect(-s - g/2, -s - g/2, s, s);
    ctx.fillRect(g/2, -s - g/2, s, s);
    ctx.fillRect(-s - g/2, g/2, s, s);
    ctx.fillRect(g/2, g/2, s, s);
  } else if (type === 'plus') {
    // And More (Plus)
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(0, 60);
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
  }

  ctx.restore();
  return canvas;
}
