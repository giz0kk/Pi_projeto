document.addEventListener('DOMContentLoaded', function () {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const slots = [
    '07:00 às 10:00',
    '10:00 às 13:00',
    '13:00 às 16:00',
    '16:00 às 19:00',
    '19:00 às 22:00'
  ];

  const grid = document.getElementById('agendaGrid');
  const title = document.getElementById('calendarMonthYear');
  const prev = document.getElementById('calendarPrev');
  const next = document.getElementById('calendarNext');
  const status = document.getElementById('agendaStatus');
  const count = document.getElementById('agendaResumoCount');
  const help = document.getElementById('agendaHelpBtn');
  const form = document.getElementById('agendaForm');
  const formDate = document.getElementById('agendaData');
  const formSlot = document.getElementById('agendaHorario');
  const formResidue = document.getElementById('agendaResiduo');
  const formCep = document.getElementById('agendaCep');
  const formEndereco = document.getElementById('agendaEndereco');
  const formNumero = document.getElementById('agendaNumero');
  const formBairro = document.getElementById('agendaBairro');
  const formCidade = document.getElementById('agendaCidade');
  const listBtn = document.getElementById('bairroListaBtn');
  const listTopics = document.getElementById('bairroListaTopicos');

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  let scheduleMap = new Map();
  let saving = false;

  function alertUi(message, variant) {
    if (window.UserPopup && typeof window.UserPopup.alert === 'function') {
      return window.UserPopup.alert(message, { variant: variant || 'info' });
    }
    window.alert(message);
    return Promise.resolve();
  }

  function serverUrl(file) {
    if (window.ecocoletaPhpUrl) {
      return window.ecocoletaPhpUrl(file);
    }
    if (window.location.protocol === 'file:') return null;
    var prefix = /\/(pages|auth|admin|mapa)\//.test(window.location.pathname) ? "../" : "";
    return new URL(prefix + file, window.location.href).href;
  }

  function parseJson(text) {
    const raw = String(text || '').replace(/^\uFEFF/, '').trim();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(raw.slice(start, end + 1));
      }
      throw err;
    }
  }

  function formatIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function scheduleKey(dateIso, slot) {
    return dateIso + '|' + slot;
  }

  function setStatus(message, variant) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', variant === 'error');
  }

  function updateCount() {
    if (!count) return;
    const total = scheduleMap.size;
    count.textContent = total === 1 ? '1 coleta' : total + ' coletas';
  }

  function fillSavedAddress() {
    if (formEndereco) formEndereco.value = localStorage.getItem('userRua') || '';
    if (formNumero) formNumero.value = localStorage.getItem('userNumero') || '';
    if (formBairro) formBairro.value = localStorage.getItem('userBairro') || '';
    if (formCidade) formCidade.value = localStorage.getItem('userCidadeEstado') || '';
    if (formCep) formCep.value = localStorage.getItem('userCep') || '';
  }

  async function fillProfileAddressFromServer() {
    if (!form) return;
    const url = serverUrl('meu_perfil.php');
    if (!url) return;
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
      const data = parseJson(await res.text());
      if (!data || data.sucesso !== true || !data.usuario || !data.usuario.endereco) return;

      const e = data.usuario.endereco;
      if (formEndereco && e.rua) formEndereco.value = e.rua;
      if (formNumero && e.numero) formNumero.value = e.numero;
      if (formBairro && e.bairro) formBairro.value = e.bairro;
      if (formCidade && e.cidade) formCidade.value = e.cidade;

      try {
        if (e.rua) localStorage.setItem('userRua', e.rua);
        if (e.numero) localStorage.setItem('userNumero', e.numero);
        if (e.bairro) localStorage.setItem('userBairro', e.bairro);
        if (e.cidade) localStorage.setItem('userCidadeEstado', e.cidade);
      } catch (err) {}
    } catch (err) {}
  }

  function saveFormAddress() {
    try {
      if (formEndereco && formEndereco.value.trim()) localStorage.setItem('userRua', formEndereco.value.trim());
      if (formNumero && formNumero.value.trim()) localStorage.setItem('userNumero', formNumero.value.trim());
      if (formBairro && formBairro.value.trim()) localStorage.setItem('userBairro', formBairro.value.trim());
      if (formCidade && formCidade.value.trim()) localStorage.setItem('userCidadeEstado', formCidade.value.trim());
      if (formCep && formCep.value.trim()) localStorage.setItem('userCep', formCep.value.trim());
    } catch (err) {}
  }

  function selectTopic(targetId, value) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.value = value;
    document.querySelectorAll('.topic-picker[data-target="' + targetId + '"] button').forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.value === value);
    });
  }

  function formUrl(params) {
    const qs = new URLSearchParams(params || {});
    return 'formulario-coleta.html' + (qs.toString() ? '?' + qs.toString() : '');
  }

  function applyUrlParamsToForm() {
    if (!form) return;
    const qs = new URLSearchParams(window.location.search);
    const data = qs.get('data');
    const horario = qs.get('horario');
    const residuo = qs.get('residuo');
    if (data && formDate) formDate.value = data;
    if (horario !== null) selectTopic('agendaHorario', horario);
    if (residuo) selectTopic('agendaResiduo', residuo);
  }

  function firstCalendarWeek(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = new Date(firstDay);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    start.setDate(firstDay.getDate() - mondayOffset);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  async function apiSchedule(action, params) {
    const url = serverUrl('agendamento_coleta.php');
    if (!url) return { sucesso: false, erro: 'Abra a página pelo servidor local para agendar.' };
    const body = new URLSearchParams({ acao: action });
    Object.keys(params || {}).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        body.set(key, String(params[key]));
      }
    });

    const options = {
      credentials: 'same-origin',
      cache: 'no-store'
    };

    let requestUrl = url;
    if (action === 'listar') {
      requestUrl += '?' + body.toString();
      options.method = 'GET';
    } else {
      options.method = 'POST';
      options.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
      options.body = body.toString();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(function () {
      controller.abort();
    }, 3000);
    options.signal = controller.signal;

    try {
      const res = await fetch(requestUrl, options);
      clearTimeout(timeoutId);
      const text = await res.text();
      return parseJson(text);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error && error.name === 'AbortError') {
        return {
          sucesso: false,
          erro: 'Tempo esgotado ao carregar os horários. Verifique se Apache e MySQL estão ligados no XAMPP.',
          erro_codigo: 'timeout',
        };
      }
      throw error;
    }
  }

  async function loadSchedules() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const desde = formatIso(new Date(year, month, 1));
    const ate = formatIso(new Date(year, month + 1, 0));
    setStatus('Carregando horários...');

    try {
      const data = await apiSchedule('listar', { desde: desde, ate: ate });
      scheduleMap = new Map();
      if (data && data.sucesso && Array.isArray(data.agendamentos)) {
        data.agendamentos.forEach((ag) => {
          scheduleMap.set(scheduleKey(ag.data_coleta, ag.slot_ordem), ag);
        });
        setStatus('Clique no calendário para agendar ou cancelar uma coleta.');
      } else {
        const erro = data && data.erro ? String(data.erro) : '';
        if (erro.indexOf('Sessao') !== -1 || erro.indexOf('Sessão') !== -1) {
          setStatus('Escolha um horário e faça login para concluir o agendamento.');
        } else {
          setStatus(erro || 'Não foi possível carregar os horários.', 'error');
        }
      }
    } catch (err) {
      scheduleMap = new Map();
      setStatus('Erro de conexão ao carregar horários. Verifique se Apache e MySQL estão ligados no XAMPP.', 'error');
    }

    updateCount();
  }

  function renderCalendar() {
    if (!grid || !title) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekStart = firstCalendarWeek(currentDate);
    const todayIso = formatIso(new Date());

    title.textContent = 'Calendário de coleta - ' + monthNames[month] + ' ' + year;
    grid.innerHTML = '';

    const hourHead = document.createElement('div');
    hourHead.className = 'agenda-head';
    hourHead.textContent = 'Horário';
    grid.appendChild(hourHead);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const head = document.createElement('div');
      head.className = 'agenda-head';
      if (i >= 5) head.classList.add('is-weekend');
      if (day.getMonth() !== month) head.classList.add('is-muted');
      head.textContent = weekDayNames[i] + ' ' + day.getDate();
      grid.appendChild(head);
    }

    slots.forEach((label, slotIndex) => {
      const time = document.createElement('div');
      time.className = 'agenda-time';
      time.textContent = label;
      grid.appendChild(time);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + dayIndex);
        const iso = formatIso(day);
        const ag = scheduleMap.get(scheduleKey(iso, slotIndex));
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'agenda-cell';
        cell.dataset.date = iso;
        cell.dataset.slot = String(slotIndex);
        cell.setAttribute('aria-label', label + ' em ' + weekDayNames[dayIndex] + ' ' + day.getDate());

        if (iso < todayIso) {
          cell.classList.add('is-past');
          cell.disabled = true;
        }
        if (ag) {
          cell.classList.add('is-booked');
          if (ag.id_agendamento) {
            cell.dataset.idAgendamento = String(ag.id_agendamento);
          }
        }
        cell.addEventListener('click', function () {
          void toggleSchedule(cell);
        });
        grid.appendChild(cell);
      }
    });
  }

  async function refreshCalendar() {
    await loadSchedules();
    renderCalendar();
  }

  async function toggleSchedule(cell) {
    if (saving || !cell || cell.classList.contains('is-past')) return;
    const dateIso = cell.dataset.date;
    const slot = parseInt(cell.dataset.slot, 10);
    if (!dateIso || Number.isNaN(slot)) return;

    if (!cell.classList.contains('is-booked')) {
      if (formDate && formSlot) {
        formDate.value = dateIso;
        selectTopic('agendaHorario', String(slot));
        form && form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setStatus('Complete o formulário para confirmar este horário.');
        return;
      }
      window.location.href = formUrl({ data: dateIso, horario: String(slot) });
      return;
    }

    saving = true;
    cell.disabled = true;

    try {
      if (cell.classList.contains('is-booked')) {
        const params = { data_coleta: dateIso, slot_ordem: slot };
        if (cell.dataset.idAgendamento) {
          params.id_agendamento = cell.dataset.idAgendamento;
        }
        const data = await apiSchedule('cancelar', params);
        if (!data || data.sucesso !== true) {
          await alertUi((data && data.erro) || 'Erro ao cancelar agendamento.', 'error');
          return;
        }
        scheduleMap.delete(scheduleKey(dateIso, slot));
        await alertUi('Agendamento cancelado.', 'success');
      } else {
        const data = await apiSchedule('agendar', { data_coleta: dateIso, slot_ordem: slot });
        if (!data || data.sucesso !== true) {
          if (data && data.erro_codigo === 'ja_agendado') {
            await refreshCalendar();
          }
          await alertUi((data && data.erro) || 'Erro ao agendar coleta.', 'error');
          return;
        }
        scheduleMap.set(scheduleKey(dateIso, slot), {
          id_agendamento: data.id_agendamento,
          data_coleta: dateIso,
          slot_ordem: slot
        });
        try {
          window.dispatchEvent(new CustomEvent('ecocoleta:notificacoes-atualizar'));
        } catch (err) {}
        await alertUi('Coleta agendada! Você receberá uma notificação.', 'success');
      }
    } catch (err) {
      await alertUi('Erro de conexão ao atualizar agendamento.', 'error');
    } finally {
      saving = false;
      renderCalendar();
      updateCount();
    }
  }

  function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    void refreshCalendar();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      changeMonth(-1);
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      changeMonth(1);
    });
  }

  if (help) {
    help.addEventListener('click', function () {
      void alertUi('Clique em uma célula vazia para agendar. Clique em uma célula marcada como Coleta para cancelar.', 'info');
    });
  }

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (saving) return;

      if (window.EcoColetaAuth && !window.EcoColetaAuth.requireLogin('Para agendar uma coleta, faça login ou crie sua conta.')) {
        return;
      }

      const dateIso = formDate ? formDate.value : '';
      const slot = formSlot ? parseInt(formSlot.value, 10) : NaN;
      const residue = formResidue ? formResidue.value : '';
      if (!residue) {
        await alertUi('Selecione o tipo de resíduo.', 'error');
        return;
      }
      if (!dateIso || Number.isNaN(slot)) {
        await alertUi('Selecione uma data e um horário para agendar.', 'error');
        return;
      }

      if (dateIso < formatIso(new Date())) {
        await alertUi('Não é possível agendar coleta em data passada.', 'error');
        return;
      }

      saving = true;
      setStatus('Enviando agendamento...');
      try {
        const data = await apiSchedule('agendar', { data_coleta: dateIso, slot_ordem: slot });
        if (!data || data.sucesso !== true) {
          if (data && data.erro_codigo === 'ja_agendado') {
            await refreshCalendar();
          }
          await alertUi((data && data.erro) || 'Erro ao agendar coleta.', 'error');
          setStatus('Não foi possível concluir o agendamento.', 'error');
          return;
        }
        saveFormAddress();
        scheduleMap.set(scheduleKey(dateIso, slot), {
          id_agendamento: data.id_agendamento,
          data_coleta: dateIso,
          slot_ordem: slot
        });
        renderCalendar();
        updateCount();
        setStatus('Coleta agendada com sucesso.');
        try {
          window.dispatchEvent(new CustomEvent('ecocoleta:notificacoes-atualizar'));
        } catch (err) {}
        await alertUi('Coleta agendada! Você receberá uma notificação.', 'success');
        window.location.href = 'agendar-coleta.html';
      } catch (err) {
        setStatus('Erro de conexão ao enviar o agendamento.', 'error');
        await alertUi('Erro de conexão ao enviar o agendamento.', 'error');
      } finally {
        saving = false;
      }
    });

    form.addEventListener('reset', function () {
      setTimeout(function () {
        fillSavedAddress();
        document.querySelectorAll('.topic-picker button.is-selected').forEach((btn) => {
          btn.classList.remove('is-selected');
        });
      }, 0);
    });
  }

  document.querySelectorAll('.topic-picker button[data-value]').forEach((btn) => {
    btn.addEventListener('click', function () {
      const picker = btn.closest('.topic-picker');
      const targetId = picker ? picker.dataset.target : '';
      if (targetId) selectTopic(targetId, btn.dataset.value);
    });
  });

  if (listBtn && listTopics) {
    listBtn.addEventListener('click', function () {
      const opening = listTopics.hasAttribute('hidden');
      listTopics.toggleAttribute('hidden', !opening);
      listBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      listBtn.textContent = (opening ? '⌄' : '›') + ' Lista de coleta';
    });
  }

  if (listTopics) {
    listTopics.querySelectorAll('button[data-residuo]').forEach((btn) => {
      btn.addEventListener('click', function () {
        if (form) {
          selectTopic('agendaResiduo', btn.dataset.residuo);
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        window.location.href = formUrl({ residuo: btn.dataset.residuo });
      });
    });
  }

  fillSavedAddress();
  void fillProfileAddressFromServer();
  applyUrlParamsToForm();
  if (grid || title) {
    void refreshCalendar();
  }
});
