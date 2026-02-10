import { state } from './state.js';

const API_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function getRandomRecipes(count = state.PAGE_SIZE) {
  const recipes = [];
  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${API_URL}/random.php`);
      const data = await response.json();
      if (data.meals?.[0]) recipes.push(data.meals[0]);
    } catch (error) {
      console.error(`Error fetching recipe ${i + 1}:`, error);
    }
  }
  return recipes;
}

export async function searchRecipes(query) {
  try {
    const response = await fetch(`${API_URL}/search.php?s=${encodeURIComponent(query)}`);
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
    const data = await response.json();
    return data.meals?.[0] || null;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}
