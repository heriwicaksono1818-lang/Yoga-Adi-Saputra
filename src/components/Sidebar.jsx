import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  History,
  X,
  Server,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
  const { profile, isDemoMode } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Kelola Barang', path: '/admin/barang', icon: Boxes },
    { name: 'Peminjaman', path: '/admin/peminjaman', icon: ArrowUpRight },
    { name: 'Pengembalian', path: '/admin/pengembalian', icon: ArrowDownLeft },
    { name: 'Manajemen Staff', path: '/admin/staff', icon: Users },
  ]

  const staffNav = [
    { name: 'Dashboard', path: '/staff', icon: LayoutDashboard, end: true },
    { name: 'Daftar Barang', path: '/staff/barang', icon: Boxes },
    { name: 'Catat Peminjaman', path: '/staff/peminjaman', icon: ArrowUpRight },
    { name: 'Pengembalian', path: '/staff/pengembalian', icon: ArrowDownLeft },
    { name: 'Riwayat Transaksi', path: '/staff/riwayat', icon: History },
  ]

  const navItems = isAdmin ? adminNav : staffNav

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">LABORATORIUM</h1>
                <p className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">Inventory System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigasi Utama */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'Menu Administrator' : 'Menu Asisten Staff'}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800">
          {isDemoMode && (
            <div className="p-3 mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Demo Sandbox Mode</span>
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">
                Data tersimpan di storage browser untuk pengujian cepat tanpa database.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
              {profile?.nama?.charAt(0) || 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{profile?.nama}</p>
              <p className="text-[10px] text-slate-400 capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
