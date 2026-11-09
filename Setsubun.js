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

  // 節分カラー（福豆・赤鬼・青鬼）
  function getSetsubunColor() {
    const colors = [
      'rgba(255, 235, 190, 1)', // 福豆（クリーム色）
      'rgba(255, 235, 190, 1)',
      'rgba(255, 235, 190, 1)', // 豆の比率を高めに
      'rgba(255, 60, 60, 1)',   // 赤鬼
      'rgba(60, 100, 255, 1)',  // 青鬼
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.18;
      this.bounceFactor = -0.3;
      this.bounces = 0;
      this.maxBounces = 2;
      this.dead = false;
    }
    update() {
      this.vx *= 0.995;
      this.vy *= 0.995;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      if (this.y + this.size >= ch && this.vy > 0) {
        this.y = ch - this.size;
        this.vy *= this.bounceFactor;
        this.vx *= 0.75;
        this.bounces++;
      }

      this.alpha -= this.decay;
      if (
        this.alpha <= 0 ||
        this.bounces >= this.maxBounces ||
        this.x < -this.size * 2 ||
        this.x > cw + this.size * 2 ||
        this.y < -this.size * 2
      ) {
        this.dead = true;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.size, this.size * 0.72);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.strokeStyle = 'rgba(125, 86, 45, 0.55)';
      ctx.lineWidth = 0.12;
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.bezierCurveTo(-1.25, -0.55, -0.35, -1.05, 0.35, -0.72);
      ctx.bezierCurveTo(1.05, -0.45, 1.15, 0.35, 0.45, 0.78);
      ctx.bezierCurveTo(-0.2, 1.02, -0.9, 0.58, -1, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.48, -0.2);
      ctx.quadraticCurveTo(-0.25, 0, -0.42, 0.22);
      ctx.strokeStyle = 'rgba(125, 86, 45, 0.7)';
      ctx.lineWidth = 0.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.1, -0.52);
      ctx.quadraticCurveTo(0.35, -0.68, 0.62, -0.4);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 0.1;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 花火本体
  class Firework {
    constructor(x, y, angleRange) {
      this.x = x;
      this.y = y;
      this.isExploded = true;
      this.particles = [];
      this.dead = false;
      this.throwBeans(angleRange);
    }
    
    throwBeans(angleRange) {
      // 一度に投げる豆の数
      const count = randomInt(24, 38);
      for(let i=0; i<count; i++) {
        // 投げる角度: 指定された方向を中心に扇状に
        const angle = angleRange.base + random(-angleRange.spread, angleRange.spread);
        const speed = random(8, 15);
        const color = getSetsubunColor();
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, random(0.006, 0.012), random(6, 9), 0.22));
      }
    }

    update() {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.dead);
      if (this.particles.length === 0) this.dead = true;
    }

    draw(ctx) {
      this.particles.forEach(p => p.draw(ctx));
    }
  }

  // メイン管理
  class FireworksManager {
    constructor() {
      this.fireworks = [];
      this.lastLaunchTime = 0;
      this.running = false;
      this.animationFrameId = null;
      this.launchInterval = 300; // 投げる間隔を短く
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
      const side = randomInt(0, 4); // 0:下, 1:左, 2:上, 3:右
      let x, y, angleRange;

      switch(side) {
        case 0: // 下から上へ
          x = random(cw * 0.2, cw * 0.8);
          y = ch;
          angleRange = { base: -Math.PI / 2, spread: 0.7 };
          break;
        case 1: // 左から右へ
          x = 0;
          y = random(ch * 0.2, ch * 0.8);
          angleRange = { base: 0, spread: 0.7 };
          break;
        case 2: // 上から下へ
          x = random(cw * 0.2, cw * 0.8);
          y = 0;
          angleRange = { base: Math.PI / 2, spread: 0.7 };
          break;
        case 3: // 右から左へ
          x = cw;
          y = random(ch * 0.2, ch * 0.8);
          angleRange = { base: Math.PI, spread: 0.7 };
          break;
      }
      this.fireworks.push(new Firework(x, y, angleRange));
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