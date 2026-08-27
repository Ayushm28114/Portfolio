# Ayush Mishra — Portfolio
Live Link for this : <a href="https://ayushm28114.github.io/Portfolio/">Ayush_Mishra_Portfolio</a>
## Run locally in VS Code

1. Open this folder in VS Code.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the printed local URL (usually http://localhost:5173).

## Build for production
```
npm run build
npm run preview
```

## Before you deploy
- Add a real profile photo: replace `.hero__avatar-placeholder` in `src/components/Hero.jsx` with an `<img>` tag pointing at your photo.
- Drop your actual resume PDF into the `public/` (the Download Resume button already links to it).
- Update the LinkedIn URL placeholder in `src/components/Contact.jsx`.
- Wire the contact form up to a backend (Formspree, EmailJS, or your own API route) inside `handleSubmit` in `src/components/Contact.jsx` — it currently only simulates a send.
- Update the "Live" project links in `src/components/Projects.jsx` once your projects are deployed.

## File structure
```
portfolio/
├── index.html
├── package.json
├── vite.config.js
├── public/                 ← put your resume PDF and photo here
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── ThemeContext.jsx
    ├── hooks/
    │   └── useReveal.js
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── About.jsx
        ├── Experience.jsx
        ├── Projects.jsx
        ├── Skills.jsx
        ├── Education.jsx
        ├── Contact.jsx
        └── Footer.jsx
```
