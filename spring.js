(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('springCanvas');
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

    const petalTypes = [
      { shape: 'ellipse', sizeRange: [6,12], colors: ['#FFC0CB','#FFB6C1','#FF69B4'], hillFactor: 0.8 },
      { shape: 'triangle', sizeRange: [5,10], colors: ['#FFD1DC','#FFB3C6','#FF8DAA'], hillFactor: 0.6 }
    ];

    function getPetalInitialY() {
      return Math.random() * ch - ch;
    }

    let windOffset = 0;
    function updateWind() {
      windOffset += (Math.random()-0.5)*0.2;
      windOffset = Math.max(-1, Math.min(1, windOffset));
    }

    class Petal {
      constructor() { this.reset(); }
      reset() {
        const type = petalTypes[Math.floor(Math.random()*petalTypes.length)];
        this.shape = type.shape;
        this.size = Math.random()*(type.sizeRange[1]-type.sizeRange[0])+type.sizeRange[0];
        this.color = type.colors[Math.floor(Math.random()*type.colors.length)];
        this.hillFactor = type.hillFactor;

        this.x = Math.random()*cw;
        this.y = getPetalInitialY();
        this.speedY = Math.random()*1 + 0.5;
        this.speedX = Math.random()*0.5 - 0.25;
        this.angle = Math.random()*Math.PI*2;
        this.rotationSpeed = (Math.random()-0.5)*0.05;
        this.onGround = false;
        this.life = 0;
        this.opacity = 1;
        this.fadeSpeed = 0.02 + Math.random()*0.03; // 消える速度ランダム
      }
      update() {
        if(!this.onGround){
          this.x += this.speedX + Math.sin(this.angle)*0.3 + windOffset*0.5;
          this.y += this.speedY;
          this.angle += this.rotationSpeed;

          if(this.x < 0) this.x += cw;
          if(this.x > cw) this.x -= cw;

          const ix = Math.floor(this.x);
          const groundY = groundMap[ix] - this.size/2;
          if(this.y >= groundY){
            this.y = groundY;
            this.speedX = 0; this.speedY = 0; this.rotationSpeed = 0;
            this.onGround = true;

            const hillWidth = Math.floor(Math.random()*6+3)*this.hillFactor;
            const hillHeight = (Math.random()*1+0.5)*this.hillFactor;
            for(let offset=-hillWidth; offset<=hillWidth; offset++){
              const idx = Math.min(Math.max(ix+offset,0), cw-1);
              groundMap[idx] -= hillHeight*(1-Math.abs(offset)/hillWidth);
            }

            this.life = 50 + Math.random()*100; // 直ぐ消える時間をランダム
          }
        } else {
          this.life--;
          if(this.life <= 0){
            this.opacity -= this.fadeSpeed;
            if(this.opacity <= 0) this.reset();
          }
        }
      }
      draw(ctx) {
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
          ctx.ellipse(0,0,this.size/2,this.size/3,Math.PI/6,0,Math.PI*2);
          ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    const petalCountMax = 100;
    const petals = [];
    for(let i=0;i<petalCountMax;i++) petals.push(new Petal());

    function animate() {
      ctx.clearRect(0,0,cw,ch);
      updateWind();
      petals.forEach(p=>{ p.update(); p.draw(ctx); });
      requestAnimationFrame(animate);
    }
    animate();

    window.springControl = {
      show: ()=>canvas.style.display='block',
      hide: ()=>canvas.style.display='none'
    };

    canvas.style.display = 'block';
    const toggleBtn = document.getElementById('spring-toggle');
    let springOn = true;
    toggleBtn.addEventListener('click', ()=>{
      springOn = !springOn;
      toggleBtn.textContent = springOn ? '桜ON' : '桜OFF';
      springOn ? window.springControl.show() : window.springControl.hide();
    });
  });
})();
