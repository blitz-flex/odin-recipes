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

function setupDarkMode() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if(savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        console.log(`🌙 Theme: ${isDark ? 'Dark' : 'Light'}`);
    });
    
    console.log('✅ Dark mode ready');
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
                       class="video-link">
                        🎥 Watch Video Tutorial
                    </a>
                ` : ''}
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
    
    setActiveCategory('all');
    const recipes = await getRandomRecipes(PAGE_SIZE);
    console.log('✅ Loaded', recipes.length, 'recipes');
    
    setTimeout(() => renderRecipes(recipes, true), 300);
    
    setupSearch();
    setupCategories();
    setupModal();
    setupPrintRecipe();
    setupLoadMore();
});
