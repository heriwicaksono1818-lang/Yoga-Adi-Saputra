import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import { useAuth } from '../../context/AuthContext'
import {
  Boxes,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react'

import DashboardCard from '../../components/DashboardCard';
export default function StaffDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getStaffStats(user?.id)
      setStats(data)
    } catch (err) {
      console.error('Error load staff stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Jenis Barang',
      value: stats?.totalBarang || 0,
      sub: 'Koleksi lab terdaftar',
      icon: Boxes,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'Barang Tersedia',
      value: stats?.barangTersedia || 0,
      sub: 'Dapat dipinjam mahasiswa',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Unit Sedang Dipinjam',
      value: stats?.barangDipinjam || 0,
      sub: 'Total fisik di luar lab',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Transaksi Saya',
      value: stats?.totalTransaksiSaya || 0,
      sub: 'Total yang Anda catat',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Transaksi Aktif Saya',
      value: stats?.transaksiAktifSaya || 0,
      sub: 'Peminjaman yang belum kembali',
      icon: ArrowUpRight,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Staf</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau stok inventaris dan catat transaksi peminjaman alat laboratorium
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
            to="/staff/peminjaman"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-sky-200"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Peminjaman</span>
          </Link>
        </div>
      </div>

      {/* Grid Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Aktivitas Transaksi Saya */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Aktivitas Transaksi Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">Transaksi peminjaman yang Anda proses terakhir kali</p>
          </div>
          <Link
            to="/staff/riwayat"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Lihat Riwayat Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-6">Nama Peminjam</th>
                <th className="py-3 px-6">Barang &amp; Jumlah</th>
                <th className="py-3 px-6">Tanggal Pinjam</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.aktivitasSaya?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    Anda belum pernah mencatat transaksi peminjaman.
                  </td>
                </tr>
              ) : (
                stats?.aktivitasSaya?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-800">{item.nama_peminjam}</td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {item.nama_barang} <span className="font-semibold text-slate-800">({item.jumlah} unit)</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">{item.tanggal}</td>
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

