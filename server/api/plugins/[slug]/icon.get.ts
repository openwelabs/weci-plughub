export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  for (const ext of ['svg', 'png'] as const) {
    const blob = await hubBlob().get(`plugins/${slug}/icon.${ext}`)
    if (blob) {
      setHeader(event, 'content-type', ext === 'svg' ? 'image/svg+xml' : 'image/png')
      setHeader(event, 'cache-control', 'public, max-age=3600')
      return blob
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'No icon' })
})
