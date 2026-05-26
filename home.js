document.addEventListener("DOMContentLoaded", () => {

  // 🤝 VIRE UM APOIADOR
  const btnApoiador = document.querySelector(".btn-apoiador");

  if (btnApoiador) {
    btnApoiador.addEventListener("click", () => {
      window.location.href = "apoiador.html";
    });
  }

  // 🔔 NOTIFICAÇÃO (POP-UP) — pular se `notif-popup.js` já inicializou
  if (!window.__ecocoletaNotifInit) {
    const btnNotif = document.querySelector(".notif-btn");
    const overlay = document.querySelector(".notif-overlay");
    const closeNotif = document.querySelector(".close-notif");

    if (btnNotif && overlay) {
      btnNotif.addEventListener("click", () => {
        overlay.classList.remove("hidden");
      });

      if (closeNotif) {
        closeNotif.addEventListener("click", () => {
          overlay.classList.add("hidden");
        });
      }

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.add("hidden");
        }
      });
    }
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