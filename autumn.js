// autumn.js
(() => {
  const canvas = document.getElementById('autumnCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let cw = window.innerWidth;
  let ch = window.innerHeight;

  const groundMap = new Array(Math.ceil(cw)).fill(ch);

  function resize() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw * devicePixelRatio;
    canvas.height = ch * devicePixelRatio;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    for(let i=0;i<groundMap.length;i++) groundMap[i]=ch;
  }
  window.addEventListener('resize', resize);
  resize();

  // 葉っぱの種類
  const leafTypes = [
    { shape:'triangle', sizeRange:[6,12], colors:['#FF4500','#FF6347','#FF7F50'], hillFactor:1.0 },
    { shape:'ellipse', sizeRange:[8,14], colors:['#FFA500','#FFD700','#FFB347'], hillFactor:1.2 },
    { shape:'ellipse', sizeRange:[10,18], colors:['#FF8C00','#FF9933','#FFD166'], hillFactor:1.5 },
  ];

  // 端末別落下Y初期値
  function getLeafInitialY() {
    const w = window.innerWidth;
    if(w < 768) return Math.random() * (ch*0.6) - ch; // スマホ
    if(w < 1200) return Math.random() * (ch*0.8) - ch; // タブレット
    return Math.random() * ch - ch; // PC
  }

  // 風向きランダム変化用
  let windOffset = 0;
  function updateWind() {
    // 徐々に変化する風向き
    windOffset += (Math.random()-0.5)*0.2;
    if(windOffset > 1) windOffset = 1;
    if(windOffset < -1) windOffset = -1;
  }

  class Leaf {
    constructor(){
      this.reset();
    }
    reset(){
      const type = leafTypes[Math.floor(Math.random()*leafTypes.length)];
      this.shape = type.shape;
      this.size = Math.random()*(type.sizeRange[1]-type.sizeRange[0])+type.sizeRange[0];
      this.color = type.colors[Math.floor(Math.random()*type.colors.length)];
      this.hillFactor = type.hillFactor;

      this.x = Math.random()*cw;
      this.y = getLeafInitialY();
      this.speedY = Math.random()*1+0.5;
      this.speedX = Math.random()*0.5-0.25; // 基本横揺れ少し
      this.angle = Math.random()*Math.PI*2;
      this.rotationSpeed = (Math.random()-0.5)*0.05;
      this.onGround = false;
      this.life = 0;
      this.opacity = 1;
    }
    update(){
      if(!this.onGround){
        // 風による横揺れを加算
        this.x += this.speedX + Math.sin(this.angle)*0.5 + windOffset*0.5;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;

        if(this.x<0) this.x += cw;
        if(this.x>cw) this.x -= cw;

        const ix = Math.floor(this.x);
        const groundY = groundMap[ix]-this.size/2;
        if(this.y >= groundY){
          this.y = groundY;
          this.speedX = 0;
          this.speedY = 0;
          this.rotationSpeed = 0;
          this.onGround = true;

          // 小山化
          const hillWidth = Math.floor(Math.random()*8 + 4)*this.hillFactor;
          const hillHeight = (Math.random()*1 + 0.5)*this.hillFactor;
          for(let offset=-hillWidth; offset<=hillWidth; offset++){
            const idx = Math.min(Math.max(ix+offset,0),cw-1);
            groundMap[idx] -= hillHeight*(1-Math.abs(offset)/hillWidth);
          }

          this.life = 200 + Math.random()*300;
          this.opacity = 1;
        }
      } else {
        // 地面にある葉っぱの寿命を減らす
        this.life--;
        if(this.life <= 0){
          this.opacity -= 0.02; // フェードアウト
          if(this.opacity <= 0){
            this.reset();
          }
        }
      }
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      if(this.shape==='triangle'){
        ctx.beginPath();
        ctx.moveTo(0,-this.size/2);
        ctx.lineTo(this.size/2,this.size/2);
        ctx.lineTo(-this.size/2,this.size/2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0,0,this.size/2,this.size/3,Math.PI/4,0,Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  const leafCountMax = 120; // 最大葉数
  const leaves = [];
  for(let i=0;i<leafCountMax;i++) leaves.push(new Leaf());

  function animate(){
    ctx.clearRect(0,0,cw,ch);
    updateWind();
    leaves.forEach(leaf=>{
      leaf.update();
      leaf.draw(ctx);
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.autumnControl = {
    show: ()=>canvas.style.display='block',
    hide: ()=>canvas.style.display='none'
  };
})();