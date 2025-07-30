(() => {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) {
    console.warn('fireworks.js: canvas#fireworksCanvas が見つかりません');
    return;
  }
  const ctx = canvas.getContext('2d');
  let cw, ch;

  // リサイズ対応
  function resize() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw * devicePixelRatio;
    canvas.height = ch * devicePixelRatio;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  window.addEventListener('resize', resize);
  resize();

  // ヘルパー関数
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randomInt(min, max) {
    return Math.floor(random(min, max));
  }
  function hsvToRgb(h, s, v) {
    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;
    let r=0, g=0, b=0;
    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    return {
      r: Math.round((r+m)*255),
      g: Math.round((g+m)*255),
      b: Math.round((b+m)*255),
    };
  }

  // パーティクル（花火の粒子）
  class Particle {
    constructor(x, y, angle, speed, color, decay, size, gravity = 0) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.alpha = 1;
      this.decay = decay;
      this.size = size;
      this.gravity = gravity;
      this.dead = false;
    }
    update() {
      this.vx *= 0.98; // 空気抵抗
      this.vy *= 0.98;
      this.vy += this.gravity; // 重力加速
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0) {
        this.dead = true;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 花火本体
  class Firework {
    constructor(x, y, targetY, colorHue) {
      this.x = x;
      this.y = y;
      this.sx = x; // 打ち上げ開始位置x
      this.sy = y; // 打ち上げ開始位置y
      this.targetY = targetY;
      this.colorHue = colorHue;
      this.isExploded = false;
      this.particles = [];
      this.speed = random(6, 9);
      this.angle = -Math.PI / 2; // 真上に飛ぶ
      this.vx = 0;
      this.vy = -this.speed;
      this.trail = [];
      this.trailMaxLen = 5;
      this.dead = false;
    }
    update() {
      if (!this.isExploded) {
        // 打ち上げ中
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // 重力で減速
        // トレイル追加
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.trailMaxLen) this.trail.shift();

        if (this.vy >= 0 || this.y <= this.targetY) {
          this.explode();
        }
      } else {
        // 爆発後のパーティクル更新
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.dead);
        if (this.particles.length === 0) this.dead = true;
      }
    }
    explode() {
      this.isExploded = true;
      // 爆発パターンをランダムに
      const pattern = randomInt(0, 5);
      const count = 50 + randomInt(0, 50);
      switch(pattern) {
        case 0:
          this.createSphericalBurst(count);
          break;
        case 1:
          this.createRingBurst(count);
          break;
        case 2:
          this.createHeartBurst(count);
          break;
        case 3:
          this.createStarBurst(count);
          break;
        case 4:
          this.createPalmBurst(count);
          break;
        default:
          this.createSphericalBurst(count);
      }
    }
    createSphericalBurst(count) {
      for(let i=0; i<count; i++) {
        const angle = (Math.PI*2) * (i/count);
        const speed = random(1.5, 4);
        const rgb = hsvToRgb(this.colorHue, 1, 1);
        const color = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, 0.015, 2, 0.02));
      }
    }
    createRingBurst(count) {
      // リング状に爆発する
      const radius = 50;
      for(let i=0; i<count; i++) {
        const angle = (Math.PI*2) * (i/count);
        const px = this.x + Math.cos(angle)*radius;
        const py = this.y + Math.sin(angle)*radius;
        const speed = random(1, 3);
        const rgb = hsvToRgb((this.colorHue + 60) % 360, 1, 1);
        const color = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        // 粒子は中心から外へ少しずつ広がるイメージ
        this.particles.push(new Particle(px, py, angle, speed, color, 0.02, 2, 0));
      }
    }
    createHeartBurst(count) {
      // ハート形状に爆発 (近似)
      for(let i=0; i<count; i++) {
        const t = (Math.PI*2) * (i/count);
        // ハートの極座標方程式 (r=1-cos(t)) を使う
        const r = 1 - Math.cos(t);
        const angle = t;
        const speed = r * random(1.5, 3.5);
        const rgb = hsvToRgb((this.colorHue + 330) % 360, 1, 1);
        const color = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, 0.02, 2, 0.01));
      }
    }
    createStarBurst(count) {
      // 星形状に爆発（5本の星の頂点方向に粒子集中）
      const spikes = 5;
      for(let i=0; i<count; i++) {
        const baseAngle = Math.floor(i / (count/spikes)) * (Math.PI*2/spikes);
        const offset = random(-Math.PI/(spikes*4), Math.PI/(spikes*4));
        const angle = baseAngle + offset;
        const speed = random(1.5, 3.5);
        const rgb = hsvToRgb((this.colorHue + 180) % 360, 1, 1);
        const color = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, 0.02, 2, 0.015));
      }
    }
    createPalmBurst(count) {
      // ヤシの木っぽい枝状爆発
      const branches = 6;
      for(let i=0; i<count; i++) {
        const branchAngle = Math.floor(i / (count/branches)) * (Math.PI*2/branches);
        const spread = random(0, Math.PI/12);
        const angle = branchAngle + (Math.random() > 0.5 ? spread : -spread);
        const speed = random(1.5, 4);
        const rgb = hsvToRgb((this.colorHue + 90) % 360, 1, 1);
        const color = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, 0.025, 2, 0.025));
      }
    }
    draw(ctx) {
      if (!this.isExploded) {
        // 打ち上げ中のトレイル
        ctx.save();
        ctx.strokeStyle = `hsl(${this.colorHue}, 100%, 75%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i < this.trail.length - 1; i++) {
          const p1 = this.trail[i];
          const p2 = this.trail[i+1];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
        ctx.restore();

        // 打ち上げ中の光点
        ctx.save();
        ctx.fillStyle = `hsl(${this.colorHue}, 100%, 80%)`;
        ctx.shadowColor = `hsl(${this.colorHue}, 100%, 90%)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      } else {
        // 爆発パーティクル描画
        this.particles.forEach(p => p.draw(ctx));
      }
    }
  }

  // メイン管理
  class FireworksManager {
    constructor() {
      this.fireworks = [];
      this.lastLaunchTime = 0;
      this.running = false;
      this.animationFrameId = null;
      this.launchInterval = 600; // ms
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.lastLaunchTime = performance.now();
      this.loop();
    }
    stop() {
      this.running = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      // 花火を全部消す
      this.fireworks = [];
      ctx.clearRect(0, 0, cw, ch);
    }
    isRunning() {
      return this.running;
    }
    launchFirework() {
      const x = random(cw * 0.1, cw * 0.9);
      const y = ch;
      const targetY = random(ch * 0.1, ch * 0.5);
      const hue = randomInt(0, 360);
      this.fireworks.push(new Firework(x, y, targetY, hue));
    }
    update() {
      const now = performance.now();
      if (now - this.lastLaunchTime > this.launchInterval) {
        this.launchFirework();
        this.lastLaunchTime = now;
      }
      this.fireworks.forEach(fw => fw.update());
      this.fireworks = this.fireworks.filter(fw => !fw.dead);
    }
    draw() {
      ctx.clearRect(0, 0, cw, ch);
      this.fireworks.forEach(fw => fw.draw(ctx));
    }
    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  // グローバルで制御できるように
  const manager = new FireworksManager();

  window.fireworksControl = {
    start: () => manager.start(),
    stop: () => manager.stop(),
    isRunning: () => manager.isRunning(),
  };

  // ページロード時に自動で開始
  window.addEventListener('load', () => {
    manager.start();
  });
})();