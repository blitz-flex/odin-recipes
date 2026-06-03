import { state } from '../core/state.js';
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '../core/config.js';
import { isFavoritesOnlyMode } from './favorites.js';
import { showLoading, renderRecipes, setActiveCategory } from '../ui/ui.js';
import { searchRecipes, getRandomRecipes } from '../api/api.js';
import { renderFavoritesOnlyView } from './views.js';

export function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return; // defensive guard (consistent with other setup* functions)

  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (isFavoritesOnlyMode()) {
        state.currentMode = 'favorites';
        state.currentQuery = query;
        await renderFavoritesOnlyView();
        return;
      }
      if (query.length >= MIN_SEARCH_LENGTH) {
        state.currentMode = 'search';
        state.currentQuery = query;
        state.currentCategory = 'all';
        setActiveCategory('all');
        showLoading();
        const recipes = await searchRecipes(query);
        renderRecipes(recipes);
      } else if (query.length === 0) {
        state.currentMode = 'random';
        state.currentQuery = '';
        state.currentCategory = 'all';
        setActiveCategory('all');
        showLoading();
        const recipes = await getRandomRecipes(state.PAGE_SIZE);
        renderRecipes(recipes);
      }
    }, SEARCH_DEBOUNCE_MS);
  });
}
