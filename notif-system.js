/**
 * Sistema de Notificações Reutilizável
 * Inclua este script em todas as páginas que tiverem o botão de notificação
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializa todas as instâncias de notificação
  document.querySelectorAll('.notif-wrapper').forEach(wrapper => {
    const btn = wrapper.querySelector('.notif-btn');
    const overlay = wrapper.querySelector('.notif-overlay');
    
    if (btn && overlay) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        overlay.classList.toggle('hidden');
      });
    }
  });

  // Fechar ao clicar fora
  document.addEventListener('click', function(e) {
    document.querySelectorAll('.notif-wrapper').forEach(wrapper => {
      const overlay = wrapper.querySelector('.notif-overlay');
      if (overlay && !wrapper.contains(e.target)) {
        overlay.classList.add('hidden');
      }
    });
  });
});