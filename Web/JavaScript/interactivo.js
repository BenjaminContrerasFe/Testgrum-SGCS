/* ==========================================================
   INTERACTIVO.JS — Lógica propia de html/interactivo.html
   - US-18: comparador de metodologías (tabla dinámica)
   - US-19: encuesta paso a paso con cálculo de coincidencia
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initComparator();
  initSurvey();
});

/* ==========================================================
   US-18: DATOS DEL COMPARADOR
   Cada metodología es un objeto con las mismas claves.
   Las filas de la tabla salen de CRITERIA: agregar una fila
   es sumar un criterio y completar el dato en cada metodología.
   ========================================================== */
const CRITERIA = [
  { key: 'enfoque', label: 'Enfoque', type: 'text' },
  { key: 'ciclos', label: 'Cómo se organiza el trabajo', type: 'text' },
  { key: 'roles', label: 'Roles', type: 'text' },
  { key: 'flexibilidad', label: 'Flexibilidad ante cambios', type: 'rating' },
  { key: 'cliente', label: 'Participación del cliente', type: 'rating' },
  { key: 'documentacion', label: 'Documentación formal', type: 'rating' },
  { key: 'entregas', label: 'Entregas', type: 'text' },
  { key: 'ideal', label: 'Ideal para', type: 'text' },
  { key: 'riesgo', label: 'Riesgo principal', type: 'text' },
];

const METHODOLOGIES = [
  {
    id: 'cascada', name: 'Cascada', family: 'tradicional', link: 'proceso.html#cascada',
    enfoque: 'Secuencial y planificado de principio a fin.',
    ciclos: 'Etapas en orden: requisitos, diseño, implementación, pruebas, despliegue.',
    roles: 'Jefe de proyecto, analistas, diseñadores, programadores y testers.',
    flexibilidad: 1, cliente: 2, documentacion: 5,
    entregas: 'Una entrega final.',
    ideal: 'Requisitos estables y alcance cerrado.',
    riesgo: 'Descubrir tarde que el producto no era lo que se necesitaba.',
  },
  {
    id: 'modelo-v', name: 'Modelo en V', family: 'tradicional', link: 'proceso.html#modelo-v',
    enfoque: 'Secuencial, con una prueba planificada para cada etapa.',
    ciclos: 'Rama de definición y rama de verificación unidas por la codificación.',
    roles: 'Igual que cascada, con un equipo de pruebas fuerte desde el inicio.',
    flexibilidad: 1, cliente: 2, documentacion: 5,
    entregas: 'Una entrega final verificada.',
    ideal: 'Sistemas críticos y regulados (salud, aviación).',
    riesgo: 'Alto costo si los requisitos cambian.',
  },
  {
    id: 'iterativo', name: 'Iterativo e incremental', family: 'tradicional', link: 'proceso.html#iterativo',
    enfoque: 'Construir por partes y mejorar en cada vuelta.',
    ciclos: 'Iteraciones de duración variable, cada una con su mini ciclo de vida.',
    roles: 'Roles tradicionales con revisiones al cierre de cada iteración.',
    flexibilidad: 3, cliente: 3, documentacion: 3,
    entregas: 'Una versión parcial por iteración.',
    ideal: 'Proyectos grandes que conviene dividir.',
    riesgo: 'Que el alcance crezca sin control.',
  },
  {
    id: 'scrum', name: 'Scrum', family: 'agil', link: 'metodologias.html#scrum',
    enfoque: 'Empírico: inspeccionar y adaptar en ciclos fijos.',
    ciclos: 'Sprints de 1 a 4 semanas con eventos definidos.',
    roles: 'Product Owner, Scrum Master y Developers.',
    flexibilidad: 4, cliente: 5, documentacion: 2,
    entregas: 'Un incremento terminado por sprint.',
    ideal: 'Productos complejos con requisitos que evolucionan.',
    riesgo: 'Aplicar los eventos “de forma ritual” sin mejorar de verdad.',
  },
  {
    id: 'kanban', name: 'Kanban', family: 'agil', link: 'metodologias.html#kanban',
    enfoque: 'Flujo continuo: visualizar y limitar el trabajo en curso.',
    ciclos: 'Sin iteraciones fijas; cadencias de revisión a elección.',
    roles: 'No exige roles nuevos; se respetan los existentes.',
    flexibilidad: 5, cliente: 4, documentacion: 2,
    entregas: 'Continuas, apenas cada tarea está lista.',
    ideal: 'Soporte, mantenimiento y trabajo que llega sin aviso.',
    riesgo: 'Perder de vista los objetivos de largo plazo.',
  },
  {
    id: 'xp', name: 'XP', family: 'agil', link: 'agiles.html#xp',
    enfoque: 'Excelencia técnica y retroalimentación constante.',
    ciclos: 'Iteraciones de 1 a 2 semanas y entregas pequeñas.',
    roles: 'Cliente, programadores, tester, coach y tracker.',
    flexibilidad: 5, cliente: 5, documentacion: 1,
    entregas: 'Entregas pequeñas y frecuentes.',
    ideal: 'Equipos chicos con requisitos muy cambiantes.',
    riesgo: 'Exige mucha disciplina técnica (TDD, pares, integración continua).',
  },
];

