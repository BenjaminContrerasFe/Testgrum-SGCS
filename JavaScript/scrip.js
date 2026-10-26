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
   1. MENÚ HAMBURGUESA Y SUBMENÚS (US-01)
   - Abre/cierra con clic o toque.
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
    
    // Cambiar icono a equis si existe
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    }
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    closeAllSubmenus();

    // Restaurar icono a barras si existe
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }

    if (returnFocus) toggle.focus();
  };

  const closeAllSubmenus = (except = null) => {
    submenuToggles.forEach((btn) => {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      const controlsId = btn.getAttribute('aria-controls');
      if (controlsId) {
        const submenu = document.getElementById(controlsId);
        if (submenu) submenu.hidden = true;
      }
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  submenuToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const controlsId = btn.getAttribute('aria-controls');
      if (!controlsId) return;
      const submenu = document.getElementById(controlsId);
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      
      closeAllSubmenus(btn);
      btn.setAttribute('aria-expanded', String(willOpen));
      if (submenu) submenu.hidden = !willOpen;
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
    const hrefAttr = link.getAttribute('href');
    if (!hrefAttr || hrefAttr.startsWith('#')) return;

    try {
      const url = new URL(hrefAttr, window.location.href);
      const isSamePage = getFileName(url.pathname) === currentFile;

      if (isSamePage && !url.hash) {
        link.setAttribute('aria-current', 'page');
      }
    } catch {
      // Ignorar rutas relativas malformadas
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
      try {
        const linkUrl = new URL(link.href, window.location.href);
        if (linkUrl.hash === `#${id}` && getFileName(linkUrl.pathname) === getFileName(location.pathname)) {
          link.setAttribute('aria-current', 'location');
        } else if (link.getAttribute('aria-current') === 'location') {
          link.removeAttribute('aria-current');
        }
      } catch {
        // Ignorar errores de URL
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
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
    if (tabs.length === 0) return;

    const selectTab = (selectedTab, { moveFocus = false } = {}) => {
      tabs.forEach((tab) => {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        
        const controlsId = tab.getAttribute('aria-controls');
        if (controlsId) {
          const panel = document.getElementById(controlsId);
          if (panel) panel.hidden = !isSelected;
        }
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

    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    selectTab(initial);
  });
}

/* ----------------------------------------------------------
   5. DESPLEGABLES / ACORDEÓN REUTILIZABLE
   ---------------------------------------------------------- */
function initDisclosures() {
  const toggles = document.querySelectorAll('.disclosure__toggle');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.disclosure');
      if (!item) return;
      
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      const group = item.dataset.group;

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
  const item = toggle.closest('.disclosure');
  if (item) {
    item.classList.toggle('is-open', isOpen);
  }
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