/**
 * Global configuration constants for the application.
 * extracting "magic numbers" and strings helps maintainability.
 */

// API Configuration
export const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Pagination & Layout Configuration
export const PAGE_SIZE_MOBILE = 8;
export const PAGE_SIZE_TABLET = 12;
export const PAGE_SIZE_DESKTOP = 15;
export const MOBILE_BREAKPOINT = 768; // px
export const TABLET_BREAKPOINT = 1000; // px

// Search Configuration
export const SEARCH_DEBOUNCE_MS = 500;
export const MIN_SEARCH_LENGTH = 3;

// Local Storage Keys
export const FAVORITES_STORAGE_KEY = 'odin_recipes_favorites_v1';
export const THEME_STORAGE_KEY = 'odin_recipes_theme_v1';
