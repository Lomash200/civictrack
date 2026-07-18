import React, { useEffect, useState } from 'react'
import { FileText, Clock, Loader2, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../api/axios'

const COLORS = ['#114B5F', '#F2A93B', '#2563EB', '#7C3AED', '#1F9D55', '#DC2626', '#166477', '#DD9227']

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data))
  }, [])

  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      const { data } = await api.get('/ai/summary')
      setSummary(data.summary)
    } catch (e) {
      setSummary('Could not generate AI summary right now.')
    } finally {
      setSummaryLoading(false)
    }
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    )
  }

  const categoryData = Object.entries(stats.categoryBreakdown || {}).map(([name, value]) => ({ name, value }))
  const deptData = Object.entries(stats.departmentBreakdown || {}).map(([name, value]) => ({ name, value }))
  const monthlyData = (stats.monthlyTrend || []).map((m) => ({
    month: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
    count: m.count,
  }))

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Admin Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">City-wide complaint overview and analytics.</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total complaints" value={stats.totalComplaints} color="civic" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={TrendingUp} label="In progress" value={stats.inProgress} color="violet" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} color="green" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={Clock} label="Today's complaints" value={stats.todaysComplaints} color="civic" small />
        <StatCard icon={TrendingUp} label="This month" value={stats.monthlyComplaints} color="civic" small />
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> AI Summary
          </h2>
          <button
            onClick={loadSummary}
            disabled={summaryLoading}
            className="text-xs font-medium text-civic-800 hover:underline disabled:opacity-50"
          >
            {summaryLoading ? 'Generating…' : 'Generate summary'}
          </button>
        </div>
        <p className="text-sm text-slate-600">
          {summary || 'Click "Generate summary" to have AI summarize current complaint trends for you.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-display font-semibold text-slate-900 mb-4">Complaints by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-display font-semibold text-slate-900 mb-4">Complaints by department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#114B5F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">Monthly complaint trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#F2A93B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, small }) {
  const colors = {
    civic: 'bg-civic-100 text-civic-800',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-green-500/10 text-green-700',
    violet: 'bg-violet-500/10 text-violet-700',
  }
  return (
    <div className={`bg-white rounded-xl2 shadow-soft p-5 flex items-center gap-4 ${small ? '' : ''}`}>
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
