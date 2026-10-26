/* ==========================================================
   METODOLOGIAS.JS — Lógica propia de html/metodologias.html
   (Menú y pestañas Roles/Eventos/Artefactos ya los resuelve main.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSprintDiagram();
  initKanbanBoard();
});

/* ==========================================================
   US-10: SPRINT INTERACTIVO
   Los datos de cada evento viven en un objeto. La duración se
   calcula según el largo del sprint, respetando los máximos de
   la Guía Scrum 2020 para un sprint de un mes.
   ========================================================== */
const SPRINT_STORAGE_KEY = 'testgrum:sprint-semanas';
const WORK_HOURS_PER_DAY = 8;

const SCRUM_EVENTS = {
  sprint: {
    name: 'Sprint',
    icon: 'fa-rotate',
    color: 'var(--color-primary)',
    goal: 'Contener todo el trabajo necesario para alcanzar el Objetivo del Sprint. Un sprint termina y el siguiente empieza enseguida.',
    who: 'Todo el Scrum Team.',
    output: 'Uno o más incrementos que cumplen la Definición de Hecho.',
    tip: 'La duración es fija: no se alarga si falta terminar algo. Lo pendiente vuelve al Product Backlog.',
  },
  planning: {
    name: 'Sprint Planning',
    icon: 'fa-flag-checkered',
    color: 'var(--event-planning)',
    minutesPerWeek: 120, // 2 h por semana de sprint
    maxMinutes: 480, // máximo 8 h (sprint de un mes)
    goal: 'Responder tres preguntas: ¿por qué es valioso este sprint?, ¿qué se puede terminar? y ¿cómo se va a hacer?',
    who: 'Product Owner, Scrum Master y Developers. Pueden invitar a otras personas para asesorar.',
    output: 'El Objetivo del Sprint y el Sprint Backlog.',
    tip: 'Si el backlog llega refinado (historias claras y estimadas), la planificación es mucho más corta.',
  },
  daily: {
    name: 'Daily Scrum',
    icon: 'fa-mug-hot',
    color: 'var(--event-daily)',
    fixedMinutes: 15, // siempre 15 minutos, sin importar el largo del sprint
    goal: 'Revisar el avance hacia el Objetivo del Sprint y ajustar el plan de las próximas 24 horas.',
    who: 'Los Developers. El Scrum Master y el Product Owner participan si están trabajando en elementos del Sprint Backlog.',
    output: 'Un plan actualizado para el día y los impedimentos a la vista.',
    tip: 'Se hace a la misma hora y en el mismo lugar para simplificar. No es una reunión de reporte al jefe.',
  },
  review: {
    name: 'Sprint Review',
    icon: 'fa-display',
    color: 'var(--event-review)',
    minutesPerWeek: 60, // 1 h por semana
    maxMinutes: 240, // máximo 4 h
    goal: 'Mostrar el resultado del sprint a los interesados y decidir juntos qué conviene hacer después.',
    who: 'Scrum Team e interesados clave (clientes, usuarios, docentes como Product Owner).',
    output: 'Un Product Backlog actualizado según lo aprendido.',
    tip: 'Es una sesión de trabajo, no una presentación de diapositivas: se muestra software funcionando.',
  },
  retro: {
    name: 'Sprint Retrospective',
    icon: 'fa-comments',
    color: 'var(--event-retro)',
    minutesPerWeek: 45, // 45 min por semana
    maxMinutes: 180, // máximo 3 h
    goal: 'Revisar cómo se trabajó (personas, interacciones, herramientas y Definición de Hecho) y planificar mejoras.',
    who: 'Todo el Scrum Team.',
    output: 'Mejoras concretas; las más importantes pueden sumarse al próximo Sprint Backlog.',
    tip: 'Es el último evento del sprint. Tres preguntas útiles: ¿qué funcionó?, ¿qué mejorar?, ¿a qué nos comprometemos?',
  },
};

/** Duración sugerida de un evento (en minutos) para un sprint de N semanas */
function eventMinutes(eventKey, weeks) {
  const ev = SCRUM_EVENTS[eventKey];
  if (eventKey === 'sprint') return weeks * 5 * WORK_HOURS_PER_DAY * 60;
  if (ev.fixedMinutes) return ev.fixedMinutes;
  return Math.min(ev.minutesPerWeek * weeks, ev.maxMinutes);
}

