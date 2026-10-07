document.addEventListener('DOMContentLoaded', function () {
  const year = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const themeText = document.querySelector('.theme-toggle-text');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const storedTheme = localStorage.getItem('mpfsl-theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const savedTheme = storedTheme || systemTheme;
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    mainNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        setMenuOpen(false);
      }
    });
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('dark-theme', !isLight);
    localStorage.setItem('mpfsl-theme', theme);

    if (themeText) {
      themeText.textContent = isLight ? 'Dark mode' : 'Light mode';
    }

    if (themeToggle) {
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      themeToggle.setAttribute('aria-pressed', String(!isLight));
    }
  }

  function setMenuOpen(isOpen) {
    mainNav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    menuToggle.querySelector('span').textContent = isOpen ? 'Close' : 'Menu';
  }
});
