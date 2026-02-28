<h1 align="center">🍳 Odin Recipes</h1>

##  Overview

Odin Recipes  was designed to bridge the gap between elegant design and pure web fundamentals. Built entirely without frameworks or build tools, it showcases the power of native **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**. The application invites users to explore, search, and save culinary inspiration in an environment that feels premium and distraction-free.

This project was developed as part of [The Odin Project](https://www.theodinproject.com) curriculum and serves as a demonstration of competency in modern front-end fundamentals.


## Features

| Feature | Description |
| :--- | :--- |
|  **Random Discovery** | A curated random recipe engine to spark culinary inspiration on every visit. |
|  **Instant Search** | Debounced, real-time dish retrieval with live feedback — no button presses needed. |
|  **Category Filtering** | Seamlessly filter recipes by type: Dessert, Seafood, Chicken, Pasta, Beef, and more. |
|  **Persistent Favorites** | Recipes you love are saved to `localStorage` and survive page refreshes. |
|  **Dark / Light Mode** | A sophisticated toggle between a sleek Dark Mode and a clean Light Mode, persisted across sessions. |
|  **Fully Responsive** | Pixel-perfect fluid layouts adapting beautifully to mobile, tablet, and desktop viewports. |
|  **Print-Friendly** | A specialized, distraction-free view optimized for the kitchen environment. |
|  **Load More Pagination** | Dynamically loads additional recipes without a full page reload. |


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
| `config.js` | Centralized environment constants (API URL, breakpoints, debounce timings, storage keys) |
| `state.js` | Single source of truth for dynamic application state (current page, active filter, search query) |
| `api.js` | REST integration layer — `getRandomRecipes`, `searchRecipes`, `filterByCategory`, `getRecipeDetails` |
| `app.js` | Core application lifecycle — bootstraps, wires events, and orchestrates all modules |
| `ui.js` | DOM manipulation and card/template rendering |
| `modal.js` | Full recipe detail modal — opens, populates, and manages interaction |
| `favorites.js` | Persistent favorites read/write from `localStorage` |
| `theme.js` | Dark/Light theme toggling with persistence |



##  Project Structure

```text
odin-recipes/
│
├── css/
│   ├── base.css          # Global CSS custom properties and foundation resets
│   ├── header.css        # Navigation bar, search input, and theme toggle styles
│   ├── categories.css    # Category filter button bar
│   ├── cards.css         # Recipe card component (grid item, image, overlay)
│   ├── modal.css         # Full-screen recipe detail modal and overlays
│   ├── responsive.css    # Viewport-specific media queries and layout adaptations
│   └── style.css         # Primary stylesheet entry point (imports all modules)
│
├── js/
│   ├── api.js            # REST API integration and data fetching orchestration
│   ├── app.js            # Core application lifecycle and event wiring
│   ├── config.js         # Centralized environment constants and magic numbers
│   ├── favorites.js      # Persistent favorites state management via localStorage
│   ├── modal.js          # Recipe detail modal interaction and rendering
│   ├── state.js          # Reactive application state container
│   ├── theme.js          # Interface theming and dark mode persistence
│   └── ui.js             # DOM manipulation, card rendering, and template engine
│
└── index.html            # Application entry point — single-page shell
```



##  API Reference

This project integrates with the free **[TheMealDB API](https://www.themealdb.com/api.php)** (v1).

| Endpoint | HTTP Method | Usage |
| :--- | :--- | :--- |
| `/random.php` | `GET` | Fetch a single random meal |
| `/search.php?s={query}` | `GET` | Search meals by name |
| `/filter.php?c={category}` | `GET` | Filter meals by category |
| `/lookup.php?i={id}` | `GET` | Fetch full meal details by ID |

All requests are made client-side using the native `fetch` API with `async/await` error handling.



##  Getting Started

Experience the application in your local environment with minimal setup. **No build tool or package manager required.**

### Prerequisites

- Any modern web browser (Chrome 80+, Firefox 75+, Safari 14+, Edge 80+)
- A local development server *(recommended — see step 3)*


## Initialization

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/odin-recipes.git
   ```

2. **Navigate to the workspace**
   ```bash
   cd odin-recipes
   ```

3. **Launch the application**
   Open the `index.html` file in any modern web browser. For an optimal development iteration cycle, utilize a local server (e.g., Live Server extension in VS Code).


##  Design Highlights

- **Color System:** Fully theme-aware via CSS Custom Properties — switching between light and dark mode requires zero JS color manipulation.
- **Typography:** Uses the **Inter** typeface (via Google Fonts) at weights 300–700 for a clean, modern reading experience.
- **Animations:** Subtle CSS transitions on cards, modals, and interactive controls for a premium feel without distraction.
- **Accessibility:** Semantic HTML5 elements, `aria-label` on all interactive components, and keyboard-navigable modal.

##  Live Site

[🍲 Odin Recipes ](https://cookerys.netlify.app/)
