import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { staffService } from '../../../services/staffService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import ConfirmModal from '../../../components/ConfirmModal'
import {
  Users,
  Plus,
  Edit2,
  Power,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function StaffList() {
  const { isDemoMode } = useAuth()
  const { showToast } = useToast()

  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  // Toggle modal state
  const [toggleTarget, setToggleTarget] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await staffService.getAll(isDemoMode)
    if (res.success) {
      setStaffList(res.data || [])
    } else {
      showToast(res.error || 'Gagal memuat daftar staff.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [isDemoMode])

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return
    setToggleLoading(true)
    const res = await staffService.toggleStatus(toggleTarget.id, toggleTarget.status, isDemoMode)
    setToggleLoading(false)

    if (res.success) {
      const nextStatus = toggleTarget.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'
      showToast(`Akun staff ${toggleTarget.nama} berhasil ${nextStatus}.`, 'success')
      setToggleTarget(null)
      loadData()
    } else {
      showToast(res.error || 'Gagal mengubah status staff.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Akun Asisten Staff</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akses, tambahkan petugas laboratorium baru, atau nonaktifkan akun staf yang bertugas
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
            to="/admin/staff/tambah"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-sky-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Staff</span>
          </Link>
        </div>
      </div>

      {/* Tabel Data Staff */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-6">Nama Staff</th>
                <th className="py-3 px-6">Alamat Email</th>
                <th className="py-3 px-6">Role Akses</th>
                <th className="py-3 px-6">Status Akun</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Memuat data staf...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada akun staff yang terdaftar.
                  </td>
                </tr>
              ) : (
                staffList.map((item) => {
                  const isActive = item.status === 'aktif'

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{item.nama}</td>
                      <td className="py-3.5 px-6 text-slate-600 text-xs">{item.email}</td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{item.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/staff/edit/${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                            title="Edit Data Staff"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setToggleTarget(item)}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                            }`}
                            title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Toggle Status */}
      <ConfirmModal
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleConfirm}
        loading={toggleLoading}
        title={toggleTarget?.status === 'aktif' ? 'Nonaktifkan Akun Staff' : 'Aktifkan Akun Staff'}
        message={`Apakah Anda yakin ingin ${
          toggleTarget?.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan kembali'
        } akun staff "${toggleTarget?.nama}"? Staff yang dinonaktifkan tidak dapat login ke sistem.`}
        confirmText={toggleTarget?.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        type={toggleTarget?.status === 'aktif' ? 'warning' : 'info'}
      />
    </div>
  )
}

