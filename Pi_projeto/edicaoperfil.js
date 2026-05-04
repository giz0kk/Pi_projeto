const saveConfirmOverlay = document.getElementById('saveConfirmOverlay');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');
const cancelSaveBtn = document.getElementById('cancelSaveBtn');

function showSaveConfirm() {
  if (saveConfirmOverlay) {
    saveConfirmOverlay.classList.remove('hidden');
  }
}

function hideSaveConfirm() {
  if (saveConfirmOverlay) {
    saveConfirmOverlay.classList.add('hidden');
  }
}

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('input-error');
  if (error) error.textContent = message;
}

function clearErrors() {
  ['editEmail', 'editConfirmEmail', 'editPassword', 'editConfirmPassword'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.classList.remove('input-error');
  });
  ['emailError', 'confirmEmailError', 'passwordError', 'confirmPasswordError'].forEach((id) => {
    const error = document.getElementById(id);
    if (error) error.textContent = '';
  });
}

function validarPerfil() {
  clearErrors();
  const email = document.getElementById('editEmail').value.trim();
  const confirmEmail = document.getElementById('editConfirmEmail').value.trim();
  const password = document.getElementById('editPassword').value.trim();
  const confirmPassword = document.getElementById('editConfirmPassword').value.trim();
  let valid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showError('editEmail', 'emailError', 'Digite um e-mail.');
    valid = false;
  } else if (!emailPattern.test(email)) {
    showError('editEmail', 'emailError', 'Digite um e-mail válido.');
    valid = false;
  }

  if (!confirmEmail) {
    showError('editConfirmEmail', 'confirmEmailError', 'Confirme seu e-mail.');
    valid = false;
  } else if (email !== confirmEmail) {
    showError('editConfirmEmail', 'confirmEmailError', 'Os e-mails não coincidem.');
    valid = false;
  }

  if (!password) {
    showError('editPassword', 'passwordError', 'Digite sua senha.');
    valid = false;
  }

  if (!confirmPassword) {
    showError('editConfirmPassword', 'confirmPasswordError', 'Confirme sua senha.');
    valid = false;
  } else if (password !== confirmPassword) {
    showError('editConfirmPassword', 'confirmPasswordError', 'As senhas não coincidem.');
    valid = false;
  }

  return valid;
}

function performSave() {
  if (!validarPerfil()) {
    return;
  }

  hideSaveConfirm();
  alert("Perfil atualizado com sucesso!");
  window.location.href = "perfil.html";
}

function confirmarPerfil() {
  if (!validarPerfil()) {
    return;
  }
  showSaveConfirm();
}

if (confirmSaveBtn) {
  confirmSaveBtn.addEventListener('click', performSave);
}

if (cancelSaveBtn) {
  cancelSaveBtn.addEventListener('click', hideSaveConfirm);
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