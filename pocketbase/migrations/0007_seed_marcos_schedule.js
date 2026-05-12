migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let marcos
    try {
      marcos = app.findAuthRecordByEmail('_pb_users_auth_', 'marcos.santos@carbosul.com.br')
    } catch (_) {
      marcos = new Record(users)
      marcos.setEmail('marcos.santos@carbosul.com.br')
      marcos.setPassword('Skip@Pass')
      marcos.setVerified(true)
      marcos.set('name', 'Marcos Santos')
      marcos.set('role', 'sales')
      app.save(marcos)
    }

    const zonesCol = app.findCollectionByNameOrId('zones')
    const zonesToSeed = [
      { name: 'Zona Norte (Semana 1)', lat: -23.49, lng: -46.62, radius: 5, cep: '02000-000' },
      { name: 'Zona Sul (Semana 2)', lat: -23.65, lng: -46.7, radius: 5, cep: '04000-000' },
      { name: 'Zona Leste (Semana 3)', lat: -23.54, lng: -46.54, radius: 5, cep: '03000-000' },
      { name: 'Zona Oeste (Semana 4)', lat: -23.53, lng: -46.68, radius: 5, cep: '05000-000' },
    ]

    const zoneRecords = []
    for (const z of zonesToSeed) {
      let rec
      try {
        rec = app.findFirstRecordByData('zones', 'name', z.name)
      } catch (_) {
        rec = new Record(zonesCol)
        rec.set('name', z.name)
        rec.set('lat', z.lat)
        rec.set('lng', z.lng)
        rec.set('radius', z.radius)
        rec.set('cep', z.cep)
        rec.set('user_id', marcos.id)
        app.save(rec)
      }
      zoneRecords.push(rec)
    }

    const schedulesCol = app.findCollectionByNameOrId('schedules')
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    for (let week = 1; week <= 4; week++) {
      for (const day of days) {
        const zone = zoneRecords[week - 1]
        try {
          app.findFirstRecordByFilter(
            'schedules',
            `user_id = '${marcos.id}' && week_number = ${week} && day_of_week = '${day}'`,
          )
        } catch (_) {
          const sch = new Record(schedulesCol)
          sch.set('user_id', marcos.id)
          sch.set('week_number', week)
          sch.set('day_of_week', day)
          sch.set('zone_id', zone.id)
          sch.set('notes', 'Rota padrão')
          app.save(sch)
        }
      }
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'marcos.santos@carbosul.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
