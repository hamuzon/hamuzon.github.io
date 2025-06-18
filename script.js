const currentHost = window.location.hostname;
const siteList = document.getElementById("site-list");
const publicSiteList = document.getElementById("public-site-list");
const weatherPlaceholder = document.getElementById("weather-link-placeholder");
const footer = document.getElementById("main-footer");
const footerHamusata = document.getElementById("footer-hamusata");
const footerHamuzon = document.getElementById("footer-hamuzon");
const defaultMessage = document.getElementById("default-message");

if (currentHost === "weather-hachinohe.hamusata.f5.si") {
  weatherPlaceholder.innerHTML = \`
    <a href="https://weather-hachinohe.hamusata.f5.si" target="_blank" rel="noopener noreferrer">
      Hachinohe Weather
    </a>
  \`;
  footerHamusata.style.display = "inline";
  footerHamuzon.style.display = "none";
} else if (currentHost === "hamuzon.github.io") {
  siteList.innerHTML = \`
<li>
  <a href="https://hamuzon.github.io/Time-Zone/" target="_blank" rel="noopener noreferrer">
    TimeZone - Hamuzon
  </a>
</li>
<li>
  <a href="https://hamuzon.github.io/expo2025-counter/" target="_blank" rel="noopener noreferrer">
    Expo 2025 Countdown - Hamuzon
  </a>
</li>
\`;
  footerHamusata.style.display = "none";
  footerHamuzon.style.display = "inline";
} else {
  siteList.style.display = "none";
  publicSiteList.style.display = "block";
  footer.innerHTML = \`
    <span style="display: block; padding: 0.5rem;">
      このサイトは公式ではなく、一部の情報は異なる場合があります。<br>
      This version may differ from the original official site.
    </span>
  \`;
}
