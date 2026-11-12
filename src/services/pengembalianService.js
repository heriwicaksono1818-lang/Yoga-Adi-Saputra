import { supabase } from '../lib/supabase'

export const pengembalianService = {
  // Ambil riwayat pengembalian langsung dari Supabase
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('pengembalian')
        .select(`
          *,
          profile:created_by (*),
          peminjaman:peminjaman_id (
            *,
            barang:barang_id (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Supabase getAll pengembalian error:', err.message)
      return { success: false, error: err.message, data: [] }
    }
  },

  // Proses pengembalian barang langsung ke database Supabase
  proses: async ({ peminjaman_id, jumlah_dikembalikan, tanggal_pengembalian, user_id }) => {
    const qty = parseInt(jumlah_dikembalikan, 10)
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Jumlah pengembalian harus lebih besar dari 0.' }
    }

    try {
      // 1. Coba panggil RPC atomik terlebih dahulu
      const { data: rpcData, error: rpcError } = await supabase.rpc('proses_pengembalian', {
        p_peminjaman_id: peminjaman_id,
        p_jumlah_dikembalikan: qty,
        p_tanggal_pengembalian: tanggal_pengembalian,
        p_created_by: user_id,
      })

      if (!rpcError && rpcData?.success) {
        return { success: true, data: rpcData }
      }

      // 2. Direct query fallback jika RPC belum dibuat di Supabase
      const { data: loan, error: loanErr } = await supabase
        .from('peminjaman')
        .select('*, barang:barang_id (*)')
        .eq('id', peminjaman_id)
        .single()

      if (loanErr || !loan) throw new Error('Data transaksi peminjaman tidak ditemukan.')
      if (loan.status === 'selesai') throw new Error('Peminjaman ini sudah berstatus selesai.')
      if (qty > loan.jumlah) {
        throw new Error(`Jumlah yang dikembalikan (${qty}) melebihi jumlah pinjaman (${loan.jumlah}).`)
      }

      // Kembalikan stok barang
      const { error: stockErr } = await supabase
        .from('barang')
        .update({ stok: loan.barang.stok + qty })
        .eq('id', loan.barang_id)

      if (stockErr) throw stockErr

      // Update status peminjaman menjadi selesai
      const { error: loanUpdateErr } = await supabase
        .from('peminjaman')
        .update({ status: 'selesai' })
        .eq('id', peminjaman_id)

      if (loanUpdateErr) throw loanUpdateErr

      // Catat transaksi pengembalian
      const { data: returnData, error: returnErr } = await supabase
        .from('pengembalian')
        .insert([
          {
            peminjaman_id,
            jumlah_dikembalikan: qty,
            tanggal_pengembalian,
            created_by: user_id,
          },
        ])
        .select(`*, peminjaman:peminjaman_id (*), profile:created_by (*)`)
        .single()

      if (returnErr) throw returnErr
      return { success: true, data: returnData }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
}