/** 90 → "1 h 30 min" · 15 → "15 min" · 240 → "4 h" */
function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

function initSprintDiagram() {
  const calendar = document.getElementById('sprintCalendar');
  if (!calendar) return;

  const weekButtons = document.querySelectorAll('[data-weeks]');
  const sprintBar = document.getElementById('sprintBar');
  const sprintBarText = document.getElementById('sprintBarText');
  const summary = document.getElementById('sprintSummary');
  const detail = {
    icon: document.getElementById('eventIcon'),
    name: document.getElementById('eventName'),
    duration: document.getElementById('eventDuration'),
    goal: document.getElementById('eventGoal'),
    who: document.getElementById('eventWho'),
    output: document.getElementById('eventOutput'),
    tip: document.getElementById('eventTip'),
  };

  const savedWeeks = Number(storage.get(SPRINT_STORAGE_KEY));
  let weeks = savedWeeks >= 1 && savedWeeks <= 4 ? savedWeeks : 2;
  let selectedEvent = 'planning';

  /** Qué eventos ocurren en el día "day" (1..totalDays) */
  const eventsForDay = (day, totalDays) => {
    const list = [];
    if (day === 1) list.push('planning');
    else list.push('daily'); // desde el día 2 hay Daily todos los días
    if (day === totalDays) list.push('review', 'retro');
    return list;
  };

  const shortNames = { planning: 'Planning', daily: 'Daily', review: 'Review', retro: 'Retro' };

  function renderCalendar() {
    const totalDays = weeks * 5;
    calendar.replaceChildren(); // limpia sin innerHTML

    for (let w = 0; w < weeks; w++) {
      const week = document.createElement('div');
      week.className = 'sprint-week';

      const title = document.createElement('p');
      title.className = 'sprint-week__title';
      title.textContent = `Semana ${w + 1}`;

      const days = document.createElement('ol');
      days.className = 'sprint-week__days';

      for (let d = 1; d <= 5; d++) {
        const dayNumber = w * 5 + d;
        const li = document.createElement('li');
        li.className = 'sprint-day';

        const label = document.createElement('span');
        label.className = 'sprint-day__label';
        label.textContent = `Día ${dayNumber}`;

        const events = document.createElement('div');
        events.className = 'sprint-day__events';

        eventsForDay(dayNumber, totalDays).forEach((key) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `event-chip event-chip--${key}`;
          btn.dataset.event = key;
          btn.textContent = shortNames[key];
          btn.setAttribute('aria-label', `${SCRUM_EVENTS[key].name}, día ${dayNumber}`);
          btn.setAttribute('aria-pressed', 'false');
          events.append(btn);
        });

        li.append(label, events);
        days.append(li);
      }

      week.append(title, days);
      calendar.append(week);
    }

    sprintBarText.textContent = `Sprint de ${weeks} ${weeks === 1 ? 'semana' : 'semanas'} · ${totalDays} días hábiles`;
    renderSummary();
    showEvent(selectedEvent);
  }

  function renderSummary() {
    const totalDays = weeks * 5;
    const dailies = totalDays - 1;
    const meetings =
      eventMinutes('planning', weeks) +
      eventMinutes('review', weeks) +
      eventMinutes('retro', weeks) +
      dailies * eventMinutes('daily', weeks);
    const sprintMinutes = eventMinutes('sprint', weeks);
    const percent = Math.round((meetings / sprintMinutes) * 100);

    summary.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = `${formatMinutes(meetings)} en eventos (${percent} % del sprint)`;
    summary.append(
      `En un sprint de ${weeks} ${weeks === 1 ? 'semana' : 'semanas'} hay ${dailies} Daily Scrums. Sumando todos los eventos: `,
      strong,
      '. El resto del tiempo es para construir el incremento.'
    );
  }

  function showEvent(key) {
    selectedEvent = key;
    const ev = SCRUM_EVENTS[key];

    // Marcar todas las apariciones del evento elegido
    document.querySelectorAll('[data-event]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.event === key));
    });

    detail.icon.replaceChildren();
    const i = document.createElement('i');
    i.className = `fa-solid ${ev.icon}`;
    i.setAttribute('aria-hidden', 'true');
    detail.icon.append(i);
    detail.icon.style.backgroundColor = ev.color;

    detail.name.textContent = ev.name;
    const minutes = eventMinutes(key, weeks);
    if (key === 'sprint') {
      detail.duration.textContent = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} (${minutes / 60} h de trabajo)`;
    } else if (key === 'daily') {
      detail.duration.textContent = `${formatMinutes(minutes)} por día`;
    } else {
      detail.duration.textContent = `Hasta ${formatMinutes(minutes)} en un sprint de ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    detail.goal.textContent = ev.goal;
    detail.who.textContent = ev.who;
    detail.output.textContent = ev.output;
    detail.tip.textContent = ev.tip;
  }

  // Un solo listener para todo el calendario (delegación de eventos):
  // sirve aunque los botones se vuelvan a generar al cambiar la duración.
  calendar.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-event]');
    if (btn) showEvent(btn.dataset.event);
  });
  sprintBar.addEventListener('click', () => showEvent('sprint'));

  weekButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      weeks = Number(btn.dataset.weeks);
      weekButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      storage.set(SPRINT_STORAGE_KEY, String(weeks));
      renderCalendar();
    });
  });

  weekButtons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.weeks) === weeks)));
  renderCalendar();
}

