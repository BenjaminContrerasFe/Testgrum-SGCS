/* ==========================================================
   RECURSOS.JS — Lógica propia de html/recursos.html
   - US-12: glosario con buscador en tiempo real e índice A-Z
   - US-13: el FAQ usa initDisclosures() de main.js (sin JS nuevo)
   - US-14: los enlaces externos los asegura initExternalLinks() de main.js
   - US-15: botones "Mostrar/Ocultar solución"
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlossary();
  initExercises();
});

/* ----------------------------------------------------------
   US-12: DATOS DEL GLOSARIO
   Agregar un término = sumar un objeto. El orden alfabético,
   las letras y el índice se calculan solos.
   ---------------------------------------------------------- */
const GLOSSARY = [
  { term: 'Aseguramiento de la calidad (QA)', cat: 'Calidad', def: 'Conjunto de actividades planificadas para dar confianza de que el proceso y el producto cumplen los requisitos de calidad. Previene defectos, no solo los detecta.' },
  { term: 'Artefacto', cat: 'Ágil', def: 'En Scrum, elemento que representa trabajo o valor: Product Backlog, Sprint Backlog e Incremento.' },
  { term: 'Bug tracker', cat: 'Herramientas', def: 'Herramienta para registrar, priorizar y seguir defectos hasta su cierre. Ejemplos: Jira, Bugzilla, GitHub Issues.' },
  { term: 'Burndown, gráfico', cat: 'Ágil', def: 'Gráfico que muestra el trabajo pendiente (eje Y) a lo largo del tiempo (eje X). Se compara una línea ideal con la línea real del equipo.' },
  { term: 'Caja blanca, prueba de', cat: 'Pruebas', def: 'Prueba diseñada a partir de la estructura interna del código: sentencias, ramas y caminos. La suelen hacer los desarrolladores.' },
  { term: 'Caja negra, prueba de', cat: 'Pruebas', def: 'Prueba basada solo en entradas y salidas esperadas, sin mirar el código. Usa técnicas como particiones de equivalencia y valores límite.' },
  { term: 'Calidad del software', cat: 'Calidad', def: 'Grado en que un producto satisface las necesidades declaradas e implícitas de sus usuarios cuando se usa en condiciones determinadas.' },
  { term: 'Cascada, modelo en', cat: 'Procesos', def: 'Modelo de desarrollo secuencial en el que cada etapa empieza cuando termina la anterior: requisitos, diseño, implementación, pruebas, despliegue y mantenimiento.' },
  { term: 'Ciclo de vida del software (SDLC)', cat: 'Procesos', def: 'Conjunto de etapas por las que pasa un software desde la idea hasta su retiro: requisitos, diseño, desarrollo, pruebas, despliegue y mantenimiento.' },
  { term: 'Cobertura de código', cat: 'Métricas', def: 'Porcentaje del código que se ejecuta durante las pruebas. Una cobertura alta no garantiza ausencia de defectos, pero una baja indica zonas sin probar.' },
  { term: 'Complejidad ciclomática', cat: 'Métricas', def: 'Métrica que cuenta los caminos independientes de un programa. Cuanto más alta, más difícil es entender y probar el código.' },
  { term: 'Criterios de aceptación', cat: 'Ágil', def: 'Condiciones verificables que una historia de usuario debe cumplir para que el Product Owner la acepte.' },
  { term: 'Daily Scrum', cat: 'Ágil', def: 'Evento diario de 15 minutos en el que los Developers revisan el avance hacia el Objetivo del Sprint y ajustan el plan del día.' },
  { term: 'Defecto', cat: 'Calidad', def: 'Imperfección en un producto (código, documento) que puede provocar que no cumpla su función. También se lo llama bug.' },
  { term: 'Definición de Hecho (DoD)', cat: 'Ágil', def: 'Descripción formal del estado que debe alcanzar el trabajo para considerarse terminado y formar parte del Incremento.' },
  { term: 'Densidad de defectos', cat: 'Métricas', def: 'Cantidad de defectos encontrados dividida por el tamaño del software (por ejemplo, defectos cada mil líneas de código).' },
  { term: 'Despliegue', cat: 'Procesos', def: 'Etapa en la que el software se instala en el entorno de producción y queda disponible para los usuarios.' },
  { term: 'Error', cat: 'Calidad', def: 'Equivocación humana que produce un defecto. Por ejemplo, interpretar mal un requisito.' },
  { term: 'Falla', cat: 'Calidad', def: 'Comportamiento observable del sistema distinto del esperado, causado por la ejecución de un defecto.' },
  { term: 'Fiabilidad', cat: 'Calidad', def: 'Capacidad del software de funcionar sin fallas durante un tiempo y en condiciones determinadas. Incluye disponibilidad y tolerancia a fallos.' },
  { term: 'Historia de usuario', cat: 'Ágil', def: 'Descripción breve de una funcionalidad desde el punto de vista de quien la usa: “Como [rol], quiero [acción] para [beneficio]”.' },
  { term: 'Incremento', cat: 'Ágil', def: 'Resultado utilizable de un sprint que cumple la Definición de Hecho y suma valor al producto.' },
  { term: 'Integración continua', cat: 'Procesos', def: 'Práctica de integrar el código de todo el equipo varias veces por día, con compilación y pruebas automáticas en cada integración.' },
  { term: 'Integración, pruebas de', cat: 'Pruebas', def: 'Pruebas que verifican cómo interactúan módulos o servicios combinados: interfaces, contratos y flujo de datos.' },
  { term: 'INVEST', cat: 'Ágil', def: 'Siglas para evaluar historias de usuario: Independiente, Negociable, Valiosa, Estimable, Pequeña (Small) y Testeable.' },
  { term: 'ISO/IEC 25010', cat: 'Calidad', def: 'Norma de la familia SQuaRE que define el modelo de calidad del producto de software y sus características.' },
  { term: 'ISO/IEC 9126', cat: 'Calidad', def: 'Norma anterior a la familia ISO 25000. Definía seis características: funcionalidad, fiabilidad, usabilidad, eficiencia, mantenibilidad y portabilidad.' },
  { term: 'Iteración', cat: 'Procesos', def: 'Ciclo corto de desarrollo que se repite y en el que se planifica, construye, prueba y evalúa una parte del producto.' },
  { term: 'Kanban', cat: 'Ágil', def: 'Método para gestionar el flujo de trabajo visualizándolo en un tablero y limitando el trabajo en curso.' },
  { term: 'Lead time (tiempo de entrega)', cat: 'Métricas', def: 'Tiempo desde que se pide un trabajo hasta que se entrega. Incluye la espera antes de empezar, a diferencia del tiempo de ciclo.' },
  { term: 'Linter', cat: 'Herramientas', def: 'Herramienta que analiza el código sin ejecutarlo y marca errores de estilo o malas prácticas. Ejemplos: ESLint, Stylelint.' },
  { term: 'Mantenibilidad', cat: 'Calidad', def: 'Facilidad con la que el software puede modificarse para corregir defectos, mejorar o adaptarse a cambios.' },
  { term: 'Mantenimiento', cat: 'Procesos', def: 'Etapa del ciclo de vida posterior al despliegue en la que se corrigen incidencias, se adapta el sistema y se agregan mejoras.' },
  { term: 'Métrica', cat: 'Calidad', def: 'Medida cuantitativa de un atributo del producto o del proceso que permite comparar y tomar decisiones con evidencia.' },
  { term: 'Modelo en V', cat: 'Procesos', def: 'Variante de la cascada en la que cada etapa de definición se corresponde con un nivel de prueba (requisitos con aceptación, diseño con integración…).' },
  { term: 'Particiones de equivalencia', cat: 'Pruebas', def: 'Técnica de caja negra que divide las entradas en grupos que el sistema debería tratar igual, y prueba un valor de cada grupo.' },
  { term: 'Product Backlog', cat: 'Ágil', def: 'Lista ordenada de todo lo que se necesita para mejorar el producto. La gestiona el Product Owner y su compromiso es el Objetivo del Producto.' },
  { term: 'Product Owner', cat: 'Ágil', def: 'Responsable de maximizar el valor del producto. Ordena el Product Backlog y decide qué conviene construir primero.' },
  { term: 'Programación en pares', cat: 'Ágil', def: 'Práctica de XP en la que dos personas trabajan en la misma computadora: una escribe y la otra revisa y piensa la estrategia.' },
  { term: 'Puntos de historia', cat: 'Ágil', def: 'Unidad relativa para estimar el esfuerzo, la complejidad y la incertidumbre de una historia de usuario.' },
  { term: 'Refactorización', cat: 'Procesos', def: 'Cambiar la estructura interna del código para hacerlo más claro o simple sin modificar su comportamiento externo.' },
  { term: 'Regresión, prueba de', cat: 'Pruebas', def: 'Volver a ejecutar pruebas después de un cambio para confirmar que lo que ya funcionaba no se rompió.' },
  { term: 'Requisito', cat: 'Procesos', def: 'Condición o capacidad que el sistema debe cumplir. Puede ser funcional (qué hace) o no funcional (cómo lo hace: rendimiento, seguridad…).' },
  { term: 'Retrospectiva (Sprint Retrospective)', cat: 'Ágil', def: 'Último evento del sprint, en el que el equipo revisa cómo trabajó y acuerda mejoras concretas.' },
  { term: 'Scrum', cat: 'Ágil', def: 'Marco de trabajo ligero para resolver problemas complejos mediante sprints, con tres responsabilidades, cinco eventos y tres artefactos.' },
  { term: 'Scrum Master', cat: 'Ágil', def: 'Responsable de la efectividad del Scrum Team: ayuda a entender y aplicar Scrum y elimina impedimentos.' },
  { term: 'Spike', cat: 'Ágil', def: 'Tarea corta de investigación o prototipo para reducir la incertidumbre técnica antes de estimar o construir.' },
  { term: 'Sprint', cat: 'Ágil', def: 'Ciclo de duración fija (un mes o menos) en el que se crea un incremento. Contiene a todos los demás eventos de Scrum.' },
  { term: 'Sprint Backlog', cat: 'Ágil', def: 'Elementos del Product Backlog elegidos para el sprint, más el plan para entregarlos. Su compromiso es el Objetivo del Sprint.' },
  { term: 'Sprint Review', cat: 'Ágil', def: 'Evento en el que se muestra el resultado del sprint a los interesados y se adapta el Product Backlog según lo aprendido.' },
  { term: 'TDD (desarrollo guiado por pruebas)', cat: 'Pruebas', def: 'Práctica de escribir primero una prueba que falla, después el código mínimo que la hace pasar y por último refactorizar.' },
  { term: 'Tiempo de ciclo', cat: 'Métricas', def: 'Tiempo desde que se empieza a trabajar en una tarea hasta que se termina. Es la métrica central de Kanban.' },
  { term: 'Trazabilidad', cat: 'Calidad', def: 'Capacidad de seguir la relación entre requisitos, diseño, código y pruebas en ambos sentidos.' },
  { term: 'Unitaria, prueba', cat: 'Pruebas', def: 'Prueba de la unidad mínima de código (función, método o componente) aislada del resto del sistema.' },
  { term: 'Usabilidad', cat: 'Calidad', def: 'Grado en que un producto puede ser usado con eficacia, eficiencia y satisfacción. Incluye la accesibilidad.' },
  { term: 'Validación', cat: 'Calidad', def: 'Confirmación de que el producto cumple la necesidad real del usuario. Responde: ¿construimos el producto correcto?' },
  { term: 'Valores límite', cat: 'Pruebas', def: 'Técnica de caja negra que prueba los valores en los bordes de cada rango válido y justo afuera, donde suelen aparecer los errores.' },
  { term: 'Velocidad', cat: 'Ágil', def: 'Cantidad de puntos de historia que un equipo termina por sprint. Sirve para planificar, no para comparar equipos.' },
  { term: 'Verificación', cat: 'Calidad', def: 'Confirmación de que el producto cumple su especificación. Responde: ¿construimos el producto correctamente?' },
  { term: 'WIP (trabajo en curso)', cat: 'Ágil', def: 'Cantidad de tareas empezadas y no terminadas. En Kanban se limita por columna para mejorar el flujo.' },
  { term: 'XP (Extreme Programming)', cat: 'Ágil', def: 'Metodología ágil centrada en prácticas técnicas: programación en pares, TDD, integración continua y entregas pequeñas.' },
];

