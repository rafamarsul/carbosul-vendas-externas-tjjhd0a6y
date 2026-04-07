import pb from '@/lib/pocketbase/client'

export const getZones = () => pb.collection('zones').getFullList({ sort: '-created' })
export const createZone = (data: any) => pb.collection('zones').create(data)
export const deleteZone = (id: string) => pb.collection('zones').delete(id)
