# Fayad Kaffoura — Portfolio

A professional personal portfolio built with **Three.js**, featuring an animated 3D particle field, smooth scroll animations, and a clean dark design.

## Features

- 🌌 **3D Particle System** — 2200 animated particles with dynamic connection lines (Three.js WebGL)
- 🖱️ **Custom Cursor** — Smooth lagging ring cursor with hover effects
- 📜 **Scroll Animations** — Reveal-on-scroll for all sections
- 📊 **Animated Skill Bars** — Triggered when the skills section enters view
- 🌗 **Mouse Parallax** — Camera moves subtly with mouse movement
- 📱 **Responsive** — Works on all screen sizes

## Tech Stack

- **Three.js r128** (loaded via CDN)
- Vanilla HTML, CSS, JavaScript — no build step needed
- Google Fonts: Syne + Space Mono

## Getting Started

No build tools required. Just open `index.html` in your browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended for fonts)
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`

## Customization

### Personal Info
Edit `index.html`:
- Change name, title, bio in the **Hero** and **About** sections
- Update **skills** and their levels via `data-level` attribute (0–100)
- Replace **project** cards with your real projects
- Update **contact** links (email, GitHub, LinkedIn)

### Colors
Edit `style.css` root variables:
```css
:root {
  --accent:  #a78bfa;  /* Purple — primary accent */
  --accent2: #38bdf8;  /* Blue   — secondary accent */
  --bg:      #05050a;  /* Dark background */
}
```

### Particles
Edit `main.js`:
- `PARTICLE_COUNT` — number of particles (default: 2200)
- `LINE_MAX_DIST` — max distance for connection lines (default: 14)
- `palette` — particle colors

## Structure

```
portfolio-fayad/
├── index.html   — Main HTML structure
├── style.css    — All styles + animations
├── main.js      — Three.js + scroll logic
└── README.md    — This file
```

## License

Free to use and modify for personal use.
