// Notif-popup.js - Sistema de popup de notificações
document.addEventListener("DOMContentLoaded", () => {
  const notifBtn = document.querySelector(".notif-btn");
  const notifOverlay = document.querySelector(".notif-overlay");
  const notifWrapper = document.querySelector(".notif-wrapper");

  if (notifBtn && notifOverlay) {
    // Toggle popup ao clicar no botão
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (notifOverlay.classList.contains("show")) {
        notifOverlay.classList.remove("show");
        notifOverlay.classList.add("hidden");
      } else {
        notifOverlay.classList.add("show");
        notifOverlay.classList.remove("hidden");
      }
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!notifWrapper.contains(e.target)) {
        notifOverlay.classList.remove("show");
        notifOverlay.classList.add("hidden");
      }
    });

    // Fechar ao clicar no X
    const closeBtn = notifOverlay.querySelector('.close-notif');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        notifOverlay.classList.remove("show");
        notifOverlay.classList.add("hidden");
        e.stopPropagation();
      });
    }

    // Impedir propagação no próprio wrapper
    if (notifWrapper) {
      notifWrapper.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }
});