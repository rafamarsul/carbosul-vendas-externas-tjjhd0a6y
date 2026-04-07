migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({ name: 'role', values: ['manager', 'sales'], maxSelect: 1 }),
      )
    }
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    app.save(users)

    const auditLogs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'user', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'action', type: 'text', required: true },
        { name: 'ip_address', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(auditLogs)

    const visits = new Collection({
      name: 'visits',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: false,
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'salesman_name', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'contact', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'reason', type: 'text' },
        { name: 'interest', type: 'text' },
        { name: 'products', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'priority', type: 'bool' },
        { name: 'approval_status', type: 'text' },
        { name: 'manager_comment', type: 'text' },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(visits)

    const zones = new Collection({
      name: 'zones',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'lat', type: 'number', required: true },
        { name: 'lng', type: 'number', required: true },
        { name: 'radius', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(zones)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('zones'))
    app.delete(app.findCollectionByNameOrId('visits'))
    app.delete(app.findCollectionByNameOrId('audit_logs'))
  },
)
