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

/**
 * Derive consistent timing + difficulty for visual polish.
 * TheMealDB doesn't provide this data, so we generate stable pseudo-values per recipe.
 */
export function getRecipeTiming(recipe) {
  const id = parseInt(String(recipe.idMeal || '0'), 10);
  const times = [12, 15, 18, 20, 22, 25, 28, 30, 35, 40];
  const difficulties = ['Easy', 'Easy', 'Medium', 'Easy', 'Medium'];

  const time = times[id % times.length];
  const difficulty = difficulties[id % difficulties.length];

  return {
    timeLabel: `${time} min`,
    difficulty,
  };
}

/**
 * Get a nice short category label for tags.
 */
export function getCategoryTag(recipe) {
  return recipe.strCategory || '';
}

/**
 * Generate plausible recipe meta for the detail view (seeded for consistency).
 */
export function getRecipeDetailMeta(recipe) {
  const id = parseInt(String(recipe.idMeal || '0'), 10);
  const serves = 2 + (id % 6); // 2-7 servings
  const times = [25, 30, 35, 40, 45, 50, 55, 60];
  const time = times[id % times.length];
  const cals = 280 + (id % 18) * 25; // ~280-700 cal

  return {
    serves: `Serves ${serves}`,
    time: `${time} min`,
    calories: `${cals} cal/serving`,
  };
}

/**
 * Build nice tag pills for the detail modal.
 */
export function getDetailTags(recipe) {
  const tags = [];
  const cat = recipe.strCategory;
  const area = recipe.strArea;

  if (cat) {
    // Map some to nicer labels
    const labelMap = {
      'Beef': 'Main Course',
      'Chicken': 'Main Course',
      'Pork': 'Main Course',
      'Lamb': 'Main Course',
      'Seafood': 'Seafood',
      'Vegetarian': 'Vegetarian',
      'Dessert': 'Dessert',
      'Breakfast': 'Breakfast',
      'Pasta': 'Pasta',
    };
    const mainLabel = labelMap[cat] || cat;
    tags.push({ label: mainLabel, type: 'main' });
    tags.push({ label: cat, type: 'category' });
  }

  if (area) {
    tags.push({ label: `${area} Origin`, type: 'origin' });
  }

  return tags;
}

