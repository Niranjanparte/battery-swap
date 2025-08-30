import SearchStations from "@/components/search-stations"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl md:text-3xl font-semibold">Battery Swap Station Finder</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your location, battery level, and radius to find the best stations.
        </p>
      </header>
      <SearchStations />
      <footer className="mt-10 text-xs text-muted-foreground">
        {/* Brand color: teal; Neutrals: white, near-black, muted (4 colors total) */}
        Built for the Full-Stack Engineer Intern task.
      </footer>
    </main>
  )
}
