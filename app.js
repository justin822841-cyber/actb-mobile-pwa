(function () {
  const config = window.ACTB_MOBILE_CONFIG || {};
  const dataUrl = String(config.dataUrl || "./summary.json").trim();
  const app = document.getElementById("app");
  const updated = document.getElementById("updated");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  function text(value) {
    return value === undefined || value === null || value === "" ? "—" : String(value);
  }

  function directionClass(raw) {
    const value = String(raw || "").toLowerCase();
    if (value === "bullish") return "bullish";
    if (value === "bearish") return "bearish";
    return "neutral";
  }

  function render(summary) {
    updated.textContent = `更新: ${text(summary.generated_at)} · 数据: ${text(summary.data_date)}`;

    app.innerHTML = [
      renderHero(summary),
      renderOverview(summary),
      renderMacro(summary.macro || {}),
      renderPaper(summary.paper_trading || {}),
      renderActions(summary.actions || {}),
    ].join("");
  }

  function renderHero(summary) {
    return `
      <section class="hero">
        <div>
          <p class="eyebrow">ACTB Mobile</p>
          <h1>AUD/CNH 手机看板</h1>
          <p>${text(summary.primary_decision)}</p>
        </div>
        <div class="price">
          <span>AUD/CNH</span>
          <strong>${text(summary.latest_price)}</strong>
        </div>
      </section>
    `;
  }

  function renderOverview(summary) {
    const horizons = Array.isArray(summary.horizons) ? summary.horizons : [];
    const cards = horizons
      .map(
        (item) => `
          <article class="horizon ${directionClass(item.direction_raw)}">
            <div class="row">
              <strong>${text(item.label)}</strong>
              <span>${text(item.confidence)}</span>
            </div>
            <h2>${text(item.direction)}</h2>
            <p>${text(item.suitability)}</p>
            <small>${text(item.risk)}</small>
          </article>
        `
      )
      .join("");
    return `
      <section class="panel">
        <div class="section-title">
          <h2>总览</h2>
          <span>今天 / 3天 / 7天 / 30天</span>
        </div>
        <div class="horizon-grid">${cards || empty("暂无预测")}</div>
      </section>
    `;
  }

  function renderMacro(macro) {
    return `
      <section class="panel">
        <div class="section-title">
          <h2>宏观事件</h2>
          <span>${macro.shock_detected ? "检测到冲击" : "监控中"}</span>
        </div>
        <div class="stack">
          ${line("重点事件", macro.next_event)}
          ${line("最新波动", macro.latest_move)}
          ${line("预期差", macro.expectation)}
          ${line("历史参照", macro.historical)}
          <p class="note">${text(macro.headline)}</p>
        </div>
      </section>
    `;
  }

  function renderPaper(paper) {
    const recent = Array.isArray(paper.recent) ? paper.recent : [];
    return `
      <section class="panel">
        <div class="section-title">
          <h2>纸面交易</h2>
          <span>${text(paper.stats)}</span>
        </div>
        <div class="trade-active">${text(paper.active)}</div>
        <div class="trade-list">
          ${
            recent
              .map(
                (trade) => `
                  <article class="trade">
                    <div class="row">
                      <strong>${text(trade.direction)}</strong>
                      <span>${text(trade.status)} · ${text(trade.time)}</span>
                    </div>
                    <p>入场 ${text(trade.entry)} · 出场 ${text(trade.exit)} · 收益 ${text(trade.pnl_pct)}</p>
                    <small>${text(trade.reason)}</small>
                  </article>
                `
              )
              .join("") || empty("暂无交易记录")
          }
        </div>
      </section>
    `;
  }

  function renderActions(actions) {
    return `
      <section class="panel actions">
        <div class="section-title">
          <h2>操作</h2>
          <span>安全跳转</span>
        </div>
        <div class="button-row">
          <a class="button" href="${text(actions.refresh_url)}" target="_blank" rel="noreferrer">刷新/运行</a>
          <a class="button secondary" href="${text(actions.predict_url)}" target="_blank" rel="noreferrer">生成简报</a>
        </div>
        <p class="hint">${text(actions.workflow_hint)}</p>
      </section>
    `;
  }

  function line(label, value) {
    return `
      <div class="line">
        <span>${label}</span>
        <strong>${text(value)}</strong>
      </div>
    `;
  }

  function empty(message) {
    return `<p class="empty">${message}</p>`;
  }

  async function load() {
    try {
      const response = await fetch(`${dataUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      render(await response.json());
    } catch (error) {
      app.innerHTML = `
        <section class="status">
          <div class="mark">FX</div>
          <h1>ACTB Mobile 暂无数据</h1>
          <p>手机摘要还没有生成，或当前页面无法读取 summary.json。</p>
          <p class="hint">${error.message}</p>
        </section>
      `;
    }
  }

  load();
})();
