import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { barangService } from '../../../services/barangService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function BarangEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori: 'Laptop',
    stok: 0,
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Laptop', 'Aksesoris', 'Multimedia', 'Periferal', 'Jaringan', 'Lainnya']

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      const res = await barangService.getById(id, isDemoMode)
      if (res.success && res.data) {
        setFormData({
          kode_barang: res.data.kode_barang || '',
          nama_barang: res.data.nama_barang || '',
          kategori: res.data.kategori || 'Laptop',
          stok: res.data.stok ?? 0,
        })
      } else {
        setError(res.error || 'Barang tidak ditemukan.')
      }
      setLoading(false)
    }

    fetchItem()
  }, [id, isDemoMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.kode_barang.trim()) {
      setError('Kode barang wajib diisi.')
      return
    }
    if (!formData.nama_barang.trim()) {
      setError('Nama barang wajib diisi.')
      return
    }
    const numStok = parseInt(formData.stok, 10)
    if (isNaN(numStok) || numStok < 0) {
      setError('Stok harus berupa angka dan tidak boleh bernilai negatif.')
      return
    }

    setSubmitting(true)
    const res = await barangService.update(id, formData, isDemoMode)
    setSubmitting(false)

    if (res.success) {
      showToast(`Data barang "${formData.nama_barang}" berhasil diperbarui.`, 'success')
      navigate('/admin/barang')
    } else {
      setError(res.error || 'Gagal memperbarui barang.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <p className="text-sm text-slate-500">Memuat data barang...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/barang"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ubah Data Barang</h1>
          <p className="text-xs text-slate-500">Edit informasi identifikasi atau sesuaikan jumlah stok</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kode_barang}
                onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jumlah Stok Fisik <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.stok}
              onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
              className="w-full sm:w-48 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Stok tidak boleh bernilai negatif.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/admin/barang"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-sky-200 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Perbarui Barang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

