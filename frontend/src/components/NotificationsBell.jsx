import React, { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import api from '../api/axios'

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const loadUnread = () => {
    api.get('/notifications/unread-count').then((res) => setUnread(res.data.count)).catch(() => {})
  }

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = async () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      const { data } = await api.get('/notifications')
      setNotifications(data)
      if (unread > 0) {
        await api.put('/notifications/mark-read')
        setUnread(0)
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-civic-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl2 shadow-card border border-slate-200 z-50 max-h-96 overflow-y-auto scrollbar-thin">
          <div className="px-4 py-3 border-b border-slate-100 font-display font-semibold text-sm text-slate-900">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 text-sm text-slate-700">
                  <p>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
