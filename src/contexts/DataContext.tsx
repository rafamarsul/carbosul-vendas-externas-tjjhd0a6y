import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Visit {
  id: string
  salesmanId: string
  salesmanName: string
  company: string
  contact: string
  phone: string
  address: string
  region: string
  reason: string
  interest: string
  products: Record<string, number>
  notes: string
  timestamp: string
  status: 'synced' | 'pending'
  priority?: boolean
  approvalStatus: 'pending' | 'approved' | 'needs_review'
  managerComment?: string
  lat?: number
  lng?: number
}

export interface PriorityZone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
}

interface DataContextType {
  visits: Visit[]
  zones: PriorityZone[]
  addVisit: (visit: Visit) => void
  syncVisits: () => void
  updateApproval: (id: string, status: 'approved' | 'needs_review', comment?: string) => void
  addZone: (zone: PriorityZone) => void
  deleteZone: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const MOCK_ZONES: PriorityZone[] = [
  { id: 'z1', name: 'Centro Histórico (Risco)', lat: 45, lng: 55, radius: 8 },
  { id: 'z2', name: 'Distrito Industrial Sul', lat: 75, lng: 30, radius: 12 },
]

const generateMockVisits = (): Visit[] => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  return [
    {
      id: 'v1',
      salesmanId: 's1',
      salesmanName: 'Pedro Vendedor',
      company: 'Agro Sul LTDA',
      contact: 'Carlos',
      phone: '11999998888',
      address: 'Rodovia BR-116, Km 45',
      region: 'Sul',
      reason: 'prospeccao',
      interest: 'alto',
      products: { 'Carvão Ativado Granulado': 2, 'Resina Aniônica Forte': 1 },
      notes: 'Cliente muito interessado para a próxima safra.',
      timestamp: today.toISOString(),
      status: 'synced',
      priority: true,
      approvalStatus: 'pending',
      lat: 76,
      lng: 31,
    },
    {
      id: 'v2',
      salesmanId: 's2',
      salesmanName: 'Maria Vendedora',
      company: 'Química Norte',
      contact: 'Ana',
      phone: '11977776666',
      address: 'Av. das Indústrias, 100',
      region: 'Norte',
      reason: 'fechamento',
      interest: 'alto',
      products: { 'Areia Filtrante': 5 },
      notes: 'Fechamos pedido de 5 ton.',
      timestamp: yesterday.toISOString(),
      status: 'synced',
      priority: false,
      approvalStatus: 'approved',
      lat: 20,
      lng: 80,
    },
  ]
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('carbosul-visits')
    return saved ? JSON.parse(saved) : generateMockVisits()
  })

  const [zones, setZones] = useState<PriorityZone[]>(() => {
    const saved = localStorage.getItem('carbosul-zones')
    return saved ? JSON.parse(saved) : MOCK_ZONES
  })

  useEffect(() => {
    localStorage.setItem('carbosul-visits', JSON.stringify(visits))
  }, [visits])

  useEffect(() => {
    localStorage.setItem('carbosul-zones', JSON.stringify(zones))
  }, [zones])

  const addVisit = (visit: Visit) => setVisits((prev) => [visit, ...prev])
  const syncVisits = () =>
    setVisits((prev) => prev.map((v) => (v.status === 'pending' ? { ...v, status: 'synced' } : v)))

  const updateApproval = (id: string, status: 'approved' | 'needs_review', comment?: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, approvalStatus: status, managerComment: comment } : v,
      ),
    )
  }

  const addZone = (zone: PriorityZone) => setZones((prev) => [...prev, zone])
  const deleteZone = (id: string) => setZones((prev) => prev.filter((z) => z.id !== id))

  return React.createElement(
    DataContext.Provider,
    { value: { visits, zones, addVisit, syncVisits, updateApproval, addZone, deleteZone } },
    children,
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
