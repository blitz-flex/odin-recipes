import { state } from '../core/state.js';
import {
  recipeCardHtml,
  skeletonsHtml,
  emptyRecipesHtml,
  emptyFavoritesHtml,
} from './templates.js';

export function setActiveCategory(category) {
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

export function renderRecipeList(container, recipes) {
  if (!container) return;
  if (!recipes?.length) {
    container.innerHTML = emptyFavoritesHtml();
    return;
  }
  container.innerHTML = recipes.map((r) => recipeCardHtml(r)).join('');
}

export function updateLoadMoreVisibility() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;

  if (state.currentMode === 'favorites') {
    loadMoreBtn.style.display = 'none';
    return;
  }
  if (state.currentMode === 'random') {
    loadMoreBtn.style.display = state.allRecipes.length ? 'block' : 'none';
    return;
  }
  loadMoreBtn.style.display = state.displayedRecipes.length < state.allRecipes.length ? 'block' : 'none';
}

export function showLoading() {
  const container = document.getElementById('recipes-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  if (container) container.setAttribute('aria-busy', 'true');
  if (!container) return;
  container.innerHTML = skeletonsHtml(state.PAGE_SIZE);
}

export function renderRecipes(recipes, isInitialLoad = false) {
  const container = document.getElementById('recipes-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!container || !loadMoreBtn) return;

  if (!recipes?.length) {
    container.innerHTML = emptyRecipesHtml();
    loadMoreBtn.style.display = 'none';
    return;
  }

  state.allRecipes = recipes;
  state.displayedRecipes = recipes.slice(0, state.PAGE_SIZE);

  container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r)).join('');
  container.setAttribute('aria-busy', 'false');
  updateLoadMoreVisibility();
}

// Re-export for backward compatibility (other modules import these from ui.js)
export { recipeCardHtml } from './templates.js';
