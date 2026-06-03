import { state } from '../core/state.js';
import { getRecipeDetails } from '../api/api.js';
import {
  readFavoriteIds,
  writeFavoriteIds,
  setFavoriteButtonState,
  isFavoritesOnlyMode,
} from './favorites.js';
import { recipeDetailHtml, favoriteBadgeHtml } from '../ui/templates.js';
import { refreshFavoritesUI } from './views.js';

export async function showRecipe(id) {
  const modal = document.getElementById('recipe-modal');
  const details = document.getElementById('recipe-details');
  modal.style.display = 'block';
  setRecipeInUrl(id);
  details.innerHTML = `
        <div style="text-align:center; padding:3rem;">
            <p style="font-size: 1.2rem; color: #b38b6d;">🍳 Loading recipe...</p>
        </div>
    `;

  const recipe = await getRecipeDetails(id);
  if (!recipe) {
    details.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <h3 style="color: #e74c3c;">😕 Recipe not found</h3>
                <p>Please try another recipe</p>
            </div>
        `;
    return;
  }

  const favorites = readFavoriteIds();
  const isFavorite = favorites.has(String(recipe.idMeal));

  state.currentRecipeForShare = recipe;

  details.innerHTML = recipeDetailHtml(recipe, isFavorite);

  const favoriteBtn = details.querySelector('[data-action="toggle-favorite"]');
  setFavoriteButtonState(favoriteBtn, isFavorite);
}

export function setupModal() {
  const modal = document.getElementById('recipe-modal');
  const closeBtn = document.querySelector('.close');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    clearRecipeFromUrl();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      clearRecipeFromUrl();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      clearRecipeFromUrl();
    }
  });
}

export function setRecipeInUrl(id) {
  if (!id) return;
  const url = new URL(window.location.href);
  url.searchParams.set('recipe', id);
  history.replaceState(null, '', url.toString());
}

export function clearRecipeFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('recipe')) return;
  url.searchParams.delete('recipe');
  history.replaceState(null, '', url.toString());
}

export function getRecipeFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get('recipe');
}

export function getShareUrl() {
  const url = new URL(window.location.href);
  url.hash = '';
  if (state.currentRecipeForShare?.idMeal) {
    url.searchParams.set('recipe', state.currentRecipeForShare.idMeal);
  }
  return url.toString();
}

export function getShareText(recipe) {
  const title = recipe?.strMeal?.trim() || 'Recipe';
  const category = recipe?.strCategory?.trim();
  const area = recipe?.strArea?.trim();
  const meta = [category, area].filter(Boolean).join(' • ');
  return meta ? `${title} — ${meta}` : title;
}

export function getCurrentRecipeForShare() {
  return state.currentRecipeForShare;
}

// Modal actions are co-located here because they attach listeners directly to #recipe-details


export function setupFavorites() {
  const details = document.getElementById('recipe-details');
  if (!details) return;

  details.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-favorite"]');
    if (!btn) return;

    e.preventDefault();

    const id = btn.dataset.recipeId || state.currentRecipeForShare?.idMeal;
    if (!id) return;

    const favorites = readFavoriteIds();
    const key = String(id);
    const shouldFavorite = !favorites.has(key);
    if (shouldFavorite) favorites.add(key); else favorites.delete(key);
    writeFavoriteIds(favorites);
    setFavoriteButtonState(btn, shouldFavorite);

    const cards = document.querySelectorAll(`.recipe-card[data-recipe-id="${key}"]`);
    cards.forEach((card) => {
      card.classList.toggle('is-favorite', shouldFavorite);
      const existingBadge = card.querySelector('.card-favorite');
      if (shouldFavorite && !existingBadge) card.insertAdjacentHTML('afterbegin', favoriteBadgeHtml());
      if (!shouldFavorite && existingBadge) existingBadge.remove();
    });

    state.favoriteRecipesCache = [];
    refreshFavoritesUI();
  });
}

export function setupShareButtons() {
  const details = document.getElementById('recipe-details');
  if (!details) return;

  details.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action^="share-"]');
    if (!btn) return;

    e.preventDefault();
    const recipe = state.currentRecipeForShare;
    const shareUrl = getShareUrl();
    const shareText = getShareText(recipe);

    switch (btn.dataset.action) {
      case 'share-facebook': {
        const url = new URL('https://www.facebook.com/sharer/sharer.php');
        url.searchParams.set('u', shareUrl);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
        break;
      }
      case 'share-x': {
        const url = new URL('https://twitter.com/intent/tweet');
        url.searchParams.set('url', shareUrl);
        url.searchParams.set('text', shareText);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
        break;
      }
      case 'share-instagram': {
        if (navigator.share) {
          try {
            await navigator.share({
              title: recipe?.strMeal || 'Recipe',
              text: shareText,
              url: shareUrl,
            });
          } catch {
            /* user cancelled */
          }
        } else {
          window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
        }
        break;
      }
    }
  });
}

export function setupPrintRecipe() {
  const details = document.getElementById('recipe-details');
  if (!details) return;

  const cleanup = () => {
    document.body.classList.remove('print-mode');
    document.title = state.ORIGINAL_TITLE;
  };

  window.addEventListener('afterprint', cleanup);

  details.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="print-recipe"]');
    if (!btn) return;
    e.preventDefault();
    const titleEl = document.querySelector('.recipe-detail-title');
    const recipeTitle = titleEl?.textContent?.trim();
    if (recipeTitle) document.title = recipeTitle;

    document.body.classList.add('print-mode');
    window.addEventListener('focus', cleanup, { once: true });
    window.print();
  });
}
