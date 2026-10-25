# WeCi Plugin Hub

The community plugin hub for [WeCi](https://github.com/openwelabs/weci) — browse, download and publish Agent plugins. This is a **community project, not the official WeCi website**.

[English](#features) · [简体中文](#功能特性)

## Features

- Browse, search and download WeCi plugins
- Self-service publishing: sign in with GitHub, upload a plugin zip, go live instantly
- Server-side validation of `manifest.json` (id, semver, `api_version`, entry module, size limits)
- Version history, download counts, permission display
- Bilingual UI (中文 / English), dark & light themes
- Serverless: runs entirely on Cloudflare Pages + D1 + R2

## Tech stack

- [Nuxt 4](https://nuxt.com) + [Nuxt UI](https://ui.nuxt.com) + [@nuxtjs/i18n](https://i18n.nuxtjs.org)
- [NuxtHub](https://hub.nuxt.com) `@nuxthub/core` 0.9 — `hubDatabase()` (D1) and `hubBlob()` (R2) server functions
- [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils): GitHub OAuth
- Nitro preset `cloudflare-pages`

## Local development

Prerequisites: Node.js ≥ 20 and pnpm 11.

```bash
pnpm install
cp .env.example .env   # fill in GitHub OAuth credentials + session password
pnpm dev
```

NuxtHub emulates D1 and R2 locally (`.data/hub`), so no Cloudflare account is needed for development.

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` / `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |
| `NUXT_SESSION_PASSWORD` | Session encryption secret (≥32 chars) |
| `NUXT_ADMIN_GITHUB_IDS` | Comma-separated GitHub user IDs with admin rights |

## Deployment (Cloudflare Pages)

1. Connect this repository to Cloudflare Pages
2. Build command: `pnpm build` — output directory: `dist`
3. Add bindings in Pages settings:
   - D1 database → binding name `DB`
   - R2 bucket → binding name `BLOB`
4. Set the environment variables listed above (Production **and** Preview). Generate the session secret with
   `openssl rand -base64 32`. Changing variables requires a redeploy.
5. Apply database migrations to the remote D1 database:

   ```bash
   npx wrangler d1 execute <database-name> --remote --file=server/database/migrations/0001_init.sql
   ```

   Without this step every API request fails with `no such table: plugins`.

## Project structure

```
app/                    # Frontend (Nuxt app directory)
  components/           # Header, footer, plugin card, switches
  pages/                # Home, plugins, detail, upload, dashboard, guide
  assets/content/       # Bilingual submission guide (markdown)
i18n/locales/           # zh.json / en.json
server/
  api/plugins/          # List, detail, upload, versions, download, icon, delist
  api/me/               # My plugins
  routes/auth/          # GitHub OAuth handler
  utils/                # Auth helper, plugin zip validation
  database/migrations/  # D1 schema migrations
shared/types/           # Session type augmentation
```

## Contributing

Issues and pull requests are welcome. One commit should do one thing; use conventional commit prefixes (`feat:`, `fix:`, `docs:` …).

## License

[MIT](LICENSE) © 2026 WeCi Plugin Hub contributors

---

# WeCi 插件中心

[WeCi](https://github.com/openwelabs/weci) 的社区插件中心 —— 浏览、下载、发布 Agent 插件。本站为**社区项目，并非 WeCi 官方网站**。

## 功能特性

- 浏览、搜索、下载 WeCi 插件
- 自助发布：GitHub 登录后上传插件 zip，即时上线
- 服务端校验 `manifest.json`（id、语义化版本、`api_version`、入口模块、体积限制）
- 版本历史、下载计数、权限展示
- 中英双语界面，明暗双主题
- 全 Serverless：Cloudflare Pages + D1 + R2

## 本地开发

环境要求：Node.js ≥ 20，pnpm 11。

```bash
pnpm install
cp .env.example .env   # 填写 GitHub OAuth 凭据与会话密钥
pnpm dev
```

NuxtHub 会在本地模拟 D1 与 R2（`.data/hub`），开发阶段无需 Cloudflare 账号。

## 部署（Cloudflare Pages）

1. 在 Cloudflare Pages 连接本仓库
2. 构建命令 `pnpm build`，输出目录 `dist`
3. 在 Pages 设置中添加绑定：D1 数据库（绑定名 `DB`）、R2 存储桶（绑定名 `BLOB`）
4. 配置上述环境变量（Production 与 Preview 都要），会话密钥可用 `openssl rand -base64 32` 生成；修改后需重新部署
5. 将迁移应用到远程 D1 数据库：

   ```bash
   npx wrangler d1 execute <数据库名> --remote --file=server/database/migrations/0001_init.sql
   ```

   缺少这一步时所有 API 都会报 `no such table: plugins`。

## 贡献

欢迎 Issue 与 PR。一个提交只做一件事，提交信息使用约定式前缀（`feat:`、`fix:`、`docs:` 等）。

## 许可证

[MIT](LICENSE) © 2026 WeCi Plugin Hub contributors
