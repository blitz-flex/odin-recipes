import { THEME_STORAGE_KEY } from '../core/config.js';

export function setupDarkMode() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // support migration from old 'theme' key
  let savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (!savedTheme) {
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme) {
      savedTheme = oldTheme;
      localStorage.setItem(THEME_STORAGE_KEY, oldTheme);
    }
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  if (shouldUseDark) document.body.classList.add('dark-mode');

  const syncToggleState = () => {
    const isDark = document.body.classList.contains('dark-mode');
    toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    syncToggleState();
  });

  syncToggleState();
}
