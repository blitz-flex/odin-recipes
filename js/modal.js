import { state } from './state.js';
import { getRecipeDetails } from './api.js';
import { readFavoriteIds, setFavoriteButtonState } from './favorites.js';
import { getIngredients, formatPrintUrl } from './ui.js';

export async function showRecipe(id) {
  const modal = document.getElementById('recipe-modal');
  const details = document.getElementById('recipe-details');
  modal.style.display = 'block';
  setRecipeInUrl(id);
  details.innerHTML = `
        <div style="text-align:center; padding:3rem;">
            <p style="font-size: 1.2rem; color: #b38b6d;">🍳 Loading recipe...</p>
        </div>
    `;

  const recipe = await getRecipeDetails(id);
  if (!recipe) {
    details.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <h3 style="color: #e74c3c;">😕 Recipe not found</h3>
                <p>Please try another recipe</p>
            </div>
        `;
    return;
  }

  const ingredients = getIngredients(recipe);
  state.currentRecipeForShare = recipe;

  details.innerHTML = `
        <img src="${recipe.strMealThumb}" 
             alt="${recipe.strMeal}" 
             class="recipe-detail-image">
        
	        <div class="recipe-detail-content">
	            <div class="recipe-title-row">
	                <h2 class="recipe-detail-title">${recipe.strMeal}</h2>
		                <button type="button"
		                        class="favorite-btn"
		                        data-recipe-id="${recipe.idMeal}"
		                        data-action="toggle-favorite"
		                        aria-label="Add to favorites"
		                        aria-pressed="false"
		                        title="Favorite">
	                    <svg class="favorite-btn-svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
	                        <path class="favorite-heart-fill" d="M12 21s-7.2-4.4-9.6-8.7C.6 8.8 2.3 5.8 5.5 5.2c1.9-.4 3.7.4 4.9 1.8 1.2-1.4 3-2.2 4.9-1.8 3.2.6 4.9 3.6 3.1 7.1C19.2 16.6 12 21 12 21z" fill="currentColor"/>
	                        <path class="favorite-heart-outline" d="M12 21s-7.2-4.4-9.6-8.7C.6 8.8 2.3 5.8 5.5 5.2c1.9-.4 3.7.4 4.9 1.8 1.2-1.4 3-2.2 4.9-1.8 3.2.6 4.9 3.6 3.1 7.1C19.2 16.6 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	                    </svg>
	                </button>
	            </div>
	            <p class="recipe-detail-meta">
	                <strong>${recipe.strCategory}</strong> • ${recipe.strArea}
	            </p>
            
            <div class="section">
                <h3>📋 Ingredients</h3>
                <ul class="ingredients-list">
                    ${ingredients.map((ing) => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            
	            <div class="section">
	                <h3>👨‍🍳 Instructions</h3>
	                <div class="instructions">${recipe.strInstructions}</div>
	                ${recipe.strYoutube ? `
	                        <div class="instructions-footer">
	                            <a href="${recipe.strYoutube}"
	                               target="_blank"
	                               rel="noopener noreferrer"
	                               data-print-url="${formatPrintUrl(recipe.strYoutube)}"
	                               class="video-link">
	                                <span class="video-link-icon-wrap" aria-hidden="true">
	                                    <svg class="video-link-icon" viewBox="0 0 24 24" focusable="false">
	                                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2.2 6.9 7 3.9-7 3.9V8.9z"/>
	                                    </svg>
	                                </span>
	                                <span>Video Tutorial</span>
	                            </a>
	                        </div>
	                    ` : ''}
	            </div>
	            
		            <div class="recipe-actions" aria-label="Recipe actions">
		                <div class="actions-right" aria-label="Recipe actions right">
		                    <div class="share-actions" aria-label="Share recipe">
		                        <button type="button" class="share-icon-btn" data-action="share-facebook" aria-label="Share on Facebook" title="Facebook">
		                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		                                <path d="M14 9.4h2.3V6.7C16 6.7 14.9 6.5 13.6 6.5c-2.3 0-3.7 1.4-3.7 3.9v2.2H7.6v2.7h2.3V20h2.9v-4.7h2.5l.4-2.7h-2.9v-2c0-.8.2-1.2 1.2-1.2z"/>
		                            </svg>
		                        </button>
		                        <button type="button" class="share-icon-btn" data-action="share-instagram" aria-label="Share to Instagram" title="Instagram">
		                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		                                <path d="M7.5 3.5h9A4.5 4.5 0 0 1 21 8v8a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16V8a4.5 4.5 0 0 1 4.5-4.5zm9 2h-9A2.5 2.5 0 0 0 5 8v8a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 16V8a2.5 2.5 0 0 0-2.5-2.5z"/>
		                                <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5z"/>
		                                <path d="M16.8 7.2a1 1 0 1 1-1-1 1 1 0 0 1 1 1z"/>
		                            </svg>
		                        </button>
		                        <button type="button" class="share-icon-btn" data-action="share-x" aria-label="Share on X" title="X">
		                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		                                <path d="M4 4h3.4l4.1 5.6L16.7 4H20l-6.4 7.6L20.6 20h-3.4l-4.5-6.1L7.3 20H4l6.9-7.9L4 4z"/>
		                            </svg>
		                        </button>
		                    </div>
		                    <button type="button" class="action-btn print-btn" data-action="print-recipe">
		                        🖨️ Print Recipe
		                    </button>
		                </div>
		            </div>
		        </div>
			    `;

  const favoriteBtn = details.querySelector('[data-action="toggle-favorite"]');
  const favorites = readFavoriteIds();
  setFavoriteButtonState(favoriteBtn, favorites.has(String(recipe.idMeal)));
}

export function setupModal() {
  const modal = document.getElementById('recipe-modal');
  const closeBtn = document.querySelector('.close');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    clearRecipeFromUrl();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      clearRecipeFromUrl();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      clearRecipeFromUrl();
    }
  });
}

export function setRecipeInUrl(id) {
  if (!id) return;
  const url = new URL(window.location.href);
  url.searchParams.set('recipe', id);
  history.replaceState(null, '', url.toString());
}

export function clearRecipeFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('recipe')) return;
  url.searchParams.delete('recipe');
  history.replaceState(null, '', url.toString());
}

export function getRecipeFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get('recipe');
}

export function getShareUrl() {
  const url = new URL(window.location.href);
  url.hash = '';
  if (state.currentRecipeForShare?.idMeal) {
    url.searchParams.set('recipe', state.currentRecipeForShare.idMeal);
  }
  return url.toString();
}

export function getShareText(recipe) {
  const title = recipe?.strMeal?.trim() || 'Recipe';
  const category = recipe?.strCategory?.trim();
  const area = recipe?.strArea?.trim();
  const meta = [category, area].filter(Boolean).join(' • ');
  return meta ? `${title} — ${meta}` : title;
}

export function getCurrentRecipeForShare() {
  return state.currentRecipeForShare;
}
