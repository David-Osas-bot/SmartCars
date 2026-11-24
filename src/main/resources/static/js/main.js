(() => {
    'use strict';

    const $ = (selector) => document.querySelector(selector);

    const store = {
        get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
        set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
    };

    /* ---------- Nav data (swap for a fetch('/api/...') when your backend is ready) ---------- */
    const NAV = {
        totalCars: 16,
        categories: [
            { name: 'SUVs', slug: 'suvs', count: 4 },
            { name: 'Sedans', slug: 'sedans', count: 1 },
            { name: 'Coupes', slug: 'coupes', count: 2 },
            { name: 'Luxury', slug: 'luxury', count: 2 },
            { name: 'Electric', slug: 'electric', count: 2 },
            { name: 'Pickups', slug: 'pickups', count: 2 },
            { name: 'Convertibles', slug: 'convertibles', count: 2 },
            { name: 'Used & Certified', slug: 'certified', count: 1 },
        ],
        brands: [
            'Mercedes-Benz', 'BMW', 'Toyota', 'Lexus', 'Porsche',
            'Range Rover', 'Tesla', 'Audi', 'Ford', 'Aston Martin',
        ],
    };

    const categoryCard = ({ name, slug, count }) => `
    <li>
      <a href="/cars?category=${slug}" class="flex items-center gap-4 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-900">
        <img src="/images/categories/${slug}.jpg" alt="" loading="lazy" width="64" height="48"
             class="h-12 w-16 shrink-0 rounded-md bg-neutral-200 object-cover grayscale dark:bg-neutral-800"
             onerror="this.style.visibility='hidden'" />
        <span class="flex-1 leading-tight">${name}</span>
        <span class="text-sm text-neutral-500">${count}</span>
      </a>
    </li>`;

    const categoryRow = ({ name, slug, count }) => `
    <li>
      <a href="/cars?category=${slug}" class="flex items-center justify-between py-2.5 text-base">
        <span>${name}</span><span class="text-sm text-neutral-500">${count}</span>
      </a>
    </li>`;

    const brandLink = (brand) => `
    <li><a href="/cars?brand=${encodeURIComponent(brand)}" class="block rounded-lg px-2 py-2 text-[15px] transition hover:bg-neutral-100 dark:hover:bg-neutral-900">${brand}</a></li>`;

    const brandChip = (brand) => `
    <li><a href="/cars?brand=${encodeURIComponent(brand)}" class="block rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm dark:border-neutral-800">${brand}</a></li>`;

    const arrow = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const viewAllLabel = `View all ${NAV.totalCars} cars ${arrow}`;

    const fill = (selector, html) => { const el = $(selector); if (el) el.innerHTML = html; };
    fill('#megaCategories', NAV.categories.map(categoryCard).join(''));
    fill('#megaBrands', NAV.brands.map(brandLink).join(''));
    fill('#megaViewAll', viewAllLabel);
    fill('#mobileCategories', NAV.categories.map(categoryRow).join(''));
    fill('#mobileBrands', NAV.brands.map(brandChip).join(''));
    fill('#mobileViewAll', viewAllLabel);

    /* ---------- Theme ---------- */
    const root = document.documentElement;
    if (store.get('theme') === 'dark') root.classList.add('dark');

    const toggleTheme = () => {
        root.classList.toggle('dark');
        store.set('theme', root.classList.contains('dark') ? 'dark' : 'light');
    };
    $('#themeBtn')?.addEventListener('click', toggleTheme);
    $('#themeBtnMobile')?.addEventListener('click', toggleTheme);

    /* ---------- Header shadow on scroll ---------- */
    const header = $('#header');
    if (header) {
        const onScroll = () => header.classList.toggle('shadow-md', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Desktop mega menu (hover on mouse devices, click everywhere) ---------- */
    const shopMenu = $('#shopMenu');
    const shopBtn = $('#shopBtn');
    const megaPanel = $('#megaPanel');
    const chevron = $('#shopChevron');
    let closeTimer;

    const setMega = (open) => {
        clearTimeout(closeTimer);
        shopBtn.setAttribute('aria-expanded', String(open));
        megaPanel.classList.toggle('invisible', !open);
        megaPanel.classList.toggle('opacity-0', !open);
        megaPanel.classList.toggle('translate-y-1', !open);
        chevron?.classList.toggle('rotate-180', open);
    };

    if (shopMenu && shopBtn && megaPanel) {
        const canHover = window.matchMedia('(hover: hover)');

        shopBtn.addEventListener('click', () => setMega(shopBtn.getAttribute('aria-expanded') !== 'true'));
        shopMenu.addEventListener('mouseenter', () => { if (canHover.matches) setMega(true); });
        shopMenu.addEventListener('mouseleave', () => {
            if (canHover.matches) closeTimer = setTimeout(() => setMega(false), 150);
        });
        document.addEventListener('click', (e) => { if (!shopMenu.contains(e.target)) setMega(false); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && shopBtn.getAttribute('aria-expanded') === 'true') {
                setMega(false);
                shopBtn.focus();
            }
        });
    }

    /* ---------- Mobile drawer ---------- */
    const drawer = $('#drawer');
    const menuBtn = $('#menuBtn');
    const drawerClose = $('#drawerClose');

    const setDrawer = (open) => {
        drawer.dataset.open = String(open);
        drawer.setAttribute('aria-hidden', String(!open));
        menuBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('overflow-hidden', open);
        (open ? drawerClose : menuBtn).focus({ preventScroll: true });
    };

    if (drawer && menuBtn) {
        menuBtn.addEventListener('click', () => setDrawer(true));
        drawerClose?.addEventListener('click', () => setDrawer(false));
        $('#drawerOverlay')?.addEventListener('click', () => setDrawer(false));
        drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.dataset.open === 'true') setDrawer(false);
        });
        // Close automatically if the window grows past the mobile breakpoint
        window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
            if (e.matches && drawer.dataset.open === 'true') setDrawer(false);
        });
    }

    // Shop accordion inside the drawer
    const mobileShopBtn = $('#mobileShopBtn');
    mobileShopBtn?.addEventListener('click', () => {
        const open = mobileShopBtn.getAttribute('aria-expanded') !== 'true';
        mobileShopBtn.setAttribute('aria-expanded', String(open));
        $('#mobileShop').classList.toggle('hidden', !open);
        $('#mobileShopChevron').classList.toggle('rotate-180', open);
    });

    /* ---------- "/" focuses desktop search ---------- */
    document.addEventListener('keydown', (e) => {
        const typing = /input|textarea|select/i.test(document.activeElement.tagName);
        const search = $('#search');
        if (e.key === '/' && !typing && search && search.offsetParent !== null) {
            e.preventDefault();
            search.focus();
        }
    });

    /* ---------- Cookie consent ---------- */
    const cookie = $('#cookie');
    if (cookie) {
        if (!store.get('cookie-consent')) {
            setTimeout(() => {
                cookie.classList.remove('hidden');
                requestAnimationFrame(() => cookie.classList.remove('translate-y-6', 'opacity-0'));
            }, 1200);
        }

        cookie.addEventListener('click', (e) => {
            const choice = e.target.closest('[data-consent]')?.dataset.consent;
            if (!choice) return;
            store.set('cookie-consent', choice);
            cookie.classList.add('translate-y-6', 'opacity-0');
            setTimeout(() => cookie.classList.add('hidden'), 500);
        });
    }
})();


