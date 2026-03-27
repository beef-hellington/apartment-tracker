# Apartment Tracker

A browser-based apartment comparison tool. Add listings manually or paste raw text from Zillow or Apartments.com to auto-extract details, then compare side-by-side or see them ranked by a weighted score. Everything saves automatically in your browser — no account or internet connection required after setup.

## Features

- Add listings via a manual form or by pasting Zillow / Apartments.com text
- Dashboard showing all saved listings as cards
- Compare view — select 2–3 listings side by side
- Rankings — listings scored by rent, amenities, and gut feeling with configurable weights
- Settings — customize your budget range, amenities list, and scoring weights
- Data persists across page refreshes via localStorage

---

## Installation

Follow the guide for your operating system below. Each step is explained in plain language — no prior experience needed.

---

### macOS

#### Step 1 — Open Terminal

Terminal is a built-in app that lets you type commands to your computer.

1. Press **Command + Space** to open Spotlight Search
2. Type **Terminal** and press **Enter**
3. A window with a blinking cursor will appear — this is where you'll type the commands below

#### Step 2 — Install Node.js

Node.js is the engine that runs the app. To check if you already have it, type this and press Enter:

```
node -v
```

- If you see something like `v20.0.0`, you already have Node.js — skip to Step 3.
- If you see an error, you need to install it:
  1. Go to [nodejs.org](https://nodejs.org)
  2. Click the big **"LTS"** download button (LTS = Long Term Support, the stable version)
  3. Open the downloaded `.pkg` file and follow the installer steps
  4. Once done, close Terminal, reopen it, and type `node -v` again to confirm it worked

#### Step 3 — Download the app

Type the following command and press Enter. This downloads the app files to your computer:

```
curl -L https://github.com/beef-hellington/apartment-tracker/archive/refs/heads/main.zip -o apartment-tracker.zip
```

Then run these one at a time, pressing Enter after each:

```
unzip apartment-tracker.zip
```
```
cd apartment-tracker-main
```

#### Step 4 — Install dependencies

Dependencies are extra code the app needs to run. Install them with:

```
npm install
```

This may take a minute. You'll see a lot of text scroll by — that's normal.

#### Step 5 — Start the app

```
npm run dev
```

You'll see a message that includes a local address like `http://localhost:5173`. Open your browser and go to that address. The app is now running!

> To stop the app, go back to Terminal and press **Control + C**.

---

### Windows

#### Step 1 — Open Command Prompt

Command Prompt is a built-in app for typing commands.

1. Press the **Windows key** (the key with the Windows logo)
2. Type **cmd** and press **Enter**
3. A black window with a blinking cursor will appear — this is where you'll type the commands below

#### Step 2 — Install Node.js

Node.js is the engine that runs the app. To check if you already have it, type this and press Enter:

```
node -v
```

- If you see something like `v20.0.0`, you already have Node.js — skip to Step 3.
- If you see an error, you need to install it:
  1. Go to [nodejs.org](https://nodejs.org)
  2. Click the big **"LTS"** download button
  3. Open the downloaded `.msi` file
  4. Click through the installer — leave all settings on their defaults and click **Next** until it finishes
  5. **Restart your computer** after installing
  6. Reopen Command Prompt and type `node -v` to confirm it worked

#### Step 3 — Download the app

1. Go to [github.com/beef-hellington/apartment-tracker](https://github.com/beef-hellington/apartment-tracker) in your browser
2. Click the green **"< > Code"** button
3. Click **"Download ZIP"**
4. Open your **Downloads** folder and right-click the ZIP file → **Extract All** → **Extract**
5. You'll now have a folder called `apartment-tracker-main`

#### Step 4 — Navigate to the app folder in Command Prompt

In Command Prompt, type the following (replacing `YourName` with your actual Windows username) and press Enter:

```
cd C:\Users\YourName\Downloads\apartment-tracker-main
```

> **Tip:** If you're not sure of your username, type `echo %USERNAME%` and press Enter — it will show you.

#### Step 5 — Install dependencies

```
npm install
```

This may take a minute. You'll see a lot of text scroll by — that's normal.

#### Step 6 — Start the app

```
npm run dev
```

You'll see a message that includes a local address like `http://localhost:5173`. Open your browser and go to that address. The app is now running!

> To stop the app, go back to Command Prompt and press **Ctrl + C**.

---

### Linux

#### Step 1 — Open a Terminal

How to open a terminal depends on your Linux distribution:

- **Ubuntu / Debian:** Press **Ctrl + Alt + T**
- **Fedora:** Press **Super** (Windows key) and search for "Terminal"
- **Other distros:** Right-click the desktop and look for "Open Terminal" in the menu

#### Step 2 — Install Node.js

To check if you already have it, type this and press Enter:

```
node -v
```

- If you see something like `v20.0.0`, you already have Node.js — skip to Step 3.
- If you see an error, install it using your package manager:

**Ubuntu / Debian:**
```
sudo apt update && sudo apt install nodejs npm -y
```

**Fedora:**
```
sudo dnf install nodejs npm -y
```

**Arch Linux:**
```
sudo pacman -S nodejs npm
```

You'll be asked for your password — type it and press Enter (the cursor won't move while you type, that's normal).

#### Step 3 — Download the app

Type the following and press Enter:

```
curl -L https://github.com/beef-hellington/apartment-tracker/archive/refs/heads/main.zip -o apartment-tracker.zip
```

Then run these one at a time:

```
unzip apartment-tracker.zip
```
```
cd apartment-tracker-main
```

> If `unzip` is not found, install it first with `sudo apt install unzip -y` (Ubuntu/Debian) or `sudo dnf install unzip -y` (Fedora).

#### Step 4 — Install dependencies

```
npm install
```

This may take a minute. You'll see a lot of text scroll by — that's normal.

#### Step 5 — Start the app

```
npm run dev
```

You'll see a message that includes a local address like `http://localhost:5173`. Open your browser and go to that address. The app is now running!

> To stop the app, go back to the terminal and press **Ctrl + C**.

---

## Returning to the app later

Every time you want to use the app, you'll need to start it again:

1. Open your terminal (or Command Prompt on Windows)
2. Navigate back to the app folder:
   - **macOS / Linux:** `cd apartment-tracker-main`
   - **Windows:** `cd C:\Users\YourName\Downloads\apartment-tracker-main`
3. Run `npm run dev`
4. Open your browser to `http://localhost:5173`

Your listings and settings are saved in your browser automatically, so they'll still be there each time.

---

## Using the app

### Adding a listing

**Manual form** — click **Add Listing** and fill in the address, rent, amenities, notes, and a gut feeling score using the 1–10 slider.

**Paste listing text** — on the Add Listing page, switch to the **"Paste listing text"** tab, paste copied text from a Zillow or Apartments.com listing, and click **"Parse & Pre-fill"**. The app will extract the rent, address, and amenities it recognizes, then pre-fill the form so you can review before saving.

### Comparing listings

On the Dashboard, check the **"Compare"** box on 2–3 listing cards, then click **"Compare N selected"**. The Compare view shows all selected listings side by side, with the best rent and gut feeling highlighted in green.

### Rankings

The Rankings tab scores every saved listing:

| Factor | Weight | How it's scored |
|---|---|---|
| Rent | 40% (default) | At or below your budget min = 10/10, at or above max = 0/10 |
| Amenities | 30% (default) | How many amenities are checked out of the total |
| Gut feeling | 30% (default) | Your 1–10 slider score |

Weights are adjustable in Settings — change them to prioritize what matters most to you.

### Settings

- **Budget range** — set your min and max monthly rent to calibrate how rent is scored
- **Scoring weights** — set the percentage weight for each scoring factor (Rent, Amenities, Gut Feeling). The three values must add up to 100%. The Rankings page always reflects your current weights.
- **Amenities** — add or remove items from the checklist; changes take effect everywhere immediately
