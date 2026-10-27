/* ==========================================================
   MAIN.JS — Comportamientos compartidos por TODAS las páginas.
   Cada función revisa si su HTML existe antes de actuar,
   así el mismo archivo sirve en cualquier página sin errores.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  markCurrentPage();
  initSectionSpy();
  initTabs();
  initDisclosures();
  initLightbox();
  initExternalLinks();
});

/* ----------------------------------------------------------
   1. MENÚ HAMBURGUESA (US-01)
   - Abre/cierra con clic o toque (sin hover: en celulares
     el hover genera estados trabados).
   - Se cierra con Escape, al tocar fuera o al elegir un link.
   - Los submenús funcionan como acordeón: uno abierto a la vez.
   ---------------------------------------------------------- */
function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  const submenuToggles = menu.querySelectorAll('.submenu-toggle');

  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    closeAllSubmenus();
    if (returnFocus) toggle.focus();
  };

  const closeAllSubmenus = (except = null) => {
    submenuToggles.forEach((btn) => {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      document.getElementById(btn.getAttribute('aria-controls')).hidden = true;
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  submenuToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const submenu = document.getElementById(btn.getAttribute('aria-controls'));
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      closeAllSubmenus(btn);
      btn.setAttribute('aria-expanded', String(willOpen));
      submenu.hidden = !willOpen;
    });
  });

  // Clic fuera del menú y del botón → cerrar
  document.addEventListener('click', (event) => {
    if (menu.hidden) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  // Escape → cerrar y devolver el foco al botón
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu({ returnFocus: true });
    }
  });

  // Elegir un link (sobre todo anclas de la misma página) → cerrar
  menu.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });
}

/* ----------------------------------------------------------
   2. RESALTAR LA PÁGINA ACTUAL EN EL MENÚ (US-01)
   Compara el nombre del archivo de cada link con la URL actual.
   ---------------------------------------------------------- */
function markCurrentPage() {
  const currentFile = getFileName(window.location.pathname) || 'index.html';

  document.querySelectorAll('#navMenu a[href]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    const isSamePage = getFileName(url.pathname) === currentFile;

    if (isSamePage && !url.hash) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

function getFileName(path) {
  return path.split('/').pop().toLowerCase();
}

/* ----------------------------------------------------------
   3. RESALTAR LA SECCIÓN VISIBLE (US-01)
   Usa IntersectionObserver: cuando una <section id="..."> entra
   en pantalla, se marca su chip en .page-nav y su link del menú.
   ---------------------------------------------------------- */
function initSectionSpy() {
  const pageNavLinks = document.querySelectorAll('.page-nav a[href^="#"]');
  if (pageNavLinks.length === 0 || !('IntersectionObserver' in window)) return;

  const sections = [...pageNavLinks]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    pageNavLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('#navMenu .submenu a[href*="#"]').forEach((link) => {
      const hash = new URL(link.href).hash;
      if (hash === `#${id}` && getFileName(new URL(link.href).pathname) === getFileName(location.pathname)) {
        link.setAttribute('aria-current', 'location');
      } else if (link.getAttribute('aria-current') === 'location') {
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
    // Se considera "activa" la sección que cruza la franja superior de la pantalla
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ----------------------------------------------------------
   4. PESTAÑAS REUTILIZABLES (US-02, US-06, US-10)
   HTML esperado:
   <div role="tablist"> <button role="tab" aria-controls="panelX"> ...
   <div role="tabpanel" id="panelX" hidden> ...
   Soporta flechas izquierda/derecha, Inicio y Fin.
   Anclajes (US-06): si la URL trae #panelX (ej. proceso.html#modelo-v)
   se abre esa pestaña. Con data-hash-sync en el tablist, al cambiar de
   pestaña también se actualiza la URL para poder compartir el enlace.
   ---------------------------------------------------------- */
function initTabs() {
  const tablists = document.querySelectorAll('[role="tablist"]');

  tablists.forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const syncHash = tablist.hasAttribute('data-hash-sync');

    const selectTab = (selectedTab, { moveFocus = false, updateHash = false } = {}) => {
      tabs.forEach((tab) => {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
      });
      if (moveFocus) selectedTab.focus();
      if (syncHash && updateHash) {
        // replaceState: cambia la URL sin saltar ni llenar el historial
        history.replaceState(null, '', `#${selectedTab.getAttribute('aria-controls')}`);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab, { updateHash: true }));

      tab.addEventListener('keydown', (event) => {
        const keyToIndex = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (event.key in keyToIndex) {
          event.preventDefault();
          selectTab(tabs[keyToIndex[event.key]], { moveFocus: true, updateHash: true });
        }
      });
    });

    // Guardamos la función para poder abrir una pestaña desde un anclaje
    tablist.selectTabByPanelId = (panelId) => {
      const tab = tabs.find((t) => t.getAttribute('aria-controls') === panelId);
      if (tab) selectTab(tab);
      return Boolean(tab);
    };

    // Estado inicial: la pestaña marcada en el HTML o la primera
    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    selectTab(initial);
  });

  // Abre la pestaña que corresponde al #ancla y lleva la vista hasta ella
  const openTabFromHash = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    tablists.forEach((tablist) => {
      if (tablist.selectTabByPanelId(id)) {
        tablist.scrollIntoView({ block: 'start' });
      }
    });
  };

  // Links internos tipo <a href="#modelo-v"> también abren la pestaña
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      const panel = document.getElementById(id);
      if (panel && panel.getAttribute('role') === 'tabpanel') {
        tablists.forEach((tablist) => tablist.selectTabByPanelId(id));
      }
    });
  });

  openTabFromHash();
  window.addEventListener('hashchange', openTabFromHash);
}

