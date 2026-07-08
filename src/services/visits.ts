import pb from '@/lib/pocketbase/client'

export interface VisitData {
  user_id: string
  salesman_name?: string
  company?: string
  contact?: string
  phone?: string
  address?: string
  region?: string
  reason?: string
  interest?: string
  products?: unknown
  notes?: string
  status?: string
  lead_status?: string
  priority?: boolean
  lat?: number
  lng?: number
  state?: string
}

export const createVisit = (data: VisitData) => pb.collection('visits').create(data)

export const getVisits = (filter?: string) =>
  pb.collection('visits').getFullList({
    sort: '-created',
    filter: filter || '',
    expand: 'user_id',
  })

export const getVisit = (id: string) => pb.collection('visits').getOne(id, { expand: 'user_id' })

export const updateVisit = (id: string, data: Partial<VisitData>) =>
  pb.collection('visits').update(id, data)

export const deleteVisit = (id: string) => pb.collection('visits').delete(id)

export const getVisitsByDateAndUser = (dateStr: string, userId?: string) => {
  const start = `${dateStr} 00:00:00`
  const end = `${dateStr} 23:59:59`
  let filter = `created >= "${start}" && created <= "${end}"`
  if (userId && userId !== 'all') {
    filter += ` && user_id = "${userId}"`
  }
  return pb.collection('visits').getFullList({
    sort: 'created',
    filter,
    expand: 'user_id',
  })
}
