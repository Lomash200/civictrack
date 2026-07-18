import React, { useEffect, useState } from 'react'
import { Loader2, Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [pwMessage, setPwMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/profile').then((res) => {
      setProfile(res.data)
      setForm({ name: res.data.name, phone: res.data.phone || '' })
    })
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const { data } = await api.put('/profile', form)
      setProfile(data)
      setMessage('Profile updated successfully.')
    } catch (e) {
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwSaving(true)
    setPwMessage('')
    setError('')
    try {
      await api.put('/profile/change-password', pwForm)
      setPwMessage('Password changed successfully.')
      setPwForm({ oldPassword: '', newPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setProfile(data)
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    )
  }

  const photoUrl = profile.profilePhotoUrl
    ? `${import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'}${profile.profilePhotoUrl}`
    : null

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-6">Your profile</h1>

      <div className="bg-white rounded-xl2 shadow-card p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-civic-100 flex items-center justify-center overflow-hidden text-civic-800 font-display font-semibold text-2xl">
            {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : profile.name?.[0]}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-civic-800 rounded-full flex items-center justify-center cursor-pointer border-2 border-white">
            <Camera size={13} className="text-white" />
            <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
          </label>
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-slate-900">{profile.name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={saveProfile} className="bg-white rounded-xl2 shadow-card p-6 space-y-4 mb-6">
        <h2 className="font-display font-semibold text-slate-900">Edit details</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
          />
        </div>
        {message && (
          <p className="flex items-center gap-1.5 text-green-700 text-sm">
            <CheckCircle2 size={14} /> {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-civic-800 hover:bg-civic-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-70"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white rounded-xl2 shadow-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-slate-900">Change password</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
          <input
            type="password"
            required
            value={pwForm.oldPassword}
            onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-civic-800 focus:ring-1 focus:ring-civic-800 outline-none text-sm"
          />
        </div>
        {pwMessage && (
          <p className="flex items-center gap-1.5 text-green-700 text-sm">
            <CheckCircle2 size={14} /> {pwMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={pwSaving}
          className="bg-civic-800 hover:bg-civic-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-70"
        >
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
