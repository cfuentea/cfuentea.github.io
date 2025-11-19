import translations from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const langToggleBtn = document.getElementById('lang-toggle');
    const yearSpan = document.getElementById('year');

    // --- State ---
    let currentLang = localStorage.getItem('lang') || 'es';
    // Detect system preference for theme if not saved
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let currentTheme = localStorage.getItem('theme') || systemTheme;

    // --- Initialization ---
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    yearSpan.textContent = new Date().getFullYear();

    // --- Event Listeners ---
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        applyLanguage(currentLang);
        localStorage.setItem('lang', currentLang);
    });

    // --- Functions ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    function applyLanguage(lang) {
        document.documentElement.setAttribute('lang', lang);
        langToggleBtn.textContent = lang === 'es' ? 'EN' : 'ES';

        const t = translations[lang];

        // Update text content for elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (t[key]) {
                element.textContent = t[key];
            }
        });
    }
});
