routerAdd('POST', '/backend/v1/log-failed-login', (e) => {
  const body = e.requestInfo().body || {}
  const email = body.email
  if (!email) return e.json(200, { success: true })

  try {
    const user = $app.findAuthRecordByEmail('users', email)
    const logCol = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(logCol)
    log.set('user', user.id)
    log.set('action', 'Login Failed')
    log.set('ip_address', e.request.remoteAddr)
    $app.save(log)
  } catch (_) {
    // Ignore if user not found since 'user' is a required relation by schema
  }
  return e.json(200, { success: true })
})
