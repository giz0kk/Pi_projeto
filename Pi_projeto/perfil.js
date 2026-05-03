document.addEventListener('DOMContentLoaded', function () {
  const botaoMais = document.querySelector(".btn-mais");
  const celulas = document.querySelectorAll(".celula");
  const notificacoes = document.querySelectorAll(".notificacao");
  const historicos = document.querySelectorAll(".item-historico");
  const pontosPerfil = document.querySelector("#user-points");

  const rawUserPoints = localStorage.getItem('userPoints');
  let userPoints = 2000;

  if (rawUserPoints !== null) {
    const cleanedPoints = rawUserPoints.replace(/[^\d]/g, '');
    const parsedPoints = parseInt(cleanedPoints, 10);
    if (!isNaN(parsedPoints) && parsedPoints >= 0) {
      userPoints = parsedPoints;
    }
  }

  localStorage.setItem('userPoints', userPoints);

  if (pontosPerfil) {
    pontosPerfil.textContent = userPoints.toLocaleString('pt-BR') + ' EcoPoints';
  }

  const perfilModal = document.getElementById("perfilModal");
  const openPerfilModal = document.getElementById("openPerfilModal");
  const closePerfilModal = document.getElementById("closePerfilModal");
  const cancelPerfilModal = document.getElementById("cancelPerfilModal");
  const perfilForm = document.getElementById("perfilForm");
  const editNameBtn = document.getElementById("editNameBtn");
  const modalNome = document.getElementById("modalNome");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.querySelector(".modal-text");
  const cameraBtn = document.querySelector(".camera-btn");
  const modalFileInput = document.getElementById("modalFileInput");
  const modalFoto = document.querySelector("#perfilModal .foto-perfil");
  const editarEnderecoBtn = document.getElementById("editarEnderecoBtn");
  let currentModalMode = "profile";

  function setModalMode(mode) {
    currentModalMode = mode;
    const allFields = document.querySelectorAll('#perfilModal .perfil-campo');
    const addressFields = document.querySelectorAll('#perfilModal .perfil-campo.endereco-campo');

    if (mode === 'address') {
      modalTitle.textContent = 'Editar endereço';
      modalText.textContent = 'Atualize apenas os dados do seu endereço.';
      allFields.forEach(field => field.classList.add('hidden'));
      addressFields.forEach(field => field.classList.remove('hidden'));
    } else {
      modalTitle.textContent = 'Editar perfil';
      modalText.textContent = 'Atualize seus dados rapidamente, sem sair da página.';
      allFields.forEach(field => field.classList.remove('hidden'));
    }
  }

  function openModal(mode = 'profile') {
    if (perfilModal) {
      setModalMode(mode);
      perfilModal.classList.remove("hidden");
      document.body.classList.add("modal-open");
    }
  }

  function closeModal() {
    if (perfilModal) {
      perfilModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    }
  }

  if (openPerfilModal) {
    openPerfilModal.addEventListener("click", function () { openModal('profile'); });
  }

  if (editarEnderecoBtn) {
    editarEnderecoBtn.addEventListener("click", function () { openModal('address'); });
  }

  if (closePerfilModal) {
    closePerfilModal.addEventListener("click", closeModal);
  }

  if (cancelPerfilModal) {
    cancelPerfilModal.addEventListener("click", closeModal);
  }

  if (perfilModal) {
    perfilModal.addEventListener("click", function (event) {
      if (event.target === perfilModal) {
        closeModal();
      }
    });
  }

  const confirmarPerfilBtn = document.getElementById("confirmarPerfilBtn");

  function confirmarPerfil() {
    const campos = Array.from(document.querySelectorAll('#perfilModal .perfil-campo input'))
      .filter(field => !field.closest('.perfil-campo').classList.contains('hidden'));
    let todosPreenchidos = true;

    campos.forEach(campo => {
      if (campo.required && campo.value.trim() === "") {
        todosPreenchidos = false;
      }
    });

    if (!todosPreenchidos) {
      alert("Preencha todos os campos obrigatórios antes de continuar!");
      return;
    }

    // Validação específica para e-mails
    const emails = document.querySelectorAll('#perfilModal input[type="email"]');
    if (emails.length >= 2 && emails[0].value !== emails[1].value) {
      alert("Os e-mails não coincidem.");
      return;
    }

    // Validação específica para senhas
    const senhas = document.querySelectorAll('#perfilModal input[type="password"]');
    if (senhas.length >= 2 && senhas[0].value !== senhas[1].value) {
      alert("As senhas não coincidem.");
      return;
    }

    closeModal();
    alert("Perfil atualizado com sucesso!");
  }

  if (perfilForm) {
    perfilForm.addEventListener("submit", function (event) {
      event.preventDefault();
      confirmarPerfil();
    });
  }

  if (confirmarPerfilBtn) {
    confirmarPerfilBtn.addEventListener("click", confirmarPerfil);
  }

  if (editNameBtn && modalNome) {
    editNameBtn.addEventListener("click", function () {
      const novoNome = prompt("Digite o novo nome:", modalNome.textContent);
      if (novoNome && novoNome.trim() !== "") {
        modalNome.textContent = novoNome.trim();
      }
    });
  }

  if (cameraBtn && modalFileInput && modalFoto) {
    cameraBtn.addEventListener("click", function () {
      modalFileInput.click();
    });

    modalFileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        modalFoto.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (botaoMais) {
    botaoMais.addEventListener("click", function () {
      alert("Modo de agendamento ativado! Clique em um horário vazio do calendário.");
    });
  }

  celulas.forEach(function (celula) {
    celula.addEventListener("click", function () {
      if (!celula.classList.contains("coleta")) {
        celula.classList.add("coleta");
        celula.innerHTML = "Coleta";
      } else {
        celula.classList.remove("coleta");
        celula.innerHTML = "";
      }
    });
  });

  notificacoes.forEach(function (item) {
    item.addEventListener("mouseover", function () {
      item.style.transform = "scale(1.02)";
      item.style.transition = "0.2s";
      item.style.cursor = "pointer";
    });

    item.addEventListener("mouseout", function () {
      item.style.transform = "scale(1)";
    });
  });

  historicos.forEach(function (item) {
    item.addEventListener("mouseover", function () {
      item.style.backgroundColor = "#f5f7ff";
      item.style.transition = "0.2s";
    });

    item.addEventListener("mouseout", function () {
      item.style.backgroundColor = "transparent";
    });
  });
});