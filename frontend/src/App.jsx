import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import PrivateRoute from './components/PrivateRoute'
import ChatWidget from './components/ChatWidget'
import { useAuth } from './context/AuthContext'

import UserOverview from './pages/user/UserOverview'
import RaiseComplaint from './pages/user/RaiseComplaint'
import ComplaintHistory from './pages/user/ComplaintHistory'
import Profile from './pages/user/Profile'

import AdminOverview from './pages/admin/AdminOverview'
import AdminComplaints from './pages/admin/AdminComplaints'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="USER">
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<UserOverview />} />
          <Route path="raise" element={<RaiseComplaint />} />
          <Route path="history" element={<ComplaintHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <PrivateRoute role="ADMIN">
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="complaints" element={<AdminComplaints />} />
        </Route>

        <Route
          path="/"
          element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {user?.role === 'USER' && <ChatWidget />}
    </>
  )
}
