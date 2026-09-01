(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('autumnCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    const groundMap = new Array(Math.ceil(cw)).fill(ch);

    function resize() {
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = cw * devicePixelRatio;
      canvas.height = ch * devicePixelRatio;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      for (let i = 0; i < groundMap.length; i++) groundMap[i] = ch;
    }
    window.addEventListener('resize', resize);
    resize();

    const leafTypes = [
      { shape: 'maple',  sizeRange: [10, 18], colors: ['#CC2200', '#E03000', '#FF4500', '#DD3311'], hillFactor: 1.0 },
      { shape: 'oak',    sizeRange: [12, 20], colors: ['#CC6600', '#E07800', '#FFA500', '#DD8800'], hillFactor: 1.2 },
      { shape: 'simple', sizeRange: [8,  15], colors: ['#BB4400', '#FF6020', '#FF7F50', '#DD5500'], hillFactor: 0.9 },
      { shape: 'simple', sizeRange: [9,  16], colors: ['#BB8800', '#FFB300', '#FFD700', '#FFCA28'], hillFactor: 1.1 },
    ];

    function getLeafInitialY() {
      if (cw < 768)  return Math.random() * (ch * 0.6) - ch;
      if (cw < 1200) return Math.random() * (ch * 0.8) - ch;
      return Math.random() * ch - ch;
    }

    let windOffset = 0;
    function updateWind() {
      windOffset += (Math.random() - 0.5) * 0.2;
      if (windOffset >  1) windOffset =  1;
      if (windOffset < -1) windOffset = -1;
    }

    function lightenHex(hex, amt) {
      const c = parseInt(hex.slice(1), 16);
      const r = Math.min(255, (c >> 16) + amt);
      const g = Math.min(255, ((c >> 8) & 0xff) + amt);
      const b = Math.min(255, (c & 0xff) + amt);
      return `rgb(${r},${g},${b})`;
    }

    function darkenHex(hex, amt) {
      const c = parseInt(hex.slice(1), 16);
      const r = Math.max(0, (c >> 16) - amt);
      const g = Math.max(0, ((c >> 8) & 0xff) - amt);
      const b = Math.max(0, (c & 0xff) - amt);
      return `rgb(${r},${g},${b})`;
    }

    function buildMaple(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s*0.12, -s*0.60,  s*0.48, -s*0.72,  s*0.40, -s*0.46);
      ctx.bezierCurveTo( s*0.62, -s*0.58,  s*0.88, -s*0.34,  s*0.58, -s*0.20);
      ctx.bezierCurveTo( s*0.92, -s*0.08,  s*1.02,  s*0.12,  s*0.58,  s*0.16);
      ctx.bezierCurveTo( s*0.52,  s*0.32,  s*0.26,  s*0.42,  0,       s*0.50);
      ctx.bezierCurveTo(-s*0.26,  s*0.42, -s*0.52,  s*0.32, -s*0.58,  s*0.16);
      ctx.bezierCurveTo(-s*1.02,  s*0.12, -s*0.92, -s*0.08, -s*0.58, -s*0.20);
      ctx.bezierCurveTo(-s*0.88, -s*0.34, -s*0.62, -s*0.58, -s*0.40, -s*0.46);
      ctx.bezierCurveTo(-s*0.48, -s*0.72, -s*0.12, -s*0.60,  0,      -s);
      ctx.closePath();
    }

    function buildOak(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s*0.48, -s*0.82,  s*0.82, -s*0.42,  s*0.72,  0);
      ctx.bezierCurveTo( s*0.84,  s*0.32,  s*0.50,  s*0.72,  0,       s*0.85);
      ctx.bezierCurveTo(-s*0.50,  s*0.72, -s*0.84,  s*0.32, -s*0.72,  0);
      ctx.bezierCurveTo(-s*0.82, -s*0.42, -s*0.48, -s*0.82,  0,      -s);
      ctx.closePath();
    }

    function buildSimple(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s*0.42, -s*0.72,  s*0.62, -s*0.08,  s*0.46,  s*0.38);
      ctx.bezierCurveTo( s*0.32,  s*0.72,  s*0.16,  s*0.90,  0,       s*0.50);
      ctx.bezierCurveTo(-s*0.16,  s*0.90, -s*0.32,  s*0.72, -s*0.46,  s*0.38);
      ctx.bezierCurveTo(-s*0.62, -s*0.08, -s*0.42, -s*0.72,  0,      -s);
      ctx.closePath();
    }

    class Leaf {
      constructor() { this.reset(); }

      reset() {
        const type = leafTypes[Math.floor(Math.random() * leafTypes.length)];
        this.shape = type.shape;
        this.size = Math.random() * (type.sizeRange[1] - type.sizeRange[0]) + type.sizeRange[0];
        this.color = type.colors[Math.floor(Math.random() * type.colors.length)];
        this.hillFactor = type.hillFactor;
        this.x = Math.random() * cw;
        this.y = getLeafInitialY();
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.onGround = false;
        this.life = 0;
        this.opacity = 1;
        this.fadeSpeed = 0.01 + Math.random() * 0.03;
      }

      update() {
        if (!this.onGround) {
          this.x += this.speedX + Math.sin(this.angle) * 0.5 + windOffset * 0.5;
          this.y += this.speedY;
          this.angle += this.rotationSpeed;
          if (this.x < 0)  this.x += cw;
          if (this.x > cw) this.x -= cw;
          const ix = Math.floor(this.x);
          const groundY = groundMap[ix] - this.size / 2;
          if (this.y >= groundY) {
            this.y = groundY;
            this.speedX = 0;
            this.speedY = 0;
            this.rotationSpeed = 0;
            this.onGround = true;
            const hillWidth = Math.floor(Math.random() * 8 + 4) * this.hillFactor;
            const hillHeight = (Math.random() * 1 + 0.5) * this.hillFactor;
            for (let offset = -hillWidth; offset <= hillWidth; offset++) {
              const idx = Math.min(Math.max(ix + offset, 0), cw - 1);
              groundMap[idx] -= hillHeight * (1 - Math.abs(offset) / hillWidth);
            }
            this.life = 300 + Math.random() * 1500;
            this.opacity = 1;
          }
        } else {
          this.life--;
          if (this.life <= 0) {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0) this.reset();
          }
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;

        const s = this.size;
        const col  = this.color;
        const dark = darkenHex(col, 60);
        const vein  = 'rgba(0,0,0,0.25)';
        const veinL = 'rgba(0,0,0,0.13)';
        const build = this.shape === 'maple' ? buildMaple
                    : this.shape === 'oak'   ? buildOak
                    : buildSimple;

        ctx.strokeStyle = dark;
        ctx.lineWidth = s * 0.07;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, s * 0.48);
        ctx.quadraticCurveTo(s * 0.06, s * 0.75, s * 0.04, s * 1.05);
        ctx.stroke();

        const grad = ctx.createRadialGradient(-s * 0.18, -s * 0.38, s * 0.04, s * 0.05, -s * 0.1, s * 1.15);
        grad.addColorStop(0,   lightenHex(col, 70));
        grad.addColorStop(0.3, lightenHex(col, 25));
        grad.addColorStop(0.7, col);
        grad.addColorStop(1,   dark);

        build(ctx, s);
        ctx.fillStyle = grad;
        ctx.fill();

        build(ctx, s);
        ctx.strokeStyle = dark;
        ctx.lineWidth = s * 0.06;
        ctx.stroke();

        build(ctx, s);
        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.lineWidth = s * 0.03;
        ctx.stroke();

        ctx.save();
        build(ctx, s);
        ctx.clip();
        ctx.lineCap = 'round';

        if (this.shape === 'maple') {
          ctx.strokeStyle = vein;
          ctx.lineWidth = s * 0.052;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.92);
          ctx.quadraticCurveTo(s * 0.025, -s * 0.2, 0, s * 0.45);
          ctx.stroke();

          const targets = [
            [ s*0.40, -s*0.44], [ s*0.56, -s*0.18],
            [-s*0.40, -s*0.44], [-s*0.56, -s*0.18],
          ];
          targets.forEach(([tx, ty]) => {
            ctx.strokeStyle = vein;
            ctx.lineWidth = s * 0.030;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(tx * 0.45, ty * 0.55, tx, ty);
            ctx.stroke();
            ctx.strokeStyle = veinL;
            ctx.lineWidth = s * 0.018;
            ctx.beginPath();
            ctx.moveTo(tx * 0.7, ty * 0.7);
            ctx.quadraticCurveTo(tx * 1.1, ty * 0.5, tx * 1.3, ty * 0.2);
            ctx.stroke();
          });

          ctx.strokeStyle = vein;
          ctx.lineWidth = s * 0.026;
          [[ s*0.28, -s*0.74], [-s*0.28, -s*0.74]].forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.55);
            ctx.quadraticCurveTo(tx * 0.55, ty * 0.72, tx, ty);
            ctx.stroke();
          });

        } else if (this.shape === 'oak') {
          ctx.strokeStyle = vein;
          ctx.lineWidth = s * 0.055;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.9);
          ctx.quadraticCurveTo(s * 0.03, 0, 0, s * 0.82);
          ctx.stroke();

          for (let i = 1; i <= 4; i++) {
            const t     = -s * 0.70 + i * s * 0.37;
            const reach = s * (0.60 - i * 0.04);
            const curl  = -s * 0.08;
            ctx.strokeStyle = vein;
            ctx.lineWidth = s * (0.032 - i * 0.004);
            ctx.beginPath();
            ctx.moveTo(0, t);
            ctx.quadraticCurveTo(reach * 0.55, t + curl * 0.5, reach, t + curl);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, t);
            ctx.quadraticCurveTo(-reach * 0.55, t + curl * 0.5, -reach, t + curl);
            ctx.stroke();
            ctx.strokeStyle = veinL;
            ctx.lineWidth = s * 0.018;
            ctx.beginPath();
            ctx.moveTo(reach * 0.7, t + curl * 0.7);
            ctx.quadraticCurveTo(reach * 1.05, t + curl * 0.3, reach * 0.85, t - curl * 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-reach * 0.7, t + curl * 0.7);
            ctx.quadraticCurveTo(-reach * 1.05, t + curl * 0.3, -reach * 0.85, t - curl * 0.2);
            ctx.stroke();
          }

        } else {
          ctx.strokeStyle = vein;
          ctx.lineWidth = s * 0.050;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.92);
          ctx.quadraticCurveTo(s * 0.03, -s * 0.1, 0, s * 0.48);
          ctx.stroke();

          for (let i = 1; i <= 5; i++) {
            const t     = -s * 0.55 + i * s * 0.27;
            const reach = s * (0.42 - i * 0.025);
            const curl  = s * 0.16;
            ctx.strokeStyle = vein;
            ctx.lineWidth = s * (0.028 - i * 0.003);
            ctx.beginPath();
            ctx.moveTo(0, t);
            ctx.quadraticCurveTo(reach * 0.5, t + curl * 0.5, reach, t + curl);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, t);
            ctx.quadraticCurveTo(-reach * 0.5, t + curl * 0.5, -reach, t + curl);
            ctx.stroke();
          }
        }

        ctx.restore();
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    const leafCountMax = 120;
    let leaves = [];
    let animationFrameId = null;
    let running = false;

    function initLeaves() {
      for (let i = 0; i < groundMap.length; i++) groundMap[i] = ch;
      leaves = [];
      for (let i = 0; i < leafCountMax; i++) leaves.push(new Leaf());
    }

    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, cw, ch);
      updateWind();
      leaves.forEach(leaf => {
        leaf.update();
        leaf.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    }

    function start() {
      if (running) return;
      running = true;
      initLeaves();
      canvas.style.display = 'block';
      animate();
    }

    function stop() {
      running = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      leaves = [];
      for (let i = 0; i < groundMap.length; i++) groundMap[i] = ch;
      ctx.clearRect(0, 0, cw, ch);
      canvas.style.display = 'none';
    }

    window.autumnControl = {
      start,
      stop,
      show: start,
      hide: stop,
      isRunning: () => running,
    };

    // 初期起動
    start();

    const toggleBtn = document.getElementById('autumn-toggle');
    if (toggleBtn) {
      let autumnOn = true;
      toggleBtn.addEventListener('click', () => {
        autumnOn = !autumnOn;
        toggleBtn.textContent = autumnOn ? '落ち葉ON' : '落ち葉OFF';
        autumnOn ? start() : stop();
      });
    }
  });
})();