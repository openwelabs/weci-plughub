import { strFromU8, unzipSync } from 'fflate'
import { z } from 'zod'

export const PLUGIN_MAX_ZIP_BYTES = 5 * 1024 * 1024
export const PLUGIN_MAX_FILES = 200
export const PLUGIN_MAX_FILE_BYTES = 10 * 1024 * 1024
export const PLUGIN_MAX_TOTAL_BYTES = 20 * 1024 * 1024
export const PLUGIN_README_MAX_BYTES = 64 * 1024
export const PLUGIN_ICON_MAX_BYTES = 256 * 1024

const manifestSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]{1,63}$/, 'id must match ^[a-z][a-z0-9_-]{1,63}$'),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/, 'version must be semver (e.g. 0.1.0)'),
  description: z.string().min(1).max(500),
  author: z.string().min(1).max(100),
  api_version: z.literal('0.1'),
  entry: z.string().min(1).max(200),
  permissions: z.array(z.string().max(64)).max(32).default([]),
  default_enabled: z.boolean().default(true)
})

export type PluginManifest = z.infer<typeof manifestSchema>

export interface ParsedPluginArchive {
  manifest: PluginManifest
  manifestRaw: string
  readme: string | null
  icon: { data: Uint8Array, contentType: string } | null
}

function fail(message: string): never {
  throw createError({ statusCode: 422, statusMessage: message })
}

/**
 * Unzip and validate a WeCi plugin archive.
 * Returns the parsed manifest plus optional README and icon extracted from the zip.
 */
export function parsePluginArchive(zipBytes: Uint8Array): ParsedPluginArchive {
  if (zipBytes.byteLength > PLUGIN_MAX_ZIP_BYTES) {
    fail(`Archive exceeds the ${PLUGIN_MAX_ZIP_BYTES / 1024 / 1024} MB size limit`)
  }

  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(zipBytes)
  } catch {
    fail('Invalid zip archive')
  }

  // Normalize paths (strip leading ./)
  const names = Object.keys(files)
  const normalized: Record<string, Uint8Array> = {}
  for (const name of names) {
    const clean = name.replace(/^\.\//, '')
    if (clean) normalized[clean] = files[name]!
  }

  const entries = Object.entries(normalized).filter(([path]) => !path.endsWith('/'))
  if (entries.length > PLUGIN_MAX_FILES) {
    fail(`Archive contains more than ${PLUGIN_MAX_FILES} files`)
  }

  let total = 0
  for (const [path, data] of entries) {
    if (data.byteLength > PLUGIN_MAX_FILE_BYTES) {
      fail(`File ${path} exceeds the 10 MB per-file limit`)
    }
    total += data.byteLength
  }
  if (total > PLUGIN_MAX_TOTAL_BYTES) {
    fail('Archive expands beyond the 20 MB total size limit')
  }

  // Locate manifest.json: at zip root or inside exactly one top-level directory
  let prefix = ''
  if (normalized['manifest.json']) {
    prefix = ''
  } else {
    const candidates = Object.keys(normalized).filter(path => /^[^/]+\/manifest\.json$/.test(path))
    if (candidates.length === 0) fail('manifest.json not found in archive')
    if (candidates.length > 1) fail('Multiple manifest.json files found in archive')
    prefix = candidates[0]!.slice(0, -'manifest.json'.length)
  }

  let manifestRaw: string
  try {
    manifestRaw = strFromU8(normalized[`${prefix}manifest.json`]!)
  } catch {
    fail('manifest.json is not valid UTF-8')
  }

  let manifestJson: unknown
  try {
    manifestJson = JSON.parse(manifestRaw!)
  } catch {
    fail('manifest.json is not valid JSON')
  }

  const parsed = manifestSchema.safeParse(manifestJson)
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    fail(`Invalid manifest.json — ${issues}`)
  }
  const manifest = parsed.data

  if (!normalized[`${prefix}${manifest.entry}`]) {
    fail(`Entry module "${manifest.entry}" not found in archive`)
  }

  // Optional README for the detail page
  let readme: string | null = null
  for (const candidate of ['README.md', 'README.zh-CN.md', 'readme.md']) {
    const data = normalized[`${prefix}${candidate}`]
    if (data) {
      if (data.byteLength > PLUGIN_README_MAX_BYTES) fail(`${candidate} exceeds 64 KB`)
      readme = strFromU8(data)
      break
    }
  }

  // Optional icon
  let icon: ParsedPluginArchive['icon'] = null
  for (const [candidate, contentType] of [['icon.png', 'image/png'], ['icon.svg', 'image/svg+xml']] as const) {
    const data = normalized[`${prefix}${candidate}`]
    if (data) {
      if (data.byteLength > PLUGIN_ICON_MAX_BYTES) fail(`${candidate} exceeds 256 KB`)
      icon = { data, contentType }
      break
    }
  }

  return { manifest, manifestRaw: manifestRaw!, readme, icon }
}
