import { state } from './core/state.js';
import { setupDarkMode, setupStickyControlsBar } from './features/theme.js';
import { getRandomRecipes } from './api/api.js';
import {
  showLoading,
  renderRecipes,
  setActiveCategory,
} from './ui/ui.js';
import {
  showRecipe,
  setupModal,
  getRecipeFromUrl,
  setupShareButtons,
  setupFavorites,
  setupPrintRecipe,
} from './features/modal.js';
import { refreshFavoritesUI } from './features/views.js';
import { setupSearch } from './features/search.js';
import { setupCategories, setupCategoryScrollIndicators } from './features/categories.js';
import {
  setupRecipeGridInteractions,
  setupFavoritesGridInteractions,
  setupFavoritesToggle,
} from './features/card-interactions.js';
import { setupLoadMore, updatePageSize } from './features/load-more.js';













window.addEventListener('DOMContentLoaded', async () => {
  updatePageSize(); // determine PAGE_SIZE early (for skeletons)
  window.addEventListener('resize', updatePageSize);

  showLoading();
  setupDarkMode();
  setupStickyControlsBar();
  setupRecipeGridInteractions();
  setupFavoritesGridInteractions();
  setupFavoritesToggle();
  setActiveCategory('all');

  const recipes = await getRandomRecipes(state.PAGE_SIZE);
  renderRecipes(recipes, true);

  setupSearch();
  setupCategories();
  setupCategoryScrollIndicators();
  setupModal();
  setupFavorites();
  setupShareButtons();
  setupPrintRecipe();
  setupLoadMore();

  refreshFavoritesUI();

  const recipeFromUrl = getRecipeFromUrl();
  if (recipeFromUrl) await showRecipe(recipeFromUrl);
});
