/* =============================================================
   EXPLORING ZAMBALES - script.js
   1. Settings you can edit   2. Navigation & smooth scroll
   3. Learn more button       4. Location photo carousel
   5. Contact form validation 6. Social links
   ============================================================= */

/* ---------- 1. Settings you can edit ---------- */

// Paste your official profile URLs here (full https:// links).
// Icons with an empty value stay visible but are not clickable.
const SOCIAL_LINKS = {
  google: '',
  facebook: '',
  instagram: ''
};

const MOBILE_BREAKPOINT = 767; // must match the mobile media query in style.css
const CAROUSEL_LOCK_MS = 500;  // matches the .5s fade in style.css; blocks rapid clicks
const SWIPE_THRESHOLD = 40;    // pixels a finger must travel to count as a swipe

/* ---------- 2. Navigation & smooth scroll ---------- */
const hamburger = document.getElementById('hamburger');
const siteNav = document.getElementById('site-nav');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setMenu(open) {
  hamburger.classList.toggle('open', open);
  siteNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
}

hamburger.addEventListener('click', () => setMenu(!siteNav.classList.contains('open')));

// Close the menu with Escape or when the window grows past mobile size
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > MOBILE_BREAKPOINT) setMenu(false); });

function scrollToTarget(id) {
  const target = document.querySelector(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

document.querySelectorAll('a[data-scroll]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTarget(link.getAttribute('href'));
    setMenu(false);
  });
});

/* ---------- 3. Learn more button ---------- */
// Takes the visitor on to the Location section.
document.getElementById('learn-more').addEventListener('click', () => scrollToTarget('#location'));

/* ---------- 4. Location carousel ---------- */
// Each location has a map, details and photo marked data-loc="0", "1", ...
// The up / down arrows, arrow keys and swipes change all three together.
// To add a location, add one more data-loc item to each of the three columns in index.html.
const gallery = document.getElementById('location-gallery');
const frame = document.getElementById('photo-frame');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');
const photoStatus = document.getElementById('photo-status');

const locItems = Array.from(gallery.querySelectorAll('[data-loc]'));
const totalLocations = new Set(locItems.map((el) => el.dataset.loc)).size;
let currentLocation = 0;
let locked = false;

function showLocation(index) {
  currentLocation = (index + totalLocations) % totalLocations; // wraps around
  locItems.forEach((el) => el.classList.toggle('active', Number(el.dataset.loc) === currentLocation));
  photoStatus.textContent = `Location ${currentLocation + 1} of ${totalLocations}`;
}

// direction: -1 = previous, +1 = next. Ignored while a transition is running.
function moveLocation(direction) {
  if (locked || totalLocations < 2) return;
  locked = true;
  showLocation(currentLocation + direction);
  setTimeout(() => { locked = false; }, CAROUSEL_LOCK_MS);
}

arrowUp.addEventListener('click', () => moveLocation(-1));
arrowDown.addEventListener('click', () => moveLocation(1));

// Keyboard: arrow keys while the arrows or photo have focus
gallery.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); moveLocation(-1); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); moveLocation(1); }
});

// Touch: swipe up/left = next, swipe down/right = previous
let touchStartX = 0;
let touchStartY = 0;

frame.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

frame.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
  const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
  moveLocation(delta < 0 ? 1 : -1);
}, { passive: true });

showLocation(0);

/* ---------- 5. Contact form validation ---------- */
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  name: (v) => (v.length < 2 ? 'Please enter your name.' : ''),
  email: (v) => (!v ? 'Please enter your email.' : !EMAIL_PATTERN.test(v) ? 'Please enter a valid email address.' : ''),
  message: (v) => (v.length < 10 ? 'Please write a message of at least 10 characters.' : '')
};

function validateField(name) {
  const input = form.elements[name];
  const message = rules[name](input.value.trim());
  const field = input.closest('.field');
  field.classList.toggle('has-error', Boolean(message));
  document.getElementById(`${name}-error`).textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

// Hide the inline label once the user types; re-validate when leaving a field
Object.keys(rules).forEach((name) => {
  const input = form.elements[name];
  const field = input.closest('.field');
  input.addEventListener('input', () => {
    field.classList.toggle('filled', input.value.length > 0);
    if (field.classList.contains('has-error')) validateField(name);
  });
  input.addEventListener('blur', () => { if (input.value) validateField(name); });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  statusEl.className = 'form-status';

  const results = Object.keys(rules).map(validateField);
  if (results.includes(false)) {
    statusEl.textContent = 'Please fix the highlighted fields.';
    statusEl.classList.add('fail');
    return;
  }

  // No backend or email service is connected, so nothing is actually sent.
  // To deliver messages, send the form data to your own service here.
  statusEl.textContent = 'Your message looks good, but this demo site has no email service connected, so it has not been sent.';
  statusEl.classList.add('ok');
  form.reset();
  form.querySelectorAll('.field').forEach((f) => f.classList.remove('filled'));
});

/* ---------- 6. Social links ---------- */
document.querySelectorAll('.social').forEach((icon) => {
  const url = SOCIAL_LINKS[icon.dataset.social];
  if (url) {
    icon.href = url;
    icon.target = '_blank';
    icon.rel = 'noopener noreferrer';
  } else {
    // No official link supplied yet: keep the icon, make it inert
    icon.classList.add('disabled');
    icon.setAttribute('aria-disabled', 'true');
    icon.addEventListener('click', (e) => e.preventDefault());
  }
});
