let currentLang = localStorage.getItem('lux_lang') || 'en';
let translations = {};

function getPathPrefix() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return '';

    const last = segments[segments.length - 1];
    const depth = last.includes('.') ? segments.length - 1 : segments.length;
    return '../'.repeat(depth);
}

function getNavConfig(prefix) {
    return [
        {
            key: 'discover',
            label: 'Discover',
            href: `${prefix}discover/index.html`,
            subs: [
                { label: 'Regions', href: `${prefix}discover/regions/index.html` },
                { label: 'Lifestyle', href: `${prefix}discover/lifestyle/index.html` },
                { label: 'Experiences', href: `${prefix}discover/experiences/index.html` }
            ]
        },
        {
            key: 'properties',
            label: 'Properties',
            href: `${prefix}properties/index.html`,
            subs: [
                { label: 'Featured Homes', href: `${prefix}properties/featured-homes/index.html` },
                { label: 'Selected Opportunities', href: `${prefix}properties/selected-opportunities/index.html` }
            ]
        },
        {
            key: 'insights',
            label: 'Insights',
            href: `${prefix}insights/index.html`,
            subs: [
                { label: 'Market Insights', href: `${prefix}insights/market-insights/index.html` },
                { label: 'Reports', href: `${prefix}insights/reports/index.html` },
                { label: 'Articles', href: `${prefix}insights/articles/index.html` }
            ]
        },
        {
            key: 'access',
            label: 'Access',
            href: `${prefix}access/index.html`,
            subs: [
                { label: 'Off Market Opportunities', href: `${prefix}access/off-market/index.html` },
                { label: 'Private Introductions', href: `${prefix}access/private-introductions/index.html` }
            ]
        },
        {
            key: 'about',
            label: 'About',
            href: `${prefix}about/index.html`,
            subs: [
                { label: 'Concept', href: `${prefix}about/concept.html` },
                { label: 'Process', href: `${prefix}about/process/index.html` }
            ]
        },
        {
            key: 'contact',
            label: 'Contact',
            href: `${prefix}contact/index.html`,
            subs: [
                { label: 'Contact page', href: `${prefix}contact/index.html` }
            ]
        }
    ];
}

