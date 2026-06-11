(function () {
  const config = window.ACTB_MOBILE_CONFIG || {};
  const dashboardUrl = String(config.dashboardUrl || "").trim();
  const setup = document.getElementById("setup");
  const iframe = document.getElementById("dashboard");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  if (!dashboardUrl) {
    setup.innerHTML = [
      '<div class="mark">FX</div>',
      "<h1>ACTB Mobile 未配置</h1>",
      "<p>请先把 Streamlit 后台部署到 HTTPS 云端地址，然后在 mobile_pwa/config.js 填入 dashboardUrl。</p>",
      '<p class="hint">本地 localhost 只能在电脑上访问，不能作为手机长期入口。</p>',
    ].join("");
    return;
  }

  iframe.src = dashboardUrl;
  iframe.hidden = false;
  setup.hidden = true;
})();
