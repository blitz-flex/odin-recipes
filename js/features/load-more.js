import { state } from '../core/state.js';
import {
  PAGE_SIZE_MOBILE,
  PAGE_SIZE_TABLET,
  PAGE_SIZE_DESKTOP,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
} from '../core/config.js';
import { isFavoritesOnlyMode } from './favorites.js';
import { updateLoadMoreVisibility } from '../ui/ui.js';
import { recipeCardHtml } from '../ui/templates.js';
import { readFavoriteIds } from './favorites.js';
import { skeletonsHtml } from '../ui/templates.js';
import { getRandomRecipes } from '../api/api.js';

// ─── Page-size resolution ─────────────────────────────────────────────────────

const BREAKPOINT_MAP = [
  { maxWidth: MOBILE_BREAKPOINT, size: PAGE_SIZE_MOBILE },
  { maxWidth: TABLET_BREAKPOINT, size: PAGE_SIZE_TABLET },
];

function resolvePageSize(viewportWidth) {
  const match = BREAKPOINT_MAP.find(({ maxWidth }) => viewportWidth <= maxWidth);
  return match?.size ?? PAGE_SIZE_DESKTOP;
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function getRecipesContainer() {
  return document.getElementById('recipes-container');
}

// ─── Skeleton placeholders ────────────────────────────────────────────────────

function insertSkeletonPlaceholders(container) {
  container.insertAdjacentHTML('beforeend', skeletonsHtml(state.PAGE_SIZE, { placeholder: true }));
  return [...container.querySelectorAll('.recipe-card[data-placeholder="true"]')];
}

function removePlaceholders(placeholders) {
  placeholders.forEach((el) => el.remove());
}

// ─── Button loading state ─────────────────────────────────────────────────────

function setButtonBusy(btn) {
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = 'Loading…';
}

function setButtonIdle(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText ?? 'Load More';
  delete btn.dataset.originalText;
}

// ─── Recipe appending strategies ──────────────────────────────────────────────

function cardsHtml(recipes) {
  const favSet = readFavoriteIds();
  return recipes.map((r) => recipeCardHtml(r, favSet)).join('');
}

async function appendRandomRecipes(container) {
  const loadedIds = new Set(state.allRecipes.map((r) => r.idMeal));
  const newRecipes = await getRandomRecipes(state.PAGE_SIZE, loadedIds);

  state.allRecipes = [...state.allRecipes, ...newRecipes];
  state.displayedRecipes = [...state.displayedRecipes, ...newRecipes];
  container.insertAdjacentHTML('beforeend', cardsHtml(newRecipes));
}

function appendPagedRecipes(container) {
  const { allRecipes, displayedRecipes, PAGE_SIZE } = state;
  const nextSlice = allRecipes.slice(displayedRecipes.length, displayedRecipes.length + PAGE_SIZE);

  state.displayedRecipes = [...displayedRecipes, ...nextSlice];
  container.insertAdjacentHTML('beforeend', cardsHtml(nextSlice));
}

// ─── Main handler ─────────────────────────────────────────────────────────────

async function handleLoadMore(btn) {
  const container = getRecipesContainer();
  if (!container) return;

  const placeholders = insertSkeletonPlaceholders(container);
  setButtonBusy(btn);

  try {
    if (state.currentMode === 'random') {
      await appendRandomRecipes(container);
    } else {
      appendPagedRecipes(container);
    }
  } finally {
    removePlaceholders(placeholders);
    setButtonIdle(btn);
    updateLoadMoreVisibility();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function setupLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;

  btn.addEventListener('click', () => handleLoadMore(btn));
}

export function updatePageSize() {
  const newSize = resolvePageSize(window.innerWidth);
  if (state.PAGE_SIZE === newSize) return;

  const previousCount = state.displayedRecipes.length;
  state.PAGE_SIZE = newSize;

  // nothing to re-render yet, or favorites view manages its own display
  if (!state.allRecipes.length || isFavoritesOnlyMode()) return;

  // preserve already-loaded items on resize (avoid losing "Load More" progress)
  const targetCount = Math.max(previousCount || newSize, newSize);
  state.displayedRecipes = state.allRecipes.slice(0, Math.min(targetCount, state.allRecipes.length));

  const container = getRecipesContainer();
  if (!container) return;

  container.innerHTML = cardsHtml(state.displayedRecipes);
  updateLoadMoreVisibility();
}
