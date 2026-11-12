import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isDemoMode = false // Mode demo dinonaktifkan sepenuhnya, wajib menggunakan Supabase

  // Ambil profil langsung dari tabel profiles di Supabase
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

  // Inisialisasi Auth State dari Supabase
  useEffect(() => {
    let mounted = true

    // Hapus sisa-sisa local demo auth dari session terdahulu
    try {
      localStorage.removeItem('lab_demo_auth')
      localStorage.removeItem('lab_barang')
      localStorage.removeItem('lab_peminjaman')
      localStorage.removeItem('lab_pengembalian')
      localStorage.removeItem('lab_staff')
    } catch (e) {
      // ignore
    }

    const initAuth = async () => {
      try {
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

    // Listener perubahan status login Supabase
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
          } else {
            setProfile({
              id: session.user.id,
              nama: session.user.user_metadata?.nama || session.user.email?.split('@')[0],
              email: session.user.email,
              role: session.user.user_metadata?.role || 'staff',
              status: 'aktif',
            })
          }
        } else {
          setUser(null)
          setProfile(null)
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

  // Fungsi Login Langsung ke Supabase Auth
  const login = async (email, password) => {
    setError(null)
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase URL atau Key belum terdeteksi. Pastikan konfigurasi environment variable di Vercel sudah benar.')
      }

      const cleanEmail = email.trim().toLowerCase()

      let { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      // Jika akun demo belum pernah terdaftar di auth.users Supabase, daftarkan otomatis secara langsung
      if (authErr && (
        authErr.message.toLowerCase().includes('invalid login credentials') ||
        authErr.message.toLowerCase().includes('user not found')
      )) {
        if (cleanEmail === 'admin.demo@example.com' || cleanEmail === 'staff.demo@example.com') {
          const role = cleanEmail.includes('admin') ? 'admin' : 'staff'
          const nama = role === 'admin' ? 'Administrator Laboratorium' : 'Staff Asisten Lab'
          const { data: signData, error: signErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                nama,
                role,
              },
            },
          })

          if (!signErr && signData?.user) {
            const retry = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            })
            if (!retry.error) {
              data = retry.data
              authErr = null
            }
          }
        }
      }

      if (authErr) throw authErr

      const userSession = data.user
      setUser(userSession)

      // Ambil profile dari tabel profiles Supabase
      let prof = await fetchProfile(userSession.id)
      if (!prof) {
        // Jika profile belum terbentuk dari trigger, buatkan di profiles
        const defaultRole = cleanEmail.includes('admin') ? 'admin' : 'staff'
        const defaultNama = defaultRole === 'admin' ? 'Administrator Laboratorium' : 'Staff Asisten Lab'
        const { data: insertedProf } = await supabase
          .from('profiles')
          .upsert({
            id: userSession.id,
            nama: userSession.user_metadata?.nama || defaultNama,
            email: cleanEmail,
            role: userSession.user_metadata?.role || defaultRole,
            status: 'aktif',
          })
          .select()
          .single()

        prof = insertedProf || {
          id: userSession.id,
          nama: userSession.user_metadata?.nama || defaultNama,
          email: userSession.email,
          role: userSession.user_metadata?.role || defaultRole,
          status: 'aktif',
        }
      }

      if (prof.status === 'nonaktif') {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        throw new Error('Akun Anda telah dinonaktifkan oleh Administrator.')
      }

      setProfile(prof)
      setLoading(false)
      return { success: true, profile: prof }
    } catch (err) {
      console.error('Login gagal:', err)
      const msg = err.message || 'Email atau password salah.'
      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  // Fungsi Logout Supabase
  const logout = async () => {
    try {
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
