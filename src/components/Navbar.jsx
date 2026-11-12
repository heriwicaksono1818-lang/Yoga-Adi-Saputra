import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, LogOut, Shield, User, Beaker } from 'lucide-react'
import ConfirmModal from './ConfirmModal'

export default function Navbar({ onToggleSidebar }) {
  const { profile, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await logout()
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-200">
              <Beaker className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline-block font-semibold text-slate-800 text-sm tracking-tight truncate max-w-xs md:max-w-md">
              Lab Inventory &amp; Borrowing System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge Role */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isAdmin
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{profile?.role || 'User'}</span>
          </div>

          {/* User Info Dropdown / Pill */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-800 leading-tight">{profile?.nama || 'Pengguna'}</span>
            <span className="text-xs text-slate-500 truncate max-w-[160px]">{profile?.email}</span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Tombol Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            title="Keluar dari sesi"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Modal Konfirmasi Logout */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sistem inventaris laboratorium?"
        confirmText="Ya, Logout"
        type="warning"
      />
    </>
  )
}
