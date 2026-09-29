document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------
    // 1. CONTROL DEL MENÚ HAMBURGUESA Y DROPDOWNS
    // -----------------------------------------------------------
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            navMenu.classList.toggle('show');
        });

        // Evita que hacer clic dentro del menú desplegado lo cierre accidentalmente
        navMenu.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    dropdownBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const parentItem = btn.closest('.has-dropdown');
            if (parentItem) {
                parentItem.classList.toggle('open');
            }
        });
    });

    // Cierra el menú al hacer clic fuera de él
    document.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('show');
        }
        document.querySelectorAll('.has-dropdown').forEach((item) => {
            item.classList.remove('open');
        });
    });

    // -----------------------------------------------------------
    // 2. INTERACCIÓN ETAPAS SDLC
    // -----------------------------------------------------------
    const sdlcBtns = document.querySelectorAll('.sdlc-step-btn');
    const sdlcTitle = document.getElementById('sdlcTitle');
    const sdlcDesc = document.getElementById('sdlcDesc');

    const sdlcData = {
        1: {
            title: "Requisitos",
            desc: "Define necesidades, alcance y criterios de aceptación antes de planificar la solución."
        },
        2: {
            title: "Diseño",
            desc: "Modela la arquitectura, bases de datos y la interfaz del sistema para guiarse durante la construcción."
        },
        3: {
            title: "Desarrollo",
            desc: "Escribe y traduce la arquitectura y lógica especificada en código fuente funcional."
        },
        4: {
            title: "Pruebas",
            desc: "Ejecuta casos de verificación para detectar defectos y garantizar que se cumplan las expectativas."
        },
        5: {
            title: "Despliegue",
            desc: "Publica y entrega la aplicación en entornos de producción para los usuarios finales."
        },
        6: {
            title: "Mantenimiento",
            desc: "Monitorea, resuelve incidencias y realiza mejoras continuas sobre el software ya instalado."
        }
    };

    if (sdlcBtns.length > 0) {
        sdlcBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sdlcBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const step = btn.getAttribute('data-step');
                if (sdlcData[step]) {
                    if (sdlcTitle) sdlcTitle.textContent = sdlcData[step].title;
                    if (sdlcDesc) sdlcDesc.textContent = sdlcData[step].desc;
                }
            });
        });
    }

    // -----------------------------------------------------------
    // 3. INTERACCIÓN MODELOS TRADICIONALES
    // -----------------------------------------------------------
    const modelBtns = document.querySelectorAll('[data-model]');
    const modelTitle = document.getElementById('modelTitle');
    const modelDesc = document.getElementById('modelDesc');
    const modelAdvantage = document.getElementById('modelAdvantage');
    const modelLimit = document.getElementById('modelLimit');

    const modelData = {
        cascada: {
            title: "Modelo en cascada",
            desc: "Avanza secuencialmente y funciona bien cuando los requisitos son estables.",
            adv: "Ventaja: orden y documentación clara.",
            limit: "Límite: menor flexibilidad ante cambios."
        },
        modelov: {
            title: "Modelo en V",
            desc: "Relaciona de forma directa cada fase de desarrollo con su correspondiente nivel de pruebas.",
            adv: "Ventaja: detección temprana de errores.",
            limit: "Límite: rígido y costoso ante cambios imprevistos."
        },
        iterativo: {
            title: "Modelo iterativo",
            desc: "Construye el proyecto en ciclos repetitivos permitiendo refinamientos progresivos.",
            adv: "Ventaja: entregas tempranas y retroalimentación constante.",
            limit: "Límite: requiere mayor gestión de recursos por iteración."
        }
    };

    if (modelBtns.length > 0) {
        modelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const key = btn.getAttribute('data-model');
                if (modelData[key]) {
                    if (modelTitle) modelTitle.textContent = modelData[key].title;
                    if (modelDesc) modelDesc.textContent = modelData[key].desc;
                    if (modelAdvantage) modelAdvantage.textContent = modelData[key].adv;
                    if (modelLimit) modelLimit.textContent = modelData[key].limit;
                }
            });
        });
    }
});