const COMPARE_STORAGE_KEY = 'testgrum:comparador';

function initComparator() {
  const form = document.getElementById('compareForm');
  if (!form) return;

  const table = document.getElementById('compareTable');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const wrap = document.getElementById('compareWrap');
  const empty = document.getElementById('compareEmpty');
  const status = document.getElementById('compareStatus');
  const diffToggle = document.getElementById('compareDiff');

  /* --- Checkboxes generados desde los datos --- */
  METHODOLOGIES.forEach((m) => {
    const label = document.createElement('label');
    label.className = 'check-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'metodologia';
    input.value = m.id;
    const text = document.createElement('span');
    text.textContent = m.name;
    label.append(input, text);
    form.querySelector(`[data-family="${m.family}"]`).append(label);
  });

  const checkboxes = [...form.querySelectorAll('input[name="metodologia"]')];

  const saved = storage.getJSON(COMPARE_STORAGE_KEY, { ids: ['cascada', 'scrum'], diff: false });
  checkboxes.forEach((cb) => {
    cb.checked = Array.isArray(saved.ids) && saved.ids.includes(cb.value);
  });
  diffToggle.checked = Boolean(saved.diff);

  const selectedIds = () => checkboxes.filter((cb) => cb.checked).map((cb) => cb.value);

  /** Celda de puntaje: 5 puntos + texto para lectores de pantalla */
  function ratingCell(value) {
    const wrapper = document.createElement('span');
    wrapper.className = 'rating';
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement('span');
      dot.className = i <= value ? 'rating__dot is-on' : 'rating__dot';
      dot.setAttribute('aria-hidden', 'true');
      wrapper.append(dot);
    }
    const text = document.createElement('span');
    text.className = 'rating__text';
    text.textContent = `${value} de 5`;
    wrapper.append(text);
    return wrapper;
  }

  function render() {
    const ids = selectedIds();
    const selected = METHODOLOGIES.filter((m) => ids.includes(m.id));

    storage.setJSON(COMPARE_STORAGE_KEY, { ids, diff: diffToggle.checked });

    // Siempre se limpia antes de volver a dibujar: no quedan columnas viejas
    thead.replaceChildren();
    tbody.replaceChildren();

    if (selected.length < 2) {
      wrap.hidden = true;
      empty.hidden = false;
      status.textContent =
        selected.length === 1 ? `Elegiste ${selected[0].name}. Sumá al menos una más.` : 'Todavía no elegiste metodologías.';
      return;
    }

    wrap.hidden = false;
    empty.hidden = true;
    status.textContent = `Comparando ${selected.length} metodologías: ${selected.map((m) => m.name).join(', ')}.`;

    /* Encabezado */
    const headRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.scope = 'col';
    corner.textContent = 'Característica';
    headRow.append(corner);

    selected.forEach((m) => {
      const th = document.createElement('th');
      th.scope = 'col';
      const name = document.createElement('a');
      name.href = m.link;
      name.className = 'methods-table__name';
      name.textContent = m.name;
      const family = document.createElement('span');
      family.className = `family-badge family-badge--${m.family}`;
      family.textContent = m.family === 'agil' ? 'Ágil' : 'Tradicional';

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'methods-table__remove';
      remove.setAttribute('aria-label', `Quitar ${m.name} de la comparación`);
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-xmark';
      icon.setAttribute('aria-hidden', 'true');
      remove.append(icon);
      remove.addEventListener('click', () => {
        checkboxes.find((cb) => cb.value === m.id).checked = false;
        render();
        // El foco va a la tabla o, si desaparece, al formulario
        (wrap.hidden ? form.querySelector('input') : table.querySelector('.methods-table__remove'))?.focus();
      });

      th.append(name, family, remove);
      headRow.append(th);
    });
    thead.append(headRow);

    /* Filas */
    CRITERIA.forEach((criterion) => {
      const row = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = criterion.label;
      row.append(th);

      selected.forEach((m) => {
        const td = document.createElement('td');
        if (criterion.type === 'rating') {
          td.append(ratingCell(m[criterion.key]));
        } else {
          td.textContent = m[criterion.key];
        }
        row.append(td);
      });

      if (criterion.type === 'rating') {
        const values = selected.map((m) => m[criterion.key]);
        const differs = new Set(values).size > 1;
        row.classList.toggle('is-diff', diffToggle.checked && differs);
      }
      tbody.append(row);
    });
  }

  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => event.preventDefault());

  document.getElementById('compareAll').addEventListener('click', () => {
    checkboxes.forEach((cb) => (cb.checked = true));
    render();
  });
  document.getElementById('compareClear').addEventListener('click', () => {
    checkboxes.forEach((cb) => (cb.checked = false));
    render();
  });

  render();
}

