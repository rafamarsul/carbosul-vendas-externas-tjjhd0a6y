import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  email: string
  name: string
  role: 'manager' | 'sales'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)
      if (!currentSession) {
        setUser(null)
        setLoading(false)
      } else {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                name: data.name || 'User',
                role: data.role as 'manager' | 'sales',
              })
            } else {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                name: 'User',
                role: 'sales',
              })
            }
            setLoading(false)
          })
      }
    })

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession)
      if (!initSession) {
        setUser(null)
        setLoading(false)
      } else {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', initSession.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                name: data.name || 'User',
                role: data.role as 'manager' | 'sales',
              })
            } else {
              setUser({
                id: initSession.user.id,
                email: initSession.user.email || '',
                name: 'User',
                role: 'sales',
              })
            }
            setLoading(false)
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        loading,
      },
    },
    children,
  )
}