/* ----------------------------------------------------------
   5. DESPLEGABLES / ACORDEÓN REUTILIZABLE (US-03, y luego US-13)
   HTML esperado:
   <div class="disclosure" [data-group="nombre"]>
     <button class="disclosure__toggle" aria-expanded="false" aria-controls="id">
     <div class="disclosure__panel" id="id"> <div> contenido </div> </div>
   La animación de altura se hace en CSS con grid-template-rows,
   así no hay que adivinar un max-height que corte el texto.
   ---------------------------------------------------------- */
function initDisclosures() {
  const toggles = document.querySelectorAll('.disclosure__toggle');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.disclosure');
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      const group = item.dataset.group;

      // Si pertenece a un grupo, se cierran los demás del mismo grupo
      if (group && willOpen) {
        document
          .querySelectorAll(`.disclosure[data-group="${group}"] .disclosure__toggle`)
          .forEach((other) => {
            if (other !== toggle) setDisclosure(other, false);
          });
      }

      setDisclosure(toggle, willOpen);
    });
  });
}

function setDisclosure(toggle, isOpen) {
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.closest('.disclosure').classList.toggle('is-open', isOpen);
}

/* ----------------------------------------------------------
   6. LIGHTBOX / GALERÍA MODAL (US-07 y reutilizado en US-09)
   Usa el elemento nativo <dialog> con showModal(): ya trae
   cierre con Escape, bloquea el foco dentro y oscurece el fondo.
   HTML esperado (cualquier página):
   <figure> <button data-lightbox="grupo"><img alt="..."></button>
            <figcaption>...</figcaption> </figure>
   Las imágenes del mismo grupo se recorren con ← y →.
   ---------------------------------------------------------- */
