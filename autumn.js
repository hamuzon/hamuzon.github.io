(() => {
  const canvas = document.getElementById('autumnCanvas');
  if (!canvas) {
    console.warn('autumn.js: canvas#autumnCanvas が見つかりません');
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
  function random(min, max){ return Math.random()*(max-min)+min; }
  function randomInt(min, max){ return Math.floor(random(min,max)); }

  // 落ち葉クラス
  class Leaf {
    constructor() { this.reset(); }
    reset() {
      this.x = random(0, cw);
      this.y = random(-ch, 0);
      this.size = random(10, 20);
      this.speedY = random(1, 2);
      this.speedX = random(-0.5,0.5);
      this.rotation = random(0, Math.PI*2);
      this.rotationSpeed = random(-0.02,0.02);
      this.color = `hsl(${random(20,40)}, 80%, ${random(40,60)}%)`;
      this.onGround = false;
      this.groundOffset = random(0, 20); // 地面で微妙にずらす
    }
    update() {
      if(!this.onGround){
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // 地面に到達したら止まって溜まる
        if(this.y >= ch - this.size - this.groundOffset){
          this.y = ch - this.size - this.groundOffset;
          this.speedX = 0;
          this.speedY = 0;
          this.rotationSpeed = 0;
          this.onGround = true;
        }

        // 左右ループ
        if(this.x < -this.size) this.x = cw + this.size;
        if(this.x > cw + this.size) this.x = -this.size;
      }
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size*0.5, this.size, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 落ち葉管理
  const leaves = [];
  const leafCount = 70; // 葉っぱの数
  for(let i=0;i<leafCount;i++) leaves.push(new Leaf());

  // メインループ
  function loop(){
    ctx.clearRect(0,0,cw,ch);
    leaves.forEach(leaf=>{
      leaf.update();
      leaf.draw(ctx);
    });
    requestAnimationFrame(loop);
  }

  loop();
})();