document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    // Mantenemos el clic como respaldo para pantallas táctiles/móviles
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            navMenu.classList.toggle('show');
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

    document.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('show');
        }
        document.querySelectorAll('.has-dropdown').forEach((item) => {
            item.classList.remove('open');
        });
    });
});

    // -----------------------------------------------------------
    // 2. ALTERNANCIA DE ESTÁNDARES ISO (ISO 9126 / ISO 25000)
    // -----------------------------------------------------------
    const isoButtons = document.querySelectorAll('.iso-tab-btn');
    const isoTitle = document.getElementById('isoTitle');
    const isoDesc = document.getElementById('isoDesc');

    const isoData = {
        iso9126: {
            title: "ISO 9126: modelo de calidad",
            desc: "Estándar clásico que clasifica la calidad del software en atributos internos, externos y de uso."
        },
        iso25000: {
            title: "ISO 25000: familia SQuaRE",
            desc: "Reúne normas para requisitos, medición y evaluación de calidad."
        }
    };

    isoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            isoButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedIso = btn.getAttribute('data-iso');
            if (isoData[selectedIso]) {
                isoTitle.textContent = isoData[selectedIso].title;
                isoDesc.textContent = isoData[selectedIso].desc;
            }
        });
    });

    // -----------------------------------------------------------
    // 3. ACORDEONES (DESPLEGABLES DE PRUEBAS)
    // -----------------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            
            // Cerrar otros acordeones si se desea comportamiento exclusivo
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem) {
                    item.classList.remove('active');
                }
            });

            currentItem.classList.toggle('active');
        });
    });

    // -----------------------------------------------------------
    // 4. FILTRADO DE HERRAMIENTAS DE CALIDAD
    // -----------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            toolCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === category) {
                    card.classList.remove('is-hidden');
                } else {
                    card.classList.add('is-hidden');
                }
            });
        });
    });
});