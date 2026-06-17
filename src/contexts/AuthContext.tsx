import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  email: string
  name: string
  role: 'manager' | 'sales'
}

interface AuthContextType {
  user: User | null
  session: any | null
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
  const [session, setSession] = useState<any | null>(
    pb.authStore.isValid ? pb.authStore.token : null,
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateUser = () => {
      const record = pb.authStore.record
      if (record) {
        setUser({
          id: record.id,
          email: record.email,
          name: record.name || 'User',
          role: record.role || 'sales',
        })
        setSession(pb.authStore.token)
      } else {
        setUser(null)
        setSession(null)
      }
    }

    updateUser()
    setLoading(false)

    const unsubscribe = pb.authStore.onChange(() => {
      updateUser()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)

      if (pb.authStore.record) {
        try {
          await pb.collection('audit_logs').create({
            user: pb.authStore.record.id,
            action: 'Login Successful',
          })
        } catch (e) {
          console.error('Failed to create audit log', e)
        }
      }

      return { error: null }
    } catch (error) {
      try {
        await pb.send('/backend/v1/log-failed-login', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        })
      } catch {
        /* intentionally ignored */
      }
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' })
      if (authData.record) {
        try {
          await pb.collection('audit_logs').create({
            user: authData.record.id,
            action: 'Login Successful',
          })
        } catch (e) {
          console.error('Failed to create audit log', e)
        }
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      pb.authStore.clear()
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async () => {
    return { error: new Error('Please use the link sent to your email to reset your password.') }
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
