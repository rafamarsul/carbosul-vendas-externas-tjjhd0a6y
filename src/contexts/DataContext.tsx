import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

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

  useEffect(() => {
    if (!user) {
      setVisits([])
      setZones([])
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)

      const { data: zonesData } = await supabase.from('zones').select('*')
      if (zonesData) {
        setZones(
          zonesData.map((z) => ({
            id: z.id,
            name: z.name,
            lat: z.lat,
            lng: z.lng,
            radius: z.radius,
          })),
        )
      }

      const { data: visitsData } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: false })
      if (visitsData) {
        setVisits(
          visitsData.map((v) => ({
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
            timestamp: v.created_at,
            status: v.status as 'synced' | 'pending',
            priority: v.priority,
            approvalStatus: v.approval_status as 'pending' | 'approved' | 'needs_review',
            managerComment: v.manager_comment,
            lat: v.lat,
            lng: v.lng,
          })),
        )
      }
      setLoading(false)
    }

    fetchData()

    const visitsSub = supabase
      .channel('visits-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, () => {
        fetchData()
      })
      .subscribe()

    const zonesSub = supabase
      .channel('zones-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      visitsSub.unsubscribe()
      zonesSub.unsubscribe()
    }
  }, [user])

  const addVisit = async (visit: Visit) => {
    setVisits((prev) => [visit, ...prev])
    await supabase.from('visits').insert({
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
    await supabase
      .from('visits')
      .update({
        approval_status: status,
        manager_comment: comment,
      })
      .eq('id', id)
  }

  const addZone = async (zone: PriorityZone) => {
    setZones((prev) => [...prev, zone])
    await supabase.from('zones').insert({
      name: zone.name,
      lat: zone.lat,
      lng: zone.lng,
      radius: zone.radius,
    })
  }

  const deleteZone = async (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
    await supabase.from('zones').delete().eq('id', id)
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
