import React from 'react'
import type { Room } from '../types'

export default function SelectedRoom(props: { selected: Room | null; onSaved: () => void }) {
  const [name, setName] = React.useState('')
  const [usage, setUsage] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setError(null)
    setSaving(false)

    if (!props.selected) {
      setName('')
      setUsage('')
      setNotes('')
      return
    }

    setName(props.selected.name ?? '')
    setUsage(props.selected.usage ?? '')
    setNotes(props.selected.notes ?? '')
  }, [props.selected])

  function save() {
    if (!props.selected) return
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    fetch(`/api/rooms/${props.selected.roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: trimmedName,
        usage: usage.trim() ? usage.trim() : null,
        notes: notes.trim() ? notes.trim() : null
      })
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => '')
          throw new Error(`PUT /api/rooms/${props.selected?.roomId} failed: ${r.status} ${text}`)
        }
      })
      .then(() => {
        setError(null)
        props.onSaved()
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Unknown error')
      })
      .finally(() => {
        setSaving(false)
      })
  }

  return (
    <div>
      <h2 className="mt-4 text-lg font-semibold">Selected</h2>
      {!props.selected ? (
        <div>Select a room.</div>
      ) : (
        <>
          <div className="text-sm">
            #{props.selected.roomId} {props.selected.name}
          </div>
          {error && (
            <div className="mt-2 rounded border border-red-200 bg-red-100 p-2 text-sm text-red-900">
              {error}
            </div>
          )}

          <div className="mt-3 grid gap-2">
            <label className="grid gap-1 text-sm">
              <div className="text-slate-700">Name</div>
              <input
                className="border border-slate-300 px-2 py-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <div className="text-slate-700">Usage</div>
              <input
                className="border border-slate-300 px-2 py-1"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                disabled={saving}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <div className="text-slate-700">Notes</div>
              <textarea
                className="min-h-24 border border-slate-300 px-2 py-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={saving}
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
