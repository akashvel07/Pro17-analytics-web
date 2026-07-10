/**
 * Pro17 Analytics – Data Security Animation
 * Story: A glowing central core protected by rotating shields, deflecting threats.
 */
function initSecurityAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  
  const PALETTE = {
    bg: '#161616',
    core: '#10B981', // Green for secure
    shieldGlow: 'rgba(16, 185, 129, 0.3)',
    shieldLine: '#10B981',
    threat: '#EF4444', // Red for threats
    dust: '#F87171'
  };

  let threats = [];
  let dustParticles = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function spawnThreat() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(W, H) * 0.6;
    threats.push({
      x: W/2 + Math.cos(angle) * distance,
      y: H/2 + Math.sin(angle) * distance,
      vx: -Math.cos(angle) * (Math.random() * 2 + 2),
      vy: -Math.sin(angle) * (Math.random() * 2 + 2),
      active: true
    });
  }

  function createDust(x, y) {
    for (let i = 0; i < 15; i++) {
      dustParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        maxLife: Math.random() * 30 + 20
      });
    }
  }

  function drawShieldAndCore(cx, cy, timestamp) {
    ctx.save();
    ctx.translate(cx, cy);

    // Pulse
    const pulse = Math.sin(timestamp * 0.005) * 0.5 + 0.5;

    // Outer rotating hex shield
    ctx.save();
    ctx.rotate(timestamp * 0.0005);
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = Math.cos(angle) * 120;
      const py = Math.sin(angle) * 120;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Inner rotating dashed ring (counter rotation)
    ctx.save();
    ctx.rotate(-timestamp * 0.0008);
    ctx.strokeStyle = PALETTE.shieldLine;
    ctx.setLineDash([15, 20]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Solid inner core
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.core;
    ctx.shadowColor = PALETTE.core;
    ctx.shadowBlur = 40 + pulse * 20;
    ctx.fill();

    // Data icon (white database)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.save();
    ctx.translate(-12, -12); // Center the 24x24 icon
    const dbPath = new Path2D("M12 3c-4.418 0-8 1.791-8 4v10c0 2.209 3.582 4 8 4s8-1.791 8-4V7c0-2.209-3.582-4-8-4zm0 4.5c-3.314 0-6-1.119-6-2.5S8.686 2.5 12 2.5s6 1.119 6 2.5-2.686 2.5-6 2.5zm6 2.5c0 1.381-2.686 2.5-6 2.5s-6-1.119-6-2.5V8.268c1.545 1.056 3.648 1.732 6 1.732s4.455-.676 6-1.732V10zm0 5c0 1.381-2.686 2.5-6 2.5s-6-1.119-6-2.5v-1.732c1.545 1.056 3.648 1.732 6 1.732s4.455-.676 6-1.732V15z");
    ctx.fill(dbPath);
    ctx.restore();

    ctx.restore();
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const shieldRadius = 120; // Approximate collision radius

    drawShieldAndCore(cx, cy, timestamp);

    // Spawn threats randomly
    if (Math.random() < 0.05) spawnThreat();

    // Update and draw threats
    ctx.save();
    for (let i = threats.length - 1; i >= 0; i--) {
      const t = threats[i];
      if (!t.active) continue;

      t.x += t.vx;
      t.y += t.vy;

      // Check collision with shield
      const dist = Math.hypot(t.x - cx, t.y - cy);
      if (dist < shieldRadius + 10) {
        // Boom
        createDust(t.x, t.y);
        threats.splice(i, 1);
        
        // Flash shield
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
        ctx.restore();
        continue;
      }

      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.threat;
      ctx.shadowColor = PALETTE.threat;
      ctx.shadowBlur = 15;
      ctx.fill();
    }
    ctx.restore();

    // Update and draw dust
    ctx.save();
    for (let i = dustParticles.length - 1; i >= 0; i--) {
      const d = dustParticles[i];
      d.x += d.vx;
      d.y += d.vy;
      d.life++;
      
      const alpha = 1 - (d.life / d.maxLife);
      if (alpha <= 0) {
        dustParticles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248, 113, 113, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();

    animId = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    ([entry]) => { paused = !entry.isIntersecting; },
    { threshold: 0.1 }
  );
  observer.observe(canvas);

  window.addEventListener('resize', resize);
  
  resize();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-security-canvas').forEach(initSecurityAnimation);
});
