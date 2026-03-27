// ── Navbar scroll effect ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile menu toggle ──
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const open = mobileMenu?.classList.contains('open');
  if (spans[0]) spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  if (spans[1]) spans[1].style.opacity = open ? '0' : '';
  if (spans[2]) spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => mobileMenu?.classList.remove('open'));
});

// ── Active nav link ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Fade-up scroll animations ──
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px 0px -50px 0px',
  threshold: 0.08
});
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ── Counter animation — WOBBLE-FREE version ──
// Pre-measure max width at target value so the element never resizes
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  if (isNaN(target)) return;

  // Set a fixed min-width based on the final value width BEFORE animating
  // This prevents layout reflow during counting
  el.textContent = target + suffix;
  const finalWidth = el.getBoundingClientRect().width;
  el.style.minWidth = Math.ceil(finalWidth) + 'px';
  el.style.display = 'inline-block';
  el.style.textAlign = 'right';
  el.textContent = '0' + suffix;

  const duration = 1600;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = '1';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── Hero video autoplay fix for mobile ──
// Mobile browsers require: muted + playsinline + programmatic play()
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  // Ensure all required attributes are set
  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute('playsinline', '');
  heroVideo.setAttribute('muted', '');
  heroVideo.setAttribute('autoplay', '');
  heroVideo.loop = true;

  // Try to play — browsers may need user interaction on first load
  const tryPlay = () => {
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — hide video, show fallback bg (already set via images.js)
        heroVideo.style.display = 'none';
      });
    }
  };

  // Attempt on load
  if (heroVideo.readyState >= 2) {
    tryPlay();
  } else {
    heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
  }

  // Also try on first user interaction (scroll/touch) in case blocked
  const unblockPlay = () => {
    tryPlay();
    document.removeEventListener('touchstart', unblockPlay);
    document.removeEventListener('scroll', unblockPlay);
  };
  document.addEventListener('touchstart', unblockPlay, { passive: true, once: true });
  document.addEventListener('scroll', unblockPlay, { passive: true, once: true });
}
