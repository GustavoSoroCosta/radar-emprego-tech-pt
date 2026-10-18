# Radar do Emprego Tech PT

A dashboard that shows what tech companies in Portugal are asking for in their job ads:
the most requested technologies, where the jobs are and how much of the work is remote, hybrid or on-site.
It uses real, daily-updated data from the [itjobs.pt](https://www.itjobs.pt) API.

![Dashboard on desktop](docs/screenshot-desktop.png)

<p align="center">
  <img src="docs/screenshot-mobile.png" alt="Dashboard on a phone" width="280">
</p>

## What it shows

- Headline numbers: jobs analysed, share of remote, hybrid and junior roles
- Technologies asked for in frontend roles and across all roles
- Jobs per city and per work model

## How it works

1. **Fetching** (`src/lib/itjobs.ts`) — the server calls `job/list.json` page by page. Responses are cached
   for 24 hours, so the API is hit at most once a day. The API key only lives on the server.
2. **Normalising** (`src/lib/normalize.ts`) — each job is reduced to what the dashboard needs: technologies
   (matched against a closed list, with care for look-alikes such as Java/JavaScript or React/React Native),
   work model and whether it is a junior role.
3. **Aggregating** (`src/lib/aggregate.ts`) — plain functions count jobs per technology, city or work model.
4. **Drawing** (`src/components/BarChart.tsx`) — D3 computes the scales and React renders the SVG on the
   server, so charts need no client-side JavaScript. Each chart has an accessible name, a text summary and a
   visually hidden table with the same data.

Without an API key, or if the API fails, the page falls back to sample data and says so.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · D3.js · Vitest + Testing Library

## Running locally

```bash
npm install
cp .env.example .env.local   # then add your itjobs.pt API key (https://itjobs.pt/api)
npm run dev                  # http://localhost:3000
npm test
```

## Data

Data from [itjobs.pt](https://www.itjobs.pt), used with their permission. Only aggregated numbers are shown;
individual job ads are not republished.
