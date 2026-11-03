import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export function usePlaces() {
  const [places, setPlaces] = useState([])
  const [error, setError] = useState(
    supabase ? null : 'Supabase n’est pas configuré : remplis le fichier .env.'
  )

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('places')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPlaces(data)
      })

    // Ajouts et modifications des éditeurs apparaissent en direct pour tous
    const channel = supabase
      .channel('places-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'places' },
        ({ new: place }) =>
          setPlaces((prev) => (prev.some((p) => p.id === place.id) ? prev : [...prev, place]))
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'places' },
        ({ new: place }) => setPlaces((prev) => prev.map((p) => (p.id === place.id ? place : p)))
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const addPlace = useCallback(async ({ name, description, lat, lng }) => {
    if (!supabase) return { error: { message: 'Supabase n’est pas configuré.' } }
    const { data, error } = await supabase
      .from('places')
      .insert({ name, description, lat, lng })
      .select()
      .single()
    if (!error) setPlaces((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data]))
    return { error }
  }, [])

  // values : n'importe quel sous-ensemble de { name, description, lat, lng }
  const updatePlace = useCallback(async (id, values) => {
    if (!supabase) return { error: { message: 'Supabase n’est pas configuré.' } }
    const { data, error } = await supabase
      .from('places')
      .update(values)
      .eq('id', id)
      .select()
      .single()
    if (!error) setPlaces((prev) => prev.map((p) => (p.id === id ? data : p)))
    return { error }
  }, [])

  return { places, error, addPlace, updatePlace }
}
