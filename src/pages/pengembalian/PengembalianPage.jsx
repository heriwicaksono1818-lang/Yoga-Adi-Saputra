import React, { useState, useEffect } from 'react'
import { peminjamanService } from '../../services/peminjamanService'
import { pengembalianService } from '../../services/pengembalianService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  ArrowDownLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  RefreshCw,
} from 'lucide-react'

export default function PengembalianPage({ isAdmin = false }) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [activeLoans, setActiveLoans] = useState([])
  const [returnHistory, setReturnHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'history'

  // Modal Kembalikan
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [returnQty, setReturnQty] = useState(1)
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadData = async () => {
    setLoading(true)
    const [activeRes, histRes] = await Promise.all([
      peminjamanService.getAll({ status: 'dipinjam' }),
      pengembalianService.getAll(),
    ])

    if (activeRes.success) setActiveLoans(activeRes.data || [])
    if (histRes.success) setReturnHistory(histRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openReturnModal = (loan) => {
    setSelectedLoan(loan)
    setReturnQty(loan.jumlah)
    setReturnDate(new Date().toISOString().split('T')[0])
    setFormError('')
  }

  const handleProcessReturn = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedLoan) return

    const qty = parseInt(returnQty, 10)
    if (isNaN(qty) || qty <= 0) {
      setFormError('Jumlah yang dikembalikan harus lebih besar dari 0.')
      return
    }
    if (qty > selectedLoan.jumlah) {
      setFormError(`Jumlah dikembalikan (${qty}) tidak boleh melebihi jumlah pinjaman (${selectedLoan.jumlah}).`)
      return
    }
    if (!returnDate) {
      setFormError('Tanggal pengembalian wajib diisi.')
      return
    }

    setSubmitting(true)
    const res = await pengembalianService.proses(
      {
        peminjaman_id: selectedLoan.id,
        jumlah_dikembalikan: qty,
        tanggal_pengembalian: returnDate,
        user_id: user?.id,
      }
    )
    setSubmitting(false)

    if (res.success) {
      showToast(
        `Barang "${selectedLoan.barang?.nama_barang}" berhasil dikembalikan. Stok bertambah ${qty} unit.`,
        'success'
      )
      setSelectedLoan(null)
      loadData()
    } else {
      setFormError(res.error || 'Gagal memproses pengembalian.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengembalian Alat Laboratorium</h1>
          <p className="text-sm text-slate-500 mt-1">
            Proses verifikasi pengembalian barang yang sedang dipinjam dan pemulihan stok otomatis
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

      {/* Navigasi Tab */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'active'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Peminjaman Aktif (Perlu Dikembalikan)</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
            {activeLoans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'history'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Riwayat Pengembalian Selesai</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
            {returnHistory.length}
          </span>
        </button>
      </div>

      {/* Konten Tab 1: Peminjaman Aktif */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-6">Nama Peminjam</th>
                  <th className="py-3 px-6">Barang</th>
                  <th className="py-3 px-6">Jumlah Dipinjam</th>
                  <th className="py-3 px-6">Tanggal Pinjam</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      Memuat daftar peminjaman aktif...
                    </td>
                  </tr>
                ) : activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                      Tidak ada barang yang sedang dipinjam saat ini. Semua inventaris aman di lab.
                    </td>
                  </tr>
                ) : (
                  activeLoans.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{item.nama_peminjam}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-slate-800">{item.barang?.nama_barang || 'Barang'}</div>
                        <div className="font-mono text-[11px] text-sky-600">{item.barang?.kode_barang}</div>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.jumlah} unit</td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">{item.tanggal_peminjaman}</td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Dipinjam</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => openReturnModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-sm shadow-emerald-200 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kembalikan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Riwayat Pengembalian */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-6">Peminjam</th>
                  <th className="py-3 px-6">Barang</th>
                  <th className="py-3 px-6">Jumlah Dikembalikan</th>
                  <th className="py-3 px-6">Tanggal Pengembalian</th>
                  <th className="py-3 px-6">Petugas Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      Memuat riwayat pengembalian...
                    </td>
                  </tr>
                ) : returnHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      <ArrowDownLeft className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada riwayat pengembalian.
                    </td>
                  </tr>
                ) : (
                  returnHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {item.peminjaman?.nama_peminjam || 'Peminjam'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-800 font-medium">
                        {item.peminjaman?.barang?.nama_barang || 'Barang Lab'}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-emerald-700">
                        +{item.jumlah_dikembalikan} unit
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">{item.tanggal_pengembalian}</td>
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
      )}

      {/* Modal Form Pengembalian */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Proses Pengembalian Barang</h3>
                  <p className="text-xs text-slate-500">Stok barang akan otomatis dipulihkan</p>
                </div>
              </div>

              {/* Ringkasan Pinjaman */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-semibold text-slate-800">{selectedLoan.nama_peminjam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Barang:</span>
                  <span className="font-semibold text-slate-800">{selectedLoan.barang?.nama_barang}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Dipinjam:</span>
                  <span className="font-bold text-amber-700">{selectedLoan.jumlah} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Pinjam:</span>
                  <span className="text-slate-700">{selectedLoan.tanggal_peminjaman}</span>
                </div>
              </div>

              {formError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleProcessReturn} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Jumlah Dikembalikan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedLoan.jumlah}
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Maksimal sesuai jumlah pinjaman ({selectedLoan.jumlah} unit).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Pengembalian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedLoan(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-emerald-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Konfirmasi Pengembalian</span>
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