/* ==========================================================
   US-19: ENCUESTA DE PREFERENCIAS METODOLÓGICAS
   Cada opción suma de 0 a 3 puntos a Scrum, Kanban y Cascada.
   Coincidencia (%) = puntos obtenidos ÷ puntos máximos posibles.
   ========================================================== */
const SURVEY_STORAGE_KEY = 'testgrum:encuesta';

const SURVEY_METHODS = {
  scrum: { name: 'Scrum', link: 'metodologias.html#scrum' },
  kanban: { name: 'Kanban', link: 'metodologias.html#kanban' },
  cascada: { name: 'Cascada', link: 'proceso.html#cascada' },
};

const QUESTIONS = [
  {
    text: '¿Qué tan claros y estables son los requisitos?',
    help: 'Pensá en cuánto puede cambiar lo que el cliente pide durante el proyecto.',
    options: [
      { label: 'Muy claros y no van a cambiar', scores: { scrum: 0, kanban: 1, cascada: 3 }, reason: 'Los requisitos son estables y están bien definidos.' },
      { label: 'Claros en general, con detalles por definir', scores: { scrum: 3, kanban: 2, cascada: 1 }, reason: 'Los detalles se van a definir sobre la marcha.' },
      { label: 'Cambian seguido o se descubren en el camino', scores: { scrum: 3, kanban: 3, cascada: 0 }, reason: 'Los requisitos cambian con frecuencia.' },
    ],
  },
  {
    text: '¿Cómo llega el trabajo al equipo?',
    help: 'Elegí la opción más parecida a tu día a día.',
    options: [
      { label: 'Es un proyecto con alcance y fecha final definidos', scores: { scrum: 2, kanban: 0, cascada: 3 }, reason: 'El proyecto tiene alcance y fecha de cierre definidos.' },
      { label: 'Son funcionalidades nuevas que se planifican por bloques', scores: { scrum: 3, kanban: 1, cascada: 1 }, reason: 'El trabajo se puede planificar en bloques con un objetivo.' },
      { label: 'Son pedidos continuos e impredecibles (soporte, incidencias)', scores: { scrum: 0, kanban: 3, cascada: 0 }, reason: 'El trabajo llega de forma continua e impredecible.' },
    ],
  },
  {
    text: '¿Cuántas personas forman el equipo?',
    help: 'Contá a quienes construyen el producto día a día.',
    options: [
      { label: 'De 1 a 3 personas', scores: { scrum: 1, kanban: 3, cascada: 1 }, reason: 'Un equipo muy chico necesita un proceso liviano.' },
      { label: 'De 4 a 10 personas', scores: { scrum: 3, kanban: 2, cascada: 2 }, reason: 'El tamaño del equipo es el ideal para un Scrum Team.' },
      { label: 'Más de 10, con roles muy especializados', scores: { scrum: 1, kanban: 2, cascada: 3 }, reason: 'Un equipo grande y especializado se coordina mejor por etapas.' },
    ],
  },
  {
    text: '¿Con qué frecuencia puede participar el cliente?',
    help: 'Incluye al docente o a quien acepta el trabajo.',
    options: [
      { label: 'Solo al principio y al final', scores: { scrum: 0, kanban: 1, cascada: 3 }, reason: 'El cliente participa sobre todo al inicio y al cierre.' },
      { label: 'Puede revisar avances cada 2 a 4 semanas', scores: { scrum: 3, kanban: 2, cascada: 1 }, reason: 'El cliente puede revisar avances en cada ciclo.' },
      { label: 'Prioriza el trabajo día a día', scores: { scrum: 2, kanban: 3, cascada: 0 }, reason: 'El cliente puede priorizar el trabajo todos los días.' },
    ],
  },
  {
    text: '¿Cuánta documentación formal exige el proyecto?',
    help: 'Por ejemplo, por normativa, auditorías o contrato.',
    options: [
      { label: 'Mucha: hay normativa o auditorías', scores: { scrum: 1, kanban: 1, cascada: 3 }, reason: 'Se exige documentación formal en cada etapa.' },
      { label: 'La necesaria, pero liviana', scores: { scrum: 3, kanban: 2, cascada: 1 }, reason: 'Alcanza con documentación liviana y útil.' },
      { label: 'Muy poca', scores: { scrum: 2, kanban: 3, cascada: 0 }, reason: 'Se prioriza el trabajo funcionando sobre los documentos.' },
    ],
  },
  {
    text: '¿Cada cuánto necesitan entregar algo que funcione?',
    help: 'Una entrega es algo que el usuario puede probar.',
    options: [
      { label: 'Una única entrega al final', scores: { scrum: 0, kanban: 0, cascada: 3 }, reason: 'Se espera una única entrega final.' },
      { label: 'Cada pocas semanas, en partes', scores: { scrum: 3, kanban: 1, cascada: 0 }, reason: 'Conviene entregar incrementos cada pocas semanas.' },
      { label: 'Apenas cada tarea esté lista', scores: { scrum: 1, kanban: 3, cascada: 0 }, reason: 'Cada tarea se entrega en cuanto está lista.' },
    ],
  },
  {
    text: '¿Qué experiencia tiene el equipo con metodologías ágiles?',
    help: 'No hay respuesta correcta: sirve para elegir un punto de partida realista.',
    options: [
      { label: 'Ninguna; prefieren roles y pasos bien definidos', scores: { scrum: 1, kanban: 2, cascada: 3 }, reason: 'El equipo prefiere roles y pasos bien definidos.' },
      { label: 'Algo; quieren estructura con iteraciones', scores: { scrum: 3, kanban: 1, cascada: 1 }, reason: 'El equipo busca una estructura con iteraciones y eventos.' },
      { label: 'Mucha; quieren mejorar su flujo sin cambiar roles', scores: { scrum: 2, kanban: 3, cascada: 0 }, reason: 'El equipo quiere mejorar su flujo actual sin cambiar roles.' },
    ],
  },
  {
    text: '¿Cuánta incertidumbre técnica tiene el proyecto?',
    help: 'Tecnologías nuevas, integraciones desconocidas, problemas nunca resueltos.',
    options: [
      { label: 'Poca: tecnología conocida y probada', scores: { scrum: 1, kanban: 2, cascada: 3 }, reason: 'La tecnología es conocida y hay poca incertidumbre.' },
      { label: 'Mucha: hay que experimentar', scores: { scrum: 3, kanban: 2, cascada: 0 }, reason: 'Hay que experimentar y aprender en ciclos cortos.' },
      { label: 'Variable: depende de cada pedido', scores: { scrum: 1, kanban: 3, cascada: 0 }, reason: 'La incertidumbre cambia con cada pedido.' },
    ],
  },
];

