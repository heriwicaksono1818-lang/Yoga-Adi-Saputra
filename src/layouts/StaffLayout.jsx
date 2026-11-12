import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Database } from 'lucide-react'

export default function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isSupabaseConfigured } = useAuth()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {!isSupabaseConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Perhatian:</strong> Kredensial Supabase belum terdeteksi.
              </span>
            </div>
            <span className="hidden md:inline text-amber-700 text-[11px]">
              Pastikan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> telah disetel di Vercel.
            </span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

