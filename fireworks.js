(() => {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let cw, ch;

  function resize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const random = (min, max) => Math.random() * (max - min) + min;
  const dist = (aX, aY, bX, bY) => Math.hypot(bX - aX, bY - aY);

  const fireworks = [];
  const particles = [];

  let baseHue = random(0, 360);

  class Firework {
    constructor(sx, sy, tx, ty) {
      this.x = sx;
      this.y = sy;
      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = dist(sx, sy, tx, ty);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 5;
      while(this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.atan2(ty - sy, tx - sx);
      this.speed = random(4, 7);
      this.acceleration = 1.05;
      this.brightness = random(50, 80);
      this.targetRadius = 2;
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      this.speed *= this.acceleration;

      let vx = Math.cos(this.angle) * this.speed;
      let vy = Math.sin(this.angle) * this.speed;

      this.distanceTraveled = dist(this.sx, this.sy, this.x + vx, this.y + vy);

      if(this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty);
        fireworks.splice(index, 1);
      } else {
        this.x += vx;
        this.y += vy;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length -1][0], this.coordinates[this.coordinates.length -1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsl(${baseHue}, 100%, ${this.brightness}%)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  class Particle {
    constructor(x, y, color, shape) {
      this.x = x;
      this.y = y;
      this.coordinates = [];
      this.coordinateCount = 5;
      while(this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.speed = random(1, 8);
      this.friction = 0.95;
      this.gravity = 0.06;
      this.alpha = 1;
      this.decay = random(0.008, 0.015);
      this.brightness = random(50, 90);
      this.hue = color;
      this.shape = shape;
      this.angle = 0;
      this.angleVelocity = 0;
      this.radius = 0;
      this.radiusSpeed = 0;

      switch(shape) {
        case 'circle':
          this.angle = random(0, Math.PI * 2);
          break;
        case 'ring':
          this.radius = random(10, 30);
          this.radiusSpeed = random(0.1, 0.3);
          this.angle = random(0, Math.PI * 2);
          this.angleVelocity = random(0.05, 0.1);
          break;
        case 'heart':
          this.angle = random(0, Math.PI * 2);
          this.speed = random(2, 5);
          break;
        case 'star':
          this.angle = random(0, Math.PI * 2);
          this.speed = random(3, 6);
          break;
        default:
          this.angle = random(0, Math.PI * 2);
          break;
      }
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      switch(this.shape) {
        case 'circle':
          this.speed *= this.friction;
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed + this.gravity;
          break;
        case 'ring':
          this.angle += this.angleVelocity;
          this.x += Math.cos(this.angle) * this.radiusSpeed * this.radius;
          this.y += Math.sin(this.angle) * this.radiusSpeed * this.radius;
          this.radius *= 0.97;
          this.alpha -= this.decay * 0.5;
          break;
        case 'heart':
          const t = this.angle;
          const scale = this.speed;
          this.x += scale * 16 * Math.pow(Math.sin(t), 3);
          this.y += scale * -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) + this.gravity;
          this.angle += 0.15;
          this.alpha -= this.decay;
          break;
        case 'star':
          this.speed *= this.friction;
          this.x += Math.cos(this.angle) * this.speed + random(-1,1);
          this.y += Math.sin(this.angle) * this.speed + this.gravity + random(-1,1);
          this.angle += 0.2;
          this.alpha -= this.decay;
          break;
        default:
          this.speed *= this.friction;
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed + this.gravity;
          this.alpha -= this.decay;
          break;
      }

      if (this.alpha <= 0) {
        particles.splice(index, 1);
      }
    }

    draw() {
      ctx.beginPath();
      const last = this.coordinates[this.coordinates.length -1];
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(this.x, this.y);

      ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
      ctx.lineWidth = 2;

      switch(this.shape) {
        case 'heart':
          ctx.strokeStyle = `hsla(${this.hue}, 90%, ${this.brightness}%, ${this.alpha})`;
          ctx.lineWidth = 3;
          break;
        case 'star':
          ctx.lineWidth = 1.5;
          break;
        case 'ring':
          ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha * 0.7})`;
          ctx.lineWidth = 1.2;
          break;
        default:
          break;
      }

      ctx.stroke();
    }
  }

  function createParticles(x, y) {
    baseHue = (baseHue + random(30, 60)) % 360;
    const shapes = ['circle', 'ring', 'heart', 'star', 'scatter'];
    const shape = shapes[Math.floor(random(0, shapes.length))];
    const count = 40;
    for(let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, baseHue, shape));
    }
  }

  function loop() {
    if (!running) return;  // 花火OFFなら描画ループしない

    requestAnimationFrame(loop);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';

    for(let i = fireworks.length -1; i >= 0; i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    for(let i = particles.length -1; i >= 0; i--) {
      particles[i].draw();
      particles[i].update(i);
    }
  }

  function launchFirework() {
    if (!running) return; // 花火OFFなら発射しない
    const startX = cw / 2;
    const startY = ch;
    const targetX = random(100, cw - 100);
    const targetY = random(50, ch / 2);
    fireworks.push(new Firework(startX, startY, targetX, targetY));
  }

  let launchTimer = null;
  let running = true; // 初期はON

  function launchLoop() {
    if (!running) return;
    launchFirework();
    launchTimer = setTimeout(launchLoop, random(700, 1500));
  }

  function startFireworks() {
    if (running) return;
    running = true;
    launchLoop();
    loop();
  }

  function stopFireworks() {
    running = false;
    clearTimeout(launchTimer);
  }

  // 最初に開始
  launchLoop();
  loop();

  // グローバルに公開してボタンから操作可能にする
  window.fireworksControl = {
    start: startFireworks,
    stop: stopFireworks,
    isRunning: () => running,
  };
})();