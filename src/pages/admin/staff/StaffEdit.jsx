import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { staffService } from '../../../services/staffService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { ArrowLeft, Save, Loader2, ShieldCheck } from 'lucide-react'

export default function StaffEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'staff',
    status: 'aktif',
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true)
      const res = await staffService.getAll(isDemoMode)
      if (res.success && res.data) {
        const found = res.data.find((s) => s.id === id)
        if (found) {
          setFormData({
            nama: found.nama || '',
            email: found.email || '',
            role: 'staff',
            status: found.status || 'aktif',
          })
        } else {
          setError('Data staf tidak ditemukan.')
        }
      } else {
        setError('Gagal memuat informasi staf.')
      }
      setLoading(false)
    }

    fetchStaff()
  }, [id, isDemoMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nama.trim()) {
      setError('Nama staf wajib diisi.')
      return
    }

    setSubmitting(true)
    const res = await staffService.update(
      id,
      {
        nama: formData.nama,
        status: formData.status,
      },
      isDemoMode
    )
    setSubmitting(false)

    if (res.success) {
      showToast(`Data staf "${formData.nama}" berhasil diperbarui.`, 'success')
      navigate('/admin/staff')
    } else {
      setError(res.error || 'Gagal memperbarui staf.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <p className="text-sm text-slate-500">Memuat data staf...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/staff"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ubah Data Staff</h1>
          <p className="text-xs text-slate-500">Perbarui nama atau ubah status keaktifan akun</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Staff <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email (Identitas Akun)
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Email terikat dengan kredensial Supabase Auth.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Pengguna (Terkunci)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>staff (Permanen)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Keaktifan Akun <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                <option value="aktif">Aktif (Dapat Login &amp; Bertugas)</option>
                <option value="nonaktif">Nonaktif (Akses Dibekukan)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/admin/staff"
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
              <span>{submitting ? 'Menyimpan...' : 'Perbarui Staff'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
