(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('winterCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    let groundMap = new Array(Math.ceil(cw)).fill(ch);
    const groundDecay = 0.04;

    function resize() {
      cw = window.innerWidth;
      ch = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const newLen = Math.ceil(cw);
      const newMap = new Array(newLen);
      for (let i = 0; i < newLen; i++) {
        newMap[i] = (i < groundMap.length && groundMap[i] !== undefined)
          ? Math.min(groundMap[i], ch)
          : ch;
      }
      groundMap = newMap;
    }
    window.addEventListener('resize', resize);
    resize();

    const snowTypes = [
      { shape: 'circle',  sizeRange: [2.5, 6], speedRange: [0.8, 1.8] },
      { shape: 'crystal', sizeRange: [6, 11],   speedRange: [0.5, 1.2] },
      { shape: 'hex',     sizeRange: [4, 7],   speedRange: [0.7, 1.6] },
      { shape: 'diamond', sizeRange: [3.5, 6], speedRange: [0.6, 1.5] },
    ];

    class Snowflake {
      constructor(startFromTop = false) {
        this.reset(startFromTop);
      }

      reset(startFromTop = false) {
        const type = snowTypes[Math.floor(Math.random() * snowTypes.length)];
        this.shape = type.shape;
        this.size = Math.random() * (type.sizeRange[1] - type.sizeRange[0]) + type.sizeRange[0];
        this.x = Math.random() * cw;

        if (startFromTop) {
          // ONにした時は画面の上部〜上空から自然に降り始める
          this.y = -Math.random() * ch * 0.9 - 10;
        } else {
          // 通常ループ時は上端少し上から再出現
          this.y = -Math.random() * 40 - 10;
        }

        this.speedY = Math.random() * (type.speedRange[1] - type.speedRange[0]) + type.speedRange[0];
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayAmp = Math.random() * 0.55 + 0.25;

        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.025;
        this.opacity = Math.random() * 0.35 + 0.65;
        this.onGround = false;
        this.life = 0;
        this.fadeSpeed = 0.01 + Math.random() * 0.015;
        this.willAccumulate = Math.random() < 0.45;
      }

      update() {
        if (!this.onGround) {
          this.swayAngle += this.swaySpeed;
          this.x += this.speedX + Math.sin(this.swayAngle) * this.swayAmp;
          this.y += this.speedY;
          this.angle += this.rotationSpeed;

          if (this.x < -20) this.x += cw + 40;
          if (this.x > cw + 20) this.x -= cw + 40;

          const ix = Math.floor(this.x);
          const groundY = (ix >= 0 && ix < groundMap.length) ? groundMap[ix] - this.size / 2 : ch;

          if (this.y >= groundY) {
            if (this.willAccumulate && groundY > ch - 100) {
              this.y = groundY;
              this.speedX = 0;
              this.speedY = 0;
              this.rotationSpeed = 0;
              this.onGround = true;

              const hillWidth = Math.floor(Math.random() * 8 + 4);
              const hillHeight = Math.random() * 1.8 + 0.8;
              for (let offset = -hillWidth; offset <= hillWidth; offset++) {
                const idx = ix + offset;
                if (idx >= 0 && idx < groundMap.length) {
                  groundMap[idx] = Math.max(groundMap[idx] - hillHeight * (1 - Math.abs(offset) / hillWidth), ch - 70);
                }
              }

              // 雪オブジェクト追加（雪だるま・ツリー・うさぎ・お家）
              if (Math.random() < 0.035 && snowObjects.length < 12) {
                snowObjects.push(new SnowObject(this.x, this.y));
              }

              this.life = 200 + Math.random() * 500;
              this.opacity = 0.9;
            } else {
              this.opacity -= this.fadeSpeed;
              if (this.opacity <= 0) this.reset();
            }
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
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        // 明るい青空でも白雪がくっきり見えるよう、ほんのり空色の影をつける
        ctx.shadowColor = 'rgba(12, 74, 110, 0.22)';
        ctx.shadowBlur = 3;

        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === 'hex') {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = Math.cos(angle) * (this.size / 1.6);
            const hy = Math.sin(angle) * (this.size / 1.6);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (this.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 3, 0);
          ctx.lineTo(0, this.size / 2);
          ctx.lineTo(-this.size / 3, 0);
          ctx.closePath();
          ctx.fill();
        } else if (this.shape === 'crystal') {
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const x1 = Math.cos(a) * (this.size / 2);
            const y1 = Math.sin(a) * (this.size / 2);
            ctx.moveTo(0, 0);
            ctx.lineTo(x1, y1);

            // 結晶の枝分かれ
            const bx = Math.cos(a) * (this.size * 0.32);
            const by = Math.sin(a) * (this.size * 0.32);
            const sideA1 = a + Math.PI / 4;
            const sideA2 = a - Math.PI / 4;
            const branchLen = this.size * 0.18;
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(sideA1) * branchLen, by + Math.sin(sideA1) * branchLen);
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(sideA2) * branchLen, by + Math.sin(sideA2) * branchLen);
          }
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    class SnowObject {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxLife = 450 + Math.random() * 350;
        this.life = this.maxLife;
        this.opacity = 0;
        const types = ['snowman', 'tree', 'bunny', 'house'];
        this.type = types[Math.floor(Math.random() * types.length)];
        this.size = Math.random() * 8 + 14;
      }

      update() {
        this.life--;
        if (this.life > this.maxLife - 30) {
          this.opacity = (this.maxLife - this.life) / 30;
        } else if (this.life < 40) {
          this.opacity = Math.max(0, this.life / 40);
        } else {
          this.opacity = 0.95;
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(12, 74, 110, 0.25)';
        ctx.shadowBlur = 4;

        if (this.type === 'snowman') {
          // 下段・中段・頭
          ctx.beginPath();
          ctx.arc(0, -this.size * 0.25, this.size * 0.38, 0, Math.PI * 2);
          ctx.arc(0, -this.size * 0.72, this.size * 0.26, 0, Math.PI * 2);
          ctx.arc(0, -this.size * 1.05, this.size * 0.17, 0, Math.PI * 2);
          ctx.fill();

          // 帽子（アクセントカラー）
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-this.size * 0.14, -this.size * 1.34, this.size * 0.28, this.size * 0.16);
          ctx.fillRect(-this.size * 0.22, -this.size * 1.20, this.size * 0.44, this.size * 0.05);

        } else if (this.type === 'tree') {
          // 針葉樹（3層）
          ctx.beginPath();
          ctx.moveTo(0, -this.size * 1.3);
          ctx.lineTo(this.size * 0.35, -this.size * 0.8);
          ctx.lineTo(this.size * 0.15, -this.size * 0.8);
          ctx.lineTo(this.size * 0.5, -this.size * 0.35);
          ctx.lineTo(this.size * 0.25, -this.size * 0.35);
          ctx.lineTo(this.size * 0.6, 0);
          ctx.lineTo(-this.size * 0.6, 0);
          ctx.lineTo(-this.size * 0.25, -this.size * 0.35);
          ctx.lineTo(-this.size * 0.5, -this.size * 0.35);
          ctx.lineTo(-this.size * 0.15, -this.size * 0.8);
          ctx.lineTo(-this.size * 0.35, -this.size * 0.8);
          ctx.closePath();
          ctx.fill();

        } else if (this.type === 'bunny') {
          // うさぎの体・頭・耳
          ctx.beginPath();
          ctx.arc(0, -this.size * 0.3, this.size * 0.35, 0, Math.PI * 2);
          ctx.arc(this.size * 0.2, -this.size * 0.65, this.size * 0.22, 0, Math.PI * 2);
          ctx.fill();
          // 耳
          ctx.beginPath();
          ctx.ellipse(this.size * 0.14, -this.size * 0.95, this.size * 0.07, this.size * 0.2, -0.15, 0, Math.PI * 2);
          ctx.ellipse(this.size * 0.28, -this.size * 0.95, this.size * 0.07, this.size * 0.2, 0.15, 0, Math.PI * 2);
          ctx.fill();

        } else if (this.type === 'house') {
          // 雪のおうち
          ctx.fillRect(-this.size * 0.45, -this.size * 0.5, this.size * 0.9, this.size * 0.5);
          // 屋根
          ctx.beginPath();
          ctx.moveTo(-this.size * 0.55, -this.size * 0.5);
          ctx.lineTo(0, -this.size * 0.95);
          ctx.lineTo(this.size * 0.55, -this.size * 0.5);
          ctx.closePath();
          ctx.fill();
          // ドア
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-this.size * 0.12, -this.size * 0.32, this.size * 0.24, this.size * 0.32);
        }

        ctx.restore();
      }
    }

    let flakes = [];
    let snowObjects = [];
    let animationFrameId = null;
    let running = false;

    const count = cw < 600 ? 75 : 120;

    function initSnow(startFromTop = false) {
      for (let i = 0; i < groundMap.length; i++) {
        groundMap[i] = ch;
      }
      snowObjects = [];
      flakes = [];
      for (let i = 0; i < count; i++) {
        flakes.push(new Snowflake(startFromTop));
      }
    }

    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, cw, ch);

      // 地面の雪解け
      for (let i = 0; i < groundMap.length; i++) {
        groundMap[i] += groundDecay;
        if (groundMap[i] > ch) groundMap[i] = ch;
      }

      // 地面の積雪を描画（なだらかな白い雪の丘）
      let hasGroundSnow = false;
      for (let i = 0; i < groundMap.length; i += 8) {
        if (groundMap[i] < ch - 1) {
          hasGroundSnow = true;
          break;
        }
      }

      if (hasGroundSnow) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.shadowColor = 'rgba(12, 74, 110, 0.18)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, ch);
        for (let x = 0; x < cw; x += 6) {
          const idx = Math.min(x, groundMap.length - 1);
          ctx.lineTo(x, groundMap[idx]);
        }
        ctx.lineTo(cw, ch);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 雪オブジェクトと雪の結晶を描画
      snowObjects.forEach(o => { o.update(); o.draw(ctx); });
      snowObjects = snowObjects.filter(o => o.life > 0);

      flakes.forEach(f => { f.update(); f.draw(ctx); });

      animationFrameId = requestAnimationFrame(animate);
    }

    const toggleBtn = document.getElementById('winter-toggle');

    function start() {
      if (running) return;
      running = true;
      // ONにした時は最初から空から舞い降りる
      initSnow(true);
      canvas.style.display = 'block';
      if (toggleBtn) {
        toggleBtn.textContent = '雪ON';
        toggleBtn.classList.remove('off');
        toggleBtn.setAttribute('aria-pressed', 'true');
      }
      animate();
    }

    function stop() {
      running = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      flakes = [];
      snowObjects = [];
      for (let i = 0; i < groundMap.length; i++) {
        groundMap[i] = ch;
      }
      // OFFにしたら綺麗に消して出さない
      ctx.clearRect(0, 0, cw, ch);
      canvas.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.textContent = '雪OFF';
        toggleBtn.classList.add('off');
        toggleBtn.setAttribute('aria-pressed', 'false');
      }
    }

    window.winterControl = {
      start,
      stop,
      show: start,
      hide: stop,
      isRunning: () => running,
    };

    // 初期状態：雪ONで起動
    start();

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (running) {
          stop();
        } else {
          start();
        }
      });
    }
  });
})();