(function () {
  const LOGIN_PAGE = "Login-ADM-Ecoponto.html";
  const SESSION_URL = "admin-ecoponto-session.php";
  const SIDEBAR_STORAGE_KEY = "ecopontoAdmSidebarExpanded";

  const els = {
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
    ecopontoHint: document.getElementById("coletasEcopontoHint"),
    ecopontoMapName: document.getElementById("ecopontoMapName"),
    ecopontoMapAddress: document.getElementById("ecopontoMapAddress"),
    filters: document.getElementById("coletasFilters"),
    filterBairro: document.getElementById("filterBairro"),
    filterTipo: document.getElementById("filterTipo"),
    filterStatus: document.getElementById("filterStatus"),
    tableBody: document.getElementById("coletasTableBody"),
    coletasEmpty: document.getElementById("coletasEmpty"),
    actionButtons: document.querySelectorAll("[data-coleta-action]"),
  };

  let chartReady = false;
  let selectedRow = null;

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

  function iniciarMapaColetas(admin) {
    const Mapa = window.EcoColetaMapa;
    if (!Mapa || typeof Mapa.createEcopontoAdminMap !== "function") return;
    if (!document.getElementById("adm-coletas-map")) return;
    if (window.EcoColetaColetasMap) return;

    const ecoponto = admin.ecoponto || "EcoPonto Bairro Verde";
    const address =
      (els.ecopontoMapAddress && els.ecopontoMapAddress.textContent.trim()) ||
      "Rua Das Arvores, 123, São Paulo-SP";

    const widget = Mapa.createEcopontoAdminMap({
      mapElId: "adm-coletas-map",
      searchInputId: "adm-coletas-map-search-input",
      searchBtnId: "adm-coletas-map-search-btn",
      statusId: "adm-coletas-map-search-status",
      navMountId: "adm-coletas-map-nav-mount",
      autoRouteOnSearch: true,
      getEcopontoInfo() {
        return {
          name:
            (els.ecopontoMapName && els.ecopontoMapName.textContent.trim()) ||
            ecoponto,
          address:
            (els.ecopontoMapAddress && els.ecopontoMapAddress.textContent.trim()) ||
            address,
        };
      },
    });

    widget.init();
    window.EcoColetaColetasMap = widget;

    const lat =
      typeof admin.lat === "number" && !Number.isNaN(admin.lat) ? admin.lat : undefined;
    const lng =
      typeof admin.lng === "number" && !Number.isNaN(admin.lng) ? admin.lng : undefined;

    widget.setEcoponto({ name: ecoponto, address, lat, lng }).then(() => {
      if (typeof widget.invalidateSize === "function") {
        window.setTimeout(() => widget.invalidateSize(), 150);
      }
    });
  }

  function iniciarGraficoColetaHoje() {
    if (chartReady || typeof Chart === "undefined") {
      if (!chartReady && typeof Chart === "undefined") {
        window.setTimeout(iniciarGraficoColetaHoje, 100);
      }
      return;
    }

    const canvas = document.getElementById("chartColetaHoje");
    if (!canvas) return;

    chartReady = true;
    const fontFamily = '"Sora", system-ui, sans-serif';

    Chart.defaults.font.family = fontFamily;
    Chart.defaults.color = "#5c766a";

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Caminhão", "Prefeitura"],
        datasets: [
          {
            data: [12, 8],
            backgroundColor: ["#0f6b38", "#7ee8b0"],
            borderRadius: 10,
            borderSkipped: false,
            barThickness: 48,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#09281c",
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 16,
            grid: { color: "rgba(18, 137, 93, 0.08)" },
            ticks: { stepSize: 4, font: { size: 10 } },
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: "600" } },
          },
        },
      },
      plugins: [
        {
          id: "coletaHojeValues",
          afterDatasetsDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                ctx.save();
                ctx.fillStyle = "#09281c";
                ctx.font = "600 12px " + fontFamily;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(String(value), bar.x + 8, bar.y);
                ctx.restore();
              });
            });
          },
        },
      ],
    });
  }

  function preencherPainel(admin) {
    const nome = admin.nome || "Administrador";
    const ecoponto = admin.ecoponto || "EcoPonto parceiro";
    const email = admin.email || "";

    if (els.profileInitial) els.profileInitial.textContent = inicialDoNome(nome);
    if (els.profileName) els.profileName.textContent = nome;
    if (els.profileEmail) els.profileEmail.textContent = email || "—";
    if (els.profilePoint) els.profilePoint.textContent = ecoponto;
    if (els.ecopontoHint) {
      els.ecopontoHint.textContent = "Gerenciando coletas · " + ecoponto;
    }
    if (els.ecopontoMapName) els.ecopontoMapName.textContent = ecoponto;
    if (els.ecopontoMapAddress) {
      els.ecopontoMapAddress.textContent =
        "Rua Das Arvores, 123, São Paulo-SP";
    }

    document.documentElement.classList.remove("admin-auth-checking");
    iniciarGraficoColetaHoje();
    iniciarMapaColetas(admin);
  }

  function aplicarFiltros(event) {
    if (event) event.preventDefault();
    if (!els.tableBody) return;

    const bairro = els.filterBairro ? els.filterBairro.value : "";
    const tipo = els.filterTipo ? els.filterTipo.value : "";
    const status = els.filterStatus ? els.filterStatus.value : "";

    let visiveis = 0;
    const rows = els.tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const matchBairro = !bairro || row.getAttribute("data-bairro") === bairro;
      const matchTipo = !tipo || row.getAttribute("data-tipo") === tipo;
      const matchStatus = !status || row.getAttribute("data-status") === status;
      const show = matchBairro && matchTipo && matchStatus;

      row.classList.toggle("is-hidden-row", !show);
      if (show) visiveis += 1;
    });

    if (els.coletasEmpty) {
      els.coletasEmpty.classList.toggle("hidden", visiveis > 0);
    }
  }

  function configurarSelecaoLinha() {
    if (!els.tableBody) return;

    els.tableBody.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      if (!row || !els.tableBody.contains(row)) return;

      if (selectedRow) selectedRow.classList.remove("is-selected");
      selectedRow = row;
      row.classList.add("is-selected");
    });
  }

  function configurarAcoes() {
    const labels = {
      responsavel: "Atribuir Responsável",
      status: "Atualizar Status",
      concluida: "Marcar como Concluída",
      nova: "Solicitar Nova Coleta",
    };

    els.actionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-coleta-action");
        const titulo = labels[key] || "Ação";
        if (!selectedRow) {
          window.alert("Selecione uma coleta na tabela antes de usar: " + titulo + ".");
          return;
        }
        window.alert(
          titulo + " — recurso em desenvolvimento. Coleta selecionada: " +
            (selectedRow.cells[0] && selectedRow.cells[0].textContent)
        );
      });
    });
  }

  async function validarSessaoAdmin() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(SESSION_URL, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const data = parseJsonServidor(await response.text());
      if (!data || data.sucesso !== true || !data.admin) {
        mostrarErroAuth(
          (data && data.erro) || "Sessão administrativa expirada. Faça login novamente."
        );
        window.setTimeout(voltarLoginAdmin, 1800);
        return;
      }

      salvarAdminLocal(data.admin);
      preencherPainel(data.admin);
    } catch (error) {
      window.clearTimeout(timeoutId);
      mostrarErroAuth(
        "Não foi possível validar a sessão. Verifique o Apache no XAMPP."
      );
      window.setTimeout(voltarLoginAdmin, 2800);
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
      /* redireciona */
    }
    voltarLoginAdmin();
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
      /* ignore */
    }
    window.setTimeout(() => {
      const map = window.EcoColetaColetasMap;
      if (map && typeof map.invalidateSize === "function") map.invalidateSize();
    }, 280);
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
      /* ignore */
    }
  }

  if (els.sidebarToggle) {
    els.sidebarToggle.addEventListener("click", (e) => {
      e.preventDefault();
      alternarSidebar();
    });
  }

  if (els.filters) {
    els.filters.addEventListener("submit", aplicarFiltros);
  }

  if (els.profileToggle && els.profileMenu) {
    els.profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const fechado = els.profileMenu.classList.toggle("hidden");
      els.profileToggle.setAttribute("aria-expanded", fechado ? "false" : "true");
    });

    document.addEventListener("click", (event) => {
      if (
        els.profileMenu.contains(event.target) ||
        els.profileToggle.contains(event.target)
      ) {
        return;
      }
      els.profileMenu.classList.add("hidden");
      els.profileToggle.setAttribute("aria-expanded", "false");
    });
  }

  if (els.logout) {
    els.logout.addEventListener("click", encerrarSessao);
  }

  restaurarSidebar();
  configurarSelecaoLinha();
  configurarAcoes();
  validarSessaoAdmin();
})();
