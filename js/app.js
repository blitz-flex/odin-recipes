import { state } from './core/state.js';
import { setupDarkMode } from './features/theme.js';
import { getRandomRecipes } from './api/api.js';
import { showLoading, renderRecipes } from './ui/ui.js';
import {
  showRecipe,
  setupModal,
  getRecipeFromUrl,
  setupShareButtons,
  setupFavorites,
  setupPrintRecipe,
} from './features/modal.js';
import { refreshFavoritesUI } from './features/views.js';
import { updateFavoritesCountBadge } from './features/favorites.js';
import { setupSearch } from './features/search.js';
import { setupCategories, updateCategoryLabel } from './features/categories.js';
import {
  setupRecipeGridInteractions,
  setupFavoritesGridInteractions,
  setupFavoritesToggle,
} from './features/card-interactions.js';
import { setupLoadMore, updatePageSize } from './features/load-more.js';

window.addEventListener('DOMContentLoaded', async () => {
  updatePageSize();
  window.addEventListener('resize', updatePageSize);

  showLoading();
  setupDarkMode();
  setupRecipeGridInteractions();
  setupFavoritesGridInteractions();
  setupFavoritesToggle();

  renderRecipes(await getRandomRecipes(state.PAGE_SIZE), true);
  updateCategoryLabel();

  setupSearch();
  setupCategories();
  setupModal();
  setupFavorites();
  setupShareButtons();
  setupPrintRecipe();
  setupLoadMore();

  refreshFavoritesUI();
  updateFavoritesCountBadge();

  const recipeFromUrl = getRecipeFromUrl();
  if (recipeFromUrl) await showRecipe(recipeFromUrl);
});
