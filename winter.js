(() => {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let cw = window.innerWidth;
  let ch = window.innerHeight;

  function resize() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw * devicePixelRatio;
    canvas.height = ch * devicePixelRatio;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    Snowflake.snowHeight = new Array(cw|0).fill(0);
  }
  window.addEventListener('resize', resize);
  resize();

  class Snowflake {
    constructor(isBig = false) {
      this.isBig = isBig;
      this.reset();
    }

    reset() {
      this.x = Math.random() * cw;
      this.y = Math.random() * ch - ch;
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;

      if (this.isBig) {
        this.radius = Math.random() * 20 + 15; // 大きめオブジェクト
        this.speedY = Math.random() * 0.7 + 0.3;
        this.shape = Math.random() < 0.5 ? 'snowman' : 'bigflake';
      } else {
        this.radius = Math.random() * 3 + 2;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.shape = 'flake';
      }
    }

    update() {
      if (this.shape === 'flake') {
        this.x += this.speedX + Math.sin(this.angle) * 0.5;
        this.y += this.speedY;
      } else {
        this.y += this.speedY;
      }
      this.angle += this.rotationSpeed;

      // 積雪処理
      if (this.y >= ch - Snowflake.snowHeight[Math.floor(this.x)]) {
        Snowflake.snowHeight[Math.floor(this.x)] += this.radius * 0.3;
        this.reset();
        this.y = -this.radius;
      }

      if (this.x > cw + this.radius) this.x = -this.radius;
      if (this.x < -this.radius) this.x = cw + this.radius;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.shape === 'flake') {
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fill();
      } else if (this.shape === 'bigflake') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.moveTo(0,-this.radius);
        for(let i=0;i<6;i++){
          ctx.lineTo(this.radius*Math.cos(i*Math.PI/3), this.radius*Math.sin(i*Math.PI/3));
        }
        ctx.closePath();
        ctx.fill();
      } else if (this.shape === 'snowman') {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius/2, 0, Math.PI*2);
        ctx.arc(0, -this.radius*0.6, this.radius/3, 0, Math.PI*2);
        ctx.arc(0, -this.radius*1.0, this.radius/4, 0, Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 積雪高さ
  Snowflake.snowHeight = new Array(cw|0).fill(0);

  // 粒子生成
  const snowCount = 120;
  const flakes = [];
  for(let i=0;i<snowCount;i++){
    const isBig = Math.random() < 0.12; // 12%確率で大きな雪オブジェクト
    flakes.push(new Snowflake(isBig));
  }

  function drawSnowGround() {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(0,ch);
    for(let x=0;x<cw;x++){
      ctx.lineTo(x,ch - Snowflake.snowHeight[x]);
    }
    ctx.lineTo(cw,ch);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0,0,cw,ch);
    flakes.forEach(f => {
      f.update();
      f.draw(ctx);
    });
    drawSnowGround();
    requestAnimationFrame(animate);
  }

  animate();

  window.winterControl = {
    show: () => canvas.style.display = 'block',
    hide: () => canvas.style.display = 'none',
  };
})();