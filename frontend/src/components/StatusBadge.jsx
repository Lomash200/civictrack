import React from 'react'

const STATUS_STYLES = {
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  ASSIGNED: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  IN_PROGRESS: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
  RESOLVED: 'bg-green-500/10 text-green-700 border-green-500/30',
  REJECTED: 'bg-red-500/10 text-red-600 border-red-500/30',
}

const LABELS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-300'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  )
}
