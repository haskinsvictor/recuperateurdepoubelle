import PlaceForm from './PlaceForm'

// Panneau de modification : visible uniquement pour les comptes éditeurs connectés
export default function EditorPanel({
  places,
  adding,
  pending,
  editing,
  onStartAdd,
  onCancelAdd,
  onSubmitAdd,
  onSelect,
  onSubmitEdit,
  onBack,
}) {
  if (adding) {
    return (
      <aside className="sidebar">
        <h2>Ajouter un lieu</h2>
        {pending ? (
          <>
            <p className="muted">Clique ailleurs sur la carte pour déplacer le repère.</p>
            <PlaceForm submitLabel="Ajouter le lieu" onSubmit={onSubmitAdd} onCancel={onCancelAdd} />
          </>
        ) : (
          <>
            <p className="muted">Clique sur la carte à l’endroit du lieu.</p>
            <div className="actions">
              <button type="button" className="btn" onClick={onCancelAdd}>Annuler</button>
            </div>
          </>
        )}
      </aside>
    )
  }

  if (editing) {
    return (
      <aside className="sidebar">
        <h2>Modifier le lieu</h2>
        <p className="muted">Tu peux aussi déplacer son marqueur directement sur la carte.</p>
        <PlaceForm
          key={editing.id}
          initial={editing}
          submitLabel="Enregistrer"
          onSubmit={onSubmitEdit}
          onCancel={onBack}
        />
      </aside>
    )
  }

  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Espace éditeur</h2>
        <button type="button" className="btn btn-primary" onClick={onStartAdd}>Ajouter un lieu</button>
      </div>
      {sorted.length === 0 ? (
        <p className="muted">Aucun lieu pour l’instant. Ajoute le premier.</p>
      ) : (
        <ul className="place-list">
          {sorted.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onSelect(p)}>
                <strong>{p.name}</strong>
                {p.description && <span>{p.description}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
