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
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  window.addEventListener('resize', resize);
  resize();

  // 落ち葉クラス
  class Leaf {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 1 + 0.5;
      this.speedX = Math.random() * 1 - 0.5;
      this.angle = Math.random() * 2 * Math.PI;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      const colors = ['#FF4500','#FF8C00','#FFD700','#FFA500','#FF6347'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
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
      ctx.beginPath();
      ctx.moveTo(0, -this.size/2);
      ctx.lineTo(this.size/2, this.size/2);
      ctx.lineTo(-this.size/2, this.size/2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // 落ち葉生成
  const leaves = [];
  const leafCount = 50;
  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf(Math.random()*cw, Math.random()*ch));
  }

  // アニメーションループ
  function animate() {
    ctx.clearRect(0, 0, cw, ch);
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw(ctx);
    });
    requestAnimationFrame(animate);
  }

  animate();

  // グローバルでON/OFF制御も可能
  window.autumnControl = {
    show: () => canvas.style.display = 'block',
    hide: () => canvas.style.display = 'none',
  };
})();