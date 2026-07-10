/**
 * Pro17 Analytics – Platform Migration Animation
 * Theme: Conventional Business to Digitalization. 
 * Pro17 Core shoots targeted laser beams to digitize physical analog files on demand.
 */
function initMigrationAnimation(canvas) {
  'use strict';

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  let animId, paused = false;
  
  const PALETTE = {
    bg: '#111111',
    analogBorder: '#555555',
    analogFill: '#333333',
    analogLine: '#777777',
    digitalStream: '#00FF40', // Hacker Green
    digitalCore: '#911A1C', // Brand Crimson
    digitalNode: '#10B981'
  };

  // Load Pro17 Logo
  const logoImg = new Image();
  logoImg.src = 'https://pro17analytics.com/assets/images/pro17analytics-logo.png';

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  // Draw analog environment (Left side: Conventional Business)
  function drawAnalogBase(cx, cy, timestamp) {
    ctx.save();
    ctx.translate(cx, cy);
    
    // Static, rigid background structure
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    for (let i = -80; i <= 80; i += 40) {
      ctx.beginPath();
      ctx.moveTo(-60, i);
      ctx.lineTo(60, i);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Draw digital network and Pro17 Core (Right side)
  function drawDigitalNetwork(cx, cy, timestamp) {
    ctx.save();
    ctx.translate(cx, cy);
    
    // Glowing network mesh (rotates independently)
    ctx.save();
    ctx.rotate(timestamp * 0.0005);
    ctx.strokeStyle = 'rgba(145, 26, 28, 0.4)';
    ctx.lineWidth = 1;
    
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.sin(timestamp * 0.001 + i) * 0.2;
      const r = 60 + Math.sin(timestamp * 0.002 + i) * 15;
      nodes.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    
    // Connect nodes
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
      }
    }
    ctx.stroke();
    
    // Draw glowing data nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.digitalStream;
      ctx.shadowColor = PALETTE.digitalStream;
      ctx.shadowBlur = 10;
      ctx.fill();
    });
    ctx.restore(); // end rotating mesh
    
    // Central digital core background
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(145, 26, 28, 0.2)';
    ctx.shadowColor = PALETTE.digitalCore;
    ctx.shadowBlur = 30 + Math.sin(timestamp * 0.005) * 15;
    ctx.fill();

    // PRO17 Logo inside the circle
    if (logoImg.complete && logoImg.naturalWidth !== 0) {
      ctx.shadowBlur = 0;
      // Draw logo scaled to fit inside the core
      const logoW = 50;
      const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
      
      // Apply filter to make the logo completely white
      ctx.filter = 'brightness(0) invert(1)';
      ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
      ctx.filter = 'none'; // Reset filter
    }

    ctx.restore();
  }

  // Active laser beams
  let lasers = [];

  function drawLasers(ctx) {
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      ctx.save();
      
      // Outer glow of laser
      ctx.beginPath();
      ctx.moveTo(l.startX, l.startY);
      ctx.lineTo(l.endX, l.endY);
      ctx.strokeStyle = `rgba(0, 255, 64, ${l.life})`; // Hacker Green
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00FF40';
      ctx.shadowBlur = 15;
      ctx.stroke();
      
      // Inner bright core of laser
      ctx.beginPath();
      ctx.moveTo(l.startX, l.startY);
      ctx.lineTo(l.endX, l.endY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${l.life})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.stroke();
      
      // Impact flash
      ctx.beginPath();
      ctx.arc(l.endX, l.endY, (1 - l.life) * 15 + 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 64, ${l.life})`;
      ctx.fill();

      ctx.restore();

      l.life -= 0.1; // Sharp, quick zap
      if (l.life <= 0) lasers.splice(i, 1);
    }
  }

  // The migrating entities
  let entities = [];
  function initEntities() {
    for (let i = 0; i < 12; i++) {
      entities.push(createEntity());
      entities[i].x = Math.random() * W; 
      if (entities[i].x > W / 2) entities[i].isDigital = true;
    }
  }

  function createEntity() {
    return {
      x: -50 - Math.random() * 150,
      y: H / 2 + (Math.random() - 0.5) * 120,
      speed: Math.random() * 1.5 + 0.8,
      rotation: Math.random() * 0.05 - 0.025,
      angle: Math.random() * Math.PI,
      isDigital: false,
      particles: []
    };
  }

  function tick(timestamp) {
    if (paused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, W, H);

    const leftX = W * 0.2;
    const rightX = W * 0.8;
    // Digital conversion threshold
    const midX = W * 0.45; 

    drawAnalogBase(leftX, H / 2, timestamp);
    drawDigitalNetwork(rightX, H / 2, timestamp);
    
    // Draw lasers behind entities
    drawLasers(ctx);

    // Update and draw entities
    entities.forEach(ent => {
      ent.x += ent.speed;
      ent.angle += ent.rotation;

      // The Transformation: Fire laser and convert
      if (!ent.isDigital && ent.x > midX) {
        ent.isDigital = true;
        
        // Fire a laser from the Pro17 Core to the entity
        lasers.push({
          startX: rightX,
          startY: H / 2,
          endX: ent.x,
          endY: ent.y,
          life: 1.0
        });

        // Burst into digital particles (binary code)
        for(let i = 0; i < 8; i++) {
          ent.particles.push({
            offsetX: (Math.random() - 0.5) * 20,
            offsetY: (Math.random() - 0.5) * 20,
            vx: Math.random() * 2 + 1, // Burst forward towards core
            vy: (Math.random() - 0.5) * 2,
            char: Math.random() > 0.5 ? '1' : '0',
            alpha: 1
          });
        }
      }

      ctx.save();
      ctx.translate(ent.x, ent.y);
      
      if (!ent.isDigital) {
        // Draw physical, conventional file/paper
        ctx.rotate(ent.angle);
        ctx.fillStyle = PALETTE.analogFill;
        
        // Subtle glow as it nears the threshold
        if (ent.x > leftX) {
          const glowIntensity = (ent.x - leftX) / (midX - leftX);
          ctx.shadowColor = PALETTE.digitalStream;
          ctx.shadowBlur = glowIntensity * 5;
        }

        ctx.strokeStyle = PALETTE.analogBorder;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.rect(-12, -16, 24, 32);
        ctx.fill();
        ctx.stroke();
        
        // Lines of text
        ctx.strokeStyle = PALETTE.analogLine;
        ctx.beginPath();
        ctx.moveTo(-6, -8); ctx.lineTo(6, -8);
        ctx.moveTo(-6, 0); ctx.lineTo(8, 0);
        ctx.moveTo(-6, 8); ctx.lineTo(4, 8);
        ctx.stroke();
        
      } else {
        // Draw glowing digital binary burst flying to core
        ctx.fillStyle = PALETTE.digitalStream;
        ctx.font = '14px monospace';
        ctx.shadowColor = PALETTE.digitalStream;
        ctx.shadowBlur = 10;
        
        ent.particles.forEach(p => {
          p.offsetX += p.vx;
          p.offsetY += p.vy;
          
          // Magnetic pull towards the digital network core
          const distToCoreX = (rightX - (ent.x + p.offsetX));
          const distToCoreY = ((H / 2) - (ent.y + p.offsetY));
          
          p.vx += distToCoreX * 0.0008; // Stronger pull
          p.vy += distToCoreY * 0.0008;
          
          // Fade out as they get absorbed
          p.alpha -= 0.006;
          
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillText(p.char, p.offsetX, p.offsetY);
        });
      }
      ctx.restore();

      // Reset entity once it's absorbed
      if (ent.x > rightX + 50 || (ent.isDigital && ent.particles[0] && ent.particles[0].alpha <= 0)) {
        Object.assign(ent, createEntity());
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
  initEntities();
  animId = requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pro17-migration-canvas').forEach(initMigrationAnimation);
});
