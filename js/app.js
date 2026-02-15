import { state } from './state.js';
import {
  PAGE_SIZE_MOBILE,
  PAGE_SIZE_TABLET,
  PAGE_SIZE_DESKTOP,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SEARCH_DEBOUNCE_MS,
  MIN_SEARCH_LENGTH,
} from './config.js';
import { setupDarkMode, setupStickyControlsBar } from './theme.js';
import { getRandomRecipes, searchRecipes, filterByCategory } from './api.js';
import {
  readFavoriteIds,
  writeFavoriteIds,
  setFavoriteButtonState,
  isFavoritesOnlyMode,
  filterFavoriteRecipes,
  loadFavoriteRecipes,
} from './favorites.js';
import {
  showLoading,
  renderRecipes,
  updateLoadMoreVisibility,
  setActiveCategory,
  recipeCardHtml,
  renderRecipeList,
  favoriteBadgeHtml,
} from './ui.js';
import {
  showRecipe,
  setupModal,
  getRecipeFromUrl,
  getShareUrl,
  getShareText,
} from './modal.js';

// Snapshot helpers
function snapshotCurrentView() {
  const searchInput = document.getElementById('search-input');
  return {
    currentMode: state.currentMode,
    currentCategory: state.currentCategory,
    currentQuery: state.currentQuery,
    allRecipes: Array.isArray(state.allRecipes) ? [...state.allRecipes] : [],
    displayedRecipes: Array.isArray(state.displayedRecipes) ? [...state.displayedRecipes] : [],
    searchValue: searchInput?.value || '',
  };
}

function restoreSnapshot(snapshot) {
  if (!snapshot) return;
  state.currentMode = snapshot.currentMode;
  state.currentCategory = snapshot.currentCategory;
  state.currentQuery = snapshot.currentQuery;
  state.allRecipes = snapshot.allRecipes;
  state.displayedRecipes = snapshot.displayedRecipes;

  const container = document.getElementById('recipes-container');
  if (container) {
    container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r)).join('');
    container.setAttribute('aria-busy', 'false');
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = snapshot.searchValue;
  setActiveCategory(snapshot.currentCategory || 'all');
  updateLoadMoreVisibility();
}

// Favorites-only view
async function renderFavoritesOnlyView() {
  const container = document.getElementById('recipes-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!container) return;
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';

  container.innerHTML = Array.from({ length: Math.min(state.PAGE_SIZE, 6) }).map(() => `
        <div class="recipe-card skeleton-card" aria-hidden="true">
            <div class="recipe-image"></div>
            <div class="recipe-info">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line meta"></div>
            </div>
        </div>
    `).join('');

  const recipes = state.favoriteRecipesCache.length ? state.favoriteRecipesCache : await loadFavoriteRecipes();
  const filtered = filterFavoriteRecipes(recipes, state.currentQuery, state.currentCategory);
  state.allRecipes = filtered;
  state.displayedRecipes = filtered;
  state.currentMode = 'favorites';

  renderRecipeList(container, filtered);
}

async function refreshFavoritesUI() {
  if (!isFavoritesOnlyMode()) return;
  await renderFavoritesOnlyView();
}

// Setup functions
function setupRecipeGridInteractions() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (!id) return;
    showRecipe(id);
  });
}

function setupFavoritesGridInteractions() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = card.dataset.recipeId;
    if (!id) return;
    showRecipe(id);
  });
}