function initLightbox() {
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  if (triggers.length === 0) return;

  // El diálogo se crea una sola vez, con DOM (nada de innerHTML)
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-labelledby', 'lightboxTitle');

  const bar = document.createElement('div');
  bar.className = 'lightbox__bar';
  const counter = document.createElement('span');
  counter.className = 'lightbox__counter';
  const nav = document.createElement('div');
  nav.className = 'lightbox__nav';

  const makeIconButton = (icon, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.setAttribute('aria-label', label);
    const i = document.createElement('i');
    i.className = `fa-solid ${icon}`;
    i.setAttribute('aria-hidden', 'true');
    btn.append(i);
    return btn;
  };

  const prevBtn = makeIconButton('fa-arrow-left', 'Imagen anterior');
  const nextBtn = makeIconButton('fa-arrow-right', 'Imagen siguiente');
  const closeBtn = makeIconButton('fa-xmark', 'Cerrar vista ampliada');
  nav.append(prevBtn, nextBtn, closeBtn);
  bar.append(counter, nav);

  const stage = document.createElement('div');
  stage.className = 'lightbox__stage';
  const bigImg = document.createElement('img');
  bigImg.alt = ''; // se completa con el alt de la imagen que se abre
  stage.append(bigImg);

  const caption = document.createElement('div');
  caption.className = 'lightbox__caption';
  const capTitle = document.createElement('strong');
  capTitle.id = 'lightboxTitle';
  const capText = document.createElement('span');
  caption.append(capTitle, capText);

  dialog.append(bar, stage, caption);
  document.body.append(dialog);

  let group = [];
  let index = 0;
  let lastTrigger = null;

  const show = (i) => {
    index = i;
    const trigger = group[index];
    const img = trigger.querySelector('img');
    const figcaption = trigger.closest('figure')?.querySelector('figcaption');

    bigImg.src = img.currentSrc || img.src;
    bigImg.alt = img.alt; // el texto alternativo viaja con la imagen
    capTitle.textContent = figcaption?.querySelector('strong')?.textContent || img.alt;
    // Texto del pie sin repetir el título
    const fullText = figcaption ? figcaption.textContent.trim() : '';
    capText.textContent = fullText.replace(capTitle.textContent, '').trim();

    counter.textContent = `${index + 1} de ${group.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === group.length - 1;
    const single = group.length === 1;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const name = trigger.dataset.lightbox;
      group = triggers.filter((t) => t.dataset.lightbox === name);
      lastTrigger = trigger;
      show(group.indexOf(trigger));
      dialog.showModal();
      closeBtn.focus();
    });
  });

  prevBtn.addEventListener('click', () => index > 0 && show(index - 1));
  nextBtn.addEventListener('click', () => index < group.length - 1 && show(index + 1));
  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && index > 0) show(index - 1);
    if (event.key === 'ArrowRight' && index < group.length - 1) show(index + 1);
  });

  // Clic en el fondo oscuro (fuera de la caja) → cerrar
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Al cerrar, el foco vuelve a la imagen que se abrió
  dialog.addEventListener('close', () => lastTrigger?.focus());
}

/* ----------------------------------------------------------
   7. ENLACES EXTERNOS SEGUROS (US-14)
   Todo link a otro dominio se abre en pestaña nueva con
   rel="noopener noreferrer": la página abierta no puede
   manipular la nuestra con window.opener (tabnabbing).
   En el HTML ya están puestos; esto es una red de seguridad
   por si alguien agrega un link y se olvida los atributos.
   Además avisa a lectores de pantalla que se abre otra pestaña.
   ---------------------------------------------------------- */
function initExternalLinks() {
  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    const url = new URL(link.href);
    if (url.origin === window.location.origin) return;

    link.target = '_blank';
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));

    if (!link.querySelector('.sr-only')) {
      const note = document.createElement('span');
      note.className = 'sr-only';
      note.textContent = ' (se abre en una pestaña nueva)';
      link.append(note);
    }
  });
}

/* ----------------------------------------------------------
   Utilidad: localStorage seguro (puede fallar en modo privado)
   ---------------------------------------------------------- */
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* sin persistencia: el sitio sigue funcionando igual */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nada que hacer */
    }
  },
  // Para guardar arreglos/objetos (tablero Kanban, selección del comparador...)
  getJSON(key, fallback = null) {
    try {
      const raw = this.get(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback; // dato corrupto: se ignora y se usa el valor por defecto
    }
  },
  setJSON(key, value) {
    this.set(key, JSON.stringify(value));
  },
};

/* ----------------------------------------------------------
   Utilidad: normalizar texto para búsquedas (US-12)
   "Integración" → "integracion": ignora mayúsculas y tildes.
   ---------------------------------------------------------- */
function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
