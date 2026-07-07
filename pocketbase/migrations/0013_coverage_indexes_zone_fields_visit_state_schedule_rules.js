migrate(
  (app) => {
    const coverageCol = app.findCollectionByNameOrId('coverage_areas')
    coverageCol.addIndex('idx_coverage_areas_active', false, 'active', '')
    coverageCol.addIndex('idx_coverage_areas_region', false, 'region', '')
    app.save(coverageCol)

    const zonesCol = app.findCollectionByNameOrId('zones')
    if (!zonesCol.fields.getByName('state')) {
      zonesCol.fields.add(new SelectField({ name: 'state', values: ['SC', 'RS'], maxSelect: 1 }))
    }
    if (!zonesCol.fields.getByName('region')) {
      zonesCol.fields.add(
        new SelectField({
          name: 'region',
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
        }),
      )
    }
    app.save(zonesCol)

    const visitsCol = app.findCollectionByNameOrId('visits')
    if (!visitsCol.fields.getByName('state')) {
      visitsCol.fields.add(new SelectField({ name: 'state', values: ['SC', 'RS'], maxSelect: 1 }))
    }
    app.save(visitsCol)

    const schedulesCol = app.findCollectionByNameOrId('schedules')
    schedulesCol.createRule = "@request.auth.id != ''"
    schedulesCol.updateRule = "@request.auth.role = 'manager' || user_id = @request.auth.id"
    app.save(schedulesCol)
  },
  (app) => {
    const coverageCol = app.findCollectionByNameOrId('coverage_areas')
    coverageCol.removeIndex('idx_coverage_areas_active')
    coverageCol.removeIndex('idx_coverage_areas_region')
    app.save(coverageCol)

    const schedulesCol = app.findCollectionByNameOrId('schedules')
    schedulesCol.createRule = "@request.auth.role = 'manager'"
    schedulesCol.updateRule = "@request.auth.role = 'manager'"
    app.save(schedulesCol)
  },
)
