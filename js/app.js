// TheMealDB API URL
const API_URL = 'https://www.themealdb.com/api/json/v1/1';

// Get random recipes
async function getRandomRecipes(count = 6) {
    const recipes = [];
    
    for(let i = 0; i < count; i++) {
        try {
            const response = await fetch(`${API_URL}/random.php`);
            const data = await response.json();
            recipes.push(data.meals[0]);
        } catch(error) {
            console.error('Error fetching recipe:', error);
        }
    }
    
    return recipes;
}

// Render recipes to page
function renderRecipes(recipes) {
    const container = document.getElementById('recipes-container');
    
    if(recipes.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No recipes found</p>';
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
}

// Temporary function (will be updated later)
function showRecipe(id) {
    alert('Recipe ID: ' + id + '\nWill show details in next phase!');
}

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🍳 Loading recipes from TheMealDB API...');
    const recipes = await getRandomRecipes(6);
    console.log('✅ Loaded', recipes.length, 'recipes');
    renderRecipes(recipes);
});
