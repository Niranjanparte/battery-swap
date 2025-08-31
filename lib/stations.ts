// Simulated station dataset with dynamic in-memory updates.

import type { Station } from "@/types"

type Dynamics = {
  lastUpdate: number
  jitterSeed: number
}

const dynamics: Dynamics = {
  lastUpdate: Date.now(),
  jitterSeed: Math.random(),
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function randN(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const baseStations: Station[] = [
  {
    id: "blr-1",
    name: "Koramangala Swap Hub",
    lat: 12.9352,
    lng: 77.6245,
    avgSpeedKph: 42,
    queueLength: 4,
    reliability: 0.93,
  },
  {
    id: "blr-2",
    name: "Whitefield Energy Point",
    lat: 12.9698,
    lng: 77.7499,
    avgSpeedKph: 45,
    queueLength: 3,
    reliability: 0.95,
  },
  {
    id: "blr-3",
    name: "Hebbal QuickSwap",
    lat: 13.0358,
    lng: 77.597,
    avgSpeedKph: 48,
    queueLength: 2,
    reliability: 0.9,
  },
  {
    id: "bom-1",
    name: "Andheri Swap Center",
    lat: 19.1197,
    lng: 72.8468,
    avgSpeedKph: 38,
    queueLength: 6,
    reliability: 0.9,
  },
  {
    id: "bom-2",
    name: "BKC Charge & Swap",
    lat: 19.0606,
    lng: 72.867,
    avgSpeedKph: 35,
    queueLength: 7,
    reliability: 0.88,
  },

  {
    id: "del-1",
    name: "Connaught Circle Swap",
    lat: 28.6315,
    lng: 77.2167,
    avgSpeedKph: 40,
    queueLength: 5,
    reliability: 0.92,
  },
  {
    id: "del-2",
    name: "Gurugram RapidSwap",
    lat: 28.4595,
    lng: 77.0266,
    avgSpeedKph: 46,
    queueLength: 3,
    reliability: 0.94,
  },
  {
    id: "pun-1",
    name: "Hinjawadi Swap Spot",
    lat: 18.5919,
    lng: 73.7389,
    avgSpeedKph: 44,
    queueLength: 1,
    reliability: 0.96,
  },
  {
    id: "hyd-1",
    name: "HITEC Power Swap",
    lat: 17.4483,
    lng: 78.3915,
    avgSpeedKph: 43,
    queueLength: 2,
    reliability: 0.93,
  },

  {
    id: "gen-1",
    name: "Expressway Swap North",
    lat: 22.5726,
    lng: 88.3639,
    avgSpeedKph: 47,
    queueLength: 3,
    reliability: 0.91,
  }, 
  {
    id: "gen-2",
    name: "Ring Road Swap West",
    lat: 23.0225,
    lng: 72.5714,
    avgSpeedKph: 45,
    queueLength: 2,
    reliability: 0.95,
  }, 
]

let stations: Station[] = baseStations.map((s) => ({ ...s }))

function applyDynamics() {
  const now = Date.now()
  const elapsedSec = (now - dynamics.lastUpdate) / 1000
  if (elapsedSec < 2) return // Throttle updates

  dynamics.lastUpdate = now
  dynamics.jitterSeed += elapsedSec / 13

  stations = stations.map((s, idx) => {
    const seed = dynamics.jitterSeed + idx * 1.337
    const queueDrift = Math.round((randN(seed) - 0.5) * 2) // -1, 0, +1
    const newQueue = clamp(s.queueLength + queueDrift, 0, 12)

    const noise = (randN(seed + 42) - 0.5) * 0.01
    const towardBase = (baseStations[idx]?.reliability ?? 0.9) - s.reliability
    const newReliability = clamp(s.reliability + towardBase * 0.05 + noise, 0.75, 0.99)

    return { ...s, queueLength: newQueue, reliability: newReliability }
  })
}

export function getStations(): Station[] {
  applyDynamics()
  return stations }

export function getStationById(id: string): Station | undefined {
  applyDynamics()
  return stations.find((s) => s.id === id)
}
