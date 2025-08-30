import type { NextRequest } from "next/server"
import { getStations } from "@/lib/stations"
import { rankStations } from "@/lib/ranking"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "")
  const lng = Number.parseFloat(searchParams.get("lng") || "")
  const radiusKm = Number.parseFloat(searchParams.get("radiusKm") || "10")
  const battery = Number.parseFloat(searchParams.get("battery") || "50")

  if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusKm) || Number.isNaN(battery)) {
    return new Response(JSON.stringify({ error: "Invalid query params. Expect lat,lng,radiusKm,battery." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const all = getStations()
  const ranked = rankStations(lat, lng, Math.max(0, Math.min(100, battery)), Math.max(0.5, radiusKm), all)

  return new Response(JSON.stringify({ stations: ranked }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })
}
