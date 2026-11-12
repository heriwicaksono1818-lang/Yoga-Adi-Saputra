import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getLocalStore, saveLocalStore } from './dataStore'

export const staffService = {
  // Ambil semua akun staff
  getAll: async (isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'staff')
          .order('nama', { ascending: true })

        if (error) throw error
        return { success: true, data }
      } catch (err) {
        console.warn('Supabase getAll staff error, fallback:', err.message)
      }
    }

    // Local / Demo Store
    const { staff } = getLocalStore()
    const staffOnly = staff.filter((s) => s.role === 'staff')
    return { success: true, data: staffOnly }
  },

  // Tambah akun staff baru
  create: async ({ nama, email, password, status = 'aktif' }, isDemo = false) => {
    const cleanEmail = email.trim().toLowerCase()

    if (isSupabaseConfigured && !isDemo) {
      try {
        // Daftarkan ke Supabase Auth
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
        if (!newId) throw new Error('Gagal membuat user auth.')

        // Pastikan terdaftar di tabel profiles
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
    }

    // Local Store
    const { staff } = getLocalStore()
    if (staff.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email ${cleanEmail} sudah terdaftar.` }
    }

    const newStaff = {
      id: `staff-local-${Date.now()}`,
      nama,
      email: cleanEmail,
      role: 'staff', // Wajib terkunci sebagai staff
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    staff.push(newStaff)
    saveLocalStore('staff', staff)
    return { success: true, data: newStaff }
  },

  // Edit profil staff (nama dan status)
  update: async (id, { nama, status }, isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            nama,
            status,
            // role tidak diubah, tetap staff
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return { success: true, data }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }

    // Local Store
    const { staff } = getLocalStore()
    const index = staff.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, error: 'Staff tidak ditemukan.' }

    staff[index] = {
      ...staff[index],
      nama,
      status,
      updated_at: new Date().toISOString(),
    }

    saveLocalStore('staff', staff)
    return { success: true, data: staff[index] }
  },

  // Toggle status aktif/nonaktif
  toggleStatus: async (id, currentStatus, isDemo = false) => {
    const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif'
    return staffService.update(id, { status: nextStatus }, isDemo)
  },
}
