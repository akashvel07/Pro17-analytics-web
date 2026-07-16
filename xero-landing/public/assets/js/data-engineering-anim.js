/**
 * Pro17 Analytics – Data Engineering Animation
 * Story: Raw chaotic data enters from left, gets processed by an ETL pipeline framework,
 * and outputs as a structured, clean, glowing data stream to the right.
 */
function initEngineeringAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  let particles = [];
  const PALETTE = {
    bg: '#111111',
    rawColors: ['#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#F59E0B', '#EC4899'],
    processedColor: '#10B981', // Clean green for processed data
    coreBg: 'rgba(20, 20, 30, 0.4)',
    coreBorder: 'rgba(59, 130, 246, 0.4)',
    coreGlow: 'rgba(59, 130, 246, 0.2)'
  };

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      // Start offscreen to the left
      this.x = -Math.random() * 100 - 20;
      this.y = H / 2 + (Math.random() - 0.5) * H * 0.8;
      this.size = Math.random() * 2.5 + 1;
      // Chaotic velocity
      this.vx = Math.random() * 2 + 1;
      this.vy = (Math.random() - 0.5) * 3;
      this.color = PALETTE.rawColors[Math.floor(Math.random() * PALETTE.rawColors.length)];
      this.processed = false;
      this.lane = 0; // The structured lane it will snap to
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
    }
    update() {
      this.life++;
      
      const coreStartX = W / 2 - 80;
      const coreEndX = W / 2 + 80;

      if (!this.processed && this.x > coreStartX) {
        // Entering the pipeline core
        this.processed = true;
        this.color = PALETTE.processedColor;
        this.lane = Math.floor((Math.random() - 0.5) * 5) * 20; // Snap to 5 lanes, 20px apart
        this.size = 2; // Uniform size
      }

      if (this.processed) {
        // Inside or exiting the pipeline
        this.vx += (5 - this.vx) * 0.05; // Speed up and uniform velocity
        
        // Snap to lane Y
        const targetY = H / 2 + this.lane;
        this.vy += (targetY - this.y) * 0.1;
        this.vy *= 0.8; // Dampen vertical chaos
      } else {
        // Chaotic approach
        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy += (Math.random() - 0.5) * 0.5;
        // Gravity towards center Y
        this.vy += (H / 2 - this.y) * 0.005;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x > W + 50 || this.life > this.maxLife) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      if (this.processed) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  function spawnInitial() {
    for (let i = 0; i < 150; i++) {
      let p = new Particle();
      // Fast forward some particles so it's not empty at start
      p.x = Math.random() * W;
      if (p.x > W / 2 - 80) p.processed = true;
      particles.push(p);
    }
  }

  function drawPipelineCore(timestamp) {
    const cx = W / 2;
    const cy = H / 2;
    
    // Pulsing effect
    const pulse = Math.sin(timestamp * 0.003) * 0.5 + 0.5;

    ctx.save();
    ctx.shadowBlur = 0;
    
    // Draw connecting lines
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy);
    ctx.lineTo(cx + 150, cy);
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + pulse * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw central processor node
    ctx.shadowColor = PALETTE.coreBorder;
    ctx.shadowBlur = 20 + pulse * 20;
    ctx.fillStyle = PALETTE.coreBg;
    ctx.strokeStyle = PALETTE.coreBorder;
    ctx.lineWidth = 2;

    const w = 160;
    const h = 160;
    
    // Draw hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = cx + Math.cos(angle) * (w/2);
      const py = cy + Math.sin(angle) * (w/2);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner details
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.4})`;
    ctx.stroke();
    
    // Spinning ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(timestamp * 0.001);
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    // Clear background
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    drawPipelineCore(timestamp);

    ctx.save();
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
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
  spawnInitial();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-engineering-canvas').forEach(initEngineeringAnimation);
});
