import { state } from '../core/state.js';
import { getRecipeDetails } from '../api/api.js';

export function readFavoriteIds() {
  try {
    const raw = localStorage.getItem(state.FAVORITES_STORAGE_KEY);
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
    localStorage.setItem(state.FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
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
