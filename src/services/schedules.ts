import pb from '@/lib/pocketbase/client'

export const getSchedules = () =>
  pb.collection('schedules').getFullList({ expand: 'zone_id,user_id' })
export const getMySchedules = (userId: string) =>
  pb.collection('schedules').getFullList({ filter: `user_id = '${userId}'`, expand: 'zone_id' })
export const getWeekSchedules = (userId: string, weekNumber: number) =>
  pb.collection('schedules').getFullList({
    filter: `user_id = '${userId}' && week_number = ${weekNumber} && (day_of_week = 'Monday' || day_of_week = 'Tuesday' || day_of_week = 'Wednesday' || day_of_week = 'Thursday' || day_of_week = 'Friday')`,
    expand: 'zone_id',
    sort: 'day_of_week',
  })
export const createSchedule = (data: any) => pb.collection('schedules').create(data)
export const updateSchedule = (id: string, data: any) => pb.collection('schedules').update(id, data)
export const deleteSchedule = (id: string) => pb.collection('schedules').delete(id)
