import pb from '@/lib/pocketbase/client'

export const getUsers = () => pb.collection('users').getFullList({ sort: '-created' })
export const createUser = (data: any) => pb.collection('users').create(data)
