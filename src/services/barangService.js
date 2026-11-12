import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getLocalStore, saveLocalStore } from './dataStore'

export const barangService = {
  // Ambil semua barang
  getAll: async ({ search = '', kategori = '' } = {}, isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
      try {
        let query = supabase.from('barang').select('*').order('kode_barang', { ascending: true })
        if (search) {
          query = query.or(`nama_barang.ilike.%${search}%,kode_barang.ilike.%${search}%`)
        }
        if (kategori) {
          query = query.eq('kategori', kategori)
        }
        const { data, error } = await query
        if (error) throw error
        return { success: true, data }
      } catch (err) {
        console.warn('Supabase getAll barang error, fallback to local:', err.message)
      }
    }

    // Local / Demo Store Fallback
    const { barang } = getLocalStore()
    let filtered = [...barang]

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (b) => b.nama_barang.toLowerCase().includes(q) || b.kode_barang.toLowerCase().includes(q)
      )
    }
    if (kategori) {
      filtered = filtered.filter((b) => b.kategori === kategori)
    }

    filtered.sort((a, b) => a.kode_barang.localeCompare(b.kode_barang))
    return { success: true, data: filtered }
  },

  // Ambil detail barang berdasarkan ID
  getById: async (id, isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
      try {
        const { data, error } = await supabase.from('barang').select('*').eq('id', id).single()
        if (error) throw error
        return { success: true, data }
      } catch (err) {
        console.warn('Supabase getById barang error, fallback:', err.message)
      }
    }

    const { barang } = getLocalStore()
    const item = barang.find((b) => b.id === id)
    if (!item) return { success: false, error: 'Barang tidak ditemukan' }
    return { success: true, data: item }
  },

  // Tambah barang baru
  create: async ({ kode_barang, nama_barang, kategori, stok }, isDemo = false) => {
    const cleanKode = kode_barang.trim().toUpperCase()
    const numStok = parseInt(stok, 10)

    if (isNaN(numStok) || numStok < 0) {
      return { success: false, error: 'Stok tidak boleh bernilai negatif.' }
    }

    if (isSupabaseConfigured && !isDemo) {
      try {
        const { data, error } = await supabase
          .from('barang')
          .insert([{ kode_barang: cleanKode, nama_barang, kategori, stok: numStok }])
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new Error(`Kode barang "${cleanKode}" sudah digunakan. Gunakan kode lain.`)
          }
          throw error
        }
        return { success: true, data }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }

    // Local Store validation
    const { barang } = getLocalStore()
    if (barang.some((b) => b.kode_barang.toUpperCase() === cleanKode)) {
      return { success: false, error: `Kode barang "${cleanKode}" sudah digunakan.` }
    }

    const newItem = {
      id: `b-local-${Date.now()}`,
      kode_barang: cleanKode,
      nama_barang,
      kategori,
      stok: numStok,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = [...barang, newItem]
    saveLocalStore('barang', updated)
    return { success: true, data: newItem }
  },

  // Edit barang
  update: async (id, { kode_barang, nama_barang, kategori, stok }, isDemo = false) => {
    const cleanKode = kode_barang.trim().toUpperCase()
    const numStok = parseInt(stok, 10)

    if (isNaN(numStok) || numStok < 0) {
      return { success: false, error: 'Stok tidak boleh bernilai negatif.' }
    }

    if (isSupabaseConfigured && !isDemo) {
      try {
        const { data, error } = await supabase
          .from('barang')
          .update({ kode_barang: cleanKode, nama_barang, kategori, stok: numStok })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new Error(`Kode barang "${cleanKode}" sudah digunakan oleh barang lain.`)
          }
          throw error
        }
        return { success: true, data }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }

    // Local Store
    const { barang } = getLocalStore()
    const existingIndex = barang.findIndex((b) => b.id === id)
    if (existingIndex === -1) return { success: false, error: 'Barang tidak ditemukan' }

    // Validasi duplikat kode
    if (barang.some((b) => b.id !== id && b.kode_barang.toUpperCase() === cleanKode)) {
      return { success: false, error: `Kode barang "${cleanKode}" sudah digunakan oleh barang lain.` }
    }

    const updatedItem = {
      ...barang[existingIndex],
      kode_barang: cleanKode,
      nama_barang,
      kategori,
      stok: numStok,
      updated_at: new Date().toISOString(),
    }

    barang[existingIndex] = updatedItem
    saveLocalStore('barang', barang)
    return { success: true, data: updatedItem }
  },

  // Hapus barang
  delete: async (id, isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
      try {
        const { error } = await supabase.from('barang').delete().eq('id', id)
        if (error) {
          if (error.code === '23503') {
            throw new Error('Barang tidak dapat dihapus karena memiliki riwayat peminjaman.')
          }
          throw error
        }
        return { success: true }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }

    // Local Store
    const { barang, peminjaman } = getLocalStore()
    // Cek apakah sedang ada peminjaman aktif
    const hasActiveLoan = peminjaman.some((p) => p.barang_id === id && p.status === 'dipinjam')
    if (hasActiveLoan) {
      return { success: false, error: 'Barang tidak dapat dihapus karena sedang dalam status dipinjam.' }
    }

    const filtered = barang.filter((b) => b.id !== id)
    saveLocalStore('barang', filtered)
    return { success: true }
  },
}