/**
 * Calcula el porcentaje de coincidencia con cada metodología.
 * Se exporta como función pura para poder probarla en la consola:
 *   computeSurveyResult([0,0,2,0,0,0,0,0])
 */
function computeSurveyResult(answers) {
  const maxPoints = QUESTIONS.length * 3;
  const totals = { scrum: 0, kanban: 0, cascada: 0 };

  answers.forEach((optionIndex, q) => {
    const option = QUESTIONS[q].options[optionIndex];
    Object.keys(totals).forEach((key) => {
      totals[key] += option.scores[key];
    });
  });

  const ranking = Object.keys(totals)
    .map((key) => ({ key, points: totals[key], percent: Math.round((totals[key] / maxPoints) * 100) }))
    .sort((a, b) => b.points - a.points);

  // Razones: respuestas que le dieron el puntaje máximo a la ganadora
  const winner = ranking[0].key;
  const reasons = answers
    .map((optionIndex, q) => QUESTIONS[q].options[optionIndex])
    .filter((option) => option.scores[winner] === 3)
    .map((option) => option.reason);

  return { ranking, reasons, tie: ranking[0].percent - ranking[1].percent <= 5 };
}

function initSurvey() {
  const formEl = document.getElementById('wizardForm');
  if (!formEl) return;

  const el = {
    stepLabel: document.getElementById('wizardStepLabel'),
    percent: document.getElementById('wizardPercent'),
    bar: document.getElementById('wizardBar'),
    fill: document.getElementById('wizardFill'),
    question: document.getElementById('wizardQuestion'),
    help: document.getElementById('wizardHelp'),
    options: document.getElementById('wizardOptions'),
    error: document.getElementById('wizardError'),
    prev: document.getElementById('wizardPrev'),
    next: document.getElementById('wizardNext'),
    result: document.getElementById('wizardResult'),
    resultTitle: document.getElementById('resultTitle'),
    resultText: document.getElementById('resultText'),
    resultBars: document.getElementById('resultBars'),
    resultReasons: document.getElementById('resultReasons'),
    resultLink: document.getElementById('resultLink'),
    restart: document.getElementById('wizardRestart'),
  };

  // Se retoma la encuesta donde se dejó (si los datos guardados son válidos)
  const saved = storage.getJSON(SURVEY_STORAGE_KEY, null);
  const validSaved =
    saved &&
    Array.isArray(saved.answers) &&
    saved.answers.length === QUESTIONS.length &&
    saved.answers.every(
      (a, q) => a === null || (Number.isInteger(a) && a >= 0 && a < QUESTIONS[q].options.length)
    ) &&
    Number.isInteger(saved.step) &&
    saved.step >= 0 &&
    saved.step <= QUESTIONS.length;

  let answers = validSaved ? saved.answers : new Array(QUESTIONS.length).fill(null);
  let step = validSaved ? saved.step : 0;

  const save = () => storage.setJSON(SURVEY_STORAGE_KEY, { answers, step });

  function setProgress(done) {
    const percent = Math.round((done / QUESTIONS.length) * 100);
    el.fill.style.width = `${percent}%`;
    el.bar.setAttribute('aria-valuenow', String(percent));
    el.percent.textContent = `${percent} %`;
  }

  function renderStep({ focus = false } = {}) {
    const q = QUESTIONS[step];
    formEl.hidden = false;
    el.result.hidden = true;
    el.error.hidden = true;

    el.stepLabel.textContent = `Pregunta ${step + 1} de ${QUESTIONS.length}`;
    setProgress(answers.filter((a) => a !== null).length);

    el.question.textContent = q.text;
    el.help.textContent = q.help;
    el.options.replaceChildren();

    q.options.forEach((option, i) => {
      const label = document.createElement('label');
      label.className = 'wizard__option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `pregunta-${step}`;
      input.value = String(i);
      input.checked = answers[step] === i;
      input.addEventListener('change', () => {
        answers[step] = i;
        el.error.hidden = true;
        setProgress(answers.filter((a) => a !== null).length);
        save();
      });
      const text = document.createElement('span');
      text.textContent = option.label;
      label.append(input, text);
      el.options.append(label);
    });

    el.prev.disabled = step === 0;
    el.next.replaceChildren(
      step === QUESTIONS.length - 1 ? 'Ver resultado ' : 'Siguiente ',
      Object.assign(document.createElement('i'), {
        className: step === QUESTIONS.length - 1 ? 'fa-solid fa-chart-simple' : 'fa-solid fa-arrow-right',
      })
    );
    el.next.querySelector('i').setAttribute('aria-hidden', 'true');

    if (focus) el.question.focus();
  }

  function renderResult({ focus = false } = {}) {
    const { ranking, reasons, tie } = computeSurveyResult(answers);
    const winner = SURVEY_METHODS[ranking[0].key];
    const second = SURVEY_METHODS[ranking[1].key];

    formEl.hidden = true;
    el.result.hidden = false;
    el.stepLabel.textContent = 'Encuesta completa';
    setProgress(QUESTIONS.length);

    if (tie) {
      el.resultTitle.textContent = `${winner.name} y ${second.name}, casi empatados`;
      el.resultText.textContent = `Tu proyecto coincide de forma parecida con ambas (${ranking[0].percent} % y ${ranking[1].percent} %). Una combinación de las dos puede ser el mejor punto de partida.`;
    } else {
      el.resultTitle.textContent = `Te sugerimos ${winner.name}`;
      el.resultText.textContent = `Tu proyecto coincide en un ${ranking[0].percent} % con ${winner.name}, seguido por ${second.name} con un ${ranking[1].percent} %.`;
    }

    el.resultBars.replaceChildren();
    ranking.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'result-bar is-winner' : 'result-bar';
      const head = document.createElement('div');
      head.className = 'result-bar__head';
      const name = document.createElement('span');
      name.textContent = SURVEY_METHODS[item.key].name;
      const value = document.createElement('strong');
      value.textContent = `${item.percent} %`;
      head.append(name, value);
      const track = document.createElement('div');
      track.className = 'result-bar__track';
      const fill = document.createElement('span');
      fill.className = 'result-bar__fill';
      track.append(fill);
      li.append(head, track);
      el.resultBars.append(li);
      // Se anima desde 0 en el siguiente cuadro
      requestAnimationFrame(() => {
        fill.style.width = `${item.percent}%`;
      });
    });

    el.resultReasons.replaceChildren();
    (reasons.length ? reasons : ['Tus respuestas reparten puntos entre varias metodologías.']).forEach((reason) => {
      const li = document.createElement('li');
      li.textContent = reason;
      el.resultReasons.append(li);
    });

    el.resultLink.href = winner.link;
    el.resultLink.textContent = `Leer sobre ${winner.name}`;

    if (focus) el.resultTitle.focus();
  }

  // "Siguiente" es el submit del formulario: así Enter también avanza
  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    if (answers[step] === null) {
      el.error.hidden = false;
      el.options.querySelector('input')?.focus();
      return;
    }
    step += 1;
    save();
    if (step === QUESTIONS.length) {
      renderResult({ focus: true });
    } else {
      renderStep({ focus: true });
    }
  });

  el.prev.addEventListener('click', () => {
    if (step === 0) return;
    step -= 1;
    save();
    renderStep({ focus: true });
  });

  el.restart.addEventListener('click', () => {
    answers = new Array(QUESTIONS.length).fill(null);
    step = 0;
    storage.remove(SURVEY_STORAGE_KEY);
    renderStep({ focus: true });
  });

  // Estado inicial
  if (step === QUESTIONS.length && answers.every((a) => a !== null)) {
    renderResult();
  } else {
    step = Math.min(step, QUESTIONS.length - 1);
    renderStep();
  }
}
