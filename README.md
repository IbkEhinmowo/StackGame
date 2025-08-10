<!-- @format -->

# Opal - Stack Game

Opal is a fun, physics-based 3D box stacking game built with Three.js and Cannon.js. Test your timing and precision as you stack blocks to build the tallest tower you can!

![Screenshot 2024-02-11 at 6 18 51 PM](https://github.com/IbkEhinmowo/StackGame/assets/142057631/a51898cb-a185-4e00-ac38-7483d1585587)

## Features

- Procedurally generated levels
- Realistic physics
- Overhang mechanics
- Progressive difficulty
- Minimalist aesthetic

## How to Play

1. Click or tap to drop a moving block onto the tower.
2. Try to maximize overlap with the previous block.
3. Smaller overlaps make the game harder as you build higher.
4. The game ends when a block falls off.

## Getting Started

1. Clone this repository.
2. Open `index.html` in your browser, or run locally with Vite for development.
3. Start stacking!

## Technologies

- JavaScript
- HTML5
- CSS3
- Three.js
- Cannon.js

## Deployment and GitHub Actions Workflow

This project uses GitHub Actions for automated deployment to GitHub Pages. Here's how the workflow works:

### Workflow Details (.github/workflows/deploy.yml)

1. **Trigger**: Activates automatically when code is pushed to the `main` branch
2. **Environment**: Runs on Ubuntu with Node.js 20
3. **Build Process**:
   - Installs dependencies using `yarn install`
   - Builds the project using `yarn build`
   - Output goes to the `dist` directory
4. **Deployment**:
   - Uses `peaceiris/actions-gh-pages@v3` action
   - Takes contents from `dist` directory
   - Publishes to the root of `gh-pages` branch
   - Requires `contents: write` permission in workflow

### Important Configuration Files

- `vite.config.js`: Contains the base URL configuration for GitHub Pages
- `.gitignore`: Excludes `dist` folder (built files are handled by the workflow)

### Live Site

View the live version [here](https://IbkEhinmowo.github.io/StackGame).
