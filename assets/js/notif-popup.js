// Popup de notificacoes integrado com notificacoes.php
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = (function () {
    const prefix = /\/(pages|auth|admin|mapa)\//.test(window.location.pathname) ? "../" : "";
    return new URL(prefix + "api/notificacoes.php", window.location.href).href;
  })();
  const VIEWPORT_PAD = 12;
  const GAP = 10;
  const TAG = "div";
  const ICON_EMOJI = { green: "♻️", yellow: "🏆", purple: "📅", bell: "🔔" };

  const header = document.querySelector("header.topo");
  let ignoreOutsideClick = false;
  let notifCache = null;

  if (header) {
    const syncHeaderOffset = () => {
      const rect = header.getBoundingClientRect();
      const h = Math.ceil(Math.max(rect.height, header.offsetHeight, header.scrollHeight));
      document.documentElement.style.setProperty("--ecocoleta-header-offset", `${h}px`);
    };
    syncHeaderOffset();
    requestAnimationFrame(() => {
      syncHeaderOffset();
      requestAnimationFrame(syncHeaderOffset);
    });
    window.addEventListener("load", syncHeaderOffset, { once: true });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncHeaderOffset, 80);
    }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeaderOffset).catch(() => {});
    }
    const updateHeaderOnScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
    updateHeaderOnScroll();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncHeaderOffset).observe(header);
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tempoRelativo(iso) {
    if (!iso) return "";
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "";
    const min = Math.floor(Math.max(0, Date.now() - data.getTime()) / 60000);
    if (min < 1) return "agora mesmo";
    if (min < 60) return `há ${min} minuto${min === 1 ? "" : "s"}`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h} hora${h === 1 ? "" : "s"}`;
    const d = Math.floor(h / 24);
    return `há ${d} dia${d === 1 ? "" : "s"}`;
  }

  function buildNotifBoxShell() {
    return (
      `<${TAG} class="header">` +
      `<h2>Notificações</h2>` +
      `<button type="button" class="close-notif" aria-label="Fechar notificações">&times;</button>` +
      `</${TAG}>` +
      `<${TAG} class="notif-body" data-notif-body>` +
      `<p class="notif-status">Carregando notificações…</p>` +
      `</${TAG}>`
    );
  }

  function renderItem(n) {
    const icone = ICON_EMOJI[n.icone] || ICON_EMOJI.bell;
    const badge = n.badge ? `<span class="badge">${escapeHtml(n.badge)}</span>` : "";
    const unread = n.lida ? "" : ' data-unread="1"';
    return (
      `<${TAG} class="item"${unread} data-id="${n.id}">` +
      `<span class="icon ${escapeHtml(n.icone || "bell")}">${icone}</span>` +
      `<${TAG}>` +
      `<p>${escapeHtml(n.mensagem || n.titulo)}</p>` +
      `<span>${escapeHtml(tempoRelativo(n.criado_em))}</span>` +
      `</${TAG}>` +
      badge +
      `</${TAG}>`
    );
  }

  function renderNotificacoes(body, data) {
    if (!body) return;
    const importantes = (data && data.importantes) || [];
    const outras = (data && data.outras) || [];

    if (!importantes.length && !outras.length) {
      body.innerHTML = `<p class="notif-empty">Você não tem notificações no momento.</p>`;
      return;
    }

    let html = "";
    if (importantes.length) {
      html += `<p class="section-title">IMPORTANTE</p><section class="section">`;
      importantes.forEach((n) => { html += renderItem(n); });
      html += `</section>`;
    }
    if (outras.length) {
      html += `<p class="section-title">MAIS NOTIFICAÇÕES</p><section class="section">`;
      outras.forEach((n) => { html += renderItem(n); });
      html += `</section>`;
    }
    body.innerHTML = html;
  }

  function updateBadges(count) {
    const n = Math.max(0, parseInt(count, 10) || 0);
    document.querySelectorAll("[data-notif-badge]").forEach((badge) => {
      if (n > 0) {
        badge.textContent = n > 99 ? "99+" : String(n);
        badge.classList.remove("hidden");
      } else {
        badge.textContent = "";
        badge.classList.add("hidden");
      }
    });
  }

  async function apiNotificacoes(acao, extra) {
    const fd = new FormData();
    fd.append("acao", acao);
    if (extra) {
      Object.keys(extra).forEach((key) => fd.append(key, extra[key]));
    }
    const res = await fetch(API_URL, { method: "POST", body: fd, credentials: "same-origin" });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      return { sucesso: false, erro: "Resposta inválida do servidor." };
    }
  }

  async function carregarNotificacoes(force, bodyEl) {
    const bodies = bodyEl
      ? [bodyEl]
      : Array.from(document.querySelectorAll("[data-notif-body]"));

    if (notifCache && !force) {
      bodies.forEach((b) => renderNotificacoes(b, notifCache));
      updateBadges(notifCache.nao_lidas || 0);
      return notifCache;
    }

    bodies.forEach((b) => {
      b.innerHTML = `<p class="notif-status">Carregando notificações…</p>`;
    });

    const data = await apiNotificacoes("listar");
    if (!data || data.sucesso !== true) {
      const msg = escapeHtml((data && data.erro) || "Não foi possível carregar as notificações.");
      bodies.forEach((b) => {
        b.innerHTML = `<p class="notif-error">${msg}</p>`;
      });
      return null;
    }

    notifCache = data;
    bodies.forEach((b) => renderNotificacoes(b, data));
    updateBadges(data.nao_lidas || 0);
    return data;
  }

  async function marcarTodasLidas() {
    const data = await apiNotificacoes("marcar_todas_lidas");
    if (data && data.sucesso) {
      if (notifCache) {
        notifCache.nao_lidas = 0;
        (notifCache.importantes || []).forEach((n) => { n.lida = true; });
        (notifCache.outras || []).forEach((n) => { n.lida = true; });
      }
      document.querySelectorAll(".item[data-unread]").forEach((el) => el.removeAttribute("data-unread"));
      updateBadges(0);
      window.dispatchEvent(new CustomEvent("ecocoleta:notificacoes-lidas"));
    }
  }

  function ensureBadge(wrapper) {
    const btn = wrapper.querySelector(".notif-btn");
    if (!btn || wrapper.querySelector("[data-notif-badge]")) return;
    const badge = document.createElement("span");
    badge.className = "notif-badge hidden";
    badge.setAttribute("data-notif-badge", "");
    btn.appendChild(badge);
  }

  function prepareWrapper(wrapper) {
    const overlay = wrapper.querySelector(".notif-overlay");
    if (!overlay) return null;
    const box = overlay.querySelector(".notif-box");
    if (box) box.innerHTML = buildNotifBoxShell();
    ensureBadge(wrapper);
    return overlay;
  }

  const notifWrappers = Array.from(document.querySelectorAll(".notif-wrapper"));
  notifWrappers.forEach(prepareWrapper);

  function positionOverlay(wrapper, overlay) {
    const btn = wrapper.querySelector(".notif-btn");
    if (!btn || !overlay) return;
    const rect = btn.getBoundingClientRect();
    const narrow = window.innerWidth <= 520;
    overlay.style.position = "fixed";
    overlay.style.bottom = "auto";
    if (narrow) {
      overlay.style.left = `${VIEWPORT_PAD}px`;
      overlay.style.right = `${VIEWPORT_PAD}px`;
      overlay.style.width = "auto";
      overlay.style.maxWidth = "none";
      overlay.style.top = `${Math.round(rect.bottom + GAP)}px`;
      return;
    }
    overlay.style.left = "auto";
    overlay.style.right = `${Math.round(Math.max(VIEWPORT_PAD, window.innerWidth - rect.right))}px`;
    overlay.style.width = "";
    overlay.style.maxWidth = "420px";
    overlay.style.top = `${Math.round(rect.bottom + GAP)}px`;
    requestAnimationFrame(() => {
      const panel = overlay.querySelector(".notif-box") || overlay;
      const panelRect = panel.getBoundingClientRect();
      if (panelRect.bottom > window.innerHeight - VIEWPORT_PAD) {
        overlay.style.top = `${Math.max(VIEWPORT_PAD, Math.round(rect.top - panelRect.height - GAP))}px`;
      }
      const nextRect = panel.getBoundingClientRect();
      if (nextRect.left < VIEWPORT_PAD) {
        overlay.style.left = `${VIEWPORT_PAD}px`;
        overlay.style.right = "auto";
      }
    });
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
  }

  async function openOverlay(wrapper, overlay) {
    if (!overlay) return;
    overlay.classList.remove("hidden");
    positionOverlay(wrapper, overlay);
    ignoreOutsideClick = true;
    requestAnimationFrame(() => {
      overlay.classList.add("show");
      setTimeout(() => { ignoreOutsideClick = false; }, 0);
    });
    const body = overlay.querySelector("[data-notif-body]");
    await carregarNotificacoes(true, body);
    await marcarTodasLidas();
  }

  function closeAllOverlays() {
    notifWrappers.forEach((w) => closeOverlay(w.querySelector(".notif-overlay")));
  }

  function repositionOpenOverlays() {
    notifWrappers.forEach((wrapper) => {
      const overlay = wrapper.querySelector(".notif-overlay");
      if (overlay && overlay.classList.contains("show")) {
        positionOverlay(wrapper, overlay);
      }
    });
  }

  if (notifWrappers.length) {
    notifWrappers.forEach((wrapper) => {
      const notifBtn = wrapper.querySelector(".notif-btn");
      const notifOverlay = wrapper.querySelector(".notif-overlay");
      if (!notifBtn || !notifOverlay) return;

      notifBtn.type = "button";
      notifBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (notifOverlay.classList.contains("show")) {
          closeOverlay(notifOverlay);
        } else {
          closeAllOverlays();
          openOverlay(wrapper, notifOverlay);
        }
      });

      const closeBtn = notifOverlay.querySelector(".close-notif");
      if (closeBtn) {
        closeBtn.type = "button";
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeOverlay(notifOverlay);
        });
      }

      wrapper.addEventListener("click", (e) => e.stopPropagation());
    });

    window.addEventListener("resize", repositionOpenOverlays, { passive: true });
    window.addEventListener("scroll", repositionOpenOverlays, { passive: true });

    document.addEventListener("click", (e) => {
      if (ignoreOutsideClick) return;
      if (!notifWrappers.some((w) => w.contains(e.target))) closeAllOverlays();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") closeAllOverlays();
    });

    apiNotificacoes("contar_nao_lidas").then((data) => {
      if (data && data.sucesso) updateBadges(data.nao_lidas || 0);
    }).catch(() => {});

    window.addEventListener("ecocoleta:notificacoes-atualizar", () => {
      notifCache = null;
      apiNotificacoes("contar_nao_lidas").then((data) => {
        if (data && data.sucesso) updateBadges(data.nao_lidas || 0);
      });
    });
  }

  window.EcoColetaNotificacoes = {
    recarregar: () => {
      notifCache = null;
      return carregarNotificacoes(true);
    },
  };

  try {
    window.__ecocoletaNotifInit = true;
  } catch (err) {}
});
