document.addEventListener("DOMContentLoaded", () => {

  const notificacao = document.querySelector(".icone-circulo a");

  if (notificacao) {
    notificacao.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Você não tem notificações novas 🔔");
    });
  }
  const input = document.querySelector(".filtro input");
  const cards = document.querySelectorAll(".ecoponto-card");

  if (input) {
    input.addEventListener("keyup", () => {
      const valor = input.value.toLowerCase();

      cards.forEach(card => {
        const texto = card.textContent.toLowerCase();

        if (texto.includes(valor)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
  const select = document.querySelector(".filtro select");

  if (select) {
    select.addEventListener("change", () => {
      const valor = select.value.toLowerCase();

      cards.forEach(card => {
        const texto = card.textContent.toLowerCase();

        if (valor === "filtrar por: bairro" || texto.includes(valor)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
  const cardDetalhado = document.querySelector(".card-ecoponto");

  if (cardDetalhado) {
    cardDetalhado.style.display = "none";

    cards.forEach(card => {
      card.addEventListener("click", () => {
        if (cardDetalhado.style.display === "none") {
          cardDetalhado.style.display = "block";
        } else {
          cardDetalhado.style.display = "none";
        }
      });
    });
  }

});