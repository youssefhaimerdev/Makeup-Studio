# Makeup Intelligence Studio

A production-ready Next.js web application that acts as a personal makeup assistant — generating optimised routines, diagnosing issues, and suggesting smart product pairings, all using only the products you already own.

**No login. No backend. All data stored in the browser.**

---

## Features

| Feature | Description |
|---|---|
| 🧴 **Inventory System** | Add products by category, brand, shade, and notes |
| ✦ **Skin Profile** | Tone, undertone, skin type, and face shape |
| ✨ **Look Generator** | Full step-by-step routines from your exact products |
| 🔬 **Fix My Makeup** | Diagnose problems and get instant correction steps |
| ✦ **Smart Pairings** | Colour harmony and product combination suggestions |
| 📊 **Gap Analysis** | Identify missing essentials from your stash |
| 📖 **Learn** | Five expert SEO-ready guides (foundation, skin tone, face shape, etc.) |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** React Context + `localStorage` (no backend)
- **Deployment:** Vercel-ready out of the box

---

## Quick Start

### 1. Clone or download

```bash
git clone https://github.com/your-username/makeup-intelligence-studio.git
cd makeup-intelligence-studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
npm run build
npm run start
```

---

## Deploy to Vercel

### Option A — GitHub (recommended)

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Leave all settings at their defaults — Vercel auto-detects Next.js
5. Click **Deploy**

No environment variables are required.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
makeup-intelligence-studio/
├── app/
│   ├── globals.css          # Global styles + Tailwind layers
│   ├── layout.js            # Root HTML layout + metadata
│   └── page.js              # Entry point → renders AppShell
│
├── components/
│   ├── layout/
│   │   ├── AppShell.js      # Client root: routing, page switching, footer
│   │   └── NavBar.js        # Sticky top nav (desktop + mobile)
│   │
│   ├── ui/                  # Reusable primitives
│   │   ├── Badge.js         # Coloured pill labels
│   │   ├── Button.js        # ButtonPrimary, ButtonSecondary, ButtonGhost, ButtonTab
│   │   ├── Card.js          # Card, CardCompact
│   │   └── EmptyState.js    # Centred empty state with icon + CTA
│   │
│   ├── inventory/
│   │   ├── InventoryPage.js # List, search, filter
│   │   ├── ProductCard.js   # Single product row with remove
│   │   ├── ProductForm.js   # Add product form
│   │   └── GapAnalysis.js   # Covered / missing / duplicates panel
│   │
│   ├── profile/
│   │   └── ProfilePage.js   # Skin tone, undertone, type, face shape
│   │
│   ├── generator/
│   │   ├── GeneratePage.js  # Controls + result orchestration
│   │   ├── OccasionPicker.js
│   │   ├── IntensityPicker.js
│   │   └── LookResult.js    # Expandable step list + missing products
│   │
│   ├── fix/
│   │   ├── FixPage.js       # Input + quick-select problem chips
│   │   └── DiagnosisResult.js
│   │
│   ├── pairings/
│   │   ├── PairingsPage.js
│   │   └── PairingCard.js
│   │
│   ├── learn/
│   │   ├── LearnPage.js     # Article grid
│   │   ├── ArticleCard.js
│   │   └── ArticleView.js   # Full article reader
│   │
│   └── HomePage.js          # Hero, how-it-works, features
│
├── lib/
│   ├── AppContext.js         # Global React Context (inventory + profile)
│   ├── storage.js            # localStorage read/write helpers
│   ├── constants.js          # Categories, skin tones, occasions, etc.
│   ├── lookGenerator.js      # Core look-generation engine
│   ├── fixEngine.js          # Makeup problem diagnosis engine
│   ├── pairingsEngine.js     # Smart pairing + inventory stats
│   └── articles.js           # All Learn article content
│
├── public/
│   └── favicon.svg
│
├── jsconfig.json             # @/ path alias
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .gitignore
└── package.json
```

---

## Customisation

### Adding new makeup categories

Edit `lib/constants.js` → `CATEGORIES` array.

### Adding new article guides

Edit `lib/articles.js` → append to the `ARTICLES` array following the existing shape:

```js
{
  slug: "my-new-guide",          // URL-friendly identifier
  title: "My New Guide",
  preview: "Short description shown on cards",
  readTime: "4 min",
  sections: [
    { heading: "Section title", body: "Paragraph text…" },
  ],
}
```

### Changing the colour palette

Edit `tailwind.config.js` → `theme.extend.colors`. The design uses four named ramps: `rose`, `nude`, `blush`, and `mauve`. Update them there and they propagate everywhere.

### Adding a new page

1. Create your component in the appropriate `components/` subfolder
2. Add the page ID to the `PAGES` constant in `components/layout/AppShell.js`
3. Add the route case in `AppShell.js` → `renderPage()`
4. Add the nav link in `components/layout/NavBar.js`

---

## Data Storage

All user data (inventory and profile) is stored in `localStorage` under two keys:

| Key | Content |
|---|---|
| `mis_inventory` | Array of product objects `{ id, category, brand, shade, notes }` |
| `mis_profile` | Object `{ skinTone, undertone, skinType, faceShape }` |

To clear all data: open DevTools → Application → Local Storage → delete both keys, or add a "Reset" button that calls `localStorage.clear()`.

---

## No Environment Variables Required

This project has zero external API dependencies and requires no `.env` file. It runs fully offline after the initial page load.

---

## License

MIT
