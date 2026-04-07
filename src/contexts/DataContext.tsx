import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from './AuthContext'
import { useRealtime } from '@/hooks/use-realtime'

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
  addVisit: (visit: Visit) => Promise<void>
  syncVisits: () => void
  updateApproval: (
    id: string,
    status: 'approved' | 'needs_review',
    comment?: string,
  ) => Promise<void>
  addZone: (zone: PriorityZone) => Promise<void>
  deleteZone: (id: string) => Promise<void>
  loading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [zones, setZones] = useState<PriorityZone[]>([])
  const [loading, setLoading] = useState(true)

  const fetchZones = async () => {
    try {
      const records = await pb.collection('zones').getFullList()
      setZones(
        records.map((z) => ({
          id: z.id,
          name: z.name,
          lat: z.lat,
          lng: z.lng,
          radius: z.radius,
        })),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const fetchVisits = async () => {
    try {
      const records = await pb.collection('visits').getFullList({ sort: '-created' })
      setVisits(
        records.map((v) => ({
          id: v.id,
          salesmanId: v.user_id,
          salesmanName: v.salesman_name,
          company: v.company,
          contact: v.contact,
          phone: v.phone,
          address: v.address,
          region: v.region,
          reason: v.reason,
          interest: v.interest,
          products: v.products as Record<string, number>,
          notes: v.notes,
          timestamp: v.created,
          status: v.status as 'synced' | 'pending',
          priority: v.priority,
          approvalStatus: v.approval_status as 'pending' | 'approved' | 'needs_review',
          managerComment: v.manager_comment,
          lat: v.lat,
          lng: v.lng,
        })),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchZones(), fetchVisits()])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) {
      setVisits([])
      setZones([])
      setLoading(false)
      return
    }
    loadData()
  }, [user])

  useRealtime(
    'visits',
    () => {
      if (user) fetchVisits()
    },
    !!user,
  )
  useRealtime(
    'zones',
    () => {
      if (user) fetchZones()
    },
    !!user,
  )

  const addVisit = async (visit: Visit) => {
    setVisits((prev) => [visit, ...prev])
    try {
      await pb.collection('visits').create({
        user_id: user?.id,
        salesman_name: visit.salesmanName,
        company: visit.company,
        contact: visit.contact,
        phone: visit.phone,
        address: visit.address,
        region: visit.region,
        reason: visit.reason,
        interest: visit.interest,
        products: visit.products,
        notes: visit.notes,
        status: 'synced',
        priority: visit.priority,
        approval_status: visit.approvalStatus,
        lat: visit.lat,
        lng: visit.lng,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const syncVisits = () => {}

  const updateApproval = async (
    id: string,
    status: 'approved' | 'needs_review',
    comment?: string,
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, approvalStatus: status, managerComment: comment } : v,
      ),
    )
    try {
      await pb.collection('visits').update(id, {
        approval_status: status,
        manager_comment: comment,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const addZone = async (zone: PriorityZone) => {
    setZones((prev) => [...prev, zone])
    try {
      await pb.collection('zones').create({
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        radius: zone.radius,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const deleteZone = async (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
    try {
      await pb.collection('zones').delete(id)
    } catch (e) {
      console.error(e)
    }
  }

  return React.createElement(
    DataContext.Provider,
    {
      value: { visits, zones, addVisit, syncVisits, updateApproval, addZone, deleteZone, loading },
    },
    children,
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
