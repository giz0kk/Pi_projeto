document.addEventListener("DOMContentLoaded", () => {
  const visitorPanel = document.getElementById("rankingVisitorPanel");
  const visitorLogin = document.getElementById("rankingVisitorLogin");
  const visitorCadastro = document.getElementById("rankingVisitorCadastro");
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  function redirectUrl(file) {
    const current = window.location.pathname.split("/").pop() + window.location.search + window.location.hash;
    return file + "?redirect=" + encodeURIComponent(current || "Ranking.html");
  }

  if (visitorPanel && !loggedIn) {
    document.body.classList.add("ranking-guest");
    visitorPanel.style.display = "";
    visitorPanel.classList.remove("hidden");
    if (visitorLogin) visitorLogin.href = redirectUrl("login.html");
    if (visitorCadastro) visitorCadastro.href = redirectUrl("cadastro.html");

    const posicaoCard = document.querySelector('[data-guest-card="posicao"]');
    const progressoCard = document.querySelector('[data-guest-card="progresso"]');
    if (posicaoCard) {
      posicaoCard.innerHTML =
        '<span class="card-award-icon">🎖️</span>' +
        '<h3>Ranking pessoal</h3>' +
        '<p class="guest-card-text">Entre para ver sua posição no ranking semanal e acompanhar sua evolução no bairro.</p>' +
        '<div class="guest-card-actions">' +
        '<a href="' + redirectUrl("login.html") + '">Entrar</a>' +
        '<a href="' + redirectUrl("cadastro.html") + '">Cadastrar</a>' +
        '</div>';
    }
    if (progressoCard) {
      progressoCard.innerHTML =
        '<span class="card-award-icon">🎯</span>' +
        '<h3>Seu progresso</h3>' +
        '<p class="guest-card-text">Crie uma conta para salvar suas coletas, gerar EcoPoints e visualizar metas mensais.</p>' +
        '<div class="guest-card-actions">' +
        '<button type="button" data-requires-auth>Começar agora</button>' +
        '</div>';
    }
  } else {
    document.body.classList.remove("ranking-guest");
    if (visitorPanel) {
      visitorPanel.classList.add("hidden");
      visitorPanel.style.display = "none";
    }
  }

  
  const notificacao = document.querySelector(".icone-circulo a");

  if (notificacao) {
    notificacao.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Você não tem notificações novas 🔔");
    });
  }


  const input = document.querySelector(".busca input");
  const linhas = document.querySelectorAll("tbody tr");

  if (input) {
    input.addEventListener("keyup", () => {
      const valor = input.value.toLowerCase();

      linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();

        if (texto.includes(valor)) {
          linha.style.display = "";
        } else {
          linha.style.display = "none";
        }
      });
    });
  }


  const top1 = document.querySelector(".top1");
  const top2 = document.querySelector(".top2");
  const top3 = document.querySelector(".top3");

  if (top1) top1.style.fontWeight = "bold";
  if (top2) top2.style.fontWeight = "bold";
  if (top3) top3.style.fontWeight = "bold";

});