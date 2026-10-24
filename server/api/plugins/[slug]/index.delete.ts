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
    throw createError({ statusCode: 403, statusMessage: 'Only the plugin author or an admin can delist it' })
  }

  await db
    .prepare("UPDATE plugins SET status = 'delisted', updated_at = datetime('now') WHERE id = ?")
    .bind(plugin.id)
    .run()

  return { ok: true }
})