function normalizeNavigationStructure() {
    const prefix = getPathPrefix();
    const config = getNavConfig(prefix);

    // Desktop centered nav variant
    const center = document.querySelector('.nav-links-center');
    if (center) {
        center.querySelectorAll(':scope > a.nav-link').forEach(a => {
            if (a.textContent.trim().toLowerCase() === 'contact') a.remove();
        });

        const existingItems = Array.from(center.querySelectorAll(':scope > .nav-item'));
        while (existingItems.length < config.length) {
            const item = document.createElement('div');
            item.className = 'nav-item';
            center.appendChild(item);
            existingItems.push(item);
        }
        existingItems.slice(config.length).forEach(item => item.remove());

        const items = center.querySelectorAll(':scope > .nav-item');
        config.forEach((entry, idx) => {
            const item = items[idx];

            let topLink = item.querySelector(':scope > a');
            if (!topLink) {
                topLink = document.createElement('a');
                topLink.className = 'nav-link';
                item.insertBefore(topLink, item.firstChild);
            }
            topLink.href = entry.href;
            topLink.textContent = entry.label;

            let menu = item.querySelector(':scope > .dropdown-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'dropdown-menu';
                item.appendChild(menu);
            }
            menu.innerHTML = entry.subs.map(sub => `<a href="${sub.href}">${sub.label}</a>`).join('');
        });
    }

    // Desktop legacy nav variant
    const legacy = document.querySelector('.nav-links');
    if (legacy) {
        const existingItems = Array.from(legacy.querySelectorAll(':scope > .nav-item'));
        while (existingItems.length < config.length) {
            const item = document.createElement('div');
            item.className = 'nav-item';
            legacy.appendChild(item);
            existingItems.push(item);
        }
        existingItems.slice(config.length).forEach(item => item.remove());

        const items = legacy.querySelectorAll(':scope > .nav-item');
        config.forEach((entry, idx) => {
            const item = items[idx];

            let topLink = item.querySelector(':scope > a');
            if (!topLink) {
                topLink = document.createElement('a');
                item.insertBefore(topLink, item.firstChild);
            }
            topLink.href = entry.href;
            topLink.textContent = entry.label;

            let menu = item.querySelector(':scope > .dropdown-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'dropdown-menu';
                item.appendChild(menu);
            }
            menu.innerHTML = entry.subs.map(sub => `<a href="${sub.href}">${sub.label}</a>`).join('');
        });
    }

    // Desktop right contact action
    document.querySelectorAll('.nav-actions-right .nav-cta, .nav-right .nav-cta').forEach(a => {
        a.href = `${prefix}contact/index.html`;
        a.textContent = 'Contact';
    });

    // Mobile overlay structure
    const mobileLinks = document.querySelector('.mobile-nav-links');
    if (mobileLinks) {
        const blocks = config.map(entry => `
            <div class="mobile-accordion-item">
                <button class="mobile-accordion-trigger"><span>${entry.label}</span></button>
                <div class="mobile-accordion-content">
                    ${entry.subs.map(sub => `<a href="${sub.href}" class="mobile-sub-link">${sub.label}</a>`).join('')}
                </div>
            </div>
        `).join('');
        mobileLinks.innerHTML = blocks;
    }

    // Legacy mobile drawer structure
    const drawerLinks = document.querySelector('.drawer-links');
    if (drawerLinks) {
        const blocks = config.map(entry => `
            <div class="drawer-accordion">
                <button class="drawer-accordion-btn" aria-expanded="false" aria-controls="${entry.key}-submenu">
                    <span>${entry.label}</span>
                    <span class="chevron"></span>
                </button>
                <div class="drawer-submenu" id="${entry.key}-submenu">
                    <div class="drawer-submenu-inner">
                        ${entry.subs.map(sub => `<a href="${sub.href}">${sub.label}</a>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        drawerLinks.innerHTML = blocks;
    }
}

// Load translations
async function loadTranslations() {
    try {
        const prefix = getPathPrefix();
        const response = await fetch(prefix + 'translations.json');
        translations = await response.json();
        updateContent();

        setupDrawer();

        // Page specific initializations
        const path = window.location.pathname;
        const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '' || (!path.includes('.html') && !path.includes('/about/') && !path.includes('/process/') && !path.includes('/region/'));

        if (path.includes('services.html')) populateServices();
        if (path.includes('future-regions.html') || isHome) {
            populateFutureRegions();
        }
        if (isHome) {
            populateOpportunityList();
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Update i18n content
function updateContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getTranslation(key);
        if (text) {
            if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('#')) {
                // Keep anchor text if needed, but usually we just set innerText
                el.textContent = text;
            } else {
                el.textContent = text;
            }
        }
    });

    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = getTranslation(key);
        if (text) el.placeholder = text;
    });

    // Update document title and lang
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

    // Update head title
    const metaTitle = getTranslation('meta.title');
    if (metaTitle) document.title = metaTitle;

    // Update active state on lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getTranslation(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], translations[currentLang]);
}

// Populate Services Grid
function populateServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const items = getTranslation('services.items');
    if (!items) return;

    grid.innerHTML = items.map(item => `
        <div class="service-card">
            <h3 class="service-card-title">${item.title}</h3>
            <p class="service-card-text">${item.text}</p>
        </div>
    `).join('');
}

// Populate Opportunity List
function populateOpportunityList() {
    const listContainer = document.getElementById('opportunity-list');
    if (!listContainer) return;

    const listItems = getTranslation('opportunity.list');
    if (!listItems) return;

    listContainer.innerHTML = listItems.map(item => `
        <div class="opportunity-item">
            <div class="opportunity-dot"></div>
            <span class="opportunity-text">${item}</span>
        </div>
    `).join('');
}

