import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, History, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/raise', label: 'Raise Complaint', icon: FilePlus2 },
    { to: '/dashboard/history', label: 'Complaint History', icon: History },
    { to: '/dashboard/profile', label: 'Profile', icon: UserIcon },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: ShieldCheck },
  ]

  const links = user?.role === 'ADMIN' ? adminLinks : userLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 bg-civic-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-display font-bold text-civic-950">
          C
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">CivicTrack</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active ? 'bg-white/10 text-white' : 'text-civic-100/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-xs text-civic-100/50 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-civic-100/70 hover:bg-white/5 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  )
}