/* ==========================================================
   US-11: TABLERO KANBAN
   - El estado es un ARREGLO DE OBJETOS que se guarda en
     localStorage; el tablero se redibuja siempre desde ahí
     (nunca se guarda HTML).
   - Se mueve con arrastrar y soltar (mouse) o con los botones
     de flecha (teclado y pantallas táctiles).
   - Reglas: no se saltean columnas y "En proceso" respeta el
     límite de WIP elegido.
   ========================================================== */
const BOARD_STORAGE_KEY = 'testgrum:kanban-tablero';
const COLUMNS = ['todo', 'doing', 'done'];
const COLUMN_NAMES = { todo: 'Por hacer', doing: 'En proceso', done: 'Hecho' };

const DEFAULT_CARDS = [
  { id: 'c1', title: 'Diseñar el glosario A–Z', tag: 'US-12' },
  { id: 'c2', title: 'Validar el formulario de contacto', tag: 'US-17' },
  { id: 'c3', title: 'Escribir las preguntas frecuentes', tag: 'US-13' },
  { id: 'c4', title: 'Armar la tabla del comparador', tag: 'US-18' },
  { id: 'c5', title: 'Probar el lightbox en celular', tag: 'QA' },
];

function defaultBoard() {
  return {
    wipLimit: 2,
    blockedMoves: 0,
    cards: DEFAULT_CARDS.map((card) => ({ ...card, column: 'todo', startedAt: null, doneAt: null })),
  };
}

/** Valida lo que viene de localStorage: si está roto, se usa el tablero inicial */
function loadBoard() {
  const saved = storage.getJSON(BOARD_STORAGE_KEY);
  const isValid =
    saved &&
    Array.isArray(saved.cards) &&
    saved.cards.every((c) => typeof c.id === 'string' && COLUMNS.includes(c.column)) &&
    [1, 2, 3].includes(saved.wipLimit);
  return isValid ? saved : defaultBoard();
}

