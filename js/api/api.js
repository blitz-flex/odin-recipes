import { state } from '../core/state.js';

import { API_BASE_URL } from '../core/config.js';

const API_URL = API_BASE_URL;

export async function getRandomRecipes(count = state.PAGE_SIZE, excludeIds = new Set()) {
  const recipes = [];
  const seen = new Set(Array.from(excludeIds).map(String));

  let attempts = 0;
  const maxAttempts = Math.max(count * 4, 20); // safety cap against rate limits / slow API

  while (recipes.length < count && attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(`${API_URL}/random.php`);
      if (!response.ok) {
        console.error(`Random recipe fetch failed with status ${response.status}`);
        continue;
      }
      const data = await response.json();
      const meal = data.meals?.[0];
      if (meal) {
        const id = String(meal.idMeal);
        if (!seen.has(id)) {
          seen.add(id);
          recipes.push(meal);
        }
      }
    } catch (error) {
      console.error(`Error fetching random recipe (attempt ${attempts}):`, error);
    }
  }

  if (recipes.length < count) {
    console.warn(`getRandomRecipes: only got ${recipes.length}/${count} unique recipes after ${attempts} attempts`);
  }

  return recipes;
}

export async function searchRecipes(query) {
  try {
    const response = await fetch(`${API_URL}/search.php?s=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error(`Search failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function filterByCategory(category) {
  try {
    const response = await fetch(`${API_URL}/filter.php?c=${encodeURIComponent(category)}`);
    if (!response.ok) {
      console.error(`Filter by category failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Filter error:', error);
    return [];
  }
}

export async function getRecipeDetails(id) {
  try {
    const response = await fetch(`${API_URL}/lookup.php?i=${id}`);
    if (!response.ok) {
      console.error(`Recipe details fetch failed with status ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.meals?.[0] || null;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}
