/* ==========================================================
   NOSOTROS.JS — Lógica propia de html/nosotros.html
   - US-16: efecto interactivo al pasar el cursor por los perfiles
   - US-17: validación del formulario de contacto del lado del cliente
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initProfileTilt();
  initContactForm();
});

/* ----------------------------------------------------------
   US-16: PERFILES CON INCLINACIÓN 3D Y LUZ QUE SIGUE AL CURSOR
   Solo con mouse (en pantallas táctiles no hay "hover") y solo
   si la persona no pidió reducir el movimiento.
   ---------------------------------------------------------- */
function initProfileTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cards.length === 0 || reduceMotion) return;

  const MAX_TILT = 6; // grados

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width; // 0 a 1
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--ry', `${(x - 0.5) * 2 * MAX_TILT}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 2 * MAX_TILT}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.classList.add('is-tilting');
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ----------------------------------------------------------
   US-17: FORMULARIO DE CONTACTO
   - Valida campos obligatorios, formato de correo y contenido.
   - Muestra el error debajo de cada campo (aria-invalid +
     aria-describedby) y un resumen arriba.
   - Al enviar, muestra una confirmación en pantalla. Todo lo que
     escribe el usuario se muestra con textContent: nunca se
     interpreta como HTML (evita inyección de código).
   - Guarda un borrador en localStorage por si se recarga la página.
   ---------------------------------------------------------- */
const DRAFT_STORAGE_KEY = 'testgrum:contacto-borrador';
const MESSAGE_MIN = 20;
const MESSAGE_MAX = 500;

// Letras de cualquier idioma (incluye tildes, ñ, ü), espacios, apóstrofo, punto y guion
const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u;
// usuario@dominio.ext — sin espacios, con al menos un punto en el dominio y extensión de 2+ letras
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const HTML_TAG_PATTERN = /<[^>]*>/;

