onRecordCreate((e) => {
  const visit = e.record
  const lat = visit.getFloat('lat')
  const lng = visit.getFloat('lng')
  const userId = visit.getString('user_id')

  if (!lat || !lng || !userId) {
    return e.next()
  }

  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayStr = days[now.getDay()]

  // Calculate cycle week 1-4 based on epoch weeks
  // Jan 1 1970 was Thursday. Offset by 4 days so week starts on Monday.
  const epochDays = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60000) / (1000 * 60 * 60 * 24),
  )
  const epochWeeks = Math.floor((epochDays + 3) / 7)
  const cycleWeek = (epochWeeks % 4) + 1

  let assignedZone = null
  let minDistance = Infinity
  let closestZone = null

  // 1. Try to find if there is a scheduled zone for today
  try {
    const schedule = $app.findFirstRecordByFilter(
      'schedules',
      `user_id = '${userId}' && week_number = ${cycleWeek} && day_of_week = '${dayStr}'`,
    )
    if (schedule) {
      const zoneId = schedule.getString('zone_id')
      assignedZone = $app.findRecordById('zones', zoneId)
    }
  } catch (err) {}

  let zones = []
  try {
    zones = $app.findRecordsByFilter('zones', `user_id = '${userId}'`, '-created', 100, 0)
  } catch (err) {}

  if (zones.length === 0 && !assignedZone) {
    return e.next()
  }

  function calculateRealDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  let minDistance = Infinity
  let closestZone = null

  // If assigned zone exists, we only validate against it
  if (assignedZone) {
    closestZone = assignedZone
    minDistance = calculateRealDistance(
      lat,
      lng,
      assignedZone.getFloat('lat'),
      assignedZone.getFloat('lng'),
    )
  } else {
    for (const zone of zones) {
      const zLat = zone.getFloat('lat')
      const zLng = zone.getFloat('lng')
      const dist = calculateRealDistance(lat, lng, zLat, zLng)
      if (dist < minDistance) {
        minDistance = dist
        closestZone = zone
      }
    }
  }

  if (closestZone && minDistance > closestZone.getFloat('radius')) {
    visit.set('approval_status', 'needs_review')
    visit.set(
      'manager_comment',
      assignedZone
        ? `Out of Scheduled Zone (${closestZone.getString('name')}). Distance: ${minDistance.toFixed(2)}km.`
        : `Out of Range. Distance: ${minDistance.toFixed(2)}km. Max radius: ${closestZone.getFloat('radius').toFixed(2)}km`,
    )
    visit.set('priority', true)

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const auditRec = new Record(auditCol)
      auditRec.set('user', userId)
      auditRec.set('action', 'Visit Out of Range')
      auditRec.set('ip_address', 'System')
      $app.saveNoValidate(auditRec)
    } catch (err) {
      $app.logger().error('Failed to create audit log', 'error', String(err))
    }
  }

  e.next()
}, 'visits')
