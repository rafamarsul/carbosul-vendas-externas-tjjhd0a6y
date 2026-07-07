migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // 1. Remove redundant/duplicate account: marcos.santos@carbosul.com.br
    try {
      const redundantUser = app.findAuthRecordByEmail('users', 'marcos.santos@carbosul.com.br')
      app.delete(redundantUser)
    } catch (_) {}

    // Helper: idempotent user creation
    const seedUser = (email, name, role) => {
      try {
        app.findAuthRecordByEmail('users', email)
        return // already exists
      } catch (_) {}
      const record = new Record(users)
      record.setEmail(email)
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', name)
      record.set('role', role)
      app.save(record)
    }

    // 2. New User Creation (Manager): Daniel
    seedUser('danielcarbosul@gmail.com', 'Daniel', 'manager')

    // 3. New User Creation (Sales): Andre Felipe
    seedUser('andrecarbosul@gmail.com', 'Andre Felipe', 'sales')

    // 4. New User Creation (Sales): Daniela Petry
    seedUser('danielapetrycarbosul@gmail.com', 'Daniela Petry', 'sales')

    // 5. New User Creation (Sales): Marcos Muller
    seedUser('marcosmullercarbosul@gmail.com', 'Marcos Muller', 'sales')
  },
  (app) => {
    // Down migration: remove seeded users
    const emailsToRemove = [
      'danielcarbosul@gmail.com',
      'andrecarbosul@gmail.com',
      'danielapetrycarbosul@gmail.com',
      'marcosmullercarbosul@gmail.com',
    ]
    for (const email of emailsToRemove) {
      try {
        const record = app.findAuthRecordByEmail('users', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
