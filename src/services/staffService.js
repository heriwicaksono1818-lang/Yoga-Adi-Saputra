import { supabase } from '../lib/supabase'

export const staffService = {
  // Ambil semua akun staff dari Supabase
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('nama', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Supabase getAll staff error:', err.message)
      return { success: false, error: err.message, data: [] }
    }
  },

  // Tambah akun staff baru ke Supabase Auth & Profiles
  create: async ({ nama, email, password, status = 'aktif' }) => {
    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Daftarkan ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password || 'StaffLab123!',
        options: {
          data: {
            nama,
            role: 'staff',
          },
        },
      })

      if (authError) throw authError

      const newId = authData.user?.id
      if (!newId) throw new Error('Gagal membuat user auth di Supabase.')

      // 2. Pastikan terdaftar di tabel profiles
      const { data: profileData, error: profError } = await supabase
        .from('profiles')
        .upsert({
          id: newId,
          nama,
          email: cleanEmail,
          role: 'staff',
          status,
        })
        .select()
        .single()

      if (profError) throw profError
      return { success: true, data: profileData }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // Edit profil staff (nama dan status) di database Supabase
  update: async (id, { nama, status }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nama,
          status,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // Toggle status aktif/nonaktif akun staff
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif'
    return staffService.update(id, { status: nextStatus })
  },
}
