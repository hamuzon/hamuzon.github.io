(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("christmasCanvas");
    const toggle = document.getElementById("christmas-toggle");
    const context = canvas?.getContext("2d");
    if (!canvas || !toggle || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let enabled = false;
    const flakes = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 1.5 + Math.random() * 3.5,
      speed: 0.35 + Math.random() * 1.05,
      drift: (Math.random() - 0.5) * 0.55,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.55
    }));
    const ornaments = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 20 + Math.random() * 12,
      speed: 0.16 + Math.random() * 0.28,
      sway: Math.random() * Math.PI * 2,
      symbol: ["🎁", "⭐", "🔔", "🎄"][Math.floor(Math.random() * 4)]
    }));

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawFlake(flake) {
      const x = flake.x * width;
      const y = flake.y * height;
      const radius = flake.radius;
      context.save();
      context.translate(x, y);
      context.rotate(flake.phase * 0.15);
      context.strokeStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      context.lineWidth = Math.max(0.7, radius * 0.28);
      context.lineCap = "round";
      context.beginPath();
      for (let arm = 0; arm < 6; arm += 1) {
        context.save();
        context.rotate((Math.PI / 3) * arm);
        context.moveTo(0, 0);
        context.lineTo(0, -radius * 2.2);
        context.moveTo(0, -radius * 1.2);
        context.lineTo(-radius * 0.55, -radius * 1.75);
        context.moveTo(0, -radius * 1.2);
        context.lineTo(radius * 0.55, -radius * 1.75);
        context.restore();
      }
      context.stroke();
      context.restore();
      flake.phase += 0.012;
      flake.y += flake.speed / height;
      flake.x += (flake.drift + Math.sin(flake.phase) * 0.3) / width;
      if (flake.y > 1.03) {
        flake.y = -0.03;
        flake.x = Math.random();
      }
      if (flake.x < -0.03) flake.x = 1.03;
      if (flake.x > 1.03) flake.x = -0.03;
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      flakes.forEach(drawFlake);
      ornaments.forEach((ornament) => {
        ornament.sway += 0.014;
        ornament.y += ornament.speed / height;
        ornament.x += Math.sin(ornament.sway) * 0.0003;
        if (ornament.y > 1.04) {
          ornament.y = -0.04;
          ornament.x = Math.random();
        }
        context.save();
        context.globalAlpha = 0.78;
        context.font = `${ornament.size}px serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(ornament.symbol, ornament.x * width, ornament.y * height);
        context.restore();
      });
      frame = window.requestAnimationFrame(draw);
    }

    function setEnabled(next) {
      enabled = next && !reducedMotion.matches;
      toggle.textContent = `クリスマス演出 ${enabled ? "ON" : "OFF"}`;
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
