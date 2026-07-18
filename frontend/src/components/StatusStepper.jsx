import React from 'react'
import { Check, X } from 'lucide-react'

const STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
const LABELS = { PENDING: 'Raised', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' }

export default function StatusStepper({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <span className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <X size={14} strokeWidth={3} />
        </span>
        Complaint rejected
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(status)

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex
        const isLast = i === STEPS.length - 1
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  done
                    ? 'bg-civic-800 border-civic-800 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium text-center ${done ? 'text-civic-800' : 'text-slate-400'}`}>
                {LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-5 ${i < currentIndex ? 'bg-civic-800' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
