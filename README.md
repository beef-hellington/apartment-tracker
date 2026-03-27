# Apartment Tracker

A browser-based apartment comparison tool built with React + Vite. Add listings manually or paste raw text from Zillow or Apartments.com to auto-extract details, then compare side-by-side or see them ranked by a weighted score. Everything is saved in your browser's localStorage — no account or backend required.

## Features

- **Add listings** via a manual form or by pasting listing text (auto-extracts rent, address, and amenities)
- **Dashboard** showing all saved listings as cards
- **Compare view** — select 2–3 listings and see them side by side
- **Rankings** — listings scored by rent (40%), amenities (30%), and gut feeling (30%)
- **Settings** — customize your budget range and the amenities list
- **Persistent** — data survives page refresh via localStorage

---

## Prerequisites

You need **Node.js** (v18 or later) and **npm** installed.

- Download from [nodejs.org](https://nodejs.org) — the LTS version is recommended
- npm is included with Node.js

To verify your installation, open a terminal and run:

```
node -v
npm -v
```

Both should print a version number.

---

## Getting Started

### 1. Clone the repository

**macOS / Linux:**
```bash
git clone https://github.com/beef-hellington/apartment-tracker.git
cd apartment-tracker
```

**Windows (Command Prompt or PowerShell):**
```cmd
git clone https://github.com/beef-hellington/apartment-tracker.git
cd apartment-tracker
```

> If you don't have git, download it from [git-scm.com](https://git-scm.com) or download the repo as a ZIP from GitHub and extract it.

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Start the development server

```bash
npm run dev
```

Then open your browser and go to **http://localhost:5173**

The app supports hot reload — changes to the source files will update in the browser instantly without a full refresh.

---

## Building for Production

To generate a optimized static build:

```bash
npm run build
```

Output goes to the `dist/` folder. You can serve it with:

```bash
npm run preview
```

Or deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## Platform Notes

### macOS
No special setup needed beyond Node.js. If you use [Homebrew](https://brew.sh), you can install Node with:
```bash
brew install node
```

### Linux
Install Node.js via your package manager or [nvm](https://github.com/nvm-sh/nvm):
```bash
# Ubuntu / Debian
sudo apt install nodejs npm

# Or using nvm (recommended — lets you switch Node versions)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

### Windows
Download the Node.js installer from [nodejs.org](https://nodejs.org). During installation, check the box to **add Node to PATH**.

After installing, use **Command Prompt**, **PowerShell**, or **Windows Terminal** to run the commands above. All commands are the same across platforms.

> If you see a script execution error in PowerShell, run:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## Usage

### Adding a listing

**Manual form** — click "Add Listing" and fill in the address, rent, amenities, notes, and a gut feeling score (1–10 slider).

**Paste listing text** — on the Add Listing page, switch to the "Paste listing text" tab, paste the raw text from a Zillow or Apartments.com listing, and click "Parse & Pre-fill". The app will extract rent, address, and recognized amenities, then pre-fill the manual form for you to review before saving.

### Comparing listings

On the Dashboard, check the "Compare" checkbox on 2–3 listing cards, then click "Compare N selected". The Compare view shows a table with all selected listings side by side, with the best rent and gut feeling highlighted in green.

### Rankings

The Rankings tab scores every saved listing on a 0–10 scale:

| Factor | Weight | How it's scored |
|---|---|---|
| Rent | 40% | At or below budget min = 10, at or above budget max = 0, linear between |
| Amenities | 30% | Checked amenities ÷ total amenities × 10 |
| Gut feeling | 30% | Your 1–10 slider value |

### Settings

- **Budget range** — set your min and max monthly rent to calibrate rent scoring
- **Amenities** — add or remove amenities from the checklist; changes affect all forms, cards, and scoring immediately
