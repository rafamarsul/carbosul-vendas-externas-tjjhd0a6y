migrate(
  (app) => {
    const updatedRegions = [
      'Grande Florianópolis',
      'Vale do Itajaí',
      'Vale do Tijucas',
      'Litoral Norte',
      'Sul',
      'Missões',
      'Planalto',
      'Capital',
      'Grande POA',
    ]

    const coverageCol = app.findCollectionByNameOrId('coverage_areas')
    coverageCol.fields.removeByName('region')
    coverageCol.fields.add(
      new SelectField({
        name: 'region',
        required: false,
        values: updatedRegions,
        maxSelect: 1,
      }),
    )
    app.save(coverageCol)

    const zonesCol = app.findCollectionByNameOrId('zones')
    zonesCol.fields.removeByName('region')
    zonesCol.fields.add(
      new SelectField({
        name: 'region',
        required: false,
        values: updatedRegions,
        maxSelect: 1,
      }),
    )
    app.save(zonesCol)
  },
  (app) => {
    const originalRegions = [
      'Grande Florianópolis',
      'Vale do Itajaí',
      'Litoral Norte',
      'Sul',
      'Missões',
      'Planalto',
      'Capital',
      'Grande POA',
    ]

    const coverageCol = app.findCollectionByNameOrId('coverage_areas')
    coverageCol.fields.removeByName('region')
    coverageCol.fields.add(
      new SelectField({
        name: 'region',
        required: false,
        values: originalRegions,
        maxSelect: 1,
      }),
    )
    app.save(coverageCol)

    const zonesCol = app.findCollectionByNameOrId('zones')
    zonesCol.fields.removeByName('region')
    zonesCol.fields.add(
      new SelectField({
        name: 'region',
        required: false,
        values: originalRegions,
        maxSelect: 1,
      }),
    )
    app.save(zonesCol)
  },
)
