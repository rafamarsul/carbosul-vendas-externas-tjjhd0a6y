migrate(
  (app) => {
    const collection = new Collection({
      name: 'coverage_areas',
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
        { name: 'city', type: 'text', required: true },
        {
          name: 'state',
          type: 'select',
          required: true,
          values: ['SC', 'RS'],
          maxSelect: 1,
        },
        {
          name: 'region',
          type: 'select',
          required: false,
          values: [
            'Grande Florianópolis',
            'Vale do Itajaí',
            'Litoral Norte',
            'Sul',
            'Missões',
            'Planalto',
            'Capital',
            'Grande POA',
          ],
          maxSelect: 1,
        },
        { name: 'active', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_coverage_areas_user_id ON coverage_areas (user_id)',
        'CREATE INDEX idx_coverage_areas_state ON coverage_areas (state)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('coverage_areas')
    app.delete(collection)
  },
)
