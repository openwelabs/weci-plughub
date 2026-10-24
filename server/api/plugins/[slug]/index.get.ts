export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = hubDatabase()

  const plugin = await db
    .prepare(`SELECT p.slug, p.name, p.summary, p.description, p.license, p.repository,
                     p.keywords, p.downloads, p.created_at, p.updated_at,
                     u.login AS author_login, u.avatar_url AS author_avatar
              FROM plugins p
              JOIN users u ON u.id = p.author_user_id
              WHERE p.slug = ? AND p.status = 'active'`)
    .bind(slug)
    .first<Record<string, unknown>>()

  if (!plugin) {
    throw createError({ statusCode: 404, statusMessage: 'Plugin not found' })
  }

  const versions = await db
    .prepare(`SELECT version, size, downloads, created_at, manifest_json
              FROM plugin_versions
              WHERE plugin_id = (SELECT id FROM plugins WHERE slug = ?)
              ORDER BY created_at DESC`)
    .bind(slug)
    .all<{ version: string, size: number, downloads: number, created_at: string, manifest_json: string }>()

  const rows = versions.results.map(v => ({
    version: v.version,
    size: v.size,
    downloads: v.downloads,
    createdAt: v.created_at
  }))

  // Permissions of the latest version, shown on the detail page
  let permissions: string[] = []
  try {
    permissions = JSON.parse(versions.results[0]?.manifest_json || '{}').permissions || []
  } catch {
    permissions = []
  }

  let keywords: string[] = []
  try {
    keywords = JSON.parse(String(plugin.keywords || '[]'))
  } catch {
    keywords = []
  }

  return {
    plugin: {
      slug: plugin.slug,
      name: plugin.name,
      summary: plugin.summary,
      description: plugin.description,
      license: plugin.license,
      repository: plugin.repository,
      keywords,
      downloads: plugin.downloads,
      createdAt: plugin.created_at,
      updatedAt: plugin.updated_at,
      authorLogin: plugin.author_login,
      authorAvatar: plugin.author_avatar,
      permissions
    },
    versions: rows
  }
})
