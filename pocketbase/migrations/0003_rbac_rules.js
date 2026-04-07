migrate(
  (app) => {
    // Update Users collection rules
    const users = app.findCollectionByNameOrId('users')
    users.listRule = "@request.auth.role = 'manager' || id = @request.auth.id"
    users.viewRule = "@request.auth.role = 'manager' || id = @request.auth.id"
    app.save(users)

    // Update Audit Logs collection rules
    const auditLogs = app.findCollectionByNameOrId('audit_logs')
    auditLogs.listRule = "@request.auth.role = 'manager'"
    auditLogs.viewRule = "@request.auth.role = 'manager'"
    app.save(auditLogs)

    // Update Visits collection rules
    const visits = app.findCollectionByNameOrId('visits')
    visits.listRule = "@request.auth.role = 'manager' || user_id = @request.auth.id"
    visits.viewRule = "@request.auth.role = 'manager' || user_id = @request.auth.id"
    visits.updateRule = "@request.auth.role = 'manager' || user_id = @request.auth.id"
    visits.deleteRule = "@request.auth.role = 'manager' || user_id = @request.auth.id"
    app.save(visits)
  },
  (app) => {
    // Revert Users collection rules
    const users = app.findCollectionByNameOrId('users')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    app.save(users)

    // Revert Audit Logs collection rules
    const auditLogs = app.findCollectionByNameOrId('audit_logs')
    auditLogs.listRule = "@request.auth.id != ''"
    auditLogs.viewRule = "@request.auth.id != ''"
    app.save(auditLogs)

    // Revert Visits collection rules
    const visits = app.findCollectionByNameOrId('visits')
    visits.listRule = "@request.auth.id != ''"
    visits.viewRule = "@request.auth.id != ''"
    visits.updateRule = "@request.auth.id != ''"
    visits.deleteRule = "@request.auth.id != ''"
    app.save(visits)
  },
)
