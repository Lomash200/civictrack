import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('civic_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persist(data)
    return data
  }

  const persist = (data) => {
    localStorage.setItem('civic_token', data.token)
    const userData = { id: data.userId, name: data.name, email: data.email, role: data.role }
    localStorage.setItem('civic_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('civic_token')
    localStorage.removeItem('civic_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
