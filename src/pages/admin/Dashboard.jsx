import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import { useAuth } from '../../context/AuthContext'
import {
  Boxes,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react'
import DashboardCard from '../../components/DashboardCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getAdminStats()
      setStats(data)
    } catch (err) {
      console.error('Error load admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Jenis Barang',
      value: stats?.totalBarang || 0,
      sub: 'Koleksi aset lab',
      icon: Boxes,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'Total Unit Stok',
      value: stats?.totalStok || 0,
      sub: 'Total fisik tersedia di lab',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Barang Tersedia',
      value: stats?.barangTersedia || 0,
      sub: 'Siap dipinjam (stok > 0)',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Unit Sedang Dipinjam',
      value: stats?.barangSedangDipinjam || 0,
      sub: 'Sedang berada di luar lab',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Total Transaksi',
      value: stats?.totalTransaksi || 0,
      sub: 'Semua peminjaman tercatat',
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'Transaksi Aktif',
      value: stats?.transaksiAktif || 0,
      sub: 'Belum dikembalikan',
      icon: ArrowUpRight,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      label: 'Transaksi Selesai',
      value: stats?.transaksiSelesai || 0,
      sub: 'Telah dikembalikan utuh',
      icon: FileCheck2,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Administrator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan status inventaris, aset laboratorium, dan siklus peminjaman
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Segarkan Data"
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

      {/* Grid Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <DashboardCard
            key={idx}
            label={card.label}
            value={card.value}
            sub={card.sub}
            Icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Tabel Aktivitas Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Aktivitas &amp; Transaksi Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pantauan sirkulasi peminjaman laboratorium terkini</p>
          </div>
          <Link
            to="/admin/peminjaman"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Semua Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-6">Aktivitas / Peminjam</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Tanggal</th>
                <th className="py-3 px-6">Petugas Bertugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.aktivitasTerbaru?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat aktivitas peminjaman.
                  </td>
                </tr>
              ) : (
                stats?.aktivitasTerbaru?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-800">{item.deskripsi}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          item.status === 'dipinjam'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs font-medium">{item.petugas}</td>
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

