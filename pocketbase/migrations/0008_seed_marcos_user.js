migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Idempotent: skip if user already exists
    try {
      app.findAuthRecordByEmail('users', 'marcoscarbosul@gmail.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('marcoscarbosul@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Marcos Santos')
    record.set('role', 'sales')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'marcoscarbosul@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
