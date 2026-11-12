import React, { useState, useEffect } from 'react'
import { peminjamanService } from '../../../services/peminjamanService'
import { useAuth } from '../../../context/AuthContext'
import { History, RefreshCw, CheckCircle2, Clock } from 'lucide-react'

export default function StaffRiwayatPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const res = await peminjamanService.getAll({ userId: user?.id })
    if (res.success) {
      setHistory(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh transaksi peminjaman alat laboratorium yang pernah Anda catat
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada riwayat transaksi yang Anda catat.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

