import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Visit {
  id: string
  salesmanId: string
  salesmanName: string
  company: string
  contact: string
  phone: string
  address: string
  reason: string
  interest: string
  products: Record<string, number>
  notes: string
  timestamp: string
  status: 'synced' | 'pending'
  priority?: boolean
}

interface DataContextType {
  visits: Visit[]
  addVisit: (visit: Visit) => void
  syncVisits: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('carbosul-visits')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('carbosul-visits', JSON.stringify(visits))
  }, [visits])

  const addVisit = (visit: Visit) => setVisits((prev) => [visit, ...prev])
  const syncVisits = () =>
    setVisits((prev) => prev.map((v) => (v.status === 'pending' ? { ...v, status: 'synced' } : v)))

  return React.createElement(
    DataContext.Provider,
    { value: { visits, addVisit, syncVisits } },
    children,
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