/** Cada función recibe el valor y devuelve un mensaje de error o '' si está bien */
const VALIDATORS = {
  nombre(value) {
    const v = value.trim();
    if (!v) return 'Ingresá tu nombre.';
    if (v.length < 2) return 'El nombre tiene que tener al menos 2 letras.';
    if (!NAME_PATTERN.test(v)) return 'El nombre solo puede tener letras, espacios, apóstrofos o guiones (sin números ni símbolos).';
    return '';
  },
  email(value) {
    const v = value.trim();
    if (!v) return 'Ingresá tu correo electrónico.';
    if (/\s/.test(v)) return 'El correo no puede tener espacios.';
    if (!v.includes('@')) return 'Al correo le falta el símbolo @.';
    if ((v.match(/@/g) || []).length > 1) return 'El correo solo puede tener un símbolo @.';
    const [local, domain] = v.split('@');
    if (!local) return 'Falta la parte anterior al @ (por ejemplo, “nombre”).';
    if (!domain || !domain.includes('.')) return 'Falta el dominio después del @ (por ejemplo, “dominio.com”).';
    if (local.startsWith('.') || local.endsWith('.') || v.includes('..')) return 'El correo no puede tener puntos seguidos ni empezar o terminar con un punto.';
    if (!EMAIL_PATTERN.test(v)) return 'El correo no tiene un formato válido. Ejemplo: nombre@dominio.com';
    return '';
  },
  motivo(value) {
    return value ? '' : 'Elegí el motivo de tu mensaje.';
  },
  mensaje(value) {
    const v = value.trim();
    if (!v) return 'Escribí tu mensaje.';
    if (HTML_TAG_PATTERN.test(v)) return 'Por seguridad, el mensaje no puede incluir etiquetas HTML (texto entre < y >).';
    if (!/\p{L}/u.test(v)) return 'El mensaje tiene que incluir texto, no solo números o símbolos.';
    if (v.length < MESSAGE_MIN) return `El mensaje es muy corto: faltan ${MESSAGE_MIN - v.length} caracteres para llegar al mínimo de ${MESSAGE_MIN}.`;
    if (v.length > MESSAGE_MAX) return `El mensaje supera los ${MESSAGE_MAX} caracteres.`;
    return '';
  },
  acepto(_value, input) {
    return input.checked ? '' : 'Tenés que aceptar el uso de tu correo para que podamos responderte.';
  },
};

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const summary = document.getElementById('formSummary');
  const summaryText = document.getElementById('formSummaryText');
  const counter = document.getElementById('mensaje-count');
  const draftNote = document.getElementById('draftNote');
  const success = document.getElementById('contactSuccess');
  const fields = Object.keys(VALIDATORS).map((name) => form.elements[name]);
  const touched = new Set(); // campos que la persona ya dejó (para no marcar errores antes de tiempo)

  /** Valida un campo, muestra u oculta su error y devuelve si es válido */
  function validateField(input) {
    const message = VALIDATORS[input.name](input.value, input);
    const errorEl = document.getElementById(`${input.name}-error`);

    errorEl.replaceChildren();
    if (message) {
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-circle-exclamation';
      icon.setAttribute('aria-hidden', 'true');
      errorEl.append(icon, ` ${message}`);
    }
    errorEl.hidden = !message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  function updateCounter() {
    const length = form.elements.mensaje.value.trim().length;
    counter.textContent = `${length} de ${MESSAGE_MAX} caracteres (mínimo ${MESSAGE_MIN})`;
    counter.classList.toggle('is-over', length > MESSAGE_MAX);
  }

  /* --- Borrador --- */
  let draftTimer = null;
  const saveDraft = () => {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      const { nombre, email, motivo, mensaje } = form.elements;
      storage.setJSON(DRAFT_STORAGE_KEY, {
        nombre: nombre.value,
        email: email.value,
        motivo: motivo.value,
        mensaje: mensaje.value,
      });
    }, 400);
  };

  const draft = storage.getJSON(DRAFT_STORAGE_KEY, null);
  if (draft && typeof draft === 'object') {
    let restored = false;
    ['nombre', 'email', 'motivo', 'mensaje'].forEach((name) => {
      if (typeof draft[name] === 'string' && draft[name]) {
        form.elements[name].value = draft[name].slice(0, 600);
        restored = true;
      }
    });
    if (restored) draftNote.textContent = 'Recuperamos el borrador que dejaste sin enviar.';
  }
  updateCounter();

  /* --- Validación en vivo --- */
  fields.forEach((input) => {
    const eventName = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'input';

    input.addEventListener('blur', () => {
      touched.add(input.name);
      validateField(input);
    });

    input.addEventListener(eventName, () => {
      if (input.name === 'mensaje') updateCounter();
      if (input.type !== 'checkbox') saveDraft();
      // Si ya mostró un error, se revalida mientras se corrige
      if (touched.has(input.name) || input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  /* --- Envío --- */
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = fields.filter((input) => !validateField(input));
    fields.forEach((input) => touched.add(input.name));

    if (invalid.length > 0) {
      summaryText.textContent =
        invalid.length === 1
          ? 'Hay 1 campo para revisar. Está marcado en rojo.'
          : `Hay ${invalid.length} campos para revisar. Están marcados en rojo.`;
      summary.hidden = false;
      invalid[0].focus();
      return;
    }

    summary.hidden = true;
    const { nombre, email, motivo, mensaje } = form.elements;

    // Confirmación: textContent muestra el texto tal cual, sin ejecutar nada
    document.getElementById('successName').textContent = nombre.value.trim();
    document.getElementById('successEmail').textContent = email.value.trim();
    document.getElementById('successReason').textContent = motivo.options[motivo.selectedIndex].text;
    document.getElementById('successMessage').textContent = mensaje.value.trim();

    // Sitio estático: no hay servidor. Para recibir los mensajes de verdad se puede
    // conectar un servicio como Formspree; la validación y la confirmación no cambian.
    form.reset();
    storage.remove(DRAFT_STORAGE_KEY);
    clearTimeout(draftTimer);
    touched.clear();
    fields.forEach((input) => input.removeAttribute('aria-invalid'));
    draftNote.textContent = '';
    updateCounter();

    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.getElementById('contactAgain').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nombre.focus();
  });
}
