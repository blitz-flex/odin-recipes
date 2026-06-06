import { state } from '../core/state.js';
import {
  recipeCardHtml,
  skeletonsHtml,
  emptyRecipesHtml,
  emptyFavoritesHtml,
} from './templates.js';
import { readFavoriteIds } from '../features/favorites.js';

function renderCards(recipes) {
  const favSet = readFavoriteIds();
  return recipes.map((r) => recipeCardHtml(r, favSet)).join('');
}

export function renderRecipeList(container, recipes) {
  if (!container) return;
  if (!recipes?.length) {
    container.innerHTML = emptyFavoritesHtml();
    return;
  }
  container.innerHTML = renderCards(recipes);
}

function getLoadMoreContainer() {
  return document.querySelector('.load-more-container');
}

export function updateLoadMoreVisibility() {
  const loadMoreContainer = getLoadMoreContainer();
  if (!loadMoreContainer) return;

  let show = false;
  if (state.currentMode !== 'favorites') {
    if (state.currentMode === 'random') {
      show = state.allRecipes.length > 0;
    } else {
      show = state.displayedRecipes.length < state.allRecipes.length;
    }
  }
  loadMoreContainer.classList.toggle('is-visible', show);
}

export function showLoading() {
  const container = document.getElementById('recipes-container');
  getLoadMoreContainer()?.classList.remove('is-visible');
  if (!container) return;
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = skeletonsHtml(state.PAGE_SIZE);
}

export function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  if (!recipes?.length) {
    container.innerHTML = emptyRecipesHtml();
    getLoadMoreContainer()?.classList.remove('is-visible');
    return;
  }

  state.allRecipes = recipes;
  state.displayedRecipes = recipes.slice(0, state.PAGE_SIZE);

  container.innerHTML = renderCards(state.displayedRecipes);
  container.setAttribute('aria-busy', 'false');
  updateLoadMoreVisibility();
}

// Re-export for backward compatibility (other modules import these from ui.js)
export { recipeCardHtml } from './templates.js';
