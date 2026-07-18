import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import NotificationsBell from './NotificationsBell'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-civic-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {user?.role === 'USER' && (
          <header className="flex justify-end items-center px-8 py-4 border-b border-slate-200 bg-white">
            <NotificationsBell />
          </header>
        )}
        <main className="flex-1 p-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