// Alfabeto español: la Ñ va después de la N
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

/** Letra de agrupación: "Ágil" → "A" (pero Ñ se mantiene) */
function groupLetter(term) {
  const first = term.trim().charAt(0).toUpperCase();
  return first === 'Ñ' ? 'Ñ' : first.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza un texto letra por letra y guarda a qué posición original
 * corresponde cada letra normalizada. Así se puede resaltar la coincidencia
 * en el texto original (con tildes) aunque la búsqueda las ignore.
 */
function normalizeWithMap(text) {
  let normalized = '';
  const map = [];
  [...text].forEach((ch, i) => {
    const n = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    for (const c of n) {
      normalized += c;
      map.push(i);
    }
  });
  return { normalized, map, chars: [...text] };
}

/** Devuelve un fragmento con <mark> en cada coincidencia. Sin innerHTML. */
function highlight(text, query) {
  const fragment = document.createDocumentFragment();
  if (!query) {
    fragment.append(text);
    return fragment;
  }

  const { normalized, map, chars } = normalizeWithMap(text);
  let cursor = 0; // posición en el texto original
  let from = normalized.indexOf(query);

  while (from !== -1) {
    const start = map[from];
    const end = map[from + query.length - 1] + 1;
    if (start > cursor) fragment.append(chars.slice(cursor, start).join(''));
    const mark = document.createElement('mark');
    mark.textContent = chars.slice(start, end).join('');
    fragment.append(mark);
    cursor = end;
    from = normalized.indexOf(query, from + query.length);
  }
  if (cursor < chars.length) fragment.append(chars.slice(cursor).join(''));
  return fragment;
}

function initGlossary() {
  const list = document.getElementById('glossaryList');
  if (!list) return;

  const input = document.getElementById('glossarySearch');
  const counter = document.getElementById('glossaryCount');
  const azIndex = document.getElementById('azIndex');
  const empty = document.getElementById('glossaryEmpty');
  const emptyTerm = document.getElementById('glossaryEmptyTerm');
  const clearBtn = document.getElementById('glossaryClear');

  // Orden alfabético en español (respeta tildes y la Ñ)
  const entries = [...GLOSSARY]
    .sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }))
    .map((entry) => ({
      ...entry,
      letter: groupLetter(entry.term),
      searchable: normalizeText(`${entry.term} ${entry.def} ${entry.cat}`),
    }));

  /* --- Índice A-Z --- */
  const letterButtons = new Map();
  ALPHABET.forEach((letter) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'az-index__letter';
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      const group = document.getElementById(`letra-${letter}`);
      if (!group) return;
      group.scrollIntoView({ behavior: 'smooth', block: 'start' });
      group.querySelector('.glossary__letter').focus({ preventScroll: true });
    });
    letterButtons.set(letter, btn);
    azIndex.append(btn);
  });

  /* --- Dibujar la lista según la búsqueda --- */
  function render(rawQuery) {
    // Espacios repetidos cuentan como uno; mayúsculas y tildes no importan.
    // Se busca con indexOf (no con expresiones regulares), así que caracteres
    // especiales como ( * + ? [ \ < > no rompen nada.
    const query = normalizeText(rawQuery).replace(/\s+/g, ' ');
    const visible = query ? entries.filter((e) => e.searchable.includes(query)) : entries;

    list.replaceChildren();

    const groups = new Map();
    visible.forEach((entry) => {
      if (!groups.has(entry.letter)) groups.set(entry.letter, []);
      groups.get(entry.letter).push(entry);
    });

    groups.forEach((items, letter) => {
      const section = document.createElement('section');
      section.className = 'glossary__group';
      section.id = `letra-${letter}`;
      section.setAttribute('aria-labelledby', `letra-${letter}-title`);

      const heading = document.createElement('h2');
      heading.className = 'glossary__letter';
      heading.id = `letra-${letter}-title`;
      heading.tabIndex = -1; // recibe el foco al usar el índice
      heading.textContent = letter;

      const dl = document.createElement('dl');
      dl.className = 'glossary__terms';

      items.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'glossary__item';

        const dt = document.createElement('dt');
        dt.append(highlight(entry.term, query));
        const cat = document.createElement('span');
        cat.className = 'glossary__cat';
        cat.textContent = entry.cat;
        dt.append(document.createElement('br'), cat);

        const dd = document.createElement('dd');
        dd.append(highlight(entry.def, query));

        item.append(dt, dd);
        dl.append(item);
      });

      section.append(heading, dl);
      list.append(section);
    });

    // Letras sin resultados → deshabilitadas
    letterButtons.forEach((btn, letter) => {
      const has = groups.has(letter);
      btn.disabled = !has;
      btn.setAttribute('aria-label', has ? `Ir a la letra ${letter}` : `Letra ${letter}: sin términos`);
    });

    // Contador y estado "Sin resultados"
    const n = visible.length;
    empty.hidden = n > 0;
    list.hidden = n === 0;
    if (!query) {
      counter.textContent = `${n} términos en el glosario.`;
    } else if (n === 0) {
      counter.textContent = 'Sin resultados.';
      emptyTerm.textContent = rawQuery.trim(); // textContent: lo que se escribió se muestra tal cual, nunca se interpreta como HTML
    } else {
      counter.textContent = `${n} ${n === 1 ? 'resultado' : 'resultados'} para “${rawQuery.trim()}”.`;
    }
  }

  input.addEventListener('input', () => render(input.value));

  // Escape dentro del buscador → limpiar
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      input.value = '';
      render('');
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    render('');
    input.focus();
  });

  render('');
}

/* ----------------------------------------------------------
   US-15: MOSTRAR / OCULTAR SOLUCIÓN
   Las soluciones arrancan con el atributo hidden en el HTML.
   El botón cambia su texto, su ícono y aria-expanded.
   ---------------------------------------------------------- */
function initExercises() {
  document.querySelectorAll('.exercise__toggle').forEach((button) => {
    const solution = document.getElementById(button.getAttribute('aria-controls'));
    const label = button.querySelector('span');
    const icon = button.querySelector('i');
    if (!solution) return;

    // Garantía extra: aunque alguien edite el HTML, al cargar quedan ocultas
    solution.hidden = true;
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const willShow = solution.hidden;
      solution.hidden = !willShow;
      button.setAttribute('aria-expanded', String(willShow));
      label.textContent = willShow ? 'Ocultar solución' : 'Mostrar solución';
      icon.className = willShow ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  });
}
