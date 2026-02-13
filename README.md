# FundaView

An app to view fundamental trends for US stocks using the [Financial Modeling Prep (FMP) API](https://site.financialmodelingprep.com/developer/docs).

## Features

- Symbol search (NASDAQ / NYSE / AMEX)
- Annual and quarterly EPS display
- Year-over-year (YoY) change display
- Bookmark management
- Local API key storage (`localStorage`)

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4

## Setup

```bash
npm ci
npm run dev
```

Open `http://localhost:5173/fundaview/` in your browser.

## Available Scripts

- `npm run dev`: Start the dev server
- `npm run build`: Create a production build
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint

## API Notes

- In development (`npm run dev`), requests go through Vite proxy via `/api/fmp`.
- In production (GitHub Pages), requests go directly to `https://financialmodelingprep.com`.
- EPS data uses the `income-statement` endpoint with explicit `period` and `limit` parameters.

## GitHub Pages Deployment

This repository deploys to GitHub Pages via GitHub Actions.

1. Go to `Settings` > `Pages` > `Build and deployment` and set `Source` to `GitHub Actions`.
2. Push to the `main` branch.
3. After the `Deploy to GitHub Pages` workflow succeeds, open the published URL.

Example URL:

- `https://<github-username>.github.io/fundaview/`

## Configuration for Repository Name

For GitHub Pages subpath hosting, this project sets the following in `vite.config.ts`:

- `base: '/fundaview/'`

If you rename the repository, update `base` to match the new repository name.
