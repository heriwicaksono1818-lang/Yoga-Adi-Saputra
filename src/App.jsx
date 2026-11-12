import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import StaffLayout from './layouts/StaffLayout'

// Pages
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/Dashboard'
import StaffDashboard from './pages/staff/Dashboard'

// Barang
import BarangList from './pages/admin/barang/BarangList'
import BarangTambah from './pages/admin/barang/BarangTambah'
import BarangEdit from './pages/admin/barang/BarangEdit'
import StaffBarangList from './pages/staff/barang/BarangList'

// Transaksi
import PeminjamanPage from './pages/peminjaman/PeminjamanPage'
import PengembalianPage from './pages/pengembalian/PengembalianPage'
import StaffRiwayatPage from './pages/staff/riwayat/RiwayatPage'

// Staff Management
import StaffList from './pages/admin/staff/StaffList'
import StaffTambah from './pages/admin/staff/StaffTambah'
import StaffEdit from './pages/admin/staff/StaffEdit'

// Root redirect handler
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={profile.role === 'admin' ? '/admin' : '/staff'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="barang" element={<BarangList />} />
              <Route path="barang/tambah" element={<BarangTambah />} />
              <Route path="barang/edit/:id" element={<BarangEdit />} />
              <Route path="peminjaman" element={<PeminjamanPage isAdmin={true} />} />
              <Route path="pengembalian" element={<PengembalianPage isAdmin={true} />} />
              <Route path="staff" element={<StaffList />} />
              <Route path="staff/tambah" element={<StaffTambah />} />
              <Route path="staff/edit/:id" element={<StaffEdit />} />
            </Route>

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRole="staff">
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="barang" element={<StaffBarangList />} />
              <Route path="peminjaman" element={<PeminjamanPage isAdmin={false} />} />
              <Route path="pengembalian" element={<PengembalianPage isAdmin={false} />} />
              <Route path="riwayat" element={<StaffRiwayatPage />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
