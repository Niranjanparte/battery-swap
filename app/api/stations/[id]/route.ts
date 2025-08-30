import type { NextRequest } from "next/server"
import { getStationById } from "@/lib/stations"
import { computeTravelEtaMin, estimateWaitMin } from "@/lib/ranking"

function generateHistory(base: number, n = 20, min = 0.75, max = 0.99): { t: number; reliability: number }[] {
  const out = []
  let val = base
  for (let i = n - 1; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 0.02
    val = Math.max(min, Math.min(max, val + noise))
    out.push({ t: i, reliability: Number.parseFloat(val.toFixed(3)) })
  }
  return out.reverse()
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const st = getStationById(params.id)
  if (!st) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "")
  const lng = Number.parseFloat(searchParams.get("lng") || "")
  const battery = Number.parseFloat(searchParams.get("battery") || "50")

  let travelEtaMin: number | null = null
  let distanceKm: number | null = null

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && !Number.isNaN(battery)) {
    const res = computeTravelEtaMin(lat, lng, st, Math.max(0, Math.min(100, battery)))
    travelEtaMin = res.travelEtaMin
    distanceKm = res.distanceKm
  }

  const estWaitMin = estimateWaitMin(st.queueLength)
  const reliabilityHistory = generateHistory(st.reliability)

  return new Response(
    JSON.stringify({
      station: {
        ...st,
        travelEtaMin,
        distanceKm,
        estWaitMin,
        reliabilityHistory,
      },
    }),
    { headers: { "content-type": "application/json", "cache-control": "no-store" } },
  )
}
