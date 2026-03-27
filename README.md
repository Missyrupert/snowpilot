# SnowPilot

Fiona's wilderness navigation guide for **The Long Dark** on Nintendo Switch. She describes what she sees in-game; SnowPilot generates a prompt she pastes into ChatGPT, Claude, Cursor, or any AI chat to get calm, practical, spoiler-light guidance.

## How it works

1. Fiona opens the app (via your shared link).
2. She describes what she sees: terrain, buildings, weather, her quest.
3. She clicks **Get navigation help**.
4. She copies the generated prompt and pastes it into her preferred AI.
5. She gets structured advice: region, next step, safe-travel tip, tactical choice.

No API keys, no account, no backend — it's a static site.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Share with Fiona — deploy for free

Deploy to get a link you can send her.

### Option 1: Netlify (simplest)

1. Create a [Netlify](https://netlify.com) account.
2. Connect your GitHub repo to Netlify (Site settings → Build & deploy). `netlify.toml` is configured. Or run `npm run build` and drag the `dist/` folder onto [Netlify Drop](https://app.netlify.com/drop).
3. You get a link like `https://random-name-12345.netlify.app`.
4. Send that link to Fiona.

### Option 2: Vercel

1. Create a [Vercel](https://vercel.com) account.
2. Install Vercel CLI: `npm i -g vercel`
3. In the project folder: `npm run build` then `npx vercel` (follow prompts).
4. You get a link like `https://flopilot-xxx.vercel.app`.

### Option 3: GitHub Pages

1. Push this project to a GitHub repo.
2. Settings → Pages → Source: Deploy from branch.
3. Use the main branch and `/` (root).
4. Your site will be at `https://yourusername.github.io/snowpilot` (or your repo name).

## SnowPilot persona

The generated prompt primes the AI to respond as SnowPilot: calm, practical, grounded. No maps, no loot routes, no spoilers. Structure: (1) Where you likely are, (2) Orientation move, (3) Safe travel tip, (4) Next decision. Ends with "Describe what you see now."

## Files

- `src/App.tsx` — main app layout
- `src/components/RegionMapsPanel.tsx` — region map dropdown and links
- `src/data/regions.ts` — region map data (Fandom + Steam spoiler-free links)
- `src/promptBuilder.ts` — SnowPilot prompt builder
