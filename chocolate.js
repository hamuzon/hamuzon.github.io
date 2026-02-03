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
      { type: 'liquid', size: [4, 7], color: '#5d4037' },
      { type: 'liquid', size: [5, 8], color: '#6d4c41' },
      { type: 'solid', shape: 'cookie', size: [16, 22], weight: 0.3, color: '#d7ccc8' },
      { type: 'solid', shape: 'strawberry', size: [14, 20], weight: 0.2, color: '#e53935' },
      { type: 'solid', shape: 'marshmallow', size: [14, 20], weight: 0.1, color: '#ffffff' },
      { type: 'solid', shape: 'chocolate', size: [15, 20], weight: 0.25, color: '#795548' },
      { type: 'rare', shape: 'heart', size: [16, 22], weight: 0.15, color: '#ff8a80' }
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
          ctx.shadowColor = '#ffd54f';
          ctx.shadowBlur = 18;
        }

        ctx.fillStyle = this.color;

        if (this.shape === 'cookie') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (this.shape === 'marshmallow') {
          ctx.beginPath();
          ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 6);
          ctx.fill();
        }

        if (this.shape === 'chocolate') {
          ctx.beginPath();
          ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-this.size / 2 + 2, -this.size / 2 + 2, this.size - 4, this.size - 4);
        }

        if (this.shape === 'strawberry') {
          ctx.beginPath();
          ctx.moveTo(-this.size / 2, -this.size / 2);
          ctx.quadraticCurveTo(0, this.size, this.size / 2, -this.size / 2);
          ctx.fill();
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
      ctx.fillStyle = '#3e2723';
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
      ctx.fillStyle = '#4e342e';
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
        ctx.fillStyle = 'rgba(93,64,55,0.35)';
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
        btn.textContent = on ? 'Chocolate ON' : 'Chocolate OFF';
      });
    }
  });
})();