// Populate Future Regions
function populateFutureRegions() {
    const container = document.getElementById('future-regions-grid');
    if (!container) return;

    const regions = getTranslation('future_regions.regions');
    const soon = getTranslation('future_regions.soon');
    if (!regions) return;

    container.innerHTML = regions.map(region => `
        <div class="future-region-card">
            <div class="future-region-badge">${soon}</div>
            <h3 class="future-region-name">${region}</h3>
        </div>
    `).join('');

    // Add hover effects
    const cards = container.querySelectorAll('div');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (card.querySelector('h3')) {
                card.style.borderColor = 'var(--color-terracotta)';
                card.style.transform = 'translateY(-10px)';
            }
        });
        card.addEventListener('mouseleave', () => {
            if (card.querySelector('h3')) {
                card.style.borderColor = 'rgba(0,0,0,0.03)';
                card.style.transform = 'translateY(0)';
            }
        });
    });
}

// Search Logic
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');

    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    const results = [];

    function searchInObj(obj, currentPath = '') {
        for (let key in obj) {
            const path = currentPath ? `${currentPath}.${key}` : key;
            if (typeof obj[key] === 'string') {
                if (obj[key].toLowerCase().includes(query)) {
                    const sectionId = path.split('.')[0];
                    if (['process', 'marche', 'properties', 'about', 'opportunity', 'future_regions', 'tours', 'services', 'lifestyle', 'market_insights', 'concept', 'contact'].includes(sectionId)) {
                        results.push({
                            sectionId,
                            title: getTranslation(`${sectionId}.title`) || sectionId.toUpperCase().replace('_', ' '),
                            snippet: obj[key]
                        });
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                searchInObj(obj[key], path);
            }
        }
    }

    searchInObj(translations[currentLang]);

    const uniqueResults = Array.from(new Map(results.map(item => [item['sectionId'], item])).values());

    if (uniqueResults.length > 0) {
        resultsContainer.innerHTML = uniqueResults.map(r => `
            <div class="search-result-item" onclick="navigateToPage('${r.sectionId}')">
                <div style="font-weight: 600; font-size: 14px; color: var(--color-navy); margin-bottom: 5px;">${r.title}</div>
                <div style="font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.snippet}</div>
            </div>
        `).join('');
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.innerHTML = `<div style="padding: 20px; font-size: 13px; color: #888;">${getTranslation('search.no_results')} "${query}"</div>`;
        resultsContainer.style.display = 'block';
    }
}

function navigateToPage(id) {
    const prefix = getPathPrefix();

    const pageMap = {
        'process': prefix + 'about/process/index.html',
        'tours': prefix + 'discover/experiences/index.html',
        'services': prefix + 'access/off-market/index.html',
        'marche': prefix + 'discover/index.html',
        'lifestyle': prefix + 'discover/lifestyle/index.html',
        'market_insights': prefix + 'insights/market-insights/index.html',
        'future_regions': prefix + 'discover/regions/index.html',
        'properties': prefix + 'properties/index.html',
        'about': prefix + 'about/index.html',
        'concept': prefix + 'about/concept.html',
        'contact': prefix + 'contact/index.html',
        'opportunity': prefix + 'index.html#opportunity'
    };
    window.location.href = pageMap[id] || (prefix + id + '.html');
}

function setupDrawer() {
    const burger = document.getElementById('burger-trigger');
    const overlay = document.getElementById('nav-overlay'); // New mobile overlay
    const legacyDrawer = document.getElementById('nav-drawer'); // Legacy process/region templates
    const legacyOverlay = document.getElementById('drawer-overlay');
    const closeBtn = document.getElementById('drawer-close');
    const links = document.querySelectorAll('.mobile-nav-links a, .drawer-links a');

    if (!burger || (!overlay && !legacyDrawer)) return;

    // Re-introduce a minimal mobile footer strip for overlay templates.
    if (overlay && !overlay.querySelector('.mobile-menu-footer')) {
        const footer = document.createElement('div');
        footer.className = 'mobile-menu-footer';
        footer.innerHTML = `
            <div class="mobile-menu-footer-links">
                <a href="https://instagram.com/lux.residency" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="#">LinkedIn</a>
            </div>
            <p>&copy; 2026 LUX ITALIA</p>
        `;
        overlay.appendChild(footer);
    }

    function toggleDrawer() {
        let isOpen = false;

        if (overlay) {
            isOpen = overlay.classList.toggle('is-open');
        } else if (legacyDrawer) {
            isOpen = legacyDrawer.classList.toggle('active');
            if (legacyOverlay) legacyOverlay.classList.toggle('active', isOpen);
        }

        burger.classList.toggle('burger-active');
        document.body.classList.toggle('menu-open', isOpen);
    }

    burger.addEventListener('click', toggleDrawer);
    if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);

    links.forEach(link => {
        link.addEventListener('click', () => {
            const modernOpen = overlay && overlay.classList.contains('is-open');
            const legacyOpen = legacyDrawer && legacyDrawer.classList.contains('active');
            if (modernOpen || legacyOpen) toggleDrawer();
        });
    });

    // Mobile Accordion logic
    const triggerScope = overlay || legacyDrawer;
    const triggers = triggerScope ? triggerScope.querySelectorAll('.mobile-accordion-trigger, .drawer-accordion-btn') : [];
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isLegacyTrigger = trigger.classList.contains('drawer-accordion-btn');

            if (isLegacyTrigger) {
                const expanded = trigger.getAttribute('aria-expanded') === 'true';
                const all = legacyDrawer ? legacyDrawer.querySelectorAll('.drawer-accordion-btn') : [];
                all.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
                trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                return;
            }

            const item = trigger.closest('.mobile-accordion-item');
            if (!item || !overlay) return;

            const isActive = item.classList.contains('active');
            overlay.querySelectorAll('.mobile-accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            if (!isActive) item.classList.add('active');
        });
    });

    // Simple "Drag" (Swipe) to close
    let touchStartX = 0;
    const touchScope = overlay || legacyDrawer;
    if (!touchScope) return;

    touchScope.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    touchScope.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX > touchStartX + 60) { // Swiped right
            const modernOpen = overlay && overlay.classList.contains('is-open');
            const legacyOpen = legacyDrawer && legacyDrawer.classList.contains('active');
            if (!modernOpen && !legacyOpen) return;
            toggleDrawer();
        }
    }, { passive: true });
}

