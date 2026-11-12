import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Server, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault()
    setErrorMessage('')

    const targetEmail = customEmail || email
    const targetPassword = customPass || password

    if (!targetEmail.trim()) {
      setErrorMessage('Silakan masukkan alamat email.')
      return
    }
    if (!targetPassword) {
      setErrorMessage('Silakan masukkan kata sandi.')
      return
    }

    setLoading(true)
    const result = await login(targetEmail, targetPassword)
    setLoading(false)

    if (result.success) {
      const role = result.profile?.role
      const defaultDest = role === 'admin' ? '/admin' : '/staff'
      const destination = location.state?.from?.pathname || defaultDest
      navigate(destination, { replace: true })
    } else {
      setErrorMessage(result.error || 'Autentikasi gagal. Periksa kembali email dan password Anda.')
    }
  }

  // Helper untuk tombol demo instan
  const handleDemoClick = (roleType) => {
    if (roleType === 'admin') {
      setEmail('admin.demo@example.com')
      setPassword('Demo123!')
      handleLogin(null, 'admin.demo@example.com', 'Demo123!')
    } else {
      setEmail('staff.demo@example.com')
      setPassword('Demo123!')
      handleLogin(null, 'staff.demo@example.com', 'Demo123!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950">
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500 text-white shadow-xl shadow-sky-500/30 mb-4 transform hover:scale-105 transition-transform">
            <Server className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laboratorium Komputer</h1>
          <p className="text-sm text-slate-400 mt-1">Inventory &amp; Borrowing Management System</p>
        </div>

        {/* Card Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-1">Gunakan kredensial resmi untuk mengakses hak akses Anda</p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs leading-relaxed animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.demo@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Cepat Akun Demo (1-Click)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                disabled={loading}
                className="p-2.5 text-left border border-slate-200 hover:border-sky-500 rounded-xl bg-slate-50 hover:bg-sky-50/50 transition-all group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-sky-700">Admin Demo</div>
                <div className="text-[10px] text-slate-500 truncate">admin.demo@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('staff')}
                disabled={loading}
                className="p-2.5 text-left border border-slate-200 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700">Staff Demo</div>
                <div className="text-[10px] text-slate-500 truncate">staff.demo@example.com</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} Laboratory Management System &bull; Secured with Supabase
        </p>
      </div>
    </div>
  )
}
