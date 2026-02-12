export const state = {
  allRecipes: [],
  displayedRecipes: [],
  PAGE_SIZE: 12,
  currentMode: 'random', // 'random' | 'search' | 'category' | 'favorites'
  currentCategory: 'all',
  currentQuery: '',
  ORIGINAL_TITLE: document.title,
  currentRecipeForShare: null,
  FAVORITES_STORAGE_KEY: 'odin_recipes_favorites_v1',
  favoritesOnlySnapshot: null,
  favoriteRecipesCache: [],
};