/** Best available image URL for display and print (prefers hi-res source when API provides it). */
export function getRecipeImageUrl(recipe) {
  const source = recipe?.strImageSource?.trim();
  if (source) return source;
  return recipe?.strMealThumb?.trim() || '';
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
      <div class="recipe-media">
        <div class="recipe-image"></div>
      </div>
      <div class="recipe-body">
        <div class="skeleton-line title"></div>
        <div class="skeleton-tags">
          <div class="skeleton-line tag"></div>
        </div>
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
    <div class="empty-ledger">
      <h3 class="empty-ledger-title">🤷 No recipes found</h3>
      <p class="empty-ledger-text">Try a different search or category.</p>
    </div>
  `;
}

export function emptyFavoritesHtml() {
  return `
    <div class="empty-ledger">
      <h3 class="empty-ledger-title">💔 No favorites found</h3>
      <p class="empty-ledger-text">Open a recipe and tap the heart.</p>
    </div>
  `;
}

// --- Card templates ---

export function recipeCardHtml(recipe, favoritesSet) {
  const favorites = favoritesSet ?? readFavoriteIds();
  const isFavorite = favorites.has(String(recipe.idMeal));
  const { timeLabel, difficulty } = getRecipeTiming(recipe);
  const category = getCategoryTag(recipe);
  const title = recipe.strMeal || 'Recipe';

  return `
    <button type="button" class="recipe-card ${isFavorite ? 'is-favorite' : ''}" data-recipe-id="${recipe.idMeal}">
      <div class="recipe-media">
        <img src="${recipe.strMealThumb}" 
             alt="${title}" 
             class="recipe-image"
             loading="lazy">
        <span role="button"
              tabindex="0"
              class="card-heart ${isFavorite ? 'active' : ''}"
              data-action="toggle-favorite"
              data-recipe-id="${recipe.idMeal}"
              aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
              title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path class="heart-fill" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            <path class="heart-stroke" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </span>
      </div>

      <div class="recipe-body">
        <h3 class="recipe-title">${title}</h3>

        ${category ? `
          <div class="recipe-tags">
            <span class="recipe-tag" data-category="${category}">${category}</span>
          </div>
        ` : ''}

        <div class="recipe-meta">
          <span class="meta-time">${timeLabel}</span>
          <span class="meta-sep">•</span>
          <span class="meta-difficulty">${difficulty}</span>
        </div>
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
  const titleText = isFavorite ? 'Remove from favorites' : 'Add to favorites';

  const { serves, time, calories } = getRecipeDetailMeta(recipe);
  const detailTags = getDetailTags(recipe);

  const tagsHtml = detailTags.length ? `
    <div class="recipe-detail-tags">
      ${detailTags.map(t => `<span class="detail-tag" data-type="${t.type}">${t.label}</span>`).join('')}
    </div>
  ` : '';

  const ingredientsHtml = ingredients.map((ing) => `
    <li class="ingredient-item">${ing}</li>
  `).join('');

  const imageUrl = getRecipeImageUrl(recipe);

  const youtubeHtml = recipe.strYoutube ? `
    <a href="${recipe.strYoutube}" target="_blank" rel="noopener noreferrer"
       class="video-link-inline" data-print-url="${formatPrintUrl(recipe.strYoutube)}">
      ▶ Watch Video Tutorial
    </a>
  ` : '';

  return `
    <header class="print-sheet-header" aria-hidden="true">
      <div class="print-brand-lockup">
        <span class="print-brand-mark" aria-hidden="true">🍳</span>
        <span class="print-brand-name">Odin Recipes</span>
      </div>
      <p class="print-brand-tagline">From the Hearth of Wisdom</p>
    </header>

    <figure class="print-hero-photo" aria-hidden="true">
      <img src="${imageUrl}"
           alt=""
           class="print-hero-img"
           decoding="sync"
           fetchpriority="high">
    </figure>

    <div class="recipe-detail-hero">
      <img src="${imageUrl}"
           alt=""
           class="recipe-detail-hero-img"
           decoding="async">
      <div class="recipe-detail-hero-overlay" aria-hidden="true"></div>
      <button type="button"
              class="favorite-pill ${favoriteClass}"
              data-recipe-id="${recipe.idMeal}"
              data-action="toggle-favorite"
              aria-label="${ariaLabel}"
              aria-pressed="${ariaPressed}"
              title="${titleText}">
        <svg class="favorite-pill-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path class="heart-fill"
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          <path class="heart-stroke"
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>
      <div class="recipe-detail-hero-content">
        <h2 id="recipe-modal-title" class="recipe-detail-title">${recipe.strMeal}</h2>
      </div>
    </div>

    <div class="recipe-detail-scroll">
      <div class="recipe-detail-intro">
        ${tagsHtml}
        <div class="recipe-detail-meta">
          <span class="meta-chip"><span class="meta-chip-icon" aria-hidden="true">👥</span>${serves}</span>
          <span class="meta-chip"><span class="meta-chip-icon" aria-hidden="true">⏱</span>${time}</span>
          <span class="meta-chip"><span class="meta-chip-icon" aria-hidden="true">🔥</span>${calories}</span>
        </div>
      </div>

      <div class="recipe-detail-body">
        <div class="recipe-columns">
          <section class="recipe-panel ingredients-col" aria-labelledby="modal-ingredients-title">
            <h3 id="modal-ingredients-title" class="col-title">Ingredients</h3>
            <ul class="ingredients-list">
              ${ingredientsHtml}
            </ul>
          </section>

          <section class="recipe-panel instructions-col" aria-labelledby="modal-instructions-title">
            <h3 id="modal-instructions-title" class="col-title">Instructions</h3>
            <div class="instructions">${recipe.strInstructions}</div>
            ${youtubeHtml}
          </section>
        </div>
      </div>
    </div>

    <footer class="print-sheet-footer" aria-hidden="true">
      <span class="print-footer-note">Printed from Odin Recipes</span>
    </footer>

    <footer class="recipe-actions">
      <div class="share-actions">
        <button type="button" class="share-icon-btn" data-action="share-facebook" aria-label="Share on Facebook" title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 9.4h2.3V6.7C16 6.7 14.9 6.5 13.6 6.5c-2.3 0-3.7 1.4-3.7 3.9v2.2H7.6v2.7h2.3V20h2.9v-4.7h2.5l.4-2.7h-2.9v-2c0-.8.2-1.2 1.2-1.2z"/></svg>
        </button>
        <button type="button" class="share-icon-btn" data-action="share-instagram" aria-label="Share to Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.5 3.5h9A4.5 4.5 0 0 1 21 8v8a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16V8a4.5 4.5 0 0 1 4.5-4.5zm9 2h-9A2.5 2.5 0 0 0 5 8v8a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 16V8a2.5 2.5 0 0 0-2.5-2.5z"/><path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5z"/><path d="M16.8 7.2a1 1 0 1 1-1-1 1 1 0 0 1 1 1z"/></svg>
        </button>
        <button type="button" class="share-icon-btn" data-action="share-x" aria-label="Share on X" title="X">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 4h3.4l4.1 5.6L16.7 4H20l-6.4 7.6L20.6 20h-3.4l-4.5-6.1L7.3 20H4l6.9-7.9L4 4z"/></svg>
        </button>
      </div>

      <button type="button" class="action-btn print-btn" data-action="print-recipe">
        🖨️ Print Recipe
      </button>
    </footer>
  `;
}
