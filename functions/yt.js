// yt.js
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const v = url.searchParams.get("v");
  const typeParam = url.searchParams.get("type") || "";
  const t = url.searchParams.get("t") || "";

  if (!v) {
    // パラメータがないとき → フォームページ表示
    return new Response(indexHtml, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  }

  const ua = request.headers.get("user-agent") || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  let redirectUrl;

  if (typeParam === "m") {
    redirectUrl = `https://music.youtube.com/watch?v=${v}`;
    if (isMobile) redirectUrl = `https://m.youtube.com/watch?v=${v}`;
  } else if (typeParam === "s") {
    redirectUrl = `https://www.youtube.com/shorts/${v}`;
    if (isMobile) redirectUrl = `https://m.youtube.com/shorts/${v}`;
  } else {
    redirectUrl = `https://youtu.be/${v}`;
  }

  if (t) {
    const sep = redirectUrl.includes("?") ? "&" : "?";
    redirectUrl += `${sep}${encodeURIComponent(t)}`;
  }

  return Response.redirect(redirectUrl, 302);
}

// ---------------------------------------------------
// index.html 
// ---------------------------------------------------

const indexHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YouTube Link Service</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon">
<style>
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e0e7ff, #f0f2f5);
}
.container {
  background: rgba(255,255,255,0.35);
  backdrop-filter: blur(16px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  width: 360px;
  max-width: 90%;
  text-align: center;
}
h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}
input, button {
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  box-sizing: border-box;
}
input {
  background: rgba(255,255,255,0.6);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.08);
}
button {
  background-color: #6200ee;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
button:hover {
  background-color: #3700b3;
}
#output {
  margin-top: 1rem;
  word-break: break-all;
  font-weight: 700;
  color: #1a1a1a;
}
#output a {
  color: #6200ee;
  text-decoration: none;
}
#output a:hover {
  text-decoration: underline;
}
#copyBtn {
  margin-top: 0.5rem;
  padding: 0.6rem;
  border-radius: 10px;
  background-color: #03dac5;
  color: #000;
  font-weight: 700;
  cursor: pointer;
}
#copyBtn:hover {
  background-color: #00bfa5;
}
#error {
  color: #b00020;
  font-weight: 700;
  margin-top: 0.5rem;
}
</style>
</head>
<body>
<div class="container">
  <h1>🎬 YouTube Link</h1>
  <input type="text" id="videoInput" placeholder="動画IDまたはURLを入力" />
  <input type="text" id="t" placeholder="再生開始時間 t=xx（任意）" />
  <button id="generate">リンク生成</button>
  <div id="error"></div>
  <div id="output"></div>
  <button id="copyBtn" style="display:none;">📋 コピー</button>
</div>

<script>
const params = new URLSearchParams(location.search);
const vParam = params.get("v");
if(vParam){
  const tParam = params.get("t") ? \`&t=\${encodeURIComponent(params.get("t"))}\` : "";
  const typeParam = params.get("type") ? \`&type=\${encodeURIComponent(params.get("type"))}\` : "";
  location.href = \`/yt/?v=\${vParam}\${typeParam}\${tParam}\`;
}

const videoInput = document.getElementById("videoInput");
const t = document.getElementById("t");
const output = document.getElementById("output");
const error = document.getElementById("error");
const btn = document.getElementById("generate");
const copyBtn = document.getElementById("copyBtn");

btn.addEventListener("click", () => {
  let input = videoInput.value.trim();
  let time = t.value.trim();
  error.textContent = "";
  output.innerHTML = "";
  copyBtn.style.display = "none";

  if (!input) {
    error.textContent = "⚠️ 入力してください";
    return;
  }

  let v = input;
  let type = "";
  let paramT = "";

  try {
    if (input.startsWith("http")) {
      const urlObj = new URL(input);
      const host = urlObj.hostname;
      if (host.includes("youtube.com") || host.includes("m.youtube.com") || host.includes("music.youtube.com")) {
        if (urlObj.pathname.startsWith("/watch")) {
          v = urlObj.searchParams.get("v") || "";
          if (host.includes("music.youtube.com")) type = "m";
        }
        if (urlObj.pathname.startsWith("/shorts/")) {
          v = urlObj.pathname.split("/shorts/")[1].split("/")[0];
          type = "s";
        }
        paramT = urlObj.searchParams.get("t") || "";
      } else if (host === "youtu.be") {
        v = urlObj.pathname.replace("/", "");
        paramT = urlObj.searchParams.get("t") || "";
      }
    } else if (input.includes("?")) {
      const [id, params] = input.split("?");
      v = id;
      const p = new URLSearchParams(params);
      if (p.get("t")) paramT = p.get("t");
    }
  } catch(e) {}

  let finalT = time || paramT;
  const base = location.origin;
  let link = \`\${base}/yt/?v=\${v}\`;
  if (type) link += \`&type=\${type}\`;
  if (finalT) link += \`&t=\${encodeURIComponent(finalT)}\`;

  output.innerHTML = \`✅ <a href="\${link}" target="_blank">\${link}</a>\`;
  copyBtn.style.display = "inline-block";
});

copyBtn.addEventListener("click", () => {
  const a = output.querySelector("a");
  if (a && a.href) {
    navigator.clipboard.writeText(a.href).then(() => {
      copyBtn.textContent = "✅ コピーしました";
      setTimeout(() => copyBtn.textContent = "📋 コピー", 2000);
    }).catch(() => {
      copyBtn.textContent = "❌ コピー失敗";
      setTimeout(() => copyBtn.textContent = "📋 コピー", 2000);
    });
  }
});
</script>
</body>
</html>
`;
