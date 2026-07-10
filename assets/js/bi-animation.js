/**
 * Pro17 Analytics — BI & Advanced Data Analysis
 * Clean 3-Column Intelligence Flow Animation
 * LEFT: Raw Business Metrics → CENTER: AI Analysis Hub → RIGHT: Key Insights
 * Background: #161616 | 60fps | Fully readable
 */
(function () {
  'use strict';

  const SCENE_DUR = 2600;
  const N_SCENES  = 8;
  const TOTAL_DUR = SCENE_DUR * N_SCENES;
  const BG        = '#161616';

  const C = {
    blue:    '#3B82F6',
    purple:  '#8B5CF6',
    emerald: '#10B981',
    amber:   '#F59E0B',
    danger:  '#EF4444',
    teal:    '#06B6D4',
    white:   '#F1F5F9',
    muted:   '#64748B',
    cardBg:  'rgba(22,28,48,0.92)',
    border:  'rgba(255,255,255,0.08)',
  };

  // ─── Source metrics (left column) ─────────────────────────────────────────
  const SOURCES = [
    { label: 'Sales Revenue',      value: '$4.2M',    change: '+18%', color: C.emerald, icon: '↑', trend: [30,45,38,60,52,75,80] },
    { label: 'Marketing Reach',    value: '94,000',   change: '+23%', color: C.blue,    icon: '◎', trend: [20,35,30,55,48,65,70] },
    { label: 'Customer Sat.',      value: '4.8 / 5',  change: '+0.3', color: C.teal,    icon: '★', trend: [60,58,62,65,70,72,78] },
    { label: 'Inventory Alert',    value: '⚠ 12%',    change: '-8%',  color: C.danger,  icon: '!', trend: [80,75,65,55,45,38,32] },
    { label: 'Operational Cost',   value: '$1.1M',    change: '-5%',  color: C.amber,   icon: '⚙', trend: [70,72,68,65,60,58,55] },
    { label: 'HR Retention',       value: '96%',      change: '+2%',  color: C.purple,  icon: '♦', trend: [80,82,84,86,86,88,90] },
  ];

  // ─── Key insights (right column) ──────────────────────────────────────────
  const INSIGHTS = [
    { label: 'Revenue Opportunity', desc: 'Expand to 2 new markets', value: '+$820K',  color: C.emerald, icon: '▲', priority: 'HIGH'   },
    { label: 'Inventory Risk',      desc: 'Restock before shortage', value: 'URGENT',  color: C.danger,  icon: '⚠', priority: 'URGENT' },
    { label: 'Cost Optimisation',   desc: 'Reduce ops by 12%',       value: '-$132K',  color: C.amber,   icon: '↓', priority: 'MED'    },
  ];

  function init(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, dpr, isMobile;
    let animId, startTime = null, paused = false;

    // Animation state
    let srcCards  = [];
    let insCards  = [];
    let particles = [];
    let hubRot    = 0;
    let hubPulse  = 0;

    // Per-element animated values
    let srcAlpha   = SOURCES.map(() => 0);
    let insAlpha   = INSIGHTS.map(() => 0);
    let insScale   = INSIGHTS.map(() => 0.8);
    let insHighlight = INSIGHTS.map(() => 0);
    let lineAlpha  = 0;
    let hubAlpha   = 0;
    let hubGlow    = 0;
    let scanAlpha  = 0;
    let scanAngle  = 0;

    // ── Resize ────────────────────────────────────────────────────────────
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      isMobile = W < 600;
      computeLayout();
    }

    // ── Layout geometry ────────────────────────────────────────────────────
    let LAYOUT = {};
    function computeLayout() {
      const colW   = isMobile ? W * 0.38 : W * 0.28;
      const colPad = isMobile ? 10 : 20;
      const srcH   = isMobile ? 44 : 52;
      const insH   = isMobile ? 56 : 70;
      const gap    = isMobile ? 8  : 12;

      // Left column: source cards
      const srcX   = colPad;
      const srcTotalH = SOURCES.length * (srcH + gap) - gap;
      const srcStartY = (H - srcTotalH) / 2;

      // Right column: insight cards
      const insX   = W - colW - colPad;
      const insTotalH = INSIGHTS.length * (insH + gap) - gap;
      const insStartY = (H - insTotalH) / 2;

      // Center hub
      const hubX = W / 2;
      const hubY = H / 2;
      const hubR = isMobile ? 36 : 52;

      srcCards = SOURCES.map((s, i) => ({
        ...s, i,
        x: srcX, y: srcStartY + i * (srcH + gap),
        w: colW, h: srcH,
        // Connection point (right edge center)
        cx: srcX + colW,
        cy: srcStartY + i * (srcH + gap) + srcH / 2,
      }));

      insCards = INSIGHTS.map((ins, i) => ({
        ...ins, i,
        x: insX, y: insStartY + i * (insH + gap),
        w: colW, h: insH,
        // Connection point (left edge center)
        cx: insX,
        cy: insStartY + i * (insH + gap) + insH / 2,
      }));

      LAYOUT = { hubX, hubY, hubR };
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) { return t < 0.5 ? 2*t*t : -1 + (4-2*t)*t; }

    // ── Draw: Background subtle grid ──────────────────────────────────────
    function drawGrid() {
      const step = isMobile ? 40 : 60;
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    // ── Draw: Sparkline ────────────────────────────────────────────────────
    function drawSparkline(trend, x, y, w, h, color, alpha) {
      if (!trend || trend.length < 2) return;
      const max = Math.max(...trend), min = Math.min(...trend);
      const range = max - min || 1;
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      trend.forEach((v, i) => {
        const px = x + (i / (trend.length - 1)) * w;
        const py = y + h - ((v - min) / range) * h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Fill area
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      const fillGrd = ctx.createLinearGradient(x, y, x, y + h);
      fillGrd.addColorStop(0, color + '44');
      fillGrd.addColorStop(1, color + '00');
      ctx.fillStyle = fillGrd;
      ctx.fill();
      ctx.restore();
    }

    // ── Draw: Source card (left) — simple flat ───────────────────────────
    function drawSourceCard(card, alpha, t) {
      if (alpha < 0.01) return;
      const { x, y, w, h, label, value, change, color } = card;
      const r = 8;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Background
      ctx.beginPath(); roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = 'rgba(24,28,44,0.95)';
      ctx.fill();

      // Border
      ctx.beginPath(); roundRect(ctx, x, y, w, h, r);
      ctx.strokeStyle = color + '55';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left accent
      ctx.beginPath(); roundRect(ctx, x, y, 3, h, [r, 0, 0, r]);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      const lFs = isMobile ? 8 : 10;
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.font = `400 ${lFs}px Inter,sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(label, x + 10, y + 9);

      // Value
      const vFs = isMobile ? 13 : 15;
      ctx.fillStyle = '#F1F5F9';
      ctx.font = `700 ${vFs}px Inter,sans-serif`;
      ctx.fillText(value, x + 10, y + 9 + lFs + 4);

      // Change badge
      const isPos = !change.startsWith('-');
      const bc = isPos ? C.emerald : C.danger;
      const cFs = isMobile ? 7 : 8;
      const bw = isMobile ? 30 : 36, bh = 14;
      const bx2 = x + w - bw - 8, by2 = y + 8;
      ctx.beginPath(); roundRect(ctx, bx2, by2, bw, bh, 4);
      ctx.fillStyle = bc + '22'; ctx.fill();
      ctx.fillStyle = bc;
      ctx.font = `600 ${cFs}px Inter,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(change, bx2 + bw / 2, by2 + bh / 2);

      // Connector dot
      ctx.beginPath(); ctx.arc(x + w, y + h / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    }

    // ── Draw: Insight card (right) — simple flat ───────────────────────────
    function drawInsightCard(card, alpha, scale, highlight, t) {
      if (alpha < 0.01) return;
      const { x, y, w, h, label, value, color, priority } = card;
      const r = 8;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x + w/2, y + h/2);
      ctx.scale(scale, scale);
      ctx.translate(-(x + w/2), -(y + h/2));

      // Subtle glow when highlighted
      if (highlight > 0.2) {
        ctx.shadowColor = color;
        ctx.shadowBlur  = highlight * 16;
      }

      // Background — flat dark
      ctx.beginPath(); roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = 'rgba(24,28,44,0.95)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.beginPath(); roundRect(ctx, x, y, w, h, r);
      ctx.strokeStyle = highlight > 0.2
        ? color + Math.floor(Math.min(highlight, 1) * 180).toString(16).padStart(2,'0')
        : color + '44';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left accent strip
      ctx.beginPath(); roundRect(ctx, x, y, 3, h, [r, 0, 0, r]);
      ctx.fillStyle = color;
      ctx.fill();

      // Priority badge (top right)
      const pBadge = { 'HIGH': C.emerald, 'URGENT': C.danger, 'MED': C.amber }[priority] || C.blue;
      const pFs = isMobile ? 7 : 8;
      const pbW = isMobile ? 34 : 42, pbH = 14;
      const pbX = x + w - pbW - 7, pbY = y + 8;
      ctx.beginPath(); roundRect(ctx, pbX, pbY, pbW, pbH, 4);
      ctx.fillStyle = pBadge + '22'; ctx.fill();
      ctx.fillStyle = pBadge;
      ctx.font = `600 ${pFs}px Inter,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(priority, pbX + pbW / 2, pbY + pbH / 2);

      // Label
      const lFs = isMobile ? 9 : 11;
      ctx.fillStyle = '#F1F5F9';
      ctx.font = `600 ${lFs}px Inter,sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(label, x + 10, y + 9);

      // Value (large, colored)
      const vFs = isMobile ? 15 : 20;
      ctx.fillStyle = color;
      ctx.font = `700 ${vFs}px Inter,sans-serif`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(value, x + 10, y + h - 9);

      // Connector dot
      ctx.beginPath(); ctx.arc(x, y + h / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    }

    // ── Draw: AI Hub (center) ──────────────────────────────────────────────
    function drawHub(alpha, glow, rotation, t) {
      if (alpha < 0.01) return;
      const { hubX, hubY, hubR } = LAYOUT;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow rings
      [2.8, 1.9, 1.3].forEach((scale, i) => {
        const gGrd = ctx.createRadialGradient(hubX, hubY, hubR * (scale - 0.3), hubX, hubY, hubR * scale);
        gGrd.addColorStop(0, C.blue + Math.floor(glow * (20 - i * 7)).toString(16).padStart(2,'0'));
        gGrd.addColorStop(1, C.blue + '00');
        ctx.beginPath();
        ctx.arc(hubX, hubY, hubR * scale, 0, Math.PI * 2);
        ctx.fillStyle = gGrd;
        ctx.fill();
      });

      // Rotating ring 1
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, hubR * 1.4, 0, Math.PI * 1.6);
      ctx.strokeStyle = C.blue + '88';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Small dot on ring
      ctx.beginPath();
      ctx.arc(Math.cos(Math.PI * 1.6) * hubR * 1.4, Math.sin(Math.PI * 1.6) * hubR * 1.4, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.blue;
      ctx.fill();
      ctx.restore();

      // Rotating ring 2 (opposite)
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(-rotation * 0.7);
      ctx.beginPath();
      ctx.arc(0, 0, hubR * 1.15, 0, Math.PI * 1.2);
      ctx.strokeStyle = C.purple + '66';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Hub body
      const hubGrd = ctx.createRadialGradient(hubX - hubR * 0.2, hubY - hubR * 0.2, 0, hubX, hubY, hubR);
      hubGrd.addColorStop(0, 'rgba(79,142,247,0.35)');
      hubGrd.addColorStop(0.6, 'rgba(30,40,80,0.9)');
      hubGrd.addColorStop(1, 'rgba(16,22,44,0.95)');
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubR, 0, Math.PI * 2);
      ctx.fillStyle = hubGrd;
      ctx.shadowColor = C.blue;
      ctx.shadowBlur = glow * 30;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Hub border
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubR, 0, Math.PI * 2);
      ctx.strokeStyle = C.blue + 'aa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Hub center icon (neural node)
      const pulse = 0.85 + Math.sin(t * 0.006) * 0.15;
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${isMobile ? 11 : 14}px Inter,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha * pulse;
      ctx.fillText('AI', hubX, hubY - 4);
      ctx.font = `400 ${isMobile ? 7 : 9}px Inter,sans-serif`;
      ctx.fillStyle = C.muted;
      ctx.fillText('analysis', hubX, hubY + 9);

      ctx.restore();
    }

    // ── Draw: Data flow lines ──────────────────────────────────────────────
    function drawFlowLines(alpha, t, phase) {
      if (alpha < 0.01) return;
      const { hubX, hubY, hubR } = LAYOUT;

      // Lines from source cards to hub
      srcCards.forEach((card, i) => {
        const lAlpha = alpha * (phase === 'both' || phase === 'left' ? 1 : 0);
        if (lAlpha < 0.01) return;

        // Bezier from card right-edge to hub left
        const cp1x = (card.cx + hubX) / 2;
        const cp1y = card.cy;
        const cp2x = cp1x;
        const cp2y = hubY;

        // Line
        ctx.save();
        ctx.globalAlpha = lAlpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(card.cx, card.cy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, hubX - hubR, hubY);
        ctx.strokeStyle = card.color + '88';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Moving particle on line
        const tOffset = (t * 0.0008 + i * 0.18) % 1;
        const bx = bezier(card.cx, cp1x, cp2x, hubX - hubR, tOffset);
        const by = bezier(card.cy, cp1y, cp2y, hubY, tOffset);
        ctx.save();
        ctx.globalAlpha = lAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = card.color;
        ctx.shadowColor = card.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // Lines from hub to insights
      insCards.forEach((card, i) => {
        const lAlpha = alpha * (phase === 'both' || phase === 'right' ? 1 : 0);
        if (lAlpha < 0.01) return;

        const cp1x = (hubX + card.cx) / 2;
        const cp1y = hubY;
        const cp2x = cp1x;
        const cp2y = card.cy;

        ctx.save();
        ctx.globalAlpha = lAlpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(hubX + hubR, hubY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, card.cx, card.cy);
        ctx.strokeStyle = card.color + '88';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Particle from hub to insight
        const tOffset = (t * 0.0007 + i * 0.3) % 1;
        const bx = bezier(hubX + hubR, cp1x, cp2x, card.cx, tOffset);
        const by = bezier(hubY, cp1y, cp2y, card.cy, tOffset);
        ctx.save();
        ctx.globalAlpha = lAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = card.color;
        ctx.shadowColor = card.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });
    }

    // Cubic bezier point
    function bezier(p0, p1, p2, p3, t) {
      const mt = 1 - t;
      return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
    }

    // ── Draw: column header labels ──────────────────────────────────────────
    function drawColumnHeaders(srcA, insA) {
      const fs = isMobile ? 8 : 10;
      if (srcCards.length) {
        const first = srcCards[0];
        ctx.save();
        ctx.globalAlpha = srcA;
        ctx.fillStyle = C.muted;
        ctx.font = `600 ${fs}px Inter,sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('SOURCE DATA', first.x, first.y - 6);
        ctx.restore();
      }
      if (insCards.length) {
        const first = insCards[0];
        ctx.save();
        ctx.globalAlpha = insA;
        ctx.fillStyle = C.muted;
        ctx.font = `600 ${fs}px Inter,sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('KEY INSIGHTS', first.x, first.y - 6);
        ctx.restore();
      }
    }

    // ── Draw: scene caption ─────────────────────────────────────────────────
    function drawCaption(title, sub, sp) {
      const fi = clamp(sp * 5, 0, 1);
      const fo = sp > 0.85 ? clamp(1 - (sp - 0.85) / 0.15, 0, 1) : 1;
      const a  = fi * fo;
      if (a < 0.02) return;

      const pad = 16, bh = 56;
      const by  = H - bh - pad;
      const tS  = isMobile ? 12 : 14;
      const sS  = isMobile ? 9  : 11;

      ctx.save();
      ctx.globalAlpha = a * 0.92;
      ctx.beginPath(); roundRect(ctx, pad, by, W - pad * 2, bh, 8);
      const bg = ctx.createLinearGradient(pad, by, pad, by + bh);
      bg.addColorStop(0, 'rgba(14,18,34,0.92)');
      bg.addColorStop(1, 'rgba(8,10,20,0.95)');
      ctx.fillStyle = bg; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.8; ctx.stroke();

      ctx.beginPath(); roundRect(ctx, pad, by, 3, bh, [8,0,0,8]);
      const ag = ctx.createLinearGradient(0, by, 0, by + bh);
      ag.addColorStop(0, C.blue); ag.addColorStop(1, C.purple);
      ctx.fillStyle = ag; ctx.fill();
      ctx.globalAlpha = a;

      ctx.fillStyle = '#F1F5F9';
      ctx.font = `700 ${tS}px Inter,sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(title, pad + 14, by + 11);

      ctx.fillStyle = 'rgba(148,163,184,0.85)';
      ctx.font = `400 ${sS}px Inter,sans-serif`;
      ctx.fillText(sub, pad + 14, by + 11 + tS + 5);
      ctx.restore();
    }

    // ── Scene targets ──────────────────────────────────────────────────────
    function computeState(scene, sp, t) {
      const s = easeOut(sp);

      switch (scene) {
        case 0: // Raw metrics appear
          srcAlpha = SOURCES.map((_, i) => clamp((sp - i * 0.1) * 5, 0, 1));
          insAlpha = INSIGHTS.map(() => 0);
          insScale = INSIGHTS.map(() => 0.8);
          insHighlight = INSIGHTS.map(() => 0);
          lineAlpha = 0; hubAlpha = 0; hubGlow = 0;
          break;

        case 1: // Metrics visible, hub fades in
          srcAlpha = SOURCES.map(() => 1);
          hubAlpha = clamp(sp * 3, 0, 1);
          hubGlow  = hubAlpha * 0.5;
          lineAlpha = 0;
          insAlpha = INSIGHTS.map(() => 0);
          break;

        case 2: // Flow lines left→hub
          srcAlpha = SOURCES.map(() => 1);
          hubAlpha = 1; hubGlow = 0.7;
          lineAlpha = clamp(sp * 3, 0, 1);
          insAlpha = INSIGHTS.map(() => 0);
          break;

        case 3: // Hub processes, insights emerge
          srcAlpha = SOURCES.map(() => 0.8);
          hubAlpha = 1; hubGlow = 1;
          lineAlpha = 1;
          insAlpha = INSIGHTS.map((_, i) => clamp((sp - i * 0.2) * 3, 0, 1));
          insScale = INSIGHTS.map((_, i) => lerp(0.85, 1, clamp((sp - i * 0.2) * 3, 0, 1)));
          insHighlight = INSIGHTS.map(() => 0);
          break;

        case 4: // All cards + insights visible
          srcAlpha = SOURCES.map(() => 1);
          hubAlpha = 1; hubGlow = 0.8;
          lineAlpha = 0.8;
          insAlpha = INSIGHTS.map(() => 1);
          insScale = INSIGHTS.map(() => 1);
          insHighlight = INSIGHTS.map(() => 0);
          break;

        case 5: // Highlight urgent insight (Inventory)
          srcAlpha = SOURCES.map(() => 0.6);
          hubAlpha = 0.8; hubGlow = 0.5;
          lineAlpha = 0.5;
          insAlpha = INSIGHTS.map(() => 1);
          insScale = INSIGHTS.map((_, i) => i === 1 ? lerp(1, 1.08, s) : 0.9);
          insHighlight = INSIGHTS.map((_, i) => i === 1 ? clamp(sp * 4, 0, 1) : 0);
          break;

        case 6: // Business confidence — clean & calm
          srcAlpha = SOURCES.map(() => 0.9);
          hubAlpha = 0.9; hubGlow = 0.6;
          lineAlpha = 0.6;
          insAlpha = INSIGHTS.map(() => 1);
          insScale = INSIGHTS.map(() => 1);
          insHighlight = INSIGHTS.map(() => 0);
          break;

        case 7: // Fade out → reset
          srcAlpha = SOURCES.map(() => clamp(1 - sp * 3, 0, 1));
          insAlpha = INSIGHTS.map(() => clamp(1 - sp * 3, 0, 1));
          insScale = INSIGHTS.map(() => 1);
          insHighlight = INSIGHTS.map(() => 0);
          lineAlpha = clamp(1 - sp * 3, 0, 1);
          hubAlpha = clamp(1 - sp * 3, 0, 1);
          hubGlow  = hubAlpha * 0.4;
          break;
      }
    }

    // ── Main render loop ───────────────────────────────────────────────────
    const CAPTIONS = [
      ['Collecting Business Data', 'Raw metrics stream in from every department — Sales, Finance, Marketing, Operations and more.'],
      ['Intelligence Hub Online', 'The Pro17 Analytics engine initialises, ready to process hundreds of data streams simultaneously.'],
      ['Data Flowing to Analysis', 'All department metrics feed into the central AI engine for deep cross-functional analysis.'],
      ['Insights Crystallising', 'The engine identifies patterns and surfaces the three most critical business opportunities.'],
      ['Full Intelligence View', 'Every source connected. Every insight mapped. The complete picture is clear.'],
      ['Priority Identified', 'An urgent inventory risk rises to the top — the system recommends immediate action.'],
      ['Decision Ready', 'Executives now have clear, ranked, actionable intelligence to make confident business decisions.'],
      ['New Cycle Beginning', 'Business intelligence never sleeps. A fresh analysis cycle begins automatically.'],
    ];

    const FLOW_PHASE = ['none','none','left','both','both','both','both','both'];

    function tick(ts) {
      if (paused) { animId = requestAnimationFrame(tick); return; }
      if (!startTime) startTime = ts;

      const elapsed  = (ts - startTime) % TOTAL_DUR;
      const sceneIdx = Math.min(Math.floor(elapsed / SCENE_DUR), N_SCENES - 1);
      const sp       = (elapsed % SCENE_DUR) / SCENE_DUR;

      computeState(sceneIdx, sp, ts);
      hubRot = ts * 0.001;

      // Render
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      drawGrid();

      // (column headers removed)

      // Flow lines (drawn behind cards)
      const phase = FLOW_PHASE[sceneIdx] || 'none';
      if (phase !== 'none' && lineAlpha > 0) {
        drawFlowLines(lineAlpha, ts, phase);
      }

      // Hub
      drawHub(hubAlpha, hubGlow, hubRot, ts);

      // Source cards
      srcCards.forEach((card, i) => drawSourceCard(card, srcAlpha[i], ts));

      // Insight cards
      insCards.forEach((card, i) => drawInsightCard(card, insAlpha[i], insScale[i], insHighlight[i], ts));

      // (captions removed)

      animId = requestAnimationFrame(tick);
    }

    // ── IntersectionObserver ───────────────────────────────────────────────
    new IntersectionObserver(([e]) => {
      paused = !e.isIntersecting;
      if (!paused && !animId) animId = requestAnimationFrame(tick);
    }, { threshold: 0.1 }).observe(canvas);

    window.addEventListener('resize', () => { resize(); startTime = null; });
    resize();
    animId = requestAnimationFrame(tick);
  }

  // ── roundRect utility ───────────────────────────────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + w - r[1], y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    ctx.lineTo(x + w, y + h - r[2]);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    ctx.lineTo(x + r[3], y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    ctx.lineTo(x, y + r[0]);
    ctx.quadraticCurveTo(x, y, x + r[0], y);
  }

  // ── Boot ────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pro17-bi-canvas').forEach(init);
  });
})();
