import { useState } from 'react'
import MapView from './MapView'
import EditorPanel from './EditorPanel'
import AuthPanel from './AuthPanel'
import { usePlaces } from './usePlaces'
import { useAuth } from './useAuth'
import { CITY } from './config'

export default function App() {
  const { places, error, addPlace, updatePlace } = usePlaces()
  const { session, isEditor, roleReady, signIn, signUp, signOut } = useAuth()

  // Lien d'invitation facultatif : https://ton-site/?cle=XXXX (préremplit la clé)
  const [inviteToken] = useState(() => new URLSearchParams(window.location.search).get('cle') ?? '')
  const [authMode, setAuthMode] = useState(inviteToken ? 'signup' : null) // null | 'login' | 'signup'

  const [adding, setAdding] = useState(false) // mode « ajouter un lieu »
  const [pending, setPending] = useState(null) // position choisie pour le nouveau lieu
  const [editing, setEditing] = useState(null) // lieu en cours de modification
  const [focus, setFocus] = useState(null) // lieu sur lequel centrer la carte

  function startAdd() {
    setEditing(null)
    setPending(null)
    setAdding(true)
  }

  function cancelAdd() {
    setAdding(false)
    setPending(null)
  }

  function selectPlace(place) {
    cancelAdd()
    setEditing(place)
    setFocus({ lat: place.lat, lng: place.lng })
  }

  async function handleAdd(values) {
    const result = await addPlace({ ...values, lat: pending[0], lng: pending[1] })
    if (!result.error) cancelAdd()
    return result
  }

  async function handleEdit(values) {
    const result = await updatePlace(editing.id, values)
    if (!result.error) setEditing(null)
    return result
  }

  function closeAuth() {
    setAuthMode(null)
    if (new URLSearchParams(window.location.search).has('cle')) {
      window.history.replaceState({}, '', window.location.pathname) // retire la clé de l'URL
    }
  }

  async function handleSignOut() {
    await signOut()
    cancelAdd()
    setEditing(null)
  }

  return (
    <div className="app">
      <header>
        <h1>Carte de {CITY.name}</h1>
        <span className="spacer" />
        {session ? (
          <>
            <span className="who">{session.user.email}</span>
            <button type="button" className="btn" onClick={handleSignOut}>Se déconnecter</button>
          </>
        ) : (
          <button type="button" className="btn" onClick={() => setAuthMode('login')}>Connexion</button>
        )}
      </header>

      {error && <p className="banner">{error}</p>}

      <div className="workspace">
        {isEditor && (
          <EditorPanel
            places={places}
            adding={adding}
            pending={pending}
            editing={editing}
            onStartAdd={startAdd}
            onCancelAdd={cancelAdd}
            onSubmitAdd={handleAdd}
            onSelect={selectPlace}
            onSubmitEdit={handleEdit}
            onBack={() => setEditing(null)}
          />
        )}

        {session && roleReady && !isEditor && (
          <aside className="sidebar">
            <h2>Compte sans droits de modification</h2>
            <p className="muted">
              Tu es connecté(e), mais ce compte ne peut pas modifier la carte. Les comptes éditeurs se
              créent avec une clé d’invitation fournie par l’administrateur.
            </p>
          </aside>
        )}

        <MapView
          places={places}
          pending={isEditor ? pending : null}
          adding={adding}
          canEdit={isEditor}
          focus={focus}
          onPick={setPending}
          onEdit={selectPlace}
          onMove={(id, [lat, lng]) => updatePlace(id, { lat, lng })}
        />

        {authMode && (
          <AuthPanel
            initialMode={authMode}
            initialToken={inviteToken}
            onLogin={signIn}
            onSignup={signUp}
            onCancel={closeAuth}
          />
        )}
      </div>
    </div>
  )
}
