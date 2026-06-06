# 🍳 Odin Recipes


A modern recipe discovery app built with vanilla JavaScript and the TheMealDB API.

## Features

| Feature | Description |
| :--- | :--- |
| **Random Discovery** | Curated random recipe engine to spark culinary inspiration on every visit. |
| **Instant Search** | Debounced, real-time search with live feedback — no button presses needed. |
| **Category Filtering** | Filter recipes by type: Dessert, Seafood, Chicken, Pasta, Beef, and more. |
| **Persistent Favorites** | Recipes are saved to `localStorage` and survive page refreshes. |
| **Dark / Light Mode** | Sophisticated toggle between Dark Mode and Light Mode, persisted across sessions. |
| **Fully Responsive** | Pixel-perfect fluid layouts adapting to mobile, tablet, and desktop viewports. |
| **Print-Friendly** | Specialized, distraction-free view optimized for the kitchen environment. |
| **Load More Pagination** | Dynamically loads additional recipes without a full page reload. |

## Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic elements prioritizing accessibility (`aria-*` attributes) and structural clarity |
| **Styling** | CSS3 | Custom Properties, modular architecture, Grid + Flexbox layouts |
| **Logic** | Vanilla JavaScript (ES6+) | ES Modules, `async/await`, native `fetch` API |
| **Data** | [TheMealDB REST API](https://www.themealdb.com/api.php) | Free, public meal database with 300+ recipes |
| **Persistence** | Web Storage API | `localStorage` for favorites and theme preference |
| **Hosting** | Netlify | Continuous deployment from GitHub |

## Application Modules

| Module | Responsibility |
| :--- | :--- |
| **Core** | |
| `config.js` | Centralized constants (API URL, breakpoints, debounce timings, storage keys) |
| `state.js` | Single source of truth for dynamic application state (current mode, filters, query) |
| **API** | |
| `api.js` | REST integration — `getRandomRecipes`, `searchRecipes`, `filterByCategory`, `getRecipeDetails` |
| **Features** | |
| `load-more.js` | Pagination logic, page-size resolution, recipe appending strategies |
| `search.js` | Debounced search input handling and query state management |
| `categories.js` | Category dropdown UI, filtering, and category label updates |
| `favorites.js` | Persistent favorites read/write from `localStorage` with UI sync |
| `theme.js` | Dark/Light theme toggling with `localStorage` persistence |
| `modal.js` | Recipe detail modal — open, populate, share, print, and favorites |
| `card-interactions.js` | Recipe card click handlers, heart toggle, favorites-only mode |
| `views.js` | View snapshots, favorites-only rendering, and state restoration |
| **UI** | |
| `ui.js` | DOM manipulation, card rendering, and loading states |
| `templates.js` | HTML string generation for recipe cards, skeletons, and detail modal |
| **App** | |
| `app.js` | Application lifecycle — bootstraps, wires events, orchestrates all modules |

## Project Structure

```text
odin-recipes/
│
├── css/
│   ├── base/
│   │   └── base.css           # CSS custom properties, resets, and foundation
│   ├── ui/
│   │   ├── header.css         # Navigation bar, search, and action buttons
│   │   ├── categories.css     # Category popover and button styles
│   │   ├── cards.css          # Recipe card grid, skeletons, load-more button
│   │   ├── modal.css          # Recipe detail modal container and scrolling
│   │   ├── detail.css         # Recipe detail hero, tags, meta, and content
│   │   └── detail-actions.css # Modal footer, share buttons, and print action
│   ├── utilities/
│   │   ├── responsive.css     # Viewport-specific media queries
│   │   └── print.css          # Print-optimized styles
│   └── style.css              # Primary stylesheet entry point (imports all modules)
│
├── js/
│   ├── core/
│   │   ├── config.js          # Environment constants and magic numbers
│   │   └── state.js           # Reactive application state container
│   ├── api/
│   │   └── api.js             # REST API integration and data fetching
│   ├── features/
│   │   ├── load-more.js       # Pagination and page-size logic
│   │   ├── search.js          # Search input handling
│   │   ├── categories.js      # Category filtering and dropdown
│   │   ├── favorites.js       # Favorites persistence and UI sync
│   │   ├── theme.js           # Dark/Light mode toggling
│   │   ├── modal.js           # Recipe detail modal management
│   │   ├── card-interactions.js # Recipe card event handlers
│   │   └── views.js           # View state snapshots and restoration
│   ├── ui/
│   │   ├── ui.js              # DOM manipulation and rendering
│   │   └── templates.js       # HTML string templates
│   └── app.js                 # Application entry point and lifecycle
│
└── index.html                 # Single-page application shell
```

## API Reference

This project integrates with the free **[TheMealDB API](https://www.themealdb.com/api.php)** (v1).

| Endpoint | HTTP Method | Usage |
| :--- | :--- | :--- |
| `/random.php` | `GET` | Fetch a single random meal |
| `/search.php?s={query}` | `GET` | Search meals by name |
| `/filter.php?c={category}` | `GET` | Filter meals by category |
| `/lookup.php?i={id}` | `GET` | Fetch full meal details by ID |
| `/categories.php` | `GET` | Fetch all available categories |

All requests are made client-side using the native `fetch` API with `async/await` error handling.

## Design Highlights

- **Color System:** Fully theme-aware via CSS Custom Properties — switching between light and dark mode requires zero JS color manipulation.
- **Typography:** Uses the **Inter** and **Fraunces** typefaces (via Google Fonts) for a clean, modern reading experience.
- **Animations:** Subtle CSS transitions on cards, modals, and interactive controls for a premium feel without distraction.
- **Accessibility:** Semantic HTML5 elements, `aria-label` on all interactive components, and keyboard-navigable modal.

## Acknowledgments

- [The Odin Project](https://www.theodinproject.com)
- [TheMealDB](https://www.themealdb.com)

## License

For educational and portfolio use.

## Live Site

[🍲 Odin Recipes](https://cookerys.netlify.app/)
