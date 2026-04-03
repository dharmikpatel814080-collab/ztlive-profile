/* ═══════════════════════════════════════════════════════════════════
   TuZhi Deco — flower-wreath
   FIXED: No regeneration, same flowers every reload
   Better animation, smaller size, balanced colors
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('decoCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = 160, H = 160, CX = 80, CY = 80;

  // ═════════════════════════════════════════════════════════════════
  // FIXED CONFIGURATION - Never changes on reload
  // ═════════════════════════════════════════════════════════════════
  const RADIUS = 54;
  const FLOWER_COUNT = 18;        // Fixed count - not random
  const PARTICLE_COUNT = 12;      // Fixed particles

  // FIXED SEED for consistent randomness
  const SEED = 12345;
  let seedCounter = SEED;
  function seededRandom() {
    const x = Math.sin(seedCounter++) * 10000;
    return x - Math.floor(x);
  }

  // Colors - Balanced (less pink)
  const COLORS = {
    pinkDeep:   '#e84a7d', pinkMedium: '#f06595', pinkLight: '#faa2c1',
    purpleDeep: '#7c3aed', purpleMedium: '#8b5cf6', purpleLight: '#a78bfa', purplePale: '#c4b5fd',
    blueDeep:   '#2563eb', blueMedium: '#3b82f6', blueLight: '#60a5fa', bluePale: '#93c5fd',
    lavender:   '#d8b4fe', lavenderLight: '#e9d5ff',
    cyan:       '#06b6d4', cyanLight: '#67e8f9',
    yellow:     '#fbbf24', yellowLight: '#fcd34d',
    white:      '#f8fafc'
  };

  // ═════════════════════════════════════════════════════════════════
  // FIXED FLOWER DATA - Predefined, never changes
  // ═════════════════════════════════════════════════════════════════

  const FIXED_FLOWERS = [
    // Format: [angle (0-1), radiusOffset, type, size, colorKey, layer]
    // Type: 0=cherry, 1=violet, 2=forget, 3=star, 4=diamond
    // Layer: 0=back, 1=middle, 2=front

    // Back layer - smaller, darker
    [0.0,   -4,  2,  7,  'blue',     0],
    [0.08,   6,  3,  5,  'lavender', 0],
    [0.18,  -2,  1,  8,  'purple',   0],
    [0.28,   4,  2,  6,  'blue',     0],
    [0.38,  -6,  3,  5,  'cyan',     0],
    [0.48,   2,  1,  7,  'purple',   0],
    [0.58,  -4,  2,  6,  'blue',     0],
    [0.68,   5,  3,  5,  'lavender', 0],
    [0.78,  -3,  1,  8,  'purple',   0],
    [0.88,   4,  2,  6,  'blue',     0],
    [0.95,  -5,  3,  5,  'cyan',     0],

    // Front layer - bigger, prominent (only 7 flowers)
    [0.05,   2,  0,  11, 'pink',     2],
    [0.22,  -3,  4,  9,  'purple',   2],
    [0.35,   4,  0,  10, 'pink',     2],
    [0.52,  -2,  4,  9,  'blue',     2],
    [0.65,   3,  0,  11, 'pink',     2],
    [0.82,  -4,  4,  9,  'purple',   2],
    [0.92,   2,  0,  10, 'pink',     2]
  ];

  // FIXED PARTICLES
  const FIXED_PARTICLES = [
    [0.2,  0.3,  3, 'lavender'],
    [0.5,  0.5,  2, 'blue'],
    [0.8,  0.4,  3, 'purple'],
    [0.1,  0.6,  2, 'cyan'],
    [0.4,  0.2,  3, 'lavender'],
    [0.7,  0.7,  2, 'blue'],
    [0.3,  0.8,  3, 'purple'],
    [0.9,  0.3,  2, 'cyan'],
    [0.15, 0.5,  3, 'lavender'],
    [0.6,  0.2,  2, 'blue'],
    [0.85, 0.6,  3, 'purple'],
    [0.45, 0.9,  2, 'cyan']
  ];

  // ═════════════════════════════════════════════════════════════════
  // FLOWER RENDERERS
  // ═════════════════════════════════════════════════════════════════

  function drawCherry(ctx, x, y, size, rot, color, windX, windY, breathe, time) {
    ctx.save();
    ctx.translate(x + windX, y + windY);
    ctx.rotate(rot);
    const s = size * breathe;

    // Glow behind
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    // 5 petals with MORE movement
    for(let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petalSway = Math.sin(time * 0.05 + i * 1.2) * 0.15; // More animation

      ctx.save();
      ctx.rotate(angle + petalSway);

      const grad = ctx.createRadialGradient(0, -s*0.4, 0, 0, -s*0.6, s);
      grad.addColorStop(0, color + 'ff');
      grad.addColorStop(0.4, color + 'cc');
      grad.addColorStop(0.8, color + '66');
      grad.addColorStop(1, color + '00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s*0.4, -s*0.3, -s*0.6, -s*0.8, 0, -s);
      ctx.bezierCurveTo(s*0.6, -s*0.8, s*0.4, -s*0.3, 0, 0);
      ctx.fill();

      // Vein line
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.1);
      ctx.quadraticCurveTo(-s*0.15, -s*0.5, 0, -s*0.9);
      ctx.stroke();

      ctx.restore();
    }

    // Center
    ctx.fillStyle = COLORS.yellow + 'ff';
    ctx.beginPath();
    ctx.arc(0, 0, s*0.25, 0, Math.PI * 2);
    ctx.fill();

    // Stamen dots
    ctx.fillStyle = '#fff8';
    for(let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * s*0.12, Math.sin(a) * s*0.12, s*0.05, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawViolet(ctx, x, y, size, rot, color, windX, windY, breathe, time) {
    ctx.save();
    ctx.translate(x + windX, y + windY);
    ctx.rotate(rot);
    const s = size * breathe;

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    // 5 heart-shaped petals
    const petalSizes = [1, 0.85, 0.85, 0.7, 0.7];
    const angles = [0, 0.6, -0.6, 2.1, -2.1];

    for(let i = 0; i < 5; i++) {
      const sway = Math.sin(time * 0.04 + i) * 0.1;
      ctx.save();
      ctx.rotate(angles[i] + sway);
      const ps = s * petalSizes[i];

      const grad = ctx.createRadialGradient(0, -ps*0.3, 0, 0, -ps*0.5, ps);
      grad.addColorStop(0, color + 'ff');
      grad.addColorStop(0.5, color + 'aa');
      grad.addColorStop(1, color + '00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-ps*0.5, -ps*0.4, -ps*0.6, -ps*0.9, 0, -ps);
      ctx.bezierCurveTo(ps*0.6, -ps*0.9, ps*0.5, -ps*0.4, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = COLORS.yellow + 'ff';
    ctx.beginPath();
    ctx.arc(0, 0, s*0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawForgetMeNot(ctx, x, y, size, rot, color, windX, windY, breathe, time) {
    ctx.save();
    ctx.translate(x + windX, y + windY);
    ctx.rotate(rot);
    const s = size * breathe;

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // 5 small petals
    for(let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const sway = Math.sin(time * 0.06 + i) * 0.12;
      const px = Math.cos(angle + sway) * s * 0.35;
      const py = Math.sin(angle + sway) * s * 0.35;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, s*0.4);
      grad.addColorStop(0, color + 'ff');
      grad.addColorStop(0.6, color + '99');
      grad.addColorStop(1, color + '00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = COLORS.yellow + 'ff';
    ctx.beginPath();
    ctx.arc(0, 0, s*0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawStar(ctx, x, y, size, rot, color, windX, windY, breathe, time) {
    ctx.save();
    ctx.translate(x + windX, y + windY);
    ctx.rotate(rot + time * 0.01); // Slow rotation
    const s = size * breathe;

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // 4-pointed star
    for(let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i / 4) * Math.PI * 2);

      const grad = ctx.createLinearGradient(0, 0, 0, -s);
      grad.addColorStop(0, color + 'ff');
      grad.addColorStop(0.5, color + 'cc');
      grad.addColorStop(1, color + '00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-s*0.2, -s*0.3, 0, -s);
      ctx.quadraticCurveTo(s*0.2, -s*0.3, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = COLORS.white + 'cc';
    ctx.beginPath();
    ctx.arc(0, 0, s*0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawDiamond(ctx, x, y, size, rot, color, windX, windY, breathe, time) {
    ctx.save();
    ctx.translate(x + windX, y + windY);
    ctx.rotate(rot);
    const s = size * breathe;

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    // Diamond shape with animation
    const pulse = 1 + Math.sin(time * 0.03) * 0.1;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    grad.addColorStop(0, color + 'ff');
    grad.addColorStop(0.5, color + 'aa');
    grad.addColorStop(1, color + '00');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -s * pulse);
    ctx.lineTo(s * pulse * 0.7, 0);
    ctx.lineTo(0, s * pulse);
    ctx.lineTo(-s * pulse * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // Inner diamond
    ctx.fillStyle = COLORS.white + '66';
    ctx.beginPath();
    ctx.moveTo(0, -s*0.4);
    ctx.lineTo(s*0.3, 0);
    ctx.lineTo(0, s*0.4);
    ctx.lineTo(-s*0.3, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ═════════════════════════════════════════════════════════════════
  // INITIALIZE FIXED FLOWERS
  // ═════════════════════════════════════════════════════════════════

  const flowers = FIXED_FLOWERS.map((data, index) => {
    const [angleNorm, rOffset, type, size, colorKey, layer] = data;
    const angle = angleNorm * Math.PI * 2;
    const radius = RADIUS + rOffset;

    const colorMap = {
      pink: COLORS.pinkMedium, purple: COLORS.purpleMedium,
      blue: COLORS.blueMedium, lavender: COLORS.lavender,
      cyan: COLORS.cyan
    };

    return {
      x: CX + Math.cos(angle) * radius,
      y: CY + Math.sin(angle) * radius,
      angle: angle,
      type: type,
      size: size,
      color: colorMap[colorKey],
      layer: layer,
      rotation: angle + Math.PI/2,
      // Fixed animation offsets
      swayOffset: index * 0.5,
      breatheOffset: index * 0.3,
      flutterOffset: index * 0.7
    };
  });

  // Sort by layer
  flowers.sort((a, b) => a.layer - b.layer);

  // Initialize particles
  const particles = FIXED_PARTICLES.map((data, index) => {
    const [xNorm, yNorm, size, colorKey] = data;
    const colorMap = {
      lavender: COLORS.lavenderLight, blue: COLORS.blueLight,
      purple: COLORS.purpleLight, cyan: COLORS.cyanLight
    };

    return {
      baseX: 20 + xNorm * 120,
      baseY: 20 + yNorm * 120,
      x: 20 + xNorm * 120,
      y: 20 + yNorm * 120,
      size: size,
      color: colorMap[colorKey],
      offset: index * 0.8,
      speed: 0.3 + (index % 3) * 0.1
    };
  });

  // ═════════════════════════════════════════════════════════════════
  // ANIMATION LOOP
  // ═════════════════════════════════════════════════════════════════

  let time = 0;
  let raf;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    time++;

    // Wind calculation - stronger for more visible animation
    const windBase = Math.sin(time * 0.015) * 3;
    const windGust = Math.sin(time * 0.035) * 2;
    const windTotal = windBase + windGust;

    // ═══════════════════════════════════════════════════════════════
    // DRAW FLOWERS
    // ═══════════════════════════════════════════════════════════════

    flowers.forEach(f => {
      // STRONGER animations
      const sway = Math.sin(time * 0.025 + f.swayOffset) * 4; // Increased from 2-3
      const breathe = 1 + Math.sin(time * 0.02 + f.breatheOffset) * 0.08; // Increased from 0.04
      const flutter = Math.sin(time * 0.04 + f.flutterOffset) * 0.08;

      // Wind affects outer flowers more
      const windFactor = f.layer === 2 ? 1.2 : 0.8;
      const windX = Math.cos(f.angle) * sway + windTotal * windFactor * 0.8;
      const windY = Math.sin(f.angle) * sway * 0.5 + Math.abs(windTotal) * 0.3;

      const rot = f.rotation + flutter + windTotal * 0.015;

      switch(f.type) {
        case 0: drawCherry(ctx, f.x, f.y, f.size, rot, f.color, windX, windY, breathe, time); break;
        case 1: drawViolet(ctx, f.x, f.y, f.size, rot, f.color, windX, windY, breathe, time); break;
        case 2: drawForgetMeNot(ctx, f.x, f.y, f.size, rot, f.color, windX, windY, breathe, time); break;
        case 3: drawStar(ctx, f.x, f.y, f.size, rot, f.color, windX, windY, breathe, time); break;
        case 4: drawDiamond(ctx, f.x, f.y, f.size, rot, f.color, windX, windY, breathe, time); break;
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // DRAW PARTICLES
    // ═══════════════════════════════════════════════════════════════

    particles.forEach(p => {
      const swayX = Math.sin(time * 0.02 + p.offset) * 8;
      const swayY = Math.cos(time * 0.015 + p.offset) * 6;
      const floatY = Math.sin(time * 0.01) * 3;

      const x = p.baseX + swayX;
      const y = p.baseY + swayY + floatY;

      const fade = 0.6 + Math.sin(time * 0.03 + p.offset) * 0.4;

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
      grad.addColorStop(0, p.color + 'ff');
      grad.addColorStop(0.5, p.color + '88');
      grad.addColorStop(1, p.color + '00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ═══════════════════════════════════════════════════════════════
    // AMBIENT EFFECTS
    // ═══════════════════════════════════════════════════════════════

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Soft glow
    const ambient = ctx.createRadialGradient(CX, CY, 30, CX, CY, RADIUS + 25);
    ambient.addColorStop(0, 'rgba(255, 200, 255, 0.12)');
    ambient.addColorStop(0.5, 'rgba(200, 200, 255, 0.06)');
    ambient.addColorStop(1, 'rgba(255, 200, 255, 0)');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, W, H);

    // Occasional sparkle
    if(Math.random() < 0.03) {
      const sx = CX + (Math.random() - 0.5) * RADIUS * 1.8;
      const sy = CY + (Math.random() - 0.5) * RADIUS * 1.8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    window._decoRaf = raf = requestAnimationFrame(draw);
  }

  if(window._decoRaf) cancelAnimationFrame(window._decoRaf);
  draw();

})();
