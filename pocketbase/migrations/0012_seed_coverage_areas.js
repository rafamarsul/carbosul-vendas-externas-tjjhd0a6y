migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('coverage_areas')

    let marcosId = ''
    try {
      const marcos = app.findFirstRecordByData('users', 'email', 'marcos@carbosul.com')
      marcosId = marcos.id
    } catch (_) {
      try {
        const marcos = app.findFirstRecordByData('users', 'email', 'rafamarsul@gmail.com')
        marcosId = marcos.id
      } catch (_) {
        return
      }
    }

    const seeds = [
      { city: 'Florianópolis', state: 'SC', region: 'Grande Florianópolis', active: true },
      { city: 'São José', state: 'SC', region: 'Grande Florianópolis', active: true },
      { city: 'Blumenau', state: 'SC', region: 'Vale do Itajaí', active: true },
      { city: 'Joinville', state: 'SC', region: 'Planalto', active: false },
      { city: 'Porto Alegre', state: 'RS', region: 'Capital', active: true },
      { city: 'Caxias do Sul', state: 'RS', region: 'Grande POA', active: false },
      { city: 'Passo Fundo', state: 'RS', region: 'Planalto', active: true },
      { city: 'Santo Ângelo', state: 'RS', region: 'Missões', active: false },
    ]

    seeds.forEach((s) => {
      try {
        app.findFirstRecordByData('coverage_areas', 'city', s.city)
      } catch (_) {
        const record = new Record(col)
        record.set('user_id', marcosId)
        record.set('city', s.city)
        record.set('state', s.state)
        record.set('region', s.region)
        record.set('active', s.active)
        app.save(record)
      }
    })
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('coverage_areas')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
