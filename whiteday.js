(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('winterCanvas');

    const ctx = canvas.getContext('2d');
    let cw = innerWidth;
    let ch = innerHeight;
    let dpr = devicePixelRatio || 1;
    let ground = [];
    let ceiling = [];
    let particles = [];
    let wave = 0;
    let flowTimer = 0;

    if (!canvas) return;

    function resize() {
      cw = innerWidth;
      ch = innerHeight;

      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ground = new Array(Math.ceil(cw)).fill(ch - 80);

      ceiling = [];
      const step = 50;
      for (let x = 0; x <= cw + step; x += step) {
        ceiling.push({
          x,
          base: 20 + Math.random() * 40,
          drip: 0,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    window.addEventListener('resize', resize);

    const items = [
      { type: 'liquid', size: [4, 7], color: '#ead7b4' },
      { type: 'liquid', size: [5, 8], color: '#f8edda' },
      { type: 'solid', shape: 'cookie', size: [16, 22], weight: 0.3, color: '#d8bd8a' },
      { type: 'solid', shape: 'strawberry', size: [14, 20], weight: 0.2, color: '#e5394f' },
      { type: 'solid', shape: 'marshmallow', size: [14, 20], weight: 0.1, color: '#fffdf8' },
      { type: 'solid', shape: 'chocolate', size: [15, 20], weight: 0.25, color: '#f2e3c4' },
      { type: 'rare', shape: 'heart', size: [16, 22], weight: 0.15, color: '#e9a6a0' }
    ];

    resize();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        const rare = Math.random() < 0.012;
        const itemPool = rare ? items.filter(i => i.type === 'rare') : items.filter(i => i.type !== 'rare');
        const t = itemPool[Math.floor(Math.random() * itemPool.length)];

        this.type = t.type;
        this.shape = t.shape;
        this.color = t.color;
        this.size = Math.random() * (t.size[1] - t.size[0]) + t.size[0];
        this.weight = t.weight || 0;
        this.x = Math.random() * cw;
        this.y = -this.size - Math.random() * 200;
        this.vy = 0;
        this.gravity = 0.01 + Math.random() * 0.03;
        this.angle = Math.random() * Math.PI * 2;
        this.vAngle = (Math.random() - 0.5) * 0.1;
        this.alpha = 1;
        this.state = 'fall';
        this.stick = 0;
        this.sinkSpeed = 0.002 + Math.random() * 0.003;
      }

      update() {
        if (this.state === 'fall') {
          this.vy += this.gravity;
          this.y += this.vy;
          this.angle += this.vAngle;

          const ix = Math.floor(this.x);

          if (ground[ix] !== undefined && this.y + this.size / 2 >= ground[ix]) {
            for (let i = -this.size; i <= this.size; i++) {
              const gx = ix + i;

              if (ground[gx] !== undefined) {
                ground[gx] -= (1 - Math.abs(i) / this.size) * 2;
              }
            }
            if (this.type === 'liquid') {
              this.reset();
            } else {
              this.state = 'stick';
              this.stick = 40 + Math.random() * 60;
              this.y = ground[ix] - this.size / 2;
              this.vy = 0;
            }
          }
        }
        if (this.state === 'stick') {
          this.stick--;
          if (this.stick <= 0) this.state = 'sink';
        }
        if (this.state === 'sink') {
          this.y += this.weight;
          this.alpha -= this.sinkSpeed;

          if (this.alpha <= 0) this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.alpha;
        if (this.type === 'rare') {
          ctx.shadowColor = '#e8c98b';
          ctx.shadowBlur = 18;
        }

        ctx.fillStyle = this.color;

        if (this.shape === 'cookie') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(126, 91, 48, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (this.shape === 'marshmallow') {
          ctx.beginPath();
          ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 6);
          ctx.fill();
          ctx.strokeStyle = 'rgba(184, 151, 105, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (this.shape === 'chocolate') {
          ctx.beginPath();
          ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
          ctx.fill();
          ctx.strokeStyle = 'rgba(184, 151, 105, 0.8)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-this.size / 2 + 2, -this.size / 2 + 2, this.size - 4, this.size - 4);
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2 + 3);
          ctx.lineTo(0, this.size / 2 - 3);
          ctx.moveTo(-this.size / 2 + 3, 0);
          ctx.lineTo(this.size / 2 - 3, 0);
          ctx.strokeStyle = 'rgba(184, 151, 105, 0.55)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-this.size / 2 + 4, -this.size / 2 + 4);
          ctx.lineTo(this.size / 2 - 4, -this.size / 2 + 4);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (this.shape === 'strawberry') {
          ctx.beginPath();
          ctx.moveTo(-this.size * 0.46, -this.size * 0.2);
          ctx.quadraticCurveTo(-this.size * 0.58, -this.size * 0.58, 0, -this.size * 0.38);
          ctx.quadraticCurveTo(this.size * 0.58, -this.size * 0.58, this.size * 0.46, -this.size * 0.2);
          ctx.quadraticCurveTo(this.size * 0.38, this.size * 0.2, 0, this.size * 0.5);
          ctx.quadraticCurveTo(-this.size * 0.38, this.size * 0.2, -this.size * 0.46, -this.size * 0.2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(164, 105, 83, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = '#638c45';
          ctx.beginPath();
          ctx.moveTo(-this.size * 0.42, -this.size * 0.28);
          ctx.lineTo(-this.size * 0.3, -this.size * 0.48);
          ctx.lineTo(-this.size * 0.08, -this.size * 0.34);
          ctx.lineTo(0, -this.size * 0.52);
          ctx.lineTo(this.size * 0.12, -this.size * 0.34);
          ctx.lineTo(this.size * 0.34, -this.size * 0.46);
          ctx.lineTo(this.size * 0.4, -this.size * 0.22);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#fff8e7';
          for (const [x, y] of [[-0.22, -0.12], [0.2, -0.1], [-0.12, 0.12], [0.16, 0.16], [0, 0.34]]) {
            ctx.beginPath();
            ctx.ellipse(x * this.size, y * this.size, 0.55, 0.9, -0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (this.shape === 'heart') {
          ctx.beginPath();
          ctx.moveTo(0, this.size * 0.3);
          ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, this.size * 0.3);
          ctx.bezierCurveTo(-this.size / 2, this.size, 0, this.size, 0, this.size);
          ctx.bezierCurveTo(0, this.size, this.size / 2, this.size, this.size / 2, this.size * 0.3);
          ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, this.size * 0.3);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < 70; i++) {
      const p = new Particle();
      p.y = -Math.random() * ch * 2;
      particles.push(p);
    }

    function drawCeiling() {
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath();
      ctx.moveTo(0, 0);

      ceiling.forEach((d, i) => {
        d.base += Math.sin(wave + d.phase) * 0.3;

        if (d.drip > 0) d.drip -= 0.6;
        else if (Math.random() < 0.00035) d.drip = 40 + Math.random() * 50;

        const len = d.base + d.drip;
        const nx = ceiling[i + 1]?.x ?? cw;
        const nl = ceiling[i + 1]?.base ?? d.base;

        ctx.quadraticCurveTo(d.x, len, (d.x + nx) / 2, (len + nl) / 2);
      });

      ctx.lineTo(cw, 0);
      ctx.fill();
    }

    function drawGround() {
      ctx.fillStyle = '#f3e5c8';
      ctx.beginPath();
      ctx.moveTo(0, ch);

      for (let x = 0; x < cw; x++) {
        ground[x] += 0.01;
        if (ground[x] > ch) ground[x] = ch;
        ctx.lineTo(x, ground[x]);
      }

      ctx.lineTo(cw, ch);
      ctx.fill();
    }

    function flowEvent() {
      if (flowTimer > 0) {
        flowTimer--;
        ctx.fillStyle = 'rgba(243,229,200,0.35)';
        ctx.fillRect(0, 0, cw, ch);
      } else if (Math.random() < 0.00018) {
        flowTimer = 120;
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, cw, ch);

      wave += 0.02;

      drawCeiling();
      drawGround();
      flowEvent();

      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }

    animate();

    const btn = document.getElementById('chocolate-toggle');
    let on = true;

    if (btn) {
      btn.addEventListener('click', () => {
        on = !on;
        canvas.style.display = on ? 'block' : 'none';
        btn.textContent = on ? 'White Chocolate ON' : 'White Chocolate OFF';
      });
    }
  });
})();
