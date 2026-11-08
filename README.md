# CallIt

> **Predict the next play. Beat the Analyst.**

A mobile-first live sports prediction app built with React, TypeScript, Vite, and Tailwind CSS.

## Sports Theme & Styling
- **Background:** Dark Navy (`#0B1220`)
- **Accent:** Electric Lime (`#C6FF3D`)
- **Aesthetic:** Modern athletic HUD look with clean typography, live match badge, and interactive level selector.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Linting
```bash
# Type check and build
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

## Step 1 Scope
- [x] Initialized React + TypeScript + Tailwind CSS application via Vite in the root directory.
- [x] Exported typed match information and moments data (`Level`, `Moment`, `matchInfo`, `moments`) in `src/data/match.ts`.
- [x] Implemented Start screen with app title "CallIt", tagline "Predict the next play. Beat the Analyst.", match title and format.
- [x] Built two-button knowledge level picker ("Newcomer" vs "Pro") stored in React `useState`.
- [x] Added "Kick off" action button.
- [x] Embedded temporary Moment 1 data verification preview reflecting situation text according to chosen level.
