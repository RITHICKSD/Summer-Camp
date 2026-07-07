/* ==========================================================================
   SHARED.JS — Runs on every page (header/footer interactions)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    /* --- THEME TOGGLE (Light / Dark) --- */
    const themeToggles = document.querySelectorAll('.theme-toggle');

    function applyTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        themeToggles.forEach(t => {
            const icon = t.querySelector('i');
            if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
    }

    // Load saved theme
    applyTheme(localStorage.getItem('theme') === 'dark');

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-theme');
            applyTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    });

    /* --- DIRECTION TOGGLE (LTR / RTL) --- */
    const dirToggles = document.querySelectorAll('.dir-toggle');

    function applyDir(isRtl) {
        if (isRtl) {
            body.classList.add('rtl');
            document.documentElement.dir = 'rtl';
        } else {
            body.classList.remove('rtl');
            document.documentElement.dir = 'ltr';
        }
        dirToggles.forEach(t => {
            const span = t.querySelector('span');
            if (span) span.textContent = isRtl ? 'LTR' : 'RTL';
        });
    }

    // Load saved direction
    applyDir(localStorage.getItem('dir') === 'rtl');

    dirToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isRtl = !body.classList.contains('rtl');
            applyDir(isRtl);
            localStorage.setItem('dir', isRtl ? 'rtl' : 'ltr');
        });
    });

    /* --- MOBILE NAV TOGGLE (Hamburger) --- */
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) icon.className = navMenu.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
    }

    /* --- DROPDOWN TOGGLE (mobile only) --- */
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                // Close others
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item !== parent) item.classList.remove('dropdown-active');
                });
                parent.classList.toggle('dropdown-active');
            }
        });
    });

    // Close nav when a nav link is clicked (mobile)
    document.querySelectorAll('.nav-links a:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    });

    /* --- FAQ ACCORDION (home1.html) --- */
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
});
