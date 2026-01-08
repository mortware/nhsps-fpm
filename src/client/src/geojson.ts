export type GeoJsonPolygon = {
  type: 'Polygon'
  coordinates: number[][][]
}

export type GeoJsonLineString = {
  type: 'LineString'
  coordinates: number[][]
}

export type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function asGeoJsonPolygon(value: unknown): GeoJsonPolygon | null {
  if (typeof value !== 'object' || value === null) return null
  const obj = value as Record<string, unknown>
  if (obj.type !== 'Polygon') return null
  const coordinates = obj.coordinates
  if (!Array.isArray(coordinates)) return null
  return obj as GeoJsonPolygon
}

export function asGeoJsonLineString(value: unknown): GeoJsonLineString | null {
  if (typeof value !== 'object' || value === null) return null
  const obj = value as Record<string, unknown>
  if (obj.type !== 'LineString') return null
  const coordinates = obj.coordinates
  if (!Array.isArray(coordinates)) return null
  return obj as GeoJsonLineString
}

export function computeBounds(geometries: Array<unknown>): Bounds | null {
  let bounds: Bounds | null = null

  for (const geometry of geometries) {
    const poly = asGeoJsonPolygon(geometry)
    if (poly) {
      const ring = poly.coordinates?.[0]
      if (!ring || ring.length === 0) continue
      bounds = extendBounds(bounds, ring)
      continue
    }

    const line = asGeoJsonLineString(geometry)
    if (line) {
      const coords = line.coordinates
      if (!coords || coords.length === 0) continue
      bounds = extendBounds(bounds, coords)
    }
  }

  return bounds
}

function extendBounds(existing: Bounds | null, coords: number[][]): Bounds | null {
  let bounds = existing
  for (const pt of coords) {
    if (!Array.isArray(pt) || pt.length < 2) continue
    const x = pt[0]
    const y = pt[1]
    if (typeof x !== 'number' || typeof y !== 'number') continue

    if (!bounds) {
      bounds = { minX: x, maxX: x, minY: y, maxY: y }
    } else {
      bounds.minX = Math.min(bounds.minX, x)
      bounds.maxX = Math.max(bounds.maxX, x)
      bounds.minY = Math.min(bounds.minY, y)
      bounds.maxY = Math.max(bounds.maxY, y)
    }
  }

  return bounds
}

export function toSvgPoints(ring: number[][], bounds: Bounds, width: number, height: number): string {
  const dx = bounds.maxX - bounds.minX
  const dy = bounds.maxY - bounds.minY
  const safeDx = dx === 0 ? 1 : dx
  const safeDy = dy === 0 ? 1 : dy

  return ring
    .map((pt) => {
      const x = pt[0]
      const y = pt[1]
      const nx = (x - bounds.minX) / safeDx
      const ny = (y - bounds.minY) / safeDy
      const sx = nx * width
      const sy = (1 - ny) * height
      return `${sx.toFixed(2)},${sy.toFixed(2)}`
    })
    .join(' ')
}
