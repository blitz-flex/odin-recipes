# 🍳 Odin Recipes

A beautiful, modern recipe application built with vanilla HTML, CSS, and JavaScript. Explore random recipes, search for your favorites, filter by category, and save the ones you love!



## Key Capabilities

| Feature | Description |
| :--- | :--- |
| **Discover** | A curated random recipe generation engine to spark culinary inspiration. |
| **Instant Search** | Lightning-fast dish retrieval with real-time feedback. |
| **Categorization** | Seamlessly filter recipes by tailored categories. |
| **Persistent Favorites** | Secure local storage allows users to save and access their preferred recipes offline. |
| **Thematic Design** | A sophisticated toggle between a stark Light Mode and an elegant Dark Mode. |
| **Responsive Harmony** | Pixel-perfect layouts fluidly adapting to mobile, tablet, and desktop interfaces. |
| **Print Interface** | A specialized, distraction-free view designed exclusively for the kitchen environment. |

## Technical Architecture

The core philosophy of this project is structural integrity and code quality. It leverages modern web standards over external dependencies to ensure a lightweight and highly performant application lifecycle.

- **Markup:** Semantic HTML5 prioritizing accessibility and structural clarity.
- **Styling:** CSS3 powered by Custom Properties, intelligent Grid/Flexbox layouts, and a modular architectural approach.
- **Logic:** Vanilla JavaScript (ES6+) utilizing ES Modules, asynchronous control flow (`async/await`), and the native `fetch` API.
- **Data Integration:** Dynamically populated via TheMealDB REST API.

---

## Local Environment

Experience the application in your local development workspace with minimal setup.

### Initialization

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

## System Structure

The codebase is strictly organized to maintain scalability, readability, and a strict separation of concerns.

```text
odin-recipes/
├── css/
│   ├── base.css        # Global CSS variables and foundation resets
│   ├── header.css      # Navigation and thematic configuration
│   ├── categories.css  # Interactive filtering modules
│   ├── cards.css       # Recipe card component styling
│   ├── modal.css       # Pop-up interfaces and overlays
│   ├── responsive.css  # Viewport adaptation protocols
│   └── style.css       # Primary stylesheet entry point
├── js/
│   ├── api.js          # REST integration and data fetching orchestration
│   ├── app.js          # Core application lifecycle management
│   ├── config.js       # Centralized environment configurations
│   ├── favorites.js    # Persistent state management
│   ├── modal.js        # Interaction bridging and modal logic
│   ├── state.js        # Dynamic application state containment
│   ├── theme.js        # Interface schematics and dark mode behavior
│   └── ui.js           # DOM manipulation and template rendering
└── index.html          # HTML Entry point
```

##  Live Site

[🍲 Odin Recipes ](https://cookerys.netlify.app/)
