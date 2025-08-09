(() => {
  const SUPPORTED_VERSIONS = ["1.0", "2.0"];
  const CURRENT_VERSION = "2.0";

  const APP_NAME = "PixelDraw";
  const WIDTH = 16;
  const HEIGHT = 16;
  const colors = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ffffff",
    null
  ];
  let currentColor = colors[0];
  let isDrawing = false;

  const paletteEl = document.getElementById("palette");
  const canvasEl = document.getElementById("canvas");
  const resetBtn = document.getElementById("btn-reset");
  const saveBtn = document.getElementById("btn-save");
  const loadBtn = document.getElementById("btn-load");
  const imgSaveBtn = document.getElementById("btn-img-save");
  const fileLoadInput = document.getElementById("file-load");
  const titleInput = document.getElementById("titleInput");

  // ピクセル生成
  for(let i=0; i<WIDTH*HEIGHT; i++){
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.dataset.index = i;
    pixel.style.backgroundColor = "transparent";
    canvasEl.appendChild(pixel);
  }

  // パレット生成
  function createPalette(){
    paletteEl.innerHTML = "";
    colors.forEach((c) => {
      const btn = document.createElement("div");
      btn.className = "color-btn";
      if(c === null){
        btn.classList.add("transparent");
        btn.title = "透明（クリア）";
      } else {
        btn.style.backgroundColor = c;
        btn.title = `色: ${c}`;
      }
      btn.addEventListener("click", () => selectColor(c, btn));
      paletteEl.appendChild(btn);
      if(c === currentColor) btn.classList.add("selected");
    });
  }

  function selectColor(color, btnEl){
    currentColor = color;
    paletteEl.querySelectorAll(".color-btn").forEach(b=>b.classList.remove("selected"));
    btnEl.classList.add("selected");
  }

  function paintPixel(pixel){
    pixel.style.backgroundColor = currentColor === null ? "transparent" : currentColor;
  }

  function onDrawChange() {
    saveToLocalStorage();
  }

  canvasEl.addEventListener("mousedown", e => {
    if(!e.target.classList.contains("pixel")) return;
    isDrawing = true;
    paintPixel(e.target);
    onDrawChange();
  });
  canvasEl.addEventListener("mouseover", e => {
    if(isDrawing && e.target.classList.contains("pixel")){
      paintPixel(e.target);
      onDrawChange();
    }
  });
  window.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  resetBtn.addEventListener("click", () => {
    if(confirm("本当にボードをリセットして全てクリアしますか？")){
      canvasEl.querySelectorAll(".pixel").forEach(p => p.style.backgroundColor = "transparent");
      localStorage.removeItem("pixelDrawingData");
      titleInput.value = "";
    }
  });

  saveBtn.addEventListener("click", () => {
    downloadJson();
  });

  loadBtn.addEventListener("click", () => {
    fileLoadInput.value = null;
    fileLoadInput.click();
  });

  fileLoadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if(!file) return alert("ファイルが選択されていません。");
    if(!file.name.endsWith(".json")) return alert("JSONファイルを選択してください。");
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        let data = JSON.parse(ev.target.result);
        if(data.app !== APP_NAME || !SUPPORTED_VERSIONS.includes(data.version) || data.width !== WIDTH || data.height !== HEIGHT || !Array.isArray(data.pixels)){
          return alert("JSONデータの形式が不正です。");
        }
        if(data.version === "1.0") data = convertV1toV2(data);

        titleInput.value = data.title || "";
        canvasEl.querySelectorAll(".pixel").forEach(p => p.style.backgroundColor = "transparent");
        data.pixels.forEach(({x,y,color}) => {
          if(x>=0 && x<WIDTH && y>=0 && y<HEIGHT && typeof color === "string"){
            const idx = y*WIDTH + x;
            const pixel = canvasEl.querySelector(`.pixel[data-index="${idx}"]`);
            if(pixel) pixel.style.backgroundColor = color;
          }
        });
        alert("作品を読み込みました。");
        saveToLocalStorage();
      } catch {
        alert("JSONファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  });

  window.addEventListener("load", () => {
    const saved = localStorage.getItem("pixelDrawingData");
    if(saved){
      try {
        let data = JSON.parse(saved);
        if(data.app === APP_NAME && SUPPORTED_VERSIONS.includes(data.version) && data.width === WIDTH && data.height === HEIGHT && Array.isArray(data.pixels)){
          if(data.version === "1.0") data = convertV1toV2(data);

          titleInput.value = data.title || "";
          canvasEl.querySelectorAll(".pixel").forEach(p => p.style.backgroundColor = "transparent");
          data.pixels.forEach(({x,y,color}) => {
            if(x>=0 && x<WIDTH && y>=0 && y<HEIGHT && typeof color === "string"){
              const idx = y*WIDTH + x;
              const pixel = canvasEl.querySelector(`.pixel[data-index="${idx}"]`);
              if(pixel) pixel.style.backgroundColor = color;
            }
          });
        }
      } catch {}
    }
  });

  titleInput.addEventListener("input", () => saveToLocalStorage());

  imgSaveBtn.addEventListener("click", () => {
    const formats = ["png", "jpeg"];
    const oldSelect = document.getElementById("img-format-select");
    if(oldSelect) oldSelect.remove();

    const select = document.createElement("select");
    select.id = "img-format-select";
    formats.forEach(f => {
      const option = document.createElement("option");
      option.value = f;
      option.textContent = f.toUpperCase();
      select.appendChild(option);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "保存";
    saveBtn.style.marginLeft = "8px";

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.style.background = "#c0c0c0";
    wrapper.style.border = "2px outset buttonface";
    wrapper.style.padding = "12px";
    wrapper.style.zIndex = "9999";
    wrapper.appendChild(select);
    wrapper.appendChild(saveBtn);
    document.body.appendChild(wrapper);

    saveBtn.addEventListener("click", () => {
      saveImage(select.value);
      wrapper.remove();
    });

    wrapper.addEventListener("click", e => {
      if(e.target === wrapper) wrapper.remove();
    });
  });

  function saveImage(format) {
    const cvs = document.createElement("canvas");
    cvs.width = WIDTH;
    cvs.height = HEIGHT;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    canvasEl.querySelectorAll(".pixel").forEach((p,i) => {
      const bg = p.style.backgroundColor;
      if(bg && bg !== "transparent" && bg !== ""){
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);
        ctx.fillStyle = bg;
        ctx.fillRect(x,y,1,1);
      }
    });
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    cvs.toBlob(blob => downloadBlob(blob, `${APP_NAME}-${CURRENT_VERSION}_${getTimestamp()}.${format}`), mime, 0.92);
  }

  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function saveToLocalStorage(){
    const pixelData = [];
    canvasEl.querySelectorAll(".pixel").forEach((p,i) => {
      const bg = p.style.backgroundColor;
      if(bg !== "" && bg !== "transparent"){
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);
        pixelData.push({x,y,color:bg});
      }
    });
    const data = {
      app: APP_NAME,
      version: CURRENT_VERSION,
      width: WIDTH,
      height: HEIGHT,
      title: titleInput.value.trim() || undefined,
      pixels: pixelData
    };
    localStorage.setItem("pixelDrawingData", JSON.stringify(data));
  }

  function downloadJson(){
    const pixels = canvasEl.querySelectorAll(".pixel");
    const pixelData = [];
    pixels.forEach((p,i) => {
      const bg = p.style.backgroundColor;
      if(bg !== "" && bg !== "transparent"){
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);
        pixelData.push({x,y,color:bg});
      }
    });
    const data = {
      app: APP_NAME,
      version: CURRENT_VERSION,
      width: WIDTH,
      height: HEIGHT,
      title: titleInput.value.trim() || undefined,
      pixels: pixelData
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], {type:"application/json"});
    const dt = new Date();
    const pad = n => n.toString().padStart(2,"0");
    const filename = `${APP_NAME}-${CURRENT_VERSION}_${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}_${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("作品を保存しました。");
  }

  function getTimestamp(){
    const dt = new Date();
    const pad = n => n.toString().padStart(2,"0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}_${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}`;
  }

  function convertV1toV2(dataV1){
    return {
      app: dataV1.app,
      version: "2.0",
      width: dataV1.width,
      height: dataV1.height,
      title: dataV1.title || "",
      pixels: Array.isArray(dataV1.pixels) ? dataV1.pixels.map(px => ({
        x: px.x,
        y: px.y,
        color: px.color
      })) : []
    };
  }

  createPalette();
})();