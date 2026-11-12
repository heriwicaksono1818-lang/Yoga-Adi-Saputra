import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { staffService } from '../../../services/staffService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react'

export default function StaffTambah() {
  const navigate = useNavigate()
  const { isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    status: 'aktif',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nama.trim()) {
      setError('Nama staf wajib diisi.')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Alamat email tidak valid.')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password akun minimal 6 karakter.')
      return
    }

    setLoading(true)
    const res = await staffService.create(formData, isDemoMode)
    setLoading(false)

    if (res.success) {
      showToast(`Akun staff untuk "${formData.nama}" berhasil dibuat.`, 'success')
      navigate('/admin/staff')
    } else {
      setError(res.error || 'Gagal menambahkan akun staff.')
    }
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
          <h1 className="text-xl font-bold text-slate-900">Tambah Akun Staff Baru</h1>
          <p className="text-xs text-slate-500">Daftarkan asisten atau petugas baru ke sistem laboratorium</p>
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
              placeholder="Contoh: Budi Santoso, S.Kom"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email Resmi <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Contoh: budi.lab@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Email akan digunakan untuk autentikasi login.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Akun <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter (Contoh: StaffLab123!)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Pengguna (Terkunci)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>staff (Otomatis)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Role staff terkunci demi kepatuhan keamanan.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Awal Akun <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                <option value="aktif">Aktif (Dapat Login Langsung)</option>
                <option value="nonaktif">Nonaktif (Akses Ditangguhkan)</option>
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
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-sky-200 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Membuat Akun...' : 'Daftarkan Staff'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

