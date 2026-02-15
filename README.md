# 🍳 Odin Recipes

A beautiful, modern recipe application built with vanilla HTML, CSS, and JavaScript. Explore random recipes, search for your favorites, filter by category, and save the ones you love!

##  Features

- **Discover**: Browse random recipes on every visit.
- **Search**: Find specific dishes with instant search functionality.
- **Categories**: Filter recipes by category (Breakfast, Dessert, Vegetarian, etc.).
- **Favorites**: Save your favorite recipes to local storage for quick access.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.
- **Share**: Easily share recipes via social media (Facebook, Twitter, Copy Link).
- **Print Friendly**: Dedicated print view for cooking without distractions.

##  Tech Stack

- **HTML5**: Semantic markup for accessibility and structure.
- **CSS3**: Custom properties (variables), Grid, Flexbox, and responsive media queries.
- **JavaScript (ES6+)**: Modular architecture using ES Modules (`import`/`export`), `async/await`, and `fetch` API.
- **API**: Powered by [TheMealDB](https://www.themealdb.com/api.php).

##  Getting Started

To run this project locally, follow these simple steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/odin-recipes.git
    ```
2.  **Navigate to the project directory**:
    ```bash
    cd odin-recipes
    ```
3.  **Open `index.html`**:
    Simply open the `index.html` file in your preferred web browser. Alternatively, use a local server (e.g., extend functionality with `Live Server` in VS Code) for the best experience.

##  Project Structure

```
odin-recipes/
├── css/                # Stylesheets (Modular CSS)
│   ├── base.css        # Global variables and resets
│   ├── header.css      # Header and navigation
│   ├── categories.css  # Category filter buttons
│   ├── cards.css       # Recipe card components
│   ├── modal.css       # Recipe details modal
│   ├── responsive.css  # Media queries
│   └── style.css       # Main entry (imports all)
├── js/                 # JavaScript Logic (ES Modules)
│   ├── app.js          # Core application & event listeners
│   ├── api.js          # TheMealDB API interaction
│   ├── config.js       # Centralized constants & settings
│   ├── state.js        # Dynamic app state management
│   ├── ui.js           # DOM rendering & HTML templates
│   ├── favorites.js    # LocalStorage favorites logic
│   ├── modal.js        # Modal handling & sharing logic
│   └── theme.js        # Dark mode & sticky UI effects
├── index.html          # Main HTML entry point
└── README.md           # Documentation
```

##  Live Site

[🍲 Odin Recipes ](https://cookerys.netlify.app/)