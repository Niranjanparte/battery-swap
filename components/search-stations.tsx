"use client"

import useSWR from "swr"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import MiniMap from "@/components/mini-maps"
import { FavoriteToggle } from "./favorite-toggle"
import type { RankedStation } from "@/types"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ApiResponse = { stations: RankedStation[] }

const demoAddresses: Record<string, { lat: number; lng: number }> = {
  "Bengaluru (Demo)": { lat: 12.9716, lng: 77.5946 },
  "Mumbai (Demo)": { lat: 19.076, lng: 72.8777 },
  "Delhi (Demo)": { lat: 28.6139, lng: 77.209 },
  "Pune (Demo)": { lat: 18.5204, lng: 73.8567 },
  "Hyderabad (Demo)": { lat: 17.385, lng: 78.4867 },
}

export default function SearchStations() {
  const [method, setMethod] = useState<"coords" | "address">("coords")
  const [lat, setLat] = useState<number | "">("")
  const [lng, setLng] = useState<number | "">("")
  const [address, setAddress] = useState<keyof typeof demoAddresses | "">("")
  const [radiusKm, setRadiusKm] = useState(10)
  const [battery, setBattery] = useState(60)
  const [unit, setUnit] = useState<"km" | "mi">("km")
  const [minReliabilityPct, setMinReliabilityPct] = useState(80)
  const [maxQueue, setMaxQueue] = useState(10)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const { toast } = useToast()

  const coords = useMemo(() => {
    if (method === "coords" && lat !== "" && lng !== "") {
      return { lat: Number(lat), lng: Number(lng) }
    }
    if (method === "address" && address) {
      return demoAddresses[address]
    }
    return null
  }, [method, lat, lng, address])

  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)

    const qLat = sp.get("lat")
    const qLng = sp.get("lng")
    if (qLat && qLng && !Number.isNaN(Number(qLat)) && !Number.isNaN(Number(qLng))) {
      setMethod("coords")
      setLat(Number(Number(qLat).toFixed(6)))
      setLng(Number(Number(qLng).toFixed(6)))
    }

    const qBattery = sp.get("battery")
    if (qBattery && !Number.isNaN(Number(qBattery))) setBattery(Math.min(100, Math.max(0, Number(qBattery))))

    const qRadius = sp.get("radiusKm")
    if (qRadius && !Number.isNaN(Number(qRadius))) setRadiusKm(Math.min(50, Math.max(1, Number(qRadius))))

    const qUnit = sp.get("unit")
    if (qUnit === "km" || qUnit === "mi") setUnit(qUnit)

    const qMinRel = sp.get("minRel")
    if (qMinRel && !Number.isNaN(Number(qMinRel))) setMinReliabilityPct(Math.min(99, Math.max(50, Number(qMinRel))))

    const qMaxQueue = sp.get("maxQueue")
    if (qMaxQueue && !Number.isNaN(Number(qMaxQueue))) setMaxQueue(Math.min(12, Math.max(0, Number(qMaxQueue))))

    const qFavOnly = sp.get("favOnly")
    if (qFavOnly === "1") setShowFavoritesOnly(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!coords) return
    const u = new URL(window.location.href)
    u.searchParams.set("lat", String(coords.lat))
    u.searchParams.set("lng", String(coords.lng))
    u.searchParams.set("battery", String(battery))
    u.searchParams.set("radiusKm", String(radiusKm))
    u.searchParams.set("unit", unit)
    u.searchParams.set("minRel", String(minReliabilityPct))
    u.searchParams.set("maxQueue", String(maxQueue))
    u.searchParams.set("favOnly", showFavoritesOnly ? "1" : "0")
    window.history.replaceState(null, "", u.toString())
  }, [coords, battery, radiusKm, unit, minReliabilityPct, maxQueue, showFavoritesOnly])

  const isFav = useCallback((id: string) => favorites.includes(id), [favorites])
  const toggleFav = useCallback(
    (id: string) => setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  )

  const queryUrl = useMemo(() => {
    if (!coords) return null
    const u = new URL("/api/stations", window.location.origin)
    u.searchParams.set("lat", String(coords.lat))
    u.searchParams.set("lng", String(coords.lng))
    u.searchParams.set("radiusKm", String(radiusKm))
    u.searchParams.set("battery", String(battery))
    return u.toString()
  }, [coords, radiusKm, battery])

  const { data, isLoading, error } = useSWR<ApiResponse>(queryUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: coords ? 5000 : 0,
  })

  const toMiles = (km: number) => km * 0.621371
  const formatDistance = (km: number) => (unit === "km" ? `${km.toFixed(1)} km` : `${toMiles(km).toFixed(1)} mi`)

  const stationsRaw = data?.stations ?? []

  const stations = stationsRaw.filter(
    (s) => s.queueLength <= maxQueue && Math.round(s.reliability * 100) >= minReliabilityPct,
  )

  const share = useCallback(async () => {
    if (!coords) {
      toast({
        title: "Add a location",
        description: "Enter coordinates or pick a demo address first.",
        variant: "destructive",
      })
      return
    }
    const appUrl = new URL(window.location.href)
    appUrl.searchParams.set("lat", String(coords.lat))
    appUrl.searchParams.set("lng", String(coords.lng))
    appUrl.searchParams.set("battery", String(battery))
    appUrl.searchParams.set("radiusKm", String(radiusKm))
    appUrl.searchParams.set("unit", unit)
    appUrl.searchParams.set("minRel", String(minReliabilityPct))
    appUrl.searchParams.set("maxQueue", String(maxQueue))
    appUrl.searchParams.set("favOnly", showFavoritesOnly ? "1" : "0")

    const mapsUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Battery Swap Station Finder",
          text: `My location and search filters\nMaps: ${mapsUrl}`,
          url: appUrl.toString(),
        })
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${appUrl.toString()}\n${mapsUrl}`)
        toast({ title: "Share link copied", description: "App link and Maps location copied to clipboard." })
      } else {
        window.prompt("Copy this link to share:", `${appUrl.toString()}\n${mapsUrl}`)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${appUrl.toString()}\n${mapsUrl}`)
        toast({ title: "Share link copied", description: "App link and Maps location copied to clipboard." })
      } catch {
        window.prompt("Copy this link to share:", `${appUrl.toString()}\n${mapsUrl}`)
      }
    }
  }, [coords, battery, radiusKm, unit, minReliabilityPct, maxQueue, showFavoritesOnly, toast])

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setMethod("coords")
      setLat(Number(pos.coords.latitude.toFixed(6)))
      setLng(Number(pos.coords.longitude.toFixed(6)))
    })
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-pretty text-lg">Find Battery Swap Stations</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={unit} onValueChange={(v: "km" | "mi") => setUnit(v)}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">km</SelectItem>
                <SelectItem value="mi">miles</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={share}
              disabled={!coords}
              aria-label="Share current location and filters"
            >
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Label className={cn("text-sm", method === "coords" ? "font-medium" : "text-muted-foreground")}>
                Coordinates
              </Label>
              <div className="text-xs text-muted-foreground">/</div>
              <Label className={cn("text-sm", method === "address" ? "font-medium" : "text-muted-foreground")}>
                Address (Demo)
              </Label>
            </div>

            <Select value={method} onValueChange={(v: "coords" | "address") => setMethod(v)}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Select input method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coords">Coordinates</SelectItem>
                <SelectItem value="address">Address (Demo)</SelectItem>
              </SelectContent>
            </Select>

            {method === "coords" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 12.9716"
                    value={lat}
                    onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 77.5946"
                    value={lng}
                    onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="secondary" onClick={useMyLocation} className="w-full">
                    Use my location
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="addr">Address (Demo)</Label>
                  <Select value={address} onValueChange={(v) => setAddress(v as any)}>
                    <SelectTrigger id="addr">
                      <SelectValue placeholder="Choose a demo address" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(demoAddresses).map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Resolved Coords</Label>
                  <div className="text-sm text-muted-foreground">
                    {address
                      ? `${demoAddresses[address].lat.toFixed(4)}, ${demoAddresses[address].lng.toFixed(4)}`
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Battery State: {battery}%</Label>
                <Slider value={[battery]} min={0} max={100} step={1} onValueChange={(v) => setBattery(v[0] ?? 0)} />
              </div>
              <div className="space-y-2">
                <Label>Search Radius: {radiusKm} km</Label>
                <Slider value={[radiusKm]} min={1} max={50} step={1} onValueChange={(v) => setRadiusKm(v[0] ?? 10)} />
              </div>
              <div className="space-y-2">
                <Label>Min Reliability: {minReliabilityPct}%</Label>
                <Slider
                  value={[minReliabilityPct]}
                  min={50}
                  max={99}
                  step={1}
                  onValueChange={(v) => setMinReliabilityPct(v[0] ?? 80)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Queue: {maxQueue}</Label>
                <Slider value={[maxQueue]} min={0} max={12} step={1} onValueChange={(v) => setMaxQueue(v[0] ?? 10)} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={showFavoritesOnly}
                    onCheckedChange={(v) => setShowFavoritesOnly(Boolean(v))}
                    aria-label="Show favorites only"
                  />
                  Show favorites only
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm text-muted-foreground">
              Results update every 5s to simulate real-time queues and reliability.
            </div>
          </div>
        </CardContent>
      </Card>

      {coords && stations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-pretty text-base">Map overview</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniMap
              user={coords}
              points={stations.slice(0, 50).map((s) => ({
                lat: s.lat,
                lng: s.lng,
                id: s.id,
                color:
                  Math.round(s.reliability * 100) >= 85
                    ? "#16a34a" // green
                    : Math.round(s.reliability * 100) < 70
                      ? "#dc2626" // red
                      : "#374151", // gray
              }))}
              className="w-full max-w-full rounded-md"
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-base font-medium text-pretty">Nearby stations</h2>

        {!coords && <div className="text-sm text-muted-foreground">Enter a location to see results.</div>}

        {coords && isLoading && <div className="text-sm">Loading stations…</div>}

        {coords && error && <div className="text-sm text-red-600">Failed to load stations.</div>}

        {coords && !isLoading && stations.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No stations found within {radiusKm} km. Try increasing radius.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {(showFavoritesOnly ? stations.filter((s) => isFav(s.id)) : stations).map((s) => (
            <StationCard
              key={s.id}
              s={s}
              lat={coords!.lat}
              lng={coords!.lng}
              battery={battery}
              unit={unit}
              isFavorite={isFav(s.id)}
              onToggleFavorite={() => toggleFav(s.id)}
              formatDistance={formatDistance}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StationCard({
  s,
  lat,
  lng,
  battery,
  unit,
  isFavorite,
  onToggleFavorite,
  formatDistance,
}: {
  s: RankedStation
  lat: number
  lng: number
  battery: number
  unit: "km" | "mi"
  isFavorite: boolean
  onToggleFavorite: () => void
  formatDistance: (km: number) => string
}) {
  const url = useMemo(() => {
    const u = new URL(`/stations/${s.id}`, window.location.origin)
    u.searchParams.set("lat", String(lat))
    u.searchParams.set("lng", String(lng))
    u.searchParams.set("battery", String(battery))
    return u.toString()
  }, [s.id, lat, lng, battery])

  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`

  return (
    <Card className="border-teal-600/10">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-pretty">{s.name}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">{formatDistance(s.distanceKm)}</div>
          <FavoriteToggle active={isFavorite} onToggle={onToggleFavorite} />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <Info label="ETA" value={`${s.travelEtaMin} min`} />
        <Info label="Queue" value={`${s.queueLength} ahead`} />
        <Info label="Est. Wait" value={`${s.estWaitMin} min`} />
        <Info label="Reliability" value={`${Math.round(s.reliability * 100)}%`} />
        <div className="col-span-2 md:col-span-1 flex items-center gap-3">
          <Link href={url} className="text-teal-700 hover:underline">
            Details
          </Link>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline"
          >
            Maps
          </a>
        </div>
      </CardContent>
    </Card>
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