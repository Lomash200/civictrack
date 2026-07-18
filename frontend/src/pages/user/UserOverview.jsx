import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle2, Loader2, PlusCircle } from 'lucide-react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'

export default function UserOverview() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/complaints?page=0&size=5')
      .then((res) => setComplaints(res.data.content))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's a quick look at your recent activity.</p>
        </div>
        <Link
          to="/dashboard/raise"
          className="flex items-center gap-2 bg-civic-800 hover:bg-civic-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          Raise Complaint
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={FileText} label="Recent complaints" value={counts.total} color="civic" />
        <StatCard icon={Clock} label="Pending" value={counts.pending} color="amber" />
        <StatCard icon={CheckCircle2} label="Resolved" value={counts.resolved} color="green" />
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">Recent complaints</h2>
          <Link to="/dashboard/history" className="text-sm text-civic-800 font-medium hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm mb-3">You haven't raised any complaints yet.</p>
            <Link to="/dashboard/raise" className="text-civic-800 font-medium text-sm hover:underline">
              Raise your first complaint →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 font-mono">{c.complaintNumber}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    civic: 'bg-civic-100 text-civic-800',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-green-500/10 text-green-700',
  }
  return (
    <div className="bg-white rounded-xl2 shadow-soft p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}
