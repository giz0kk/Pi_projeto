function confirmarPerfil() {
  const email = document.querySelector('input[type="email"]').value;
  const senha = document.querySelector('input[type="password"]').value;

  if (email === "" || senha === "") {
    alert("Preencha os campos antes de continuar!");
    return;
  }

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