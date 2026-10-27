/* ==========================================================
   AGILES.JS — Lógica propia de html/agiles.html
   (Menú, pestañas y lightbox de US-09 ya los resuelve main.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTableOfContents();
});

/* ----------------------------------------------------------
   US-08: TABLA DE CONTENIDOS DINÁMICA
   - Se arma sola leyendo los títulos marcados con data-toc
     (h2 = apartado, h3 = subapartado). Si se agrega un título
     nuevo al HTML, aparece en el índice sin tocar el JS.
   - Resalta el apartado que se está leyendo.
   - En celular es un botón flotante que abre/cierra el índice.
   ---------------------------------------------------------- */
function initTableOfContents() {
  const list = document.getElementById('tocList');
  const scope = document.querySelector('.toc-scope');
  if (!list || !scope) return;

  const headings = [...scope.querySelectorAll('[data-toc][id]')];
  const links = [];
  let currentSublist = null;

  headings.forEach((heading) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    li.append(link);
    links.push(link);

    if (heading.tagName === 'H2') {
      list.append(li);
      currentSublist = document.createElement('ol');
      li.append(currentSublist);
    } else if (currentSublist) {
      currentSublist.append(li);
    }
  });

  // Quitar sublistas vacías (h2 sin h3)
  list.querySelectorAll('ol:empty').forEach((ol) => ol.remove());

  /* --- Botón flotante (celular) --- */
  const toc = list.closest('.toc');
  const toggle = document.getElementById('tocToggle');

  const setOpen = (isOpen) => {
    toc.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', () => setOpen(!toc.classList.contains('is-open')));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toc.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (toc.classList.contains('is-open') && !toc.contains(event.target)) setOpen(false);
  });

  /* --- Resaltar el apartado visible --- */
  if (!('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );

  headings.forEach((heading) => observer.observe(heading));
}
