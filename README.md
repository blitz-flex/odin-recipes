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
│   ├── base.css        # Global styles and variables
│   ├── header.css      # Header and navigation styles
│   ├── cards.css       # Recipe card components
│   ├── modal.css       # Modal and overlay styles
│   └── responsive.css  # Media queries for responsiveness
├── js/                 # JavaScript Logic (ES Modules)
│   ├── app.js          # Main application entry point
│   ├── api.js          # API interaction layer
│   ├── state.js        # Global state management
│   ├── theme.js        # Dark mode and theme logic
│   └── ui.js           # DOM manipulation and rendering
├── index.html          # Main HTML entry point
└── README.md           # Project documentation
```

##  Live Site

[🍲 Odin Recipes ](https://cookerys.netlify.app/)