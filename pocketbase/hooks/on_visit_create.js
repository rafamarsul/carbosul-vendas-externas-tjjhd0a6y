onRecordCreate((e) => {
  const visit = e.record
  const lat = visit.getFloat('lat')
  const lng = visit.getFloat('lng')
  const userId = visit.getString('user_id')

  if (!lat || !lng || !userId) {
    return e.next()
  }

  let zones = []
  try {
    zones = $app.findRecordsByFilter('zones', `user_id = '${userId}'`, '-created', 100, 0)
  } catch (err) {
    // Expected to throw if no rows in result set
  }

  if (zones.length === 0) {
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

  for (const zone of zones) {
    const zLat = zone.getFloat('lat')
    const zLng = zone.getFloat('lng')
    const zRadius = zone.getFloat('radius')
    const dist = calculateRealDistance(lat, lng, zLat, zLng)
    if (dist < minDistance) {
      minDistance = dist
      closestZone = zone
    }
  }

  if (closestZone && minDistance > closestZone.getFloat('radius')) {
    visit.set('approval_status', 'needs_review')
    visit.set(
      'manager_comment',
      `Out of Range. Distance: ${minDistance.toFixed(2)}km. Max radius: ${closestZone.getFloat('radius').toFixed(2)}km`,
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
