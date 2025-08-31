export type Station = {
  id: string
  name: string
  lat: number
  lng: number
  avgSpeedKph: number
  queueLength: number
  reliability: number 
}

export type LatLng = { lat: number; lng: number }

export type RankedStation = Station & {
  distanceKm: number
  travelEtaMin: number
  estWaitMin: number
}

export type StationDetailResponse = {
  station: Station & {
    travelEtaMin: number | null
    distanceKm: number | null
    estWaitMin: number
    reliabilityHistory: { t: number; reliability: number }[]
  }
}
