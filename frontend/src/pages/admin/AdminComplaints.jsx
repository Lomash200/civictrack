import React, { useEffect, useState } from 'react'
import { Loader2, Search, Trash2, MapPin } from 'lucide-react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'

const STATUSES = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/complaints?page=0&size=100'),
      api.get('/admin/departments'),
    ]).then(([complaintsRes, deptRes]) => {
      setComplaints(complaintsRes.data.content)
      setDepartments(deptRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await api.put(`/admin/complaints/${id}/status`, { status })
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    } finally {
      setUpdatingId(null)
    }
  }

  const assignDepartment = async (id, departmentId) => {
    if (!departmentId) return
    setUpdatingId(id)
    try {
      const { data } = await api.put(`/admin/complaints/${id}/assign`, { departmentId })
      setComplaints((prev) => prev.map((c) => (c.id === id ? data : c)))
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return
    await api.delete(`/admin/complaints/${id}`)
    setComplaints((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.userName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">All Complaints</h1>
      <p className="text-slate-500 text-sm mb-6">Search, filter, assign departments, and update status.</p>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, number, or citizen…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 outline-none text-sm bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-civic-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Complaint</th>
                <th className="text-left px-5 py-3 font-medium">Citizen</th>
                <th className="text-left px-5 py-3 font-medium">Priority</th>
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-civic-50/50">
                  <td className="px-5 py-3 max-w-xs">
                    <p className="font-medium text-slate-800 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.complaintNumber}</p>
                    {c.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {c.location}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.userName}</td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3">
                    <select
                      value={departments.find((d) => d.departmentName === c.assignedDepartment)?.id || ''}
                      onChange={(e) => assignDepartment(c.id, e.target.value)}
                      disabled={updatingId === c.id}
                      className="text-xs px-2 py-1.5 rounded-md border border-slate-300 outline-none bg-white"
                    >
                      <option value="">Unassigned</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.departmentName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      disabled={updatingId === c.id}
                      className="text-xs px-2 py-1.5 rounded-md border border-slate-300 outline-none bg-white mb-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <div><StatusBadge status={c.status} /></div>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteComplaint(c.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      aria-label="Delete complaint"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">No complaints match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
