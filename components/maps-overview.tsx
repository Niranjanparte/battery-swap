"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet"
import type { LatLng, RankedStation } from "@/types"
//import { latLngBounds } from "leaflet"

type Props = {
  user: LatLng
  stations: RankedStation[]
  radiusKm: number
  className?: string
}

function FitBounds({ user, stations }: { user: LatLng; stations: RankedStation[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    const pts = [[user.lat, user.lng], ...stations.map((s) => [s.lat, s.lng])] as [number, number][]
    if (pts.length === 1) {
      map.setView(pts[0], 13)
      return
    }
    const b = latLngBounds(pts)
    map.fitBounds(b, { padding: [30, 30] })
  }, [map, user, stations])

  return null
}

export default function MapOverview({ user, stations, radiusKm, className }: Props) {
  const userPos: [number, number] = [user.lat, user.lng]
  const mapCenter = useMemo(() => userPos, [user.lat, user.lng])

  // Color system: primary teal; neutrals (white, gray-700, gray-300); accents green/red
  const stationColor = (rel: number) => {
    const pct = Math.round(rel * 100)
    if (pct >= 85) return "#16a34a" // green-600
    if (pct < 70) return "#dc2626" // red-600
    return "#374151" // gray-700
  }

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: 320, width: "100%", borderRadius: 8, overflow: "hidden" }}
        scrollWheelZoom={false}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Search radius */}
        <Circle center={userPos} radius={radiusKm * 1000} pathOptions={{ color: "#0f766e", fillOpacity: 0.06 }} />

        {/* User marker */}
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{ color: "#0f766e", fillColor: "#0f766e", fillOpacity: 1 }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-medium">You</div>
              <div className="text-muted-foreground">
                Lat {user.lat.toFixed(5)}, Lng {user.lng.toFixed(5)}
              </div>
            </div>
          </Popup>
        </CircleMarker>

        {/* Stations */}
        {stations.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={6}
            pathOptions={{
              color: stationColor(s.reliability),
              fillColor: stationColor(s.reliability),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{s.name}</div>
                <div className="text-muted-foreground">
                  {s.distanceKm.toFixed(1)} km • ETA {s.travelEtaMin} min • Q {s.queueLength} • Rel{" "}
                  {Math.round(s.reliability * 100)}%
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <FitBounds user={user} stations={stations} />
      </MapContainer>
    </div>
  )
}