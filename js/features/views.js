import { state } from '../core/state.js';
import {
  loadFavoriteRecipes,
  filterFavoriteRecipes,
  isFavoritesOnlyMode,
  readFavoriteIds,
} from './favorites.js';
import {
  renderRecipeList,
  updateLoadMoreVisibility,
} from '../ui/ui.js';
import { recipeCardHtml, skeletonsHtml } from '../ui/templates.js';

export function snapshotCurrentView() {
  const searchInput = document.getElementById('search-input');
  return {
    currentMode: state.currentMode,
    currentCategory: state.currentCategory,
    currentQuery: state.currentQuery,
    allRecipes: Array.isArray(state.allRecipes) ? [...state.allRecipes] : [],
    displayedRecipes: Array.isArray(state.displayedRecipes) ? [...state.displayedRecipes] : [],
    searchValue: searchInput?.value || '',
  };
}

export function restoreSnapshot(snapshot) {
  if (!snapshot) return;
  state.currentMode = snapshot.currentMode;
  state.currentCategory = snapshot.currentCategory;
  state.currentQuery = snapshot.currentQuery;
  state.allRecipes = snapshot.allRecipes;
  state.displayedRecipes = snapshot.displayedRecipes;

  const container = document.getElementById('recipes-container');
  if (container) {
    const favSet = readFavoriteIds();
    container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r, favSet)).join('');
    container.setAttribute('aria-busy', 'false');
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = snapshot.searchValue;
  updateLoadMoreVisibility();
  if (window.__updateCategoryLabel) window.__updateCategoryLabel();
}

export async function renderFavoritesOnlyView() {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  container.innerHTML = skeletonsHtml(Math.min(state.PAGE_SIZE, 6));

  const recipes = state.favoriteRecipesCache.length ? state.favoriteRecipesCache : await loadFavoriteRecipes();
  const filtered = filterFavoriteRecipes(recipes, state.currentQuery, state.currentCategory);
  state.allRecipes = filtered;
  state.displayedRecipes = filtered;
  state.currentMode = 'favorites';

  renderRecipeList(container, filtered);
  updateLoadMoreVisibility();
}

export async function refreshFavoritesUI() {
  if (!isFavoritesOnlyMode()) return;
  await renderFavoritesOnlyView();
}
