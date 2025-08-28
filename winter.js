(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('winterCanvas');
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
    }
    window.addEventListener('resize', resize);
    resize();

    const groundMap = new Array(Math.ceil(cw)).fill(ch);
    const groundDecay = 0.02;

    const snowTypes = [
      { shape: 'circle', sizeRange: [2,6] },
      { shape: 'hex', sizeRange: [4,8] },
      { shape: 'diamond', sizeRange: [3,7] },
    ];

    class Snowflake {
      constructor(){ this.reset(); }
      reset(){
        const type = snowTypes[Math.floor(Math.random() * snowTypes.length)];
        this.shape = type.shape;
        this.size = Math.random()*(type.sizeRange[1]-type.sizeRange[0])+type.sizeRange[0];
        this.x = Math.random() * cw;
        this.y = Math.random() * -ch;
        this.speedY = Math.random()*1+0.5;
        this.speedX = Math.random()*0.5-0.25;
        this.angle = Math.random()*Math.PI*2;
        this.rotationSpeed = (Math.random()-0.5)*0.02;
        this.opacity = Math.random()*0.5+0.5;
        this.onGround = false;
        this.life = 0;
        this.fadeSpeed = 0.01 + Math.random()*0.02;
        this.willAccumulate = Math.random() < 0.6;
      }
      update(){
        if(!this.onGround){
          this.x += this.speedX + Math.sin(this.angle)*0.3;
          this.y += this.speedY;
          this.angle += this.rotationSpeed;

          if(this.x<0) this.x += cw;
          if(this.x>cw) this.x -= cw;

          const ix = Math.floor(this.x);
          const groundY = groundMap[ix]-this.size/2;
          if(this.y >= groundY){
            if(this.willAccumulate){
              this.y = groundY;
              this.speedX = 0; this.speedY = 0; this.rotationSpeed = 0;
              this.onGround = true;

              const hillWidth = Math.floor(Math.random()*6+4);
              const hillHeight = Math.random()*2+1;
              for(let offset=-hillWidth; offset<=hillWidth; offset++){
                const idx = Math.min(Math.max(ix+offset,0),cw-1);
                groundMap[idx] -= hillHeight*(1-Math.abs(offset)/hillWidth);
              }

              // 雪オブジェクト追加
              if(Math.random()<0.03){
                snowObjects.push(new SnowObject(this.x, this.y));
              }

              this.life = 300 + Math.random()*1500;
              this.opacity = 1;
            } else {
              this.opacity -= this.fadeSpeed;
              if(this.opacity<=0) this.reset();
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
        ctx.fillStyle = '#fff';

        if(this.shape==='circle'){
          ctx.beginPath(); ctx.arc(0,0,this.size/2,0,Math.PI*2); ctx.fill();
        } else if(this.shape==='hex'){
          ctx.beginPath();
          for(let i=0;i<6;i++){
            const angle=Math.PI/3*i;
            ctx.lineTo(Math.cos(angle)*this.size, Math.sin(angle)*this.size);
          }
          ctx.closePath(); ctx.fill();
        } else if(this.shape==='diamond'){
          ctx.beginPath();
          ctx.moveTo(0,-this.size/2);
          ctx.lineTo(this.size/2,0);
          ctx.lineTo(0,this.size/2);
          ctx.lineTo(-this.size/2,0);
          ctx.closePath(); ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    class SnowObject {
      constructor(x, y){
        this.x=x; this.y=y;
        this.life = 400 + Math.random()*400; // フェードアウトまでのフレーム
        this.opacity = 1;
        const types=['snowman','tree','bunny','house'];
        this.type = types[Math.floor(Math.random()*types.length)];
        this.size = Math.random()*10 + 10;
      }
      update(){
        this.life--;
        this.opacity = Math.max(this.life/400,0);
      }
      draw(ctx){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle='#fff';
        ctx.strokeStyle='#ccc';

        if(this.type==='snowman'){
          ctx.beginPath();
          ctx.arc(0,0,this.size*0.5,0,Math.PI*2);
          ctx.arc(0,-this.size*0.6,this.size*0.35,0,Math.PI*2);
          ctx.arc(0,-this.size*1.0,this.size*0.25,0,Math.PI*2);
          ctx.fill();
        } else if(this.type==='tree'){
          ctx.beginPath();
          ctx.moveTo(0,-this.size);
          ctx.lineTo(this.size*0.6,this.size*0.6);
          ctx.lineTo(-this.size*0.6,this.size*0.6);
          ctx.closePath();
          ctx.fill();
        } else if(this.type==='bunny'){
          ctx.beginPath();
          ctx.arc(0,0,this.size*0.4,0,Math.PI*2);
          ctx.arc(-this.size*0.3,-this.size*0.5,this.size*0.15,0,Math.PI*2);
          ctx.arc(this.size*0.3,-this.size*0.5,this.size*0.15,0,Math.PI*2);
          ctx.fill();
        } else if(this.type==='house'){
          ctx.fillRect(-this.size*0.5,-this.size*0.5,this.size,this.size);
          ctx.beginPath();
          ctx.moveTo(-this.size*0.55,-this.size*0.5);
          ctx.lineTo(0,-this.size);
          ctx.lineTo(this.size*0.55,-this.size*0.5);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    const flakes = [];
    const snowObjects = [];
    for(let i=0;i<150;i++) flakes.push(new Snowflake());

    function animate(){
      ctx.clearRect(0,0,cw,ch);

      // 雪山時間で消える
      for(let i=0;i<groundMap.length;i++){
        groundMap[i] += groundDecay;
        if(groundMap[i]>ch) groundMap[i]=ch;
      }

      flakes.forEach(f=>{f.update();f.draw(ctx);});
      snowObjects.forEach(o=>{o.update();o.draw(ctx);});

      requestAnimationFrame(animate);
    }
    animate();

    window.winterControl={show:()=>canvas.style.display='block',hide:()=>canvas.style.display='none'};
    canvas.style.display='block';

    const toggleBtn=document.getElementById('winter-toggle');
    let winterOn=true;
    toggleBtn.addEventListener('click',()=>{
      winterOn=!winterOn;
      toggleBtn.textContent=winterOn?'雪ON':'雪OFF';
      winterOn?window.winterControl.show():window.winterControl.hide();
    });
  });
})();