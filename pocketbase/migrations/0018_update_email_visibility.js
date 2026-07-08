migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const emailField = users.fields.getByName('email')
    if (!emailField) {
      throw new Error('Email field not found in users collection')
    }
    // Ensure email field is NOT hidden so the onRecordEnrich hook
    // can manage field-level visibility.
    // Effective rule: (@request.auth.role = 'manager' || id = @request.auth.id)
    emailField.hidden = false
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const emailField = users.fields.getByName('email')
    if (!emailField) {
      throw new Error('Email field not found in users collection')
    }
    // Rollback: hide email field entirely.
    // Only owner can see their own email via collection-level viewRule
    // (id = @request.auth.id). The enrich hook becomes ineffective
    // because the field is hidden at the schema level.
    emailField.hidden = true
    app.save(users)
  },
)
