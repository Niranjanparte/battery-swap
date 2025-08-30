"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useMemo } from "react"
import type { StationDetailResponse } from "@/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function Details({
  id,
  lat,
  lng,
  battery,
}: {
  id: string
  lat?: number
  lng?: number
  battery: number
}) {
  const url = useMemo(() => {
    const u = new URL(`/api/stations/${id}`, window.location.origin)
    if (lat != null && lng != null) {
      u.searchParams.set("lat", String(lat))
      u.searchParams.set("lng", String(lng))
    }
    u.searchParams.set("battery", String(battery))
    return u.toString()
  }, [id, lat, lng, battery])

  const { data } = useSWR<StationDetailResponse>(url, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  })

  const station = data?.station
  const computed = data?.computed

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6">
        <Button asChild variant="secondary" size="sm">
          <Link href="/">← Back</Link>
        </Button>
      </div>

      {!station ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-pretty">{station.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="secondary">Queue {station.queueLength}</Badge>
              <Badge variant="outline">Reliability {(station.reliability * 100).toFixed(0)}%</Badge>
              {computed && (
                <>
                  <Badge className="bg-teal-600 text-white hover:bg-teal-700">ETA {computed.etaMinutes}m</Badge>
                  <Badge variant="outline">{computed.distanceKm.toFixed(1)} km</Badge>
                  <Badge variant="outline">Wait ~{computed.waitMinutes}m</Badge>
                </>
              )}
            </div>

            <section className="grid gap-3">
              <h3 className="font-semibold">Reliability history</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={station.reliabilityHistory.map((v, i) => ({ i, v: Math.round(v * 100) }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="i" hide />
                    <YAxis domain={[0, 100]} width={30} />
                    <Tooltip />
                    <Line type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="grid gap-3">
              <h3 className="font-semibold">Queue trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={station.queueHistory.map((v, i) => ({ i, v }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="i" hide />
                    <YAxis allowDecimals={false} width={30} />
                    <Tooltip />
                    <Line type="monotone" dataKey="v" stroke="#334155" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