function setupDesktopDropdowns() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;

    const navItems = document.querySelectorAll('#main-nav .nav-item');
    let closeTimer = null;

    function closeAll() {
        navItems.forEach(item => item.classList.remove('open'));
    }

    navItems.forEach(item => {
        const trigger = item.querySelector(':scope > a');
        const menu = item.querySelector(':scope > .dropdown-menu');
        if (!trigger || !menu) return;

        item.addEventListener('mouseenter', () => {
            if (closeTimer) clearTimeout(closeTimer);
            closeAll();
            item.classList.add('open');
        });

        item.addEventListener('mouseleave', () => {
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = setTimeout(() => item.classList.remove('open'), 120);
        });

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = item.classList.contains('open');
            closeAll();
            if (!isOpen) item.classList.add('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav .nav-item')) closeAll();
    });
}

function setupImagePerformance() {
    const images = document.querySelectorAll('img');
    if (!images.length) return;

    images.forEach((img, index) => {
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

        // Keep the first visual image eager, lazy-load the rest.
        const inHero = !!img.closest('.hero');
        if (index === 0 || inHero) {
            if (!img.hasAttribute('loading')) img.setAttribute('loading', 'eager');
            if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'high');
            return;
        }

        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
}

function ensureBrandLogoDot() {
    const logos = document.querySelectorAll('.brand-logo');
    if (!logos.length) return;

    logos.forEach((logo) => {
        if (logo.querySelector('.logo-dot')) return;

        const base = (logo.textContent || '').trim().replace(/\.+$/, '');
        logo.textContent = base || 'LUX';

        const dot = document.createElement('span');
        dot.className = 'logo-dot';
        dot.textContent = '.';
        logo.appendChild(dot);
    });
}

function ensureFooterLegalLinks() {
    const footerCols = document.querySelectorAll('footer .footer-col');
    if (!footerCols.length) return;

    const targetCol = footerCols[footerCols.length - 1];
    if (!targetCol || targetCol.querySelector('.footer-legal-links')) return;

    const prefix = getPathPrefix();
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-legal-links';
    wrapper.innerHTML = `
        <a href="${prefix}legal/privacy-policy/index.html">Privacy Policy</a>
        <a href="${prefix}legal/cookie-policy/index.html">Cookie Policy</a>
        <a href="${prefix}legal/terms-of-use/index.html">Terms of Use</a>
    `;
    targetCol.appendChild(wrapper);
}

function initCookieConsent() {
    const CONSENT_KEY = 'lux_cookie_consent_v1';
    const existingConsent = localStorage.getItem(CONSENT_KEY);

    function saveConsent(consent) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            necessary: true,
            analytics: !!consent.analytics,
            updatedAt: new Date().toISOString()
        }));
    }

    function closeBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();
    }

    function closeModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) modal.remove();
    }

    function openPreferences() {
        closeModal();

        const current = existingConsent ? JSON.parse(existingConsent) : { analytics: false };
        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.className = 'cookie-preferences-modal';
        modal.innerHTML = `
            <div class="cookie-preferences-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title">
                <h3 id="cookie-preferences-title">Cookie preferences</h3>
                <div class="cookie-pref-group">
                    <div class="cookie-pref-head">
                        <strong>Necessary cookies</strong>
                        <span>Always active</span>
                    </div>
                    <p>Necessary cookies help the website function properly.</p>
                </div>
                <div class="cookie-pref-group">
                    <label class="cookie-pref-toggle" for="analytics-cookies-toggle">
                        <span>
                            <strong>Analytics cookies</strong>
                            <p>Analytics cookies help us understand how visitors interact with the site.</p>
                        </span>
                        <input id="analytics-cookies-toggle" type="checkbox" ${current.analytics ? 'checked' : ''} />
                    </label>
                </div>
                <div class="cookie-pref-actions">
                    <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-pref-cancel">Cancel</button>
                    <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-pref-save">Save preferences</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('#cookie-pref-cancel');
        const saveBtn = modal.querySelector('#cookie-pref-save');
        const analyticsToggle = modal.querySelector('#analytics-cookies-toggle');

        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                saveConsent({ analytics: !!analyticsToggle?.checked });
                closeModal();
                closeBanner();
            });
        }
    }

    if (existingConsent) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <p>This website uses cookies to improve the experience, analyse traffic and understand how visitors interact with the site.</p>
        <div class="cookie-banner-actions">
            <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept-all">Accept all</button>
            <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-reject">Reject</button>
            <button type="button" class="cookie-btn cookie-btn-link" id="cookie-preferences">Preferences</button>
        </div>
    `;

    document.body.appendChild(banner);

    const acceptBtn = banner.querySelector('#cookie-accept-all');
    const rejectBtn = banner.querySelector('#cookie-reject');
    const prefBtn = banner.querySelector('#cookie-preferences');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            saveConsent({ analytics: true });
            closeBanner();
        });
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            saveConsent({ analytics: false });
            closeBanner();
        });
    }
    if (prefBtn) {
        prefBtn.addEventListener('click', openPreferences);
    }
}

// UI Interactions
function setupUI() {
    function updateNavLogo() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavLogo);
    updateNavLogo(); // run on load too

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('lux_lang', currentLang);

            // Re-render current page
            updateContent();

            const path = window.location.pathname;
            if (path.includes('services.html')) populateServices();
            if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
                populateOpportunityList();
                populateFutureRegions();
            }
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            const results = document.getElementById('search-results');
            if (results) results.style.display = 'none';
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    normalizeNavigationStructure();
    ensureBrandLogoDot();
    loadTranslations();
    setupUI();
    setupDesktopDropdowns();
    setupImagePerformance();
    ensureFooterLegalLinks();
    initCookieConsent();
});
