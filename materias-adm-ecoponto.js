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
    materiasHint: document.getElementById("materiasEcopontoHint"),
    filterEcopontoAtual: document.getElementById("filterEcopontoAtual"),
    filters: document.getElementById("materiasFilters"),
    filterMaterial: document.getElementById("filterMaterial"),
    filterPeriodo: document.getElementById("filterPeriodo"),
    filterEcoponto: document.getElementById("filterEcoponto"),
    tableBody: document.getElementById("materiasTableBody"),
    materiasEmpty: document.getElementById("materiasEmpty"),
    actionButtons: document.querySelectorAll("[data-mat-action]"),
  };

  let chartReady = false;

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

  function iniciarGraficoMateriais() {
    if (chartReady || typeof Chart === "undefined") {
      if (!chartReady && typeof Chart === "undefined") {
        window.setTimeout(iniciarGraficoMateriais, 100);
      }
      return;
    }

    const canvas = document.getElementById("chartMateriaisQuantidade");
    if (!canvas) return;

    chartReady = true;
    const fontFamily = '"Sora", system-ui, sans-serif';

    Chart.defaults.font.family = fontFamily;
    Chart.defaults.color = "#5c766a";

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Plástico", "Papel", "Vidro", "Metal", "Orgânico"],
        datasets: [
          {
            data: [420, 310, 2100, 180, 95],
            backgroundColor: ["#3b82c4", "#e8b84a", "#22a06b", "#c94a4a", "#8a6b3e"],
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#09281c",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label(ctx) {
                const v = ctx.parsed.y;
                return ctx.label + ": " + (v >= 1000 ? (v / 1000).toFixed(1) + " ton" : v + " kg");
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "rgba(18, 137, 93, 0.08)" },
            ticks: {
              font: { size: 10 },
              callback(value) {
                return value >= 1000 ? value / 1000 + "k" : value;
              },
            },
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10, weight: "600" } },
          },
        },
      },
      plugins: [
        {
          id: "materiaisBarValues",
          afterDatasetsDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                const label = value >= 1000 ? (value / 1000).toFixed(1) + "t" : value + "";
                ctx.save();
                ctx.fillStyle = "#09281c";
                ctx.font = "600 11px " + fontFamily;
                ctx.textAlign = "center";
                ctx.fillText(label, bar.x, bar.y - 8);
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
    if (els.materiasHint) {
      els.materiasHint.textContent = "Materiais · " + ecoponto;
    }
    if (els.filterEcopontoAtual) {
      els.filterEcopontoAtual.textContent = ecoponto;
    }

    document.documentElement.classList.remove("admin-auth-checking");
    iniciarGraficoMateriais();
  }

  function aplicarFiltros(event) {
    if (event) event.preventDefault();
    if (!els.tableBody) return;

    const material = els.filterMaterial ? els.filterMaterial.value : "";
    const periodo = els.filterPeriodo ? els.filterPeriodo.value : "";
    const ecoponto = els.filterEcoponto ? els.filterEcoponto.value : "";

    let visiveis = 0;
    els.tableBody.querySelectorAll("tr").forEach((row) => {
      const matchMat = !material || row.getAttribute("data-material") === material;
      const matchPer = !periodo || row.getAttribute("data-periodo") === periodo;
      const matchEco = !ecoponto || row.getAttribute("data-ecoponto") === ecoponto;
      const show = matchMat && matchPer && matchEco;
      row.classList.toggle("is-hidden-row", !show);
      if (show) visiveis += 1;
    });

    if (els.materiasEmpty) {
      els.materiasEmpty.classList.toggle("hidden", visiveis > 0);
    }
  }

  function configurarAcoes() {
    const labels = {
      atualizar: "Atualizar Dados",
      exportar: "Exportar Relatório",
      registrar: "Registrar Material",
    };

    els.actionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-mat-action");
        const titulo = labels[key] || "Ação";
        window.alert(titulo + " — recurso em desenvolvimento.");
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
      mostrarErroAuth("Não foi possível validar a sessão. Verifique o Apache no XAMPP.");
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
  configurarAcoes();
  validarSessaoAdmin();
})();
