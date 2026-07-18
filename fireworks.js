(() => {
  // 花火を描画するためのCanvas要素を取得
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) {
    console.warn('fireworks.js: canvas#fireworksCanvas が見つかりません');
    return;
  }
  const ctx = canvas.getContext('2d');
  let cw, ch;

  // ウィンドウサイズに合わせてCanvasの解像度と描画サイズを最適化する関数
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

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randomInt(min, max) {
    return Math.floor(random(min, max));
  }

  // 花火が爆発した後の「火花」の1粒1粒を表現・管理するクラス
  // 物理演算（重力、空気抵抗）や描画（軌跡、光り方）を担当
  class Particle {
    constructor(x, y, vx, vy, hue, brightness, decay, size, friction = 0.98, gravity = 0.05, flickering = false) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.hue = hue;
      this.brightness = brightness;
      this.alpha = 1;
      this.decay = decay;
      this.size = size;
      this.friction = friction;
      this.gravity = gravity;
      this.flickering = flickering;
      this.dead = false;
      this.trail = [];
      this.trailMaxLen = randomInt(2, 4);
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailMaxLen) this.trail.shift();

      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0) {
        this.dead = true;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha * 0.5})`;
        ctx.lineWidth = this.size;
        ctx.stroke();
      }

      let currentAlpha = this.alpha;
      if (this.flickering && Math.random() < 0.2) {
        currentAlpha *= 0.5;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${currentAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${currentAlpha * 0.3})`;
      ctx.fill();

      ctx.restore();
    }
  }

  // 花火の管理
  // 牡丹、菊、柳、ハートなどの様々な花火の形状その他打ち上げ等
  class Firework {
    constructor(x, y, targetY, hue) {
      this.x = x;
      this.y = y;
      this.targetY = targetY;
      this.hue = hue;
      this.isExploded = false;
      this.particles = [];
      this.speed = random(8, 14);
      this.angle = -Math.PI / 2 + random(-0.15, 0.15);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.trailMaxLen = 5;
      this.dead = false;
      this.type = randomInt(0, 6);
    }
    update() {
      if (!this.isExploded) {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailMaxLen) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;

        if (this.vy >= 0 || this.y <= this.targetY) {
          this.explode();
        }
      } else {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.dead);
        if (this.particles.length === 0) this.dead = true;
      }
    }
    explode() {
      this.isExploded = true;

      this.createFlash();

      const baseCount = 35 + randomInt(0, 35);
      switch (this.type) {
        case 0: this.createPeony(baseCount); break;
        case 1: this.createChrysanthemum(baseCount); break;
        case 2: this.createWillow(baseCount); break;
        case 3: this.createDoubleRing(30); break;
        case 4: this.createHeart(40); break;
        case 5: this.createStar(35); break;
        default: this.createPeony(baseCount);
      }
    }
    createFlash() {
      const p = new Particle(this.x, this.y, 0, 0, this.hue, 100, 0.1, 50, 0, 0);
      this.particles.push(p);
    }
    createPeony(count) {
      for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 8);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.particles.push(new Particle(this.x, this.y, vx, vy, this.hue, random(50, 80), random(0.015, 0.03), random(1, 2.5), 0.95, 0.04, true));
      }
    }
    createChrysanthemum(count) {
      for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(2, 9);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.particles.push(new Particle(this.x, this.y, vx, vy, this.hue, random(50, 100), random(0.008, 0.015), random(1, 2), 0.97, 0.05, false));
      }
    }
    createWillow(count) {
      for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 5);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.particles.push(new Particle(this.x, this.y, vx, vy, 40, random(50, 70), random(0.005, 0.01), random(1, 1.5), 0.94, 0.12, true));
      }
    }
    createDoubleRing(count) {
      for (let j = 0; j < 2; j++) {
        const radiusSpeed = j === 0 ? 3 : 7;
        const currentHue = j === 0 ? this.hue : (this.hue + 60) % 360;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2) * (i / count);
          const vx = Math.cos(angle) * radiusSpeed;
          const vy = Math.sin(angle) * radiusSpeed;
          this.particles.push(new Particle(this.x, this.y, vx, vy, currentHue, 70, 0.015, 2, 0.96, 0.02, false));
        }
      }
    }
    createHeart(count) {
      for (let i = 0; i < count; i++) {
        const t = (Math.PI * 2) * (i / count);
        const r = 2.5 - 2.5 * Math.sin(t) + Math.sin(t) * (Math.sqrt(Math.abs(Math.cos(t))) / (Math.sin(t) + 1.4));
        const scale = 2.0;
        const vx = Math.cos(t) * r * scale;
        const vy = -Math.sin(t) * r * scale;
        this.particles.push(new Particle(this.x, this.y, vx, vy, 340, 70, 0.015, 2, 0.95, 0.03, true));
      }
    }
    createStar(count) {
      const spikes = 5;
      for (let i = 0; i < count; i++) {
        const baseAngle = Math.floor(i / (count / spikes)) * (Math.PI * 2 / spikes) - Math.PI / 2;
        const offset = random(-Math.PI / (spikes * 4), Math.PI / (spikes * 4));
        const finalAngle = baseAngle + offset;
        const speed = random(3, 8);
        const vx = Math.cos(finalAngle) * speed;
        const vy = Math.sin(finalAngle) * speed;
        this.particles.push(new Particle(this.x, this.y, vx, vy, (this.hue + 45) % 360, 80, 0.015, 2, 0.96, 0.03, true));
      }
    }
    draw(ctx) {
      if (!this.isExploded) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (this.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, 0.5)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 80%, 1)`;
        ctx.fill();

        ctx.restore();
      } else {
        this.particles.forEach(p => p.draw(ctx));
      }
    }
  }

  // 打ち上げのタイミングの管理
  class FireworksManager {
    constructor() {
      this.fireworks = [];
      this.lastLaunchTime = 0;
      this.running = false;
      this.animationFrameId = null;
      this.launchInterval = 600;
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
      this.fireworks = [];
      ctx.clearRect(0, 0, cw, ch);
    }
    isRunning() {
      return this.running;
    }
    launchFirework() {
      if (this.fireworks.length > 10) return;

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
        if (Math.random() < 0.2) {
          setTimeout(() => this.launchFirework(), randomInt(100, 300));
        }
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

  window.fireworksControl = window.fireworksControl || {};
  const manager = new FireworksManager();
  window.fireworksControl.manager = manager;

  window.fireworksControl.start = () => manager.start();
  window.fireworksControl.stop = () => manager.stop();
  window.fireworksControl.isRunning = () => manager.isRunning();

  window.addEventListener('load', () => {
    manager.start();
  });
})();