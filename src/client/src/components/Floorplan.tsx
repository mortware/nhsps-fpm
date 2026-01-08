import React from 'react'
import type { Room } from '../types'
import { asGeoJsonPolygon, computeBounds, toSvgPoints } from '../geojson'

export default function Floorplan(props: {
  rooms: Room[]
  selectedId: number | null
  onSelect: (roomId: number) => void
}) {
  const svgWidth = 800
  const svgHeight = 600

  const bounds = computeBounds(props.rooms.map((r) => r.geometry))

  return (
    <div>
      <h2 className="mt-0 text-lg font-semibold">Floorplan</h2>
      <div className="floorplan-container">
        {!bounds ? (
          <div>No polygon geometry to render yet.</div>
        ) : (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full border border-slate-200 bg-white"
          >
            {props.rooms.map((room) => {
              const poly = asGeoJsonPolygon(room.geometry)
              const ring = poly?.coordinates?.[0]
              if (!ring || ring.length < 3) return null

              const points = toSvgPoints(ring, bounds, svgWidth, svgHeight)
              const selected = room.roomId === props.selectedId
              return (
                <polygon
                  key={room.roomId}
                  points={points}
                  onClick={() => props.onSelect(room.roomId)}
                  className={
                    selected
                      ? 'cursor-pointer fill-blue-100 stroke-blue-600 stroke-2'
                      : 'cursor-pointer fill-slate-100 stroke-slate-500 stroke-1'
                  }
                >
                  <title>{room.name}</title>
                </polygon>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}
