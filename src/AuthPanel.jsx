import { useState } from 'react'

// Deux onglets : connexion, et création de compte (qui demande la clé fournie par l'administrateur)
export default function AuthPanel({ initialMode, initialToken, onLogin, onSignup, onCancel }) {
  const [mode, setMode] = useState(initialMode ?? 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(initialToken ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = isSignup
      ? await onSignup(email.trim(), password, token.trim())
      : await onLogin(email.trim(), password)
    setBusy(false)
    if (result.error) setError(result.error)
    else if (result.message) setMessage(result.message)
    else onCancel() // succès : on ferme le panneau
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="tabs">
        <button type="button" className={isSignup ? 'tab' : 'tab active'} onClick={() => switchMode('login')}>
          Connexion
        </button>
        <button type="button" className={isSignup ? 'tab active' : 'tab'} onClick={() => switchMode('signup')}>
          Créer un compte
        </button>
      </div>

      <label>
        E-mail
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
        />
      </label>
      {isSignup && (
        <label>
          Clé d’invitation
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
          <small>Elle t’est fournie par l’administrateur de la carte.</small>
        </label>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="note">{message}</p>}
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>{message ? 'Fermer' : 'Annuler'}</button>
        <button type="submit" className="btn btn-primary" disabled={busy || !!message}>
          {busy ? '…' : isSignup ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </div>
    </form>
  )
}
