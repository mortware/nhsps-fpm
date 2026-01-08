import React, { useEffect, useState } from 'react'
import type { Room, RoomsFeatureCollection } from './types'
import RoomsList from './components/RoomsList'
import Floorplan from './components/Floorplan'
import SelectedRoom from './components/SelectedRoom'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function loadRooms(signal?: AbortSignal) {
    setLoading(true)
    fetch('/api/rooms/geojson', { signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`GET /api/rooms/geojson failed: ${r.status}`)
        return (await r.json()) as RoomsFeatureCollection
      })
      .then((data) => {
        const mappedRooms: Room[] = data.features.map((f) => ({
          roomId: f.properties.roomId,
          name: f.properties.name,
          usage: f.properties.usage,
          notes: f.properties.notes,
          geometry: f.geometry
        }))

        setRooms(mappedRooms)
        setSelectedId((prev) => prev ?? mappedRooms[0]?.roomId ?? null)
        setError(null)
      })
      .catch((e: unknown) => {
        if (signal?.aborted) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      })
      .finally(() => {
        if (signal?.aborted) return
        setLoading(false)
      })
  }

  useEffect(() => {
    const controller = new AbortController()
    loadRooms(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  function loadSelected(roomId: number) {
    let cancelled = false
    fetch(`/api/rooms/${roomId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`GET /api/rooms/${roomId} failed: ${r.status}`)
        return (await r.json()) as Room
      })
      .then((data) => {
        if (cancelled) return
        setSelected(data)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      })

    return () => {
      cancelled = true
    }
  }

  useEffect(() => {
    if (selectedId == null) {
      setSelected(null)
      return
    }
    return loadSelected(selectedId)
  }, [selectedId])

  return (
    <div className="min-h-screen bg-white p-4 font-sans text-slate-900">
      <h1 className="mt-0 text-2xl font-semibold">NHS Property Services - Floorplan Room Editor</h1>
      
      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-100 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {loading && <div>Loading…</div>}

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div>
          <RoomsList rooms={rooms} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div>
          <Floorplan
            rooms={rooms}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <SelectedRoom
            selected={selected}
            onSaved={() => {
              if (selectedId == null) return
              loadRooms()
              loadSelected(selectedId)
            }}
          />
        </div>
      </div>
    </div>
  )
}
