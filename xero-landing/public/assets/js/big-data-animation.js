/**
 * Pro17 Analytics — Big Data Warehouse Infrastructure Animation
 * 8-scene cinematic storytelling · 60fps · Simulated 3D perspective
 * Background: #161616 · Glass cubes · Digital rain · Living warehouse
 */
function initBigDataAnimation(canvas) {
  'use strict';
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ─── Config ───────────────────────────────────────────────────────────────
  const SCENE_DURATION = 2200;   // ms per scene
  const TOTAL_DURATION = 17600;  // 8 × 2200ms
  const BG = '#161616';
  const MOBILE_BP = 768;

  const COL = {
    blue:   '#3B82F6',
    purple: '#8B5CF6',
    teal:   '#14B8A6',
    white:  '#E2E8F0',
    amber:  '#F59E0B',
    dim:    '#1e2035',
  };

  // ─── State ────────────────────────────────────────────────────────────────
  let W, H, dpr, isMobile;
  let animId, startTime = null, paused = false;
  let hovering = false, mouseX = 0, mouseY = 0;

  // Rain particles
  let rain = [];
  // Warehouse cubes array
  let warehouse = [];
  // Light drones
  let drones = [];
  // Connection pulses
  let pulses = [];

  // Camera state
  const cam = { x: 0, y: 0, z: 800, tilt: 0.18, pan: 0 };

  // ─── Resize ───────────────────────────────────────────────────────────────
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    isMobile = W < MOBILE_BP;
    buildWarehouse();
    buildRain();
    buildDrones();
  }

  // ─── 3D → 2D Perspective Projection ──────────────────────────────────────
  const FOV = 420;
  function project(x3, y3, z3) {
    // Apply camera offset
    const rx = x3 - cam.x;
    const ry = y3 - cam.y;
    const rz = z3 + cam.z;
    if (rz <= 0) return null;
    const scale = FOV / rz;
    return {
      x: W / 2 + rx * scale + cam.pan * (FOV / rz) * 40,
      y: H / 2 + (ry - rz * cam.tilt) * scale,
      scale,
      z: rz,
    };
  }

  // ─── Easing ───────────────────────────────────────────────────────────────
  function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function easeIn(t) { return t * t * t; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ─── Warehouse Grid ───────────────────────────────────────────────────────
  const CUBE_W = 60, CUBE_H = 40, CUBE_D = 60;
  const COLS = 9, ROWS = 5, LAYERS = 3;

  function buildWarehouse() {
    warehouse = [];
    for (let layer = 0; layer < LAYERS; layer++) {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const x3 = (col - COLS / 2) * (CUBE_W + 10);
          const y3 = (row - ROWS / 2) * (CUBE_H + 10);
          const z3 = -layer * (CUBE_D + 15);
          warehouse.push({
            x: x3, y: y3, z: z3,
            w: CUBE_W, h: CUBE_H, d: CUBE_D,
            glow: 0,
            glowColor: randomColor(),
            spawnDelay: (col * 0.03 + row * 0.06 + layer * 0.12),
            risen: 0,
            activity: Math.random(),
            coldness: layer * 0.3 + Math.random() * 0.2,
          });
        }
      }
    }
  }

  function randomColor() {
    const c = [COL.blue, COL.purple, COL.teal, COL.white];
    return c[Math.floor(Math.random() * c.length)];
  }

  // ─── Rain Particles ───────────────────────────────────────────────────────
  function buildRain() {
    rain = [];
    const count = isMobile ? 120 : 280;
    for (let i = 0; i < count; i++) rain.push(makeRainParticle());
  }

  function makeRainParticle(startTop = false) {
    const colors = [COL.blue, COL.purple, COL.teal, COL.white];
    return {
      x: (Math.random() - 0.5) * W * 2.5,
      y: startTop ? -Math.random() * H : (Math.random() - 0.5) * H * 2,
      z: -Math.random() * 200,
      vy: 0.8 + Math.random() * 1.8,
      size: Math.random() * 2.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.5 + Math.random() * 0.5,
      trail: [],
      chaos: false,
      vx: 0, ax: 0,
    };
  }

  // ─── Light Drones ────────────────────────────────────────────────────────
  function buildDrones() {
    drones = [];
    const count = isMobile ? 3 : 6;
    for (let i = 0; i < count; i++) {
      drones.push({
        x: (Math.random() - 0.5) * COLS * (CUBE_W + 10),
        y: (Math.random() - 0.5) * ROWS * (CUBE_H + 10),
        z: -Math.random() * LAYERS * (CUBE_D + 15),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.4,
        color: randomColor(),
        glow: Math.random(),
      });
    }
  }

  // ─── Draw a 3D Cube (glass material) ─────────────────────────────────────
  function drawCube3D(cube, alpha, glowAmt, scene) {
    const { x, y, z, w, h, d } = cube;

    // 8 corners
    const pts = [
      project(x,     y,     z    ),  // 0 front-top-left
      project(x + w, y,     z    ),  // 1 front-top-right
      project(x + w, y + h, z    ),  // 2 front-bottom-right
      project(x,     y + h, z    ),  // 3 front-bottom-left
      project(x,     y,     z - d),  // 4 back-top-left
      project(x + w, y,     z - d),  // 5 back-top-right
      project(x + w, y + h, z - d),  // 6 back-bottom-right
      project(x,     y + h, z - d),  // 7 back-bottom-left
    ];

    if (pts.some(p => !p)) return;

    const baseAlpha = alpha * (1 - cube.coldness * 0.5);
    const glowColor = cube.glowColor;

    // Soft glow from active cubes
    if (glowAmt > 0.05) {
      const cx = (pts[0].x + pts[2].x) / 2;
      const cy = (pts[0].y + pts[2].y) / 2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * pts[0].scale * 1.2);
      grd.addColorStop(0, glowColor + Math.floor(glowAmt * baseAlpha * 80).toString(16).padStart(2, '0'));
      grd.addColorStop(1, glowColor + '00');
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * pts[0].scale * 1.5, h * pts[0].scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Top face
    drawFace([pts[0], pts[1], pts[5], pts[4]], 'rgba(255,255,255,0.07)', glowColor, baseAlpha * 0.9, glowAmt);
    // Front face
    drawFace([pts[0], pts[1], pts[2], pts[3]], 'rgba(255,255,255,0.05)', glowColor, baseAlpha, glowAmt);
    // Right face
    drawFace([pts[1], pts[5], pts[6], pts[2]], 'rgba(255,255,255,0.03)', glowColor, baseAlpha * 0.7, glowAmt * 0.8);

    // Edge highlights (thin glowing border)
    drawEdge([pts[0], pts[1], pts[2], pts[3], pts[0]], glowColor, baseAlpha * (0.3 + glowAmt * 0.5));
    drawEdge([pts[0], pts[4]], glowColor, baseAlpha * 0.2);
    drawEdge([pts[1], pts[5]], glowColor, baseAlpha * 0.2);
    drawEdge([pts[4], pts[5]], glowColor, baseAlpha * 0.15);

    // Data pulse line running through cube
    if (scene >= 4 && glowAmt > 0.1) {
      const t2 = (Date.now() * 0.002 + cube.spawnDelay * 10) % 1;
      const px2 = lerp(pts[0].x, pts[1].x, t2);
      const py2 = lerp(pts[0].y, pts[1].y, t2);
      ctx.beginPath();
      ctx.arc(px2, py2, 2 * pts[0].scale, 0, Math.PI * 2);
      ctx.fillStyle = glowColor + Math.floor(baseAlpha * glowAmt * 200).toString(16).padStart(2, '00');
      ctx.fill();
    }
  }

  function drawFace(pts, fillBase, glowColor, alpha, glowAmt) {
    if (!pts.every(p => p)) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const grd = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
    grd.addColorStop(0, fillBase);
    grd.addColorStop(1, 'rgba(255,255,255,0.01)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grd;
    ctx.fill();
    if (glowAmt > 0.1) {
      ctx.strokeStyle = glowColor + Math.floor(glowAmt * alpha * 120).toString(16).padStart(2, '00');
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawEdge(pts, color, alpha) {
    if (!pts.every(p => p)) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color + Math.max(0, Math.floor(Math.min(1, alpha) * 180)).toString(16).padStart(2, '00');
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  // ─── Scene caption overlay ───────────────────────────────────────────────
  function drawSceneLabel(title, subtitle, sp, position = 'bottom') {
    // Fade in quickly, hold, fade out at end
    const fadeIn  = Math.min(1, sp * 5);
    const fadeOut = sp > 0.82 ? Math.max(0, 1 - (sp - 0.82) / 0.18) : 1;
    const a = fadeIn * fadeOut;
    if (a < 0.02) return;

    const padding = 20;
    const titleSize = isMobile ? 13 : 16;
    const subSize   = isMobile ? 10 : 12;
    const boxH = 62;
    const boxY = position === 'bottom' ? H - boxH - padding : padding;

    // Semi-transparent glass pill
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.beginPath();
    ctx.roundRect(padding, boxY, W - padding * 2, boxH, 10);
    const bg = ctx.createLinearGradient(padding, boxY, padding, boxY + boxH);
    bg.addColorStop(0, 'rgba(30,32,50,0.82)');
    bg.addColorStop(1, 'rgba(16,18,32,0.88)');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent bar
    ctx.beginPath();
    ctx.roundRect(padding, boxY, 3, boxH, [10, 0, 0, 10]);
    const accentGrd = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
    accentGrd.addColorStop(0, COL.blue);
    accentGrd.addColorStop(1, COL.purple);
    ctx.fillStyle = accentGrd;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Title text
    ctx.globalAlpha = a;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `700 ${titleSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, padding + 18, boxY + 14);

    // Subtitle text
    ctx.fillStyle = 'rgba(148,163,184,0.9)';
    ctx.font = `400 ${subSize}px Inter, sans-serif`;
    ctx.fillText(subtitle, padding + 18, boxY + 14 + titleSize + 6);
    ctx.restore();
  }

  // ─── Small floating label near a 3D point ────────────────────────────────
  function drawPointLabel(x3, y3, z3, text, color, alpha) {
    const p = project(x3, y3, z3);
    if (!p || alpha < 0.02) return;
    const fontSize = Math.max(8, Math.round(10 * p.scale));
    ctx.save();
    ctx.globalAlpha = alpha;
    // Dot
    ctx.beginPath();
    ctx.arc(p.x, p.y - 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    // Tiny pill bg
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    const tw = ctx.measureText(text).width;
    ctx.beginPath();
    ctx.roundRect(p.x - tw / 2 - 5, p.y - 22, tw + 10, 14, 4);
    ctx.fillStyle = 'rgba(16,18,32,0.75)';
    ctx.fill();
    // Label text
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, p.x, p.y - 21);
    ctx.restore();
  }

  // ─── Rain particle draw ───────────────────────────────────────────────────
  function updateRainParticle(p, chaos, t) {
    if (chaos) {
      p.vx += p.ax;
      p.ax += (Math.random() - 0.5) * 0.1;
      p.ax *= 0.95;
      p.vx *= 0.94;
    } else {
      p.vx *= 0.96;
    }
    p.x += p.vx;
    p.y += p.vy + (chaos ? (Math.random() - 0.5) * 2 : 0);

    if (p.y > H + 20) {
      p.y = -10;
      p.x = (Math.random() - 0.5) * W * 2.5;
    }
  }

  function drawRainParticle(p, alpha = 1) {
    const proj = project(p.x, p.y, p.z);
    if (!proj) return;

    // Trail
    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
      ctx.strokeStyle = p.color + '22';
      ctx.lineWidth = proj.scale * p.size * 0.4;
      ctx.stroke();
    }
    p.trail.push({ x: proj.x, y: proj.y });
    if (p.trail.length > 8) p.trail.shift();

    ctx.beginPath();
    ctx.arc(proj.x, proj.y, Math.max(0.5, proj.scale * p.size), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha * alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ─── Background ───────────────────────────────────────────────────────────
  function drawBg(fogY = null) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Volumetric fog at bottom
    if (fogY !== null) {
      const fg = ctx.createLinearGradient(0, fogY, 0, H);
      fg.addColorStop(0, 'rgba(22,22,22,0)');
      fg.addColorStop(1, 'rgba(22,22,22,0.85)');
      ctx.fillStyle = fg;
      ctx.fillRect(0, fogY, W, H - fogY);
    }

    // Blue rim light from left edge
    const rl = ctx.createRadialGradient(0, H * 0.5, 0, 0, H * 0.5, W * 0.45);
    rl.addColorStop(0, 'rgba(59,130,246,0.06)');
    rl.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = rl;
    ctx.fillRect(0, 0, W, H);

    // Purple rim light from right
    const rr = ctx.createRadialGradient(W, H * 0.4, 0, W, H * 0.4, W * 0.45);
    rr.addColorStop(0, 'rgba(139,92,246,0.05)');
    rr.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = rr;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── Depth-sort warehouse cubes for correct painter's algorithm ───────────
  function sortedWarehouse() {
    return [...warehouse].sort((a, b) => (b.z - b.y * 0.1) - (a.z - a.y * 0.1));
  }

  // ─── Construct lines (AI Architect scene) ─────────────────────────────────
  function drawConstructionLines(sp, t) {
    const lines = [
      { x1: -200, y1: 0, z1: 0, x2: 200,  y2: 0,    z2: -80 },
      { x1: -200, y1: 0, z1: 0, x2: -200, y2: -80,  z2: -80 },
      { x1: 200,  y1: 0, z1: 0, x2: 200,  y2: -80,  z2: -80 },
      { x1: 0,    y1: 0, z1: 0, x2: 0,    y2: 100,  z2: -100 },
      { x1: 0,    y1: 0, z1: 0, x2: -300, y2: 60,   z2: -60 },
      { x1: 0,    y1: 0, z1: 0, x2: 300,  y2: -50,  z2: -60 },
    ];
    lines.forEach((l, i) => {
      const progress = Math.min(1, Math.max(0, (sp - i * 0.1) * 3));
      if (progress <= 0) return;
      const p1 = project(l.x1, l.y1, l.z1);
      const ex = l.x1 + (l.x2 - l.x1) * progress;
      const ey = l.y1 + (l.y2 - l.y1) * progress;
      const ez = l.z1 + (l.z2 - l.z1) * progress;
      const p2 = project(ex, ey, ez);
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      const colors = [COL.blue, COL.teal, COL.purple, COL.blue, COL.teal, COL.purple];
      ctx.strokeStyle = colors[i % colors.length] + 'aa';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving dot along line
      const dot = (t * 0.003 + i * 0.3) % 1;
      const dx = p1.x + (p2.x - p1.x) * dot;
      const dy = p1.y + (p2.y - p1.y) * dot;
      ctx.beginPath();
      ctx.arc(dx, dy, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    });
  }

  // ─── AI Core Cube ─────────────────────────────────────────────────────────
  function drawAICube(sp, t) {
    const size = 40 * Math.min(1, sp * 2);
    const p = project(0, 0, 0);
    if (!p) return;

    const s = p.scale * size;
    const pulse = (Math.sin(t * 0.004) + 1) * 0.5;

    // Outer glow
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.5);
    grd.addColorStop(0, COL.purple + Math.floor(sp * 100).toString(16).padStart(2, '00'));
    grd.addColorStop(1, COL.purple + '00');
    ctx.beginPath();
    ctx.arc(p.x, p.y, s * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core cube (2D simplified for the AI core)
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(t * 0.001);
    ctx.beginPath();
    ctx.rect(-s, -s, s * 2, s * 2);
    ctx.fillStyle = `rgba(139,92,246,${sp * 0.3 + pulse * 0.1})`;
    ctx.fill();
    ctx.strokeStyle = COL.purple;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner rotating square
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    ctx.strokeStyle = COL.blue + 'aa';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // ─── Bridge connection between cubes ──────────────────────────────────────
  function drawBridges(alpha, t) {
    const bridgeRows = [1, 3]; // connect row 1 and 3
    bridgeRows.forEach(row => {
      for (let col = 0; col < COLS - 1; col++) {
        const c1 = warehouse.find(c => c.z === 0 && Math.round(c.x / (CUBE_W + 10)) === col - Math.floor(COLS/2) && Math.round(c.y / (CUBE_H + 10)) === row - Math.floor(ROWS/2));
        const c2 = warehouse.find(c => c.z === 0 && Math.round(c.x / (CUBE_W + 10)) === col + 1 - Math.floor(COLS/2) && Math.round(c.y / (CUBE_H + 10)) === row - Math.floor(ROWS/2));
        if (!c1 || !c2) return;

        const p1 = project(c1.x + CUBE_W, c1.y + CUBE_H / 2, c1.z);
        const p2 = project(c2.x, c2.y + CUBE_H / 2, c2.z);
        if (!p1 || !p2) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = COL.blue + Math.floor(alpha * 60).toString(16).padStart(2, '00');
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulse along bridge
        const pulse = (t * 0.002 + col * 0.3) % 1;
        const bx = p1.x + (p2.x - p1.x) * pulse;
        const by = p1.y + (p2.y - p1.y) * pulse;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = COL.blue + Math.floor(alpha * 200).toString(16).padStart(2, '00');
        ctx.fill();
      }
    });
  }

  // ─── Vertical light elevators ─────────────────────────────────────────────
  function drawElevators(alpha, t) {
    [COLS * 0.25, COLS * 0.5, COLS * 0.75].forEach((colFrac, i) => {
      const col = Math.floor(colFrac) - Math.floor(COLS / 2);
      const x3 = col * (CUBE_W + 10) + CUBE_W / 2;
      const t2 = (t * 0.0015 + i * 0.33) % 1;
      const y3 = lerp(-ROWS / 2 * (CUBE_H + 10), ROWS / 2 * (CUBE_H + 10), t2);

      const p = project(x3, y3, 0);
      if (!p) return;

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8 * p.scale);
      grd.addColorStop(0, COL.teal + Math.floor(alpha * 220).toString(16).padStart(2, '00'));
      grd.addColorStop(1, COL.teal + '00');
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });
  }

  // ─── Light drones ─────────────────────────────────────────────────────────
  function updateDrawDrones(alpha, t) {
    drones.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (Math.abs(d.x) > COLS / 2 * (CUBE_W + 10)) d.vx *= -1;
      if (Math.abs(d.y) > ROWS / 2 * (CUBE_H + 10)) d.vy *= -1;
      d.glow = (d.glow + 0.02) % 1;

      const p = project(d.x, d.y, d.z);
      if (!p) return;

      const gs = (Math.sin(d.glow * Math.PI * 2) + 1) * 0.5;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12 * p.scale);
      grd.addColorStop(0, d.color + Math.floor(alpha * (120 + gs * 100)).toString(16).padStart(2, '00'));
      grd.addColorStop(1, d.color + '00');
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // ─── Scene renderers ──────────────────────────────────────────────────────

  // Scene 1: Digital Rain
  function scene1(sp, t) {
    cam.x = 0; cam.y = 0; cam.z = 800; cam.tilt = 0.18; cam.pan = 0;
    drawBg();

    rain.forEach(p => {
      p.chaos = false;
      updateRainParticle(p, false, t);
      drawRainParticle(p, sp);
    });

    drawSceneLabel(
      'Enterprise Data Streams',
      'Invoices · Transactions · IoT Events · Customer Records · Logs · Images · APIs',
      sp
    );

    // Faint grid lines suggesting depth
    for (let i = 0; i < 8; i++) {
      const x3 = (i - 4) * 60;
      const p1 = project(x3, -200, 0);
      const p2 = project(x3, 200, -300);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(59,130,246,${sp * 0.06})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Scene 2: Chaos
  function scene2(sp, t) {
    cam.x = Math.sin(t * 0.0005) * 30;
    cam.y = Math.cos(t * 0.0004) * 15;
    cam.z = 800; cam.tilt = 0.18 + Math.sin(t * 0.0003) * 0.04;
    drawBg();

    rain.forEach(p => {
      if (!p.chaos) {
        p.chaos = true;
        p.ax = (Math.random() - 0.5) * 0.3;
      }
      updateRainParticle(p, true, t);
      drawRainParticle(p, 1);
    });

    drawSceneLabel(
      'Unstructured — The Problem',
      'Raw enterprise data is messy, unorganized, and impossible to query at scale without a proper architecture.',
      sp
    );

    // Collision flashes
    if (sp > 0.2 && Math.random() < 0.15) {
      const px = (Math.random() - 0.5) * W;
      const py = (Math.random() - 0.5) * H;
      const grd = ctx.createRadialGradient(W/2 + px, H/2 + py, 0, W/2 + px, H/2 + py, 18);
      grd.addColorStop(0, 'rgba(255,255,255,0.25)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(W/2 + px, H/2 + py, 18, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Overlay "darkness consuming data" vignette increasing
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.7);
    vig.addColorStop(0, 'rgba(22,22,22,0)');
    vig.addColorStop(1, `rgba(22,22,22,${sp * 0.5})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  // Scene 3: AI Architect Arrives
  function scene3(sp, t) {
    cam.x = lerp(cam.x, 0, 0.03);
    cam.y = lerp(cam.y, 0, 0.03);
    cam.z = lerp(cam.z, 750, 0.03);
    cam.tilt = lerp(cam.tilt, 0.15, 0.03);
    drawBg(H * 0.55);

    // Few remaining rain particles fade out
    rain.slice(0, Math.floor(rain.length * (1 - sp))).forEach(p => {
      updateRainParticle(p, false, t);
      drawRainParticle(p, 1 - sp);
    });

    // AI core cube
    drawAICube(sp, t);

    // AI label near the core
    if (sp > 0.15) {
      drawPointLabel(0, -70, 0, 'AI Architect', COL.purple, Math.min(1, (sp - 0.15) * 3));
    }

    // Construction lines
    if (sp > 0.2) {
      drawConstructionLines((sp - 0.2) / 0.8, t);
    }

    drawSceneLabel(
      'AI Architect — Designing the Infrastructure',
      'Intelligent systems begin designing a scalable storage architecture built for petabyte-scale enterprise data.',
      sp
    );

    // Horizon glow suggesting the warehouse to come
    const horizY = H * (0.5 + cam.tilt * 0.5);
    const hg = ctx.createLinearGradient(0, horizY - 40, 0, horizY + 40);
    hg.addColorStop(0, `rgba(59,130,246,${sp * 0.12})`);
    hg.addColorStop(0.5, `rgba(59,130,246,${sp * 0.25})`);
    hg.addColorStop(1, `rgba(59,130,246,0)`);
    ctx.fillStyle = hg;
    ctx.fillRect(0, horizY - 40, W, 80);
  }

  // Scene 4: Warehouse Construction
  function scene4(sp, t) {
    cam.z = lerp(cam.z, 680, 0.015);
    cam.x = lerp(cam.x, -40, 0.02);
    cam.tilt = 0.14;
    drawBg(H * 0.72);

    const sorted = sortedWarehouse();
    sorted.forEach((c, idx) => {
      const appear = Math.min(1, Math.max(0, (sp - c.spawnDelay) * 3));
      if (appear <= 0) return;

      // Cube "rises" into position (y animates from below)
      const riseDist = 60;
      const trueY = c.y + riseDist * (1 - ease(appear));
      const tempCube = { ...c, y: trueY };

      const glowAmt = appear * (0.3 + Math.sin(t * 0.003 + idx * 0.5) * 0.15);
      drawCube3D(tempCube, appear * 0.92, glowAmt, 4);
    });

    // Bridges appear after most cubes are up
    if (sp > 0.6) drawBridges((sp - 0.6) * 2.5, t);
    if (sp > 0.75) drawElevators((sp - 0.75) * 4, t);

    // Labels pointing to warehouse zones
    if (sp > 0.55) {
      const la = Math.min(1, (sp - 0.55) * 3);
      drawPointLabel(-200, -60, 0, 'Data Lake', COL.teal, la);
      drawPointLabel(100,  -60, 0, 'Data Warehouse', COL.blue, la);
      drawPointLabel(-60,  -60, -120, 'Cold Storage', COL.purple, la * 0.7);
    }

    drawSceneLabel(
      'Building the Data Warehouse',
      'Scalable glass storage blocks assemble automatically — rows, layers, and bridges forming enterprise-grade infrastructure.',
      sp
    );
  }

  // Scene 5: Smart Organization — particles find their locations
  function scene5(sp, t) {
    cam.z = lerp(cam.z, 650, 0.02);
    cam.x = lerp(cam.x, 0, 0.02);
    cam.tilt = 0.14;
    drawBg(H * 0.72);

    // Full warehouse visible
    const sorted = sortedWarehouse();
    sorted.forEach((c, idx) => {
      // Update cube glow based on organization
      const targetGlow = sp > 0.3 ? (0.4 + Math.sin(t * 0.002 + idx) * 0.25) : 0.25;
      c.glow = lerp(c.glow, targetGlow, 0.05);
      drawCube3D(c, 0.9, c.glow, 5);
    });

    drawBridges(0.6, t);
    drawElevators(0.8, t);

    // Zone labels
    if (sp > 0.2) {
      const la = Math.min(1, (sp - 0.2) * 3);
      drawPointLabel(-200, -60, 0, 'Hot Data', COL.amber, la);
      drawPointLabel(30,   -60, 0, 'Warm Data', COL.teal, la);
      drawPointLabel(200,  -60, -80, 'Cold Storage', COL.purple, la * 0.7);
    }

    drawSceneLabel(
      'Intelligent Data Organization',
      'Every record finds its optimal location — hot data stays accessible, cold data moves to deep storage automatically.',
      sp
    );

    // Organized particles flying into cubes
    if (sp > 0.2) {
      const targetCubes = warehouse.filter((_, i) => i < 12);
      rain.slice(0, 30).forEach((p, i) => {
        if (!targetCubes[i % targetCubes.length]) return;
        const tc = targetCubes[i % targetCubes.length];
        const tp = project(tc.x + CUBE_W / 2, tc.y + CUBE_H / 2, tc.z);
        if (!tp) return;
        const proj = project(p.x, p.y, p.z);
        if (!proj) return;
        // Pull toward cube
        const dx = tp.x - proj.x, dy = tp.y - proj.y;
        p.vx += dx * 0.003 * (sp - 0.2);
        p.vy += dy * 0.003 * (sp - 0.2);
        p.vx *= 0.92; p.vy *= 0.92;
        p.y += p.vy; p.x += p.vx;
        if (p.trail.length > 0) p.trail = [];
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }
  }

  // Scene 6: Living Warehouse — breathing, drones, pulses
  function scene6(sp, t) {
    cam.z = lerp(cam.z, 620, 0.02);
    cam.x = lerp(cam.x, 30, 0.015);
    cam.tilt = 0.13;
    drawBg(H * 0.72);

    const sorted = sortedWarehouse();
    sorted.forEach((c, idx) => {
      // "Breathing" — subtle scale oscillation
      const breathe = Math.sin(t * 0.002 + idx * 0.3) * 0.05 + 1;
      const bCube = { ...c, w: c.w * breathe, h: c.h * breathe };
      const glowPulse = 0.35 + Math.sin(t * 0.0025 + idx * 0.4) * 0.25;
      drawCube3D(bCube, 0.88, glowPulse, 6);
    });

    drawBridges(0.8, t);
    drawElevators(1.0, t);
    if (sp > 0.3) updateDrawDrones((sp - 0.3) * 1.4, t);

    // Drone labels
    if (sp > 0.5) {
      const la = Math.min(1, (sp - 0.5) * 3);
      drawPointLabel(0, -120, 0, 'Monitoring Agent', COL.teal, la);
    }

    drawSceneLabel(
      'The Living Warehouse — Always Active',
      'Autonomous monitoring agents patrol storage rows. The system continuously self-optimizes and scales in real time.',
      sp
    );

    // Light ripple across the whole warehouse
    const ripple = (t * 0.001) % 1;
    warehouse.forEach((c, i) => {
      const centerDist = Math.sqrt(c.x * c.x + c.z * c.z) / 300;
      const rAlpha = Math.max(0, 1 - Math.abs(ripple - (centerDist % 1)));
      if (rAlpha < 0.05) return;
      const p = project(c.x + CUBE_W / 2, c.y + CUBE_H / 2, c.z);
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = COL.teal + Math.floor(rAlpha * 160).toString(16).padStart(2, '00');
      ctx.fill();
    });
  }

  // Scene 7: Infinite Scale — camera pulls back, warehouse grows
  function scene7(sp, t) {
    // Camera pulls back and slightly upward
    const pullBack = ease(sp);
    cam.z = lerp(620, 1200, pullBack);
    cam.x = lerp(30, 0, pullBack);
    cam.tilt = lerp(0.13, 0.22, pullBack);
    cam.pan = Math.sin(t * 0.0003) * 0.3;
    drawBg(H * 0.78);

    // Draw original warehouse
    const sorted = sortedWarehouse();
    sorted.forEach((c, idx) => {
      const glowPulse = 0.3 + Math.sin(t * 0.002 + idx * 0.3) * 0.2;
      drawCube3D(c, 0.85, glowPulse, 7);
    });

    drawBridges(0.9, t);
    drawElevators(1.0, t);
    updateDrawDrones(0.9, t);

    drawSceneLabel(
      'Infinite Scalability — Enterprise Grade',
      'The warehouse expands on demand. From gigabytes to petabytes — cloud-native, distributed, and always available.',
      sp,
      'bottom'
    );

    // Additional "infinite" cube towers extending into the distance
    if (sp > 0.3) {
      const ext = (sp - 0.3) / 0.7;
      for (let col = -Math.floor(COLS/2) - 4; col <= Math.floor(COLS/2) + 4; col++) {
        if (Math.abs(col) <= Math.floor(COLS/2)) continue; // skip existing
        for (let row = 0; row < ROWS; row++) {
          const x3 = col * (CUBE_W + 10);
          const y3 = (row - ROWS/2) * (CUBE_H + 10);
          const z3 = 0;
          const appear = Math.min(1, ext * 2);
          const p = project(x3, y3, z3);
          if (!p) continue;
          const alpha = appear * 0.6;
          const dummyCube = { x: x3, y: y3, z: z3, w: CUBE_W, h: CUBE_H, d: CUBE_D,
                              glow: 0.3, glowColor: randomColor(), spawnDelay: 0, coldness: 0.3 };
          drawCube3D(dummyCube, alpha, 0.25, 7);
        }
      }

      // Extra depth layers
      for (let layer = LAYERS; layer < LAYERS + 3; layer++) {
        for (let col = 0; col < COLS; col++) {
          for (let row = 0; row < ROWS; row++) {
            const x3 = (col - COLS/2) * (CUBE_W + 10);
            const y3 = (row - ROWS/2) * (CUBE_H + 10);
            const z3 = -layer * (CUBE_D + 15);
            const appear = Math.min(1, ext * 2) * (1 - (layer - LAYERS) * 0.25);
            const dummyCube = { x: x3, y: y3, z: z3, w: CUBE_W, h: CUBE_H, d: CUBE_D,
                                glow: 0.2, glowColor: randomColor(), spawnDelay: 0, coldness: (layer - LAYERS) * 0.3 };
            drawCube3D(dummyCube, appear * 0.5, 0.2, 7);
          }
        }
      }
    }
  }

  // Scene 8: Loop Transition — camera flies back, rain begins again
  function scene8(sp, t) {
    cam.z = lerp(cam.z, 800, 0.03);
    cam.tilt = lerp(cam.tilt, 0.18, 0.03);
    cam.pan = lerp(cam.pan, 0, 0.03);
    cam.x = lerp(cam.x, 0, 0.03);
    drawBg();

    drawSceneLabel(
      'Data Continuously Flows — Nothing Stops',
      'Fresh enterprise data is always arriving. The warehouse welcomes it, stores it, and makes it available instantly.',
      sp
    );

    // Warehouse fading out
    const sorted = sortedWarehouse();
    sorted.forEach((c, idx) => {
      const glowPulse = 0.25 + Math.sin(t * 0.002 + idx * 0.3) * 0.15;
      drawCube3D(c, 0.85 * (1 - sp), glowPulse * (1 - sp), 8);
    });

    // Rain returns
    rain.forEach((p, i) => {
      if (i > sp * rain.length) return;
      p.chaos = false;
      p.vx *= 0.9;
      updateRainParticle(p, false, t);
      drawRainParticle(p, sp);
    });
  }

  // ─── Main render loop ─────────────────────────────────────────────────────
  const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];

  function tick(timestamp) {
    if (paused) { animId = requestAnimationFrame(tick); return; }
    if (!startTime) startTime = timestamp;

    const elapsed = (timestamp - startTime) % TOTAL_DURATION;
    const sceneIdx  = Math.min(Math.floor(elapsed / SCENE_DURATION), SCENES.length - 1);
    const sceneProg = (elapsed % SCENE_DURATION) / SCENE_DURATION;

    SCENES[sceneIdx](sceneProg, timestamp);

    // Crossfade into next scene during last 25%
    if (sceneProg > 0.75 && sceneIdx + 1 < SCENES.length) {
      const blend = (sceneProg - 0.75) / 0.25;
      ctx.save();
      ctx.globalAlpha = blend * 0.6;
      SCENES[sceneIdx + 1](0, timestamp);
      ctx.restore();
    }

    animId = requestAnimationFrame(tick);
  }

  // ─── Intersection Observer ────────────────────────────────────────────────
  const observer = new IntersectionObserver(
    ([entry]) => {
      paused = !entry.isIntersecting;
      if (!paused && !animId) animId = requestAnimationFrame(tick);
    },
    { threshold: 0.1 }
  );
  observer.observe(canvas);

  // ─── Mouse hover ─────────────────────────────────────────────────────────
  canvas.addEventListener('mouseenter', () => { hovering = true; });
  canvas.addEventListener('mouseleave', () => { hovering = false; });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // ─── Boot ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => { resize(); startTime = null; });
  resize();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-bigdata-canvas').forEach(initBigDataAnimation);
});
