import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Profile = {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'elite'
  created_at: string
}

export type Holding = {
  id: string
  user_id: string
  ticker: string
  name: string
  shares: number
  avg_buy: number
  added_at: string
}

export type Alert = {
  id: string
  user_id: string
  ticker: string
  type: 'above' | 'below'
  target: number
  triggered: boolean
  created_at: string
}
