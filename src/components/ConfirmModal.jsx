import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Aksi',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger', // danger | warning | info
  loading = false,
}) {
  if (!isOpen) return null

  const typeConfig = {
    danger: {
      bgIcon: 'bg-rose-100 text-rose-600',
      btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200',
    },
    warning: {
      bgIcon: 'bg-amber-100 text-amber-600',
      btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-200',
    },
    info: {
      bgIcon: 'bg-sky-100 text-sky-600',
      btnConfirm: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-200',
    },
  }[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-up">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${typeConfig.bgIcon}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500">Mohon periksa kembali keputusan Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed">{message}</p>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${typeConfig.btnConfirm} disabled:opacity-50`}
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

