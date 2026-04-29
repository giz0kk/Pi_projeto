document.addEventListener('DOMContentLoaded', function () {
  // Detectar posição do card para abrir popup para esquerda se necessário
  const allCards = document.querySelectorAll('.card');

  allCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const rect = card.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;

      if (spaceRight < 360) {
        card.classList.add('left');
      } else {
        card.classList.remove('left');
      }
    });
  });

  const searchInput = document.querySelector('.search-box input');
  const searchButton = document.querySelector('.search-box button');
  const cards = Array.from(document.querySelectorAll('.grid-cards .card'));
  const verMaisButton = document.querySelector('.cta button');
  const feedback = document.createElement('div');
  feedback.className = 'search-feedback';
  const searchBox = document.querySelector('.search-box');
  if (searchBox) {
    searchBox.parentNode.insertBefore(feedback, searchBox.nextSibling);
  }

  function updateFeedback(message, status) {
    feedback.textContent = message;
    feedback.className = 'search-feedback ' + (status || 'info');
  }

  function filterCards() {
    const query = searchInput.value.trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const text = card.innerText.toLowerCase();
      const isMatch = query === '' || text.includes(query);
      card.style.display = isMatch ? 'grid' : 'none';
      if (isMatch) count += 1;
    });
    if (!query) {
      updateFeedback('Use a pesquisa para encontrar um prêmio específico.', 'info');
    } else if (count === 0) {
      updateFeedback('Nenhum prêmio encontrado para "' + query + '".', 'error');
    } else {
      updateFeedback(count + ' prêmio(s) encontrado(s).', 'success');
    }
  }

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', filterCards);
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        filterCards();
      }
    });
  }

  document.querySelectorAll('.resgatar-button').forEach((button) => {
    button.addEventListener('click', function () {
      if (button.disabled) return;
      button.textContent = 'Resgatado';
      button.disabled = true;
      button.classList.add('resgatado');
      button.style.opacity = '1';
      button.style.cursor = 'default';
      updateFeedback('Prêmio resgatado com sucesso!');
    });
  });

  const hiddenCards = Array.from(document.querySelectorAll('.grid-cards .extra-card.hidden'));

  if (verMaisButton) {
    const updateVerMaisVisibility = function () {
      const remaining = document.querySelectorAll('.grid-cards .extra-card.hidden').length;
      if (remaining === 0) {
        verMaisButton.style.display = 'none';
      } else {
        verMaisButton.style.display = 'inline-flex';
      }
    };

    updateVerMaisVisibility();

    verMaisButton.addEventListener('click', function () {
      hiddenCards.forEach((card) => {
        card.classList.remove('hidden');
      });
      updateFeedback('Mais prêmios carregados.', 'success');
      updateVerMaisVisibility();
      window.scrollTo({ top: verMaisButton.offsetTop + 20, behavior: 'smooth' });
    });
  }

  const couponButton = document.querySelector('.coupon-button');
  const couponCode = document.querySelector('.coupon-code');

  if (couponButton && couponCode) {
    couponButton.addEventListener('click', function () {
      const code = couponCode.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          // Mostrar popup de "Resgatado"
          showResgatadoPopup();
          // Mudar botão para vermelho
          couponButton.textContent = '✓ Resgatado';
          couponButton.style.background = '#e53935';
          couponButton.style.color = 'white';
          couponButton.style.cursor = 'default';
          updateFeedback('Cupom resgatado: ' + code, 'success');
        }, function () {
          updateFeedback('Não foi possível copiar o cupom automaticamente.', 'error');
        });
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        // Mostrar popup de "Resgatado"
        showResgatadoPopup();
        // Mudar botão para vermelho
        couponButton.textContent = '✓ Resgatado';
        couponButton.style.background = '#e53935';
        couponButton.style.color = 'white';
        couponButton.style.cursor = 'default';
        updateFeedback('Cupom resgatado: ' + code, 'success');
      }
    });
  }

  // Função para mostrar popup de "Resgatado"
  function showResgatadoPopup() {
    // Remover popup existente se houver
    const existingPopup = document.querySelector('.resgatado-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Criar popup
    const popup = document.createElement('div');
    popup.className = 'resgatado-popup';
    popup.innerHTML = `
      <div class="resgatado-overlay">
        <div class="resgatado-content">
          <button class="resgatado-close">&times;</button>
          <div class="resgatado-icon">✓</div>
          <h3>Cupom Resgatado!</h3>
          <p>Seu cupom foi copiado com sucesso.</p>
          <p class="resgatado-codigo">Código: ${document.querySelector('.coupon-code').textContent.trim()}</p>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // Estilizar popup
    const style = document.createElement('style');
    style.textContent = `
      .resgatado-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .resgatado-overlay {
        background: rgba(0, 0, 0, 0.6);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .resgatado-content {
        background: white;
        padding: 30px 40px;
        border-radius: 15px;
        text-align: center;
        position: relative;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: popupShow 0.3s ease;
        max-width: 320px;
        width: 90%;
      }
      @keyframes popupShow {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .resgatado-close {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        color: #999;
        cursor: pointer;
        line-height: 1;
      }
      .resgatado-close:hover {
        color: #333;
      }
      .resgatado-icon {
        width: 60px;
        height: 60px;
        background: #4caf50;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: white;
        margin: 0 auto 15px;
      }
      .resgatado-content h3 {
        color: #1f7a3d;
        font-size: 22px;
        margin-bottom: 10px;
      }
      .resgatado-content p {
        color: #555;
        font-size: 14px;
      }
      .resgatado-codigo {
        background: #f5f5f5;
        padding: 8px 15px;
        border-radius: 8px;
        margin-top: 12px;
        font-weight: bold;
        color: #1d1b5c !important;
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);

    // Fechar popup ao clicar no X
    popup.querySelector('.resgatado-close').addEventListener('click', function() {
      popup.remove();
    });

    // Fechar popup ao clicar fora
    popup.querySelector('.resgatado-overlay').addEventListener('click', function(e) {
      if (e.target === popup.querySelector('.resgatado-overlay')) {
        popup.remove();
      }
    });

    // Fechar automaticamente após 4 segundos
    setTimeout(function() {
      if (popup.parentNode) {
        popup.remove();
      }
    }, 4000);
  }
});