export function setupDarkMode() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  if (!toggleBtn) return;

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
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncToggleState();
  });

  syncToggleState();
}

export function setupStickyControlsBar() {
  const controlsBar = document.querySelector('.main-header');
  if (!controlsBar) return;
  const recipesContainer = document.getElementById('recipes-container');
  const triggerOffsetPx = 12;

  let ticking = false;
  const update = () => {
    const controlsRect = controlsBar.getBoundingClientRect();
    const isStuck = recipesContainer
      ? recipesContainer.getBoundingClientRect().top <= (controlsRect.bottom + triggerOffsetPx)
      : controlsRect.top <= -triggerOffsetPx;
    controlsBar.classList.toggle('is-stuck', isStuck);
    ticking = false;
  };

  update();

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
}