function initKanbanBoard() {
  const boardEl = document.getElementById('kanbanBoard');
  if (!boardEl) return;

  const statusBox = document.getElementById('boardStatus');
  const statusText = document.getElementById('boardStatusText');
  const wipButtons = document.querySelectorAll('[data-wip]');
  const resetBtn = document.getElementById('boardReset');
  const metric = {
    throughput: document.getElementById('metricThroughput'),
    cycle: document.getElementById('metricCycle'),
    blocked: document.getElementById('metricBlocked'),
  };

  let state = loadBoard();
  let draggedId = null;

  const save = () => storage.setJSON(BOARD_STORAGE_KEY, state);
  const countIn = (column) => state.cards.filter((c) => c.column === column).length;

  function setStatus(message, type = 'info') {
    statusBox.className = `status-msg status-msg--${type}`;
    statusBox.querySelector('i').className =
      type === 'danger' ? 'fa-solid fa-hand' : type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info';
    statusText.textContent = message;
  }

  /** Revisa si una tarjeta puede ir a la columna destino. Devuelve un motivo si no puede. */
  function checkMove(card, target) {
    const from = COLUMNS.indexOf(card.column);
    const to = COLUMNS.indexOf(target);
    if (from === to) return { ok: false, reason: null };
    if (Math.abs(to - from) > 1) {
      return { ok: false, reason: 'Una tarjeta no puede saltar columnas: primero tiene que pasar por “En proceso”.' };
    }
    if (target === 'doing' && countIn('doing') >= state.wipLimit) {
      return {
        ok: false,
        wip: true,
        reason: `“En proceso” llegó a su límite de ${state.wipLimit}. Terminá una tarea antes de empezar otra.`,
      };
    }
    return { ok: true };
  }

  function moveCard(id, target, { focusAfter = null } = {}) {
    const card = state.cards.find((c) => c.id === id);
    if (!card) return;

    const check = checkMove(card, target);
    if (!check.ok) {
      if (check.reason) {
        if (check.wip) {
          state.blockedMoves += 1;
          const col = boardEl.querySelector(`[data-column="doing"]`);
          col.classList.remove('shake');
          void col.offsetWidth; // reinicia la animación
          col.classList.add('shake');
        }
        setStatus(check.reason, 'danger');
        save();
        render();
      }
      return;
    }

    // Registro de tiempos para el tiempo de ciclo
    if (target === 'doing' && card.column === 'todo') card.startedAt = Date.now();
    if (target === 'done') card.doneAt = Date.now();
    if (target !== 'done') card.doneAt = null;
    if (target === 'todo') card.startedAt = null;

    card.column = target;

    // Las tarjetas recién movidas quedan al final de su columna
    state.cards = [...state.cards.filter((c) => c.id !== id), card];

    if (target === 'done') {
      setStatus(`“${card.title}” terminada. Se liberó un lugar en “En proceso”.`, 'success');
    } else if (target === 'doing' && countIn('doing') === state.wipLimit) {
      setStatus(`“En proceso” quedó lleno (${state.wipLimit}/${state.wipLimit}). Ahora conviene terminar antes de empezar.`, 'info');
    } else {
      setStatus(`“${card.title}” se movió a “${COLUMN_NAMES[target]}”.`, 'info');
    }

    save();
    render(focusAfter ? { cardId: id, ...focusAfter } : null);
  }

  function cycleSeconds(card) {
    return card.startedAt && card.doneAt ? Math.max(1, Math.round((card.doneAt - card.startedAt) / 1000)) : null;
  }

  function formatSeconds(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
  }

  function makeMoveButton(card, direction) {
    const targetIndex = COLUMNS.indexOf(card.column) + (direction === 'left' ? -1 : 1);
    const target = COLUMNS[targetIndex];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.dataset.direction = direction;
    btn.setAttribute('aria-label', `Mover “${card.title}” a ${COLUMN_NAMES[target]}`);
    const i = document.createElement('i');
    i.className = `fa-solid ${direction === 'left' ? 'fa-arrow-left' : 'fa-arrow-right'}`;
    i.setAttribute('aria-hidden', 'true');
    btn.append(i);
    btn.addEventListener('click', () => moveCard(card.id, target, { focusAfter: { direction } }));
    return btn;
  }

  function buildCard(card) {
    const li = document.createElement('li');
    li.className = 'kanban-card';
    li.draggable = true;
    li.dataset.id = card.id;
    li.tabIndex = -1; // para poder devolverle el foco

    const title = document.createElement('p');
    title.className = 'kanban-card__title';
    title.textContent = card.title;

    const meta = document.createElement('div');
    meta.className = 'kanban-card__meta';
    const tag = document.createElement('span');
    tag.className = 'kanban-card__tag';
    tag.textContent = card.tag;
    meta.append(tag);

    const seconds = cycleSeconds(card);
    if (card.column === 'done' && seconds) {
      const cycle = document.createElement('span');
      cycle.className = 'kanban-card__cycle';
      cycle.textContent = `Ciclo: ${formatSeconds(seconds)}`;
      meta.append(cycle);
    }

    const actions = document.createElement('div');
    actions.className = 'kanban-card__actions';
    if (card.column !== 'todo') actions.append(makeMoveButton(card, 'left'));
    if (card.column !== 'done') actions.append(makeMoveButton(card, 'right'));
    meta.append(actions);

    li.append(title, meta);

    li.addEventListener('dragstart', (event) => {
      draggedId = card.id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', card.id); // requerido por Firefox
      requestAnimationFrame(() => li.classList.add('is-dragging'));
    });
    li.addEventListener('dragend', () => {
      draggedId = null;
      li.classList.remove('is-dragging');
      boardEl.querySelectorAll('.board__col').forEach((col) => col.classList.remove('is-drop-target', 'is-blocked'));
    });

    return li;
  }

  function render(focus = null) {
    COLUMNS.forEach((column) => {
      const list = boardEl.querySelector(`[data-list="${column}"]`);
      list.replaceChildren(...state.cards.filter((c) => c.column === column).map(buildCard));

      const count = boardEl.querySelector(`[data-count="${column}"]`);
      const n = countIn(column);
      const colEl = boardEl.querySelector(`[data-column="${column}"]`);
      if (column === 'doing') {
        count.textContent = `${n}/${state.wipLimit}`;
        count.setAttribute('aria-label', `${n} de ${state.wipLimit} tarjetas permitidas`);
        colEl.classList.toggle('is-full', n === state.wipLimit);
        colEl.classList.toggle('is-over', n > state.wipLimit);
      } else {
        count.textContent = String(n);
        count.setAttribute('aria-label', `${n} ${n === 1 ? 'tarjeta' : 'tarjetas'}`);
      }
    });

    // Métricas de flujo
    const done = state.cards.filter((c) => c.column === 'done');
    const cycles = done.map(cycleSeconds).filter(Boolean);
    metric.throughput.textContent = String(done.length);
    metric.cycle.textContent = cycles.length
      ? formatSeconds(Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length))
      : '—';
    metric.blocked.textContent = String(state.blockedMoves);

    wipButtons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.wip) === state.wipLimit)));

    // Devolver el foco a la tarjeta movida (accesibilidad de teclado)
    if (focus) {
      const cardEl = boardEl.querySelector(`[data-id="${focus.cardId}"]`);
      const sameDirection = cardEl?.querySelector(`[data-direction="${focus.direction}"]`);
      (sameDirection || cardEl?.querySelector('button') || cardEl)?.focus();
    }
  }

  /* --- Arrastrar y soltar sobre columnas --- */
  boardEl.querySelectorAll('.board__col').forEach((col) => {
    const target = col.dataset.column;

    col.addEventListener('dragover', (event) => {
      if (!draggedId) return;
      const card = state.cards.find((c) => c.id === draggedId);
      const check = checkMove(card, target);
      // Se permite soltar siempre: si el movimiento no vale, moveCard() explica el motivo
      event.preventDefault();
      col.classList.toggle('is-drop-target', check.ok);
      col.classList.toggle('is-blocked', !check.ok && Boolean(check.reason));
      event.dataTransfer.dropEffect = 'move';
    });

    col.addEventListener('dragleave', (event) => {
      if (!col.contains(event.relatedTarget)) col.classList.remove('is-drop-target', 'is-blocked');
    });

    col.addEventListener('drop', (event) => {
      event.preventDefault();
      col.classList.remove('is-drop-target', 'is-blocked');
      const id = event.dataTransfer.getData('text/plain') || draggedId;
      if (id) moveCard(id, target);
    });
  });

  /* --- Límite WIP --- */
  wipButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.wipLimit = Number(btn.dataset.wip);
      const n = countIn('doing');
      if (n > state.wipLimit) {
        setStatus(`Hay ${n} tareas en proceso y el nuevo límite es ${state.wipLimit}. Terminá tareas hasta volver al límite.`, 'danger');
      } else {
        setStatus(`Límite de “En proceso” cambiado a ${state.wipLimit}.`, 'info');
      }
      save();
      render();
    });
  });

  resetBtn.addEventListener('click', () => {
    state = defaultBoard();
    storage.remove(BOARD_STORAGE_KEY);
    setStatus('Tablero reiniciado. Todas las tarjetas volvieron a “Por hacer”.', 'info');
    render();
  });

  render();
}
