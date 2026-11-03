import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

const NOT_CONFIGURED = { error: 'Supabase n’est pas configuré.' }

export function useAuth() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState({ userId: null, isEditor: false })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  // Une ligne dans « editors » = accès au panneau de modification
  const userId = session?.user?.id
  useEffect(() => {
    if (!supabase || !userId) return
    let cancelled = false
    supabase
      .from('editors')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRole({ userId, isEditor: !!data })
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const isEditor = !!userId && role.userId === userId && role.isEditor
  const roleReady = !userId || role.userId === userId // false pendant la vérification

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return NOT_CONFIGURED
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return {
        error: error.message.includes('Invalid login')
          ? 'E-mail ou mot de passe incorrect.'
          : error.message,
      }
    }
    return {}
  }, [])

  // Le token n'est utile qu'ici, à la création du compte
  const signUp = useCallback(async (email, password, inviteToken) => {
    if (!supabase) return NOT_CONFIGURED
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { invite_token: inviteToken } },
    })
    if (error) {
      return {
        error: error.message.includes('Database error')
          ? 'Création impossible : la clé d’invitation est invalide, expirée ou déjà utilisée.'
          : error.message,
      }
    }
    if (!data.session) {
      return { message: 'Compte créé. Confirme ton adresse e-mail, puis connecte-toi.' }
    }
    return {}
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
  }, [])

  return { session, isEditor, roleReady, signIn, signUp, signOut }
}
