export default defineOAuthGitHubEventHandler({
  config: {
    scope: ['read:user']
  },
  async onSuccess(event, { user: ghUser }) {
    const db = hubDatabase()
    const config = useRuntimeConfig(event)
    const adminIds = String(config.adminGithubIds || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const githubId = ghUser.id
    const login = ghUser.login || ''
    const name = ghUser.name || ''
    const avatarUrl = ghUser.avatar_url || ''

    let row = await db
      .prepare('SELECT id FROM users WHERE github_id = ?')
      .bind(githubId)
      .first<{ id: number }>()

    if (row) {
      await db
        .prepare('UPDATE users SET login = ?, name = ?, avatar_url = ? WHERE id = ?')
        .bind(login, name, avatarUrl, row.id)
        .run()
    } else {
      const res = await db
        .prepare('INSERT INTO users (github_id, login, name, avatar_url) VALUES (?, ?, ?, ?)')
        .bind(githubId, login, name, avatarUrl)
        .run()
      row = { id: Number(res.meta.last_row_id) }
    }

    await setUserSession(event, {
      user: {
        id: row.id,
        githubId,
        login,
        name,
        avatarUrl,
        admin: adminIds.includes(String(githubId))
      }
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
