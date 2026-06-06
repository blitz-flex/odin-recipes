import { state } from '../core/state.js';
import { EXCLUDED_CATEGORIES, API_BASE_URL } from '../core/config.js';
import { getRandomRecipes, filterByCategory } from '../api/api.js';
import { showLoading, renderRecipes } from '../ui/ui.js';
import { isFavoritesOnlyMode } from './favorites.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_CATEGORY_NAMES = [
  'Breakfast', 'Vegetarian', 'Chicken', 'Beef', 'Seafood',
  'Pork', 'Lamb', 'Pasta', 'Side', 'Dessert',
];

const CHECK_ICON = `
  <svg class="cat-option-check" viewBox="0 0 24 24" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor"
      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>
`;

// ─── Category filtering ───────────────────────────────────────────────────────

const EXCLUDED_SET = new Set(EXCLUDED_CATEGORIES.map((n) => n.toLowerCase()));

function removeExcluded(categories) {
  return categories.filter((cat) => !EXCLUDED_SET.has(cat.strCategory?.toLowerCase()));
}

// ─── Category fetching ────────────────────────────────────────────────────────

let cachedCategories = null;

async function fetchCategories() {
  if (cachedCategories) return cachedCategories;
  try {
    const res = await fetch(`${API_BASE_URL}/categories.php`);
    const data = await res.json();
    cachedCategories = removeExcluded(data.categories || []);
    return cachedCategories;
  } catch {
    console.warn('Categories fetch failed, using fallback list');
    const basic = FALLBACK_CATEGORY_NAMES.map((name) => ({ strCategory: name, strCategoryThumb: '' }));
    cachedCategories = removeExcluded(basic);
    return cachedCategories;
  }
}

// ─── Toggle label (exported for other modules) ────────────────────────────────

export function updateCategoryLabel() {
  const btn = document.getElementById('categories-toggle');
  const textEl = btn?.querySelector('.cat-text');
  if (!textEl) return;

  const cat = state.currentCategory;
  const isFiltered = Boolean(cat && cat !== 'all');

  textEl.textContent = isFiltered ? cat : 'Categories';
  btn.classList.toggle('has-filter', isFiltered);
  btn.setAttribute('title', isFiltered ? `Filtered by ${cat}` : 'Select category');
  btn.setAttribute('aria-label', isFiltered ? `Filter by category (currently ${cat})` : 'Filter by category');
}

// ─── Favorites-mode cleanup ───────────────────────────────────────────────────

function exitFavoritesMode() {
  if (!isFavoritesOnlyMode()) return;
  document.body.classList.remove('favorites-only');
  state.favoritesOnlySnapshot = null;
  const favBtn = document.getElementById('favorites-toggle');
  favBtn?.setAttribute('aria-pressed', 'false');
  favBtn?.setAttribute('aria-label', 'Jump to favorites');
  favBtn?.setAttribute('title', 'Favorites');
}

// ─── Category application ─────────────────────────────────────────────────────

async function applyCategory(categoryName, searchInput) {
  exitFavoritesMode();
  searchInput.value = '';
  state.currentQuery = '';
  showLoading();

  if (categoryName === 'all') {
    state.currentCategory = 'all';
    state.currentMode = 'random';
    renderRecipes(await getRandomRecipes(state.PAGE_SIZE));
  } else {
    state.currentCategory = categoryName;
    state.currentMode = 'category';
    renderRecipes(await filterByCategory(categoryName));
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(updateCategoryLabel, 50);
}

// ─── Option active state ──────────────────────────────────────────────────────

function syncActiveOption(dropdownList, activeCategoryName) {
  dropdownList.querySelectorAll('.cat-option').forEach((opt) => {
    const isActive = opt.dataset.category === activeCategoryName;
    opt.classList.toggle('active', isActive);
    opt.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

// ─── Option DOM builder ───────────────────────────────────────────────────────

function buildCatOption(cat, currentSelected, onClick) {
  const isAll = cat.strCategory === 'all';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `cat-option${isAll ? ' cat-option-all' : ''}`;
  btn.dataset.category = cat.strCategory;
  btn.setAttribute('role', 'menuitemradio');
  btn.setAttribute('aria-checked', currentSelected === cat.strCategory ? 'true' : 'false');
  btn.setAttribute('aria-label', isAll ? 'Show all recipes' : cat.strCategory);
  if (currentSelected === cat.strCategory) btn.classList.add('active');

  const img = cat.strCategoryThumb || 'https://www.themealdb.com/images/category/beef.png';
  const thumbHtml = isAll
    ? `<span class="cat-option-thumb cat-option-thumb-all" aria-hidden="true">🍳</span>`
    : `<span class="cat-option-thumb"><img src="${img}" alt="" loading="lazy"></span>`;

  btn.innerHTML = `
    ${thumbHtml}
    <span class="cat-option-label">${isAll ? 'All recipes' : cat.strCategory}</span>
    <span class="cat-option-mark">${CHECK_ICON}</span>
  `;

  btn.addEventListener('click', () => onClick(btn.dataset.category));
  return btn;
}

// ─── List population ──────────────────────────────────────────────────────────

async function populateCategoryList(dropdownList, onClick) {
  dropdownList.innerHTML = '';
  const currentSelected = state.currentCategory || 'all';
  const cats = await fetchCategories();

  dropdownList.appendChild(buildCatOption({ strCategory: 'all', strCategoryThumb: '' }, currentSelected, onClick));
  cats.forEach((cat) => dropdownList.appendChild(buildCatOption(cat, currentSelected, onClick)));
}

// ─── Panel open/close ─────────────────────────────────────────────────────────

function setPanelOpen(panel, backdrop, toggleBtn, isOpen) {
  panel.classList.toggle('open', isOpen);
  backdrop.classList.toggle('open', isOpen);
  document.body.classList.toggle('categories-open', isOpen);
  panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ─── Public setup ─────────────────────────────────────────────────────────────

export function setupCategories() {
  const searchInput = document.getElementById('search-input');
  const toggleBtn = document.getElementById('categories-toggle');
  const panel = document.getElementById('category-panel');
  const backdrop = document.getElementById('category-backdrop');
  const dropdownList = document.getElementById('dropdown-category-list');

  if (!searchInput || !toggleBtn || !panel || !backdrop || !dropdownList) return;

  const open = () => setPanelOpen(panel, backdrop, toggleBtn, true);
  const close = () => setPanelOpen(panel, backdrop, toggleBtn, false);
  const isOpen = () => panel.classList.contains('open');

  const onSelect = async (catName) => {
    const isDeselect = catName === (state.currentCategory || 'all') && catName !== 'all';
    const target = isDeselect ? 'all' : catName;
    close();
    await applyCategory(target, searchInput);
    syncActiveOption(dropdownList, target);
  };

  toggleBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (isOpen()) {
      close();
    } else {
      open();
      await populateCategoryList(dropdownList, onSelect);
    }
  });

  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
      toggleBtn.focus();
    }
  });

  setTimeout(updateCategoryLabel, 120);
}
