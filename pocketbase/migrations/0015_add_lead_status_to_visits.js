migrate(
  (app) => {
    const visitsCol = app.findCollectionByNameOrId('visits')
    if (!visitsCol.fields.getByName('lead_status')) {
      visitsCol.fields.add(
        new SelectField({
          name: 'lead_status',
          values: ['Qualificado', 'Não Qualificado', 'Em Análise'],
          maxSelect: 1,
        }),
      )
    }
    app.save(visitsCol)
  },
  (app) => {
    const visitsCol = app.findCollectionByNameOrId('visits')
    const field = visitsCol.fields.getByName('lead_status')
    if (field) {
      visitsCol.fields.remove(field)
    }
    app.save(visitsCol)
  },
)
