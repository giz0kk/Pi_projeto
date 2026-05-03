function confirmarPerfil() {
  const campos = document.querySelectorAll('.perfil-campo input');
  let todosPreenchidos = true;

  campos.forEach(campo => {
    if (campo.value.trim() === "") {
      todosPreenchidos = false;
    }
  });

  if (!todosPreenchidos) {
    alert("Preencha todos os campos obrigatórios antes de continuar!");
    return;
  }

  // Validação específica para e-mails
  const emails = document.querySelectorAll('input[type="email"]');
  if (emails.length >= 2 && emails[0].value !== emails[1].value) {
    alert("Os e-mails não coincidem.");
    return;
  }

  // Validação específica para senhas
  const senhas = document.querySelectorAll('input[type="password"]');
  if (senhas.length >= 2 && senhas[0].value !== senhas[1].value) {
    alert("As senhas não coincidem.");
    return;
  }

  alert("Perfil atualizado com sucesso!");
  window.location.href = "perfil.html";
}

/* ===== EDITAR NOME ===== */
const nome = document.querySelector(".nome");
const lapis = document.querySelector(".lapis");

lapis.addEventListener("click", () => {
  const novoNome = prompt("Digite o novo nome:");

  if (novoNome && novoNome.trim() !== "") {
    nome.textContent = novoNome;
  }
});

/* ===== TROCAR FOTO ===== */
const camera = document.querySelector(".icone-camera");
const foto = document.querySelector(".foto-perfil");
const fileInput = document.getElementById("fileInput");

camera.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    foto.src = e.target.result;
  };

  reader.readAsDataURL(file);
});