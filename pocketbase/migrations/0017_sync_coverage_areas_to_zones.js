migrate(
  (app) => {
    const zonesCol = app.findCollectionByNameOrId('zones')

    let activeAreas = []
    try {
      activeAreas = app.findRecordsByFilter('coverage_areas', 'active = true', '-created', 1000, 0)
    } catch (_) {
      console.log('[sync] No coverage_areas collection found or no records returned')
      return
    }

    let created = 0
    let updated = 0
    let conflicts = 0

    for (const area of activeAreas) {
      const city = area.getString('city')
      const state = area.getString('state')
      const userId = area.getString('user_id')

      if (!city || !state || !userId) continue

      const zoneName = city + ' - ' + state

      let existing = null
      try {
        existing = app.findFirstRecordByFilter(
          'zones',
          "name = '" + zoneName.replace(/'/g, "''") + "'",
        )
      } catch (_) {}

      if (existing) {
        const existingUserId = existing.getString('user_id')
        if (existingUserId !== userId) {
          console.log(
            '[sync] Conflict on "' +
              zoneName +
              '": existing user ' +
              existingUserId +
              ' -> new user ' +
              userId,
          )
          conflicts++
          existing.set('user_id', userId)
          app.save(existing)
          updated++
        }
      } else {
        const record = new Record(zonesCol)
        record.set('name', zoneName)
        record.set('user_id', userId)
        record.set('lat', -27.0)
        record.set('lng', -50.0)
        record.set('radius', 30000)
        record.set('cep', '')
        app.save(record)
        created++
      }
    }

    console.log(
      '[sync] Coverage areas to zones migration complete — created: ' +
        created +
        ', updated: ' +
        updated +
        ', conflicts: ' +
        conflicts,
    )
  },
  (app) => {
    let toDelete = []
    try {
      toDelete = app.findRecordsByFilter(
        'zones',
        'cep = "" &amp;&amp; radius = 30000',
        '-created',
        5000,
        0,
      )
    } catch (_) {
      console.log('[sync] No synced zones found to delete during rollback')
      return
    }

    let deleted = 0
    for (const record of toDelete) {
      try {
        app.delete(record)
        deleted++
      } catch (_) {}
    }

    console.log('[sync] Rollback complete — deleted ' + deleted + ' synced zones')
  },
)
