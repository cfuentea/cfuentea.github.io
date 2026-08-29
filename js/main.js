/**
 * CARLOS FUENTEALBA - PORTFOLIO LOGIC
 * High performance, zero bloat, accessible, 100% Lighthouse ready.
 */

import translations from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const langToggleBtn = document.getElementById('lang-toggle');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const yearSpan = document.getElementById('year');
    const backToTopBtn = document.getElementById('back-to-top');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const copyEmailBtns = document.querySelectorAll('.js-copy-email');

    // --- State ---
    let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = localStorage.getItem('theme') || (systemPrefersDark ? 'dark' : 'light');

    let toastTimeout = null;

    // --- 1. Theme Management ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const iconSpan = themeToggleBtn.querySelector('.material-symbols-rounded');
        
        if (theme === 'dark') {
            if (iconSpan) iconSpan.textContent = 'light_mode';
            themeToggleBtn.setAttribute('aria-label', translations[currentLang].theme_toggle_label || 'Cambiar a tema claro');
        } else {
            if (iconSpan) iconSpan.textContent = 'dark_mode';
            themeToggleBtn.setAttribute('aria-label', translations[currentLang].theme_toggle_label || 'Cambiar a tema oscuro');
        }
    }

    applyTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });

    // Listen for OS theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            applyTheme(currentTheme);
        }
    });

    // --- 2. Language & i18n Management ---
    function applyLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        document.documentElement.setAttribute('lang', lang);
        
        // Update button text / indicator
        langToggleBtn.textContent = lang === 'es' ? 'EN' : 'ES';
        langToggleBtn.setAttribute('aria-label', translations[lang].lang_toggle_label);

        const dict = translations[lang];

        // Update all text nodes with data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Update ARIA labels with data-i18n-aria
        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key]) {
                el.setAttribute('aria-label', dict[key]);
            }
        });

        // Re-apply theme button label translation
        applyTheme(currentTheme);
    }

    applyLanguage(currentLang);

    langToggleBtn.addEventListener('click', () => {
        const nextLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('lang', nextLang);
        applyLanguage(nextLang);
    });

    // --- 3. Accessible Mobile Navigation ---
    function closeMobileMenu() {
        mobileNavDrawer.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        const iconSpan = mobileMenuToggle.querySelector('.material-symbols-rounded');
        if (iconSpan) iconSpan.textContent = 'menu';
    }

    function openMobileMenu() {
        mobileNavDrawer.classList.add('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        const iconSpan = mobileMenuToggle.querySelector('.material-symbols-rounded');
        if (iconSpan) iconSpan.textContent = 'close';
    }

    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = mobileNavDrawer.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close on navigation link click
    mobileNavDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNavDrawer.classList.contains('open')) {
            closeMobileMenu();
            mobileMenuToggle.focus();
        }
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
        if (
            mobileNavDrawer.classList.contains('open') &&
            !mobileNavDrawer.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)
        ) {
            closeMobileMenu();
        }
    });

    // --- 4. Scroll Reveal & ScrollSpy ---
    const revealElements = document.querySelectorAll('.reveal');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Reveal on scroll
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach((el) => revealObserver.observe(el));

        // Active link on scroll (ScrollSpy)
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        sections.forEach((sec) => spyObserver.observe(sec));
    } else {
        // Fallback for older browsers
        revealElements.forEach((el) => el.classList.add('revealed'));
    }

    // --- 5. Back to Top Button ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 6. Toast & Copy Functionality ---
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 3200);
    }

    copyEmailBtns.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = btn.getAttribute('data-email') || 'contacto@fuentealba.dev';
            try {
                await navigator.clipboard.writeText(email);
                showToast(translations[currentLang].hero_email_copied || '¡Email copiado al portapapeles!');
            } catch (err) {
                // Fallback for older clipboard permission
                window.location.href = `mailto:${email}`;
            }
        });
    });

    // Terminal JSON Copy
    const terminalCopyBtn = document.querySelector('.js-terminal-copy');
    if (terminalCopyBtn) {
        terminalCopyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const codeBlock = document.querySelector('.terminal-code code');
            const textToCopy = codeBlock ? codeBlock.textContent : JSON.stringify({
                role: "Solutions Architect & Tech Lead",
                domain: "fuentealba.dev",
                focus: [
                    "Resilient Architectures (99.99% SLA)",
                    "OSS/BSS Automation & Integration",
                    "Predictive Observability & Telemetry"
                ],
                core_stack: ["Python", "Linux/Cloud", "FastAPI", "Kafka", "Grafana"],
                track_record: "15+ yrs | 5+ countries | 100+ flows",
                status: "Available for strategic leadership"
            }, null, 2);

            try {
                await navigator.clipboard.writeText(textToCopy);
                terminalCopyBtn.classList.add('copied');
                const copyTextSpan = terminalCopyBtn.querySelector('.copy-text');
                const prevText = copyTextSpan ? copyTextSpan.textContent : '';
                if (copyTextSpan) {
                    copyTextSpan.textContent = translations[currentLang].terminal_copied_feedback || '¡Copiado!';
                }
                showToast(translations[currentLang].terminal_copied_feedback || '¡JSON copiado al portapapeles!');
                
                setTimeout(() => {
                    terminalCopyBtn.classList.remove('copied');
                    if (copyTextSpan) {
                        copyTextSpan.textContent = translations[currentLang].terminal_copy_btn || prevText;
                    }
                }, 2000);
            } catch (err) {
                showToast('Error al copiar');
            }
        });
    }

    // --- 7. Year initialization ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
