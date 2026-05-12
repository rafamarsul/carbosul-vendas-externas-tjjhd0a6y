migrate(
  (app) => {
    const collection = new Collection({
      name: 'schedules',
      type: 'base',
      listRule: "@request.auth.role = 'manager' || user_id = @request.auth.id",
      viewRule: "@request.auth.role = 'manager' || user_id = @request.auth.id",
      createRule: "@request.auth.role = 'manager'",
      updateRule: "@request.auth.role = 'manager'",
      deleteRule: "@request.auth.role = 'manager'",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'week_number', type: 'number', required: true, min: 1, max: 4 },
        {
          name: 'day_of_week',
          type: 'select',
          required: true,
          values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          maxSelect: 1,
        },
        {
          name: 'zone_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('zones').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('schedules')
    app.delete(collection)
  },
)
