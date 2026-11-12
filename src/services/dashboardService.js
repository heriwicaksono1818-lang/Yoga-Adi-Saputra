import { barangService } from './barangService'
import { peminjamanService } from './peminjamanService'
import { pengembalianService } from './pengembalianService'

export const dashboardService = {
  // Ambil metrik ringkasan untuk Admin Dashboard
  getAdminStats: async (isDemo = false) => {
    const [barangRes, pinjamRes, kembaliRes] = await Promise.all([
      barangService.getAll({}, isDemo),
      peminjamanService.getAll({}, isDemo),
      pengembalianService.getAll(isDemo),
    ])

    const barangList = barangRes.data || []
    const pinjamList = pinjamRes.data || []
    const kembaliList = kembaliRes.data || []

    const totalBarang = barangList.length
    const totalStok = barangList.reduce((acc, curr) => acc + (curr.stok || 0), 0)
    const barangTersedia = barangList.filter((b) => (b.stok || 0) > 0).length

    // Jumlah unit barang yang saat ini sedang dipinjam
    const transaksiAktifList = pinjamList.filter((p) => p.status === 'dipinjam')
    const barangSedangDipinjam = transaksiAktifList.reduce((acc, curr) => acc + (curr.jumlah || 0), 0)

    const totalTransaksi = pinjamList.length
    const transaksiAktif = transaksiAktifList.length
    const transaksiSelesai = pinjamList.filter((p) => p.status === 'selesai').length

    // Aktivitas terbaru: 5 transaksi peminjaman/pengembalian terakhir
    const aktivitasTerbaru = [...pinjamList]
      .slice(0, 7)
      .map((item) => ({
        id: item.id,
        tipe: item.status === 'dipinjam' ? 'peminjaman' : 'pengembalian',
        deskripsi: `${item.nama_peminjam} meminjam ${item.jumlah} unit ${item.barang?.nama_barang || 'Barang'}`,
        status: item.status,
        tanggal: item.tanggal_peminjaman || item.created_at,
        petugas: item.profile?.nama || 'Petugas Lab',
      }))

    return {
      totalBarang,
      totalStok,
      barangTersedia,
      barangSedangDipinjam,
      totalTransaksi,
      transaksiAktif,
      transaksiSelesai,
      aktivitasTerbaru,
    }
  },

  // Ambil metrik ringkasan untuk Staff Dashboard
  getStaffStats: async (userId, isDemo = false) => {
    const [barangRes, pinjamRes] = await Promise.all([
      barangService.getAll({}, isDemo),
      peminjamanService.getAll({}, isDemo),
    ])

    const barangList = barangRes.data || []
    const allPinjam = pinjamRes.data || []

    const totalBarang = barangList.length
    const barangTersedia = barangList.filter((b) => (b.stok || 0) > 0).length

    const transaksiAktifList = allPinjam.filter((p) => p.status === 'dipinjam')
    const barangDipinjam = transaksiAktifList.reduce((acc, curr) => acc + (curr.jumlah || 0), 0)

    // Transaksi yang dicatat oleh staf ini
    const transaksiSaya = allPinjam.filter((p) => p.created_by === userId)
    const transaksiAktifSaya = transaksiSaya.filter((p) => p.status === 'dipinjam').length

    // Aktivitas relevan untuk staf ini
    const aktivitasSaya = transaksiSaya.slice(0, 5).map((item) => ({
      id: item.id,
      nama_peminjam: item.nama_peminjam,
      nama_barang: item.barang?.nama_barang || 'Barang',
      jumlah: item.jumlah,
      tanggal: item.tanggal_peminjaman,
      status: item.status,
    }))

    return {
      totalBarang,
      barangTersedia,
      barangDipinjam,
      totalTransaksiSaya: transaksiSaya.length,
      transaksiAktifSaya,
      aktivitasSaya,
    }
  },
}

