(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("halloweenCanvas");
    const toggle = document.getElementById("halloween-toggle");
    const context = canvas?.getContext("2d");
    if (!canvas || !toggle || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let enabled = false;
    const fallingDecorations = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 16 + Math.random() * 13,
      speed: 0.35 + Math.random() * 0.8,
      sway: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      symbol: ["🎃", "👻", "🦇", "🕸️"][Math.floor(Math.random() * 4)],
      opacity: 0.45 + Math.random() * 0.45
    }));

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawDecoration(decoration) {
      decoration.sway += 0.018;
      decoration.rotation += decoration.rotationSpeed;
      decoration.y += decoration.speed / height;
      decoration.x += Math.sin(decoration.sway) * 0.00035;
      if (decoration.y > 1.05) {
        decoration.y = -0.05;
        decoration.x = Math.random();
      }

      context.save();
      context.translate(decoration.x * width, decoration.y * height);
      context.rotate(decoration.rotation);
      context.globalAlpha = decoration.opacity;
      context.font = `${decoration.size}px serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(decoration.symbol, 0, 0);
      context.restore();
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      fallingDecorations.forEach(drawDecoration);
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    }

    function setEnabled(next) {
      enabled = next && !reducedMotion.matches;
      toggle.textContent = `お化け ${enabled ? "ON" : "OFF"}`;
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
