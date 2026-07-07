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
