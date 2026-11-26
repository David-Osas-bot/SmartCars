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


    /* ---------- Body type cards ---------- */
// Visitors must have an account to buy, so every card goes to sign in.
// "next" tells the sign-in page where to send them afterwards.
    const ROUTES = { signIn: '/signin' };

    const authLink = (target) => `${ROUTES.signIn}?next=${encodeURIComponent(target)}`;

// category slug -> image file in /static/images/categories
    const CATEGORY_IMAGES = {
        suvs: 'car-suv',
        sedans: 'car-sedan',
        coupes: 'car-coupe',
        luxury: 'hero-car',
        electric: 'car-electric',
        pickups: 'car-pickup',
        convertibles: 'car-convertible',
        certified: 'car-sedan', // no dedicated file yet, reusing the sedan
    };

    const categoryImage = (slug) => `/images/categories/${CATEGORY_IMAGES[slug] ?? slug}.jpg`;

    const bodyTypeCard = ({ name, slug, count }) => `
    <li>
      <a href="${authLink(`/cars?category=${slug}`)}"
         class="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-neutral-800 dark:focus-visible:outline-white">

        <img src="${categoryImage(slug)}" alt="" loading="lazy"
             class="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105"
             onerror="this.style.display='none'" />

        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>

        <div class="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-5">
          <div>
            <h3 class="text-lg font-semibold leading-tight sm:text-xl">${name}</h3>
            <p class="mt-1 text-sm text-neutral-300">${count} available</p>
          </div>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 transition duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
            <svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </div>
      </a>
    </li>`;

    fill('#bodyTypes', NAV.categories.map(bodyTypeCard).join(''));

    /* ---------- New arrivals carousel ---------- */
    // Placeholder data (swap for fetch('/api/cars/new') when your backend is ready)
    const IMG_BASE = '/images/categories';
    const CARS = [
        { id: 1, brand: 'Aston Martin', year: 2024, name: 'Aston Martin DB12', trim: 'DB12 Coupe', rating: 5, reviews: 8, km: 150, fuel: 'Petrol', gearbox: 'Automatic', price: 298000000, city: 'Lagos', badge: 'New arrival', image: 'hero-car' },
        { id: 2, brand: 'Range Rover', year: 2024, name: 'Range Rover Autobiography', trim: 'Autobiography LWB', rating: 5, reviews: 36, km: 800, fuel: 'Hybrid', gearbox: 'Automatic', price: 245000000, city: 'Abuja', badge: 'New arrival', image: 'car-suv' },
        { id: 3, brand: 'Mercedes-Benz', year: 2024, name: 'Mercedes-Benz S 580', trim: 'S 580 4MATIC', rating: 5, reviews: 48, km: 1200, fuel: 'Petrol', gearbox: 'Automatic', price: 185000000, city: 'Lagos', badge: 'Best seller', image: 'car-sedan' },
        { id: 4, brand: 'BMW', year: 2024, name: 'BMW X7 M60i', trim: 'X7 M60i xDrive', rating: 5, reviews: 27, km: 900, fuel: 'Petrol', gearbox: 'Automatic', price: 162000000, city: 'Lagos', image: 'car-suv' },
        { id: 5, brand: 'Toyota', year: 2023, name: 'Toyota Land Cruiser', trim: 'LC300 VX', rating: 5, reviews: 52, km: 4200, fuel: 'Petrol', gearbox: 'Automatic', price: 142000000, city: 'Lagos', image: 'car-suv' },
        { id: 6, brand: 'Porsche', year: 2024, name: 'Porsche 911 Carrera', trim: '911 Carrera S', rating: 5, reviews: 14, km: 600, fuel: 'Petrol', gearbox: 'Automatic', price: 210000000, city: 'Abuja', badge: 'New arrival', image: 'car-coupe' },
        { id: 7, brand: 'Tesla', year: 2024, name: 'Tesla Model S', trim: 'Model S Plaid', rating: 4, reviews: 19, km: 1100, fuel: 'Electric', gearbox: 'Automatic', price: 120000000, city: 'Lagos', image: 'car-electric' },
        { id: 8, brand: 'Lexus', year: 2023, name: 'Lexus LX 600', trim: 'LX 600 Ultra Luxury', rating: 5, reviews: 31, km: 3500, fuel: 'Petrol', gearbox: 'Automatic', price: 175000000, city: 'Port Harcourt', image: 'car-suv' },
    ];

    const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

    // Icons (stroke style, same look as the rest of the site)
    const ICONS = {
        heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
        fuel: '<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
        gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
        pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        compare: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>',
    };

    const icon = (name, size = 'h-4 w-4') =>
        `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

    const stars = (rating) => `
        <span class="flex" role="img" aria-label="Rated ${rating} out of 5">
          ${Array.from({ length: 5 }, (_, i) => `
            <svg class="h-3.5 w-3.5 ${i < rating ? 'text-black dark:text-white' : 'text-neutral-300 dark:text-neutral-700'}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`).join('')}
        </span>`;

    // Public page: every action leads to sign in. On the dashboard, swap these links for real handlers.
    const carCard = (car, itemClass = '') => {
        const link = authLink(`/cars/${car.id}`);
        const spec = (name, text) => `<span class="flex items-center gap-1.5">${icon(name, 'h-3.5 w-3.5')}${text}</span>`;

        return `
    <li class="${itemClass}">
      <article class="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition duration-300 ease-out hover:-translate-y-1.5 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-xl hover:shadow-black/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:shadow-black/50">

        <div class="relative aspect-[3/2] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <a href="${link}" aria-label="View ${car.name}">
            <img src="${IMG_BASE}/${car.image}.jpg" alt="${car.name}" loading="lazy"
                 class="h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105"
                 onerror="this.style.display='none'" />
          </a>
          ${car.badge ? `<span class="absolute left-3 top-3 rounded bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-black">${car.badge}</span>` : ''}
          <a href="${link}" aria-label="Save ${car.name}"
             class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black transition hover:scale-105 hover:bg-white">
            ${icon('heart', 'h-[18px] w-[18px]')}
          </a>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <div class="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <span>${car.brand} · ${car.year}</span>
            <span class="flex items-center gap-1.5">${stars(car.rating)}<span>(${car.reviews})</span></span>
          </div>

          <h3 class="mt-3 text-lg font-semibold leading-tight"><a href="${link}">${car.name}</a></h3>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">${car.trim}</p>

          <div class="mt-4 flex items-center justify-between border-y border-neutral-200 py-3 text-[13px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            ${spec('gauge', `${car.km.toLocaleString('en-NG')} km`)}
            ${spec('fuel', car.fuel)}
            ${spec('gear', car.gearbox)}
          </div>

          <div class="mt-4 flex items-center justify-between">
            <p class="text-2xl font-semibold tracking-tight">${naira.format(car.price)}</p>
            <span class="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">${icon('pin', 'h-3.5 w-3.5')}${car.city}</span>
          </div>

          <div class="mt-4 grid grid-cols-5 gap-2">
            <a href="${link}" class="col-span-3 flex h-10 items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">Add to cart</a>
            <a href="${link}" class="col-span-2 flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-medium shadow-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900">${icon('compare')}Compare</a>
          </div>
        </div>
      </article>
    </li>`;
    };

    // Slide widths live here (not in carCard) so the Best sellers grid can reuse the same card
    const SLIDE = 'w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]';

    fill('#arrivalsTrack', CARS.map((car) => carCard(car, SLIDE)).join(''));
    // Arrow controls: move one card at a time, disable at either end
    const track = $('#arrivalsTrack');
    const prevBtn = $('#arrivalsPrev');
    const nextBtn = $('#arrivalsNext');

    if (track && prevBtn && nextBtn) {
        const updateArrows = () => {
            prevBtn.disabled = track.scrollLeft <= 1;
            nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
        };

        const slide = (direction) => {
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            const step = track.firstElementChild.offsetWidth + gap;
            track.scrollBy({ left: direction * step, behavior: 'smooth' });
        };

        prevBtn.addEventListener('click', () => slide(-1));
        nextBtn.addEventListener('click', () => slide(1));
        track.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        updateArrows();
    }

    /* ---------- Brand marquee ---------- */
    const marqueeItem = (brand) => `
    <li class="shrink-0 px-10 font-display text-3xl tracking-tight text-neutral-600 dark:text-neutral-400 md:text-4xl">${brand}</li>`;

    // Two identical groups: the second is hidden from screen readers and makes the loop seamless
        const marqueeGroup = (hidden = false) => `
        <ul class="flex shrink-0 items-center"${hidden ? ' aria-hidden="true"' : ''}>
          ${NAV.brands.map(marqueeItem).join('')}
        </ul>`;

    fill('#brandMarquee', marqueeGroup() + marqueeGroup(true));

    // Placeholder data (swap for fetch('/api/cars/best-sellers') when your backend is ready)
    const BEST_SELLERS = [
        { id: 9, brand: 'Toyota', year: 2022, name: 'Toyota Camry XSE', trim: 'Camry XSE V6', rating: 5, reviews: 124, km: 28400, fuel: 'Petrol', gearbox: 'Automatic', price: 38500000, city: 'Ibadan', badge: 'Best seller', image: 'car-sedan' },
        { id: 10, brand: 'Toyota', year: 2024, name: 'Toyota Hilux Legend', trim: 'Hilux Legend 4x4', rating: 5, reviews: 95, km: 0, fuel: 'Diesel', gearbox: 'Manual', price: 52500000, city: 'Kano', image: 'car-pickup' },
        { id: 11, brand: 'Toyota', year: 2024, name: 'Toyota Land Cruiser 300', trim: 'Land Cruiser VX', rating: 5, reviews: 88, km: 0, fuel: 'Diesel', gearbox: 'Automatic', price: 128000000, city: 'Port Harcourt', badge: 'Best seller', image: 'car-suv' },
        { id: 12, brand: 'Lexus', year: 2023, name: 'Lexus ES 350', trim: 'ES 350 F Sport', rating: 5, reviews: 66, km: 12000, fuel: 'Petrol', gearbox: 'Automatic', price: 54000000, city: 'Lagos', image: 'car-sedan' },
    ];

    fill('#bestSellersGrid', BEST_SELLERS.map((car) => carCard(car)).join(''));

    /* ---------- Why SmartCars + Owners speak ---------- */
    // Placeholder content (swap for real data or a CMS later)
    Object.assign(ICONS, {
        shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
        clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
        bank: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
        truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
        quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    });

    const WHY_POINTS = [
        { icon: 'shield', title: '12-month warranty', text: 'Every used and certified car is covered, extendable to 36 months.' },
        { icon: 'clipboard', title: '150-point inspection', text: 'Engine to upholstery, documented with a downloadable report.' },
        { icon: 'bank', title: 'Flexible financing', text: '12–60 month plans from leading banks, decisions in 48 hours.' },
        { icon: 'truck', title: 'Delivered to you', text: 'Nationwide delivery, 48 hours in Lagos and Abuja.' },
    ];

    const REVIEWS = [
        { name: 'Ngozi Eze', detail: 'Bought a Lexus LX 600', rating: 5, quote: 'The most transparent car purchase I’ve ever made. Every detail was documented before I paid a kobo.' },
        { name: 'Ibrahim Musa', detail: 'Bought a Toyota Land Cruiser', rating: 5, quote: 'Delivered to Abuja in 48 hours with a full tank and a handwritten note. That’s class.' },
        { name: 'Folake Adeyemi', detail: 'Traded in & upgraded', rating: 5, quote: 'Got a fair trade-in value instantly and drove away in a certified Camry the same week.' },
    ];

    // Cells are white on a tinted grid; the 1px gap between them draws the dividers
    const whyCard = ({ icon: name, title, text }) => `
    <li class="bg-white p-10 dark:bg-neutral-950">
      ${icon(name, 'h-7 w-7')}
      <h3 class="mt-8 text-[22px] font-semibold leading-tight tracking-tight">${title}</h3>
      <p class="mt-3 text-[17px] leading-7 text-neutral-600 dark:text-neutral-400">${text}</p>
    </li>`;

    const reviewCard = ({ name, detail, rating, quote }) => `
    <li class="flex flex-col rounded-xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
      ${icon('quote', 'h-7 w-7')}
      <blockquote class="mt-6 flex-1 font-display text-[1.75rem] leading-[1.45] tracking-tight">“${quote}”</blockquote>
      <footer class="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <div>
          <p class="font-semibold">${name}</p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">${detail}</p>
        </div>
        ${stars(rating)}
      </footer>
    </li>`;

    fill('#whyGrid', WHY_POINTS.map(whyCard).join(''));
    fill('#reviewsGrid', REVIEWS.map(reviewCard).join(''));


    /* ---------- FAQ + newsletter ---------- */
    Object.assign(ICONS, { chevron: '<path d="m6 9 6 6 6-6"/>' });

    // Placeholder copy: adjust to your real policies before launch
    const FAQS = [
        {
            q: 'Are all cars inspected before sale?',
            a: 'Yes. Every vehicle passes a 150-point inspection by certified engineers before it is listed, covering the engine, transmission, brakes, suspension, electrics, bodywork and interior. The full condition report is attached to each listing as a downloadable file, so you can see exactly what was checked, and what was repaired, before you commit.',
        },
        {
            q: 'Do you offer financing?',
            a: 'Yes. We partner with leading Nigerian banks to offer plans from 12 to 60 months with as little as 30% down. Use the payment calculator to estimate your monthly instalments, then submit a single application and expect a decision within 48 hours. The value of your trade-in can be applied toward your deposit.',
        },
        {
            q: 'How does delivery work?',
            a: 'We deliver nationwide within 2–7 working days, and deliveries in Lagos and Abuja are typically completed within 48 hours. Every car is cleaned, fuelled and checked before it leaves us, and you’ll receive tracking updates along the way. You inspect the car on arrival and confirm delivery once you’re happy with it.',
        },
        {
            q: 'Can I trade in my current car?',
            a: 'Absolutely. Submit your car’s details and photos for an instant estimate, then we confirm the final value at an in-person inspection. If you accept, the amount is deducted from the price of your new car or added to your deposit, and we can collect your old car when we deliver the new one.',
        },
        {
            q: 'What warranty do I get?',
            a: 'New cars carry the manufacturer’s warranty. Used and certified cars include a 12-month SmartCars warranty covering major mechanical and electrical components, extendable to 36 months. The full terms, exclusions and claims process are included in your purchase documents, and our support team can walk you through them.',
        },
        {
            q: 'Which payment methods are accepted?',
            a: 'We accept card payments, bank transfer, USSD and mobile money through Paystack, as well as direct bank financing. For high-value purchases we recommend bank transfer. Every payment is confirmed with an official receipt and invoice before delivery is scheduled.',
        },
        {
            q: 'Do I need an account to buy a car?',
            a: 'You can browse every listing without signing in. To save cars, compare models, add a car to your cart or place an order, you’ll need a free SmartCars account. It lets us verify your details, keep your documents and payments in one place, and track your order from purchase to delivery.',
        },
        {
            q: 'Can I see a car before I buy it?',
            a: 'Yes. You can book a viewing or request a video walkthrough from your account, and you’re welcome to bring your own mechanic. The inspection report is always available beforehand, so you know exactly what to look at when you see the car in person.',
        },
    ];

    // Each item: a button (question) + a collapsible panel (answer)
    const faqItem = ({ q, a }, i) => `
    <li data-open="false" class="group border-b border-neutral-200 dark:border-neutral-800">
      <h3>
        <button type="button" id="faqBtn${i}" aria-expanded="false" aria-controls="faqPanel${i}"
                class="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white">
          <span>${q}</span>
          ${icon('chevron', 'h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-300 group-data-[open=true]:rotate-180')}
        </button>
      </h3>
      <div id="faqPanel${i}" role="region" aria-labelledby="faqBtn${i}" inert
           class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-data-[open=true]:grid-rows-[1fr]">
        <div class="overflow-hidden">
          <p class="pb-6 pr-8 text-[17px] leading-7 text-neutral-600 dark:text-neutral-400">${a}</p>
        </div>
      </div>
    </li>`;

    const faqList = $('#faqList');
    fill('#faqList', FAQS.map(faqItem).join(''));

    const setFaq = (item, open) => {
        item.dataset.open = String(open);
        item.querySelector('button').setAttribute('aria-expanded', String(open));
        item.querySelector('[role="region"]').inert = !open;   // keeps closed answers out of tab order
    };

    // One open at a time; clicking the open one closes it
    faqList?.addEventListener('click', (e) => {
        const item = e.target.closest('li');
        if (!item || !e.target.closest('button')) return;
        const willOpen = item.dataset.open !== 'true';
        faqList.querySelectorAll('li').forEach((li) => setFaq(li, li === item && willOpen));
    });

    /* ---------- Newsletter forms (FAQ + footer) ---------- */
    document.querySelectorAll('[data-newsletter]').forEach((form) => {
        const message = form.querySelector('[data-newsletter-msg]');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = String(new FormData(form).get('email') ?? '').trim();
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            message.textContent = valid ? 'Thanks! You’re on the list.' : 'Please enter a valid email address.';
            message.dataset.error = String(!valid);
            message.classList.remove('hidden');
            if (valid) form.reset();
            // TODO: POST the email to your backend (e.g. /api/newsletter) here
        });
    });

    /* ---------- Footer ---------- */
    Object.assign(ICONS, {
        instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
        twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
        facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
        youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
        linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    });

    const FOOTER_LINKS = [
        { title: 'Shop', links: [
                { label: 'All cars', href: '/cars' },
                { label: 'Compare', href: '/compare' },
                { label: 'Financing', href: '/finance' },
                { label: 'Trade-in', href: '/trade-in' },
            ] },
        { title: 'Company', links: [
                { label: 'About SmartCars', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Careers', href: '/careers' },
                { label: 'Blog', href: '/blog' },
            ] },
        { title: 'Support', links: [
                { label: 'Help centre', href: '/help' },
                { label: 'FAQs', href: '/faq' },
                { label: 'Delivery &amp; returns', href: '/delivery' },
                { label: 'Privacy &amp; terms', href: '/privacy' },
            ] },
    ];

    const PAYMENT_METHODS = ['Paystack', 'Visa', 'Mastercard', 'Verve', 'USSD', 'Bank transfer'];

    // TODO: replace "#" with your real profile URLs
    const SOCIALS = [
        { name: 'Instagram', icon: 'instagram', href: '#' },
        { name: 'Twitter', icon: 'twitter', href: '#' },
        { name: 'Facebook', icon: 'facebook', href: '#' },
        { name: 'YouTube', icon: 'youtube', href: '#' },
        { name: 'LinkedIn', icon: 'linkedin', href: '#' },
    ];

    const footerColumn = ({ title, links }) => `
    <div>
      <h3 class="text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-500">${title}</h3>
      <ul class="mt-6 space-y-2">
        ${links.map(({ label, href }) => `
        <li><a href="${href}" class="text-[17px] leading-7 text-neutral-300 transition hover:text-white">${label}</a></li>`).join('')}
      </ul>
    </div>`;

    const paymentChip = (name) => `
    <li class="rounded border border-white/20 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-200">${name}</li>`;

    const socialLink = ({ name, icon: key, href }) => `
    <li>
      <a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${name}"
         class="block text-neutral-400 transition hover:text-white">${icon(key, 'h-5 w-5')}</a>
    </li>`;

    fill('#footerNav', FOOTER_LINKS.map(footerColumn).join(''));
    fill('#footerPayments', PAYMENT_METHODS.map(paymentChip).join(''));
    fill('#footerSocials', SOCIALS.map(socialLink).join(''));

    const footerYear = $('#footerYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
