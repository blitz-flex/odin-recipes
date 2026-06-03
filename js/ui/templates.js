import { state } from '../core/state.js';
import { readFavoriteIds } from '../features/favorites.js';

/**
 * templates.js
 * All HTML string generation in one place.
 * Best practice: keep view markup separate from logic.
 */

// --- Data formatting helpers (used by templates) ---

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

// --- Skeleton & Empty states ---

export function skeletonCardHtml({ placeholder = false } = {}) {
  const placeholderAttr = placeholder ? ' data-placeholder="true"' : '';
  return `
    <div class="recipe-card skeleton-card"${placeholderAttr} aria-hidden="true">
      <div class="recipe-image"></div>
      <div class="recipe-info">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line meta"></div>
      </div>
    </div>
  `;
}

export function skeletonsHtml(count, options = {}) {
  return Array.from({ length: count }).map(() => skeletonCardHtml(options)).join('');
}

export function emptyRecipesHtml() {
  return `
    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
      <h3 style="color: #7c5c45; font-size: 2rem;">🤷‍♂️ No recipes found</h3>
      <p style="color: #999; font-size: 1.1rem;">Try a different search or category</p>
    </div>
  `;
}

export function emptyFavoritesHtml() {
  return `
    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
      <h3 style="color: #7c5c45; font-size: 2rem;">🤷‍♂️ No favorites found</h3>
      <p style="color: #999; font-size: 1.1rem;">Open a recipe and tap the heart</p>
    </div>
  `;
}

// --- Card templates ---

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

// --- Recipe Detail (Modal) template ---

export function recipeDetailHtml(recipe, isFavorite = false) {
  const ingredients = getIngredients(recipe);
  const favoriteClass = isFavorite ? 'is-favorite' : '';
  const ariaPressed = isFavorite ? 'true' : 'false';
  const ariaLabel = isFavorite ? 'Remove from favorites' : 'Add to favorites';
  const titleText = isFavorite ? 'Unfavorite' : 'Favorite';

  const youtubeHtml = recipe.strYoutube ? `
    <div class="instructions-footer">
      <a href="${recipe.strYoutube}"
         target="_blank"
         rel="noopener noreferrer"
         data-print-url="${formatPrintUrl(recipe.strYoutube)}"
         class="video-link">
        <span class="video-link-icon-wrap" aria-hidden="true">
          <svg class="video-link-icon" viewBox="0 0 24 24" focusable="false">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2.2 6.9 7 3.9-7 3.9V8.9z"/>
          </svg>
        </span>
        <span>Video Tutorial</span>
      </a>
    </div>
  ` : '';

  return `
    <img src="${recipe.strMealThumb}" 
         alt="${recipe.strMeal}" 
         class="recipe-detail-image">
    
    <div class="recipe-detail-content">
      <div class="recipe-title-row">
        <h2 class="recipe-detail-title">${recipe.strMeal}</h2>
        <button type="button"
                class="favorite-btn ${favoriteClass}"
                data-recipe-id="${recipe.idMeal}"
                data-action="toggle-favorite"
                aria-label="${ariaLabel}"
                aria-pressed="${ariaPressed}"
                title="${titleText}">
          <svg class="favorite-btn-svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path class="favorite-heart-fill" d="M12 21s-7.2-4.4-9.6-8.7C.6 8.8 2.3 5.8 5.5 5.2c1.9-.4 3.7.4 4.9 1.8 1.2-1.4 3-2.2 4.9-1.8 3.2.6 4.9 3.6 3.1 7.1C19.2 16.6 12 21 12 21z" fill="currentColor"/>
            <path class="favorite-heart-outline" d="M12 21s-7.2-4.4-9.6-8.7C.6 8.8 2.3 5.8 5.5 5.2c1.9-.4 3.7.4 4.9 1.8 1.2-1.4 3-2.2 4.9-1.8 3.2.6 4.9 3.6 3.1 7.1C19.2 16.6 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <p class="recipe-detail-meta">
        <strong>${recipe.strCategory}</strong> • ${recipe.strArea}
      </p>
      
      <div class="section">
        <h3>📋 Ingredients</h3>
        <ul class="ingredients-list">
          ${ingredients.map((ing) => `<li>${ing}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h3>👨‍🍳 Instructions</h3>
        <div class="instructions">${recipe.strInstructions}</div>
        ${youtubeHtml}
      </div>
      
      <div class="recipe-actions" aria-label="Recipe actions">
        <div class="actions-right" aria-label="Recipe actions right">
          <div class="share-actions" aria-label="Share recipe">
            <button type="button" class="share-icon-btn" data-action="share-facebook" aria-label="Share on Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M14 9.4h2.3V6.7C16 6.7 14.9 6.5 13.6 6.5c-2.3 0-3.7 1.4-3.7 3.9v2.2H7.6v2.7h2.3V20h2.9v-4.7h2.5l.4-2.7h-2.9v-2c0-.8.2-1.2 1.2-1.2z"/>
              </svg>
            </button>
            <button type="button" class="share-icon-btn" data-action="share-instagram" aria-label="Share to Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7.5 3.5h9A4.5 4.5 0 0 1 21 8v8a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16V8a4.5 4.5 0 0 1 4.5-4.5zm9 2h-9A2.5 2.5 0 0 0 5 8v8a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 16V8a2.5 2.5 0 0 0-2.5-2.5z"/>
                <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5z"/>
                <path d="M16.8 7.2a1 1 0 1 1-1-1 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
            <button type="button" class="share-icon-btn" data-action="share-x" aria-label="Share on X" title="X">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 4h3.4l4.1 5.6L16.7 4H20l-6.4 7.6L20.6 20h-3.4l-4.5-6.1L7.3 20H4l6.9-7.9L4 4z"/>
              </svg>
            </button>
          </div>
          <button type="button" class="action-btn print-btn" data-action="print-recipe">
            🖨️ Print Recipe
          </button>
        </div>
      </div>
    </div>
  `;
}
