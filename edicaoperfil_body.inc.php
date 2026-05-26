  <header class="topo">
    <div class="nav-left">
      <a href="tela-inicia.html" class="logo-link">
        <img src="Imagens/logo.2.png" alt="EcoColeta">
      </a>
      <nav>
        <ul class="menu">
          <li><a href="tela-inicia.html">Home</a></li>
          <li><a href="pagina-relatorio.html">Gerar Relatório</a></li>
          <li><a href="como-funciona.html">Como Funciona</a></li>
          <li><a href="ecopontos.html">EcoPontos</a></li>
          <li><a href="premios-disponiveis.html">Prêmios</a></li>
          <li><a href="educacao-ambiental.html">Educação</a></li>
          <li><a href="quem-somos.html">Quem Somos</a></li>
          <li><a href="Ranking.html">Ranking</a></li>
        </ul>
      </nav>
    </div>
    <div class="icones">
      <div class="notif-wrapper">
        <button type="button" class="notif-btn" aria-label="Notificações">
          <img src="Imagens/icon notificacao.png" alt="" class="icon">
        </button>
        <div class="notif-overlay hidden"><div class="notif-box"><div class="header"><h2>Notificações</h2><span class="gear">⚙️</span></div></div></div>
      </div>
      <a href="perfil.html"><img src="Imagens/icons pessoa.png" alt="Perfil"></a>
    </div>
  </header>

  <div class="modal-overlay">
    <div class="modal">
      <div class="perfil-container">
        <div class="perfil-header">
          <div>
            <span class="page-label">Perfil</span>
            <h1 class="perfil-titulo">Editar perfil</h1>
            <p class="perfil-subtitulo">Atualize seus dados de acesso e mantenha seu perfil seguro e alinhado com a sua conta.</p>
          </div>
          <button type="button" class="close-modal" onclick="fecharModal()">×</button>
        </div>

        <div class="perfil-topo">
          <div class="perfil-info">
            <div class="foto-box foto-box-edicao">
              <input type="file" id="fileInput" name="foto" class="edicao-foto-input" accept="image/*" form="perfilEditForm" tabindex="-1" title="">
              <label for="fileInput" class="foto-avatar-label" id="fotoAvatarLabel">
                <img src="<?php echo h($fotoSrc); ?>" class="foto-perfil" id="fotoPerfilEdicao" alt="">
                <span class="foto-avatar-overlay" aria-hidden="true">Alterar foto</span>
              </label>
              <button type="button" class="icone-camera-btn" id="iconeCameraBtn" aria-label="Abrir seletor de imagem">
                <img src="Imagens/image.png" class="icone-camera" alt="">
              </button>
            </div>
            <div class="nome-com-lapis">
              <span class="nome"><?php echo h($usuario["nome"]); ?></span>
              <button type="button" class="lapis" aria-label="Editar nome">
                <img src="Imagens/lapis.png" alt="">
              </button>
            </div>
          </div>
        </div>

        <form id="perfilEditForm" class="perfil-form" action="atualizar-perfil.php" method="POST" enctype="multipart/form-data" onsubmit="confirmarPerfil(event)">
          <div class="campos-form">
            <div class="perfil-campo">
              <label for="editEmail">E-mail</label>
              <input id="editEmail" name="email" type="email" value="<?php echo h($usuario["email"]); ?>" placeholder="Digite aqui o seu e-mail..." autocomplete="email" required>
              <span class="field-error" id="emailError"></span>
            </div>
            <div class="perfil-campo">
              <label for="editConfirmEmail">Confirmar e-mail</label>
              <input id="editConfirmEmail" name="confirmaremail" type="email" value="<?php echo h($usuario["email"]); ?>" placeholder="Confirme seu e-mail..." autocomplete="email" required>
              <span class="field-error" id="confirmEmailError"></span>
            </div>
            <div class="perfil-campo">
              <label for="editPassword">Senha</label>
              <input id="editPassword" name="senha" type="password" placeholder="Deixe em branco para manter a senha atual" autocomplete="new-password">
              <span class="field-error" id="passwordError"></span>
            </div>
            <div class="perfil-campo">
              <label for="editConfirmPassword">Confirmar senha</label>
              <input id="editConfirmPassword" name="confirmarsenha" type="password" placeholder="Repita a nova senha" autocomplete="new-password">
              <span class="field-error" id="confirmPasswordError"></span>
            </div>
            <div class="perfil-campo">
              <label for="editEndereco">Endereço (rua)</label>
              <input id="editEndereco" name="endereco" type="text" value="<?php echo h($usuario["nome_rua"]); ?>" placeholder="Rua, avenida, travessa...">
            </div>
            <div class="perfil-campo">
              <label for="editBairro">Bairro</label>
              <input id="editBairro" name="bairro" type="text" value="<?php echo h($usuario["nome_bairro"]); ?>" placeholder="Digite o bairro...">
            </div>
            <div class="perfil-campo">
              <label for="editNumero">Número</label>
              <input id="editNumero" name="numero" type="text" value="<?php echo h($usuario["numero"]); ?>" placeholder="Ex: 32, 32A ou S/N" maxlength="30">
            </div>
            <div class="perfil-campo">
              <label for="editCidade">Cidade</label>
              <input id="editCidade" name="cidade" type="text" value="<?php echo h($usuario["cidade"]); ?>" placeholder="Digite a cidade...">
            </div>
            <div class="perfil-campo">
              <label for="editComplemento">Complemento</label>
              <input id="editComplemento" name="complemento" type="text" value="<?php echo h($usuario["complemento"]); ?>" placeholder="Apartamento, bloco...">
            </div>
          </div>
          <button type="submit" class="perfil-botao">Confirmar</button>
        </form>
      </div>
    </div>
  </div>

  <div class="save-confirm-overlay hidden" id="saveConfirmOverlay">
    <div class="save-confirm-dialog">
      <p>Tem certeza que deseja salvar as alterações?</p>
      <div class="save-confirm-actions">
        <button type="button" class="btn-cancel" id="cancelSaveBtn">Cancelar</button>
        <button type="button" class="btn-editar" id="confirmSaveBtn">Confirmar</button>
      </div>
    </div>
  </div>

  <script src="notif-popup.js?v=3"></script>
  <script src="header-nav.js?v=9"></script>
  <script src="user-popup.js"></script>
  <script src="edicaoperfil.js"></script>
  <script>
    function fecharModal() { window.history.back(); }
  </script>
