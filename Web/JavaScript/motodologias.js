// Agregar dentro de DOMContentLoaded o al final del archivo script.js existente

// -----------------------------------------------------------
// 4. INTERACCIÓN SCRUM (ROLES Y CRONOGRAMA)
// -----------------------------------------------------------
const scrumBtns = document.querySelectorAll('[data-scrum]');
const scrumCategoryDesc = document.getElementById('scrumCategoryDesc');

const scrumData = {
    roles: "Product Owner, Scrum Master y Developers colaboran para maximizar el valor del Incremento.",
    eventos: "Sprint, Planning, Daily, Review y Retrospective estructuran la inspección y adaptación constante.",
    artefactos: "Product Backlog, Sprint Backlog e Incremento aportan transparencia sobre el trabajo."
};

if (scrumBtns.length > 0) {
    scrumBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scrumBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.getAttribute('data-scrum');
            if (scrumData[key]) {
                scrumCategoryDesc.innerHTML = `<strong>${scrumData[key]}</strong>`;
            }
        });
    });
}

// Cronograma de Sprint
const sprintEventBtns = document.querySelectorAll('[data-event]');
const sprintEventDesc = document.getElementById('sprintEventDesc');

const sprintEventsData = {
    planning: "Planning: define el objetivo del Sprint y el trabajo inicial.",
    daily: "Daily: reunión diaria de 15 min para sincronizar al equipo y detectar bloqueos.",
    review: "Review: inspección del incremento completado junto a los interesados.",
    retro: "Retro: reflexión sobre el proceso interno para acordar mejoras continuas."
};

if (sprintEventBtns.length > 0) {
    sprintEventBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sprintEventBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.getAttribute('data-event');
            if (sprintEventsData[key]) {
                sprintEventDesc.textContent = sprintEventsData[key];
            }
        });
    });
}

// -----------------------------------------------------------
// 5. LÓGICA DE MOVER TARJETA KANBAN
// -----------------------------------------------------------
const taskCard = document.getElementById('taskCard');
const btnMoveLeft = document.getElementById('btnMoveLeft');
const btnMoveRight = document.getElementById('btnMoveRight');

const columns = [
    document.getElementById('col-todo'),
    document.getElementById('col-wip'),
    document.getElementById('col-done')
];

let currentColumnIndex = 0; // 0: Por hacer, 1: WIP, 2: Hecho

function updateKanbanState() {
    if (!taskCard) return;
    
    // Mover nodo de tarjeta a la columna correspondiente
    columns[currentColumnIndex].appendChild(taskCard);

    // Actualizar estado de los botones
    if (btnMoveLeft) btnMoveLeft.disabled = currentColumnIndex === 0;
    if (btnMoveRight) btnMoveRight.disabled = currentColumnIndex === columns.length - 1;
}

if (btnMoveRight) {
    btnMoveRight.addEventListener('click', () => {
        if (currentColumnIndex < columns.length - 1) {
            currentColumnIndex++;
            updateKanbanState();
        }
    });
}

if (btnMoveLeft) {
    btnMoveLeft.addEventListener('click', () => {
        if (currentColumnIndex > 0) {
            currentColumnIndex--;
            updateKanbanState();
        }
    });
}