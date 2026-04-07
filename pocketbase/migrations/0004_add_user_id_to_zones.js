migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('zones')
    if (!col.fields.getByName('user_id')) {
      col.fields.add(
        new RelationField({
          name: 'user_id',
          collectionId: app.findCollectionByNameOrId('users').id,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('zones')
    col.fields.removeByName('user_id')
    app.save(col)
  },
)
