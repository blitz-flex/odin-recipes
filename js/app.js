// ============================================
// Dark Mode Toggle
// ============================================

let allRecipes = [];
let displayedRecipes = [];
const PAGE_SIZE = 9;

let currentMode = 'random'; // 'random' | 'search' | 'category'
let currentCategory = 'all';
let currentQuery = '';
const ORIGINAL_TITLE = document.title;
let currentRecipeForShare = null;

function setupDarkMode() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if(!toggleBtn) return;

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if(shouldUseDark) {
        document.body.classList.add('dark-mode');
    }

    const syncToggleState = () => {
        const isDark = document.body.classList.contains('dark-mode');
        toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        toggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        syncToggleState();
        console.log(`🌙 Theme: ${isDark ? 'Dark' : 'Light'}`);
    });

    syncToggleState();
    
    console.log('✅ Dark mode ready');
}

// ============================================
// Sticky Controls Bar (quiet until scrolling)
// ============================================

function setupStickyControlsBar() {
    const controlsBar = document.querySelector('.controls-bar');
    if(!controlsBar) return;
    const recipesContainer = document.getElementById('recipes-container');
    const triggerOffsetPx = 12;

    let ticking = false;
    const update = () => {
        const controlsRect = controlsBar.getBoundingClientRect();
        const isStuck = recipesContainer
            ? recipesContainer.getBoundingClientRect().top <= (controlsRect.bottom + triggerOffsetPx)
            : controlsRect.top <= -triggerOffsetPx;
        controlsBar.classList.toggle('is-stuck', isStuck);
        ticking = false;
    };

    update();

    window.addEventListener('scroll', () => {
        if(ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    }, { passive: true });
}

// ============================================
// API Configuration
// ============================================
const API_URL = 'https://www.themealdb.com/api/json/v1/1';

// ============================================
// API Functions
// ============================================

async function getRandomRecipes(count = 9) {
    const recipes = [];
    console.log(`🔄 Fetching ${count} random recipes...`);
    
    for(let i = 0; i < count; i++) {
        try {
            const response = await fetch(`${API_URL}/random.php`);
            const data = await response.json();
            
            if(data.meals?.[0]) {
                recipes.push(data.meals[0]);
                console.log(`  ✅ ${i + 1}/${count}: ${data.meals[0].strMeal}`);
            }
        } catch(error) {
            console.error(`  ❌ Error fetching recipe ${i + 1}:`, error);
        }
    }
    
    return recipes;
}

async function searchRecipes(query) {
    console.log(`🔍 Searching for: "${query}"`);
    
    try {
        const response = await fetch(`${API_URL}/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if(data.meals) {
            console.log(`✅ Found ${data.meals.length} recipes`);
            return data.meals;
        }
        
        console.log('❌ No recipes found');
        return [];
    } catch(error) {
        console.error('❌ Search error:', error);
        return [];
    }
}

async function filterByCategory(category) {
    console.log(`🏷️ Filtering by category: "${category}"`);
    
    try {
        const response = await fetch(`${API_URL}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await response.json();
        
        if(data.meals) {
            console.log(`✅ Found ${data.meals.length} recipes in ${category}`);
            return data.meals;
        }
        
        console.log('❌ No recipes found in this category');
        return [];
    } catch(error) {
        console.error('❌ Filter error:', error);
        return [];
    }
}

async function getRecipeDetails(id) {
    console.log(`🍴 Fetching recipe details for ID: ${id}`);
    
    try {
        const response = await fetch(`${API_URL}/lookup.php?i=${id}`);
        const data = await response.json();
        
        if(data.meals?.[0]) {
            console.log(`✅ Loaded: ${data.meals[0].strMeal}`);
            return data.meals[0];
        }
        
        console.log('❌ Recipe not found');
        return null;
    } catch(error) {
        console.error('❌ Error fetching recipe details:', error);
        return null;
    }
}

// ============================================
// Helper Functions
// ============================================

function getIngredients(recipe) {
    const ingredients = [];
    
    for(let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        
        const ingredientText = ingredient?.trim();
        const measureText = measure?.trim();

        if(ingredientText) {
            ingredients.push([measureText, ingredientText].filter(Boolean).join(' '));
        }
    }
    
    return ingredients;
}

function setActiveCategory(category) {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function formatRecipeMeta(recipe) {
    const category = recipe.strCategory || (currentMode === 'category' ? currentCategory : '');
    const area = recipe.strArea || '';

    if(category && area) return `${category} • ${area}`;
    return category || area || '';
}

function formatPrintUrl(rawUrl) {
    if(!rawUrl) return '';

    try {
        const url = new URL(rawUrl);
        const host = url.hostname.replace(/^www\./, '');

        if(host === 'youtube.com' || host === 'm.youtube.com') {
            const id = url.searchParams.get('v');
            if(id) return `youtu.be/${id}`;
        }

        if(host === 'youtu.be') {
            const id = url.pathname.replace(/^\/+/, '').split('/')[0];
            if(id) return `youtu.be/${id}`;
        }

        const path = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/$/, '') : '';
        return `${host}${path}`;
    } catch {
        return String(rawUrl)
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split(/[?#]/)[0];
    }
}

function recipeCardHtml(recipe) {
    const meta = formatRecipeMeta(recipe);

    return `
        <div class="recipe-card" onclick="showRecipe('${recipe.idMeal}')">
            <img src="${recipe.strMealThumb}" 
                 alt="${recipe.strMeal}" 
                 class="recipe-image"
                 loading="lazy">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.strMeal}</h3>
                ${meta ? `<p class="recipe-meta">${meta}</p>` : ''}
            </div>
        </div>
    `;
}

function updateLoadMoreVisibility() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if(!loadMoreBtn) return;

    if(currentMode === 'random') {
        loadMoreBtn.style.display = allRecipes.length ? 'block' : 'none';
        return;
    }

    loadMoreBtn.style.display = displayedRecipes.length < allRecipes.length ? 'block' : 'none';
}

function showLoading() {
    const container = document.getElementById('recipes-container');
    const loadMoreBtn = document.getElementById('load-more-btn');

    if(loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }

    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="font-size: 1.2rem; color: #b38b6d;">🍳 Loading delicious recipes...</p>
        </div>
    `;
}

// ============================================
// Render Functions
// ============================================

function renderRecipes(recipes, isInitialLoad = false) {
    const container = document.getElementById('recipes-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if(!recipes?.length) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <h3 style="color: #7c5c45; font-size: 2rem;">🤷‍♂️ No recipes found</h3>
                <p style="color: #999; font-size: 1.1rem;">Try a different search or category</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    allRecipes = recipes;
    displayedRecipes = recipes.slice(0, PAGE_SIZE);

    container.innerHTML = displayedRecipes.map(recipeCardHtml).join('');
    updateLoadMoreVisibility();
    
    console.log('🍴 Rendered', displayedRecipes.length, 'of', allRecipes.length, 'recipes');
}

async function showRecipe(id) {
    const modal = document.getElementById('recipe-modal');
    const details = document.getElementById('recipe-details');
    
    modal.style.display = 'block';
    details.innerHTML = `
        <div style="text-align:center; padding:3rem;">
            <p style="font-size: 1.2rem; color: #b38b6d;">🍳 Loading recipe...</p>
        </div>
    `;
    
    const recipe = await getRecipeDetails(id);
    
    if(!recipe) {
        details.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <h3 style="color: #e74c3c;">😕 Recipe not found</h3>
                <p>Please try another recipe</p>
            </div>
        `;
        return;
    }
    
    const ingredients = getIngredients(recipe);
    currentRecipeForShare = recipe;
    
    details.innerHTML = `
        <img src="${recipe.strMealThumb}" 
             alt="${recipe.strMeal}" 
             class="recipe-detail-image">
        
        <div class="recipe-detail-content">
            <h2 class="recipe-detail-title">${recipe.strMeal}</h2>
            <p class="recipe-detail-meta">
                <strong>${recipe.strCategory}</strong> • ${recipe.strArea}
            </p>
            
            <div class="section">
                <h3>📋 Ingredients</h3>
                <ul class="ingredients-list">
                    ${ingredients.map(ing => `<li>✅ ${ing}</li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h3>👨‍🍳 Instructions</h3>
                <div class="instructions">${recipe.strInstructions}</div>
            </div>
            
	            <div class="recipe-actions" aria-label="Recipe actions">
	                ${recipe.strYoutube ? `
	                    <a href="${recipe.strYoutube}" 
	                       target="_blank" 
	                       rel="noopener noreferrer"
	                       data-print-url="${formatPrintUrl(recipe.strYoutube)}"
	                       class="video-link">
	                        🎥 Watch Video Tutorial
	                    </a>
	                ` : ''}
	                <div class="share-actions" aria-label="Share recipe">
	                    <button type="button" class="share-icon-btn" data-action="share-facebook" aria-label="Share on Facebook" title="Facebook">
	                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	                            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.8c0-2.4 1.4-3.8 3.6-3.8 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.6.8-1.6 1.5V12H16l-.4 3h-2.2v7A10 10 0 0 0 22 12z"/>
	                        </svg>
	                    </button>
	                    <button type="button" class="share-icon-btn" data-action="share-instagram" aria-label="Share to Instagram" title="Instagram">
	                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	                            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
	                        </svg>
	                    </button>
	                    <button type="button" class="share-icon-btn" data-action="share-x" aria-label="Share on X" title="X">
	                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	                            <path d="M18.9 2H22l-6.8 7.8L23 22h-6.8l-5.3-6.5L5 22H2l7.4-8.5L1.4 2H8.3l4.8 5.8L18.9 2zm-1.2 18h1.7L7.3 3.9H5.5L17.7 20z"/>
	                        </svg>
	                    </button>
	                </div>
	                <button type="button" class="action-btn print-btn" data-action="print-recipe">
	                    🖨️ Print Recipe 
	                </button>
	            </div>
	        </div>
	    `;
    
    console.log('✅ Recipe details displayed');
}

// ============================================
// Setup Functions
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(async () => {
            if(query.length > 2) {
                currentMode = 'search';
                currentQuery = query;
                currentCategory = 'all';
                setActiveCategory('all');

                showLoading();
                const recipes = await searchRecipes(query);
                setTimeout(() => renderRecipes(recipes), 200);
            } else if(query.length === 0) {
                currentMode = 'random';
                currentQuery = '';
                currentCategory = 'all';
                setActiveCategory('all');

                showLoading();
                const recipes = await getRandomRecipes(PAGE_SIZE);
                setTimeout(() => renderRecipes(recipes), 200);
            }
        }, 500);
    });
    
    console.log('✅ Search functionality ready');
}

function setupCategories() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('search-input');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const category = e.target.dataset.category;
            setActiveCategory(category);
            searchInput.value = '';
            
            showLoading();

            currentQuery = '';
            currentCategory = category;

            let recipes;
            if(category === 'all') {
                currentMode = 'random';
                recipes = await getRandomRecipes(PAGE_SIZE);
            } else {
                currentMode = 'category';
                recipes = await filterByCategory(category);
            }
            
            setTimeout(() => renderRecipes(recipes), 200);
        });
    });
    
    console.log('✅ Category filters ready');
}

function setupModal() {
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        console.log('❌ Modal closed');
    });
    
    window.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.style.display = 'none';
            console.log('❌ Modal closed (outside click)');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            console.log('❌ Modal closed (ESC key)');
        }
    });
    
    console.log('✅ Modal functionality ready');
}

function getShareUrl() {
    return window.location.href.split('#')[0];
}

function getShareText(recipe) {
    const title = recipe?.strMeal?.trim() || 'Recipe';
    const category = recipe?.strCategory?.trim();
    const area = recipe?.strArea?.trim();
    const meta = [category, area].filter(Boolean).join(' • ');
    return meta ? `${title} — ${meta}` : title;
}

function openSharePopup(url) {
    const width = 620;
    const height = 640;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(url, 'share', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}

function setupShareButtons() {
    const details = document.getElementById('recipe-details');
    if(!details) return;

    details.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action^="share-"]');
        if(!btn) return;

        e.preventDefault();
        const recipe = currentRecipeForShare;
        const shareUrl = getShareUrl();
        const shareText = getShareText(recipe);

        switch(btn.dataset.action) {
            case 'share-facebook': {
                const url = new URL('https://www.facebook.com/sharer/sharer.php');
                url.searchParams.set('u', shareUrl);
                openSharePopup(url.toString());
                break;
            }
            case 'share-x': {
                const url = new URL('https://twitter.com/intent/tweet');
                url.searchParams.set('url', shareUrl);
                url.searchParams.set('text', shareText);
                openSharePopup(url.toString());
                break;
            }
            case 'share-instagram': {
                // Instagram doesn't support a standard web share URL like FB/X.
                // Prefer native share dialog when available; otherwise open Instagram as a fallback.
                if(navigator.share) {
                    try {
                        await navigator.share({
                            title: recipe?.strMeal || 'Recipe',
                            text: shareText,
                            url: shareUrl,
                        });
                    } catch(err) {
                        // user cancelled / not allowed
                    }
                } else {
                    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
                }
                break;
            }
        }
    });

    console.log('✅ Share buttons ready');
}

function setupPrintRecipe() {
    const details = document.getElementById('recipe-details');
    if(!details) return;

    const cleanup = () => {
        document.body.classList.remove('print-mode');
        document.title = ORIGINAL_TITLE;
    };

    window.addEventListener('afterprint', cleanup);

    details.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="print-recipe"]');
        if(!btn) return;

        e.preventDefault();

        const titleEl = document.querySelector('.recipe-detail-title');
        const recipeTitle = titleEl?.textContent?.trim();
        if(recipeTitle) {
            document.title = `${recipeTitle} — Print`;
        }

        document.body.classList.add('print-mode');

        // Some browsers don't reliably fire `afterprint` on cancel.
        // `focus` is a reliable fallback when returning from the dialog.
        window.addEventListener('focus', cleanup, { once: true });

        window.print();
        console.log('🖨️ Print triggered');
    });

    console.log('✅ Print recipe ready');
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.disabled = true;
        const previousText = loadMoreBtn.textContent;
        loadMoreBtn.textContent = 'Loading...';

        try {
            const container = document.getElementById('recipes-container');

            if(currentMode === 'random') {
                const newRecipes = await getRandomRecipes(PAGE_SIZE);
                allRecipes = [...allRecipes, ...newRecipes];
                displayedRecipes = [...displayedRecipes, ...newRecipes];
                container.insertAdjacentHTML('beforeend', newRecipes.map(recipeCardHtml).join(''));
                console.log(`✅ Loaded ${newRecipes.length} more recipes. Total:`, displayedRecipes.length);
            } else {
                const nextRecipes = allRecipes.slice(displayedRecipes.length, displayedRecipes.length + PAGE_SIZE);
                displayedRecipes = [...displayedRecipes, ...nextRecipes];
                container.insertAdjacentHTML('beforeend', nextRecipes.map(recipeCardHtml).join(''));
                console.log(`✅ Loaded ${nextRecipes.length} more recipes. Total:`, displayedRecipes.length);
            }
        } finally {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = previousText;
            updateLoadMoreVisibility();
        }
    });
    
    console.log('✅ Load more functionality ready');
}

// ============================================
// Initialization
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🍳 Loading recipes from TheMealDB API...');
    showLoading();
    
    setupDarkMode();
    setupStickyControlsBar();
    
    setActiveCategory('all');
    const recipes = await getRandomRecipes(PAGE_SIZE);
    console.log('✅ Loaded', recipes.length, 'recipes');
    
    setTimeout(() => renderRecipes(recipes, true), 300);
    
    setupSearch();
    setupCategories();
    setupModal();
    setupShareButtons();
    setupPrintRecipe();
    setupLoadMore();
});
