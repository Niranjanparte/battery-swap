"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FavoriteToggle({
  active,
  onToggle,
  className,
}: {
  active: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <Button
      variant={active ? "default" : "secondary"}
      size="sm"
      className={cn("px-2 py-1", className)}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={onToggle}
    >
      <span className="sr-only">{active ? "Unfavorite" : "Favorite"}</span>
      <span aria-hidden>{active ? "♥" : "♡"}</span>
    </Button>
  )
}
