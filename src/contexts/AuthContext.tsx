import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  role: 'manager' | 'sales'
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('carbosul-auth')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('carbosul-auth', JSON.stringify(user))
    } else {
      localStorage.removeItem('carbosul-auth')
    }
  }, [user])

  const login = (u: User) => setUser(u)
  const logout = () => setUser(null)

  return React.createElement(AuthContext.Provider, { value: { user, login, logout } }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
