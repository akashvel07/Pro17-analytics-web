/**
 * Pro17 Analytics – Data Visualization Animation
 * Story: Chaotic particles morph into structured charts (Line graph, Bar chart).
 */
function initVizAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  
  const PALETTE = {
    bg: '#111111',
    dot1: '#3B82F6',
    dot2: '#10B981',
    dot3: '#F59E0B'
  };

  const NUM_PARTICLES = 400;
  let particles = [];
  
  // 0: Chaos, 1: Line Chart, 2: Bar Chart
  let currentForm = 0;
  let formProgress = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    calculateTargets();
  }

  function calculateTargets() {
    // Phase 0: Chaos
    // Phase 1: Line chart
    // Phase 2: Bar chart
    
    // Sort particles to assign them to bars/lines smoothly
    particles.forEach((p, i) => {
      // Chaos target
      p.targetChaos = {
        x: W/2 + (Math.random() - 0.5) * 400,
        y: H/2 + (Math.random() - 0.5) * 400
      };
      
      // Line chart target
      const lineX = W * 0.1 + (i / NUM_PARTICLES) * (W * 0.8);
      const lineY = H / 2 + Math.sin(i * 0.05) * 100 + Math.cos(i * 0.02) * 50;
      p.targetLine = { x: lineX, y: lineY };
      
      // Bar chart target (10 bars)
      const numBars = 10;
      const barIndex = i % numBars;
      const barWidth = (W * 0.7) / numBars - 10;
      const barSpacing = (W * 0.7) / numBars;
      
      // Fixed heights for the 10 bars to create a crisp chart shape
      const barHeights = [100, 160, 120, 220, 180, 260, 150, 290, 210, 170];
      const height = barHeights[barIndex];
      
      const barX = W * 0.15 + barIndex * barSpacing + Math.random() * barWidth;
      const barY = H * 0.8 - Math.random() * height;
      p.targetBar = { x: barX, y: barY };
    });
  }

  function initParticles() {
    for (let i = 0; i < NUM_PARTICLES; i++) {
      let color = PALETTE.dot1;
      if (i % 3 === 1) color = PALETTE.dot2;
      if (i % 3 === 2) color = PALETTE.dot3;
      
      particles.push({
        x: W/2,
        y: H/2,
        color: color,
        size: Math.random() * 2 + 1.5,
        targetChaos: {x: 0, y: 0},
        targetLine: {x: 0, y: 0},
        targetBar: {x: 0, y: 0}
      });
    }
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    // Timeline control (12 seconds loop)
    const loopTime = timestamp % 12000;
    if (loopTime < 3000) {
      currentForm = 0; // Chaos
    } else if (loopTime < 7000) {
      currentForm = 1; // Line
    } else {
      currentForm = 2; // Bar
    }

    ctx.save();
    particles.forEach(p => {
      let targetX, targetY;
      
      if (currentForm === 0) {
        // Move around randomly in chaos
        targetX = p.targetChaos.x + Math.sin(timestamp * 0.001 + p.size) * 50;
        targetY = p.targetChaos.y + Math.cos(timestamp * 0.001 + p.size) * 50;
      } else if (currentForm === 1) {
        // Line chart flows slightly
        targetX = p.targetLine.x;
        targetY = p.targetLine.y + Math.sin(timestamp * 0.002 + p.x * 0.01) * 20;
      } else {
        // Bar chart is solid
        targetX = p.targetBar.x;
        targetY = p.targetBar.y;
      }
      
      // Ease towards target
      p.x += (targetX - p.x) * 0.05;
      p.y += (targetY - p.y) * 0.05;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = (currentForm !== 0) ? 10 : 2; // Glow more when structured
      ctx.fill();
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
  
  // Need to set dimensions before init
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  
  initParticles();
  resize(); // Recalculates targets properly
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-viz-canvas').forEach(initVizAnimation);
});
