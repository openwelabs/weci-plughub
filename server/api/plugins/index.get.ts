interface PluginListRow {
  slug: string
  name: string
  summary: string
  downloads: number
  created_at: string
  author_login: string
  author_avatar: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim().slice(0, 80)
  const sort = query.sort === 'downloads' ? 'downloads' : 'newest'
  const page = Math.max(1, Number.parseInt(String(query.page)) || 1)
  const pageSize = 24
  const offset = (page - 1) * pageSize

  let where = "p.status = 'active'"
  const binds: unknown[] = []
  if (q) {
    where += ' AND (p.name LIKE ? OR p.summary LIKE ? OR p.keywords LIKE ?)'
    const like = `%${q}%`
    binds.push(like, like, like)
  }
  const orderBy = sort === 'downloads' ? 'p.downloads DESC, p.created_at DESC' : 'p.created_at DESC'

  const db = hubDatabase()
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM plugins p WHERE ${where}`)
    .bind(...binds)
    .first<{ total: number }>()

  const rows = await db
    .prepare(`SELECT p.slug, p.name, p.summary, p.downloads, p.created_at,
                     u.login AS author_login, u.avatar_url AS author_avatar
              FROM plugins p
              JOIN users u ON u.id = p.author_user_id
              WHERE ${where}
              ORDER BY ${orderBy}
              LIMIT ? OFFSET ?`)
    .bind(...binds, pageSize, offset)
    .all<PluginListRow>()

  return {
    plugins: rows.results,
    total: Number(countRow?.total || 0),
    page,
    pageSize
  }
})