function setupFavoritesToggle() {
  const btn = document.getElementById('favorites-toggle');
  const recipesContainer = document.getElementById('recipes-container');
  if (!btn || !recipesContainer) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (isFavoritesOnlyMode()) {
      document.body.classList.remove('favorites-only');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Jump to favorites');
      btn.setAttribute('title', 'Favorites');
      if (state.favoritesOnlySnapshot) {
        restoreSnapshot(state.favoritesOnlySnapshot);
        state.favoritesOnlySnapshot = null;
      } else {
        showLoading();
        const random = await getRandomRecipes(state.PAGE_SIZE);
        renderRecipes(random, true);
      }
      return;
    }

    state.favoritesOnlySnapshot = snapshotCurrentView();
    document.body.classList.add('favorites-only');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Favorites only');
    btn.setAttribute('title', 'Favorites');
    state.currentCategory = 'all';
    state.currentQuery = '';
    setActiveCategory('all');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    await renderFavoritesOnlyView();
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
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

function setupCategories() {
  const categoriesEl = document.querySelector('.categories-bar');
  const searchInput = document.getElementById('search-input');
  if (!categoriesEl || !searchInput) return;

  categoriesEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;

    if (isFavoritesOnlyMode()) {
      document.body.classList.remove('favorites-only');
      state.favoritesOnlySnapshot = null;
      const favoritesToggle = document.getElementById('favorites-toggle');
      favoritesToggle?.setAttribute('aria-pressed', 'false');
      favoritesToggle?.setAttribute('aria-label', 'Favorites only');
      favoritesToggle?.setAttribute('title', 'Favorites');
    }

    const category = btn.dataset.category;
    setActiveCategory(category);
    searchInput.value = '';
    state.currentQuery = '';
    state.currentCategory = category;
    showLoading();

    let recipes;
    if (category === 'all') {
      state.currentMode = 'random';
      recipes = await getRandomRecipes(state.PAGE_SIZE);
    } else {
      state.currentMode = 'category';
      recipes = await filterByCategory(category);
    }

    renderRecipes(recipes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupShareButtons() {
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

function setupFavorites() {
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

function setupPrintRecipe() {
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
    if (recipeTitle) document.title = `${recipeTitle} — Print`;
    document.body.classList.add('print-mode');
    window.addEventListener('focus', cleanup, { once: true });
    window.print();
  });
}

function setupLoadMore() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', async () => {
    loadMoreBtn.disabled = true;
    const previousText = loadMoreBtn.textContent;
    loadMoreBtn.textContent = 'Loading...';

    const container = document.getElementById('recipes-container');
    const placeholderCards = [];
    if (container) {
      for (let i = 0; i < state.PAGE_SIZE; i++) {
        const card = document.createElement('div');
        card.className = 'recipe-card skeleton-card';
        card.setAttribute('aria-hidden', 'true');
        card.setAttribute('data-placeholder', 'true');
        card.innerHTML = `
                    <div class="recipe-image"></div>
                    <div class="recipe-info">
                        <div class="skeleton-line title"></div>
                        <div class="skeleton-line meta"></div>
                    </div>
                `;
        placeholderCards.push(card);
        container.appendChild(card);
      }
    }

    try {
      if (state.currentMode === 'random') {
        const newRecipes = await getRandomRecipes(state.PAGE_SIZE);
        state.allRecipes = [...state.allRecipes, ...newRecipes];
        state.displayedRecipes = [...state.displayedRecipes, ...newRecipes];
        placeholderCards.forEach((el) => el.remove());
        container.insertAdjacentHTML('beforeend', newRecipes.map((r) => recipeCardHtml(r)).join(''));
      } else {
        const nextRecipes = state.allRecipes.slice(state.displayedRecipes.length, state.displayedRecipes.length + state.PAGE_SIZE);
        state.displayedRecipes = [...state.displayedRecipes, ...nextRecipes];
        placeholderCards.forEach((el) => el.remove());
        container.insertAdjacentHTML('beforeend', nextRecipes.map((r) => recipeCardHtml(r)).join(''));
      }
    } finally {
      placeholderCards.forEach((el) => el.remove());
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = previousText;
      updateLoadMoreVisibility();
    }
  });
}

function updatePageSize() {
  const width = window.innerWidth;
  let newSize;
  if (width <= MOBILE_BREAKPOINT) {
    newSize = PAGE_SIZE_MOBILE;
  } else if (width <= TABLET_BREAKPOINT) {
    newSize = PAGE_SIZE_TABLET;
  } else {
    newSize = PAGE_SIZE_DESKTOP;
  }

  if (state.PAGE_SIZE !== newSize) {
    state.PAGE_SIZE = newSize;
    // If we're already viewing recipes, re-render the list with the new PAGE_SIZE
    if (state.allRecipes.length > 0 && !isFavoritesOnlyMode()) {
      state.displayedRecipes = state.allRecipes.slice(0, state.PAGE_SIZE);
      const container = document.getElementById('recipes-container');
      if (container) {
        container.innerHTML = state.displayedRecipes.map((r) => recipeCardHtml(r)).join('');
        updateLoadMoreVisibility();
      }
    }
  }
}

// Initialization
window.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  setupDarkMode();
  setupStickyControlsBar();
  setupRecipeGridInteractions();
  setupFavoritesGridInteractions();
  setupFavoritesToggle();
  setActiveCategory('all');

  updatePageSize();
  window.addEventListener('resize', updatePageSize);

  const recipes = await getRandomRecipes(state.PAGE_SIZE);
  renderRecipes(recipes, true);

  setupSearch();
  setupCategories();
  setupModal();
  setupFavorites();
  setupShareButtons();
  setupPrintRecipe();
  setupLoadMore();

  refreshFavoritesUI();

  const recipeFromUrl = getRecipeFromUrl();
  if (recipeFromUrl) await showRecipe(recipeFromUrl);
});
