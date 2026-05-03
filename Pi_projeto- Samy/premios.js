document.addEventListener('DOMContentLoaded', function () {
  // Simulação do banco de dados SQL_BDD_Premios
  const premios = [
    {
      id: 1,
      nome: 'PowerFit Club',
      descricao: '15% de descontos',
      pontos_necessarios: 347,
      cupom_codigo: 'ECO100OFF',
      desconto_percentual: 15,
      valor_minimo: 150,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'PowerFit Club',
      ativo: true
    },
    {
      id: 2,
      nome: 'IronFlex',
      descricao: '30% de descontos',
      pontos_necessarios: 289,
      cupom_codigo: 'IRON30',
      desconto_percentual: 30,
      valor_minimo: 120,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'IronFlex',
      ativo: true
    },
    {
      id: 3,
      nome: 'MoveUp Gym',
      descricao: '20% de descontos',
      pontos_necessarios: 412,
      cupom_codigo: 'MOVEUP20',
      desconto_percentual: 20,
      valor_minimo: 200,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'MoveUp Gym',
      ativo: true
    },
    {
      id: 4,
      nome: 'Pão Nobre',
      descricao: '15% de descontos',
      pontos_necessarios: 150,
      cupom_codigo: 'PANOBRE15',
      desconto_percentual: 15,
      valor_minimo: 80,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Pão Nobre',
      ativo: true
    },
    {
      id: 5,
      nome: 'Forno Dourado',
      descricao: '20% de descontos',
      pontos_necessarios: 200,
      cupom_codigo: 'DOURADO20',
      desconto_percentual: 20,
      valor_minimo: 100,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Forno Dourado',
      ativo: true
    },
    {
      id: 6,
      nome: 'Trigo & Sabor',
      descricao: '10% de descontos',
      pontos_necessarios: 100,
      cupom_codigo: 'TRIGO10',
      desconto_percentual: 10,
      valor_minimo: 150,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Trigo & Sabor',
      ativo: true
    },
    {
      id: 7,
      nome: 'VitaNex',
      descricao: '10% de descontos',
      pontos_necessarios: 120,
      cupom_codigo: 'VITANEX10',
      desconto_percentual: 10,
      valor_minimo: 200,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'VitaNex',
      ativo: true
    },
    {
      id: 8,
      nome: 'PharmaLeaf',
      descricao: '20% de descontos',
      pontos_necessarios: 220,
      cupom_codigo: 'PHARMALEAF20',
      desconto_percentual: 20,
      valor_minimo: 300,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'PharmaLeaf',
      ativo: true
    },
    {
      id: 9,
      nome: 'SaúdePrime',
      descricao: '25% de descontos',
      pontos_necessarios: 280,
      cupom_codigo: 'SAUDEPRIME25',
      desconto_percentual: 25,
      valor_minimo: 250,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'SaúdePrime',
      ativo: true
    },
    {
      id: 10,
      nome: 'MaxCompra',
      descricao: '10% de descontos',
      pontos_necessarios: 130,
      cupom_codigo: 'MAXCOMPRA10',
      desconto_percentual: 10,
      valor_minimo: 70,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'MaxCompra',
      ativo: true
    },
    {
      id: 11,
      nome: 'MercaPlus',
      descricao: '30% de descontos',
      pontos_necessarios: 320,
      cupom_codigo: 'MERCAPLUS30',
      desconto_percentual: 30,
      valor_minimo: 180,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'MercaPlus',
      ativo: true
    },
    {
      id: 12,
      nome: 'BomPreço',
      descricao: '20% de descontos',
      pontos_necessarios: 210,
      cupom_codigo: 'BOMPRECO20',
      desconto_percentual: 20,
      valor_minimo: 140,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'BomPreço',
      ativo: true
    },
    {
      id: 13,
      nome: 'Sabor da Vila',
      descricao: '15% de descontos',
      pontos_necessarios: 180,
      cupom_codigo: 'VILA15',
      desconto_percentual: 15,
      valor_minimo: 110,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Sabor da Vila',
      ativo: true
    },
    {
      id: 14,
      nome: 'Essência Gourmet',
      descricao: '10% de descontos',
      pontos_necessarios: 110,
      cupom_codigo: 'ESSENCIA10',
      desconto_percentual: 10,
      valor_minimo: 220,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Essência Gourmet',
      ativo: true
    },
    {
      id: 15,
      nome: 'Bistrô Raiz',
      descricao: '10% de descontos',
      pontos_necessarios: 105,
      cupom_codigo: 'RAIZ10',
      desconto_percentual: 10,
      valor_minimo: 90,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'Bistrô Raiz',
      ativo: true
    },
    {
      id: 16,
      nome: 'GlowBella',
      descricao: '10% de descontos',
      pontos_necessarios: 125,
      cupom_codigo: 'GLOW10',
      desconto_percentual: 10,
      valor_minimo: 280,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'GlowBella',
      ativo: true
    },
    {
      id: 17,
      nome: 'MakeLuxe',
      descricao: '15% de descontos',
      pontos_necessarios: 170,
      cupom_codigo: 'LUXE15',
      desconto_percentual: 15,
      valor_minimo: 160,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'MakeLuxe',
      ativo: true
    },
    {
      id: 18,
      nome: 'BeautyCharm',
      descricao: '20% de descontos',
      pontos_necessarios: 240,
      cupom_codigo: 'CHARM20',
      desconto_percentual: 20,
      valor_minimo: 130,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-16',
      parceiro: 'BeautyCharm',
      ativo: true
    },
    {
      id: 19,
      nome: 'EcoStyle',
      descricao: '18% de descontos',
      pontos_necessarios: 230,
      cupom_codigo: 'ECOSTYLE18',
      desconto_percentual: 18,
      valor_minimo: 190,
      data_inicio: '2026-04-01',
      data_expiracao: '2026-04-30',
      parceiro: 'EcoStyle',
      ativo: true
    },
    {
      id: 20,
      nome: 'VerdeVibe',
      descricao: '25% de descontos',
      pontos_necessarios: 260,
      cupom_codigo: 'VERDEVIBE25',
      desconto_percentual: 25,
      valor_minimo: 240,
      data_inicio: '2026-04-10',
      data_expiracao: '2026-05-10',
      parceiro: 'VerdeVibe',
      ativo: true
    }
  ];

  // Função para gerar os cards dinamicamente
  function generateCards() {
    const gridCards = document.querySelector('.grid-cards');
    gridCards.innerHTML = ''; // Limpa os cards existentes

    premios.forEach(premio => {
      if (!premio.ativo) return; // Pula se não ativo

      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('data-points', premio.pontos_necessarios);

      card.innerHTML = `
        <div class="card-icon"></div>
        <p class="card-title">${premio.parceiro}</p>
        <p class="card-description">${premio.descricao}</p>
        <p class="card-points">${premio.pontos_necessarios} pontos</p>
        <button type="button" class="badge resgatar-button">Resgatar</button>
        <div class="card-detail">
          <div class="coupon-top">
            <p class="coupon-code">${premio.cupom_codigo}</p>
            <p class="coupon-value">${premio.desconto_percentual}% OFF</p>
          </div>
          <p class="coupon-text">Ganhe ${premio.desconto_percentual}% OFF em compras acima de R$${premio.valor_minimo},00 no parceiro ${premio.parceiro}.</p>
          <div class="coupon-meta">
            <span class="coupon-date-start">Início: ${new Date(premio.data_inicio).toLocaleDateString('pt-BR')}</span>
            <span class="coupon-date-end">Expiração: ${new Date(premio.data_expiracao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      `;

      gridCards.appendChild(card);
    });
  }

  generateCards(); // Gera os cards ao carregar a página

  let userPoints = parseInt(localStorage.getItem('userPoints')) || 2000;

  const pointsDisplay = document.querySelector('.points-card strong');
  if (pointsDisplay) {
    pointsDisplay.textContent = userPoints;
  }

  function updatePointsDisplay() {
    const pointsDisplay = document.querySelector('.points-card strong');
    if (pointsDisplay) {
      pointsDisplay.textContent = userPoints;
    }
    localStorage.setItem('userPoints', userPoints);
  }

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

      const card = button.closest('.card');
      const pointsRequired = parseInt(card.dataset.points) || 0;
      const prizeName = card.querySelector('.card-title').textContent;

      if (userPoints < pointsRequired) {
        updateFeedback('Pontos insuficientes! Você precisa de ' + pointsRequired + ' pontos.', 'error');
        return;
      }

      const couponCode = card.querySelector('.coupon-code')?.textContent.trim() || '';
      const couponText = card.querySelector('.coupon-text')?.textContent.trim() || '';
      const couponStart = card.querySelector('.coupon-date-start')?.textContent.trim() || '';
      const couponEnd = card.querySelector('.coupon-date-end')?.textContent.trim() || '';

      userPoints -= pointsRequired;
      updatePointsDisplay();

      button.textContent = 'Resgatado';
      button.disabled = true;
      button.classList.add('resgatado');
      button.style.opacity = '1';
      button.style.cursor = 'default';

      showResgatePopup(prizeName, pointsRequired, couponCode, couponText, couponStart, couponEnd);
    });
  });

  function showResgatePopup(prizeName, pointsUsed, couponCode, couponText, couponStart, couponEnd) {
    const existingPopup = document.querySelector('.resgate-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.className = 'resgate-popup';
    popup.innerHTML = `
      <div class="resgate-overlay">
        <div class="resgate-content">
          <button class="resgate-close">&times;</button>
          <div class="resgate-header">
            <h3 class="resgate-title">${couponCode || prizeName}</h3>
            <p class="resgate-dates"><span class="date-label">Prazo:</span> <span class="date-start">Início ${couponStart}</span> <span class="date-end">Expiração ${couponEnd}</span></p>
          </div>
          <div class="resgate-icon">🎁</div>
          <h3>Prêmio Resgatado!</h3>
          <p class="resgate-prize">${prizeName}</p>
          <p class="resgate-points">-${pointsUsed} pontos</p>
          <p class="resgate-message">${couponText || 'Agora você pode usar seu cupom!'}</p>
          <button class="resgate-ok">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.resgate-close').addEventListener('click', () => popup.remove());
    popup.querySelector('.resgate-ok').addEventListener('click', () => popup.remove());
    popup.querySelector('.resgate-overlay').addEventListener('click', () => popup.remove());
  }

  const couponButton = document.querySelector('.coupon-button');
  const couponCode = document.querySelector('.coupon-code');

  if (couponButton && couponCode) {
    couponButton.addEventListener('click', function () {
      const code = couponCode.textContent.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          showResgatadoPopup();

          couponButton.textContent = '✓ Resgatado';
          couponButton.style.background = '#e53935';
          couponButton.style.color = 'white';
          couponButton.style.cursor = 'default';

        }, function () {
          alert('Erro ao copiar o cupom');
        });
      }
    });
  }

  function showResgatadoPopup() {
    const existingPopup = document.querySelector('.resgatado-popup');
    if (existingPopup) existingPopup.remove();

    const couponCode = document.querySelector('.coupon-code').textContent.trim();
    const couponDescription = document.querySelector('.coupon-description').textContent.trim();
    const couponDates = document.querySelector('.coupon-dates').innerHTML;

    const popup = document.createElement('div');
    popup.className = 'resgatado-popup';
    popup.innerHTML = `
      <div class="resgatado-overlay">
        <div class="resgatado-content">
          <button class="resgatado-close">&times;</button>
          <div class="resgatado-header">
            <h3 class="resgatado-title">${couponCode}</h3>
            <p class="resgatado-dates">${couponDates}</p>
          </div>
          <div class="resgatado-icon">✓</div>
          <h3>Cupom Resgatado!</h3>
          <p>Seu cupom foi copiado com sucesso para a área de transferência.</p>
          <div class="resgatado-codigo">${couponCode}</div>
          <p class="resgatado-details">${couponDescription}</p>
          <p class="resgatado-instructions">Apresente este código no parceiro para obter seu desconto.</p>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.resgatado-close').addEventListener('click', () => popup.remove());
    popup.querySelector('.resgatado-overlay').addEventListener('click', () => popup.remove());

    setTimeout(() => popup.remove(), 6000);
  }
});