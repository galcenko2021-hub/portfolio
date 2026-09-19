/* ============================================================
   Портфолио — ФИИТ, РТУ МИРЭА
   Переключение тем, вкладки учебного плана, мобильное меню,
   появление блоков при скролле.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  /* --- Тема ------------------------------------------------ */

  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-label');
  var meta = document.querySelector('meta[name="theme-color"]');
  var BG = { dark: '#07080B', light: '#F4F4F1' };

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', BG[theme]);
    if (label) label.textContent = theme === 'dark' ? 'светлая' : 'тёмная';
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
      );
    }
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* приватный режим — тема просто не запомнится */
      }
    });
  }

  // Если пользователь не выбирал тему вручную, следим за системной.
  var systemLight = window.matchMedia('(prefers-color-scheme: light)');
  var onSystemChange = function (event) {
    var saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch (e) { /* ignore */ }
    if (saved !== 'light' && saved !== 'dark') {
      applyTheme(event.matches ? 'light' : 'dark');
    }
  };
  if (systemLight.addEventListener) systemLight.addEventListener('change', onSystemChange);
  else if (systemLight.addListener) systemLight.addListener(onSystemChange);

  /* --- Мобильное меню -------------------------------------- */

  var navToggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-list');

  function closeNav() {
    if (!navList || !navToggle) return;
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });

    navList.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navList.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* --- Вкладки учебного плана ------------------------------ */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.setAttribute('tabindex', selected ? '0' : '-1');
      item.classList.toggle('is-active', selected);

      var panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }

  // Без JS в разметке видны все панели сразу; при живом JS оставляем выбранную.
  if (tabs.length) {
    var initial = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    selectTab(initial, false);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      selectTab(tab, false);
    });

    tab.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* --- Появление блоков при скролле ------------------------ */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  revealables.forEach(function (element) {
    var delay = element.getAttribute('data-delay');
    if (delay) element.style.setProperty('--delay', delay);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (element) {
      element.classList.add('is-in');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    revealables.forEach(function (element) {
      observer.observe(element);
    });
  }

  /* --- Подсветка активного пункта меню --------------------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* --- Плавные переходы: «листайте вниз» и «наверх» --------- */

  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToY(y) {
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll]')).forEach(function (el) {
    el.addEventListener('click', function (event) {
      var mode = el.getAttribute('data-scroll');
      event.preventDefault();
      if (mode === 'top') {
        scrollToY(0);
      } else if (mode === 'past-hero' && hero) {
        // Низ героя точно под шапкой: героя на экране больше нет.
        var headerHeight = header ? header.offsetHeight : 0;
        scrollToY(hero.getBoundingClientRect().bottom + window.pageYOffset - headerHeight);
      }
    });
  });

  /* --- Год в подвале --------------------------------------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
