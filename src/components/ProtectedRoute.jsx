import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-3" />
        <p className="text-sm font-medium">Memuat sesi pengguna...</p>
      </div>
    )
  }

  // Belum login -> redirect ke /login
  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Jika akun nonaktif
  if (profile.status === 'nonaktif') {
    return <Navigate to="/login" state={{ error: 'Akun Anda dinonaktifkan oleh Administrator.' }} replace />
  }

  // Proteksi Role yang ketat
  if (allowedRole && profile.role !== allowedRole) {
    // Admin dilarang ke halaman Staff, Staff dilarang ke halaman Admin
    const redirectPath = profile.role === 'admin' ? '/admin' : '/staff'
    return <Navigate to={redirectPath} replace />
  }

  return children
}
