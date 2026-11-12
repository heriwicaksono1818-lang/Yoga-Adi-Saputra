import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('placeholder')
)

// Gunakan fallback URL aman saat environment variable belum disetel agar app tidak crash seketika
const safeUrl = (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
  ? supabaseUrl
  : 'https://placeholder-project.supabase.co'

const safeKey = supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
