(() => {
   const APP_NAME = "PixelDraw";
  const CURRENT_VERSION = "2.0";

  const WIDTH = 16;
  const HEIGHT = 16;

  // v2.0パレット定義（透明は #00000000）
  const palette = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ffffff",
    "#00000000"
  ];

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

  // --- ピクセル生成（透明デフォルト） ---
  for(let i=0; i<WIDTH*HEIGHT; i++){
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.dataset.index = i;
    pixel.style.backgroundColor = palette[palette.length - 1];
    canvasEl.appendChild(pixel);
  }

  // --- パレット生成 ---
  function createPalette(){
    paletteEl.innerHTML = "";
    palette.forEach((color, i) => {
      const btn = document.createElement("div");
      btn.className = "color-btn";
      btn.style.backgroundColor = color;
      btn.title = `色: ${color}`;
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
    pixel.style.backgroundColor = palette[currentColorIndex];
    pixel.dataset.colorIndex = currentColorIndex;
  }

  function onDrawChange(){
    saveToLocalStorage();
  }

  // --- 描画イベント登録 ---
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

  // --- ボードリセット ---
  resetBtn.addEventListener("click", () => {
    if(confirm("本当にボードをリセットして全てクリアしますか？")){
      canvasEl.querySelectorAll(".pixel").forEach(p => {
        p.style.backgroundColor = palette[palette.length - 1]; // 透明色デフォルト
        delete p.dataset.colorIndex;
      });
      localStorage.removeItem("pixelDrawingData-v2");
      titleInput.value = "";
    }
  });

  // --- JSON保存 ---
  saveBtn.addEventListener("click", () => {
    downloadJson();
  });

  // --- JSON読み込み ---
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
        // 対応バージョンに応じて振り分け
        if(data.app !== APP_NAME || !data.version || !data.width || !data.height || !data.pixels){
          return alert("JSONデータの形式が不正です。");
        }
        if(data.width !== WIDTH || data.height !== HEIGHT){
          return alert("キャンバスサイズがアプリと異なります。");
        }

        if(data.version === "1.0"){
          // v1.0形式読み込み（ピクセルは {x,y,color} のフル配列）
          loadV1Format(data);
        } else if(data.version === "2.0"){
          // v2.0形式読み込み（palette と圧縮された色インデックス配列）
          loadV2Format(data);
        } else {
          alert("対応していないバージョンです: " + data.version);
        }
      } catch {
        alert("JSONファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  });

  // --- ウィンドウロード時にローカルストレージから復元 ---
  window.addEventListener("load", () => {
    const saved = localStorage.getItem("pixelDrawingData-v2");
    if(saved){
      try {
        const data = JSON.parse(saved);
        if(data.app === APP_NAME && data.version === CURRENT_VERSION && data.width === WIDTH && data.height === HEIGHT && Array.isArray(data.pixels) && Array.isArray(data.palette)){
          if(JSON.stringify(data.palette) === JSON.stringify(palette)){
            titleInput.value = data.title || "";
            fillCanvasWithCompressedPixels(data.pixels);
          }
        }
      } catch {}
    }
  });

  titleInput.addEventListener("input", () => saveToLocalStorage());

  // --- 画像保存 ---
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

  // --- 画像保存処理 ---
  function saveImage(format) {
    const cvs = document.createElement("canvas");
    cvs.width = WIDTH;
    cvs.height = HEIGHT;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    canvasEl.querySelectorAll(".pixel").forEach((p,i) => {
      const bg = p.style.backgroundColor;
      if(bg && bg !== palette[palette.length-1]){
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);
        ctx.fillStyle = bg;
        ctx.fillRect(x,y,1,1);
      }
    });
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    cvs.toBlob(blob => downloadBlob(blob, `${APP_NAME}-${CURRENT_VERSION}_${getTimestamp()}.${format}`), mime, 0.92);
  }

  // --- Blob ダウンロード補助 ---
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

  // --- ローカルストレージ保存（常にv2.0形式）---
  function saveToLocalStorage(){
    const compressedPixels = compressPixels(getCanvasColorIndices());
    const data = {
      app: APP_NAME,
      version: CURRENT_VERSION,
      width: WIDTH,
      height: HEIGHT,
      title: titleInput.value.trim() || undefined,
      palette,
      pixels: compressedPixels
    };
    localStorage.setItem("pixelDrawingData-v2", JSON.stringify(data));
  }

  // --- JSONファイルとしてダウンロード ---
  function downloadJson(){
    const compressedPixels = compressPixels(getCanvasColorIndices());
    const data = {
      app: APP_NAME,
      version: CURRENT_VERSION,
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

  // --- キャンバスの現在色を色インデックス配列で取得 ---
  function getCanvasColorIndices(){
    const indices = [];
    canvasEl.querySelectorAll(".pixel").forEach(p => {
      const idx = p.dataset.colorIndex !== undefined ? Number(p.dataset.colorIndex) : palette.length - 1;
      indices.push(idx);
    });
    return indices;
  }

  // --- 圧縮アルゴリズム ---
  // 3連続以上の同じ色は[startIndex, count]と色番号で圧縮
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

  // --- 圧縮データ展開とキャンバス反映 ---
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
        i++; // 色番号は飛ばす
      } else if(typeof val === "number"){
        indices.push(val);
      }
    }
    for(let i=0; i<WIDTH*HEIGHT; i++){
      const idx = indices[i] !== undefined ? indices[i] : palette.length - 1;
      const pixel = canvasEl.querySelector(`.pixel[data-index="${i}"]`);
      if(pixel){
        pixel.style.backgroundColor = palette[idx];
        pixel.dataset.colorIndex = idx;
      }
    }
  }

  // --- v1.0形式読み込み ---
  // v1.0は pixels が [{x,y,color}, ...] 形式、パレット無しで直接色文字列保存
  // 読み込んだら内部でv2.0形式に変換して表示
  function loadV1Format(data){
    titleInput.value = data.title || "";

    // v1.0はパレットがないので、色文字列からv2.0パレットの色インデックスを探すか
    // 見つからなければ新規追加はしない（透明として扱う）
    const pixels = new Array(WIDTH*HEIGHT).fill(palette.length - 1); // 透明で初期化

    if(Array.isArray(data.pixels)){
      data.pixels.forEach(p => {
        if(typeof p.x === "number" && typeof p.y === "number" && typeof p.color === "string"){
          if(p.x >=0 && p.x < WIDTH && p.y >= 0 && p.y < HEIGHT){
            const idx = palette.indexOf(p.color.toLowerCase());
            const colorIndex = idx >= 0 ? idx : (p.color === "transparent" ? palette.length - 1 : palette.length - 1);
            pixels[p.y * WIDTH + p.x] = colorIndex;
          }
        }
      });
    }
    fillCanvasWithCompressedPixels(pixels);
    saveToLocalStorage();
  }

  // --- v2.0形式読み込み ---
  function loadV2Format(data){
    if(!Array.isArray(data.palette) || JSON.stringify(data.palette) !== JSON.stringify(palette)){
      return alert("パレットがアプリと異なります。");
    }
    titleInput.value = data.title || "";
    fillCanvasWithCompressedPixels(data.pixels);
    saveToLocalStorage();
  }

  // --- タイムスタンプ生成 ---
  function getTimestamp(){
    const dt = new Date();
    const pad = n => n.toString().padStart(2,"0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}_${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}`;
  }

  createPalette();
})();