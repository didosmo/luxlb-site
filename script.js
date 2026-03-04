let currentLang = localStorage.getItem('lux_lang') || 'en';
let translations = {};

// Load translations
async function loadTranslations() {
    try {
        const isSubfolder = window.location.pathname.includes('/about/') ||
            window.location.pathname.includes('/process/') ||
            window.location.pathname.includes('/region/');
        const prefix = isSubfolder ? '../' : '';
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
    const isSubfolder = window.location.pathname.includes('/about/') ||
        window.location.pathname.includes('/process/') ||
        window.location.pathname.includes('/region/');
    const prefix = isSubfolder ? '../' : '';

    const pageMap = {
        'process': prefix + 'process/index.html',
        'tours': prefix + 'process/tours.html',
        'services': prefix + 'process/services.html',
        'marche': prefix + 'region/marche.html',
        'lifestyle': prefix + 'region/lifestyle.html',
        'market_insights': prefix + 'region/market-insights.html',
        'future_regions': prefix + 'region/future-regions.html',
        'properties': prefix + 'properties.html',
        'about': prefix + 'about/index.html',
        'concept': prefix + 'about/concept.html',
        'contact': prefix + 'contact.html',
        'opportunity': prefix + 'index.html#opportunity'
    };
    window.location.href = pageMap[id] || (prefix + id + '.html');
}

function setupDrawer() {
    const burger = document.getElementById('burger-trigger');
    const overlay = document.getElementById('nav-overlay'); // New ID for isolated overlay
    const closeBtn = document.getElementById('drawer-close');
    const links = document.querySelectorAll('.mobile-nav-links a');

    if (!burger || !overlay) return;

    function toggleDrawer() {
        const isOpen = overlay.classList.toggle('is-open');
        burger.classList.toggle('burger-active');
        document.body.classList.toggle('menu-open', isOpen);
    }

    burger.addEventListener('click', toggleDrawer);
    if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (overlay.classList.contains('is-open')) toggleDrawer();
        });
    });

    // Mobile Accordion logic
    const triggers = overlay.querySelectorAll('.mobile-accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const item = trigger.closest('.mobile-accordion-item');
            const isActive = item.classList.contains('active');

            // Close other accordions
            overlay.querySelectorAll('.mobile-accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Simple "Drag" (Swipe) to close
    let touchStartX = 0;
    overlay.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    overlay.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX > touchStartX + 60) { // Swiped right
            toggleDrawer();
        }
    }, { passive: true });
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
    loadTranslations();
    setupUI();
});
