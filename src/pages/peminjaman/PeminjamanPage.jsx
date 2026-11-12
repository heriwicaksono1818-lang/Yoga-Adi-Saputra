import React, { useState, useEffect } from 'react'
import { peminjamanService } from '../../services/peminjamanService'
import { barangService } from '../../services/barangService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Package,
  Layers,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function PeminjamanPage({ isAdmin = false }) {
  const { user, isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [peminjaman, setPeminjaman] = useState([])
  const [barangList, setBarangList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  // State Form Modal Tambah Peminjaman
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nama_peminjam: '',
    barang_id: '',
    jumlah: 1,
    tanggal_peminjaman: new Date().toISOString().split('T')[0],
  })
  const [selectedBarang, setSelectedBarang] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [loanRes, itemRes] = await Promise.all([
      peminjamanService.getAll({ status: filterStatus }, isDemoMode),
      barangService.getAll({}, isDemoMode),
    ])

    if (loanRes.success) setPeminjaman(loanRes.data || [])
    if (itemRes.success) setBarangList(itemRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [filterStatus, isDemoMode])

  // Handle pilihan barang di form
  const handleBarangChange = (barangId) => {
    const item = barangList.find((b) => b.id === barangId)
    setSelectedBarang(item || null)
    setFormData((prev) => ({ ...prev, barang_id: barangId }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.nama_peminjam.trim()) {
      setFormError('Nama peminjam wajib diisi.')
      return
    }
    if (!formData.barang_id) {
      setFormError('Silakan pilih barang yang akan dipinjam.')
      return
    }
    const qty = parseInt(formData.jumlah, 10)
    if (isNaN(qty) || qty <= 0) {
      setFormError('Jumlah peminjaman harus lebih dari 0.')
      return
    }
    if (!selectedBarang || qty > selectedBarang.stok) {
      setFormError(`Jumlah diminta (${qty}) melebihi stok yang tersedia (${selectedBarang?.stok || 0}).`)
      return
    }
    if (!formData.tanggal_peminjaman) {
      setFormError('Tanggal peminjaman wajib diisi.')
      return
    }

    setSubmitting(true)
    const res = await peminjamanService.create(
      {
        nama_peminjam: formData.nama_peminjam,
        barang_id: formData.barang_id,
        jumlah: qty,
        tanggal_peminjaman: formData.tanggal_peminjaman,
        user_id: user?.id,
      },
      isDemoMode
    )
    setSubmitting(false)

    if (res.success) {
      showToast(`Peminjaman atas nama ${formData.nama_peminjam} berhasil dicatat. Stok barang telah berkurang.`, 'success')
      setIsModalOpen(false)
      setFormData({
        nama_peminjam: '',
        barang_id: '',
        jumlah: 1,
        tanggal_peminjaman: new Date().toISOString().split('T')[0],
      })
      setSelectedBarang(null)
      loadData()
    } else {
      setFormError(res.error || 'Gagal memproses peminjaman.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaksi Peminjaman Alat</h1>
          <p className="text-sm text-slate-500 mt-1">
            Catat peminjaman barang laboratorium untuk praktikum, riset, atau kegiatan dosen/mahasiswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-sky-200"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Transaksi:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Semua Status</option>
            <option value="dipinjam">Sedang Dipinjam</option>
            <option value="selesai">Selesai Dikembalikan</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">Total: {peminjaman.length} transaksi</span>
      </div>

      {/* Tabel Riwayat Peminjaman */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-6">Nama Peminjam</th>
                <th className="py-3 px-6">Barang</th>
                <th className="py-3 px-6">Jumlah</th>
                <th className="py-3 px-6">Tanggal Pinjam</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Memuat data peminjaman...
                  </td>
                </tr>
              ) : peminjaman.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada catatan peminjaman.
                  </td>
                </tr>
              ) : (
                peminjaman.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{item.nama_peminjam}</td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-slate-800">{item.barang?.nama_barang || 'Barang'}</div>
                      <div className="font-mono text-[11px] text-sky-600">{item.barang?.kode_barang}</div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{item.jumlah} unit</td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">{item.tanggal_peminjaman}</td>
                    <td className="py-3.5 px-6">
                      {item.status === 'dipinjam' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Dipinjam</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      {item.profile?.nama || 'Petugas'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Peminjaman */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-up">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Form Catat Peminjaman Barang</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan nama peminjam dan jumlah yang diminta sesuai stok lab
              </p>

              {formError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Peminjam / Penanggung Jawab <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rian Anggara (210401020 / Dosen / Lab TI)"
                    value={formData.nama_peminjam}
                    onChange={(e) => setFormData({ ...formData, nama_peminjam: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Pilih Barang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.barang_id}
                    onChange={(e) => handleBarangChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  >
                    <option value="">-- Pilih Barang Laboratorium --</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.stok <= 0}>
                        {b.kode_barang} - {b.nama_barang} (Tersedia: {b.stok} unit)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBarang && (
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Stok Lab Saat Ini:</span>
                      <strong className="text-sky-800 ml-1 font-bold">{selectedBarang.stok} unit</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Kategori:</span>
                      <span className="ml-1 font-medium text-slate-700">{selectedBarang.kategori}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Jumlah Dipinjam <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedBarang?.stok || 1}
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Tanggal Pinjam <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_peminjaman}
                      onChange={(e) => setFormData({ ...formData, tanggal_peminjaman: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-sky-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Proses Peminjaman</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
