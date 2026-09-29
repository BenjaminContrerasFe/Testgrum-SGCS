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
   4. PESTAÑAS REUTILIZABLES (US-02, US-06)
   HTML esperado:
   <div role="tablist"> <button role="tab" aria-controls="panelX"> ...
   <div role="tabpanel" id="panelX" hidden> ...
   Soporta flechas izquierda/derecha, Inicio y Fin.
   ---------------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];

    const selectTab = (selectedTab, { moveFocus = false } = {}) => {
      tabs.forEach((tab) => {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
      });
      if (moveFocus) selectedTab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));

      tab.addEventListener('keydown', (event) => {
        const keyToIndex = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (event.key in keyToIndex) {
          event.preventDefault();
          selectTab(tabs[keyToIndex[event.key]], { moveFocus: true });
        }
      });
    });

    // Estado inicial: la pestaña marcada en el HTML o la primera
    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    selectTab(initial);
  });
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
};
