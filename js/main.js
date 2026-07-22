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

// ─── SCROLL FADE-IN ───────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => io.observe(el));
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

      if (res.ok) {
        formWrap.style.display = 'none';
        formSuccess.classList.add('show');
      } else {
        throw new Error();
      }
    } catch {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
    }
  });
}
