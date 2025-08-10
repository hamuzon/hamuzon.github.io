(() => {
  // --- サポートバージョン ---
  const SUPPORTED_VERSIONS = ["1.0", "2.0"];
  const CURRENT_SAVE_VERSION = "2.0";

  const APP_NAME = "PixelDraw";
  const APP_VERSION = CURRENT_SAVE_VERSION;

  const WIDTH = 16;
  const HEIGHT = 16;

  // バージョンごとのパレット定義
  const PALETTES = {
    "1.0": [
      "#000000",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ffffff",
      null // 透明（null扱い）
    ],
    "2.0": [
      "#000000",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ffffff",
      "#00000000" // 透明色（RGBAで透明）
    ]
  };

  // 現在のパレットを取得
  const palette = PALETTES[APP_VERSION];

  let currentColorIndex = 0;
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
    pixel.style.backgroundColor = palette[palette.length - 1];
    canvasEl.appendChild(pixel);
  }

  // パレット生成
  function createPalette(){
    paletteEl.innerHTML = "";
    palette.forEach((color, i) => {
      const btn = document.createElement("div");
      btn.className = "color-btn";
      if(color === null || color === "#00000000"){
        btn.style.backgroundColor = "transparent";
        btn.title = "透明色";
        btn.classList.add("transparent");
      } else {
        btn.style.backgroundColor = color;
        btn.title = `色: ${color}`;
      }
      btn.addEventListener("click", () => selectColor(i, btn));
      paletteEl.appendChild(btn);
      if(i === currentColorIndex) btn.classList.add("selected");
    });
  }

  function selectColor(index, btnEl){
    currentColorIndex = index;
    paletteEl.querySelectorAll(".color-btn").forEach(b=>b.classList.remove("selected"));
    btnEl.classList.add("selected");
  }

  function paintPixel(pixel){
    pixel.style.backgroundColor = palette[currentColorIndex] === null ? "transparent" : palette[currentColorIndex];
    pixel.dataset.colorIndex = currentColorIndex;
  }

  function onDrawChange(){
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
      canvasEl.querySelectorAll(".pixel").forEach(p => {
        p.style.backgroundColor = palette[palette.length - 1];
        delete p.dataset.colorIndex;
      });
      localStorage.removeItem("pixelDrawingData-v2");
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
        const data = JSON.parse(ev.target.result);
        if(data.app !== APP_NAME || !SUPPORTED_VERSIONS.includes(data.version) || data.width !== WIDTH || data.height !== HEIGHT || !Array.isArray(data.pixels) || !Array.isArray(data.palette)){
          return alert("JSONデータの形式が不正です。");
        }
        // パレットチェックは厳密に文字列で比較
        if(JSON.stringify(data.palette) !== JSON.stringify(palette)){
          return alert("パレットがアプリと異なります。");
        }
        titleInput.value = data.title || "";
        fillCanvasWithCompressedPixels(data.pixels);
        alert("作品を読み込みました。");
        saveToLocalStorage();
      } catch {
        alert("JSONファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  });

  window.addEventListener("load", () => {
    const saved = localStorage.getItem("pixelDrawingData-v2");
    if(saved){
      try {
        const data = JSON.parse(saved);
        if(data.app === APP_NAME && SUPPORTED_VERSIONS.includes(data.version) && data.width === WIDTH && data.height === HEIGHT && Array.isArray(data.pixels) && Array.isArray(data.palette)){
          if(JSON.stringify(data.palette) === JSON.stringify(palette)){
            titleInput.value = data.title || "";
            fillCanvasWithCompressedPixels(data.pixels);
          }
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
      if(bg && bg !== palette[palette.length - 1]){
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);
        ctx.fillStyle = bg;
        ctx.fillRect(x,y,1,1);
      }
    });
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    cvs.toBlob(blob => downloadBlob(blob, `${APP_NAME}-${APP_VERSION}_${getTimestamp()}.${format}`), mime, 0.92);
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
    const compressedPixels = compressPixels(getCanvasColorIndices());
    const data = {
      app: APP_NAME,
      version: APP_VERSION,
      width: WIDTH,
      height: HEIGHT,
      title: titleInput.value.trim() || undefined,
      palette,
      pixels: compressedPixels
    };
    localStorage.setItem("pixelDrawingData-v2", JSON.stringify(data));
  }

  function downloadJson(){
    const compressedPixels = compressPixels(getCanvasColorIndices());
    const data = {
      app: APP_NAME,
      version: APP_VERSION,
      width: WIDTH,
      height: HEIGHT,
      title: titleInput.value.trim() || undefined,
      palette,
      pixels: compressedPixels
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], {type:"application/json"});
    const dt = new Date();
    const pad = n => n.toString().padStart(2,"0");
    const filename = `${APP_NAME}-${APP_VERSION}_${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}_${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}.json`;
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

  function getCanvasColorIndices(){
    const indices = [];
    canvasEl.querySelectorAll(".pixel").forEach(p => {
      const idx = p.dataset.colorIndex !== undefined ? Number(p.dataset.colorIndex) : palette.length - 1;
      indices.push(idx);
    });
    return indices;
  }

  // ピクセル配列を圧縮（3連続以上を[startIndex, count]でまとめる）
  function compressPixels(indices){
    const compressed = [];
    let i = 0;
    while(i < indices.length){
      const current = indices[i];
      let count = 1;
      while(i + count < indices.length && indices[i + count] === current){
        count++;
      }
      if(count >= 3){
        compressed.push([i, count]);
        compressed.push(current);
        i += count;
      } else {
        for(let j=0; j<count; j++){
          compressed.push(current);
        }
        i += count;
      }
    }
    return compressed;
  }

  // 圧縮されたピクセル配列を展開してキャンバスに適用
  function fillCanvasWithCompressedPixels(pixels){
    const indices = [];
    for(let i=0; i<pixels.length; i++){
      const val = pixels[i];
      if(Array.isArray(val) && val.length === 2 && typeof pixels[i+1] === "number"){
        const [start, count] = val;
        const colorIndex = pixels[i+1];
        for(let c=0; c<count; c++){
          indices[start + c] = colorIndex;
        }
        i++; // 次は色番号なのでスキップ
      } else if(typeof val === "number"){
        indices.push(val);
      }
    }
    for(let i=0; i<WIDTH*HEIGHT; i++){
      const idx = indices[i] !== undefined ? indices[i] : palette.length - 1; // 透明デフォルト
      const pixel = canvasEl.querySelector(`.pixel[data-index="${i}"]`);
      if(pixel){
        pixel.style.backgroundColor = palette[idx] === null ? "transparent" : palette[idx];
        pixel.dataset.colorIndex = idx;
      }
    }
  }

  function getTimestamp(){
    const dt = new Date();
    const pad = n => n.toString().padStart(2,"0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}_${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}`;
  }

  createPalette();
})();