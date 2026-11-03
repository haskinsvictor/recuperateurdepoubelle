import { useState } from 'react'

// Sert à ajouter un lieu comme à en modifier un (initial = lieu existant)
export default function PlaceForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
    })
    setSaving(false)
    if (error) setError(error.message)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Nom
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
          {saving ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
