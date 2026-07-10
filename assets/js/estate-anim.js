/**
 * Pro17 Analytics – Data & Analytics Estate Animation
 * Story: Isometric 3D grid with glowing data blocks (estate) rising and connecting.
 */
function initEstateAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  
  const PALETTE = {
    bg: '#161616',
    grid: 'rgba(145, 26, 28, 0.15)', // Brand color with opacity
    blockTop: '#b52123', // Lighter tint of brand
    blockLeft: '#911A1C', // Primary brand color (Deep Crimson)
    blockRight: '#6e1315', // Darker shade of brand
    highlight: '#e8363a', // Bright tint
    pulse: '#ff4d51' // Very bright highlight
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

  // Isometric projection helper
  function iso(x, y, z) {
    const angle = Math.PI / 6; // 30 degrees
    const isoX = (x - y) * Math.cos(angle);
    const isoY = (x + y) * Math.sin(angle) - z;
    return { x: W / 2 + isoX, y: H / 2 + 40 + isoY }; // Offset to visually center
  }

  // Draw an isometric block
  function drawBlock(ctx, x, y, z, size, height, alpha, highlightProgress = 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Bottom face isn't needed if it's opaque, but we draw top, left, right.
    const p1 = iso(x, y, z + height); // Top center
    const p2 = iso(x + size, y, z + height); // Top right
    const p3 = iso(x + size, y + size, z + height); // Top bottom
    const p4 = iso(x, y + size, z + height); // Top left

    const b2 = iso(x + size, y, z); // Bottom right
    const b3 = iso(x + size, y + size, z); // Bottom bottom
    const b4 = iso(x, y + size, z); // Bottom left

    // Highlight effect
    const colorTop = highlightProgress > 0 ? PALETTE.highlight : PALETTE.blockTop;
    const colorLeft = PALETTE.blockLeft;
    const colorRight = PALETTE.blockRight;

    // Top face
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = colorTop;
    if (highlightProgress > 0) {
      ctx.shadowColor = PALETTE.highlight;
      ctx.shadowBlur = highlightProgress * 15;
    }
    ctx.fill();
    ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fillStyle = colorLeft;
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y);
    ctx.closePath();
    ctx.fillStyle = colorRight;
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  const gridSize = 40;
  const gridRows = 8;
  const gridCols = 8;
  let blocks = [];

  function initBlocks() {
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        // Only some spots have blocks
        if (Math.random() > 0.4) {
          blocks.push({
            r, c,
            x: (c - gridCols/2) * gridSize,
            y: (r - gridRows/2) * gridSize,
            targetHeight: Math.random() * 80 + 20,
            currentHeight: 0,
            delay: Math.random() * 2000,
            highlightOffset: Math.random() * 5000
          });
        }
      }
    }
    // Sort by render order (back to front) -> lowest x and lowest y first
    blocks.sort((a, b) => (b.x + b.y) - (a.x + a.y));
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw grid floor
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= gridRows; i++) {
      const start = iso(-gridCols/2 * gridSize, (i - gridRows/2) * gridSize, 0);
      const end = iso(gridCols/2 * gridSize, (i - gridRows/2) * gridSize, 0);
      ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
    }
    for (let i = 0; i <= gridCols; i++) {
      const start = iso((i - gridCols/2) * gridSize, -gridRows/2 * gridSize, 0);
      const end = iso((i - gridCols/2) * gridSize, gridRows/2 * gridSize, 0);
      ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
    }
    ctx.stroke();

    // Draw blocks
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;

    blocks.forEach(b => {
      // Rise animation
      if (timestamp > b.delay) {
        b.currentHeight += (b.targetHeight - b.currentHeight) * 0.05;
      }
      
      // Highlight pulsing
      const pulseTime = (timestamp + b.highlightOffset) % 4000;
      let highlight = 0;
      if (pulseTime < 500) {
        highlight = pulseTime / 500;
      } else if (pulseTime < 1000) {
        highlight = 1 - ((pulseTime - 500) / 500);
      }

      if (b.currentHeight > 1) {
        drawBlock(ctx, b.x, b.y, 0, gridSize * 0.8, b.currentHeight, Math.min(1, b.currentHeight / 10), highlight);
      }
    });

    animId = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    ([entry]) => { paused = !entry.isIntersecting; },
    { threshold: 0.1 }
  );
  observer.observe(canvas);

  window.addEventListener('resize', resize);
  
  resize();
  initBlocks();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-estate-canvas').forEach(initEstateAnimation);
});
