export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = hubDatabase()

  const rows = await db
    .prepare(`SELECT slug, name, summary, downloads, status, created_at, updated_at
              FROM plugins
              WHERE author_user_id = ?
              ORDER BY updated_at DESC`)
    .bind(user.id)
    .all()

  return { plugins: rows.results }
})
