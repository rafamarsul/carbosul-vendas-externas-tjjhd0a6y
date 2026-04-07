export function generateGoogleCalendarUrl(event: {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
}) {
  const formatDateTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '')
  }

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.append('action', 'TEMPLATE')
  url.searchParams.append('text', event.title)
  url.searchParams.append('details', event.description)
  url.searchParams.append('location', event.location)
  url.searchParams.append(
    'dates',
    `${formatDateTime(event.startDate)}/${formatDateTime(event.endDate)}`,
  )

  return url.toString()
}

export function generateAndDownloadICS(
  events: {
    title: string
    description: string
    location: string
    startDate: Date
    endDate: Date
  }[],
  filename: string = 'agenda.ics',
) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Carbosul CRM//PT\n'

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '')
  }

  for (const event of events) {
    ics += 'BEGIN:VEVENT\n'
    ics += `DTSTART:${formatDate(event.startDate)}\n`
    ics += `DTEND:${formatDate(event.endDate)}\n`
    ics += `SUMMARY:${event.title}\n`
    ics += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`
    ics += `LOCATION:${event.location}\n`
    ics += 'END:VEVENT\n'
  }

  ics += 'END:VCALENDAR'

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
