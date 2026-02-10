import { state } from './state.js';
import { readFavoriteIds } from './favorites.js';

export function getIngredients(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    const ingredientText = ingredient?.trim();
    const measureText = measure?.trim();
    if (ingredientText) {
      ingredients.push([measureText, ingredientText].filter(Boolean).join(' '));
    }
  }
  return ingredients;
}

export function setActiveCategory(category) {
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

export function formatRecipeMeta(recipe) {
  const category = recipe.strCategory || (state.currentMode === 'category' ? state.currentCategory : '');
  const area = recipe.strArea || '';
  if (category && area) return `${category} • ${area}`;
  return category || area || '';
}

export function formatPrintUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = url.searchParams.get('v');
      if (id) return `youtu.be/${id}`;
    }
    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\/+/, '').split('/')[0];
      if (id) return `youtu.be/${id}`;
    }
    const path = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/$/, '') : '';
    return `${host}${path}`;
  } catch {
    return String(rawUrl).replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[?#]/)[0];
  }
}

export function favoriteBadgeHtml() {
  return `
        <span class="card-favorite" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
        </span>
    `;
}

export function recipeCardHtml(recipe, favoritesSet = readFavoriteIds()) {
  const meta = formatRecipeMeta(recipe);
  const isFavorite = favoritesSet.has(String(recipe.idMeal));
  return `
        <button type="button" class="recipe-card ${isFavorite ? 'is-favorite' : ''}" data-recipe-id="${recipe.idMeal}">
            ${isFavorite ? favoriteBadgeHtml() : ''}
            <img src="${recipe.strMealThumb}" 
                 alt="${recipe.strMeal}" 
                 class="recipe-image"
                 loading="lazy">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.strMeal}</h3>
                ${meta ? `<p class="recipe-meta">${meta}</p>` : ''}
            </div>
        </button>
    `;
}

export function renderRecipeList(container, recipes) {
  if (!container) return;
  if (!recipes?.length) {
    container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <h3 style="color: #7c5c45; font-size: 2rem;">🤷‍♂️ No favorites found</h3>
                <p style="color: #999; font-size: 1.1rem;">Open a recipe and tap the heart</p>
            </div>
        `;
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
  container.innerHTML = Array.from({ length: state.PAGE_SIZE }).map(() => `
        <div class="recipe-card skeleton-card" aria-hidden="true">
            <div class="recipe-image"></div>
            <div class="recipe-info">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line meta"></div>
            </div>
        </div>
    `).join('');
}

export function renderRecipes(recipes, isInitialLoad = false) {
  const container = document.getElementById('recipes-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!container || !loadMoreBtn) return;

  if (!recipes?.length) {
    container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <h3 style="color: #7c5c45; font-size: 2rem;">🤷‍♂️ No recipes found</h3>
                <p style="color: #999; font-size: 1.1rem;">Try a different search or category</p>
            </div>
        `;
    loadMoreBtn.style.display = 'none';
    return;
  }

  state.allRecipes = recipes;
  state.displayedRecipes = recipes.slice(0, state.PAGE_SIZE);

  container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r)).join('');
  container.setAttribute('aria-busy', 'false');
  updateLoadMoreVisibility();
}
