import { state } from '../core/state.js';
import {
  PAGE_SIZE_MOBILE,
  PAGE_SIZE_TABLET,
  PAGE_SIZE_DESKTOP,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
} from '../core/config.js';
import { isFavoritesOnlyMode } from './favorites.js';
import {
  showLoading,
  renderRecipes,
  updateLoadMoreVisibility,
  recipeCardHtml,
} from '../ui/ui.js';
import { skeletonsHtml } from '../ui/templates.js';
import { getRandomRecipes } from '../api/api.js';

export function setupLoadMore() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', async () => {
    loadMoreBtn.disabled = true;
    const previousText = loadMoreBtn.textContent;
    loadMoreBtn.textContent = 'Loading...';

    const container = document.getElementById('recipes-container');
    const placeholderCards = [];
    if (container) {
      container.insertAdjacentHTML('beforeend', skeletonsHtml(state.PAGE_SIZE, { placeholder: true }));
      const newPlaceholders = container.querySelectorAll('.recipe-card[data-placeholder="true"]');
      newPlaceholders.forEach((el) => placeholderCards.push(el));
    }

    try {
      if (state.currentMode === 'random') {

        // avoid duplicate random recipes
        const excludeIds = new Set(state.allRecipes.map((r) => r.idMeal));
        const newRecipes = await getRandomRecipes(state.PAGE_SIZE, excludeIds);
        state.allRecipes = [...state.allRecipes, ...newRecipes];
        state.displayedRecipes = [...state.displayedRecipes, ...newRecipes];
        container.insertAdjacentHTML('beforeend', newRecipes.map((r) => recipeCardHtml(r)).join(''));
      } else {
        const nextRecipes = state.allRecipes.slice(state.displayedRecipes.length, state.displayedRecipes.length + state.PAGE_SIZE);
        state.displayedRecipes = [...state.displayedRecipes, ...nextRecipes];
        container.insertAdjacentHTML('beforeend', nextRecipes.map((r) => recipeCardHtml(r)).join(''));
      }
    } finally {
      placeholderCards.forEach((el) => el.remove());
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = previousText;
      updateLoadMoreVisibility();
    }
  });
}

export function updatePageSize() {
  const width = window.innerWidth;
  let newSize;
  if (width <= MOBILE_BREAKPOINT) {
    newSize = PAGE_SIZE_MOBILE;
  } else if (width <= TABLET_BREAKPOINT) {
    newSize = PAGE_SIZE_TABLET;
  } else {
    newSize = PAGE_SIZE_DESKTOP;
  }

  if (state.PAGE_SIZE !== newSize) {
    const previousVisibleCount = state.displayedRecipes.length;

    state.PAGE_SIZE = newSize;

    // preserve already-loaded items on resize (avoid losing "Load More" progress)
    if (state.allRecipes.length > 0 && !isFavoritesOnlyMode()) {

      const targetCount = Math.max(previousVisibleCount || newSize, newSize);
      state.displayedRecipes = state.allRecipes.slice(0, Math.min(targetCount, state.allRecipes.length));

      const container = document.getElementById('recipes-container');
      if (container) {
        container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r)).join('');
        updateLoadMoreVisibility();
      }
    }
  }
}
