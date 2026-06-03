import { FAVORITES_STORAGE_KEY, PAGE_SIZE_TABLET } from './config.js';

export const state = {
  allRecipes: [],
  displayedRecipes: [],
  PAGE_SIZE: PAGE_SIZE_TABLET,
  currentMode: 'random', // 'random' | 'search' | 'category' | 'favorites'
  currentCategory: 'all',
  currentQuery: '',
  ORIGINAL_TITLE: document.title,
  currentRecipeForShare: null,
  FAVORITES_STORAGE_KEY: FAVORITES_STORAGE_KEY,
  favoritesOnlySnapshot: null,
  favoriteRecipesCache: [],
};
