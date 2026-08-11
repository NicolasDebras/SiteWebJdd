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
  const modalImage = document.getElementById('modalImage');
  const modalIcon  = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag   = document.getElementById('modalTag');
  const modalDuration = document.getElementById('modalDuration');
  const modalPrice = document.getElementById('modalPrice');
  const modalPriceRow = document.getElementById('modalPriceRow');
  const modalBody  = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
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
      modalImage.src = image;
      modalImage.alt = title ? title.textContent : '';
      modalImage.classList.add('show');
      modalIcon.style.display = 'none';
    } else {
      modalImage.classList.remove('show');
      modalImage.src = '';
      modalIcon.style.display = '';
    }

    modalIcon.innerHTML = icon ? icon.outerHTML : '';
    modalTitle.textContent = title ? title.textContent : '';
    modalTag.textContent = tag ? tag.textContent : '';
    modalTag.style.display = tag ? '' : 'none';
    modalBody.textContent = detail ? detail.textContent : '';

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

  document.querySelectorAll('.service-card[data-expandable]').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
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
const zoneMapEl = document.getElementById('zoneMap');
if (zoneMapEl && window.L) {
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
      formSuccess.classList.add('show');
    } catch {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
    }
  });
}
