import React from 'react'

const STYLES = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-500/10 text-amber-700',
  HIGH: 'bg-red-500/10 text-red-600',
}

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${STYLES[priority] || STYLES.LOW}`}>
      {priority}
    </span>
  )
}
