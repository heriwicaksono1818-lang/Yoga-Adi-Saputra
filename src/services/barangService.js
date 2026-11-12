import { supabase } from '../lib/supabase'

export const barangService = {
  // Ambil semua barang langsung dari Supabase
  getAll: async ({ search = '', kategori = '' } = {}) => {
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
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Supabase getAll barang error:', err.message)
      return { success: false, error: err.message, data: [] }
    }
  },

  // Ambil detail barang berdasarkan ID langsung dari Supabase
  getById: async (id) => {
    try {
      const { data, error } = await supabase.from('barang').select('*').eq('id', id).single()
      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Supabase getById barang error:', err.message)
      return { success: false, error: err.message }
    }
  },

  // Tambah barang baru langsung ke database Supabase
  create: async ({ kode_barang, nama_barang, kategori, stok }) => {
    const cleanKode = kode_barang.trim().toUpperCase()
    const numStok = parseInt(stok, 10)

    if (isNaN(numStok) || numStok < 0) {
      return { success: false, error: 'Stok tidak boleh bernilai negatif.' }
    }

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
  },

  // Edit barang langsung di database Supabase
  update: async (id, { kode_barang, nama_barang, kategori, stok }) => {
    const cleanKode = kode_barang.trim().toUpperCase()
    const numStok = parseInt(stok, 10)

    if (isNaN(numStok) || numStok < 0) {
      return { success: false, error: 'Stok tidak boleh bernilai negatif.' }
    }

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
  },

  // Hapus barang langsung dari database Supabase
  delete: async (id) => {
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
  },
}
