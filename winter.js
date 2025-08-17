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
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * cw;
      this.y = Math.random() * ch - ch;
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.radius = Math.random() * 3 + 2;
      this.opacity = Math.random() * 0.5 + 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.shape = 'flake';

      // 8%の確率で特別オブジェクト
      if (Math.random() < 0.08) {
        const types = [
          'bigflake', 'snowman', 'star', 'heart', 'gift', 'tree', 'bell', 'snowflakeFancy'
        ];
        this.shape = types[Math.floor(Math.random() * types.length)];
        this.radius = Math.random() * 15 + 10;
        this.speedY = Math.random() * 0.7 + 0.3;
        this.speedX = 0; // 特別オブジェクトは横揺れ少なめ
      }
    }

    update() {
      if(this.shape === 'flake') {
        this.x += this.speedX + Math.sin(this.angle) * 0.5;
        this.y += this.speedY;
      } else {
        this.y += this.speedY;
      }
      this.angle += this.rotationSpeed;

      if(this.y >= ch - Snowflake.snowHeight[Math.floor(this.x)]) {
        Snowflake.snowHeight[Math.floor(this.x)] += this.radius * 0.3;
        this.reset();
        this.y = -this.radius;
      }

      if(this.x > cw + this.radius) this.x = -this.radius;
      if(this.x < -this.radius) this.x = cw + this.radius;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      switch(this.shape) {
        case 'flake':
          ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
          ctx.beginPath();
          ctx.arc(0,0,this.radius,0,Math.PI*2);
          ctx.fill();
          break;

        case 'bigflake':
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          for(let i=0;i<6;i++){
            ctx.lineTo(this.radius*Math.cos(i*Math.PI/3), this.radius*Math.sin(i*Math.PI/3));
          }
          ctx.closePath();
          ctx.fill();
          break;

        case 'snowman':
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(0,0,this.radius/2,0,Math.PI*2);
          ctx.arc(0,-this.radius*0.6,this.radius/3,0,Math.PI*2);
          ctx.arc(0,-this.radius*1.0,this.radius/4,0,Math.PI*2);
          ctx.fill();
          break;

        case 'star':
          ctx.fillStyle = 'yellow';
          ctx.beginPath();
          for(let i=0;i<5;i++){
            ctx.lineTo(this.radius*Math.cos((18+i*72)*Math.PI/180),
                       this.radius*Math.sin((18+i*72)*Math.PI/180));
            ctx.lineTo(this.radius/2*Math.cos((54+i*72)*Math.PI/180),
                       this.radius/2*Math.sin((54+i*72)*Math.PI/180));
          }
          ctx.closePath();
          ctx.fill();
          break;

        case 'heart':
          ctx.fillStyle = 'pink';
          ctx.beginPath();
          ctx.moveTo(0,0);
          ctx.bezierCurveTo(-this.radius,-this.radius/2,-this.radius,this.radius/2,0,this.radius);
          ctx.bezierCurveTo(this.radius,this.radius/2,this.radius,-this.radius/2,0,0);
          ctx.fill();
          break;

        case 'gift':
          ctx.fillStyle = 'red';
          ctx.fillRect(-this.radius/2,-this.radius/2,this.radius,this.radius);
          ctx.strokeStyle = 'gold';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-this.radius/2,0); ctx.lineTo(this.radius/2,0);
          ctx.moveTo(0,-this.radius/2); ctx.lineTo(0,this.radius/2);
          ctx.stroke();
          break;

        case 'tree':
          ctx.fillStyle = 'green';
          for(let i=0;i<3;i++){
            ctx.beginPath();
            ctx.moveTo(0,-this.radius*i*0.6);
            ctx.lineTo(-this.radius/2*(3-i),this.radius*0.6-i*2);
            ctx.lineTo(this.radius/2*(3-i),this.radius*0.6-i*2);
            ctx.closePath();
            ctx.fill();
          }
          break;

        case 'bell':
          ctx.fillStyle = 'gold';
          ctx.beginPath();
          ctx.moveTo(0,-this.radius/2);
          ctx.lineTo(-this.radius/2,this.radius/2);
          ctx.lineTo(this.radius/2,this.radius/2);
          ctx.closePath();
          ctx.fill();
          break;

        case 'snowflakeFancy':
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for(let i=0;i<6;i++){
            ctx.moveTo(0,0);
            ctx.lineTo(this.radius*Math.cos(i*Math.PI/3),this.radius*Math.sin(i*Math.PI/3));
          }
          ctx.stroke();
          break;
      }

      ctx.restore();
    }
  }

  Snowflake.snowHeight = new Array(cw|0).fill(0);

  const snowCount = 120;
  const flakes = [];
  for(let i=0;i<snowCount;i++){
    flakes.push(new Snowflake());
  }

  function drawSnowGround(){
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(0,ch);
    for(let x=0;x<cw;x++){
      ctx.lineTo(x,ch-Snowflake.snowHeight[x]);
    }
    ctx.lineTo(cw,ch);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate(){
    ctx.clearRect(0,0,cw,ch);
    flakes.forEach(f=>{
      f.update();
      f.draw(ctx);
    });
    drawSnowGround();
    requestAnimationFrame(animate);
  }

  animate();

  window.winterControl = {
    show: ()=>canvas.style.display='block',
    hide: ()=>canvas.style.display='none'
  };
})();