## What is a WeCi plugin

WeCi's Agent capabilities are entirely driven by plugins. A plugin is a directory containing at least:

- `manifest.json` — the plugin manifest (required)
- `plugin.py` — the entry module (file name set by `entry` in the manifest)

Plugins are built on the WeCi SDK (`sdk.WeCiPlugin` / `sdk.Tool`). See the
[WeCi repository](https://github.com/openwelabs/weci) docs and the `examples/plugins/hello` example.

## manifest.json fields

```json
{
  "id": "hello",
  "name": "Hello Plugin",
  "version": "0.1.0",
  "description": "Example plugin",
  "author": "Your Name",
  "api_version": "0.1",
  "entry": "plugin.py",
  "permissions": [],
  "default_enabled": true
}
```

| Field | Requirement |
| --- | --- |
| `id` | Globally unique; lowercase letter first, 2–64 chars, `a-z0-9_-` only |
| `version` | Semantic version, e.g. `0.1.0` |
| `description` | One-line summary shown on cards |
| `api_version` | Currently fixed to `0.1` |
| `entry` | Entry module relative path; must exist inside the zip |
| `permissions` | Declared capabilities, e.g. `network:access`, `workspace:read` |

## Optional files

- `README.md` — rendered on the detail page (≤64KB)
- `icon.png` / `icon.svg` — plugin icon (≤256KB)

## Packaging

Zip the plugin directory (the directory name does not matter; the hub uses `manifest.id`):

```bash
zip -r hello.zip hello/
```

The zip must be ≤5MB with no more than 200 files.

## Publishing

1. Sign in with your GitHub account
2. Open "Publish", upload the zip, optionally set license, repository and keywords
3. The plugin goes live immediately after server-side validation; ids are first-come-first-served
4. Manage versions or delist anytime from "My plugins"

## Installation for users

```bash
unzip hello.zip
weci plugin install ./hello
```

Restart WeCi and the plugin tools appear in the Agent automatically.

## Community rules

- Only publish plugins you have the right to distribute
- Permission declarations must be honest: declare `network:access` if you call the network
- No malicious code, credential theft, or obfuscated code
- An open-source license is recommended
- Violating plugins will be delisted by admins
