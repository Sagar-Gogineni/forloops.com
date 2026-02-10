(function () {
  'use strict';

  // ===== Scroll Animations (IntersectionObserver) =====
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-up');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== Mobile Nav Toggle =====
  function initMobileNav() {
    var toggle = document.querySelector('.nav__toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked
    var links = nav.querySelectorAll('.nav__links a, .nav__cta');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Medium RSS Feed =====
  function initBlogFeed() {
    var grid = document.getElementById('writing-grid');
    if (!grid) return;

    var MEDIUM_USERNAME = 'sagargr111';
    var url =
      'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@' +
      MEDIUM_USERNAME;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Feed fetch failed');
        return res.json();
      })
      .then(function (data) {
        if (data.status !== 'ok' || !data.items || !data.items.length) {
          throw new Error('No articles found');
        }
        renderArticles(grid, data.items.slice(0, 3));
      })
      .catch(function () {
        renderFallback(grid, MEDIUM_USERNAME);
      });
  }

  function renderArticles(grid, articles) {
    var html = articles
      .map(function (item) {
        var title = sanitize(item.title || 'Untitled');
        var excerpt = getExcerpt(item.description || '', 120);
        var date = formatDate(item.pubDate);
        var link = sanitize(item.link || '#');

        return (
          '<article class="writing-card">' +
          '<h3 class="writing-card__title">' + title + '</h3>' +
          '<p class="writing-card__excerpt">' + excerpt + '</p>' +
          '<div class="writing-card__meta">' +
          '<time class="writing-card__date" datetime="' + sanitize(item.pubDate) + '">' + date + '</time>' +
          '<a href="' + link + '" target="_blank" rel="noopener noreferrer" class="writing-card__link">Read on Medium &rarr;</a>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    grid.innerHTML = html;
  }

  function renderFallback(grid, username) {
    grid.innerHTML =
      '<article class="writing-card">' +
      '<h3 class="writing-card__title">Read my articles on Medium</h3>' +
      '<p class="writing-card__excerpt">Technical deep-dives on EU AI Act compliance, AI governance, and building compliance tooling for engineering teams.</p>' +
      '<div class="writing-card__meta">' +
      '<span class="writing-card__date"></span>' +
      '<a href="https://medium.com/@' + sanitize(username) + '" target="_blank" rel="noopener noreferrer" class="writing-card__link">Visit Medium &rarr;</a>' +
      '</div>' +
      '</article>';
  }

  // ===== Waitlist Form =====
  function initForm() {
    var form = document.getElementById('waitlist-form');
    var status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('input[type="email"]');
      if (!emailInput || !emailInput.value.trim()) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          if (res.ok) {
            status.textContent = "You're on the list. We'll be in touch.";
            status.className = 'contact__status contact__status--success';
            form.reset();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          status.textContent = 'Something went wrong. Please try again.';
          status.className = 'contact__status contact__status--error';
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join the Waitlist';
          }
        });
    });
  }

  // ===== Utilities =====
  function sanitize(str) {
    var el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  function getExcerpt(html, maxLen) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var text = tmp.textContent || tmp.innerText || '';
    text = text.trim();
    if (text.length > maxLen) {
      text = text.substring(0, maxLen).trimEnd() + '...';
    }
    return sanitize(text);
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (_) {
      return '';
    }
  }

  // ===== Init =====
  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initMobileNav();
    initBlogFeed();
    initForm();
  });
})();
