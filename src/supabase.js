import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null tant que le fichier .env n'est pas rempli
export const supabase = url && key ? createClient(url, key) : null
