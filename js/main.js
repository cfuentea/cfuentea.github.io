/**
 * CARLOS FUENTEALBA — PORTFOLIO INTERACTION LAYER
 * Cross-browser resilient, zero-dependency, accessible ES module.
 */

import translations from './i18n.js';

const safeStorage = {
    get(key) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Storage disabled (e.g., strict privacy mode or sandboxed frame)
        }
    }
};

function addMediaChangeListener(mediaQueryList, handler) {
    if (!mediaQueryList) return;
    if (typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', handler);
    } else if (typeof mediaQueryList.addListener === 'function') {
        mediaQueryList.addListener(handler);
    }
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }

    // Fallback for non-HTTPS previews and legacy WebViews
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }

    if (!copied) {
        throw new Error('Clipboard fallback failed');
    }
    return true;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function setSvgUseHref(buttonEl, symbolId) {
    if (!buttonEl) return;
    const useEl = buttonEl.querySelector('use');
    if (useEl) {
        useEl.setAttribute('href', symbolId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const langToggleBtn = document.getElementById('lang-toggle');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const metaThemeColor = document.getElementById('meta-theme-color');
    const metaDescription = document.querySelector('meta[name="description"]');
    const yearSpan = document.getElementById('year');
    const backToTopBtn = document.getElementById('back-to-top');
    const printProfileBtn = document.getElementById('print-profile-btn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const copyEmailBtns = document.querySelectorAll('.js-copy-email');

    // Terminal elements
    const terminalTabs = document.querySelectorAll('[data-terminal-view]');
    const terminalActiveCmd = document.getElementById('terminal-active-cmd');
    const terminalOutputCode = document.getElementById('terminal-output-code');
    const terminalForm = document.getElementById('terminal-form');
    const terminalInput = document.getElementById('terminal-cmd-input');
    const terminalCopyBtn = document.getElementById('terminal-copy-btn');

    // Skills filter elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCategories = document.querySelectorAll('.competency-category');

    // --- State ---
    const browserLang = (navigator.language || 'es').toLowerCase();
    const savedLang = safeStorage.get('lang');
    let currentLang = savedLang && translations[savedLang]
        ? savedLang
        : (browserLang.startsWith('es') ? 'es' : 'en');

    const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const savedTheme = safeStorage.get('theme');
    let currentTheme = savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : (darkQuery && darkQuery.matches ? 'dark' : 'light');

    let activeTerminalView = 'profile';
    let toastTimeout = null;
    let copyBtnTimeout = null;

    // --- 1. Theme Management ---
    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#090d14' : '#f7f8fa');
        }

        const dict = translations[currentLang] || translations.es;
        if (themeToggleBtn) {
            if (theme === 'dark') {
                setSvgUseHref(themeToggleBtn, '#icon-sun');
                themeToggleBtn.setAttribute('aria-label', dict.theme_toggle_light);
            } else {
                setSvgUseHref(themeToggleBtn, '#icon-moon');
                themeToggleBtn.setAttribute('aria-label', dict.theme_toggle_dark);
            }
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            safeStorage.set('theme', nextTheme);
            applyTheme(nextTheme);
        });
    }

    addMediaChangeListener(darkQuery, (e) => {
        if (!safeStorage.get('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- 2. Interactive Terminal Views ---
    function getTerminalViewPayload(view, lang) {
        const dict = translations[lang] || translations.es;

        if (view === 'stack') {
            return {
                cmd: 'stack --core --format=json',
                html: `<span class="t-bracket">{</span>
  <span class="t-key">"architecture"</span>: <span class="t-bracket">[</span><span class="t-str">"OSS/BSS"</span>, <span class="t-str">"Microservices"</span>, <span class="t-str">"HA / DR"</span><span class="t-bracket">]</span>,
  <span class="t-key">"languages"</span>: <span class="t-bracket">[</span><span class="t-str">"Python"</span>, <span class="t-str">"SQL"</span>, <span class="t-str">"Bash"</span><span class="t-bracket">]</span>,
  <span class="t-key">"cloud_infra"</span>: <span class="t-bracket">[</span><span class="t-str">"AWS"</span>, <span class="t-str">"GCP"</span>, <span class="t-str">"Azure"</span>, <span class="t-str">"Linux"</span><span class="t-bracket">]</span>,
  <span class="t-key">"streaming_api"</span>: <span class="t-bracket">[</span><span class="t-str">"FastAPI"</span>, <span class="t-str">"Kafka"</span>, <span class="t-str">"ETL"</span><span class="t-bracket">]</span>,
  <span class="t-key">"observability"</span>: <span class="t-bracket">[</span><span class="t-str">"Prometheus"</span>, <span class="t-str">"Grafana"</span>, <span class="t-str">"OpenSearch"</span><span class="t-bracket">]</span>
<span class="t-bracket">}</span>`
            };
        }

        if (view === 'sla') {
            const isEs = lang === 'es';
            return {
                cmd: 'metrics --operational-resilience',
                html: `<span class="t-bracket">{</span>
  <span class="t-key">"availability_target"</span>: <span class="t-str t-highlight">"99.99%"</span>,
  <span class="t-key">"experience_years"</span>: <span class="t-str">"15+"</span>,
  <span class="t-key">"regions_led"</span>: <span class="t-str">"${isEs ? '5+ países (LATAM / Multi-país)' : '5+ countries (Multi-country teams)'}"</span>,
  <span class="t-key">"critical_workflows"</span>: <span class="t-str">"${isEs ? '100+ integraciones OSS/BSS' : '100+ OSS/BSS integrations'}"</span>,
  <span class="t-key">"telemetry_mode"</span>: <span class="t-str">"${isEs ? 'Correlación en tiempo real' : 'Real-time event correlation'}"</span>
<span class="t-bracket">}</span>`
            };
        }

        if (view === 'contact') {
            const isEs = lang === 'es';
            return {
                cmd: 'cat contact.json',
                html: `<span class="t-bracket">{</span>
  <span class="t-key">"email"</span>: <span class="t-str">"contacto@fuentealba.dev"</span>,
  <span class="t-key">"linkedin"</span>: <span class="t-str">"linkedin.com/in/carlosfuentealba"</span>,
  <span class="t-key">"github"</span>: <span class="t-str">"github.com/cfuentea"</span>,
  <span class="t-key">"location"</span>: <span class="t-str">"Santiago, Chile"</span>,
  <span class="t-key">"modality"</span>: <span class="t-str t-highlight">"${isEs ? 'Remoto / Híbrido' : 'Remote / Hybrid'}"</span>
<span class="t-bracket">}</span>`
            };
        }

        if (view === 'whoami') {
            return {
                cmd: 'whoami',
                html: `<span class="t-str">"${escapeHtml(dict.terminal_whoami)}"</span>`
            };
        }

        if (view === 'help') {
            return {
                cmd: 'help',
                html: `<span class="t-muted">${escapeHtml(dict.terminal_help_output)}</span>`
            };
        }

        // Default: profile.json
        return {
            cmd: 'cat profile.json',
            html: `<span class="t-bracket">{</span>
  <span class="t-key">"role"</span>: <span class="t-str">"${escapeHtml(dict.terminal_json_role)}"</span>,
  <span class="t-key">"domain"</span>: <span class="t-str">"${escapeHtml(dict.terminal_json_domain)}"</span>,
  <span class="t-key">"focus"</span>: <span class="t-bracket">[</span>
    <span class="t-str">"${escapeHtml(dict.terminal_json_focus_1)}"</span>,
    <span class="t-str">"${escapeHtml(dict.terminal_json_focus_2)}"</span>,
    <span class="t-str">"${escapeHtml(dict.terminal_json_focus_3)}"</span>
  <span class="t-bracket">]</span>,
  <span class="t-key">"stack"</span>: <span class="t-bracket">[</span><span class="t-str">"Python"</span>, <span class="t-str">"Cloud"</span>, <span class="t-str">"FastAPI"</span>, <span class="t-str">"Kafka"</span>, <span class="t-str">"Grafana"</span><span class="t-bracket">]</span>,
  <span class="t-key">"track"</span>: <span class="t-str">"${escapeHtml(dict.terminal_json_track)}"</span>,
  <span class="t-key">"status"</span>: <span class="t-str t-highlight">"${escapeHtml(dict.terminal_json_status)}"</span>
<span class="t-bracket">}</span>`
        };
    }

    function renderTerminalView(view, customCmd, customHtml) {
        activeTerminalView = view;
        const payload = customHtml
            ? { cmd: customCmd, html: customHtml }
            : getTerminalViewPayload(view, currentLang);

        if (terminalActiveCmd) terminalActiveCmd.textContent = payload.cmd;
        if (terminalOutputCode) terminalOutputCode.innerHTML = payload.html;

        terminalTabs.forEach((tab) => {
            const isSelected = tab.getAttribute('data-terminal-view') === view;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
        });
    }

    terminalTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const view = tab.getAttribute('data-terminal-view') || 'profile';
            renderTerminalView(view);
        });
    });

    if (terminalForm && terminalInput) {
        terminalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const raw = terminalInput.value.trim();
            if (!raw) return;

            const normalized = raw.toLowerCase();
            terminalInput.value = '';

            if (normalized === 'profile' || normalized === 'cat profile.json') {
                renderTerminalView('profile');
            } else if (normalized === 'stack' || normalized.startsWith('stack ')) {
                renderTerminalView('stack');
            } else if (normalized === 'sla' || normalized === 'metrics') {
                renderTerminalView('sla');
            } else if (normalized === 'contact' || normalized === 'cat contact.json') {
                renderTerminalView('contact');
            } else if (normalized === 'whoami') {
                renderTerminalView('whoami');
            } else if (normalized === 'help' || normalized === '?') {
                renderTerminalView('help');
            } else if (normalized === 'clear') {
                renderTerminalView('profile');
            } else if (normalized === 'theme') {
                const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
                safeStorage.set('theme', nextTheme);
                applyTheme(nextTheme);
                renderTerminalView('profile');
            } else if (normalized === 'lang') {
                const nextLang = currentLang === 'es' ? 'en' : 'es';
                safeStorage.set('lang', nextLang);
                applyLanguage(nextLang);
            } else {
                const dict = translations[currentLang] || translations.es;
                renderTerminalView(
                    'custom',
                    raw,
                    `<span class="t-muted">${escapeHtml(dict.terminal_unknown_cmd)}</span>`
                );
            }
        });
    }

    // --- 3. Language & i18n Management ---
    function applyLanguage(lang) {
        const dict = translations[lang];
        if (!dict) return;

        currentLang = lang;
        document.documentElement.setAttribute('lang', lang);

        if (dict.page_title) {
            document.title = dict.page_title;
        }
        if (metaDescription && dict.page_description) {
            metaDescription.setAttribute('content', dict.page_description);
        }

        if (langToggleBtn) {
            langToggleBtn.textContent = lang === 'es' ? 'EN' : 'ES';
            langToggleBtn.setAttribute('aria-label', dict.lang_toggle_label);
        }

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });

        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key]) el.setAttribute('aria-label', dict[key]);
        });

        document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            const key = el.getAttribute('data-i18n-alt');
            if (dict[key]) el.setAttribute('alt', dict[key]);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });

        applyTheme(currentTheme);
        updateMobileMenuAria();
        renderTerminalView(activeTerminalView === 'custom' ? 'profile' : activeTerminalView);
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'es' ? 'en' : 'es';
            safeStorage.set('lang', nextLang);
            applyLanguage(nextLang);
        });
    }

    // --- 4. Accessible Mobile Navigation ---
    function isMobileMenuOpen() {
        return Boolean(mobileNavDrawer && !mobileNavDrawer.hidden);
    }

    function updateMobileMenuAria() {
        if (!mobileMenuToggle) return;
        const dict = translations[currentLang] || translations.es;
        const open = isMobileMenuOpen();
        mobileMenuToggle.setAttribute('aria-expanded', String(open));
        mobileMenuToggle.setAttribute('aria-label', open ? dict.menu_close_label : dict.menu_open_label);
        setSvgUseHref(mobileMenuToggle, open ? '#icon-close' : '#icon-menu');
    }

    function closeMobileMenu() {
        if (!mobileNavDrawer) return;
        mobileNavDrawer.hidden = true;
        updateMobileMenuAria();
    }

    function openMobileMenu() {
        if (!mobileNavDrawer) return;
        mobileNavDrawer.hidden = false;
        updateMobileMenuAria();
    }

    if (mobileMenuToggle && mobileNavDrawer) {
        mobileMenuToggle.addEventListener('click', () => {
            if (isMobileMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileNavDrawer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMobileMenuOpen()) {
                closeMobileMenu();
                mobileMenuToggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (
                isMobileMenuOpen() &&
                !mobileNavDrawer.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)
            ) {
                closeMobileMenu();
            }
        });

        const desktopMedia = window.matchMedia ? window.matchMedia('(min-width: 769px)') : null;
        addMediaChangeListener(desktopMedia, (e) => {
            if (e.matches && isMobileMenuOpen()) {
                closeMobileMenu();
            }
        });
    }

    // --- 5. Skills Category Filter ---
    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter') || 'all';

            filterButtons.forEach((other) => {
                const active = other === btn;
                other.classList.toggle('active', active);
                other.setAttribute('aria-pressed', String(active));
            });

            skillCategories.forEach((cat) => {
                const category = cat.getAttribute('data-category');
                cat.hidden = filter !== 'all' && category !== filter;
            });
        });
    });

    // --- 6. Scroll Reveal & Accessible ScrollSpy ---
    const revealElements = document.querySelectorAll('.reveal');
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-nav-drawer a');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

        revealElements.forEach((el) => revealObserver.observe(el));

        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute('id');
                allNavLinks.forEach((link) => {
                    const isMatch = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', isMatch);
                    if (isMatch) {
                        link.setAttribute('aria-current', 'location');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-25% 0px -65% 0px' });

        sections.forEach((sec) => spyObserver.observe(sec));
    } else {
        revealElements.forEach((el) => el.classList.add('revealed'));
    }

    // --- 7. Back to Top & Print ---
    if (backToTopBtn) {
        const toggleBackToTop = () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 360);
        };
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        toggleBackToTop();

        backToTopBtn.addEventListener('click', () => {
            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
    }

    if (printProfileBtn) {
        printProfileBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // --- 8. Toast & Resilient Clipboard ---
    function showToast(message) {
        if (!toast || !toastMessage) return;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    copyEmailBtns.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = btn.getAttribute('data-email') || 'contacto@fuentealba.dev';
            const dict = translations[currentLang] || translations.es;
            try {
                await copyToClipboard(email);
                showToast(dict.hero_email_copied);
            } catch {
                window.location.href = `mailto:${email}`;
            }
        });
    });

    if (terminalCopyBtn && terminalOutputCode) {
        terminalCopyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const dict = translations[currentLang] || translations.es;
            const textToCopy = terminalOutputCode.textContent || '';

            try {
                await copyToClipboard(textToCopy);
                terminalCopyBtn.classList.add('copied');
                const copyTextSpan = terminalCopyBtn.querySelector('.copy-text');
                if (copyTextSpan) copyTextSpan.textContent = dict.terminal_copied_feedback;
                setSvgUseHref(terminalCopyBtn, '#icon-check');
                showToast(dict.terminal_copied_feedback);

                if (copyBtnTimeout) clearTimeout(copyBtnTimeout);
                copyBtnTimeout = setTimeout(() => {
                    terminalCopyBtn.classList.remove('copied');
                    if (copyTextSpan) copyTextSpan.textContent = (translations[currentLang] || translations.es).terminal_copy_btn;
                    setSvgUseHref(terminalCopyBtn, '#icon-copy');
                }, 2000);
            } catch {
                showToast(dict.copy_error);
            }
        });
    }

    // --- 9. Initial Render ---
    applyLanguage(currentLang);
    if (yearSpan) {
        yearSpan.textContent = String(new Date().getFullYear());
    }
});
