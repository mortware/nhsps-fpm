import React from 'react'
import type { Room } from '../types'

export default function RoomsList(props: {
  rooms: Room[]
  selectedId: number | null
  onSelect: (roomId: number) => void
}) {
  return (
    <div>
      <h2 className="mt-0 text-lg font-semibold">Rooms</h2>
      <ul className="m-0 list-none p-0">
        {props.rooms.map((r) => (
          <li key={r.roomId} className="mb-2">
            <button
              onClick={() => props.onSelect(r.roomId)}
              className={
                `w-full border border-slate-300 p-2 text-left ` +
                (r.roomId === props.selectedId ? 'bg-slate-100' : 'bg-white')
              }
            >
              #{r.roomId} - {r.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
