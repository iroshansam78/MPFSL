document.addEventListener('DOMContentLoaded', function () {
  const year = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const themeText = document.querySelector('.theme-toggle-text');
  const themeIcon = document.querySelector('.theme-toggle-icon');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const savedTheme = localStorage.getItem('mpfsl-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    localStorage.setItem('mpfsl-theme', theme);

    if (themeText) {
      themeText.textContent = isLight ? 'Dark' : 'Light';
    }

    if (themeIcon) {
      themeIcon.textContent = isLight ? '🌙' : '☀️';
    }
  }
});
