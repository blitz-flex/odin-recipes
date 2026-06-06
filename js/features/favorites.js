import { state } from '../core/state.js';
import { FAVORITES_STORAGE_KEY } from '../core/config.js';
import { getRecipeDetails } from '../api/api.js';

export function readFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
}

export function writeFavoriteIds(favoriteIds) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
    return true;
  } catch {
    return false;
  }
}

export function setFavoriteButtonState(button, isFavorite) {
  if (!button) return;
  button.classList.toggle('is-favorite', isFavorite);
  button.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
  button.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
  button.setAttribute('title', isFavorite ? 'Unfavorite' : 'Favorite');
}

export function isFavoritesOnlyMode() {
  return document.body.classList.contains('favorites-only');
}

export function filterFavoriteRecipes(recipes, query, category) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const normalizedCategory = String(category || '').trim();

  return recipes.filter((recipe) => {
    const matchesQuery = normalizedQuery
      ? String(recipe?.strMeal || '').toLowerCase().includes(normalizedQuery)
      : true;

    const matchesCategory = normalizedCategory && normalizedCategory !== 'all'
      ? String(recipe?.strCategory || '') === normalizedCategory
      : true;

    return matchesQuery && matchesCategory;
  });
}

export async function loadFavoriteRecipes() {
  const favoriteIds = Array.from(readFavoriteIds());
  if (favoriteIds.length === 0) {
    state.favoriteRecipesCache = [];
    return [];
  }

  const recipes = (await Promise.all(
    favoriteIds.map(async (id) => getRecipeDetails(id))
  )).filter(Boolean);

  state.favoriteRecipesCache = recipes;
  return recipes;
}

/**
 * Core toggle logic. Returns the new favorite state (true = now favorited).
 */
export function toggleFavoriteById(id) {
  const key = String(id);
  const favorites = readFavoriteIds();
  const shouldFavorite = !favorites.has(key);

  if (shouldFavorite) {
    favorites.add(key);
  } else {
    favorites.delete(key);
  }
  writeFavoriteIds(favorites);

  // Invalidate cache so favorites view refreshes correctly
  state.favoriteRecipesCache = [];

  return shouldFavorite;
}

/**
 * Update all visible cards + header count for a given recipe id.
 * Call this after any favorite change.
 */
export function updateFavoriteUIForId(id, isFavorite) {
  const key = String(id);

  // Update all matching cards in the grid
  const cards = document.querySelectorAll(`.recipe-card[data-recipe-id="${key}"]`);
  cards.forEach((card) => {
    card.classList.toggle('is-favorite', isFavorite);

    const heart = card.querySelector('.card-heart');
    if (heart) {
      heart.classList.toggle('active', isFavorite);
      heart.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
      heart.setAttribute('title', isFavorite ? 'Remove from favorites' : 'Add to favorites');
    }
  });

  // Update header count
  updateFavoritesCountBadge();
}

/**
 * Update the favorites count number in the header button (badge design).
 */
export function updateFavoritesCountBadge() {
  const countEl = document.getElementById('favorites-count');
  if (!countEl) return;

  const count = readFavoriteIds().size;
  countEl.textContent = count > 0 ? count : '';
  countEl.classList.toggle('has-count', count > 0);
}
