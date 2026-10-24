export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const version = getRouterParam(event, 'version')

  const db = hubDatabase()
  const row = await db
    .prepare(`SELECT v.id AS version_id, v.r2_key, p.id AS plugin_id
              FROM plugin_versions v
              JOIN plugins p ON p.id = v.plugin_id
              WHERE p.slug = ? AND v.version = ? AND p.status = 'active'`)
    .bind(slug, version)
    .first<{ version_id: number, r2_key: string, plugin_id: number }>()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Release not found' })
  }

  const blob = await hubBlob().get(row.r2_key)
  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'Archive missing' })
  }

  await db.batch([
    db.prepare('UPDATE plugins SET downloads = downloads + 1 WHERE id = ?').bind(row.plugin_id),
    db.prepare('UPDATE plugin_versions SET downloads = downloads + 1 WHERE id = ?').bind(row.version_id)
  ])

  setHeader(event, 'content-type', 'application/zip')
  setHeader(event, 'content-disposition', `attachment; filename="${slug}-${version}.zip"`)
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return blob
})
