migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('zones')
    if (!col.fields.getByName('cep')) {
      col.fields.add(new TextField({ name: 'cep' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('zones')
    col.fields.removeByName('cep')
    app.save(col)
  },
)
