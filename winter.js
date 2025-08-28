(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('winterCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    // キャンバスリサイズ
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

    // 雪の粒クラス
    class Snowflake {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * cw;
        this.y = Math.random() * -ch;
        this.size = Math.random() * 6 + 2;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      update() {
        this.x += this.speedX + Math.sin(this.angle) * 0.3;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
        if (this.y > ch) this.reset();
        if (this.x < 0) this.x += cw;
        if (this.x > cw) this.x -= cw;
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    // 雪の粒生成
    const flakes = [];
    const flakeCount = 120;
    for (let i = 0; i < flakeCount; i++) flakes.push(new Snowflake());

    // アニメーションループ
    function animate() {
      ctx.clearRect(0, 0, cw, ch);
      flakes.forEach(f => { f.update(); f.draw(ctx); });
      requestAnimationFrame(animate);
    }
    animate();

    // 冬アニメON/OFF制御
    window.winterControl = {
      show: () => canvas.style.display = 'block',
      hide: () => canvas.style.display = 'none'
    };
    canvas.style.display = 'block';

    const toggleBtn = document.getElementById('winter-toggle');
    let winterOn = true;
    toggleBtn.addEventListener('click', () => {
      winterOn = !winterOn;
      toggleBtn.textContent = winterOn ? '雪ON' : '雪OFF';
      winterOn ? window.winterControl.show() : window.winterControl.hide();
    });
  });
})();