"use client"

import { useEffect, useRef } from "react"
import type { LatLng } from "@/types"

type Point = LatLng & { id?: string; color?: string }

export default function MiniMap({
  user,
  points,
  className,
}: {
  user: LatLng
  points: Point[]
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    const lats = [user.lat, ...points.map((p) => p.lat)]
    const lngs = [user.lng, ...points.map((p) => p.lng)]
    const minLat = Math.min(...lats) - 0.01
    const maxLat = Math.max(...lats) + 0.01
    const minLng = Math.min(...lngs) - 0.01
    const maxLng = Math.max(...lngs) + 0.01

    const toXY = (p: LatLng) => {
      const x = ((p.lng - minLng) / (maxLng - minLng || 1)) * (width - 20) + 10
      const y = ((maxLat - p.lat) / (maxLat - minLat || 1)) * (height - 20) + 10
      return { x, y }
    }

    // border
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

    // user
    const u = toXY(user)
    ctx.fillStyle = "#0f766e" // teal-700
    ctx.beginPath()
    ctx.arc(u.x, u.y, 5, 0, Math.PI * 2)
    ctx.fill()

    // stations
    for (const p of points) {
      const { x, y } = toXY(p)
      ctx.fillStyle = p.color || "#1f2937"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [user, points])

  return <canvas ref={ref} width={400} height={220} className={className} aria-label="mini map" />
}