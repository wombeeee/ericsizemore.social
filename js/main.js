// ericsizemore.social — Main JS

(function () {
  'use strict';

  // --- Mobile Nav Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('open');
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Scroll-triggered Fade-in ---
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything immediately
    fadeElements.forEach((el) => el.classList.add('visible'));
  }

  // --- Year Filter (Work section) ---
  const yearFilter = document.querySelector('.year-filter');

  if (yearFilter) {
    const pills = yearFilter.querySelectorAll('.year-pill');
    const items = document.querySelectorAll('.session-list .session');

    function applyYearFilter(year) {
      pills.forEach((p) => {
        p.setAttribute('aria-pressed', p.dataset.year === year ? 'true' : 'false');
      });
      items.forEach((item) => {
        item.hidden = item.dataset.year !== year;
      });
    }

    yearFilter.addEventListener('click', (e) => {
      const pill = e.target.closest('.year-pill');
      if (!pill) return;
      applyYearFilter(pill.dataset.year);
    });

    const initialPill = yearFilter.querySelector('.year-pill[aria-pressed="true"]');
    if (initialPill) applyYearFilter(initialPill.dataset.year);
  }

  // --- Active Nav Link Highlight ---
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach((item) => {
          item.classList.remove('active');
          if (item.getAttribute('href') === '#' + id) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
})();
