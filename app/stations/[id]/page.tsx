"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { FavoriteToggle } from "@/components/favorite-toggle"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StationDetailPage({ params }: { params: { id: string } }) {
  const sp = useSearchParams()
  const lat = sp.get("lat")
  const lng = sp.get("lng")
  const batteryParam = sp.get("battery")

  const [battery, setBattery] = useState<number>(batteryParam ? Number(batteryParam) : 60)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites:stations")
      if (raw) setFavorites(JSON.parse(raw))
    } catch {}
  }, [])
  const isFav = favorites.includes(params.id)
  const toggleFav = () =>
    setFavorites((prev) => {
      const next = isFav ? prev.filter((x) => x !== params.id) : [...prev, params.id]
      try {
        localStorage.setItem("favorites:stations", JSON.stringify(next))
      } catch {}
      return next
    })

  const url = useMemo(() => {
    const u = new URL(`/api/stations/${params.id}`, window.location.origin)
    if (lat && lng) {
      u.searchParams.set("lat", lat)
      u.searchParams.set("lng", lng)
    }
    u.searchParams.set("battery", String(battery))
    return u.toString()
  }, [params.id, lat, lng, battery])

  const { data, isLoading } = useSWR<any>(url, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  })

  const st = data?.station

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-teal-700 hover:underline">
          ← Back to results
        </Link>
        <FavoriteToggle active={isFav} onToggle={toggleFav} />
      </div>

      {/* Battery adjuster */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pretty text-base">Battery for ETA: {battery}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider value={[battery]} min={0} max={100} step={1} onValueChange={(v) => setBattery(v[0] ?? 60)} />
        </CardContent>
      </Card>

      {isLoading && <div className="text-sm">Loading…</div>}
      {st && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">{st.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Info label="Queue" value={`${st.queueLength} ahead`} />
              <Info label="Est. Wait" value={`${st.estWaitMin} min`} />
              <Info label="Reliability" value={`${Math.round(st.reliability * 100)}%`} />
              <Info label="Avg Speed" value={`${st.avgSpeedKph} km/h`} />
              <Info label="Latitude" value={st.lat.toFixed(4)} />
              <Info label="Longitude" value={st.lng.toFixed(4)} />
              <Info label="Distance" value={st.distanceKm != null ? `${st.distanceKm.toFixed(1)} km` : "—"} />
              <Info label="ETA" value={st.travelEtaMin != null ? `${st.travelEtaMin} min` : "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">Reliability history (simulated)</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={st.reliabilityHistory}>
                  <XAxis dataKey="t" tick={false} />
                  <YAxis domain={[0.7, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
                  <Line type="monotone" dataKey="reliability" stroke="#0f766e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
