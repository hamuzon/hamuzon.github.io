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
      this.bounceFactor = -0.6; // 跳ね返り係数 (0に近いほど跳ねない)
      this.bounces = 0;
      this.maxBounces = 3; // 最大跳ね返り回数
      this.dead = false;
    }
    update() {
      this.vx *= 0.99; // 空気抵抗
      this.vy *= 0.99;
      this.vy += this.gravity; // 重力
      this.x += this.vx;
      this.y += this.vy;

      // 画面端での跳ね返り
      // 下の壁
      if (this.y + this.size >= ch && this.vy > 0) {
        this.y = ch - this.size; // 壁の内側に押し戻す
        this.vy *= this.bounceFactor;
        this.vx *= 0.95; // 地面との摩擦で横方向の速度を減衰
        this.bounces++;
      }
      // 上の壁
      if (this.y - this.size <= 0 && this.vy < 0) {
        this.y = this.size;
        this.vy *= this.bounceFactor;
      }
      // 左の壁
      if (this.x - this.size <= 0 && this.vx < 0) {
        this.x = this.size;
        this.vx *= this.bounceFactor;
      }
      // 右の壁
      if (this.x + this.size >= cw && this.vx > 0) {
        this.x = cw - this.size;
        this.vx *= this.bounceFactor;
      }

      this.alpha -= this.decay;
      if (this.alpha <= 0 || this.bounces >= this.maxBounces) {
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
      const count = randomInt(30, 50);
      for(let i=0; i<count; i++) {
        // 投げる角度: 指定された方向を中心に扇状に
        const angle = angleRange.base + random(-angleRange.spread, angleRange.spread);
        const speed = random(15, 25); // 初速
        const color = getSetsubunColor();
        // 重力を強め(0.4)にして放物線を描く
        this.particles.push(new Particle(this.x, this.y, angle, speed, color, random(0.008, 0.015), random(4, 8), 0.4));
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