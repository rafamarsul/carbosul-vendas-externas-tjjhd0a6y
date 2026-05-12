import pb from '@/lib/pocketbase/client'

export const getSchedules = () =>
  pb.collection('schedules').getFullList({ expand: 'zone_id,user_id' })
export const getMySchedules = (userId: string) =>
  pb.collection('schedules').getFullList({ filter: `user_id = '${userId}'`, expand: 'zone_id' })
export const createSchedule = (data: any) => pb.collection('schedules').create(data)
export const updateSchedule = (id: string, data: any) => pb.collection('schedules').update(id, data)
export const deleteSchedule = (id: string) => pb.collection('schedules').delete(id)
