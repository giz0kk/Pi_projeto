/**
 * Base href + URLs de PHP/assets após reorganização (auth/, pages/, URLs legadas na raiz).
 */
(function (global) {
  "use strict";

  var path = global.location.pathname.replace(/\\/g, "/");
  var folderMatch = path.match(/^(.*\/)(?:auth|admin|pages|mapa)\/[^/]+$/);
  var projectRoot = folderMatch ? folderMatch[1] : path.replace(/\/[^/]*$/, "/") || "/";
  if (projectRoot.charAt(projectRoot.length - 1) !== "/") {
    projectRoot += "/";
  }

  var baseEl = document.querySelector("base[data-app-base]");
  if (baseEl) {
    baseEl.href = projectRoot;
  }

  var AUTH_PHP =
    /^(login|cadastro|recuperar|resetar_senha|verificar_cadastro|verificar_codigo_recuperacao|vc)\.php$/i;
  var ADMIN_PHP = /^(Login-ADM(?:-Ecoponto)?|login-adm-pontos|admin-(?:plataforma|ecoponto)-session)\.php$/i;

  function resolvePhpPath(arquivoPhp) {
    var name = String(arquivoPhp || "").replace(/^\//, "");
    if (/^(auth|admin|api)\//i.test(name)) {
      return name;
    }
    if (name.indexOf("/") >= 0) {
      return name;
    }
    if (AUTH_PHP.test(name)) {
      return "auth/" + name;
    }
    if (ADMIN_PHP.test(name)) {
      return "admin/" + name;
    }
    return "api/" + name;
  }

  function absUrl(relativePath) {
    var rel = String(relativePath || "").replace(/^\//, "");
    return new URL(rel, global.location.origin + projectRoot).href;
  }

  global.ecocoletaProjectRoot = projectRoot;

  global.ecocoletaPhpUrl = function (arquivoPhp) {
    if (global.location.protocol === "file:") {
      return null;
    }
    return absUrl(resolvePhpPath(arquivoPhp));
  };

  global.ecocoletaAssetUrl = function (relativePath) {
    var clean = String(relativePath || "").replace(/^\//, "");
    if (/^Imagens\//i.test(clean)) {
      clean = clean.replace(/^Imagens\//i, "assets/images/");
    }
    return absUrl(clean);
  };
})(window);
