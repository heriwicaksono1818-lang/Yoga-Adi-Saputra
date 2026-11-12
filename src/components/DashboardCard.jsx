import React from 'react';

/**
 * Reusable statistic card used on both admin and staff dashboards.
 * Props:
 *  - label: string – title of the statistic
 *  - value: number|string – displayed value
 *  - sub: string – description/subtitle
 *  - Icon: React component – Lucide icon
 *  - color: string – Tailwind classes for icon container background/border/text
 */
export default function DashboardCard({ label, value, sub, Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl border ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-extrabold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{sub}</div>
      </div>
    </div>
  );
}

