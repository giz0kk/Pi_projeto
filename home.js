document.addEventListener("DOMContentLoaded", () => {

  // 🎓 APRENDA MAIS
  const btnAprender = document.querySelector(".aprender button");

  if (btnAprender) {
    btnAprender.addEventListener("click", () => {
      window.location.href = "educacao.html";
    });
  }

  // 🏆 VER MAIS PRÊMIOS
  const btnPremio = document.querySelector(".btn-premio");

  if (btnPremio) {
    btnPremio.addEventListener("click", () => {
      window.location.href = "premios-disponiveis.html";
    });
  }

  // 🤝 VIRE UM APOIADOR
  const btnApoiador = document.querySelector(".btn-apoiador");

  if (btnApoiador) {
    btnApoiador.addEventListener("click", () => {
      window.location.href = "apoiador.html";
    });
  }

  // 🔔 NOTIFICAÇÃO
  const notificacao = document.querySelector(".icone-circulo a");

  if (notificacao) {
    notificacao.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Você não tem notificações novas 🔔");
    });
  }


  const links = document.querySelectorAll(".menu a");

  links.forEach(link => {
    const href = link.getAttribute("href");

    if (href === "#") {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Página em construção 🚧");
      });
    }
  });

});