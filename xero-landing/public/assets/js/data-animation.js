/**
 * Pro17 Analytics – Data Journey Cinematic Animation
 * 7-scene storytelling canvas animation
 * 60fps · WebGL-level visual polish · Seamless loop
 */
function initDataAnimation(canvas) {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  const SCENE_DURATION = 2000;   // ms per scene
  const TOTAL_DURATION = 12000;  // ms full loop
  const MOBILE_BREAKPOINT = 768;

  const PALETTE = {
    bg1: '#111111',
    bg2: '#1a1a1a',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316',
    white: '#F8FAFC',
    navy: '#111111',
  };

  const SOURCE_LABELS = ['CRM', 'ERP', 'Sales', 'Finance', 'Marketing', 'HR', 'Support', 'APIs', 'IoT'];
  const SOURCE_COLORS = [PALETTE.blue, PALETTE.purple, PALETTE.teal, PALETTE.orange, '#EC4899', '#10B981', '#F59E0B', PALETTE.blue, PALETTE.teal];

  // ─── Canvas Setup ─────────────────────────────────────────────────────────
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, isMobile, dpr;
  let animId, startTime = null, paused = false;
  let mouseX = 0, mouseY = 0, hovering = false;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    isMobile = W < MOBILE_BREAKPOINT;
    buildScene();
  }

  // ─── Data Sources (Scene 1) ───────────────────────────────────────────────
  let sources = [];

  function buildScene() {
    sources = SOURCE_LABELS.map((label, i) => {
      const angle = (i / SOURCE_LABELS.length) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(W, H) * (isMobile ? 0.32 : 0.36);
      return {
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius,
        label,
        color: SOURCE_COLORS[i],
        angle,
        particles: [],
      };
    });
  }

  // ─── Particle Pool ────────────────────────────────────────────────────────
  const MAX_PARTICLES = () => isMobile ? 180 : 420;

  class Particle {
    constructor(sx, sy, color, scene) {
      this.reset(sx, sy, color, scene);
    }
    reset(sx, sy, color, scene) {
      this.x = sx + (Math.random() - 0.5) * 30;
      this.y = sy + (Math.random() - 0.5) * 30;
      this.ox = this.x; this.oy = this.y;
      this.tx = W / 2; this.ty = H / 2;
      this.color = color;
      this.alpha = 0;
      this.size = Math.random() * 2.5 + 1;
      this.speed = Math.random() * 0.8 + 0.4;
      this.life = 0;
      this.maxLife = Math.random() * 120 + 80;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.scene = scene;
      this.phase = 0; // 0=drift 1=converge 2=pipeline 3=ai 4=dashboard
      this.trail = [];
      return this;
    }
    update(progress, sceneProgress, sceneIdx) {
      this.life++;
      this.alpha = Math.min(1, this.life / 20) * Math.max(0, 1 - (this.life - this.maxLife + 20) / 20);

      // Movement logic varies by scene
      if (sceneIdx <= 1) {
        // Scene 1-2: drift then converge
        const pull = sceneIdx === 1 ? sceneProgress * 0.04 : 0.008;
        this.vx += (this.tx - this.x) * pull;
        this.vy += (this.ty - this.y) * pull;
        this.vx *= 0.92;
        this.vy *= 0.92;
      } else if (sceneIdx === 2) {
        // AI core: orbit sphere
        const cx = W / 2, cy = H / 2;
        const dx = this.x - cx, dy = this.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetR = 60 + Math.random() * 40;
        this.vx += (-dy / d) * 0.8 + (cx - this.x) * 0.005;
        this.vy += (dx / d) * 0.8 + (cy - this.y) * 0.005;
        this.vx *= 0.94;
        this.vy *= 0.94;
      } else {
        // Dashboard & insights: disperse to panels
        this.vx *= 0.95;
        this.vy *= 0.95;
      }

      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;
    }
    draw() {
      if (this.alpha <= 0) return;
      // Trail
      if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color + Math.floor(this.alpha * 40).toString(16).padStart(2, '0');
        ctx.lineWidth = this.size * 0.5;
        ctx.stroke();
      }
      // Core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (hovering ? 1.3 : 1), 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      grd.addColorStop(0, this.color + 'ff');
      grd.addColorStop(1, this.color + '00');
      ctx.fillStyle = grd;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  let particles = [];

  function spawnParticles(sceneIdx) {
    if (particles.length >= MAX_PARTICLES()) return;
    const count = isMobile ? 2 : 5;
    for (let i = 0; i < count; i++) {
      const src = sources[Math.floor(Math.random() * sources.length)];
      particles.push(new Particle(src.x, src.y, src.color, sceneIdx));
    }
  }

  // ─── Draw Helpers ─────────────────────────────────────────────────────────
  function drawBackground(t) {
    const grd = ctx.createLinearGradient(0, 0, W, H);
    const shift = (Math.sin(t * 0.0003) + 1) * 0.5;
    grd.addColorStop(0, PALETTE.bg1);
    grd.addColorStop(shift * 0.7, '#151515');
    grd.addColorStop(1, PALETTE.bg2);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGlassCard(x, y, w, h, label, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    // Glass fill
    const grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, 'rgba(255,255,255,0.08)');
    grd.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fillStyle = grd;
    ctx.fill();
    // Border
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Top accent
    ctx.beginPath();
    ctx.roundRect(x, y, w, 3, [10, 10, 0, 0]);
    ctx.fillStyle = color;
    ctx.fill();
    // Label
    ctx.fillStyle = PALETTE.white;
    ctx.font = `600 ${isMobile ? 9 : 11}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h * 0.6);
    // Mini bars
    const barW = w * 0.12, barGap = w * 0.04;
    const barsX = x + w / 2 - (3 * barW + 2 * barGap) / 2;
    [0.4, 0.7, 0.55].forEach((h2, bi) => {
      ctx.beginPath();
      ctx.roundRect(barsX + bi * (barW + barGap), y + h * 0.72, barW, h * 0.18 * h2, 2);
      ctx.fillStyle = color + 'cc';
      ctx.fill();
    });
    ctx.restore();
  }

  // ─── Scene Renderers ──────────────────────────────────────────────────────
  function renderScene1(sp, t) {
    sources.forEach((src, i) => {
      const floatY = Math.sin(t * 0.001 + i) * 4;
      const alpha = Math.min(1, sp * 2);
      drawGlassCard(src.x - 36, src.y - 24 + floatY, 72, 48, src.label, src.color, alpha);
      // Glow dot
      ctx.beginPath();
      ctx.arc(src.x, src.y + floatY + 30, 3, 0, Math.PI * 2);
      ctx.fillStyle = src.color;
      ctx.fill();
    });
  }

  function renderScene2(sp, t) {
    // Connection lines
    ctx.save();
    ctx.globalAlpha = sp * 0.4;
    particles.slice(0, 60).forEach((p, i) => {
      if (i % 4 !== 0) return;
      const near = particles.find((q, qi) => qi !== i && Math.hypot(q.x - p.x, q.y - p.y) < 80);
      if (!near) return;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(near.x, near.y);
      const grd = ctx.createLinearGradient(p.x, p.y, near.x, near.y);
      grd.addColorStop(0, p.color + '99');
      grd.addColorStop(1, near.color + '00');
      ctx.strokeStyle = grd;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
    ctx.restore();

    // Central node glow
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80 * sp);
    grd.addColorStop(0, PALETTE.blue + '44');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderScene4(sp, t) {
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.18;
    // Outer pulse rings
    [1.8, 1.5, 1.2].forEach((scale, ri) => {
      const ringAlpha = (Math.sin(t * 0.002 - ri * 0.7) + 1) * 0.5 * 0.15 * sp;
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = PALETTE.blue + Math.floor(ringAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // Sphere glow
    const sgrd = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    sgrd.addColorStop(0, 'rgba(139,92,246,0.9)');
    sgrd.addColorStop(0.4, 'rgba(59,130,246,0.6)');
    sgrd.addColorStop(0.8, 'rgba(20,184,166,0.3)');
    sgrd.addColorStop(1, 'rgba(5,8,22,0)');
    ctx.save();
    ctx.globalAlpha = sp;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = sgrd;
    ctx.fill();
    // Neural paths
    const nodeCount = isMobile ? 6 : 10;
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const a = (i / nodeCount) * Math.PI * 2 + t * 0.001;
      const nr = r * (0.4 + (i % 3) * 0.2);
      return { x: cx + Math.cos(a) * nr, y: cy + Math.sin(a) * nr };
    });
    nodes.forEach((n, i) => {
      nodes.slice(i + 1).forEach(m => {
        if (Math.random() > 0.5) return;
        const pulse = (Math.sin(t * 0.004 + i) + 1) * 0.5;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = PALETTE.purple + Math.floor(pulse * 80).toString(16).padStart(2, '0');
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.white + 'cc';
      ctx.fill();
    });
    ctx.restore();
  }

  function renderScene5(sp, t) {
    const cards = [
      { x: W * 0.12, y: H * 0.15, w: W * 0.28, h: H * 0.35, type: 'line', title: 'Revenue Trends' },
      { x: W * 0.62, y: H * 0.12, w: W * 0.26, h: H * 0.3, type: 'bar', title: 'User Acquisition' },
      { x: W * 0.35, y: H * 0.55, w: W * 0.3, h: H * 0.32, type: 'kpi', title: 'Key Metrics' },
    ];
    cards.forEach((c, ci) => {
      const cAlpha = Math.min(1, Math.max(0, (sp - ci * 0.15) * 3));
      ctx.save();
      ctx.globalAlpha = cAlpha;
      // Glass panel
      const grd = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
      grd.addColorStop(0, 'rgba(255,255,255,0.07)');
      grd.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 14);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Card Title
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `600 ${isMobile ? 10 : 12}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(c.title, c.x + 16, c.y + 24);

      if (c.type === 'line') {
        // Animated line chart
        const pts = 12;
        const values = [0.3, 0.45, 0.35, 0.55, 0.5, 0.7, 0.65, 0.8, 0.72, 0.88, 0.82, 0.95];
        const chartX = c.x + 16, chartY = c.y + c.h - 24, chartW = c.w - 32, chartH = c.h - 60;
        ctx.beginPath();
        values.forEach((v, i) => {
          const px2 = chartX + (i / (pts - 1)) * chartW;
          const py2 = chartY - v * chartH * sp;
          i === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
        });
        const lgrd = ctx.createLinearGradient(chartX, 0, chartX + chartW, 0);
        lgrd.addColorStop(0, PALETTE.blue);
        lgrd.addColorStop(1, PALETTE.teal);
        ctx.strokeStyle = lgrd;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else if (c.type === 'bar') {
        const bars2 = 6;
        const bW = (c.w - 32) / bars2 - 6;
        const bVals = [0.5, 0.7, 0.4, 0.9, 0.65, 0.8];
        bVals.forEach((v, i) => {
          const bX = c.x + 16 + i * ((c.w - 32) / bars2);
          const bH = v * (c.h - 50) * sp;
          const bgrd = ctx.createLinearGradient(0, c.y + c.h - 20 - bH, 0, c.y + c.h - 20);
          bgrd.addColorStop(0, PALETTE.purple);
          bgrd.addColorStop(1, PALETTE.blue + '66');
          ctx.beginPath();
          ctx.roundRect(bX, c.y + c.h - 20 - bH, bW, bH, 4);
          ctx.fillStyle = bgrd;
          ctx.fill();
        });
      } else {
        // KPI card
        const kpis = ['+24%', '9.2k', '$1.4M'];
        kpis.forEach((v, i) => {
          ctx.fillStyle = [PALETTE.teal, PALETTE.blue, PALETTE.purple][i];
          ctx.font = `700 ${isMobile ? 14 : 18}px Inter, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(v, c.x + 20 + i * c.w / 3, c.y + c.h * 0.55);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = `500 ${isMobile ? 8 : 10}px Inter, sans-serif`;
          ctx.fillText(['GROWTH', 'USERS', 'REVENUE'][i], c.x + 20 + i * c.w / 3, c.y + c.h * 0.72);
        });
      }
      ctx.restore();
    });
  }

  function renderScene6(sp, t) {
    // Expanding insight waves
    for (let i = 0; i < 3; i++) {
      const waveR = 60 + i * 70 + (t * 0.04 % 60);
      const wAlpha = (1 - (waveR - 60) / 210) * 0.3 * sp;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, waveR, 0, Math.PI * 2);
      ctx.strokeStyle = PALETTE.teal + Math.floor(wAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Floating KPI badges
    const badges = ['+47%', '98.2', '$2.8M', '↑32'];
    badges.forEach((b, i) => {
      const angle = (i / badges.length) * Math.PI * 2 + t * 0.0005;
      const orbitR = Math.min(W, H) * 0.3;
      const bx = W / 2 + Math.cos(angle) * orbitR;
      const by = H / 2 + Math.sin(angle) * orbitR;
      const bAlpha = Math.min(1, sp * 2);
      ctx.save();
      ctx.globalAlpha = bAlpha;
      ctx.beginPath();
      ctx.roundRect(bx - 28, by - 14, 56, 28, 8);
      ctx.fillStyle = 'rgba(20,184,166,0.15)';
      ctx.fill();
      ctx.strokeStyle = PALETTE.teal + '66';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = PALETTE.teal;
      ctx.font = `700 ${isMobile ? 10 : 13}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(b, bx, by + 5);
      ctx.restore();
    });
  }

  function renderScene7(sp, t) {
    // Dissolve + re-emergence
    const dissolveAlpha = 1 - sp;
    ctx.save();
    ctx.globalAlpha = dissolveAlpha;
    sources.forEach((src, i) => {
      const a = Math.min(1, sp * 4);
      const grd = ctx.createRadialGradient(src.x, src.y, 0, src.x, src.y, 40 * a);
      grd.addColorStop(0, src.color + '55');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(src.x, src.y, 40 * a, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ─── Main Loop ────────────────────────────────────────────────────────────
  const SCENE_RENDERERS = [
    renderScene1,
    renderScene2,
    renderScene4,
    renderScene5,
    renderScene6,
    renderScene7,
  ];

  function tick(timestamp) {
    if (paused) { animId = requestAnimationFrame(tick); return; }
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) % TOTAL_DURATION;
    const globalProgress = elapsed / TOTAL_DURATION;
    const sceneIdx = Math.floor(elapsed / SCENE_DURATION);
    const sceneProgress = (elapsed % SCENE_DURATION) / SCENE_DURATION;

    // Camera offset on hover
    const camX = hovering ? (mouseX - W / 2) * 0.015 : 0;
    const camY = hovering ? (mouseY - H / 2) * 0.015 : 0;

    ctx.save();
    ctx.translate(camX, camY);

    drawBackground(timestamp);
    spawnParticles(sceneIdx);

    // Update & cull particles
    particles = particles.filter(p => p.life < p.maxLife);
    particles.forEach(p => p.update(globalProgress, sceneProgress, sceneIdx));

    // Draw particles (below scene elements)
    ctx.save();
    particles.forEach(p => p.draw());
    ctx.restore();

    // Scene-specific elements
    const renderer = SCENE_RENDERERS[Math.min(sceneIdx, SCENE_RENDERERS.length - 1)];
    if (renderer) renderer(sceneProgress, timestamp);

    // Crossfade next scene in last 0.3s
    if (sceneProgress > 0.7 && sceneIdx < SCENE_RENDERERS.length - 1) {
      const nextProgress = (sceneProgress - 0.7) / 0.3;
      const nextRenderer = SCENE_RENDERERS[sceneIdx + 1];
      if (nextRenderer) {
        ctx.save();
        ctx.globalAlpha = nextProgress;
        nextRenderer(0, timestamp);
        ctx.restore();
      }
    }

    ctx.restore();

    animId = requestAnimationFrame(tick);
  }

  // ─── Intersection Observer (pause off-screen) ─────────────────────────────
  const observer = new IntersectionObserver(
    ([entry]) => { paused = !entry.isIntersecting; },
    { threshold: 0.1 }
  );
  observer.observe(canvas);

  // ─── Hover Interaction ────────────────────────────────────────────────────
  canvas.addEventListener('mouseenter', () => { hovering = true; });
  canvas.addEventListener('mouseleave', () => { hovering = false; });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // ─── Boot ─────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    resize();
    startTime = null;
  });

  resize();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-anim-canvas').forEach(initDataAnimation);
});
