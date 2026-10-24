export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')

  const db = hubDatabase()
  const plugin = await db
    .prepare("SELECT id, author_user_id FROM plugins WHERE slug = ? AND status = 'active'")
    .bind(slug)
    .first<{ id: number, author_user_id: number }>()
  if (!plugin) {
    throw createError({ statusCode: 404, statusMessage: 'Plugin not found' })
  }
  if (plugin.author_user_id !== user.id && !user.admin) {
    throw createError({ statusCode: 403, statusMessage: 'Only the plugin author can publish new versions' })
  }

  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "file" field (zip archive)' })
  }

  const parsed = parsePluginArchive(new Uint8Array(file.data))
  const { manifest } = parsed

  if (manifest.id !== slug) {
    throw createError({ statusCode: 422, statusMessage: `manifest id "${manifest.id}" does not match plugin "${slug}"` })
  }

  const duplicate = await db
    .prepare('SELECT id FROM plugin_versions WHERE plugin_id = ? AND version = ?')
    .bind(plugin.id, manifest.version)
    .first()
  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: `Version ${manifest.version} already exists` })
  }

  const r2Key = `plugins/${slug}/${manifest.version}.zip`
  await hubBlob().put(r2Key, file.data, { contentType: 'application/zip' })

  if (parsed.icon) {
    const ext = parsed.icon.contentType === 'image/svg+xml' ? 'svg' : 'png'
    await hubBlob().put(`plugins/${slug}/icon.${ext}`, parsed.icon.data, {
      contentType: parsed.icon.contentType
    })
  }

  try {
    await db
      .prepare(`INSERT INTO plugin_versions (plugin_id, version, manifest_json, r2_key, size)
                VALUES (?, ?, ?, ?, ?)`)
      .bind(plugin.id, manifest.version, parsed.manifestRaw, r2Key, file.data.byteLength)
      .run()

    // Refresh display metadata from the latest manifest
    await db
      .prepare("UPDATE plugins SET name = ?, summary = ?, description = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(manifest.name, manifest.description, parsed.readme || '', plugin.id)
      .run()
  } catch (error) {
    await hubBlob().del(r2Key).catch(() => {})
    throw error
  }

  setResponseStatus(event, 201)
  return { ok: true, slug, version: manifest.version }
})
