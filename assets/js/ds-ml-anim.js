/**
 * Pro17 Analytics – Data Science & ML Animation
 * Story: Neural network layers processing data, converging into a central prediction node.
 */
function initDsMlAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  
  const PALETTE = {
    bg: '#161616',
    nodeDim: 'rgba(145, 26, 28, 0.3)', // Dim Crimson
    nodeActive: '#911A1C', // Brand Crimson
    nodeOutput: '#10B981', // Green for final prediction
    linkDim: 'rgba(255, 255, 255, 0.05)',
    linkActive: 'rgba(145, 26, 28, 0.8)' // Crimson link
  };

  const layers = [
    { count: 6, x: 0.18 },
    { count: 8, x: 0.38 },
    { count: 5, x: 0.58 },
    { count: 1, x: 0.78 } // Output node
  ];

  let nodes = [];
  let links = [];
  let pulses = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    buildNetwork();
  }

  function buildNetwork() {
    nodes = [];
    links = [];
    
    // Create nodes
    layers.forEach((layer, lIdx) => {
      const spacingY = H / (layer.count + 1);
      for (let i = 0; i < layer.count; i++) {
        nodes.push({
          id: `${lIdx}-${i}`,
          layer: lIdx,
          x: W * layer.x,
          y: spacingY * (i + 1),
          activation: 0,
          isOutput: (lIdx === layers.length - 1)
        });
      }
    });

    // Create links between adjacent layers
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayerNodes = nodes.filter(n => n.layer === l);
      const nextLayerNodes = nodes.filter(n => n.layer === l + 1);
      
      currentLayerNodes.forEach(source => {
        nextLayerNodes.forEach(target => {
          links.push({ source, target, weight: Math.random() });
        });
      });
    }
  }

  function spawnPulse() {
    const inputNodes = nodes.filter(n => n.layer === 0);
    const startNode = inputNodes[Math.floor(Math.random() * inputNodes.length)];
    
    // Find a path to output
    let path = [startNode];
    let current = startNode;
    
    while (current.layer < layers.length - 1) {
      const possibleLinks = links.filter(l => l.source === current);
      // Bias towards higher weights
      possibleLinks.sort((a, b) => b.weight - a.weight);
      const nextLink = possibleLinks[Math.floor(Math.random() * Math.min(3, possibleLinks.length))];
      path.push(nextLink.target);
      current = nextLink.target;
    }
    
    pulses.push({
      path,
      currentSegment: 0,
      progress: 0,
      speed: Math.random() * 0.02 + 0.02
    });
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    // Fade node activations
    nodes.forEach(n => {
      n.activation = Math.max(0, n.activation - 0.02);
    });

    // Spawn new pulses randomly
    if (Math.random() < 0.1) spawnPulse();

    // Draw links
    ctx.lineWidth = 1;
    links.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.strokeStyle = PALETTE.linkDim;
      ctx.stroke();
    });

    // Update and draw pulses
    ctx.shadowBlur = 10;
    ctx.shadowColor = PALETTE.nodeActive;
    ctx.lineWidth = 3;

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;
      
      const source = p.path[p.currentSegment];
      const target = p.path[p.currentSegment + 1];
      
      if (p.progress >= 1) {
        p.progress = 0;
        p.currentSegment++;
        target.activation = 1; // Light up node
        
        if (p.currentSegment >= p.path.length - 1) {
          pulses.splice(i, 1);
          continue;
        }
      }
      
      // Draw pulse on line
      const currSource = p.path[p.currentSegment];
      const currTarget = p.path[p.currentSegment + 1];
      if (currTarget) {
        const px = currSource.x + (currTarget.x - currSource.x) * p.progress;
        const py = currSource.y + (currTarget.y - currSource.y) * p.progress;
        
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        // Draw active link trail
        ctx.beginPath();
        ctx.moveTo(currSource.x, currSource.y);
        ctx.lineTo(px, py);
        ctx.strokeStyle = PALETTE.linkActive;
        ctx.stroke();
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.isOutput ? 12 : 6, 0, Math.PI * 2);
      
      if (n.isOutput) {
        ctx.fillStyle = PALETTE.nodeOutput;
        ctx.shadowColor = PALETTE.nodeOutput;
        ctx.shadowBlur = n.activation * 30 + 10; // Always glow a bit
      } else {
        ctx.fillStyle = (n.activation > 0.1) ? PALETTE.nodeActive : PALETTE.nodeDim;
        ctx.shadowBlur = n.activation * 15;
      }
      
      ctx.fill();
      
      // Shockwave for output node
      if (n.isOutput && n.activation > 0.5) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12 + (1 - n.activation) * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${n.activation})`;
        ctx.stroke();
      }
    });
    
    ctx.shadowBlur = 0; // reset

    // Draw text labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    
    // Left side: Data driven insights
    ctx.save();
    ctx.translate(W * 0.05, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.5;
    ctx.fillText('DATA DRIVEN INSIGHTS', 0, 0);
    ctx.restore();

    // Right side: Better decisions (next to output node)
    ctx.textAlign = 'left';
    ctx.globalAlpha = 0.8;
    ctx.fillText('BETTER DECISIONS', W * 0.78 + 25, H / 2);

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
  document.querySelectorAll('.pro17-dsml-canvas').forEach(initDsMlAnimation);
});
