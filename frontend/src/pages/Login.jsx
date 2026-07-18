import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-civic-50">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-civic-900 text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-civic-700/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-display font-bold text-civic-950">C</div>
          <span className="font-display font-semibold text-lg">CivicTrack</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Report it once. Track it to resolution.
          </h1>
          <p className="text-civic-100/70 text-base leading-relaxed">
            Raise civic issues — roads, water, electricity, garbage — and follow every status change
            from your dashboard, with an AI assistant helping along the way.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-civic-100/50">
          <ShieldCheck size={16} />
          Secured with encrypted authentication
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-civic-800 flex items-center justify-center font-display font-bold text-white">C</div>
            <span className="font-display font-semibold text-lg text-civic-900">CivicTrack</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to manage or track your complaints.</p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-civic-800 hover:bg-civic-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            New here?{' '}
            <Link to="/register" className="text-civic-800 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400">
            Admin demo login: <span className="font-mono">admin@civic.com</span> / <span className="font-mono">Admin@123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
