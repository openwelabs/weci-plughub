export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "file" field (zip archive)' })
  }

  const parsed = parsePluginArchive(new Uint8Array(file.data))
  const { manifest } = parsed
  const db = hubDatabase()

  const taken = await db
    .prepare('SELECT id FROM plugins WHERE slug = ?')
    .bind(manifest.id)
    .first()
  if (taken) {
    throw createError({ statusCode: 409, statusMessage: `Plugin id "${manifest.id}" is already taken` })
  }

  const field = (name: string) => form?.find(p => partName(part) === name)?.data.toString('utf8').trim() || ''
  const license = field('license').slice(0, 100)
  const repository = field('repository').slice(0, 300)
  const keywords = field('keywords')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
    .slice(0, 10)

  const r2Key = `plugins/${manifest.id}/${manifest.version}.zip`
  await hubBlob().put(r2Key, file.data, { contentType: 'application/zip' })

  if (parsed.icon) {
    const ext = parsed.icon.contentType === 'image/svg+xml' ? 'svg' : 'png'
    await hubBlob().put(`plugins/${manifest.id}/icon.${ext}`, parsed.icon.data, {
      contentType: parsed.icon.contentType
    })
  }

  try {
    const res = await db
      .prepare(`INSERT INTO plugins (slug, name, summary, description, author_user_id, license, repository, keywords)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        manifest.id,
        manifest.name,
        manifest.description,
        parsed.readme || '',
        user.id,
        license,
        repository,
        JSON.stringify(keywords)
      )
      .run()
    const pluginId = Number(res.meta.last_row_id)

    await db
      .prepare(`INSERT INTO plugin_versions (plugin_id, version, manifest_json, r2_key, size)
                VALUES (?, ?, ?, ?, ?)`)
      .bind(pluginId, manifest.version, parsed.manifestRaw, r2Key, file.data.byteLength)
      .run()
  } catch (error) {
    // Roll back orphaned blobs so a failed publish leaves no residue
    await hubBlob().del(r2Key).catch(() => {})
    throw error
  }

  setResponseStatus(event, 201)
  return { ok: true, slug: manifest.id, version: manifest.version }
})

function partName(part: { name?: string }) {
  return part.name || ''
}
