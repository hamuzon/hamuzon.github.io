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

    let windOffset = 0;
    function updateWind() {
      windOffset += (Math.random()-0.5)*0.2;
      if(windOffset>1) windOffset=1;
      if(windOffset<-1) windOffset=-1;
    }

    const sakuraShapes = ['heart','ellipse','triangle']; // ランダム形状

    function getInitialY() {
      return Math.random()*ch - ch;
    }

    class Sakura {
      constructor(){ this.reset(); }
      reset(){
        this.shape = sakuraShapes[Math.floor(Math.random()*sakuraShapes.length)];
        this.size = 8 + Math.random()*12;
        this.color = `rgba(255,${150+Math.floor(Math.random()*50)},${180+Math.floor(Math.random()*75)},1)`;
        this.x = Math.random()*cw;
        this.y = getInitialY();
        this.speedY = 0.2 + Math.random()*1;
        this.speedX = -0.5 + Math.random();
        this.angle = Math.random()*Math.PI*2;
        this.rotationSpeed = -0.02 + Math.random()*0.04;
        this.onGround = false;

        // 消えるまでの寿命フレーム 50〜1800
        this.life = Math.floor(50 + Math.random()*1750);
        this.opacity = 1;
        this.fadeSpeed = 0.01 + Math.random()*0.03;
      }

      update(){
        if(!this.onGround){
          this.x += this.speedX + Math.sin(this.angle)*0.5 + windOffset*0.5;
          this.y += this.speedY;
          this.angle += this.rotationSpeed;

          if(this.x<0) this.x += cw;
          if(this.x>cw) this.x -= cw;

          const ix = Math.floor(this.x);
          const groundY = groundMap[ix]-this.size/2;
          if(this.y >= groundY){
            this.y = groundY;
            this.speedX = 0; this.speedY = 0; this.rotationSpeed = 0;
            this.onGround = true;

            // 小山化
            const hillWidth = Math.floor(Math.random()*6+4);
            const hillHeight = (Math.random()*1+0.5);
            for(let offset=-hillWidth;offset<=hillWidth;offset++){
              const idx = Math.min(Math.max(ix+offset,0),cw-1);
              groundMap[idx] -= hillHeight*(1-Math.abs(offset)/hillWidth);
            }
          }
        } else {
          this.life--;
          if(this.life<=0){
            this.opacity -= this.fadeSpeed;
            if(this.opacity<=0) this.reset();
          }
        }
      }

      draw(ctx){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        switch(this.shape){
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0,-this.size/2);
            ctx.lineTo(this.size/2,this.size/2);
            ctx.lineTo(-this.size/2,this.size/2);
            ctx.closePath();
            ctx.fill();
            break;
          case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(0,0,this.size/2,this.size/3,Math.PI/4,0,Math.PI*2);
            ctx.fill();
            break;
          case 'heart':
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.bezierCurveTo(this.size/2,-this.size/2,this.size,this.size/4,0,this.size/2);
            ctx.bezierCurveTo(-this.size,this.size/4,-this.size/2,-this.size/2,0,0);
            ctx.fill();
            break;
        }

        ctx.restore();
        ctx.globalAlpha=1;
      }
    }

    const sakuraCount = 100;
    const sakuras = [];
    for(let i=0;i<sakuraCount;i++) sakuras.push(new Sakura());

    function animate(){
      ctx.clearRect(0,0,cw,ch);
      updateWind();
      sakuras.forEach(s=>{ s.update(); s.draw(ctx); });
      requestAnimationFrame(animate);
    }
    animate();

    window.springControl = {
      show: ()=>canvas.style.display='block',
      hide: ()=>canvas.style.display='none'
    };
    canvas.style.display='block';

    const toggleBtn = document.getElementById('spring-toggle');
    if(toggleBtn){
      let springOn = true;
      toggleBtn.addEventListener('click', ()=>{
        springOn = !springOn;
        toggleBtn.textContent = springOn ? '桜ON' : '桜OFF';
        springOn ? window.springControl.show() : window.springControl.hide();
      });
    }
  });
})();