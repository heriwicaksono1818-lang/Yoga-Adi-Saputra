import { supabase } from '../lib/supabase'

export const peminjamanService = {
  // Ambil daftar peminjaman dengan relasi barang dan profile langsung dari Supabase
  getAll: async ({ status = '', userId = '' } = {}) => {
    try {
      let query = supabase
        .from('peminjaman')
        .select(`
          *,
          barang:barang_id (*),
          profile:created_by (*)
        `)
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (userId) query = query.eq('created_by', userId)

      const { data, error } = await query
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Supabase getAll peminjaman error:', err.message)
      return { success: false, error: err.message, data: [] }
    }
  },

  // Buat transaksi peminjaman baru langsung ke database Supabase
  create: async ({ nama_peminjam, barang_id, jumlah, tanggal_peminjaman, user_id }) => {
    const qty = parseInt(jumlah, 10)
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Jumlah peminjaman harus lebih besar dari 0.' }
    }

    try {
      // 1. Coba panggil RPC atomik terlebih dahulu
      const { data: rpcData, error: rpcError } = await supabase.rpc('proses_peminjaman', {
        p_nama_peminjam: nama_peminjam,
        p_barang_id: barang_id,
        p_jumlah: qty,
        p_tanggal_peminjaman: tanggal_peminjaman,
        p_created_by: user_id,
      })

      if (!rpcError && rpcData?.success) {
        return { success: true, data: rpcData }
      }

      // 2. Direct query fallback jika stored procedure belum dibuat di database
      const { data: item, error: itemErr } = await supabase
        .from('barang')
        .select('*')
        .eq('id', barang_id)
        .single()

      if (itemErr || !item) throw new Error('Barang tidak ditemukan di database Supabase.')
      if (item.stok < qty) {
        throw new Error(`Stok tidak mencukupi. Stok tersedia saat ini: ${item.stok}`)
      }

      // Kurangi stok barang
      const { error: updateErr } = await supabase
        .from('barang')
        .update({ stok: item.stok - qty })
        .eq('id', barang_id)

      if (updateErr) throw updateErr

      // Simpan transaksi peminjaman
      const { data: newLoan, error: insertErr } = await supabase
        .from('peminjaman')
        .insert([
          {
            nama_peminjam,
            barang_id,
            jumlah: qty,
            tanggal_peminjaman,
            status: 'dipinjam',
            created_by: user_id,
          },
        ])
        .select(`*, barang:barang_id (*), profile:created_by (*)`)
        .single()

      if (insertErr) throw insertErr
      return { success: true, data: newLoan }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
}
