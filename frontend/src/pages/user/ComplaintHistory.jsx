import React, { useEffect, useState } from 'react'
import { Loader2, MapPin, CheckCircle2 } from 'lucide-react'
import api from '../../api/axios'
import PriorityBadge from '../../components/PriorityBadge'
import StatusStepper from '../../components/StatusStepper'

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/complaints?page=0&size=50')
      .then((res) => setComplaints(res.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markDone = async (id) => {
    setResolvingId(id)
    try {
      await api.put(`/complaints/${id}/resolve`)
      load()
    } catch (e) {
      /* ignore, will just not update */
    } finally {
      setResolvingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Complaint History</h1>
      <p className="text-slate-500 text-sm mb-6">Track every complaint you've raised, from submission to resolution.</p>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-xl2 shadow-card p-10 text-center text-slate-500 text-sm">
          No complaints yet.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-xl2 shadow-card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4 min-w-0">
                  {c.imageUrl && (
                    <img
                      src={`${import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'}${c.imageUrl}`}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium text-slate-900 truncate">{c.title}</h3>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-1">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono">{c.complaintNumber}</span>
                      {c.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {c.location}
                        </span>
                      )}
                      {c.assignedDepartment && <span>· {c.assignedDepartment}</span>}
                    </div>
                  </div>
                </div>

                {(c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED') && (
                  <button
                    onClick={() => markDone(c.id)}
                    disabled={resolvingId === c.id}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {resolvingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Mark as Done
                  </button>
                )}
              </div>

              <StatusStepper status={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
