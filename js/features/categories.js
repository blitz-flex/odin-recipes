import { state } from '../core/state.js';
import { getRandomRecipes, filterByCategory } from '../api/api.js';
import { showLoading, renderRecipes, setActiveCategory } from '../ui/ui.js';
import { isFavoritesOnlyMode } from './favorites.js';

export function setupCategories() {
  const categoriesEl = document.querySelector('.categories-bar');
  const searchInput = document.getElementById('search-input');
  if (!categoriesEl || !searchInput) return;

  categoriesEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;

    if (isFavoritesOnlyMode()) {
      document.body.classList.remove('favorites-only');
      state.favoritesOnlySnapshot = null;
      const favoritesToggle = document.getElementById('favorites-toggle');
      favoritesToggle?.setAttribute('aria-pressed', 'false');
      favoritesToggle?.setAttribute('aria-label', 'Favorites only');
      favoritesToggle?.setAttribute('title', 'Favorites');
    }

    const category = btn.dataset.category;
    setActiveCategory(category);
    searchInput.value = '';
    state.currentQuery = '';
    state.currentCategory = category;
    showLoading();

    let recipes;
    if (category === 'all') {
      state.currentMode = 'random';
      recipes = await getRandomRecipes(state.PAGE_SIZE);
    } else {
      state.currentMode = 'category';
      recipes = await filterByCategory(category);
    }

    renderRecipes(recipes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function setupCategoryScrollIndicators() {
  const bar = document.querySelector('.categories-bar');
  if (!bar) return;

  const updateScrollIndicators = () => {
    const isOverflowing = bar.scrollWidth > bar.clientWidth + 1;

    if (!isOverflowing) {
      bar.style.webkitMaskImage = '';
      bar.style.maskImage = '';
      return;
    }

    const tolerance = 4;
    const hasLeft = bar.scrollLeft > tolerance;
    const hasRight = Math.ceil(bar.scrollLeft + bar.clientWidth) < (bar.scrollWidth - tolerance);

    const fade = '2.5rem';

    let mask;
    if (hasLeft && hasRight) {
      mask = `linear-gradient(to right, transparent 0%, black ${fade}, black calc(100% - ${fade}), transparent 100%)`;
    } else if (hasRight) {
      // start: right fade only (All button stays crisp)
      mask = `linear-gradient(to right, black 0%, black calc(100% - ${fade}), transparent 100%)`;
    } else if (hasLeft) {
      mask = `linear-gradient(to right, transparent 0%, black ${fade}, black 100%)`;
    } else {
      mask = `linear-gradient(to right, black 0%, black 100%)`;
    }

    bar.style.webkitMaskImage = mask;
    bar.style.maskImage = mask;
  };

  bar.addEventListener('scroll', updateScrollIndicators, { passive: true });
  window.addEventListener('resize', updateScrollIndicators);

  requestAnimationFrame(() => {
    updateScrollIndicators();
    setTimeout(updateScrollIndicators, 120); // in case fonts affect width
  });
}
