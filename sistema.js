/**
 * Sistema Central de Funcionalidades
 * Gerencia todos os botões e interações do projeto EcoColeta
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // BOTÃO DE AGENDAR NOVA COLETA (perfil.html)
  // ============================================
  const btnNovaColeta = document.querySelector('.btn-mais');
  if (btnNovaColeta) {
    btnNovaColeta.addEventListener('click', function() {
      alert('Funcionalidade de agendamento:\n\nEm breve você poderá agendar coletas diretamente pelo app!');
    });
  }

  // ============================================
  // BOTÃO DE CONFIRMAR (edicaoperfil.html)
  // ============================================
  const btnConfirmar = document.querySelector('.perfil-botao');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function() {
      alert('Perfil atualizado com sucesso!');
      window.location.href = 'perfil.html';
    });
  }

  // ============================================
  // BOTÃO DE CADASTRAR (cadastro.html)
  // ============================================
  const btnCadastrar = document.querySelector('.btn-verde');
  if (btnCadastrar && document.querySelector('.auth.cadastro')) {
    btnCadastrar.addEventListener('click', function(e) {
      e.preventDefault();
      // Simulação de cadastro
      const inputs = document.querySelectorAll('.auth.cadastro input');
      let preenchidos = true;
      inputs.forEach(input => {
        if (!input.value) preenchidos = false;
      });
      if (preenchidos) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'tela-inicia.html';
      } else {
        alert('Por favor, preencha todos os campos!');
      }
    });
  }

  // ============================================
  // BOTÃO DE ENTRAR (login.html)
  // ============================================
  const btnEntrar = document.querySelector('.auth.login .btn-verde');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', function(e) {
      e.preventDefault();
      const email = document.querySelector('.auth.login input[type="email"]');
      const senha = document.querySelector('.auth.login input[type="password"]');
      if (email && senha && email.value && senha.value) {
        window.location.href = 'tela-inicia.html';
      } else {
        alert('Por favor, preencha e-mail e senha!');
      }
    });
  }

  // ============================================
  // BOTÃO DE CONTINUAR (recuperar.html)
  // ============================================
  const btnContinuar = document.querySelector('.auth.recuperar .btn-verde');
  if (btnContinuar) {
    btnContinuar.addEventListener('click', function(e) {
      e.preventDefault();
      const email = document.querySelector('.auth.recuperar input');
      if (email && email.value) {
        window.location.href = 'verificacao.html';
      } else {
        alert('Por favor, digite seu e-mail!');
      }
    });
  }

  // ============================================
  // BOTÃO DE PRÓXIMO (verificacao.html)
  // ============================================
  const btnProximo = document.querySelector('.auth.verificacao .btn-verde');
  if (btnProximo) {
    btnProximo.addEventListener('click', function(e) {
      e.preventDefault();
        window.location.href = 'nova-senha.html';
    });
  }

  // ============================================
  // BOTÃO DE CONTINUAR (nova-senha.html)
  // ============================================
  const btnNovaSenha = document.querySelector('.auth.nova-senha .btn-verde');
  if (btnNovaSenha) {
    btnNovaSenha.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'senha-criada.html';
    });
  }

  // ============================================
  // BOTÃO DE OK (senha-criada.html)
  // ============================================
  const btnOk = document.querySelector('.auth.senha-criada .btn-verde');
  if (btnOk) {
    btnOk.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  // ============================================
  // FILTRO DE ECOPONTOS (ecopontos.html)
  // ============================================
  const filtroSelect = document.querySelector('.ecopontos-container select');
  if (filtroSelect) {
    filtroSelect.addEventListener('change', function() {
      const termo = this.value;
      const cards = document.querySelectorAll('.ecoponto-card');
      cards.forEach(card => {
        if (termo === 'Filtrar por: Bairro' || card.querySelector('h3').innerText.toLowerCase().includes(termo.toLowerCase())) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ============================================
  // BUSCA NO RANKING (Ranking.html)
  // ============================================
  const buscaRanking = document.querySelector('.ranking-section .busca button');
  if (buscaRanking) {
    buscaRanking.addEventListener('click', function() {
      const input = document.querySelector('.ranking-section .busca input');
      if (input && input.value) {
        alert('Buscando ranking do bairro: ' + input.value);
      } else {
        alert('Digite um bairro para buscar!');
      }
    });
  }
});