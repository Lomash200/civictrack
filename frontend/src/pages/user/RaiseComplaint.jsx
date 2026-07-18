import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, ImagePlus, CheckCircle2, AlertCircle, X } from 'lucide-react'
import api from '../../api/axios'

const CATEGORIES = [
  { value: 'GARBAGE', label: 'Garbage' },
  { value: 'ROAD_DAMAGE', label: 'Road Damage' },
  { value: 'WATER_SUPPLY', label: 'Water Supply' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'STREET_LIGHTS', label: 'Street Lights' },
  { value: 'SEWAGE', label: 'Sewage' },
  { value: 'PUBLIC_TRANSPORT', label: 'Public Transport' },
  { value: 'OTHER', label: 'Other' },
]

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export default function RaiseComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: '', location: '' })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [aiLoading, setAiLoading] = useState({ rewrite: false, category: false, priority: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const runAiRewrite = async () => {
    if (!form.description.trim()) return
    setAiLoading((s) => ({ ...s, rewrite: true }))
    try {
      const { data } = await api.post('/ai/rewrite', { text: form.description })
      setForm((f) => ({ ...f, description: data.result }))
    } catch (e) {
      // silent fail - AI is a nice-to-have, never blocks the form
    } finally {
      setAiLoading((s) => ({ ...s, rewrite: false }))
    }
  }

  const runAiCategory = async () => {
    if (!form.description.trim()) return
    setAiLoading((s) => ({ ...s, category: true }))
    try {
      const { data } = await api.post('/ai/category', { text: form.description })
      setForm((f) => ({ ...f, category: data.result }))
    } catch (e) {
      /* silent */
    } finally {
      setAiLoading((s) => ({ ...s, category: false }))
    }
  }

  const runAiPriority = async () => {
    if (!form.description.trim()) return
    setAiLoading((s) => ({ ...s, priority: true }))
    try {
      const { data } = await api.post('/ai/priority', { text: form.description })
      setForm((f) => ({ ...f, priority: data.result }))
    } catch (e) {
      /* silent */
    } finally {
      setAiLoading((s) => ({ ...s, priority: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.category) {
      setError('Please fill in title, description, and category.')
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, priority: form.priority || null }
      const formData = new FormData()
      formData.append('data', JSON.stringify(payload))
      if (image) formData.append('image', image)

      const { data } = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white rounded-xl2 shadow-card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900 mb-1">Complaint submitted</h2>
        <p className="text-slate-500 text-sm mb-4">
          Your complaint number is <span className="font-mono font-semibold text-civic-800">{success.complaintNumber}</span>.
          You'll be notified as its status updates.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard/history')}
            className="px-4 py-2 rounded-lg bg-civic-800 text-white text-sm font-medium hover:bg-civic-700"
          >
            View history
          </button>
          <button
            onClick={() => {
              setSuccess(null)
              setForm({ title: '', description: '', category: '', priority: '', location: '' })
              setImage(null)
              setImagePreview(null)
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Raise another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Raise a complaint</h1>
      <p className="text-slate-500 text-sm mb-6">
        Describe the issue clearly — our AI assistant can help polish it, suggest a category, and flag urgency.
      </p>

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl2 shadow-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Complaint title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
            placeholder="e.g. Pothole near main square"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <button
              type="button"
              onClick={runAiRewrite}
              disabled={aiLoading.rewrite || !form.description.trim()}
              className="flex items-center gap-1.5 text-xs font-medium text-civic-800 hover:text-civic-700 disabled:opacity-40"
            >
              {aiLoading.rewrite ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Improve with AI
            </button>
          </div>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm resize-none"
            placeholder="Describe the issue in your own words…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <button
                type="button"
                onClick={runAiCategory}
                disabled={aiLoading.category || !form.description.trim()}
                className="flex items-center gap-1 text-xs font-medium text-civic-800 hover:text-civic-700 disabled:opacity-40"
              >
                {aiLoading.category ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Suggest
              </button>
            </div>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <button
                type="button"
                onClick={runAiPriority}
                disabled={aiLoading.priority || !form.description.trim()}
                className="flex items-center gap-1 text-xs font-medium text-civic-800 hover:text-civic-700 disabled:opacity-40"
              >
                {aiLoading.priority ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Detect
              </button>
            </div>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm bg-white"
            >
              <option value="">Auto (let AI decide)</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
            placeholder="e.g. Vijay Nagar Square, near bus stop"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo (optional)</label>
          {imagePreview ? (
            <div className="relative w-40 h-40">
              <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-lg border border-slate-200" />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null) }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center shadow-soft"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-civic-800 transition-colors">
              <ImagePlus size={22} className="text-slate-400 mb-1" />
              <span className="text-xs text-slate-400">Upload photo</span>
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-civic-800 hover:bg-civic-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Submit complaint
        </button>
      </form>
    </div>
  )
}
