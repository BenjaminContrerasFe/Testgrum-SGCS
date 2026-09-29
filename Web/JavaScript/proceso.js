/* ==========================================================
   PROCESO.JS — Lógica propia de html/proceso.html
   (Menú y pestañas de modelos ya los resuelve main.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSdlcTimeline();
});

/* ----------------------------------------------------------
   US-05: LÍNEA DE TIEMPO DEL SDLC
   Los datos viven en un arreglo: agregar una etapa es sumar
   un objeto, no copiar HTML.
   ---------------------------------------------------------- */
const SDLC_STAGES = [
  {
    title: 'Requisitos',
    desc: 'Se relevan las necesidades de usuarios y negocio, se define el alcance y se acuerdan los criterios de aceptación.',
    output: 'Especificación de requisitos o Product Backlog.',
    why: 'Un error acá es el más caro de corregir después.',
  },
  {
    title: 'Diseño',
    desc: 'Se decide cómo se va a construir: arquitectura, modelo de datos, interfaces y tecnologías.',
    output: 'Documento de arquitectura, diagramas y prototipos.',
    why: 'Evita improvisar la estructura mientras se programa.',
  },
  {
    title: 'Desarrollo',
    desc: 'El diseño se traduce en código siguiendo estándares del equipo y control de versiones.',
    output: 'Código fuente versionado y pruebas unitarias.',
    why: 'Es donde el producto empieza a existir y a poder medirse.',
  },
  {
    title: 'Pruebas',
    desc: 'Se verifica que el software haga lo que debe (verificación) y lo que el usuario necesita (validación).',
    output: 'Matriz de casos de prueba y reporte de defectos.',
    why: 'Detecta defectos antes de que lleguen al usuario.',
  },
  {
    title: 'Despliegue',
    desc: 'El software se instala en el entorno de producción y se pone a disposición de los usuarios.',
    output: 'Versión publicada y notas de la versión.',
    why: 'Sin despliegue no hay valor entregado.',
  },
  {
    title: 'Mantenimiento',
    desc: 'Se corrigen incidencias, se adapta el sistema a cambios del entorno y se incorporan mejoras.',
    output: 'Parches, nuevas versiones y registro de incidencias.',
    why: 'Suele ser la etapa más larga de la vida de un sistema.',
  },
];

function initSdlcTimeline() {
  const timeline = document.getElementById('sdlcTimeline');
  if (!timeline) return;

  const titleEl = document.getElementById('stageTitle');
  const descEl = document.getElementById('stageDesc');
  const outputEl = document.getElementById('stageOutput');
  const whyEl = document.getElementById('stageWhy');
  const prevBtn = document.getElementById('stagePrev');
  const nextBtn = document.getElementById('stageNext');

  // Se generan los botones desde el arreglo
  const stepButtons = SDLC_STAGES.map((stage, index) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'timeline__step';
    button.setAttribute('aria-controls', 'stageDetail');

    const dot = document.createElement('span');
    dot.className = 'timeline__dot';
    dot.textContent = index + 1;

    const label = document.createElement('span');
    label.textContent = stage.title;

    button.append(dot, label);
    button.addEventListener('click', () => showStage(index));
    li.append(button);
    timeline.append(li);
    return button;
  });

  let currentIndex = 0;

  function showStage(index) {
    // Límites: no se puede ir antes de la primera ni después de la última
    if (index < 0 || index >= SDLC_STAGES.length) return;
    currentIndex = index;
    const stage = SDLC_STAGES[index];

    stepButtons.forEach((btn, i) => {
      btn.classList.toggle('is-done', i < index);
      if (i === index) {
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Progreso de 0 a 1 para la barra del CSS
    timeline.style.setProperty('--progress', index / (SDLC_STAGES.length - 1));

    titleEl.textContent = `${index + 1}. ${stage.title}`;
    descEl.textContent = stage.desc;
    outputEl.textContent = stage.output;
    whyEl.textContent = stage.why;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === SDLC_STAGES.length - 1;
  }

  prevBtn.addEventListener('click', () => showStage(currentIndex - 1));
  nextBtn.addEventListener('click', () => showStage(currentIndex + 1));

  showStage(0);
}
