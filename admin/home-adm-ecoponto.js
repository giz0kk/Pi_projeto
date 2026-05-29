(function () {
  const LOGIN_PAGE = "Login-ADM-Ecoponto.html";
  const SESSION_URL = "admin-ecoponto-session.php";

  const SIDEBAR_STORAGE_KEY = "ecopontoAdmSidebarExpanded";

  const els = {
    ecopontoName: document.getElementById("ecopontoDetailName"),
    ecopontoPhoto: document.getElementById("ecopontoPhoto"),
    ecopontoPhotoPlaceholder: document.getElementById("ecopontoPhotoPlaceholder"),
    sidebar: document.getElementById("admSidebar"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    sidebarLabels: document.getElementById("admSidebarLabels"),
    profileToggle: document.getElementById("profileToggle"),
    profileMenu: document.getElementById("profileMenu"),
    profileInitial: document.getElementById("profileInitial"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    profilePoint: document.getElementById("profilePoint"),
    logout: document.getElementById("logoutAdmin"),
    authError: document.getElementById("dashboardAuthError"),
    actionButtons: document.querySelectorAll("[data-action]"),
  };

  let chartsReady = false;
  let chartRetryCount = 0;
  const CHART_RETRY_MAX = 80;

  function limparAdminLocal() {
    localStorage.removeItem("ecopontoAdminLoggedIn");
    localStorage.removeItem("ecopontoAdminName");
    localStorage.removeItem("ecopontoAdminEmail");
    localStorage.removeItem("ecopontoAdminPoint");
  }

  function voltarLoginAdmin() {
    limparAdminLocal();
    window.location.replace(LOGIN_PAGE);
  }

  function mostrarErroAuth(mensagem) {
    if (!els.authError) return;
    els.authError.textContent = mensagem;
    els.authError.classList.add("visible");
    document.documentElement.classList.remove("admin-auth-checking");
  }

  function parseJsonServidor(text) {
    const raw = String(text || "").replace(/^\uFEFF/, "").trim();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (e) {
      const idx = raw.indexOf('{"');
      if (idx >= 0) return JSON.parse(raw.slice(idx));
      throw e;
    }
  }

  function salvarAdminLocal(admin) {
    localStorage.setItem("ecopontoAdminLoggedIn", "true");
    localStorage.setItem("ecopontoAdminName", admin.nome || "");
    localStorage.setItem("ecopontoAdminEmail", admin.email || "");
    localStorage.setItem("ecopontoAdminPoint", admin.ecoponto || "");
  }

  function inicialDoNome(nome) {
    const parte = String(nome || "A").trim().split(/\s+/)[0];
    return (parte.charAt(0) || "A").toUpperCase();
  }

  function configurarFotoEcoponto() {
    if (!els.ecopontoPhoto) return;

    const mostrarPlaceholder = () => {
      els.ecopontoPhoto.classList.add("is-hidden");
      if (els.ecopontoPhotoPlaceholder) {
        els.ecopontoPhotoPlaceholder.classList.add("is-visible");
      }
    };

    els.ecopontoPhoto.addEventListener("error", mostrarPlaceholder);

    if (!els.ecopontoPhoto.complete) {
      els.ecopontoPhoto.addEventListener("load", () => {
        if (els.ecopontoPhotoPlaceholder) {
          els.ecopontoPhotoPlaceholder.classList.remove("is-visible");
        }
      });
    } else if (els.ecopontoPhoto.naturalWidth === 0) {
      mostrarPlaceholder();
    }
  }

  function obterEnderecoEcopontoDemo() {
    const addrEl = document.getElementById("ecopontoDetailAddress");
    return addrEl ? String(addrEl.textContent || "").trim() : "";
  }

  function atualizarMapaAdmin(admin) {
    const widget = window.EcoColetaAdmMap;
    if (!widget || typeof widget.setEcoponto !== "function") return;

    const ecoponto = admin.ecoponto || "EcoPonto Bairro Verde";
    const address = obterEnderecoEcopontoDemo();
    const lat =
      typeof admin.lat === "number" && !Number.isNaN(admin.lat) ? admin.lat : undefined;
    const lng =
      typeof admin.lng === "number" && !Number.isNaN(admin.lng) ? admin.lng : undefined;

    widget.setEcoponto({ name: ecoponto, address, lat, lng }).then(() => {
      if (typeof widget.invalidateSize === "function") {
        window.setTimeout(() => widget.invalidateSize(), 120);
      }
    });
  }

  function preencherPainel(admin) {
    const nome = admin.nome || "Administrador";
    const ecoponto = admin.ecoponto || "EcoPonto Bairro Verde";
    const email = admin.email || "";

    if (els.ecopontoName) {
      els.ecopontoName.textContent = ecoponto;
    }
    if (els.profileInitial) els.profileInitial.textContent = inicialDoNome(nome);
    if (els.profileName) els.profileName.textContent = nome;
    if (els.profileEmail) els.profileEmail.textContent = email || "—";
    if (els.profilePoint) els.profilePoint.textContent = ecoponto;

    document.documentElement.classList.remove("admin-auth-checking");
    iniciarGraficos();
    atualizarMapaAdmin(admin);
  }

  function iniciarGraficos() {
    if (chartsReady) return;
    if (typeof Chart === "undefined") {
      chartRetryCount += 1;
      if (chartRetryCount < CHART_RETRY_MAX) {
        window.setTimeout(iniciarGraficos, 100);
      }
      return;
    }
    chartsReady = true;

    const fontFamily = '"Sora", system-ui, sans-serif';
    const brand = {
      dark: "#09281c",
      muted: "#5c766a",
      grid: "rgba(18, 137, 93, 0.06)",
    };

    Chart.defaults.font.family = fontFamily;
    Chart.defaults.font.size = 11;
    Chart.defaults.color = brand.muted;

    const ctxMateriais = document.getElementById("chartMateriaisRecebidos");
    if (ctxMateriais) {
      new Chart(ctxMateriais, {
        type: "bar",
        data: {
          labels: ["Plástico", "Papel", "Vidro", "Metal", "Orgânico"],
          datasets: [
            {
              data: [120, 65, 45, 30, 85],
              backgroundColor: [
                "#0f6b38",
                "#12895d",
                "#5eb8d4",
                "#8a9ba8",
                "#7a8f3e",
              ],
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 52,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: brand.dark,
              titleFont: { family: fontFamily, weight: "600", size: 12 },
              bodyFont: { family: fontFamily, size: 11 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label(context) {
                  return context.parsed.y + " kg";
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 130,
              border: { display: false },
              grid: { color: brand.grid, drawTicks: false },
              ticks: {
                stepSize: 20,
                font: { size: 10 },
                color: brand.muted,
                padding: 8,
              },
            },
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: {
                font: { size: 10, weight: "600" },
                color: brand.muted,
              },
            },
          },
        },
        plugins: [
          {
            id: "barValues",
            afterDatasetsDraw(chart) {
              const { ctx } = chart;
              chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                  const value = dataset.data[index];
                  ctx.save();
                  ctx.fillStyle = brand.dark;
                  ctx.font = "600 11px " + fontFamily;
                  ctx.textAlign = "center";
                  ctx.fillText(value, bar.x, bar.y - 8);
                  ctx.restore();
                });
              });
            },
          },
        ],
      });
    }
  }

  function configurarBotoesAcao() {
    const labels = {
      atualizar: "Atualizar Status",
      cheio: "Marcar como Cheio",
      coleta: "Solicitar Coleta",
    };

    els.actionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const acao = btn.getAttribute("data-action");
        const titulo = labels[acao] || "Ação";
        window.alert(
          titulo + " — recurso em desenvolvimento. Em breve estará disponível no painel."
        );
      });
    });
  }

  async function validarSessaoAdmin() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(SESSION_URL, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = parseJsonServidor(await response.text());
      if (!data || data.sucesso !== true || !data.admin) {
        const msg =
          (data && data.erro) ||
          "Sessão administrativa expirada. Faça login novamente.";
        mostrarErroAuth(msg);
        setTimeout(voltarLoginAdmin, 1800);
        return;
      }

      salvarAdminLocal(data.admin);
      preencherPainel(data.admin);
    } catch (error) {
      clearTimeout(timeoutId);
      mostrarErroAuth(
        "Não foi possível validar a sessão. Verifique o Apache no XAMPP e tente entrar de novo."
      );
      setTimeout(voltarLoginAdmin, 2800);
    }
  }

  async function encerrarSessao() {
    if (els.logout) els.logout.disabled = true;
    try {
      await fetch(SESSION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: "acao=logout",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (e) {
      /* redireciona mesmo assim */
    }
    voltarLoginAdmin();
  }

  function fecharMenuPerfil() {
    if (!els.profileMenu) return;
    els.profileMenu.classList.add("hidden");
    if (els.profileToggle) {
      els.profileToggle.setAttribute("aria-expanded", "false");
    }
  }

  function alternarMenuPerfil() {
    if (!els.profileMenu || !els.profileToggle) return;
    const fechado = els.profileMenu.classList.toggle("hidden");
    els.profileToggle.setAttribute("aria-expanded", fechado ? "false" : "true");
  }

  function aplicarSidebarExpandida(expandida) {
    if (!els.sidebar || !els.sidebarToggle) return;
    const aberto = Boolean(expandida);
    els.sidebar.classList.toggle("is-expanded", aberto);
    els.sidebarToggle.setAttribute("aria-expanded", aberto ? "true" : "false");
    els.sidebarToggle.setAttribute(
      "aria-label",
      aberto ? "Recolher menu lateral" : "Expandir menu lateral"
    );
    if (els.sidebarLabels) {
      els.sidebarLabels.setAttribute("aria-hidden", aberto ? "false" : "true");
    }
    try {
      sessionStorage.setItem(SIDEBAR_STORAGE_KEY, aberto ? "1" : "0");
    } catch (e) {
      /* storage indisponível */
    }
  }

  function alternarSidebar() {
    if (!els.sidebar) return;
    aplicarSidebarExpandida(!els.sidebar.classList.contains("is-expanded"));
  }

  function restaurarSidebar() {
    try {
      if (sessionStorage.getItem(SIDEBAR_STORAGE_KEY) === "1") {
        aplicarSidebarExpandida(true);
      }
    } catch (e) {
      /* storage indisponível */
    }
  }

  if (els.sidebarToggle) {
    els.sidebarToggle.addEventListener("click", (event) => {
      event.preventDefault();
      alternarSidebar();
    });
  }

  restaurarSidebar();
  configurarFotoEcoponto();
  configurarBotoesAcao();

  if (els.profileToggle && els.profileMenu) {
    els.profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      alternarMenuPerfil();
    });

    document.addEventListener("click", (event) => {
      if (
        els.profileMenu.contains(event.target) ||
        els.profileToggle.contains(event.target)
      ) {
        return;
      }
      fecharMenuPerfil();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") fecharMenuPerfil();
    });
  }

  if (els.logout) {
    els.logout.addEventListener("click", encerrarSessao);
  }

  window.addEventListener("load", () => {
    if (!chartsReady && document.getElementById("chartMateriaisRecebidos")) {
      iniciarGraficos();
    }
  });

  validarSessaoAdmin();
})();
