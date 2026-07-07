import pb from '@/lib/pocketbase/client'

export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
  user_id?: string
  cep?: string
  state?: string
  region?: string
  created: string
  updated: string
}

export const getZones = () =>
  pb.collection('zones').getFullList({ sort: '-created' }) as Promise<Zone[]>
export const getZonesByUserId = (userId: string) =>
  pb.collection('zones').getFullList({
    filter: `user_id = "${userId}"`,
    sort: 'name',
  }) as Promise<Zone[]>
export const createZone = (data: any) => pb.collection('zones').create(data)
export const updateZone = (id: string, data: any) => pb.collection('zones').update(id, data)
export const deleteZone = (id: string) => pb.collection('zones').delete(id)
