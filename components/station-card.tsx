"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReliabilitySparkline from "./reliability-sparkline"
import { FavoriteToggle } from "./favorite-toggle"
import type { StationWithMetrics } from "@/types"

export default function StationCard({
  s,
  isFavorite,
  onToggleFavorite,
}: {
  s: StationWithMetrics
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-pretty">{s.name}</CardTitle>
        <FavoriteToggle active={isFavorite} onToggle={onToggleFavorite} />
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="secondary" className="whitespace-nowrap">
            {s.distanceKm.toFixed(1)} km
          </Badge>
          <Badge className="bg-teal-600 text-white hover:bg-teal-700">ETA {s.etaMinutes}m</Badge>
          <Badge variant="outline">Queue {s.queueLength}</Badge>
          <Badge variant="outline">Reliability {(s.reliability * 100).toFixed(0)}%</Badge>
          <span className="text-xs text-muted-foreground">Wait ~{s.waitMinutes}m</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Trend:</span>
          <ReliabilitySparkline values={s.reliabilityHistory} />
        </div>
        <div className="flex justify-end">
          <Button asChild size="sm">
            <Link href={`/stations/${s.id}`}>View details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
