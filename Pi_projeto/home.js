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

  // 🔔 NOTIFICAÇÃO (POP-UP)
  const btnNotif = document.querySelector(".notif-btn");
  const overlay = document.querySelector(".notif-overlay");
  const closeNotif = document.querySelector(".close-notif");

  if (btnNotif && overlay) {

    // abrir
    btnNotif.addEventListener("click", () => {
      overlay.classList.remove("hidden");
    });

    // fechar no X
    if (closeNotif) {
      closeNotif.addEventListener("click", () => {
        overlay.classList.add("hidden");
      });
    }

    // fechar clicando fora
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  // 🚧 LINKS EM CONSTRUÇÃO
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