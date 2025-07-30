(() => {
  // サイトデータ
  const sitesData = {
    homeHamusata: [
      { href: "https://home.hamusata.f5.si/", text: "Hamusata-Website-List", className: "tpww", reload: true },
      { href: "https://YouTube.hamusata.f5.si", text: "YouTube / Local PC Service by Cloudflare Tunnel" },
      { href: "https://scratch-user-info.hamusata.f5.si", text: "Scratch User & Project Info / Local PC Service by Cloudflare Tunnel" },
      { href: "https://hamusata.f5.si", text: "Time Zone / Local PC Service by Cloudflare Tunnel" },
      { href: "https://time-zone.hamusata.f5.si", text: "Time Zone / Hosted by GitHub" },
      { href: "https://Device-info.hamusata.f5.si", text: "Device Info / Hosted by GitHub" },
      { href: "https://expo2025-counter.hamusata.f5.si", text: "Expo 2025 Countdown - Hamusata / Hosted by GitHub" },
      { href: "https://bin2dec.hamusata.f5.si", text: "binary-decimal-converter - Hamusata / Hosted by GitHub" },
      { href: "https://text.hamusata.f5.si", text: "Text enlargement app - Hamusata / Hosted by GitHub" },
      { href: "https://Calculator.hamusata.f5.si", text: "計算機 / Calculator - Hamusata / Hosted by GitHub" },
      { href: "https://password-create.hamusata.f5.si", text: "🔑Password Generator Tool🗝️ - Hamusata / Hosted by GitHub" },
      { href: "https://calendar.hamusata.f5.si", text: "🗓️カレンダー / calendar📅 - Hamusata / Hosted by GitHub" },
      { href: "https://todo.hamusata.f5.si", text: "📝 TODO lists ✏ - Hamusata / Hosted by GitHub" },
      { href: "https://url.hamusata.f5.si", text: "🔗Short link creation service🔗 / Local PC Service by Cloudflare Tunnel" },
      { href: "https://link.hamusata.f5.si", text: "🔗Short link creation service🔗 / Hosted by Cloudflare Workers" },
      { href: "https://qr.hamusata.f5.si", text: "🔳QR 🔗 - Hamusata / Hosted by GitHub" },
      { href: "http://omikuji.hamusata.f5.si", text: "🍀おみくじ🔮 - Hamusata / Hosted by GitHub" },
      { href: "https://dice.hamusata.f5.si", text: "🎲サイコロ🎯 Hamusata / Hosted by GitHub" },
    ],
    hamuzonGitHubIO: [
      { href: "./", text: "Hamuzon-Website-List", className: "tpww", reload: true },
      { href: "https://hamuzon.github.io/Time-Zone_app/", text: "TimeZone - Hamuzon" },
      { href: "https://hamuzon.github.io/expo2025-counter/", text: "Expo 2025 Countdown - Hamuzon" },
      { href: "https://hamuzon.github.io/binary-decimal-converter/", text: "binary-decimal-converter - Hamuzon" },
      { href: "https://hamuzon.github.io/Device-info/", text: "Device-info - Hamuzon" },
      { href: "https://hamuzon.github.io/text/", text: "Text enlargement app - Hamuzon" },
      { href: "https://hamuzon.github.io/Calculator/", text: "計算機 / Calculator - Hamuzon" },
      { href: "https://hamuzon.github.io/password/", text: "🔑Password Generator Tool🗝️ - Hamuzon" },
      { href: "https://hamuzon.github.io/calendar/", text: "🗓️カレンダー / calendar📅 - Hamuzon" },
      { href: "https://hamuzon.github.io/todo/", text: "📝 TODO lists ✏ - Hamuzon" },
      { href: "https://hamuzon.github.io/QR/", text: "🔳QR 🔗 - Hamuzon" },
      { href: "https://hamuzon.github.io/omikuji/", text: "🍀おみくじ🔮 - Hamuzon" },
      { href: "https://hamuzon.github.io/dice/", text: "🎲サイコロ🎯 - Hamuzon" },
      { href: "https://hamuzon.github.io/Short-Link/", text: "🔗Short link creation service🔗 - Hamuzon" },
    ],
    publicSites: [
      { href: "https://www.google.com", text: "Google" },
      { href: "https://www.youtube.com", text: "YouTube" },
      { href: "https://www.twitter.com", text: "Twitter / X" },
      { href: "https://www.facebook.com", text: "Facebook" },
      { href: "https://www.instagram.com", text: "Instagram" },
      { href: "https://www.tiktok.com", text: "TikTok" },
      { href: "https://www.discord.com", text: "Discord" },
    ],
  };

  // HTML を直接 document.body に書き込む
  document.body.style.margin = "1rem";
  document.body.style.backgroundColor = "#008080";
  document.body.style.fontFamily = "'MS PGothic', 'MS UI Gothic', monospace, sans-serif";
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.minHeight = "100vh";
  document.body.style.userSelect = "text";

  const mainHtml = `
  <main style="width: 820px; background: #c0c0c0; padding: 1rem 1.25rem 1.25rem 1.25rem; border: 2px solid #fff;
      box-sizing: border-box; box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #404040, 2px 2px 0 #404040;
      display: flex; flex-direction: column; align-items: center; font-size: 14px;">
    <header style="user-select:none; padding:0 8px; height:27px; line-height:27px; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(to bottom, #000080, #00004d); color: white; font-weight: bold; border-bottom: 2px solid #404040; border-top: 2px solid #8080ff; border-left: 2px solid #8080ff; border-right: 2px solid #404040; box-sizing: border-box; width: 100%;">
      <p>Website List</p>
      <button id="close-btn" style="width: 24px; height: 24px; background-color: #c0c0c0; border: 2px outset buttonface; cursor:pointer; position: relative; margin-right: 2px; padding: 0;" aria-label="Close window"></button>
    </header>
    <h1 style="font-size: 1.6rem; font-weight: bold; color: black; margin: 1rem 0 1.5rem 0; user-select: text; width: 100%; text-align: center;">
      <a href="#" id="reload-link" style="color:black; text-decoration:none; border: 2px outset buttonface; padding: 4px 10px; display: inline-block; background-color: #c0c0c0; user-select:text;">Website List</a>
    </h1>
    <ul id="site-list" style="list-style:none; padding-left:0; margin:0; display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:8px; width: 100%;"></ul>
    <footer style="margin-top: 2.5rem; padding: 1rem 1.5rem; background-color: #d0d0d0; border-top: 3px solid #b0b0b0; border-bottom: 3px solid #909090; font-size: 0.8rem; color: #202020; font-family: 'MS PGothic', 'MS UI Gothic', monospace, sans-serif; box-shadow: inset 0 1px 3px rgba(255,255,255,0.7); width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; user-select: text; flex-wrap: wrap;">
      <span>&copy;</span><span id="year"></span><a href="https://home.hamusata.f5.si" target="_blank" rel="noopener noreferrer" style="color:#202020; text-decoration: underline; font-weight: 600; user-select:text;">@hamusata</a>
    </footer>
  </main>
  `;

  document.body.innerHTML = mainHtml;

  // 閉じるボタンXのスタイル（×）作成
  const closeBtn = document.getElementById("close-btn");
  closeBtn.style.position = "relative";
  closeBtn.style.backgroundColor = "#c0c0c0";
  closeBtn.style.border = "2px outset buttonface";
  closeBtn.style.marginRight = "2px";
  closeBtn.style.padding = "0";
  closeBtn.style.cursor = "pointer";

  // × の線を描画
  const addCloseIcon = (btn) => {
    const before = document.createElement("span");
    before.style.content = '""';
    before.style.position = "absolute";
    before.style.top = "6px";
    before.style.left = "5px";
    before.style.width = "14px";
    before.style.height = "2px";
    before.style.backgroundColor = "#404040";
    before.style.transform = "rotate(45deg)";
    btn.appendChild(before);

    const after = document.createElement("span");
    after.style.content = '""';
    after.style.position = "absolute";
    after.style.top = "6px";
    after.style.left = "5px";
    after.style.width = "14px";
    after.style.height = "2px";
    after.style.backgroundColor = "#404040";
    after.style.transform = "rotate(-45deg)";
    btn.appendChild(after);
  };

  addCloseIcon(closeBtn);

  // サイトリスト ul
  const siteList = document.getElementById("site-list");

  // リンク作成関数
  function createLinkItem({ href, text, className, reload }) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (className) a.className = className;
    a.style.display = "block";
    a.style.padding = "6px 10px";
    a.style.color = "black";
    a.style.textDecoration = "none";
    a.style.backgroundColor = "#c0c0c0";
    a.style.border = "2px outset buttonface";
    a.style.boxSizing = "border-box";
    a.style.userSelect = "text";
    a.style.fontSize = "14px";
    a.style.transition = "background-color 0.15s ease, color 0.15s ease, border-style 0.15s ease";
    a.addEventListener("mouseover", () => {
      a.style.backgroundColor = "#000080";
      a.style.color = "white";
      a.style.borderStyle = "inset";
    });
    a.addEventListener("mouseout", () => {
      a.style.backgroundColor = "#c0c0c0";
      a.style.color = "black";
      a.style.borderStyle = "outset";
    });
    if (reload) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        location.reload();
      });
    }
    li.appendChild(a);
    return li;
  }

  // ホスト名判定してサイトリスト選択
  const currentHost = window.location.hostname;
  let selectedSites = [];

  if (currentHost === "home.hamusata.f5.si") {
    selectedSites = sitesData.homeHamusata;
  } else if (currentHost === "hamuzon.github.io") {
    selectedSites = sitesData.hamuzonGitHubIO;
  } else {
    selectedSites = sitesData.publicSites;
  }

  // リスト描画
  selectedSites.forEach(site => {
    siteList.appendChild(createLinkItem(site));
  });

  // 年号表示
  const baseYear = 2025;
  const yearSpan = document.getElementById("year");
  const currentYear = new Date().getFullYear();
  yearSpan.textContent = currentYear > baseYear ? `${baseYear}~${currentYear}` : `${baseYear}`;

  // 閉じるボタン動作
  closeBtn.addEventListener("click", () => {
    document.querySelector("main").style.display = "none";
  });

  // 上のタイトルのリロードリンク
  document.getElementById("reload-link").addEventListener("click", (e) => {
    e.preventDefault();
    location.reload();
  });
})();