/* ---------- Search config (swap for fetch('/api/...') later) ---------- */
const SEARCH = {
    prices: [
        { label: 'Under ₦20M', value: '0-20000000' },
        { label: '₦20M – ₦50M', value: '20000000-50000000' },
        { label: '₦50M – ₦100M', value: '50000000-100000000' },
        { label: '₦100M+', value: '100000000-' },
    ],
    firstYear: 2015,
};

/* ---------- Search form ---------- */
const option = (value, label = value) => `<option value="${value}">${label}</option>`;

const years = Array.from(
    { length: new Date().getFullYear() - SEARCH.firstYear + 1 },
    (_, i) => new Date().getFullYear() - i
);

const appendOptions = (selector, html) => $(selector)?.insertAdjacentHTML('beforeend', html);
appendOptions('#searchBrand', NAV.brands.map((b) => option(b)).join(''));
appendOptions('#searchPrice', SEARCH.prices.map(({ value, label }) => option(value, label)).join(''));
appendOptions('#searchYear', years.map((y) => option(y)).join(''));

// Build a clean URL: skip empty fields so we get /cars?brand=BMW instead of /cars?brand=&model=...
$('#searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    new FormData(e.currentTarget).forEach((value, key) => {
        const v = String(value).trim();
        if (v) params.set(key, v);
    });
    const query = params.toString();
    window.location.href = query ? `/cars?${query}` : '/cars';
});