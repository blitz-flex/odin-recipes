// TheMealDB API URL
const API_URL = 'https://www.themealdb.com/api/json/v1/1';

// Get random recipes
async function getRandomRecipes(count = 6) {
    const recipes = [];
    
    console.log(`🔄 Fetching ${count} random recipes...`);
    
    for(let i = 0; i < count; i++) {
        try {
            const response = await fetch(`${API_URL}/random.php`);
            const data = await response.json();
            
            if(data.meals && data.meals[0]) {
                recipes.push(data.meals[0]);
                console.log(`  ✅ ${i + 1}/${count}: ${data.meals[0].strMeal}`);
            }
        } catch(error) {
            console.error(`  ❌ Error fetching recipe ${i + 1}:`, error);
        }
    }
    
    return recipes;
}

// Render recipes to page
function renderRecipes(recipes) {
    const container = document.getElementById('recipes-container');
    
    if(!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <h3 style="color: #7c5c45;">😕 No recipes found</h3>
                <p style="color: #999;">Try a different search or category</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="showRecipe('${recipe.idMeal}')">
            <img src="${recipe.strMealThumb}" 
                 alt="${recipe.strMeal}" 
                 class="recipe-image"
                 loading="lazy">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.strMeal}</h3>
                <p class="recipe-meta">
                    ${recipe.strCategory} • ${recipe.strArea}
                </p>
            </div>
        </div>
    `).join('');
    
    console.log('🍴 Rendered', recipes.length, 'recipe cards');
}

// Temporary function (will be updated later)
function showRecipe(id) {
    alert('Recipe ID: ' + id + '\nWill show details in next phase!');
}

// Show loading state
function showLoading() {
    const container = document.getElementById('recipes-container');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="font-size: 1.2rem; color: #b38b6d;">🍳 Loading delicious recipes...</p>
        </div>
    `;
}

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🍳 Loading recipes from TheMealDB API...');
    showLoading();
    
    const recipes = await getRandomRecipes(6);
    console.log('✅ Loaded', recipes.length, 'recipes');
    
    // Small delay for better UX
    setTimeout(() => {
        renderRecipes(recipes);
    }, 300);
});
