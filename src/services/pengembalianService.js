import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getLocalStore, saveLocalStore } from './dataStore'

export const pengembalianService = {
  // Ambil riwayat pengembalian
  getAll: async (isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
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
        return { success: true, data }
      } catch (err) {
        console.warn('Supabase getAll pengembalian error, fallback:', err.message)
      }
    }

    // Local / Demo Store
    const { pengembalian } = getLocalStore()
    return { success: true, data: pengembalian }
  },

  // Proses pengembalian barang
  proses: async ({ peminjaman_id, jumlah_dikembalikan, tanggal_pengembalian, user_id }, isDemo = false) => {
    const qty = parseInt(jumlah_dikembalikan, 10)
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Jumlah pengembalian harus lebih besar dari 0.' }
    }

    if (isSupabaseConfigured && !isDemo) {
      try {
        // Coba panggil RPC atomik terlebih dahulu
        const { data: rpcData, error: rpcError } = await supabase.rpc('proses_pengembalian', {
          p_peminjaman_id: peminjaman_id,
          p_jumlah_dikembalikan: qty,
          p_tanggal_pengembalian: tanggal_pengembalian,
          p_created_by: user_id,
        })

        if (!rpcError && rpcData?.success) {
          return { success: true, data: rpcData }
        }

        // Fallback jika RPC belum ter-apply di Supabase:
        // 1. Ambil data peminjaman
        const { data: loan, error: loanErr } = await supabase
          .from('peminjaman')
          .select('*, barang:barang_id (*)')
          .eq('id', peminjaman_id)
          .single()

        if (loanErr || !loan) throw new Error('Data peminjaman tidak ditemukan.')
        if (loan.status === 'selesai') throw new Error('Peminjaman ini sudah berstatus selesai.')
        if (qty > loan.jumlah) {
          throw new Error(`Jumlah yang dikembalikan (${qty}) melebihi jumlah pinjaman (${loan.jumlah}).`)
        }

        // 2. Tambah stok barang kembali
        const { error: stockErr } = await supabase
          .from('barang')
          .update({ stok: loan.barang.stok + qty })
          .eq('id', loan.barang_id)

        if (stockErr) throw stockErr

        // 3. Update status peminjaman jadi selesai
        const { error: loanUpdateErr } = await supabase
          .from('peminjaman')
          .update({ status: 'selesai' })
          .eq('id', peminjaman_id)

        if (loanUpdateErr) throw loanUpdateErr

        // 4. Catat record pengembalian
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
    }

    // Local Store Transaction
    const { barang, peminjaman, pengembalian, staff } = getLocalStore()
    const targetLoanIndex = peminjaman.findIndex((p) => p.id === peminjaman_id)
    if (targetLoanIndex === -1) {
      return { success: false, error: 'Transaksi peminjaman tidak ditemukan.' }
    }

    const loan = peminjaman[targetLoanIndex]
    if (loan.status === 'selesai') {
      return { success: false, error: 'Peminjaman ini sudah selesai.' }
    }

    if (qty > loan.jumlah) {
      return { success: false, error: `Jumlah dikembalikan (${qty}) melebihi jumlah dipinjam (${loan.jumlah}).` }
    }

    // Tambah stok barang
    const targetBarangIndex = barang.findIndex((b) => b.id === loan.barang_id)
    if (targetBarangIndex !== -1) {
      barang[targetBarangIndex].stok += qty
      saveLocalStore('barang', barang)
    }

    // Update status peminjaman
    loan.status = 'selesai'
    peminjaman[targetLoanIndex] = loan
    saveLocalStore('peminjaman', peminjaman)

    // Simpan pengembalian
    const creator = staff.find((s) => s.id === user_id) || { nama: 'Staf Lab' }
    const newReturn = {
      id: `peng-local-${Date.now()}`,
      peminjaman_id,
      jumlah_dikembalikan: qty,
      tanggal_pengembalian,
      created_by: user_id,
      created_at: new Date().toISOString(),
      peminjaman: loan,
      profile: creator,
    }

    pengembalian.unshift(newReturn)
    saveLocalStore('pengembalian', pengembalian)

    return { success: true, data: newReturn }
  },
}

