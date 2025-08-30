import { haversineKm } from "@/lib/geo"
import type { RankedStation, Station } from "@/types"

export function computeTravelEtaMin(
  userLat: number,
  userLng: number,
  station: Station,
  batteryPercent: number,
): { distanceKm: number; travelEtaMin: number } {
  const distanceKm = haversineKm(userLat, userLng, station.lat, station.lng)

  // Battery affects effective speed:
  // 0% => 50% speed, 100% => 100% speed. Clamp 0.5..1.0
  const batteryFactor = 0.5 + 0.5 * (batteryPercent / 100)
  const effectiveSpeed = Math.max(10, station.avgSpeedKph * batteryFactor) // safety minimum 10 kph

  const hours = distanceKm / effectiveSpeed
  const travelEtaMin = Math.round(hours * 60)
  return { distanceKm, travelEtaMin }
}

export function estimateWaitMin(queueLen: number): number {
  // Simple model: 6 minutes per swap in queue
  return queueLen * 6
}

export function rankStations(
  userLat: number,
  userLng: number,
  batteryPercent: number,
  radiusKm: number,
  allStations: Station[],
): RankedStation[] {
  const enriched = allStations
    .map((s) => {
      const { distanceKm, travelEtaMin } = computeTravelEtaMin(userLat, userLng, s, batteryPercent)
      return {
        ...s,
        distanceKm,
        travelEtaMin,
        estWaitMin: estimateWaitMin(s.queueLength),
      }
    })
    .filter((s) => s.distanceKm <= radiusKm)

  enriched.sort((a, b) => {
    if (a.travelEtaMin !== b.travelEtaMin) return a.travelEtaMin - b.travelEtaMin
    if (a.queueLength !== b.queueLength) return a.queueLength - b.queueLength
    return b.reliability - a.reliability
  })

  return enriched
}
