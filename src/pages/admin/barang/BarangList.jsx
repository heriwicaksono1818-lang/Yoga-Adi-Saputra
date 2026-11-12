import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { barangService } from '../../../services/barangService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import ConfirmModal from '../../../components/ConfirmModal'
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

export default function BarangList() {
  const { isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [barang, setBarang] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')

  // State untuk Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await barangService.getAll({ search, kategori }, isDemoMode)
    if (res.success) {
      setBarang(res.data || [])
    } else {
      showToast(res.error || 'Gagal memuat inventaris barang', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [search, kategori, isDemoMode])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const res = await barangService.delete(deleteTarget.id, isDemoMode)
    setDeleteLoading(false)

    if (res.success) {
      showToast(`Barang "${deleteTarget.nama_barang}" berhasil dihapus.`, 'success')
      setDeleteTarget(null)
      loadData()
    } else {
      showToast(res.error || 'Gagal menghapus barang.', 'error')
    }
  }

  const categories = ['Semua Kategori', 'Laptop', 'Aksesoris', 'Multimedia', 'Periferal', 'Jaringan']

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Barang Laboratorium</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data inventaris, perbarui stok fisik, dan daftarkan peralatan baru
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

          <Link
            to="/admin/barang/tambah"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-sky-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </Link>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value === 'Semua Kategori' ? '' : e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Data Barang */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-6">Kode Barang</th>
                <th className="py-3 px-6">Nama Barang</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6">Stok Tersedia</th>
                <th className="py-3 px-6">Status Stok</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Memuat katalog inventaris...
                  </td>
                </tr>
              ) : barang.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada barang yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                barang.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-semibold text-sky-700 text-xs">
                      {item.kode_barang}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">{item.nama_barang}</td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{item.stok} unit</td>
                    <td className="py-3.5 px-6">
                      {item.stok > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Habis
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/barang/edit/${item.id}`}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                          title="Edit Barang"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Hapus Barang Inventaris"
        message={`Apakah Anda yakin ingin menghapus barang "${deleteTarget?.nama_barang}" (${deleteTarget?.kode_barang})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        type="danger"
      />
    </div>
  )
}

