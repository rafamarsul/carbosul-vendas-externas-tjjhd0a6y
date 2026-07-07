migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = "@request.auth.role = 'manager'"
    users.updateRule = "@request.auth.role = 'manager' || id = @request.auth.id"
    users.deleteRule = "@request.auth.role = 'manager' || id = @request.auth.id"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
