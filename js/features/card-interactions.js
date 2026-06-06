import { state } from '../core/state.js';
import { showLoading, renderRecipes } from '../ui/ui.js';
import { getRandomRecipes } from '../api/api.js';
import {
  isFavoritesOnlyMode,
  toggleFavoriteById,
  updateFavoriteUIForId,
} from './favorites.js';
import {
  snapshotCurrentView,
  restoreSnapshot,
  renderFavoritesOnlyView,
  refreshFavoritesUI,
} from './views.js';
import { showRecipe } from './modal.js';
import { updateCategoryLabel } from './categories.js';

// ─── Recipe grid interactions ─────────────────────────────────────────────────

function handleHeartClick(heart) {
  const id = heart.dataset.recipeId;
  if (!id) return;
  const isFavorite = toggleFavoriteById(id);
  updateFavoriteUIForId(id, isFavorite);
  refreshFavoritesUI();
}

export function setupRecipeGridInteractions() {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const heart = e.target.closest('.card-heart');
    if (heart) {
      e.preventDefault();
      e.stopPropagation();
      handleHeartClick(heart);
      return;
    }

    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (id) showRecipe(id);
  });

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const heart = e.target.closest('.card-heart');
    if (!heart) return;
    e.preventDefault();
    handleHeartClick(heart);
  });
}

// ─── Favorites grid interactions ──────────────────────────────────────────────

export function setupFavoritesGridInteractions() {
  const container = document.getElementById('favorites-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (id) showRecipe(id);
  });
}

// ─── Favorites toggle ─────────────────────────────────────────────────────────

function setFavoritesToggleState(btn, isActive) {
  btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  btn.setAttribute('aria-label', isActive ? 'Favorites only' : 'Jump to favorites');
  btn.setAttribute('title', 'Favorites');
}

export function setupFavoritesToggle() {
  const btn = document.getElementById('favorites-toggle');
  const recipesContainer = document.getElementById('recipes-container');
  if (!btn || !recipesContainer) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (isFavoritesOnlyMode()) {
      document.body.classList.remove('favorites-only');
      setFavoritesToggleState(btn, false);

      if (state.favoritesOnlySnapshot) {
        restoreSnapshot(state.favoritesOnlySnapshot);
        state.favoritesOnlySnapshot = null;
      } else {
        showLoading();
        const recipes = await getRandomRecipes(state.PAGE_SIZE);
        renderRecipes(recipes);
        updateCategoryLabel();
      }
      return;
    }

    state.favoritesOnlySnapshot = snapshotCurrentView();
    document.body.classList.add('favorites-only');
    setFavoritesToggleState(btn, true);

    state.currentCategory = 'all';
    state.currentQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    updateCategoryLabel();

    await renderFavoritesOnlyView();
  });
}
