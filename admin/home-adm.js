(function () {
  'use strict';

  const LOGIN_PAGE = 'admin/Login-ADM.html';
  const SESSION_URL = window.ecocoletaPhpUrl
    ? window.ecocoletaPhpUrl('admin-plataforma-session.php')
    : 'admin-plataforma-session.php';

  function parseJsonServidor(text) {
    const raw = String(text || '').replace(/^\uFEFF/, '').trim();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (e) {
      const idx = raw.indexOf('{"');
      if (idx >= 0) return JSON.parse(raw.slice(idx));
      throw e;
    }
  }

  async function fetchSession() {
    const response = await fetch(SESSION_URL, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    return parseJsonServidor(await response.text());
  }

  function applyAdminUi(admin) {
    const nameEl = document.getElementById('hubAdminName');
    const cargoEl = document.getElementById('hubAdminCargo');
    const welcomeEl = document.getElementById('hubWelcomeName');
    if (nameEl) nameEl.textContent = admin.nome || 'Administrador';
    if (cargoEl) cargoEl.textContent = admin.cargo || 'Plataforma EcoColeta';
    if (welcomeEl) welcomeEl.textContent = admin.nome || 'Administrador';

    localStorage.setItem('ecocoletaPlatAdminLoggedIn', 'true');
    localStorage.setItem('ecocoletaPlatAdminName', admin.nome || '');
    localStorage.setItem('ecocoletaPlatAdminEmail', admin.email || '');
    localStorage.setItem('ecocoletaPlatAdminCargo', admin.cargo || '');
  }

  async function logout() {
    try {
      await fetch(SESSION_URL + '?acao=logout', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
    } catch (e) {
      /* segue para limpar cliente */
    }
    localStorage.removeItem('ecocoletaPlatAdminLoggedIn');
    localStorage.removeItem('ecocoletaPlatAdminName');
    localStorage.removeItem('ecocoletaPlatAdminEmail');
    localStorage.removeItem('ecocoletaPlatAdminCargo');
    window.location.replace(LOGIN_PAGE);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('hubLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }

    try {
      const data = await fetchSession();
      if (!data || data.sucesso !== true || !data.admin) {
        window.location.replace(LOGIN_PAGE);
        return;
      }
      applyAdminUi(data.admin);
    } catch (e) {
      window.location.replace(LOGIN_PAGE);
      return;
    } finally {
      document.documentElement.classList.remove('hub-auth-checking');
    }
  });
})();
