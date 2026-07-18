import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, AlertCircle } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-civic-50 p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-civic-800 flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-semibold text-lg text-civic-900">CivicTrack</span>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-8">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-6">Start raising and tracking civic complaints.</p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
                placeholder="Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-civic-800 hover:bg-civic-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create account
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-civic-800 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
