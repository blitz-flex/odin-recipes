import { state } from '../core/state.js';
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '../core/config.js';
import { isFavoritesOnlyMode } from './favorites.js';
import { showLoading, renderRecipes } from '../ui/ui.js';
import { searchRecipes, getRandomRecipes } from '../api/api.js';
import { renderFavoritesOnlyView } from './views.js';
import { updateCategoryLabel } from './categories.js';

export function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
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
        showLoading();
        renderRecipes(await searchRecipes(query));
      } else if (query.length === 0) {
        state.currentMode = 'random';
        state.currentQuery = '';
        state.currentCategory = 'all';
        showLoading();
        renderRecipes(await getRandomRecipes(state.PAGE_SIZE));
      }

      updateCategoryLabel();
    }, SEARCH_DEBOUNCE_MS);
  });
}
