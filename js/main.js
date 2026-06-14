// ericsizemore.social — Main JS

(function () {
  'use strict';

  // --- Theme Toggle (dark "forest" / light "limestone") ---
  // Initial theme is set pre-paint by the inline <head> script; this wires the switch.
  const root = document.documentElement;
  const themeTog = document.getElementById('themeTog');

  function syncToggle() {
    if (!themeTog) return;
    themeTog.setAttribute('aria-checked', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  }

  if (themeTog) {
    syncToggle();
    themeTog.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('es-theme', next); } catch (e) { /* private mode */ }
      syncToggle();
    });
  }

  // Follow the OS theme until the user makes a manual choice.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem('es-theme'); } catch (err) { /* ignore */ }
      if (saved !== 'dark' && saved !== 'light') {
        root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
        syncToggle();
      }
    });
  }

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

  // --- Logo → scroll to the very top ---
  // The sticky header makes a bare #top anchor land short, so drive it explicitly.
  const navLogo = document.querySelector('.logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
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

  // --- Writing: latest posts from Substack (via the /api/posts Worker) ---
  const postList = document.querySelector('.post-list');

  if (postList) {
    const FALLBACK =
      '<li class="post"><p class="session-desc">Can&rsquo;t reach the feed right now &mdash; ' +
      '<a href="https://ericsizemore.substack.com/archive" target="_blank" rel="noopener">read everything on Substack</a>.</p></li>';

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const formatDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const renderPost = (post) => {
      const date = formatDate(post.date);
      return (
        '<li class="post">' +
        '<div class="session-meta">' + (date ? '<time>' + date + '</time>' : '') + '<span>Substack</span></div>' +
        '<h3 class="post-title"><a href="' + escapeHtml(post.link) + '" target="_blank" rel="noopener">' + escapeHtml(post.title) + '</a></h3>' +
        (post.snippet ? '<p class="session-desc">' + escapeHtml(post.snippet) + '</p>' : '') +
        '</li>'
      );
    };

    fetch('/api/posts')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status))))
      .then((data) => {
        const posts = (data.posts || []).filter(
          (p) => p && p.title && typeof p.link === 'string' && p.link.indexOf('https://') === 0
        );
        postList.innerHTML = posts.length ? posts.map(renderPost).join('') : FALLBACK;
      })
      .catch(() => {
        postList.innerHTML = FALLBACK;
      });
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
