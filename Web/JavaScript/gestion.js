/* ==========================================================
   GESTION.JS — Lógica propia de html/gestion.html
   (Menú, pestañas ISO y desplegables ya los resuelve main.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initToolFilter();
});

/* ----------------------------------------------------------
   US-04: FILTRO DE HERRAMIENTAS EN TIEMPO REAL
   - Botones con aria-pressed (accesible).
   - Contador de tarjetas visibles (anunciado por aria-live).
   - Recuerda el último filtro en localStorage (evidencia de
     persistencia pedida en la guía para el programador).
   ---------------------------------------------------------- */
const FILTER_STORAGE_KEY = 'testgrum:filtro-herramientas';

function initToolFilter() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const toolCards = document.querySelectorAll('.tool-card');
  const counter = document.getElementById('toolCount');
  if (filterButtons.length === 0 || toolCards.length === 0) return;

  const applyFilter = (category) => {
    let visibleCount = 0;

    toolCards.forEach((card) => {
      const matches = category === 'todas' || card.dataset.category === category;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    filterButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === category));
    });

    if (counter) {
      counter.textContent =
        visibleCount === 1 ? 'Mostrando 1 herramienta' : `Mostrando ${visibleCount} herramientas`;
    }

    storage.set(FILTER_STORAGE_KEY, category);
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Si lo guardado ya no existe como botón, se vuelve a "todas"
  const saved = storage.get(FILTER_STORAGE_KEY);
  const savedExists = [...filterButtons].some((btn) => btn.dataset.filter === saved);
  applyFilter(savedExists ? saved : 'todas');
}
