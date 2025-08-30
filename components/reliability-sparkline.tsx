"use client"

export default function ReliabilitySparkline({ values }: { values: number[] }) {
  const data = values.slice(-20)
  const w = 80
  const h = 24
  if (data.length < 2) {
    return <div className="text-xs text-muted-foreground">n/a</div>
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - 2) + 1
      const y = h - (((v - min) / (max - min || 1)) * (h - 2) + 1)
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="reliability trend">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
