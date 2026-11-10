// ─── NAVIGATION ───────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function updateNav() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

function openMenu() {
  hamburger.classList.add('open');
  navLinks.classList.add('open');
  navOverlay.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});
navOverlay.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ─── COPYRIGHT YEAR ───────────────────────────────────────
const copyrightYear = document.getElementById('copyrightYear');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

// ─── SCROLL FADE-IN ───────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => io.observe(el));
}

// ─── SERVICE CARD MODAL ────────────────────────────────────
const serviceModal = document.getElementById('serviceModal');
if (serviceModal) {
  const modalIcon  = document.getElementById('modalIcon');
  // L'image de la fenêtre n'existe pas dans le HTML (pas de <img> sans src) :
  // elle est créée à la première ouverture.
  let modalImage = null;
  function getModalImage() {
    if (!modalImage) {
      modalImage = document.createElement('img');
      modalImage.className = 'modal-image';
      modalImage.width = 440;
      modalImage.height = 603;
      modalIcon.parentNode.insertBefore(modalImage, modalIcon);
    }
    return modalImage;
  }
  const modalTitle = document.getElementById('modalTitle');
  const modalTag   = document.getElementById('modalTag');
  const modalDuration = document.getElementById('modalDuration');
  const modalPrice = document.getElementById('modalPrice');
  const modalPriceRow = document.getElementById('modalPriceRow');
  const modalBody  = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const modalLink  = document.getElementById('modalLink');
  let lastFocused = null;

  function openModal(card) {
    const icon     = card.querySelector('.service-icon svg');
    const title    = card.querySelector('h3');
    const tag      = card.querySelector('.service-tag');
    const duration = card.querySelector('.service-duration');
    const detail   = card.querySelector('.service-detail p');
    const image    = card.dataset.image;
    const price    = card.dataset.price;

    modalDuration.textContent = duration ? duration.textContent : '';
    modalDuration.style.display = duration ? '' : 'none';

    modalPrice.textContent = price || '';
    modalPriceRow.style.display = price ? '' : 'none';

    if (image) {
      const img = getModalImage();
      img.src = image;
      img.alt = '';
      img.classList.add('show');
      modalIcon.style.display = 'none';
    } else {
      if (modalImage) {
        modalImage.classList.remove('show');
        modalImage.removeAttribute('src');
      }
      modalIcon.style.display = '';
    }

    modalIcon.innerHTML = icon ? icon.outerHTML : '';
    modalTitle.textContent = title ? title.textContent : '';
    modalTag.textContent = tag ? tag.textContent : '';
    modalTag.style.display = tag ? '' : 'none';
    modalBody.textContent = detail ? detail.textContent : '';

    const pageLink = card.querySelector('a.service-toggle');
    if (modalLink) {
      modalLink.style.display = pageLink ? '' : 'none';
      if (pageLink) modalLink.href = pageLink.getAttribute('href');
    }

    lastFocused = document.activeElement;
    serviceModal.classList.add('open');
    serviceModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose.focus();
  }

  function closeModal() {
    serviceModal.classList.remove('open');
    serviceModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  // Clic sur la carte : aperçu dans la fenêtre. Le lien « Voir le détail » mène
  // directement à la page de la prestation (et reste accessible au clavier).
  document.querySelectorAll('.service-card[data-expandable]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      openModal(card);
    });
  });

  modalClose.addEventListener('click', closeModal);
  serviceModal.addEventListener('click', (e) => {
    if (e.target === serviceModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModal.classList.contains('open')) closeModal();
  });
}

// ─── ZONE MAP ─────────────────────────────────────────────
// Leaflet (CSS + JS) n'est chargé qu'à l'approche de la carte, pour ne pas
// bloquer l'affichage de la page.
const zoneMapEl = document.getElementById('zoneMap');
const LEAFLET = {
  css: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  cssSri: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
  js: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  jsSri: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
};

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET.css;
    link.integrity = LEAFLET.cssSri;
    link.crossOrigin = '';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = LEAFLET.js;
    script.integrity = LEAFLET.jsSri;
    script.crossOrigin = '';
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

if (zoneMapEl) {
  const startMap = () => loadLeaflet().then(initZoneMap).catch(() => {});
  if ('IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        mapObserver.disconnect();
        startMap();
      }
    }, { rootMargin: '300px 0px' });
    mapObserver.observe(zoneMapEl);
  } else {
    startMap();
  }
}

function initZoneMap() {
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const zoneCenter = [46.1897, -1.0742];
  const zoneMap = L.map(zoneMapEl, {
    scrollWheelZoom: false,
    zoomControl: true,
    dragging: !isSmallScreen,
    touchZoom: !isSmallScreen,
  }).setView(zoneCenter, 9);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(zoneMap);

  const zoneCircle = L.circle(zoneCenter, {
    radius: 15000,
    color: '#e5342b',
    weight: 2,
    fillColor: '#256f9a',
    fillOpacity: 0.12,
  }).addTo(zoneMap);

  L.marker(zoneCenter).addTo(zoneMap).bindPopup('Latitude Canine — Dompierre-sur-Mer');

  zoneMap.fitBounds(zoneCircle.getBounds(), { padding: [10, 10] });
}

// ─── CONTACT FORM ─────────────────────────────────────────
const form = document.getElementById('contactForm');
if (form) {
  const formWrap    = document.getElementById('formWrap');
  const formSuccess = document.getElementById('formSuccess');

  function validateField(field) {
    const errEl = document.getElementById(field.id + '-error');
    let msg = '';

    if (field.required && !field.value.trim()) {
      msg = 'Ce champ est obligatoire.';
    } else if (field.type === 'email' && field.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
        msg = 'Adresse email invalide.';
      }
    } else if (field.type === 'tel' && field.value.trim()) {
      if (!/^[\d\s\+\-\(\)\.]{6,20}$/.test(field.value.trim())) {
        msg = 'Numéro de téléphone invalide.';
      }
    }

    if (msg) {
      field.classList.add('is-error');
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
      return false;
    } else {
      field.classList.remove('is-error');
      if (errEl) errEl.classList.remove('show');
      return true;
    }
  }

  // Live validation on blur
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-error')) validateField(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('.form-control').forEach(field => {
      if (!validateField(field)) valid = false;
    });
    if (!valid) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours…';
    submitBtn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      const data = await res.json().catch(() => null);
      const failed = !res.ok || (data && (data.success === false || data.success === 'false'));

      if (failed) throw new Error(data && data.message ? data.message : 'Submission failed');

      formWrap.style.display = 'none';
      formSuccess.hidden = false;
      formSuccess.classList.add('show');
    } catch {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
    }
  });
}
