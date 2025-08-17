(() => {
  const canvas = document.getElementById('autumnCanvas');
  if (!canvas) {
    console.warn('autumn.js: canvas#autumnCanvas が見つかりません');
    return;
  }
  const ctx = canvas.getContext('2d');
  let cw = window.innerWidth;
  let ch = window.innerHeight;

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

  // 落ち葉クラス
  class Leaf {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * cw;
      this.y = Math.random() * ch - ch;
      this.size = Math.random() * 12 + 6; // 6〜18px
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = Math.random() * 1 - 0.5;
      this.angle = Math.random() * 2 * Math.PI;
      this.rotationSpeed = (Math.random() - 0.5) * 0.05;
      this.offset = Math.random() * 1000; // 横揺れ
      const colors = ['#FF4500', '#FF6347', '#FF8C00', '#FFA500', '#FFD700'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = Math.random() < 0.5 ? 'triangle' : 'ellipse';
    }

    update() {
      this.x += this.speedX + Math.sin(this.angle + this.offset) * 0.5;
      this.y += this.speedY;
      this.angle += this.rotationSpeed;

      if (this.y > ch + this.size) this.y = -this.size;
      if (this.x > cw + this.size) this.x = -this.size;
      if (this.x < -this.size) this.x = cw + this.size;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;

      if (this.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(this.size/2, this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size/2, this.size/3, Math.PI/4, 0, Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 落ち葉生成
  const leafCount = 80;
  const leaves = [];
  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }

  // アニメーション
  function animate() {
    ctx.clearRect(0, 0, cw, ch);
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw(ctx);
    });
    requestAnimationFrame(animate);
  }

  animate();

  // ON/OFF制御
  window.autumnControl = {
    show: () => canvas.style.display = 'block',
    hide: () => canvas.style.display = 'none',
  };
})();