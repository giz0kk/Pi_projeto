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
    relatorioHint: document.getElementById("relatorioEcopontoHint"),
    filterEcopontoAtual: document.getElementById("filterEcopontoAtual"),
    filters: document.getElementById("relatorioFilters"),
    filterPeriodo: document.getElementById("filterPeriodo"),
    filterMaterial: document.getElementById("filterMaterial"),
    filterEcoponto: document.getElementById("filterEcoponto"),
    tableBody: document.getElementById("relatorioTableBody"),
    relatorioEmpty: document.getElementById("relatorioEmpty"),
    actionButtons: document.querySelectorAll("[data-rel-action]"),
  };

  let chartsReady = false;

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

  function iniciarGraficos() {
    if (chartsReady || typeof Chart === "undefined") {
      if (!chartsReady && typeof Chart === "undefined") {
        window.setTimeout(iniciarGraficos, 100);
      }
      return;
    }
    chartsReady = true;

    const fontFamily = '"Sora", system-ui, sans-serif';
    const muted = "#5c766a";
    const grid = "rgba(18, 137, 93, 0.08)";

    Chart.defaults.font.family = fontFamily;
    Chart.defaults.color = muted;

    const ctxMat = document.getElementById("chartRelMaterial");
    if (ctxMat) {
      new Chart(ctxMat, {
        type: "bar",
        data: {
          labels: ["Plástico", "Papel", "Vidro", "Metal", "Orgânico", "Outros"],
          datasets: [
            {
              data: [3200, 2100, 1800, 1200, 950, 650],
              backgroundColor: [
                "#22a06b",
                "#3b82c4",
                "#e8b84a",
                "#9b6bff",
                "#8a6b3e",
                "#8a9ba8",
              ],
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 40,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: grid },
              ticks: { font: { size: 10 } },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 9, weight: "600" } },
            },
          },
        },
      });
    }

    const ctxEvo = document.getElementById("chartRelEvolucao");
    if (ctxEvo) {
      new Chart(ctxEvo, {
        type: "line",
        data: {
          labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
          datasets: [
            {
              data: [820, 940, 1010, 1150, 1280, 1420],
              borderColor: "#12895d",
              backgroundColor: "rgba(18, 137, 93, 0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: "#0f6b38",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: grid },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    const ctxTipo = document.getElementById("chartRelTipoColeta");
    if (ctxTipo) {
      new Chart(ctxTipo, {
        type: "doughnut",
        data: {
          labels: ["Caminhão (65%)", "Prefeitura (35%)"],
          datasets: [
            {
              data: [65, 35],
              backgroundColor: ["#0f6b38", "#7ee8b0"],
              borderWidth: 3,
              borderColor: "#ffffff",
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "58%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 12, padding: 12, font: { size: 11, weight: "600" } },
            },
          },
        },
      });
    }
  }

  function preencherPainel(admin) {
    const nome = admin.nome || "Administrador";
    const ecoponto = admin.ecoponto || "EcoPonto parceiro";
    const email = admin.email || "";

    if (els.profileInitial) els.profileInitial.textContent = inicialDoNome(nome);
    if (els.profileName) els.profileName.textContent = nome;
    if (els.profileEmail) els.profileEmail.textContent = email || "—";
    if (els.profilePoint) els.profilePoint.textContent = ecoponto;
    if (els.relatorioHint) {
      els.relatorioHint.textContent = "Análises · " + ecoponto;
    }
    if (els.filterEcopontoAtual) {
      els.filterEcopontoAtual.textContent = ecoponto;
    }

    document.documentElement.classList.remove("admin-auth-checking");
    iniciarGraficos();
    aplicarFiltros();
  }

  function aplicarFiltros() {
    if (!els.tableBody) return;

    const periodo = els.filterPeriodo ? els.filterPeriodo.value : "";
    const material = els.filterMaterial ? els.filterMaterial.value : "";
    const ecoponto = els.filterEcoponto ? els.filterEcoponto.value : "";

    const materialMap = {
      plastico: "Plástico",
      papel: "Papel",
      vidro: "Vidro",
      metal: "Metal",
      organico: "Orgânico",
    };

    let visiveis = 0;

    els.tableBody.querySelectorAll("tr").forEach((row) => {
      const matchPer = !periodo || row.getAttribute("data-periodo") === periodo;
      const matchEco = !ecoponto || row.getAttribute("data-ecoponto") === ecoponto;
      let matchMat = true;
      if (material) {
        const cellMat = row.cells[2] ? row.cells[2].textContent.trim() : "";
        matchMat =
          row.getAttribute("data-material") === material ||
          cellMat === materialMap[material];
      }
      const show = matchPer && matchEco && matchMat;
      row.classList.toggle("is-hidden-row", !show);
      if (show) visiveis += 1;
    });

    if (els.relatorioEmpty) {
      els.relatorioEmpty.classList.toggle("hidden", visiveis > 0);
    }
  }

  function configurarFiltros() {
    [els.filterPeriodo, els.filterMaterial, els.filterEcoponto].forEach((el) => {
      if (el) el.addEventListener("change", aplicarFiltros);
    });
  }

  function configurarAcoes() {
    const labels = {
      gerar: "Gerar Relatório",
      pdf: "Exportar PDF",
      excel: "Exportar Excel",
    };

    els.actionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-rel-action");
        aplicarFiltros();
        window.alert((labels[key] || "Ação") + " — recurso em desenvolvimento.");
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
  configurarFiltros();
  configurarAcoes();
  validarSessaoAdmin();
})();
