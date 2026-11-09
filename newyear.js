(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("newyearCanvas");
    const toggle = document.getElementById("newyear-toggle");
    const context = canvas?.getContext("2d");
    if (!canvas || !toggle || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let enabled = false;
    const blossoms = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 4 + Math.random() * 7,
      speed: 0.18 + Math.random() * 0.55,
      sway: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.018,
      color: ["#bd3546", "#d97679", "#f2c5a5", "#f4d477"][Math.floor(Math.random() * 4)],
      opacity: 0.35 + Math.random() * 0.45
    }));
    const confetti = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 3 + Math.random() * 5,
      speed: 0.25 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI,
      color: Math.random() < 0.5 ? "#b8323e" : "#d39a3c",
      opacity: 0.45 + Math.random() * 0.4
    }));
    const newYearSymbols = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 20 + Math.random() * 12,
      speed: 0.16 + Math.random() * 0.3,
      sway: Math.random() * Math.PI * 2,
      symbol: ["🍊", "🎍", "🎴", "🧧"][Math.floor(Math.random() * 4)]
    }));

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawBlossom(blossom) {
      const x = blossom.x * width;
      const y = blossom.y * height;
      context.save();
      context.translate(x, y);
      context.rotate(blossom.rotation);
      context.globalAlpha = blossom.opacity;
      context.fillStyle = blossom.color;
      for (let petal = 0; petal < 5; petal += 1) {
        context.save();
        context.rotate((Math.PI * 2 * petal) / 5);
        context.beginPath();
        context.ellipse(0, -blossom.size * 0.72, blossom.size * 0.38, blossom.size * 0.68, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      context.fillStyle = "#d9a640";
      context.beginPath();
      context.arc(0, 0, blossom.size * 0.2, 0, Math.PI * 2);
      context.fill();
      context.restore();

      blossom.rotation += blossom.rotationSpeed;
      blossom.sway += 0.012;
      blossom.y += blossom.speed / height;
      blossom.x += Math.sin(blossom.sway) * 0.00045;
      if (blossom.y > 1.04) {
        blossom.y = -0.04;
        blossom.x = Math.random();
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      blossoms.forEach(drawBlossom);
      confetti.forEach((piece) => {
        piece.sway += 0.018;
        piece.rotation += 0.025;
        piece.y += piece.speed / height;
        piece.x += Math.sin(piece.sway) * 0.0004;
        if (piece.y > 1.03) {
          piece.y = -0.03;
          piece.x = Math.random();
        }
        context.save();
        context.translate(piece.x * width, piece.y * height);
        context.rotate(piece.rotation);
        context.globalAlpha = piece.opacity;
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size, piece.size, piece.size * 2);
        context.restore();
      });
      newYearSymbols.forEach((item) => {
        item.sway += 0.014;
        item.y += item.speed / height;
        item.x += Math.sin(item.sway) * 0.0003;
        if (item.y > 1.04) {
          item.y = -0.04;
          item.x = Math.random();
        }
        context.save();
        context.globalAlpha = 0.88;
        context.font = `${item.size}px serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(item.symbol, item.x * width, item.y * height);
        context.restore();
      });
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    }

    function setEnabled(next) {
      enabled = next && !reducedMotion.matches;
      toggle.textContent = `お正月 演出 ${enabled ? "ON" : "OFF"}`;
      toggle.setAttribute("aria-pressed", String(enabled));
      if (enabled) {
        if (!frame) draw();
      } else {
        window.cancelAnimationFrame(frame);
        frame = 0;
        context.clearRect(0, 0, width, height);
      }
    }

    window.addEventListener("resize", resize);
    toggle.addEventListener("click", () => setEnabled(!enabled));
    reducedMotion.addEventListener("change", (event) => setEnabled(!event.matches));
    resize();
    setEnabled(!reducedMotion.matches);
  });
})();
