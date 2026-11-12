import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getLocalStore, saveLocalStore } from './dataStore'

export const peminjamanService = {
  // Ambil daftar peminjaman dengan relasi barang dan profile pembuat
  getAll: async ({ status = '', userId = '' } = {}, isDemo = false) => {
    if (isSupabaseConfigured && !isDemo) {
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
        return { success: true, data }
      } catch (err) {
        console.warn('Supabase getAll peminjaman error, fallback:', err.message)
      }
    }

    // Local / Demo Store
    const { peminjaman } = getLocalStore()
    let filtered = [...peminjaman]

    if (status) filtered = filtered.filter((p) => p.status === status)
    if (userId) filtered = filtered.filter((p) => p.created_by === userId)

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { success: true, data: filtered }
  },

  // Buat transaksi peminjaman baru
  create: async ({ nama_peminjam, barang_id, jumlah, tanggal_peminjaman, user_id }, isDemo = false) => {
    const qty = parseInt(jumlah, 10)
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Jumlah peminjaman harus lebih besar dari 0.' }
    }

    if (isSupabaseConfigured && !isDemo) {
      try {
        // Coba panggil RPC atomik terlebih dahulu
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

        // Fallback jika fungsi RPC belum di-execute di Supabase SQL Editor:
        // Cek stok barang
        const { data: item, error: itemErr } = await supabase
          .from('barang')
          .select('*')
          .eq('id', barang_id)
          .single()

        if (itemErr || !item) throw new Error('Barang tidak ditemukan.')
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
    }

    // Local Store Transaction
    const { barang, peminjaman, staff } = getLocalStore()
    const targetBarangIndex = barang.findIndex((b) => b.id === barang_id)
    if (targetBarangIndex === -1) {
      return { success: false, error: 'Barang tidak ditemukan.' }
    }

    const currentBarang = barang[targetBarangIndex]
    if (currentBarang.stok < qty) {
      return { success: false, error: `Stok tidak mencukupi. Stok saat ini: ${currentBarang.stok}` }
    }

    // Kurangi stok
    currentBarang.stok -= qty
    barang[targetBarangIndex] = currentBarang
    saveLocalStore('barang', barang)

    // Cari profile creator
    const creator = staff.find((s) => s.id === user_id) || { nama: 'Staf Lab' }

    const newLoan = {
      id: `pem-local-${Date.now()}`,
      nama_peminjam,
      barang_id,
      jumlah: qty,
      tanggal_peminjaman,
      status: 'dipinjam',
      created_by: user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      barang: currentBarang,
      profile: creator,
    }

    peminjaman.unshift(newLoan)
    saveLocalStore('peminjaman', peminjaman)

    return { success: true, data: newLoan }
  },
}
