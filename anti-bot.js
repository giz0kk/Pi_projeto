/* =========================================================
   EcoCheck - validacao anti-bot simples (apenas client-side).
   Quatro camadas:
     1) Checkbox "Nao sou um robo" marcado manualmente
     2) Honeypot field invisivel ao usuario
     3) Tempo minimo entre carregar a pagina e enviar
     4) Pelo menos uma interacao (mousemove/keydown/touchstart)

   API global:
     EcoAntiBot.init()                  - re-escaneia widgets (auto roda em DOMContentLoaded)
     EcoAntiBot.validate(elOpcional)    - retorna { ok: bool, erro: string|null }
     EcoAntiBot.reset(elOpcional)       - limpa estado
     EcoAntiBot.isVerified(elOpcional)  - boolean simples

   Evento emitido pelo widget (bubbles=true):
     'eco-antibot:change'  com  detail = { verified: bool }
   ========================================================= */
(function (window, document) {
  "use strict";

  var TEMPO_MINIMO_MS = 800;
  var ESTADO = new WeakMap();

  /* Captura UMA interacao real do usuario na pagina inteira. */
  var interagiu = false;
  function marcarInteracao() { interagiu = true; }
  document.addEventListener("mousemove", marcarInteracao, { once: true, passive: true });
  document.addEventListener("keydown", marcarInteracao, { once: true, passive: true });
  document.addEventListener("touchstart", marcarInteracao, { once: true, passive: true });
  document.addEventListener("pointerdown", marcarInteracao, { once: true, passive: true });

  function acharWidgets(raiz) {
    if (raiz && raiz.matches && raiz.matches("[data-eco-antibot]")) return [raiz];
    var scope = raiz || document;
    return Array.prototype.slice.call(scope.querySelectorAll("[data-eco-antibot]"));
  }

  function pegarEstado(widget) {
    var s = ESTADO.get(widget);
    if (!s) {
      s = { verified: false, iniciadoEm: Date.now(), cliques: 0 };
      ESTADO.set(widget, s);
    }
    return s;
  }

  function emitirMudanca(widget, verified) {
    var ev = new CustomEvent("eco-antibot:change", {
      detail: { verified: !!verified },
      bubbles: true,
    });
    widget.dispatchEvent(ev);
  }

  function aplicarVerificado(widget, verified) {
    var s = pegarEstado(widget);
    s.verified = !!verified;
    var btn = widget.querySelector(".eco-antibot-btn");
    if (btn) {
      btn.setAttribute("aria-checked", verified ? "true" : "false");
      btn.classList.toggle("is-verified", !!verified);
      btn.classList.remove("is-loading");
    }
    widget.classList.toggle("is-verified-card", !!verified);
    widget.classList.remove("has-err");
    emitirMudanca(widget, verified);
  }

  function aplicarCarregando(widget, loading) {
    var btn = widget.querySelector(".eco-antibot-btn");
    if (!btn) return;
    btn.classList.toggle("is-loading", !!loading);
    btn.disabled = !!loading;
  }

  function mostrarErro(widget, msg) {
    var err = widget.querySelector(".eco-antibot-err");
    if (!err) {
      err = document.createElement("span");
      err.className = "eco-antibot-err";
      widget.appendChild(err);
    }
    err.textContent = msg || "";
    widget.classList.toggle("has-err", !!msg);
  }

  function inicializarWidget(widget) {
    if (ESTADO.has(widget)) return;
    pegarEstado(widget); // cria estado inicial

    if (!widget.querySelector(".eco-antibot-hp")) {
      var hp = document.createElement("input");
      hp.type = "text";
      hp.className = "eco-antibot-hp";
      hp.name = "eco_antibot_hp";
      hp.tabIndex = -1;
      hp.autocomplete = "off";
      hp.setAttribute("aria-hidden", "true");
      widget.appendChild(hp);
    }

    var btn = widget.querySelector(".eco-antibot-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var s = pegarEstado(widget);
      if (s.verified) {
        aplicarVerificado(widget, false);
        return;
      }
      s.cliques = (s.cliques || 0) + 1;
      mostrarErro(widget, "");
      aplicarCarregando(widget, true);

      var atraso = 500 + Math.floor(Math.random() * 400);
      setTimeout(function () {
        aplicarCarregando(widget, false);
        aplicarVerificado(widget, true);
      }, atraso);
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        btn.click();
      }
    });
  }

  function validar(rootOuWidget) {
    var widgets = acharWidgets(rootOuWidget);
    if (widgets.length === 0) {
      return { ok: false, erro: "Verificacao anti-bot ausente na pagina." };
    }
    var widget = widgets[0];
    var s = pegarEstado(widget);

    var hp = widget.querySelector(".eco-antibot-hp");
    if (hp && String(hp.value || "").trim() !== "") {
      mostrarErro(widget, "Falha na verificacao. Recarregue a pagina.");
      return { ok: false, erro: "Falha na verificacao anti-bot (honeypot)." };
    }

    var decorrido = Date.now() - (s.iniciadoEm || 0);
    if (decorrido < TEMPO_MINIMO_MS) {
      mostrarErro(widget, "Aguarde um instante antes de enviar.");
      return { ok: false, erro: "Envio rapido demais. Aguarde um instante." };
    }

    if (!interagiu) {
      mostrarErro(widget, "Interaja com a pagina antes de continuar.");
      return { ok: false, erro: "Sem interacao do usuario detectada." };
    }

    if (!s.verified) {
      mostrarErro(widget, 'Marque "Nao sou um robo" para continuar.');
      return { ok: false, erro: 'Marque "Nao sou um robo" para continuar.' };
    }

    mostrarErro(widget, "");
    return { ok: true, erro: null };
  }

  function resetar(rootOuWidget) {
    acharWidgets(rootOuWidget).forEach(function (w) {
      aplicarVerificado(w, false);
      mostrarErro(w, "");
      var hp = w.querySelector(".eco-antibot-hp");
      if (hp) hp.value = "";
      var s = pegarEstado(w);
      s.iniciadoEm = Date.now();
      s.cliques = 0;
    });
  }

  function isVerified(rootOuWidget) {
    var widgets = acharWidgets(rootOuWidget);
    if (widgets.length === 0) return false;
    return !!pegarEstado(widgets[0]).verified;
  }

  function init(root) {
    acharWidgets(root).forEach(inicializarWidget);
  }

  window.EcoAntiBot = {
    init: init,
    validate: validar,
    reset: resetar,
    isVerified: isVerified,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); });
  } else {
    init();
  }
})(window, document);
