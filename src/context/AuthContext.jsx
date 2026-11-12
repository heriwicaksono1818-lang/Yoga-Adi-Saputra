import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Demo user data untuk offline / fallback testing
  const DEMO_USERS = {
    'admin.demo@example.com': {
      id: 'demo-admin-uuid-001',
      email: 'admin.demo@example.com',
      nama: 'Administrator Laboratorium',
      role: 'admin',
      status: 'aktif',
    },
    'staff.demo@example.com': {
      id: 'demo-staff-uuid-002',
      email: 'staff.demo@example.com',
      nama: 'Staff Asisten Lab',
      role: 'staff',
      status: 'aktif',
    },
  }

  // Ambil profil dari tabel profiles
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Gagal memuat profil Supabase:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetchProfile:', err)
      return null
    }
  }

  // Inisialisasi Auth State
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Cek saved demo session
        const savedDemo = localStorage.getItem('lab_demo_auth')
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo)
          if (mounted) {
            setUser({ id: parsed.id, email: parsed.email })
            setProfile(parsed)
            setIsDemoMode(true)
            setLoading(false)
          }
          return
        }

        // Jika Supabase terkonfigurasi, cek session Supabase
        if (isSupabaseConfigured) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError

          if (session?.user && mounted) {
            setUser(session.user)
            const prof = await fetchProfile(session.user.id)
            if (prof) {
              if (prof.status === 'nonaktif') {
                await supabase.auth.signOut()
                setUser(null)
                setProfile(null)
                setError('Akun Anda telah dinonaktifkan oleh Administrator.')
              } else {
                setProfile(prof)
              }
            } else {
              // Fallback profil sementara jika tabel profiles belum ada
              setProfile({
                id: session.user.id,
                nama: session.user.user_metadata?.nama || session.user.email?.split('@')[0],
                email: session.user.email,
                role: session.user.user_metadata?.role || 'staff',
                status: 'aktif',
              })
            }
          }
        }
      } catch (err) {
        console.error('Inisialisasi auth error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listener perubahan auth Supabase
    let subscription = null
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          if (prof) {
            if (prof.status === 'nonaktif') {
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setError('Akun Anda telah dinonaktifkan oleh Administrator.')
            } else {
              setProfile(prof)
            }
          }
        } else {
          // Hanya clear jika bukan demo mode
          if (!localStorage.getItem('lab_demo_auth')) {
            setUser(null)
            setProfile(null)
          }
        }
        setLoading(false)
      })
      subscription = data.subscription
    }

    return () => {
      mounted = false
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  // Fungsi Login
  const login = async (email, password) => {
    setError(null)
    setLoading(true)

    try {
      // 1. Cek Demo Fallback jika Supabase belum diset atau memakai email demo
      const cleanEmail = email.trim().toLowerCase()
      if (DEMO_USERS[cleanEmail] && (!isSupabaseConfigured || password === 'Demo123!' || password === 'demo123')) {
        const demoProf = DEMO_USERS[cleanEmail]
        const demoUser = { id: demoProf.id, email: demoProf.email }
        localStorage.setItem('lab_demo_auth', JSON.stringify(demoProf))
        setUser(demoUser)
        setProfile(demoProf)
        setIsDemoMode(true)
        setLoading(false)
        return { success: true, profile: demoProf }
      }

      // 2. Login menggunakan Supabase Auth
      if (!isSupabaseConfigured) {
        throw new Error('Supabase URL dan Anon Key belum dikonfigurasi di file .env. Anda dapat menggunakan akun demo untuk pengujian sementara.')
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (authErr) throw authErr

      const userSession = data.user
      setUser(userSession)

      // Ambil profile
      const prof = await fetchProfile(userSession.id)
      if (prof) {
        if (prof.status === 'nonaktif') {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          throw new Error('Akun Anda telah dinonaktifkan oleh Administrator.')
        }
        setProfile(prof)
        setLoading(false)
        return { success: true, profile: prof }
      }

      // Jika profile belum digenerate trigger, ambil dari metadata
      const fallbackProf = {
        id: userSession.id,
        nama: userSession.user_metadata?.nama || userSession.email?.split('@')[0],
        email: userSession.email,
        role: userSession.user_metadata?.role || 'staff',
        status: 'aktif',
      }
      setProfile(fallbackProf)
      setLoading(false)
      return { success: true, profile: fallbackProf }
    } catch (err) {
      console.error('Login gagal:', err)
      const msg = err.message || 'Email atau password salah.'
      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  // Fungsi Logout
  const logout = async () => {
    try {
      localStorage.removeItem('lab_demo_auth')
      setIsDemoMode(false)
      setUser(null)
      setProfile(null)
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    setError,
    login,
    logout,
    isDemoMode,
    isSupabaseConfigured,
    isAdmin: profile?.role === 'admin',
    isStaff: profile?.role === 'staff',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
