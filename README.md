# Battery Swap Station Finder

Full-stack demo app to find and rank nearby battery swap stations based on:
- ETA (distance and battery-adjusted speed)
- Queue length
- Station reliability

Includes a details page with simulated reliability history and dynamic queue updates.

## Features

- Location input via:
  - Coordinates (or "Use my location" with browser geolocation)
  - Demo addresses (Bengaluru/Mumbai/Delhi/Pune/Hyderabad)
- Battery slider affects effective speed and ETA
- Radius slider filters stations
- Real-time simulation (queues, reliability) via SWR polling
- Station details page with a simple reliability chart

## How it works

- Backend:
  - `app/api/stations`: returns filtered + ranked list
  - `app/api/stations/[id]`: returns station details and simulated reliability history
  - `lib/stations.ts`: in-memory dataset and dynamic drift for queues/reliability
  - `lib/ranking.ts`: ETA, wait time, and ranking logic (ETA, then queue, then reliability)
- Frontend:
  - `components/search-stations.tsx`: form + results
  - `app/stations/[id]/page.tsx`: details with a small chart

## Run

- Open the preview and click on Vercel link, or Download ZIP/GitHub to use elsewhere.
- No environment variables are required.

## Notes

- Color system is (solid only): teal (brand), white, near-black, muted gray (4 total).
- Typography: Geist Sans/Mono via layout; 1 UI family used for headings/body.
