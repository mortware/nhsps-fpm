export type Room = {
  roomId: number
  geometry: unknown
  name: string
  usage: string | null
  notes: string | null
}

export type RoomsFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: unknown
    properties: {
      roomId: number
      name: string
      usage: string | null
      notes: string | null
    }
  }>
}
