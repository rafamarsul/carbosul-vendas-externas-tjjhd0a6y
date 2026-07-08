export function getWeekOfMonth(date: Date = new Date()): number {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfMonth = date.getDate()
  return Math.ceil((dayOfMonth + startOfMonth.getDay()) / 7)
}

export function getCycleInfo(date: Date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayStr = days[date.getDay()]

  const epochDays = Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60000) / (1000 * 60 * 60 * 24),
  )
  const epochWeeks = Math.floor((epochDays + 3) / 7)
  const cycleWeek = (epochWeeks % 4) + 1

  return { dayStr, cycleWeek, dayLabel: getDayLabel(dayStr) }
}

export function getDayLabel(day: string) {
  const map: Record<string, string> = {
    Sunday: 'Domingo',
    Monday: 'Segunda',
    Tuesday: 'Terça',
    Wednesday: 'Quarta',
    Thursday: 'Quinta',
    Friday: 'Sexta',
    Saturday: 'Sábado',
  }
  return map[day] || day
}
