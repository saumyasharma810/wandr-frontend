# Wandr

A personal travel journal. Log trips, leave notes from the road, and ask Wandr what's next.

## Stack

- **Next.js 15** (App Router)
- **Mapbox GL JS** — interactive maps with outdoors style
- **Mapbox Geocoding API** — city search with region context
- **FastAPI backend** — [wandr-ri3h.onrender.com](https://wandr-ri3h.onrender.com)

## Features

- Trip journal with vibe tagging, highlights, and a world map of pins
- Ask Wandr — streaming AI chat with conversation history sidebar
- From the Road — community tips, anonymous posting, helpful votes
- Guest mode with mock data on all pages; auth required to save

## Local setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Frontend is deployed on **Vercel**. Set these env vars in the Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://wandr-ri3h.onrender.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

Backend CORS must include the Vercel domain:

```python
allow_origins=["https://your-app.vercel.app"]
```
