migrate(
  (app) => {
    const zonesCol = app.findCollectionByNameOrId('zones')

    const emailToZones = {
      'marcoscarbosul@gmail.com': [
        { name: 'São José - SC', lat: -27.6153, lng: -48.6392 },
        { name: 'Palhoça - SC', lat: -27.6496, lng: -48.6689 },
        { name: 'Biguaçu - SC', lat: -27.5956, lng: -48.7539 },
        { name: 'Santo Amaro da Imperatriz - SC', lat: -27.6897, lng: -48.7836 },
        { name: 'Canelinha - SC', lat: -27.3783, lng: -48.6883 },
        { name: 'São João Batista - SC', lat: -27.4447, lng: -48.6619 },
        { name: 'Nova Trento - SC', lat: -27.2619, lng: -49.0186 },
        { name: 'Brusque - SC', lat: -27.0985, lng: -48.9178 },
        { name: 'Blumenau - SC', lat: -26.9194, lng: -49.0661 },
        { name: 'Gaspar - SC', lat: -26.9319, lng: -48.9583 },
        { name: 'Itajaí - SC', lat: -26.9078, lng: -48.8261 },
        { name: 'Navegantes - SC', lat: -26.8989, lng: -48.8386 },
        { name: 'Balneário Camboriú - SC', lat: -26.9928, lng: -48.6347 },
        { name: 'Camboriú - SC', lat: -27.0306, lng: -48.6497 },
        { name: 'Itapema - SC', lat: -27.1219, lng: -48.6114 },
      ],
      'andrecarbosul@gmail.com': [
        { name: 'São José - SC', lat: -27.6153, lng: -48.6392 },
        { name: 'Tubarão - SC', lat: -28.4661, lng: -49.0069 },
        { name: 'Braço do Norte - SC', lat: -28.2756, lng: -49.1658 },
        { name: 'Içara - SC', lat: -28.7139, lng: -49.1347 },
        { name: 'Criciúma - SC', lat: -28.6772, lng: -49.3717 },
        { name: 'Morro da Fumaça - SC', lat: -28.7614, lng: -49.2408 },
        { name: 'Cocal do Sul - SC', lat: -28.5983, lng: -49.3317 },
        { name: 'São Ludgero - SC', lat: -28.2683, lng: -49.1889 },
        { name: 'Gravatal - SC', lat: -28.3186, lng: -49.0556 },
        { name: 'Orleans - SC', lat: -28.3589, lng: -49.2908 },
        { name: 'Lauro Müller - SC', lat: -28.3939, lng: -49.4019 },
      ],
      'danielapetrycarbosul@gmail.com': [
        { name: 'Santa Rosa - RS', lat: -27.8708, lng: -54.4658 },
        { name: 'Santo Cristo - RS', lat: -27.8264, lng: -54.8064 },
        { name: 'Giruá - RS', lat: -28.0306, lng: -54.3456 },
        { name: 'Horizontina - RS', lat: -27.6228, lng: -54.3181 },
        { name: 'Santo Ângelo - RS', lat: -28.2956, lng: -54.2614 },
        { name: 'Entre Ijuís - RS', lat: -28.3883, lng: -54.2856 },
        { name: 'Ijuí - RS', lat: -28.3878, lng: -53.9147 },
        { name: 'Panambi - RS', lat: -28.2839, lng: -53.5064 },
        { name: 'Palmeira das Missões - RS', lat: -27.8986, lng: -53.3147 },
        { name: 'Santo Augusto - RS', lat: -27.8689, lng: -53.7789 },
        { name: 'Três de Maio - RS', lat: -27.7772, lng: -54.2389 },
        { name: 'Três Passos - RS', lat: -27.4564, lng: -53.9306 },
        { name: 'Frederico Westphalen - RS', lat: -27.3594, lng: -53.4219 },
      ],
      'marcosmullercarbosul@gmail.com': [
        { name: 'Porto Alegre - RS', lat: -30.0346, lng: -51.2177 },
        { name: 'Viamão - RS', lat: -30.0811, lng: -51.0233 },
        { name: 'Alvorada - RS', lat: -29.9919, lng: -51.0814 },
        { name: 'Guaíba - RS', lat: -30.1139, lng: -51.3258 },
        { name: 'Eldorado do Sul - RS', lat: -30.0256, lng: -51.3114 },
      ],
    }

    for (const email of Object.keys(emailToZones)) {
      let user
      try {
        user = app.findAuthRecordByEmail('users', email)
      } catch (_) {
        continue
      }

      for (const z of emailToZones[email]) {
        try {
          app.findFirstRecordByFilter(
            'zones',
            `name = '${z.name.replace(/'/g, "''")}' && user_id = '${user.id}'`,
          )
        } catch (_) {
          const record = new Record(zonesCol)
          record.set('name', z.name)
          record.set('user_id', user.id)
          record.set('lat', z.lat)
          record.set('lng', z.lng)
          record.set('radius', 30)
          record.set('cep', '')
          app.save(record)
        }
      }
    }
  },
  (app) => {
    const emails = [
      'marcoscarbosul@gmail.com',
      'andrecarbosul@gmail.com',
      'danielapetrycarbosul@gmail.com',
      'marcosmullercarbosul@gmail.com',
    ]

    for (const email of emails) {
      let user
      try {
        user = app.findAuthRecordByEmail('users', email)
      } catch (_) {
        continue
      }
      try {
        const records = app.findRecordsByFilter(
          'zones',
          `user_id = '${user.id}'`,
          '-created',
          500,
          0,
        )
        for (const rec of records) {
          const name = rec.getString('name')
          const lat = rec.get('lat')
          const lng = rec.get('lng')
          const isSeeded =
            (name.endsWith(' - SC') || name.endsWith(' - RS')) &&
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            rec.get('radius') === 30 &&
            rec.getString('cep') === ''
          if (isSeeded) {
            app.delete(rec)
          }
        }
      } catch (_) {}
    }
  },
)
