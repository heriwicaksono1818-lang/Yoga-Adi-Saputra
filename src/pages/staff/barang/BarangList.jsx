import React, { useState, useEffect } from 'react'
import { barangService } from '../../../services/barangService'
import { useAuth } from '../../../context/AuthContext'
import { Boxes, Search, Filter, RefreshCw } from 'lucide-react'

export default function StaffBarangList() {
  const { isDemoMode } = useAuth()
  const [barang, setBarang] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')

  const loadData = async () => {
    setLoading(true)
    const res = await barangService.getAll({ search, kategori }, isDemoMode)
    if (res.success) {
      setBarang(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [search, kategori, isDemoMode])

  const categories = ['Semua Kategori', 'Laptop', 'Aksesoris', 'Multimedia', 'Periferal', 'Jaringan']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Barang &amp; Cek Stok</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat ketersediaan alat dan inventaris komputer laboratorium (Mode Read-Only)
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

      {/* Grid Katalog Card untuk Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Memuat inventaris...
          </div>
        ) : barang.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tidak ada barang yang sesuai dengan filter.
          </div>
        ) : (
          barang.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg">
                    {item.kode_barang}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {item.kategori}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base leading-snug">{item.nama_barang}</h3>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Stok Lab</span>
                  <span className="text-xl font-extrabold text-slate-800">{item.stok} unit</span>
                </div>

                <div>
                  {item.stok > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Stok Kosong
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
