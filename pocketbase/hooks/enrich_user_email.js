onRecordEnrich((e) => {
  const auth = e.auth
  if (!auth) {
    e.record.set('email', '')
    return e.next()
  }
  if (e.hasSuperuserAuth() || auth.getString('role') === 'manager' || e.record.id === auth.id) {
    return e.next()
  }
  e.record.set('email', '')
  return e.next()
}, 'users')
