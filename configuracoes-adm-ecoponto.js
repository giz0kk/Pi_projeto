(function () {
  const LOGIN_PAGE = "Login-ADM-Ecoponto.html";
  const SESSION_URL = "admin-ecoponto-session.php";
  const PERFIL_URL = "meu-perfil-admin.php";
  const SALVAR_PERFIL_URL = "atualizar-perfil-admin.php";
  const CONFIG_URL = "configuracoes-adm-ecoponto.php";
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
    configAdminName: document.getElementById("configAdminName"),
    configAdminEmail: document.getElementById("configAdminEmail"),
    configAdminAvatar: document.getElementById("configAdminAvatar"),
    configAdminAvatarFallback: document.getElementById("configAdminAvatarFallback"),
    configLanguage: document.getElementById("configLanguage"),
    configNotifications: document.getElementById("configNotifications"),
    config2fa: document.getElementById("config2fa"),
    configHours: document.getElementById("configHours"),
    configAreas: document.getElementById("configAreas"),
    themeButtons: document.querySelectorAll("[data-theme]"),
    typeButtons: document.querySelectorAll("[data-collect-type]"),
    btnSave: document.getElementById("btnSaveConfig"),
    btnAddUser: document.getElementById("btnAddUser"),
    btnEditHours: document.getElementById("btnEditHours"),
    btnEditProfile: document.getElementById("btnEditProfile"),
    btnChangePassword: document.getElementById("btnChangePassword"),
    userActionButtons: document.querySelectorAll("[data-user-action]"),
    toast: document.getElementById("configToast"),
    editModal: document.getElementById("editProfileModal"),
    editBackdrop: document.getElementById("editProfileBackdrop"),
    btnCloseEditProfile: document.getElementById("btnCloseEditProfile"),
    btnCancelEditProfile: document.getElementById("btnCancelEditProfile"),
    editProfileForm: document.getElementById("editProfileForm"),
    modalAdminNome: document.getElementById("modalAdminNome"),
    modalBtnEditarNome: document.getElementById("modalBtnEditarNome"),
    modalNomeEcoponto: document.getElementById("modalNomeEcoponto"),
    modalEmail: document.getElementById("modalEmail"),
    modalConfirmEmail: document.getElementById("modalConfirmEmail"),
    modalPassword: document.getElementById("modalPassword"),
    modalConfirmPassword: document.getElementById("modalConfirmPassword"),
    modalFoto: document.getElementById("modalFotoPerfil"),
    modalFileInput: document.getElementById("modalFileInput"),
    modalCameraBtn: document.getElementById("modalCameraBtn"),
    modalSaveOverlay: document.getElementById("modalSaveConfirmOverlay"),
    modalCancelSaveBtn: document.getElementById("modalCancelSaveBtn"),
    modalConfirmSaveBtn: document.getElementById("modalConfirmSaveBtn"),
  };

  let toastTimer = null;
  let preferenciasAtuais = null;
  let adminAtual = null;

  function limparAdminLocal() {
    localStorage.removeItem("ecopontoAdminLoggedIn");
    localStorage.removeItem("ecopontoAdminName");
    localStorage.removeItem("ecopontoAdminEmail");
    localStorage.removeItem("ecopontoAdminPoint");
    localStorage.removeItem("ecopontoAdminFoto");
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
    if (admin.foto_perfil) {
      localStorage.setItem("ecopontoAdminFoto", admin.foto_perfil);
    }
  }

  function resolverUrlFoto(path) {
    if (!path) return "";
    const p = String(path).trim();
    if (p.indexOf("http://") === 0 || p.indexOf("https://") === 0 || p.indexOf("data:") === 0) {
      return p;
    }
    try {
      return new URL(p, window.location.href).href;
    } catch (e) {
      return p;
    }
  }

  function iniciaisDoNome(nome) {
    const partes = String(nome || "A")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (partes.length === 0) return "A";
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  function inicialDoNome(nome) {
    const parte = String(nome || "A").trim().split(/\s+/)[0];
    return (parte.charAt(0) || "A").toUpperCase();
  }

  function mostrarToast(mensagem, isErro) {
    if (!els.toast) return;
    els.toast.textContent = mensagem;
    els.toast.style.background = isErro ? "#c94a4a" : "";
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
      els.toast.style.background = "";
    }, 3200);
  }

  function isFotoAdminValida(path) {
    if (!path) return false;
    const p = String(path).trim().toLowerCase();
    if (!p || p === "null" || p === "undefined") return false;
    if (p.includes("logo") || p.includes("imagens/") || p.includes("ecocoleta.png")) {
      return false;
    }
    return (
      p.includes("uploads/") ||
      p.startsWith("data:image") ||
      p.startsWith("http://") ||
      p.startsWith("https://")
    );
  }

  function mostrarAvatarInicial(nome) {
    if (!els.configAdminAvatar || !els.configAdminAvatarFallback) return;
    els.configAdminAvatar.classList.add("is-hidden");
    els.configAdminAvatar.removeAttribute("src");
    els.configAdminAvatarFallback.classList.remove("is-hidden");
    els.configAdminAvatarFallback.textContent = inicialDoNome(nome);
  }

  function aplicarFotoPerfil(fotoPath, nome) {
    if (!els.configAdminAvatar || !els.configAdminAvatarFallback) return;

    const inicial = inicialDoNome(nome);
    els.configAdminAvatarFallback.textContent = inicial;

    if (!isFotoAdminValida(fotoPath)) {
      mostrarAvatarInicial(nome);
      return;
    }

    const url = resolverUrlFoto(fotoPath);
    const aoErro = () => mostrarAvatarInicial(nome);

    els.configAdminAvatar.onload = () => {
      els.configAdminAvatar.classList.remove("is-hidden");
      els.configAdminAvatarFallback.classList.add("is-hidden");
    };
    els.configAdminAvatar.onerror = aoErro;
    els.configAdminAvatar.src = url;
    els.configAdminAvatar.alt = "Foto de " + (nome || "administrador");
  }

  function aplicarPreferencias(config) {
    preferenciasAtuais = config;
    if (!config) return;

    if (els.configLanguage && config.idioma) {
      els.configLanguage.value = config.idioma;
    }
    if (els.configNotifications && typeof config.notificacoes === "boolean") {
      els.configNotifications.checked = config.notificacoes;
    }
    if (els.config2fa && typeof config.dois_fatores === "boolean") {
      els.config2fa.checked = config.dois_fatores;
    }
    if (els.configHours && config.horarios) {
      els.configHours.value = config.horarios;
    }
    if (config.tema) {
      els.themeButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-theme") === config.tema);
      });
    }
    if (config.tipo_coleta) {
      const tipo =
        config.tipo_coleta === "manual" ? "prefeitura" : config.tipo_coleta;
      els.typeButtons.forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-collect-type") === tipo
        );
      });
    }
    if (els.configAreas && Array.isArray(config.areas_atendidas)) {
      els.configAreas.innerHTML = config.areas_atendidas
        .map((a) => '<span class="adm-config-chip">' + escapeHtml(a) + "</span>")
        .join("");
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function coletarPreferenciasForm() {
    return {
      idioma: els.configLanguage ? els.configLanguage.value : "pt-BR",
      notificacoes: els.configNotifications ? els.configNotifications.checked : true,
      tema:
        document.querySelector("[data-theme].is-active")?.getAttribute("data-theme") || "light",
      tipo_coleta: (() => {
        const t =
          document.querySelector("[data-collect-type].is-active")?.getAttribute(
            "data-collect-type"
          ) || "truck";
        return t === "manual" ? "prefeitura" : t;
      })(),
      horarios: els.configHours ? els.configHours.value.trim() : "08:00-17:00",
      dois_fatores: els.config2fa ? els.config2fa.checked : false,
      areas_atendidas: preferenciasAtuais?.areas_atendidas || ["Centro", "Zona Norte", "Zona Sul"],
    };
  }

  function limparErrosModal() {
    ["modalEmailError", "modalConfirmEmailError", "modalPasswordError", "modalConfirmPasswordError"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
      }
    );
    [els.modalEmail, els.modalConfirmEmail, els.modalPassword, els.modalConfirmPassword].forEach((input) => {
      if (input) input.classList.remove("input-error");
    });
  }

  function validarModalPerfil() {
    limparErrosModal();
    const email = els.modalEmail ? els.modalEmail.value.trim() : "";
    const confirmEmail = els.modalConfirmEmail ? els.modalConfirmEmail.value.trim() : "";
    const senha = els.modalPassword ? els.modalPassword.value : "";
    const confirmSenha = els.modalConfirmPassword ? els.modalConfirmPassword.value : "";
    let ok = true;

    const setErr = (id, input, msg) => {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
      if (input) input.classList.add("input-error");
      ok = false;
    };

    if (!email) setErr("modalEmailError", els.modalEmail, "Informe o e-mail.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("modalEmailError", els.modalEmail, "E-mail inválido.");
    }
    if (!confirmEmail) setErr("modalConfirmEmailError", els.modalConfirmEmail, "Confirme o e-mail.");
    else if (email && confirmEmail && email !== confirmEmail) {
      setErr("modalConfirmEmailError", els.modalConfirmEmail, "Os e-mails não coincidem.");
    }
    if (senha !== confirmSenha) {
      setErr("modalConfirmPasswordError", els.modalConfirmPassword, "As senhas não coincidem.");
    } else if (senha !== "" && senha.length < 8) {
      setErr("modalPasswordError", els.modalPassword, "Mínimo 8 caracteres.");
    } else if (senha !== "" && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(senha)) {
      setErr("modalPasswordError", els.modalPassword, "Use maiúscula, minúscula e número.");
    }

    return ok;
  }

  function preencherModalEditar(admin, focoSenha) {
    if (!admin) return;
    const nome = admin.nome || "Administrador";
    const email = admin.email || "";
    const ecoponto = admin.ecoponto || "";

    if (els.modalAdminNome) els.modalAdminNome.textContent = nome;
    if (els.modalNomeEcoponto) els.modalNomeEcoponto.value = ecoponto;
    if (els.modalEmail) els.modalEmail.value = email;
    if (els.modalConfirmEmail) els.modalConfirmEmail.value = email;
    if (els.modalPassword) els.modalPassword.value = "";
    if (els.modalConfirmPassword) els.modalConfirmPassword.value = "";
    if (els.modalFileInput) els.modalFileInput.value = "";

    if (els.modalFoto) {
      if (isFotoAdminValida(admin.foto_perfil)) {
        els.modalFoto.src = resolverUrlFoto(admin.foto_perfil);
      } else {
        els.modalFoto.removeAttribute("src");
        els.modalFoto.style.display = "none";
      }
    }

    limparErrosModal();

    if (focoSenha && els.modalPassword) {
      window.setTimeout(() => els.modalPassword.focus(), 120);
    }
  }

  function abrirModalEditar(focoSenha) {
    if (!els.editModal || !adminAtual) return;
    preencherModalEditar(adminAtual, focoSenha);
    els.editModal.classList.remove("hidden");
    document.body.classList.add("adm-modal-open");
  }

  function fecharModalEditar() {
    if (!els.editModal) return;
    els.editModal.classList.add("hidden");
    document.body.classList.remove("adm-modal-open");
    if (els.modalSaveOverlay) els.modalSaveOverlay.classList.add("hidden");
  }

  function showModalSaveConfirm() {
    if (els.modalSaveOverlay) els.modalSaveOverlay.classList.remove("hidden");
  }

  function hideModalSaveConfirm() {
    if (els.modalSaveOverlay) els.modalSaveOverlay.classList.add("hidden");
  }

  async function salvarPerfilModal() {
    if (!validarModalPerfil()) return;
    hideModalSaveConfirm();

    const fd = new FormData();
    const nome = els.modalAdminNome ? els.modalAdminNome.textContent.trim() : "";
    if (nome) fd.append("nome", nome);
    if (els.modalNomeEcoponto) fd.append("nome_ecoponto", els.modalNomeEcoponto.value.trim());
    if (els.modalEmail) fd.append("email", els.modalEmail.value.trim());
    if (els.modalConfirmEmail) fd.append("confirmaremail", els.modalConfirmEmail.value.trim());
    if (els.modalPassword) fd.append("senha", els.modalPassword.value);
    if (els.modalConfirmPassword) fd.append("confirmarsenha", els.modalConfirmPassword.value);

    if (els.modalFileInput && els.modalFileInput.files && els.modalFileInput.files[0]) {
      fd.append("foto", els.modalFileInput.files[0]);
    } else if (els.modalFoto && els.modalFoto.src && els.modalFoto.src.indexOf("data:image") === 0) {
      fd.append("foto_base64", els.modalFoto.src);
    }

    const btn = document.getElementById("btnSaveEditProfile");
    if (btn) btn.disabled = true;

    try {
      const res = await fetch(SALVAR_PERFIL_URL, {
        method: "POST",
        body: fd,
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = parseJsonServidor(await res.text());
      if (!data || data.sucesso !== true) {
        mostrarToast((data && data.erro) || "Não foi possível salvar o perfil.", true);
        return;
      }

      const admin = { ...(adminAtual || {}), ...(data.admin || {}) };
      if (data.foto_perfil) admin.foto_perfil = data.foto_perfil;
      if (adminAtual && adminAtual.preferencias && !admin.preferencias) {
        admin.preferencias = adminAtual.preferencias;
      }

      adminAtual = admin;
      salvarAdminLocal(admin);
      preencherPainel(admin);
      fecharModalEditar();
      mostrarToast(data.mensagem || "Perfil atualizado com sucesso.");
    } catch (e) {
      mostrarToast("Erro de conexão ao salvar o perfil.", true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function configurarModalEditar() {
    if (els.btnEditProfile) {
      els.btnEditProfile.addEventListener("click", () => abrirModalEditar(false));
    }
    if (els.btnCloseEditProfile) {
      els.btnCloseEditProfile.addEventListener("click", fecharModalEditar);
    }
    if (els.btnCancelEditProfile) {
      els.btnCancelEditProfile.addEventListener("click", fecharModalEditar);
    }
    if (els.editBackdrop) {
      els.editBackdrop.addEventListener("click", fecharModalEditar);
    }
    if (els.editProfileForm) {
      els.editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validarModalPerfil()) return;
        showModalSaveConfirm();
      });
    }
    if (els.modalCancelSaveBtn) {
      els.modalCancelSaveBtn.addEventListener("click", hideModalSaveConfirm);
    }
    if (els.modalConfirmSaveBtn) {
      els.modalConfirmSaveBtn.addEventListener("click", salvarPerfilModal);
    }
    if (els.modalBtnEditarNome) {
      els.modalBtnEditarNome.addEventListener("click", () => {
        const atual = els.modalAdminNome ? els.modalAdminNome.textContent.trim() : "";
        const novo = window.prompt("Digite o novo nome:", atual);
        if (novo === null) return;
        const t = novo.trim();
        if (!t) {
          mostrarToast("Nome não pode ficar vazio.", true);
          return;
        }
        if (els.modalAdminNome) els.modalAdminNome.textContent = t;
      });
    }
    if (els.modalFileInput && els.modalFoto) {
      els.modalFileInput.addEventListener("change", () => {
        if (!els.modalFileInput.files || !els.modalFileInput.files[0]) return;
        const reader = new FileReader();
        reader.onload = () => {
          els.modalFoto.src = reader.result;
        };
        reader.readAsDataURL(els.modalFileInput.files[0]);
      });
    }
    if (els.modalCameraBtn && els.modalFileInput) {
      els.modalCameraBtn.addEventListener("click", () => els.modalFileInput.click());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.editModal && !els.editModal.classList.contains("hidden")) {
        if (els.modalSaveOverlay && !els.modalSaveOverlay.classList.contains("hidden")) {
          hideModalSaveConfirm();
        } else {
          fecharModalEditar();
        }
      }
    });
  }

  function preencherPainel(admin) {
    adminAtual = admin;
    const nome = admin.nome || "Administrador";
    const email = admin.email || "";
    const ecoponto = admin.ecoponto || "EcoPonto parceiro";

    if (els.profileInitial) els.profileInitial.textContent = inicialDoNome(nome);
    if (els.profileName) els.profileName.textContent = nome;
    if (els.profileEmail) els.profileEmail.textContent = email || "—";
    if (els.profilePoint) els.profilePoint.textContent = ecoponto;
    if (els.configAdminName) els.configAdminName.textContent = nome;
    if (els.configAdminEmail) els.configAdminEmail.textContent = email || "—";
    aplicarFotoPerfil(admin.foto_perfil, nome);
    if (admin.preferencias) {
      aplicarPreferencias(admin.preferencias);
    }

    document.documentElement.classList.remove("admin-auth-checking");
  }

  async function carregarPerfilCompleto() {
    const res = await fetch(PERFIL_URL, {
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = parseJsonServidor(await res.text());
    if (!data || data.sucesso !== true || !data.admin) {
      throw new Error((data && data.erro) || "Não foi possível carregar o perfil.");
    }
    adminAtual = data.admin;
    salvarAdminLocal(data.admin);
    preencherPainel(data.admin);

    const hash = (window.location.hash || "").toLowerCase();
    if (hash === "#senha" || hash === "#editar-perfil" || hash === "#editar") {
      abrirModalEditar(hash === "#senha");
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  async function salvarPreferencias() {
    if (els.btnSave) els.btnSave.disabled = true;
    const payload = coletarPreferenciasForm();

    try {
      const res = await fetch(CONFIG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = parseJsonServidor(await res.text());
      if (!data || data.sucesso !== true) {
        mostrarToast((data && data.erro) || "Erro ao salvar preferências.", true);
        return;
      }
      if (data.preferencias) {
        aplicarPreferencias(data.preferencias);
      }
      mostrarToast(data.mensagem || "Alterações salvas com sucesso.");
    } catch (e) {
      mostrarToast("Erro de conexão ao salvar.", true);
    } finally {
      if (els.btnSave) els.btnSave.disabled = false;
    }
  }

  function configurarTema() {
    els.themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        els.themeButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (btn.getAttribute("data-theme") === "dark") {
          mostrarToast("Modo escuro salvo nas preferências ao clicar em Salvar.");
        }
      });
    });
  }

  function configurarTipoColeta() {
    els.typeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        els.typeButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  }

  function configurarAcoes() {
    if (els.btnSave) {
      els.btnSave.addEventListener("click", salvarPreferencias);
    }

    if (els.btnAddUser) {
      els.btnAddUser.addEventListener("click", () => {
        window.alert("Gestão de administradores — recurso em desenvolvimento.");
      });
    }

    if (els.btnEditHours) {
      els.btnEditHours.addEventListener("click", () => {
        if (!els.configHours) return;
        els.configHours.removeAttribute("readonly");
        els.configHours.focus();
        els.configHours.select();
      });
    }

    if (els.btnChangePassword) {
      els.btnChangePassword.addEventListener("click", () => abrirModalEditar(true));
    }

    els.userActionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const acao = btn.getAttribute("data-user-action");
        const titulo = acao === "delete" ? "Excluir administrador" : "Editar administrador";
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

      await carregarPerfilCompleto();
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
  configurarTema();
  configurarTipoColeta();
  configurarModalEditar();
  configurarAcoes();
  validarSessaoAdmin();
})();
