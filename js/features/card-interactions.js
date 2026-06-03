import { state } from '../core/state.js';
import {
  showLoading,
  renderRecipes,
  setActiveCategory,
} from '../ui/ui.js';
import { getRandomRecipes } from '../api/api.js';
import { isFavoritesOnlyMode } from './favorites.js';
import {
  snapshotCurrentView,
  restoreSnapshot,
  renderFavoritesOnlyView,
} from './views.js';
import { showRecipe } from './modal.js';

/**
 * card-interactions.js
 * Click handlers for recipe cards and the favorites header toggle.
 */

export function setupRecipeGridInteractions() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (!id) return;
    showRecipe(id);
  });
}

export function setupFavoritesGridInteractions() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (!id) return;
    showRecipe(id);
  });
}

export function setupFavoritesToggle() {
  const btn = document.getElementById('favorites-toggle');
  const recipesContainer = document.getElementById('recipes-container');
  if (!btn || !recipesContainer) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (isFavoritesOnlyMode()) {
      document.body.classList.remove('favorites-only');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Jump to favorites');
      btn.setAttribute('title', 'Favorites');
      if (state.favoritesOnlySnapshot) {
        restoreSnapshot(state.favoritesOnlySnapshot);
        state.favoritesOnlySnapshot = null;
      } else {
        showLoading();
        const random = await getRandomRecipes(state.PAGE_SIZE);
        renderRecipes(random, true);
      }
      return;
    }

    state.favoritesOnlySnapshot = snapshotCurrentView();
    document.body.classList.add('favorites-only');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Favorites only');
    btn.setAttribute('title', 'Favorites');
    state.currentCategory = 'all';
    state.currentQuery = '';
    setActiveCategory('all');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    await renderFavoritesOnlyView();
  });
}
