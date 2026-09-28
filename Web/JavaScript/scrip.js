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